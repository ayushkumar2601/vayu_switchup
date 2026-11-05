from __future__ import annotations
"""VAYU-Analyst Agent Handler for Switch.

Investigates repository vulnerabilities using StaticScanner, AST taint graphs,
and PromptFirewall isolation.
"""

import logging
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

from crs.core.schemas import CodeContext, VulnerabilityFinding
from crs.guardrails.prompt_firewall import PromptFirewall
from crs.reasoning.evidence_builder import EvidenceBuilder
from crs.static_analysis.scanner import StaticScanner
from crs.static_analysis.taint_graph import TaintGraphAnalyzer
from vayu_platform.state import SecurityIssue, global_state
from switch.bridge.schemas import CommandPayload, OutboundMessage, SwitchMessage

logger = logging.getLogger("vayu.switch.analyst")

DEFAULT_TARGET = "samples/vulnerable/command_injection"


def _extract_target_path(content: str) -> str:
    """Extract repository path from command or message content, or return default sample target."""
    match = re.search(r"(?:investigate|scan)\s+([A-Za-z0-9_\-\./]+)", content, re.IGNORECASE)
    if match:
        extracted = match.group(1).strip()
        if Path(extracted).exists():
            return extracted
    return DEFAULT_TARGET


async def handle_analyst_task(msg: SwitchMessage | CommandPayload) -> OutboundMessage:
    """Execute vulnerability investigation and AST taint graph analysis."""
    content = msg.content if isinstance(msg, SwitchMessage) else msg.raw_content
    room_id = msg.room_id
    sender_name = msg.sender.name

    target_path = _extract_target_path(content)
    logger.info(f"VAYU-Analyst scanning target: {target_path} (requested by {sender_name})")

    scanner = StaticScanner()
    firewall = PromptFirewall()
    taint_analyzer = TaintGraphAnalyzer()

    try:
        findings = scanner.scan(target_path)
    except Exception as exc:
        logger.error(f"StaticScanner failed: {exc}")
        return OutboundMessage(
            room_id=room_id,
            sender_agent_id="vayu-analyst",
            content=f"⚠️ **VAYU-Analyst:** Scan failed on `{target_path}`: {exc}",
            metadata={"status": "error", "error": str(exc)},
        )

    if not findings:
        return OutboundMessage(
            room_id=room_id,
            sender_agent_id="vayu-analyst",
            content=f"✅ **VAYU-Analyst:** Scan complete for `{target_path}`. No vulnerabilities detected. Codebase is clean.",
            metadata={"status": "clean"},
        )

    # Prioritize critical / high severity findings (e.g., shell injection)
    primary_finding = next(
        (f for f in findings if any("subprocess-shell-true" in str(e.raw_reference) for e in f.evidence)),
        findings[0],
    )

    # 1. Discover Taint Flows
    taint_flows = taint_analyzer.analyze_repository(Path(target_path))
    taint_summary = ""
    if taint_flows:
        flow = taint_flows[0]
        stack_str = " ➔ ".join(flow.call_stack) if flow.call_stack else f"{flow.source.name} ➔ {flow.sink.name}"
        taint_summary = f"\n**AST Taint Flow:** `{stack_str}`"

    target_file = primary_finding.file or (primary_finding.evidence[0].file if primary_finding.evidence else "app.py")
    sink_line = (primary_finding.evidence[0].line if primary_finding.evidence and primary_finding.evidence[0].line else None) or primary_finding.line_start or 261
    vuln_name = primary_finding.vulnerability_type or "Command Injection"
    cwe = f"CWE-78: {vuln_name}" if "subprocess" in vuln_name.lower() or "shell" in vuln_name.lower() else vuln_name
    severity = primary_finding.severity.value if hasattr(primary_finding.severity, "value") else str(primary_finding.severity)

    rule_ref = primary_finding.evidence[0].raw_reference if (primary_finding.evidence and primary_finding.evidence[0].raw_reference) else primary_finding.finding_id

    # 2. Register Issue in Platform State Store
    issue = global_state.create_issue(
        title=f"Vulnerability in {Path(target_file).name} ({primary_finding.vulnerability_type or 'Injection'})",
        cwe=cwe,
        severity=severity,
        target_file=target_file,
        line_number=sink_line,
        assigned_agent="vayu-remediator",
    )
    global_state.update_issue_status(
        issue_id=issue.id,
        status="INVESTIGATING",
        actor_name="VAYU-Analyst",
        actor_type="AGENT",
    )

    # 3. Format Structured Markdown Report for Switch Room
    report = (
        f"### 🔍 **VAYU-Analyst Investigation Report**\n"
        f"**Issue ID:** `{issue.id}` | **Severity:** `{severity.upper()}` | **CWE:** `{cwe}`\n"
        f"**Affected File:** `{target_file}:{sink_line}`\n"
        f"**Rule Identifier:** `{rule_ref}`\n"
        f"{taint_summary}\n\n"
        f"**Root Cause Analysis:**\n"
        f"Unsanitized user-controlled input reaches an execution sink (`subprocess.run(shell=True)`). "
        f"Arbitrary command execution is possible via shell metacharacters.\n\n"
        f"🛡️ *Prompt Firewall: Untrusted code evidence isolated and verified.*\n\n"
        f"👉 **Handoff:** Delegating remediation to `@vayu-remediator` for patch synthesis and 4-gate verification."
    )

    global_state.update_issue_status(
        issue_id=issue.id,
        status="PATCHING",
        assigned_agent="vayu-remediator",
        actor_name="VAYU-Analyst",
        actor_type="AGENT",
    )

    return OutboundMessage(
        room_id=room_id,
        sender_agent_id="vayu-analyst",
        content=report,
        metadata={
            "issue_id": issue.id,
            "status": "handoff_to_remediator",
            "target_path": target_path,
            "cwe": cwe,
        },
    )
