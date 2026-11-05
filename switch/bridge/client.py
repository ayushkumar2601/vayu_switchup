from __future__ import annotations
"""Switch Agent Protocol async client for VAYU OS."""

import asyncio
import json
import logging
import os
import time
from typing import Any, AsyncGenerator, Callable, Coroutine, Dict, List, Optional

import httpx
try:
    from httpx_sse import aconnect_sse
    HAS_HTTPX_SSE = True
except ImportError:
    HAS_HTTPX_SSE = False

from switch.bridge.schemas import AgentBeat, OutboundMessage, SwitchEvent, SwitchMessage, SwitchSender

logger = logging.getLogger("vayu.switch.client")


class SwitchBridgeClient:
    """Manages bidirectional communication with the Switch Agent Bridge.
    
    Inbound: Receives Server-Sent Events (SSE) from Switch room streams.
    Outbound: Dispatches message responses and heartbeats via HTTP POST.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        auth_token: Optional[str] = None,
        mock_mode: bool = False,
    ) -> None:
        self.base_url = (base_url or os.getenv("SWITCH_BRIDGE_URL", "http://localhost:8080")).rstrip("/")
        self.auth_token = auth_token or os.getenv("SWITCH_AUTH_TOKEN")
        self.mock_mode = mock_mode or os.getenv("SWITCH_MOCK_MODE", "false").lower() in ("1", "true")
        self._mock_outbox: List[OutboundMessage] = []
        self._mock_inbox_queue: asyncio.Queue[SwitchEvent] = asyncio.Queue()
        self._running = False
        self._headers = {"Content-Type": "application/json"}
        if self.auth_token:
            self._headers["Authorization"] = f"Bearer {self.auth_token}"

    @property
    def outbox(self) -> List[OutboundMessage]:
        """Inspection access for sent messages (useful for unit tests and local simulation)."""
        return self._mock_outbox

    async def post_message(self, message: OutboundMessage) -> bool:
        """Post a message back to a Switch room via HTTP POST."""
        logger.info(
            f"[{message.sender_agent_id} -> room:{message.room_id}] Posting response ({len(message.content)} chars)"
        )
        self._mock_outbox.append(message)

        if self.mock_mode:
            return True

        url = f"{self.base_url}/rooms/{message.room_id}/messages"
        payload = {
            "sender_agent_id": message.sender_agent_id,
            "content": message.content,
            "metadata": message.metadata,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload, headers=self._headers)
                if resp.status_code in (200, 201, 202):
                    return True
                logger.error(f"Switch POST message failed with HTTP {resp.status_code}: {resp.text}")
                return False
        except Exception as exc:
            logger.warning(f"Failed to post message to Switch at {url}: {exc} (Recorded in local outbox)")
            return False

    async def send_beat(self, beat: AgentBeat) -> bool:
        """Report liveness and processing cursor to Switch via POST /connection/beat."""
        if self.mock_mode:
            return True

        url = f"{self.base_url}/connection/beat"
        payload = beat.model_dump()
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(url, json=payload, headers=self._headers)
                return resp.status_code in (200, 204)
        except Exception as exc:
            logger.debug(f"Beat check failed to {url}: {exc}")
            return False

    async def simulate_inbound_event(self, event: SwitchEvent) -> None:
        """Simulate an inbound event into the mock inbox (used for testing and local demos)."""
        await self._mock_inbox_queue.put(event)

    async def simulate_user_message(
        self,
        content: str,
        room_id: str = "security-incidents",
        user_name: str = "Ayush",
        user_id: str = "usr_lead",
        mentions: Optional[List[str]] = None,
    ) -> SwitchEvent:
        """Helper to create and inject a human message event."""
        sender = SwitchSender(id=user_id, name=user_name, type="human", role="lead")
        msg = SwitchMessage(
            id=f"msg_{int(time.time()*1000)}",
            room_id=room_id,
            sender=sender,
            content=content,
            mentions=mentions or [],
            timestamp=time.time(),
        )
        event = SwitchEvent(
            event_id=f"evt_{int(time.time()*1000)}",
            event_type="message.created",
            room_id=room_id,
            data=msg.model_dump(),
            timestamp=time.time(),
        )
        await self.simulate_inbound_event(event)
        return event

    async def listen_events(
        self,
        room_id: str,
        handler: Callable[[SwitchEvent], Coroutine[Any, Any, None]],
    ) -> None:
        """Listen to incoming Switch SSE events and dispatch to handler."""
        self._running = True

        if self.mock_mode:
            logger.info(f"Switch client running in MOCK mode for room '{room_id}'")
            while self._running:
                try:
                    event = await asyncio.wait_for(self._mock_inbox_queue.get(), timeout=0.5)
                    await handler(event)
                except asyncio.TimeoutError:
                    continue
                except asyncio.CancelledError:
                    break
            return

        # Real SSE connection to Switch bridge
        url = f"{self.base_url}/rooms/{room_id}/events"
        logger.info(f"Connecting to Switch SSE stream at {url}")

        retry_interval = 1.0
        while self._running:
            try:
                if HAS_HTTPX_SSE:
                    async with httpx.AsyncClient(timeout=None) as client:
                        async with aconnect_sse(client, "GET", url, headers=self._headers) as event_source:
                            retry_interval = 1.0  # Reset on successful connection
                            async for sse in event_source.aiter_sse():
                                if not self._running:
                                    break
                                try:
                                    raw_data = json.loads(sse.data) if sse.data else {}
                                    event = SwitchEvent(
                                        event_id=sse.id or f"evt_{int(time.time()*1000)}",
                                        event_type=sse.event or "message.created",
                                        room_id=room_id,
                                        data=raw_data,
                                    )
                                    await handler(event)
                                except Exception as parse_err:
                                    logger.error(f"Error handling SSE payload: {parse_err}")
                else:
                    logger.warning("httpx_sse not found, falling back to mock event loop.")
                    self.mock_mode = True
                    break
            except Exception as exc:
                if not self._running:
                    break
                logger.warning(f"Switch SSE disconnected ({exc}). Reconnecting in {retry_interval}s...")
                await asyncio.sleep(retry_interval)
                retry_interval = min(retry_interval * 2, 10.0)

    def stop(self) -> None:
        """Stop event listening loop."""
        self._running = False

