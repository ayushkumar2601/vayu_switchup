from __future__ import annotations
"""Embedded SQLite State Machine and Issue Tracker for VAYU OS."""

import json
import logging
import os
import sqlite3
import threading
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional

logger = logging.getLogger("vayu.platform.state")

DEFAULT_DB_PATH = os.getenv("VAYU_DB_PATH", "vayu_os.db")

IssueStatus = Literal[
    "BACKLOG",
    "INVESTIGATING",
    "PATCHING",
    "VERIFYING",
    "HUMAN_REVIEW",
    "DONE",
    "REJECTED",
    "VERIFICATION_FAILED",
]


@dataclass
class SecurityIssue:
    id: str
    title: str
    cwe: str
    severity: str
    target_file: str
    line_number: int
    status: IssueStatus
    assigned_agent: str
    patch_diff: Optional[str] = None
    github_pr_url: Optional[str] = None
    created_at: float = 0.0
    updated_at: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class VerificationRecord:
    id: str
    issue_id: str
    gate1_syntax: bool
    gate2_tests: bool
    gate3_exploit: bool
    gate4_rescan: bool
    approved: bool
    slsa_attestation_json: Optional[str] = None
    sandbox_provider: str = "local"
    verified_at: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class StateStore:
    """Thread-safe SQLite state machine for VAYU OS issues, verifications, and audit trails."""

    def __init__(self, db_path: str = DEFAULT_DB_PATH) -> None:
        self.db_path = db_path
        self._lock = threading.RLock()
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._lock, self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS issues (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    cwe TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    target_file TEXT NOT NULL,
                    line_number INTEGER NOT NULL,
                    status TEXT NOT NULL,
                    assigned_agent TEXT NOT NULL,
                    patch_diff TEXT,
                    github_pr_url TEXT,
                    created_at REAL NOT NULL,
                    updated_at REAL NOT NULL
                )
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS verification_records (
                    id TEXT PRIMARY KEY,
                    issue_id TEXT NOT NULL,
                    gate1_syntax INTEGER NOT NULL,
                    gate2_tests INTEGER NOT NULL,
                    gate3_exploit INTEGER NOT NULL,
                    gate4_rescan INTEGER NOT NULL,
                    approved INTEGER NOT NULL,
                    slsa_attestation_json TEXT,
                    sandbox_provider TEXT NOT NULL,
                    verified_at REAL NOT NULL,
                    FOREIGN KEY (issue_id) REFERENCES issues(id)
                )
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS audit_events (
                    id TEXT PRIMARY KEY,
                    issue_id TEXT NOT NULL,
                    actor_type TEXT NOT NULL,
                    actor_name TEXT NOT NULL,
                    action TEXT NOT NULL,
                    payload_json TEXT NOT NULL,
                    timestamp REAL NOT NULL,
                    FOREIGN KEY (issue_id) REFERENCES issues(id)
                )
                """
            )
            conn.commit()

    def create_issue(
        self,
        title: str,
        cwe: str,
        severity: str,
        target_file: str,
        line_number: int,
        assigned_agent: str = "vayu-analyst",
        issue_id: Optional[str] = None,
    ) -> SecurityIssue:
        now = time.time()
        with self._lock, self._get_connection() as conn:
            cursor = conn.cursor()
            if not issue_id:
                cursor.execute("SELECT COUNT(*) FROM issues")
                count = cursor.fetchone()[0] + 101
                issue_id = f"VAYU-{count}"

            cursor.execute(
                """
                INSERT OR REPLACE INTO issues (
                    id, title, cwe, severity, target_file, line_number,
                    status, assigned_agent, patch_diff, github_pr_url, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    issue_id,
                    title,
                    cwe,
                    severity.upper(),
                    target_file,
                    line_number,
                    "BACKLOG",
                    assigned_agent,
                    None,
                    None,
                    now,
                    now,
                ),
            )
            conn.commit()

        self.record_audit_event(
            issue_id=issue_id,
            actor_type="SYSTEM",
            actor_name="VAYU-OS",
            action="ISSUE_CREATED",
            payload={"title": title, "cwe": cwe, "severity": severity},
        )
        return self.get_issue(issue_id)  # type: ignore

    def get_issue(self, issue_id: str) -> Optional[SecurityIssue]:
        with self._lock, self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM issues WHERE id = ?", (issue_id,))
            row = cursor.fetchone()
            if not row:
                return None
            return SecurityIssue(**dict(row))

    def list_issues(self, status: Optional[str] = None) -> List[SecurityIssue]:
        with self._lock, self._get_connection() as conn:
            cursor = conn.cursor()
            if status:
                cursor.execute("SELECT * FROM issues WHERE status = ? ORDER BY created_at DESC", (status,))
            else:
                cursor.execute("SELECT * FROM issues ORDER BY created_at DESC")
            return [SecurityIssue(**dict(r)) for r in cursor.fetchall()]

    def update_issue_status(
        self,
        issue_id: str,
        status: IssueStatus,
        assigned_agent: Optional[str] = None,
        patch_diff: Optional[str] = None,
        github_pr_url: Optional[str] = None,
        actor_name: str = "VAYU-OS",
        actor_type: str = "AGENT",
    ) -> Optional[SecurityIssue]:
        now = time.time()
        with self._lock, self._get_connection() as conn:
            cursor = conn.cursor()
            issue = self.get_issue(issue_id)
            if not issue:
                return None

            new_agent = assigned_agent if assigned_agent is not None else issue.assigned_agent
            new_diff = patch_diff if patch_diff is not None else issue.patch_diff
            new_pr = github_pr_url if github_pr_url is not None else issue.github_pr_url

            cursor.execute(
                """
                UPDATE issues SET
                    status = ?,
                    assigned_agent = ?,
                    patch_diff = ?,
                    github_pr_url = ?,
                    updated_at = ?
                WHERE id = ?
                """,
                (status, new_agent, new_diff, new_pr, now, issue_id),
            )
            conn.commit()

        self.record_audit_event(
            issue_id=issue_id,
            actor_type=actor_type,
            actor_name=actor_name,
            action=f"STATUS_TRANSITION_{status}",
            payload={"old_status": issue.status, "new_status": status, "assigned_agent": new_agent},
        )
        return self.get_issue(issue_id)

    def record_verification(
        self,
        issue_id: str,
        gate1_syntax: bool,
        gate2_tests: bool,
        gate3_exploit: bool,
        gate4_rescan: bool,
        approved: bool,
        slsa_attestation: Optional[Dict[str, Any]] = None,
        sandbox_provider: str = "local",
    ) -> VerificationRecord:
        now = time.time()
        rec_id = f"vr_{int(now*1000)}"
        slsa_json = json.dumps(slsa_attestation) if slsa_attestation else None

        with self._lock, self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT OR REPLACE INTO verification_records (
                    id, issue_id, gate1_syntax, gate2_tests, gate3_exploit,
                    gate4_rescan, approved, slsa_attestation_json, sandbox_provider, verified_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    rec_id,
                    issue_id,
                    int(gate1_syntax),
                    int(gate2_tests),
                    int(gate3_exploit),
                    int(gate4_rescan),
                    int(approved),
                    slsa_json,
                    sandbox_provider,
                    now,
                ),
            )
            conn.commit()

        self.record_audit_event(
            issue_id=issue_id,
            actor_type="AGENT",
            actor_name="VAYU-Remediator",
            action="VERIFICATION_COMPLETED",
            payload={
                "gate1_syntax": gate1_syntax,
                "gate2_tests": gate2_tests,
                "gate3_exploit": gate3_exploit,
                "gate4_rescan": gate4_rescan,
                "approved": approved,
            },
        )
        return VerificationRecord(
            id=rec_id,
            issue_id=issue_id,
            gate1_syntax=gate1_syntax,
            gate2_tests=gate2_tests,
            gate3_exploit=gate3_exploit,
            gate4_rescan=gate4_rescan,
            approved=approved,
            slsa_attestation_json=slsa_json,
            sandbox_provider=sandbox_provider,
            verified_at=now,
        )

    def get_verification(self, issue_id: str) -> Optional[VerificationRecord]:
        with self._lock, self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM verification_records WHERE issue_id = ? ORDER BY verified_at DESC LIMIT 1",
                (issue_id,),
            )
            row = cursor.fetchone()
            if not row:
                return None
            data = dict(row)
            return VerificationRecord(
                id=data["id"],
                issue_id=data["issue_id"],
                gate1_syntax=bool(data["gate1_syntax"]),
                gate2_tests=bool(data["gate2_tests"]),
                gate3_exploit=bool(data["gate3_exploit"]),
                gate4_rescan=bool(data["gate4_rescan"]),
                approved=bool(data["approved"]),
                slsa_attestation_json=data["slsa_attestation_json"],
                sandbox_provider=data["sandbox_provider"],
                verified_at=data["verified_at"],
            )

    def record_audit_event(
        self,
        issue_id: str,
        actor_type: str,
        actor_name: str,
        action: str,
        payload: Dict[str, Any],
    ) -> None:
        now = time.time()
        evt_id = f"aud_{int(now*1000)}_{os.urandom(2).hex()}"
        with self._lock, self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO audit_events (
                    id, issue_id, actor_type, actor_name, action, payload_json, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (evt_id, issue_id, actor_type, actor_name, action, json.dumps(payload), now),
            )
            conn.commit()


# Default singleton instance
global_state = StateStore()
