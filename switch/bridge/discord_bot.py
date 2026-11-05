from __future__ import annotations
"""Discord Bot Gateway Adapter for VAYU OS and Switch.

Connects directly to Discord Gateway, listens to team messages in #security-incidents,
dispatches to VAYU agents, manages autonomous remediation handoffs, and posts responses.
"""

import asyncio
import logging
import os
import sys
from typing import Optional

try:
    import discord
except ImportError:
    discord = None

from switch.agents.analyst_handler import handle_analyst_task
from switch.agents.gatekeeper_handler import handle_gatekeeper_approval, handle_gatekeeper_rejection
from switch.agents.remediator_handler import handle_remediator_task
from switch.bridge.dispatcher import MessageDispatcher
from switch.bridge.schemas import OutboundMessage, SwitchEvent, SwitchMessage, SwitchSender

logger = logging.getLogger("vayu.switch.discord")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [vayu-discord] %(message)s",
)


class VayuDiscordBot:
    """Discord Bot Bridge for VAYU OS."""

    def __init__(self, token: Optional[str] = None, channel_filter: Optional[str] = None) -> None:
        if discord is None:
            raise RuntimeError("discord.py is not installed. Please run: pip install discord.py")

        self.token = token or os.getenv("DISCORD_BOT_TOKEN")
        self.channel_filter = channel_filter or os.getenv("DISCORD_CHANNEL_NAME", "security-incidents")
        self.dispatcher = MessageDispatcher()
        self._setup_routes()

        intents = discord.Intents.default()
        intents.message_content = True
        intents.guilds = True
        intents.messages = True

        self.client = discord.Client(intents=intents)
        self._bind_client_events()

    def _setup_routes(self) -> None:
        """Register command and agent handlers."""
        async def handle_help(payload) -> OutboundMessage:
            return OutboundMessage(
                room_id=payload.room_id,
                sender_agent_id="vayu-orchestrator",
                content=(
                    "👋 **VAYU OS — Autonomous SecOps Squad on Switch**\n\n"
                    "**Available Multi-Agent Commands:**\n"
                    "• `/vayu scan <path>` or `@vayu-analyst investigate <path>` — Static analysis & AST taint graph audit\n"
                    "• `/vayu fix <issue_id>` — Patch synthesis with local Ollama & 4-Gate Sandbox verification\n"
                    "• `/approve <issue_id>` — Incident commander sign-off to verify invariants and create GitHub PR\n"
                    "• `/reject <issue_id>` — Discard patch and wipe ephemeral sandbox\n\n"
                    "📊 **Real-time Operations Kanban:** `http://localhost:3000/issues`"
                ),
            )

        self.dispatcher.register_command("/help", handle_help)
        self.dispatcher.register_command("/vayu", handle_help)
        self.dispatcher.register_command("/vayu scan", handle_analyst_task)
        self.dispatcher.register_command("/vayu investigate", handle_analyst_task)
        self.dispatcher.register_command("/vayu fix", handle_remediator_task)
        self.dispatcher.register_command("/vayu approve", handle_gatekeeper_approval)
        self.dispatcher.register_command("/vayu reject", handle_gatekeeper_rejection)
        self.dispatcher.register_command("/approve", handle_gatekeeper_approval)
        self.dispatcher.register_command("/reject", handle_gatekeeper_rejection)

        self.dispatcher.register_agent("vayu-analyst", handle_analyst_task)
        self.dispatcher.register_agent("vayu-remediator", handle_remediator_task)
        self.dispatcher.register_agent("vayu-gatekeeper", handle_gatekeeper_approval)

    def _bind_client_events(self) -> None:
        @self.client.event
        async def on_ready() -> None:
            logger.info(f"VAYU Discord Bot online as: {self.client.user} (ID: {self.client.user.id})")
            logger.info(f"Target incident channel filter: '{self.channel_filter}'")

        @self.client.event
        async def on_message(message: discord.Message) -> None:
            if message.author.bot or message.author == self.client.user:
                return

            channel_name = getattr(message.channel, "name", "")
            bot_mentioned = self.client.user in message.mentions if self.client.user else False
            content = message.content.strip()

            # Clean bot mention from content if present
            if bot_mentioned and self.client.user:
                content = content.replace(f"<@{self.client.user.id}>", "@vayu").replace(f"<@!{self.client.user.id}>", "@vayu").strip()

            is_command = content.startswith("/")
            allowed_channels = {self.channel_filter, "security-incidents", "general"}
            if not bot_mentioned and not is_command and channel_name not in allowed_channels:
                return

            # If user just sent a bare mention to the bot
            if bot_mentioned and (not content or content in ("@vayu", "@security-incidents")):
                await message.channel.send(
                    "👋 **VAYU OS Autonomous SecOps Team is Online!**\n"
                    "Try: `@security-incidents investigate samples/vulnerable/command_injection`\n"
                    "Or: `/vayu scan samples/vulnerable/command_injection` | `/help`"
                )
                return

            logger.info(f"Received message from {message.author.name} in #{channel_name}: {content}")

            try:
                # Build SwitchEvent representation with required event_id and room_id
                room_identifier = channel_name or str(message.channel.id)
                sender = SwitchSender(
                    id=str(message.author.id),
                    name=message.author.display_name or message.author.name,
                    type="human",
                    role="security_engineer",
                )
                event = SwitchEvent(
                    event_id=f"evt_{message.id}",
                    event_type="message.created",
                    room_id=room_identifier,
                    data={
                        "id": str(message.id),
                        "room_id": room_identifier,
                        "content": content,
                        "sender": sender.model_dump(),
                        "mentions": [str(u.name) for u in message.mentions] if message.mentions else [],
                    },
                )

                # Show typing indicator while agents reason & verify
                async with message.channel.typing():
                    response = await self.dispatcher.handle_event(event)
                    if response:
                        await self._send_response(message.channel, response)

                        # Autonomous Handoff: Analyst -> Remediator
                        if (
                            response.sender_agent_id == "vayu-analyst"
                            and response.metadata.get("status") == "handoff_to_remediator"
                        ):
                            handoff_notice = (
                                f"⚡ **[VAYU-Orchestrator]** Autonomous handoff initiated: "
                                f"Task assigned to **@vayu-remediator** for `{response.metadata.get('issue_id')}`..."
                            )
                            await message.channel.send(handoff_notice)

                            handoff_msg = SwitchMessage(
                                id=f"handoff_{response.metadata.get('issue_id')}",
                                room_id=room_identifier,
                                sender=SwitchSender(name="vayu-analyst", id="vayu-analyst", type="agent", role="analyst"),
                                content=f"Fix vulnerability for {response.metadata.get('issue_id')}",
                            )
                            remediator_response = await handle_remediator_task(handoff_msg)
                            if remediator_response:
                                await self._send_response(message.channel, remediator_response)
            except Exception as err:
                logger.exception(f"Error handling message: {err}")
                await message.channel.send(f"⚠️ **[VAYU-Orchestrator Error]:** {err}")

    async def _send_response(self, channel: Any, response: OutboundMessage) -> None:
        """Send message safely within Discord's 2000-character limit."""
        prefix = f"🛡️ **[{response.sender_agent_id.upper()}]**\n"
        full_text = prefix + response.content

        # Clamp into safe chunks <= 1900 chars preserving line breaks
        limit = 1900
        text = full_text
        chunks = []
        while len(text) > limit:
            split_idx = text.rfind("\n", 0, limit)
            if split_idx == -1:
                split_idx = limit
            chunks.append(text[:split_idx])
            text = text[split_idx:].lstrip("\n")
        if text:
            chunks.append(text)

        for chunk in chunks:
            await channel.send(chunk)

    def run(self) -> None:
        if not self.token:
            raise ValueError(
                "DISCORD_BOT_TOKEN is not set. Please set it in your environment or pass it to VayuDiscordBot."
            )
        self.client.run(self.token)


if __name__ == "__main__":
    bot = VayuDiscordBot()
    bot.run()

