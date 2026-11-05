from __future__ import annotations
"""Discord Bot Gateway Adapter for VAYU OS and Switch.

Connects directly to Discord Gateway, listens to team messages in #security-incidents,
dispatches to VAYU agents, manages autonomous remediation handoffs, and posts responses.
"""

import asyncio
import logging
import os
import re
import sys
from typing import Any, Optional

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

    @staticmethod
    def parse_natural_intent(raw_text: str) -> Optional[str]:
        """Convert natural conversational speech/text into standard VAYU actions."""
        t = raw_text.lower()

        # Extract explicit issue ID if mentioned
        issue_match = re.search(r"\b(VAYU-[A-Za-z0-9_-]+)\b", raw_text, re.IGNORECASE)
        issue_id = issue_match.group(1).upper() if issue_match else ""

        # Extract explicit path if mentioned
        path_match = re.search(r"\b(samples/[A-Za-z0-9_\-\./]+)\b", raw_text)
        target_path = path_match.group(1) if path_match else "samples/vulnerable/command_injection"

        # Rejection Intents
        if any(k in t for k in ["reject", "declined", "don't merge", "discard", "needs test"]):
            return f"/reject {issue_id}".strip()

        # Approval Intents
        if any(k in t for k in ["approve", "approved", "looks good", "ship it", "go ahead", "merge the fix", "authorize"]):
            return f"/approve {issue_id}".strip()

        # Investigation / Scan Intents
        scan_triggers = [
            "check the code",
            "check for vulnerabilities",
            "check for any vulnerabilities",
            "find vulnerabilities",
            "any vulnerabilities",
            "security issues",
            "vulnerabilities",
            "investigate",
            "scan",
            "audit",
            "inspect",
            "examine",
        ]
        if any(k in t for k in scan_triggers):
            return f"/vayu scan {target_path}".strip()

        # Fix / Remediation Intents
        if any(k in t for k in ["fix", "patch", "remediate", "generate a fix"]):
            return f"/vayu fix {issue_id or target_path}".strip()

        if any(k in t for k in ["help", "status", "who are you"]):
            return "/help"

        return None

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
            raw_content = message.content.strip()

            # Check if bot was mentioned by User, Role, or Text
            bot_member = message.guild.get_member(self.client.user.id) if (message.guild and self.client.user) else None
            bot_role_ids = {str(r.id) for r in bot_member.roles} if bot_member else set()
            user_mentioned = (self.client.user in message.mentions) if self.client.user else False
            role_mentioned = any(str(r.id) in bot_role_ids for r in message.role_mentions) or any(f"<@&{r.id}>" in raw_content for r in (bot_member.roles if bot_member else []))
            text_mentioned = bool(re.search(r"@?(security-incidents|vayu|vayu-analyst|vayu-remediator|vayu-gatekeeper)\b", raw_content, re.IGNORECASE))

            bot_mentioned = user_mentioned or role_mentioned or text_mentioned or bool(re.search(r"<@&\d+>", raw_content))

            # Normalize mentions in content
            content = raw_content
            if self.client.user:
                content = re.sub(rf"<@!?{self.client.user.id}>", "@vayu", content)
            for r_id in bot_role_ids:
                content = re.sub(rf"<@&{r_id}>", "@vayu", content)
            if bot_mentioned:
                content = re.sub(r"<@&\d+>", "@vayu", content)
            content = re.sub(r"@security-incidents\b", "@vayu", content, flags=re.IGNORECASE)
            content = content.strip()

            # Natural Language Intent Classification (for Wispr Flow voice dictation)
            natural_command = self.parse_natural_intent(raw_content)
            if natural_command:
                content = natural_command
            else:
                # Fallback: normalize common action verbs into standard slash commands
                clean_words = content.replace("@vayu", "").strip().split()
                first_word = clean_words[0].lower() if clean_words else ""
                remaining = " ".join(clean_words[1:]) if len(clean_words) > 1 else ""

                if first_word in ("investigate", "scan", "audit"):
                    content = f"/vayu scan {remaining or 'samples/vulnerable/command_injection'}".strip()
                elif first_word in ("fix", "patch", "remediate"):
                    content = f"/vayu fix {remaining}".strip()
                elif first_word in ("approve", "/approve"):
                    content = f"/approve {remaining}".strip()
                elif first_word in ("reject", "/reject"):
                    content = f"/reject {remaining}".strip()
                elif first_word in ("help", "status", "info"):
                    content = "/help"

            # Check channel permissions: allow designated incident channel, general, commands, or direct mentions
            is_command = content.startswith("/")
            allowed_channels = {self.channel_filter, "security-incidents", "general"}
            if not bot_mentioned and not is_command and channel_name not in allowed_channels:
                return

            if bot_mentioned and (not content or content in ("@vayu", "@security-incidents")):
                await message.channel.send(
                    "👋 **VAYU OS Autonomous SecOps Team is Online!**\n\n"
                    "**Quick Commands:**\n"
                    "• `@security-incidents investigate samples/vulnerable/command_injection`\n"
                    "• `/vayu scan samples/vulnerable/command_injection`\n"
                    "• `/approve <issue_id>` | `/reject <issue_id>`"
                )
                return

            logger.info(f"Processed message from {message.author.name} in #{channel_name}: '{raw_content}' -> '{content}'")

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
                            # Keep typing indicator alive during remediation & 4-gate verification
                            async with message.channel.typing():
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

