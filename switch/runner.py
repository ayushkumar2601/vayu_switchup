from __future__ import annotations
"""Switch Bridge Runner and Multi-Agent Orchestrator for VAYU OS."""

import asyncio
import logging
import os
import sys
from typing import Optional

from switch.agents.analyst_handler import handle_analyst_task
from switch.agents.gatekeeper_handler import handle_gatekeeper_approval, handle_gatekeeper_rejection
from switch.agents.remediator_handler import handle_remediator_task
from switch.bridge.client import SwitchBridgeClient
from switch.bridge.dispatcher import MessageDispatcher
from switch.bridge.schemas import OutboundMessage, SwitchEvent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [vayu-switch] %(message)s",
)
logger = logging.getLogger("vayu.switch.runner")


class VayuSwitchService:
    """Coordinates Switch event streaming, agent handoffs, and command dispatching."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        auth_token: Optional[str] = None,
        mock_mode: bool = False,
        default_room: str = "security-incidents",
    ) -> None:
        self.client = SwitchBridgeClient(base_url=base_url, auth_token=auth_token, mock_mode=mock_mode)
        self.dispatcher = MessageDispatcher()
        self.default_room = default_room
        self._setup_routes()

    def _setup_routes(self) -> None:
        """Register command and agent handlers."""
        # Slash Commands
        self.dispatcher.register_command("/vayu scan", handle_analyst_task)
        self.dispatcher.register_command("/vayu investigate", handle_analyst_task)
        self.dispatcher.register_command("/vayu fix", handle_remediator_task)
        self.dispatcher.register_command("/vayu approve", handle_gatekeeper_approval)
        self.dispatcher.register_command("/vayu reject", handle_gatekeeper_rejection)
        self.dispatcher.register_command("/approve", handle_gatekeeper_approval)
        self.dispatcher.register_command("/reject", handle_gatekeeper_rejection)

        # Named Agent Mentions
        self.dispatcher.register_agent("vayu-analyst", handle_analyst_task)
        self.dispatcher.register_agent("vayu-remediator", handle_remediator_task)
        self.dispatcher.register_agent("vayu-gatekeeper", handle_gatekeeper_approval)

    async def on_event(self, event: SwitchEvent) -> None:
        """Process an inbound event, post the agent's response, and manage autonomous handoffs."""
        response = await self.dispatcher.handle_event(event)
        if response:
            await self.client.post_message(response)

            # Autonomous Multi-Agent Handoff: If Analyst flagged a vulnerability and requested remediation
            if (
                response.sender_agent_id == "vayu-analyst"
                and response.metadata.get("status") == "handoff_to_remediator"
            ):
                logger.info("Autonomous Handoff: VAYU-Analyst -> VAYU-Remediator")
                # Create synthetic handoff task for remediator in the same room
                remediator_response = await handle_remediator_task(
                    type("HandoffMsg", (), {
                        "content": f"Fix vulnerability for {response.metadata.get('issue_id')}",
                        "raw_content": f"Fix vulnerability for {response.metadata.get('issue_id')}",
                        "room_id": response.room_id,
                        "sender": type("Sender", (), {"name": "vayu-analyst", "type": "agent", "role": "analyst"})(),
                    })()
                )
                if remediator_response:
                    await self.client.post_message(remediator_response)

    async def run(self, room_id: Optional[str] = None) -> None:
        """Run the service event loop."""
        target_room = room_id or self.default_room
        logger.info(f"Starting VAYU OS Switch Service for room: '{target_room}'")
        await self.client.listen_events(target_room, self.on_event)


async def main() -> None:
    room = os.getenv("SWITCH_ROOM_ID", "security-incidents")
    mock = os.getenv("SWITCH_MOCK_MODE", "true").lower() in ("1", "true")
    service = VayuSwitchService(mock_mode=mock, default_room=room)
    await service.run()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("VAYU Switch Service stopped.")

