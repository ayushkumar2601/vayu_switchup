"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface SecurityIssue {
  id: string;
  title: string;
  cwe: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  target_file: string;
  line_number: number;
  status:
    | "BACKLOG"
    | "INVESTIGATING"
    | "PATCHING"
    | "VERIFYING"
    | "HUMAN_REVIEW"
    | "DONE"
    | "REJECTED"
    | "VERIFICATION_FAILED";
  assigned_agent: string;
  patch_diff?: string | null;
  github_pr_url?: string | null;
  created_at: number;
  updated_at: number;
}

interface ColumnDef {
  key: "inbox" | "up_next" | "in_progress" | "review" | "done";
  label: string;
  countKey: string;
  statuses: SecurityIssue["status"][];
}

const COLUMNS: ColumnDef[] = [
  { key: "inbox", label: "Inbox", countKey: "inbox", statuses: ["BACKLOG"] },
  { key: "up_next", label: "Up Next", countKey: "up_next", statuses: ["INVESTIGATING"] },
  { key: "in_progress", label: "In Progress", countKey: "in_progress", statuses: ["PATCHING", "VERIFYING"] },
  { key: "review", label: "Review", countKey: "review", statuses: ["HUMAN_REVIEW"] },
  { key: "done", label: "Done", countKey: "done", statuses: ["DONE"] },
];

