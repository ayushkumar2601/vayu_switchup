from __future__ import annotations
"""Unit and Integration Tests for VAYU OS Switch Multi-Agent Squad."""

import asyncio
import os
import tempfile
import pytest

from vayu_platform.state import StateStore
from switch.agents.analyst_handler import handle_analyst_task
from switch.agents.gatekeeper_handler import handle_gatekeeper_approval, handle_gatekeeper_rejection
from switch.agents.remediator_handler import handle_remediator_task
from switch.bridge.client import SwitchBridgeClient
from switch.bridge.dispatcher import MessageDispatcher
from switch.bridge.schemas import CommandPayload, OutboundMessage, SwitchEvent, SwitchMessage, SwitchSender
from switch.runner import VayuSwitchService


@pytest.fixture
def temp_db(tmp_path):
    """Provide isolated SQLite state store for each test."""
    db_file = tmp_path / "test_vayu.db"
    return StateStore(db_path=str(db_file))


def test_state_store_lifecycle(temp_db):
    """Verify issue creation, status transition, and 4-gate verification logging."""
    issue = temp_db.create_issue(
        title="Test Command Injection",
        cwe="CWE-78",
        severity="CRITICAL",
        target_file="app.py",
        line_number=261,
    )
    assert issue.id.startswith("VAYU-")
    assert issue.status == "BACKLOG"

    # Transition to INVESTIGATING
    updated = temp_db.update_issue_status(issue.id, "INVESTIGATING")
    assert updated.status == "INVESTIGATING"

    # Record 4-Gate Verification
    vr = temp_db.record_verification(
        issue_id=issue.id,
        gate1_syntax=True,
        gate2_tests=True,
        gate3_exploit=True,
        gate4_rescan=True,
        approved=True,
        slsa_attestation={"predicate": "slsa-test"},
    )
    assert vr.approved is True

    fetched_vr = temp_db.get_verification(issue.id)
    assert fetched_vr is not None
    assert fetched_vr.gate1_syntax is True
    assert fetched_vr.gate4_rescan is True
    assert fetched_vr.approved is True


@pytest.mark.asyncio
async def test_switch_bridge_client_mock():
    """Verify SwitchBridgeClient outbox and message simulation."""
    client = SwitchBridgeClient(mock_mode=True)
    msg = OutboundMessage(
        room_id="secops",
        sender_agent_id="vayu-analyst",
        content="Test finding",
    )
    success = await client.post_message(msg)
    assert success is True
    assert len(client.outbox) == 1
    assert client.outbox[0].content == "Test finding"


@pytest.mark.asyncio
async def test_message_dispatcher_routing():
    """Verify slash command and agent mention routing."""
    dispatcher = MessageDispatcher()
    called = {}

    async def dummy_scan(cmd: CommandPayload):
        called["scan"] = cmd.args
        return OutboundMessage(room_id="secops", sender_agent_id="vayu-analyst", content="Scanned")

    async def dummy_analyst(msg: SwitchMessage):
        called["analyst"] = msg.content
        return OutboundMessage(room_id="secops", sender_agent_id="vayu-analyst", content="Analyst here")

    dispatcher.register_command("/vayu scan", dummy_scan)
    dispatcher.register_agent("vayu-analyst", dummy_analyst)

    # 1. Test slash command
    evt_cmd = SwitchEvent(
        event_id="e1",
        event_type="message.created",
        room_id="secops",
        data={
            "id": "m1",
            "room_id": "secops",
            "sender": {"id": "u1", "name": "Ayush", "type": "human"},
            "content": "/vayu scan samples/vulnerable/command_injection",
        },
    )
    res1 = await dispatcher.handle_event(evt_cmd)
    assert res1 is not None
    assert "scan" in called
    assert called["scan"] == ["samples/vulnerable/command_injection"]

    # 2. Test @mention
    evt_mention = SwitchEvent(
        event_id="e2",
        event_type="message.created",
        room_id="secops",
        data={
            "id": "m2",
            "room_id": "secops",
            "sender": {"id": "u1", "name": "Ayush", "type": "human"},
            "content": "@vayu-analyst investigate error",
            "mentions": ["vayu-analyst"],
        },
    )
    res2 = await dispatcher.handle_event(evt_mention)
    assert res2 is not None
    assert "analyst" in called


@pytest.mark.asyncio
async def test_vayu_analyst_investigation():
    """Verify VAYU-Analyst scans sample repo, traces taint, and produces report."""
    msg = SwitchMessage(
        id="m_inv",
        room_id="security-incidents",
        sender=SwitchSender(id="u_lead", name="Ayush", type="human"),
        content="@vayu-analyst investigate samples/vulnerable/command_injection",
    )
    out = await handle_analyst_task(msg)
    assert out is not None
    assert out.sender_agent_id == "vayu-analyst"
    assert "VAYU-Analyst Investigation Report" in out.content
    assert "CWE-78" in out.content
    assert out.metadata.get("status") == "handoff_to_remediator"


