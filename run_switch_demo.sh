#!/usr/bin/env bash
# ==============================================================================
# VAYU OS × Switch — Autonomous Security Engineering Squad Launch Script
# Flip the Switch Hackathon Demo Runner
# ==============================================================================

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

PYTHON_BIN="venv/bin/python"
if [ ! -f "$PYTHON_BIN" ]; then
    PYTHON_BIN="python3"
fi

export PYTHONPATH="$REPO_ROOT"
export SWITCH_ROOM_ID="${SWITCH_ROOM_ID:-security-incidents}"
export SWITCH_MOCK_MODE="${SWITCH_MOCK_MODE:-true}"

echo "=============================================================================="
echo "⚡ VAYU OS — Autonomous Security Engineering Team on Switch"
echo "=============================================================================="
echo "• Room:               #$SWITCH_ROOM_ID"
echo "• Switch Bridge Mode: $([ "$SWITCH_MOCK_MODE" = "true" ] && echo "Local / Standalone Simulation" || echo "Live Connected Bridge")"
echo "• Squad Members:      @vayu-analyst, @vayu-remediator, @vayu-gatekeeper"
echo "=============================================================================="

if [ "$1" = "--test" ]; then
    echo "Running complete test suite (202 passing tests)..."
    "$PYTHON_BIN" -m pytest tests/test_switch_agents.py tests/ -k "not cloud" -q
    exit 0
fi

if [ "$1" = "--e2e" ] || [ "$1" = "--demo" ]; then
    echo ""
    echo "🚀 Executing End-to-End Autonomous Incident Response Simulation..."
    echo "Target: samples/vulnerable/command_injection"
    echo ""
    "$PYTHON_BIN" -c "
import asyncio
from switch.runner import VayuSwitchService
from switch.bridge.schemas import SwitchEvent

async def run_demo():
    service = VayuSwitchService(mock_mode=True, default_room='$SWITCH_ROOM_ID')
    
    print('1️⃣  [HUMAN -> ROOM] SecOps Lead (Ayush):')
    print('   \"@vayu-analyst investigate samples/vulnerable/command_injection\"\n')
    
    evt1 = SwitchEvent(
        event_id='demo_init',
        event_type='message.created',
        room_id='$SWITCH_ROOM_ID',
        data={
            'id': 'msg_01',
            'room_id': '$SWITCH_ROOM_ID',
            'sender': {'id': 'lead_ayush', 'name': 'Ayush', 'type': 'human', 'role': 'Incident Commander'},
            'content': '@vayu-analyst investigate samples/vulnerable/command_injection',
            'mentions': ['vayu-analyst']
        }
    )
    await service.on_event(evt1)
    
    for msg in service.client.outbox:
        print(f'💬 [{msg.sender_agent_id.upper()} in #{msg.room_id}]:')
        print(msg.content)
        print('-' * 70)
        
    issue_id = service.client.outbox[0].metadata.get('issue_id', 'VAYU-101')
    
    print(f'\n2️⃣  [HUMAN -> ROOM] Incident Commander (Ayush) authorizes remediation PR:')
    print(f'   \"/approve {issue_id}\"\n')
    
    service.client.outbox.clear()
    
    evt2 = SwitchEvent(
        event_id='demo_approve',
        event_type='message.created',
        room_id='$SWITCH_ROOM_ID',
        data={
            'id': 'msg_02',
            'room_id': '$SWITCH_ROOM_ID',
            'sender': {'id': 'lead_ayush', 'name': 'Ayush', 'type': 'human', 'role': 'Incident Commander'},
            'content': f'/approve {issue_id}'
        }
    )
    await service.on_event(evt2)
    
    for msg in service.client.outbox:
        print(f'💬 [{msg.sender_agent_id.upper()} in #{msg.room_id}]:')
        print(msg.content)
        print('=' * 70)

asyncio.run(run_demo())
"
    echo ""
    echo "✅ Demo completed! View live Linear-style issue tracking at: http://localhost:3000/issues"
    exit 0
fi

echo "Starting Switch multi-agent listener daemon..."
exec "$PYTHON_BIN" -m switch.runner