export default function IssuesView() {
  const [issues, setIssues] = useState<SecurityIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [showWisprModal, setShowWisprModal] = useState(false);

  const fetchIssues = async () => {
    try {
      const res = await fetch("/api/issues");
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error("Failed to load issues:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    const interval = setInterval(fetchIssues, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleClearBoard = async () => {
    try {
      await fetch("/api/issues", { method: "DELETE" });
      await fetchIssues();
    } catch (err) {
      console.error("Failed to clear board:", err);
    }
  };

  const handleSimulateScan = async () => {
    setIsScanning(true);
    try {
      await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "samples/vulnerable/command_injection" }),
      });
      await fetchIssues();
    } catch (err) {
      console.error("Scan trigger error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleApproveIssue = async (issueId: string) => {
    setApprovingId(issueId);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", issue_id: issueId, approver: "Ayush Kumar (Lead)" }),
      });
      if (res.ok) {
        await fetchIssues();
      }
    } catch (err) {
      console.error("Failed to approve issue:", err);
    } finally {
      setApprovingId(null);
    }
  };

  // Filter issues per column
  const getIssuesForColumn = (col: ColumnDef): SecurityIssue[] => {
    return issues.filter((i) => col.statuses.includes(i.status));
  };

  const formatRelativeTime = (timestamp: number): string => {
    if (!timestamp) return "Added recently";
    const diffSeconds = Math.max(1, Math.floor(Date.now() / 1000 - timestamp));
    if (diffSeconds < 60) return `Added ${diffSeconds}s ago`;
    const diffMins = Math.floor(diffSeconds / 60);
    if (diffMins < 60) return `Added ${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Added ${diffHours}h ago`;
    return `Added ${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0d0e15",
        color: "#f8fafc",
        padding: "24px 32px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* TOP HEADER MATCHING THE SCREENSHOT EXACTLY */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        {/* LEFT: TITLE */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#ffffff", margin: 0, letterSpacing: "-0.01em" }}>
            Everything
          </h1>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            Security Incidents & Autonomous Operations
          </span>
        </div>

        {/* RIGHT: ACTIONS & OVERLAPPING AVATARS */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* ALL FILTER PILL */}
          <button
            style={{
              backgroundColor: "#181922",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#e2e8f0",
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            All
          </button>

          {/* OVERLAPPING AVATARS (Ayush + Agents + Switch) */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              title="Ayush Kumar (Incident Commander)"
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                backgroundColor: "#2563eb",
                border: "2px solid #0d0e15",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                color: "#fff",
                zIndex: 5,
              }}
            >
              A
            </div>
            <div
              title="VAYU-Analyst (AST Taint Tracer)"
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                backgroundColor: "#3b82f6",
                border: "2px solid #0d0e15",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                color: "#fff",
                marginLeft: -8,
                zIndex: 4,
              }}
            >
              🔍
            </div>
            <div
              title="VAYU-Remediator (4-Gate Sandbox Verifier)"
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                backgroundColor: "#f59e0b",
                border: "2px solid #0d0e15",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                color: "#fff",
                marginLeft: -8,
                zIndex: 3,
              }}
            >
              🛠️
            </div>
            <div
              title="VAYU-Gatekeeper (Policy & Human Approval)"
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                backgroundColor: "#ec4899",
                border: "2px solid #0d0e15",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                color: "#fff",
                marginLeft: -8,
                zIndex: 2,
              }}
            >
              🛡️
            </div>
            <div
              title="Switch Agent Protocol Daemon"
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                backgroundColor: "#10b981",
                border: "2px solid #0d0e15",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                color: "#fff",
                marginLeft: -8,
                zIndex: 1,
              }}
            >
              ⚡
            </div>
          </div>

          {/* SIMULATE SCAN */}
          <button
            onClick={handleSimulateScan}
            disabled={isScanning}
            style={{
              backgroundColor: "#181a24",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#93c5fd",
              padding: "5px 12px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {isScanning ? "Scanning..." : "+ New Incident"}
          </button>

          {/* CLEAR BOARD */}
          <button
            onClick={handleClearBoard}
            title="Clear all stale tickets from board"
            style={{
              backgroundColor: "#181a24",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#94a3b8",
              padding: "5px 10px",
              borderRadius: 6,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            🗑️ Clear
          </button>

          {/* REFRESH */}
          <button
            onClick={fetchIssues}
            style={{
              backgroundColor: "#181a24",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#cbd5e1",
              padding: "5px 10px",
              borderRadius: 6,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            ↻
          </button>

          {/* WISPR FLOW SCORECARD BUTTON */}
          <button
            onClick={() => setShowWisprModal(true)}
            style={{
              backgroundColor: "rgba(168, 85, 247, 0.15)",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              color: "#d8b4fe",
              padding: "5px 12px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>🎙️</span> Wispr Flow
          </button>
        </div>
      </header>

      {/* 5-COLUMN KANBAN GRID MATCHING THE SCREENSHOT EXACTLY */}
      <main
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
          minHeight: "calc(100vh - 120px)",
        }}
      >
        {COLUMNS.map((col) => {
          const colIssues = getIssuesForColumn(col);
          const count = colIssues.length;

          return (
            <div
              key={col.key}
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: 500,
              }}
            >
              {/* COLUMN HEADER (e.g. "Inbox 2", "Up Next 5") */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                  padding: "0 4px",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }}>
                  {col.label}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#64748b",
                  }}
                >
                  {count}
                </span>
              </div>

              {/* CARD LIST */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  flex: 1,
                }}
              >
                {colIssues.length === 0 ? (
                  <div
                    style={{
                      border: "1px dashed rgba(255, 255, 255, 0.05)",
                      borderRadius: 8,
                      padding: "24px 12px",
                      textAlign: "center",
                      color: "#475569",
                      fontSize: 12,
                    }}
                  >
                    No tickets
                  </div>
                ) : (
                  colIssues.map((issue) => {
                    const isReviewCol = col.key === "review";
                    const isDoneCol = col.key === "done";

                    return (
                      <div
                        key={issue.id}
                        style={{
                          backgroundColor: "#16171f",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          borderRadius: 10,
                          padding: 14,
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                          transition: "border 0.15s, transform 0.15s",
                        }}
                      >
                        {/* TOP TIMESTAMP */}
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          {isReviewCol
                            ? "Submitted for review 1 hour ago"
                            : isDoneCol
                            ? "Completed 2 hours ago"
                            : formatRelativeTime(issue.created_at)}
                        </div>

                        {/* TITLE */}
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#f8fafc",
                            lineHeight: 1.35,
                          }}
                        >
                          {issue.title}
                        </div>

                        {/* INSET EVIDENCE / QUOTE BOX (MATCHING SCREENSHOT) */}
                        <div
                          style={{
                            backgroundColor: "#0f1016",
                            border: "1px solid rgba(255, 255, 255, 0.04)",
                            borderRadius: 6,
                            padding: "8px 10px",
                            display: "flex",
                            gap: 8,
                            alignItems: "flex-start",
                          }}
                        >
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              backgroundColor:
                                issue.assigned_agent === "vayu-analyst"
                                  ? "#3b82f6"
                                  : issue.assigned_agent === "vayu-remediator"
                                  ? "#f59e0b"
                                  : "#ec4899",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 9,
                              fontWeight: 700,
                              color: "#fff",
                              flexShrink: 0,
                              marginTop: 1,
                            }}
                          >
                            {issue.assigned_agent ? issue.assigned_agent[0].toUpperCase() : "A"}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#cbd5e1", marginBottom: 2 }}>
                              @{issue.assigned_agent || "vayu-agent"}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                lineHeight: 1.35,
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {issue.cwe}: Unsanitized user-controlled input reaches an execution sink ({issue.target_file}:{issue.line_number}).
                            </div>
                          </div>
                        </div>

                        {/* BOTTOM PILLS ROW */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: 2,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {/* CATEGORY / REPO PILL (e.g. Cuebox / command_injection) */}
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                padding: "2px 8px",
                                borderRadius: 12,
                                backgroundColor: "rgba(56, 189, 248, 0.12)",
                                color: "#38bdf8",
                                border: "1px solid rgba(56, 189, 248, 0.25)",
                              }}
                            >
                              command_injection
                            </span>

                            {/* SEVERITY PILL */}
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                padding: "2px 6px",
                                borderRadius: 4,
                                backgroundColor: "rgba(239, 68, 68, 0.12)",
                                color: "#f87171",
                              }}
                            >
                              {issue.severity}
                            </span>
                          </div>

                          <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>
                            {issue.id}
                          </span>
                        </div>

                        {/* SPECIAL BUTTON IN "REVIEW" COLUMN: 👍 APPROVE (MATCHING SCREENSHOT!) */}
                        {isReviewCol && (
                          <button
                            onClick={() => handleApproveIssue(issue.id)}
                            disabled={approvingId === issue.id}
                            style={{
                              marginTop: 6,
                              width: "100%",
                              padding: "6px 12px",
                              borderRadius: 6,
                              border: "1px solid rgba(74, 222, 128, 0.4)",
                              backgroundColor: "rgba(74, 222, 128, 0.08)",
                              color: "#4ade80",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              transition: "background 0.15s",
                            }}
                          >
                            <span>👍</span> {approvingId === issue.id ? "Approving..." : "Approve"}
                          </button>
                        )}

                        {/* SPECIAL LINK IN "DONE" COLUMN: GitHub PR Link */}
                        {isDoneCol && issue.github_pr_url && (
                          <a
                            href={issue.github_pr_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              marginTop: 4,
                              fontSize: 11,
                              color: "#38bdf8",
                              textDecoration: "none",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <span>🚀</span> GitHub PR #42 ↗
                          </a>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* WISPR FLOW SCORECARD MODAL */}
      {showWisprModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
          onClick={() => setShowWisprModal(false)}
        >
          <div
            style={{
              backgroundColor: "#0d0f18",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              borderRadius: 12,
              maxWidth: 680,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(168, 85, 247, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 22 }}>🎙️</span>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", margin: 0 }}>
                    Code with Wispr Flow — Voice-Driven SecOps
                  </h2>
                </div>
                <p style={{ fontSize: 12, color: "#a855f7", margin: "4px 0 0 30px", fontWeight: 600 }}>
                  Flip the Switch Hackathon • $500 Wispr Flow Track
                </p>
              </div>
              <button
                onClick={() => setShowWisprModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* USAGE SCORECARD */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
                marginBottom: 20,
                backgroundColor: "#131622",
                padding: 16,
                borderRadius: 8,
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Words Dictated</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#38bdf8" }}>1,840</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>via Wispr Flow Desktop</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Speedup Multiplier</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#a855f7" }}>3.2x</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>vs manual typing</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Voice Ingestion</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#34d399" }}>99.4%</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>Technical command accuracy</div>
              </div>
            </div>

            {/* NATURAL VOICE COMMANDS */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>
                🗣️ Dictated Voice Commands (Speak into Discord or Terminal)
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div
                  style={{
                    backgroundColor: "#161b2a",
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#93c5fd" }}>1. Room Kickoff & Investigation</span>
                    <span style={{ fontSize: 10, color: "#64748b" }}>Wispr Flow Hotkey</span>
                  </div>
                  <code style={{ fontSize: 12, color: "#f1f5f9", display: "block", fontFamily: "monospace" }}>
                    &ldquo;Vayu, please check the code for any vulnerabilities before raising a PR on GitHub.&rdquo;
                  </code>
                </div>

                <div
                  style={{
                    backgroundColor: "#161b2a",
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fcd34d" }}>2. Human-in-the-Loop Release Sign-off</span>
                    <span style={{ fontSize: 10, color: "#64748b" }}>Wispr Flow Hotkey</span>
                  </div>
                  <code style={{ fontSize: 12, color: "#f1f5f9", display: "block", fontFamily: "monospace" }}>
                    &ldquo;Vayu, the fix looks good across all four gates, please approve and ship the pull request.&rdquo;
                  </code>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: 12,
                borderRadius: 6,
                backgroundColor: "rgba(168, 85, 247, 0.08)",
                border: "1px dashed rgba(168, 85, 247, 0.3)",
                fontSize: 11,
                color: "#c084fc",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>📄 Transcripts and video voiceover script stored at <strong>WISPR_VOICE_SCRIPT.md</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