@pytest.mark.asyncio
async def test_vayu_remediator_execution():
    """Verify VAYU-Remediator synthesizes patch, runs 4-gate verification, and signs SLSA."""
    msg = SwitchMessage(
        id="m_fix",
        room_id="security-incidents",
        sender=SwitchSender(id="vayu-analyst", name="vayu-analyst", type="agent"),
        content="Fix vulnerability for VAYU-101",
    )
    out = await handle_remediator_task(msg)
    assert out is not None
    assert out.sender_agent_id == "vayu-remediator"
    assert "4-Gate Fail-Closed Sandbox Verification Results" in out.content
    assert "Gate 1 (Syntax / AST Build):** ✅ PASS" in out.content
    assert "Gate 2 (Functional Tests):** ✅ PASS" in out.content
    assert "Gate 3 (Exploit Neutralization):** ✅ PASS" in out.content
    assert "Gate 4 (Semgrep Static Rescan):** ✅ PASS" in out.content
    assert "SLSA Level 3 Provenance" in out.content
    assert out.metadata.get("all_gates_passed") is True


@pytest.mark.asyncio
async def test_vayu_gatekeeper_invariants():
    """Verify Gatekeeper enforces human-in-the-loop and verification requirements."""
    from vayu_platform.state import global_state

    # Set up verified issue in global_state
    global_state.create_issue(
        title="Command Injection",
        cwe="CWE-78",
        severity="CRITICAL",
        target_file="app.py",
        line_number=261,
        issue_id="VAYU-101",
    )
    global_state.record_verification(
        issue_id="VAYU-101",
        gate1_syntax=True,
        gate2_tests=True,
        gate3_exploit=True,
        gate4_rescan=True,
        approved=True,
    )
    global_state.update_issue_status("VAYU-101", "HUMAN_REVIEW")

    # Test 1: Agent trying to self-approve must be blocked
    agent_sender = SwitchSender(id="vayu-bot", name="vayu-remediator", type="agent")
    cmd_agent = CommandPayload(
        command="/approve",
        args=["VAYU-101"],
        raw_content="/approve VAYU-101",
        room_id="security-incidents",
        sender=agent_sender,
    )
    out_blocked = await handle_gatekeeper_approval(cmd_agent)
    assert "cannot approve patches" in out_blocked.content or "🛑" in out_blocked.content

    # Test 2: Valid human approval releases PR
    human_sender = SwitchSender(id="u_ayush", name="Ayush", type="human", role="lead")
    cmd_human = CommandPayload(
        command="/approve",
        args=["VAYU-101"],
        raw_content="/approve VAYU-101",
        room_id="security-incidents",
        sender=human_sender,
    )
    out_approved = await handle_gatekeeper_approval(cmd_human)
    assert "Release Authorization Complete" in out_approved.content
    assert "GitHub Pull Request" in out_approved.content
    assert out_approved.metadata.get("status") == "approved_and_shipped"


@pytest.mark.asyncio
async def test_full_switch_multiagent_flow():
    """Verify complete end-to-end multi-agent collaborative incident response on Switch."""
    service = VayuSwitchService(mock_mode=True, default_room="security-incidents")

    # Step 1: Human sends investigation request
    user_event = SwitchEvent(
        event_id="e_human_init",
        event_type="message.created",
        room_id="security-incidents",
        data={
            "id": "m_human_1",
            "room_id": "security-incidents",
            "sender": {"id": "u_lead", "name": "Ayush", "type": "human", "role": "Incident Commander"},
            "content": "@vayu-analyst investigate samples/vulnerable/command_injection",
        },
    )

    await service.on_event(user_event)

    # In mock outbox: Analyst responded, then autonomously handed off to Remediator, who also responded!
    outbox = service.client.outbox
    assert len(outbox) >= 2
    assert outbox[0].sender_agent_id == "vayu-analyst"
    created_issue_id = outbox[0].metadata["issue_id"]
    assert outbox[1].sender_agent_id == "vayu-remediator"
    assert "SLSA Level 3 Provenance" in outbox[1].content

    # Step 2: Human signs off via /approve
    approve_event = SwitchEvent(
        event_id="e_human_approve",
        event_type="message.created",
        room_id="security-incidents",
        data={
            "id": "m_human_2",
            "room_id": "security-incidents",
            "sender": {"id": "u_lead", "name": "Ayush", "type": "human", "role": "Incident Commander"},
            "content": f"/approve {created_issue_id}",
        },
    )

    await service.on_event(approve_event)

    assert len(outbox) >= 3
    assert outbox[2].sender_agent_id == "vayu-gatekeeper"
    assert "Release Authorization Complete" in outbox[2].content
    assert "GitHub Pull Request" in outbox[2].content
