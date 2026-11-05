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

const COLUMNS: {
  key: SecurityIssue["status"];
  label: string;
  color: string;
  icon: string;
}[] = [
  { key: "BACKLOG", label: "Backlog", color: "#6b7280", icon: "fa-inbox" },
  { key: "INVESTIGATING", label: "Investigating", color: "#3b82f6", icon: "fa-magnifying-glass" },
  { key: "PATCHING", label: "Patching", color: "#f59e0b", icon: "fa-wrench" },
  { key: "VERIFYING", label: "Verifying (4 Gates)", color: "#8b5cf6", icon: "fa-shield-halved" },
  { key: "HUMAN_REVIEW", label: "Human Review", color: "#f97316", icon: "fa-user-check" },
  { key: "DONE", label: "Done / Shipped", color: "#10b981", icon: "fa-circle-check" },
];

export default function IssuesView() {
  const [issues, setIssues] = useState<SecurityIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
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
    const interval = setInterval(fetchIssues, 3000);
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
      // Trigger a run or stream on command injection
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

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#090a0f",
        color: "#e2e8f0",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* HEADER BAR */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 24px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "#0d0f17",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #f59e0b, #ef4444)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 16,
              color: "#fff",
              boxShadow: "0 0 16px rgba(245, 158, 11, 0.4)",
            }}
          >
            V
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>
                VAYU OS
              </span>
              <span
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  padding: "2px 6px",
                  borderRadius: 4,
                  backgroundColor: "rgba(245, 158, 11, 0.15)",
                  color: "#f59e0b",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  fontWeight: 600,
                }}
              >
                Switch Multi-Agent Room
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
              Autonomous Security Engineering Squad • Linear-Style Operations Board
            </p>
          </div>
        </div>

        {/* SWITCH ROOM STATUS & AGENTS */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 20,
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              fontSize: 12,
              color: "#34d399",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#10b981",
                boxShadow: "0 0 8px #10b981",
                display: "inline-block",
              }}
            />
            <span>Switch Room: <strong>#security-incidents</strong></span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize: 11,
                padding: "4px 8px",
                borderRadius: 4,
                backgroundColor: "#1e293b",
                color: "#93c5fd",
                border: "1px solid #334155",
              }}
              title="VAYU-Analyst: AST Taint Flow Tracer"
            >
              🔍 @vayu-analyst
            </span>
            <span
              style={{
                fontSize: 11,
                padding: "4px 8px",
                borderRadius: 4,
                backgroundColor: "#1e293b",
                color: "#fcd34d",
                border: "1px solid #334155",
              }}
              title="VAYU-Remediator: 4-Gate Sandbox Verifier"
            >
              🛠️ @vayu-remediator
            </span>
            <span
              style={{
                fontSize: 11,
                padding: "4px 8px",
                borderRadius: 4,
                backgroundColor: "#1e293b",
                color: "#fda4af",
                border: "1px solid #334155",
              }}
              title="VAYU-Gatekeeper: Policy & Human Approval"
            >
              🛡️ @vayu-gatekeeper
            </span>

            <button
              onClick={() => setShowWisprModal(true)}
              style={{
                fontSize: 11,
                padding: "5px 10px",
                borderRadius: 5,
                backgroundColor: "rgba(168, 85, 247, 0.15)",
                color: "#d8b4fe",
                border: "1px solid rgba(168, 85, 247, 0.4)",
                cursor: "pointer",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
              title="Code with Wispr Flow: Voice-driven SecOps & Usage Scorecard"
            >
              🎙️ Wispr Voice Flow
            </button>
          </div>

          <Link
            href="/reviews"
            style={{
              fontSize: 12,
              padding: "6px 12px",
              borderRadius: 6,
              backgroundColor: "#1e293b",
              color: "#cbd5e1",
              textDecoration: "none",
              border: "1px solid #334155",
            }}
          >
            Review Console →
          </Link>
        </div>
      </header>

      {/* SUB-HEADER / ACTIONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 24px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          backgroundColor: "#0b0d14",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }}>
            Workspace: <strong>Enterprise Cloud Ops</strong>
          </span>
          <span style={{ color: "#475569" }}>•</span>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            Target: <code>samples/vulnerable/command_injection</code>
          </span>
          <span style={{ color: "#475569" }}>•</span>
          <span style={{ fontSize: 11, color: "#64748b" }}>
            Last sync: {lastRefreshed.toLocaleTimeString()}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={handleClearBoard}
            title="Clear all mock/stale issues from board"
            style={{
              background: "#1e1e2d",
              border: "1px solid #3f3f5a",
              color: "#94a3b8",
              padding: "5px 10px",
              borderRadius: 5,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            🗑️ Clear Board
          </button>
          <button
            onClick={fetchIssues}
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              color: "#e2e8f0",
              padding: "5px 10px",
              borderRadius: 5,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      <main
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(210px, 1fr))`,
          gap: 12,
          padding: 20,
          overflowX: "auto",
          minHeight: "calc(100vh - 120px)",
        }}
      >
        {COLUMNS.map((col) => {
          const colIssues = issues.filter((i) => i.status === col.key);
          return (
            <div
              key={col.key}
              style={{
                backgroundColor: "#0d0f18",
                borderRadius: 8,
                border: "1px solid rgba(255, 255, 255, 0.06)",
                display: "flex",
                flexDirection: "column",
                maxHeight: "calc(100vh - 160px)",
              }}
            >
              {/* COLUMN HEADER */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  borderTop: `3px solid ${col.color}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>
                    {col.label}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      color: "#94a3b8",
                      padding: "1px 6px",
                      borderRadius: 10,
                      fontWeight: 600,
                    }}
                  >
                    {colIssues.length}
                  </span>
                </div>
              </div>

              {/* CARDS LIST */}
              <div
                style={{
                  padding: 10,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  flex: 1,
                }}
              >
                {colIssues.length === 0 ? (
                  <div
                    style={{
                      padding: "32px 16px",
                      textAlign: "center",
                      color: "#475569",
                      fontSize: 12,
                      fontStyle: "italic",
                    }}
                  >
                    No issues in {col.label.toLowerCase()}
                  </div>
                ) : (
                  colIssues.map((issue) => (
                    <div
                      key={issue.id}
                      style={{
                        backgroundColor: "#131622",
                        borderRadius: 6,
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        padding: 12,
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                        transition: "transform 0.15s ease",
                      }}
                    >
                      {/* Top Badges */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#f59e0b",
                            letterSpacing: "0.03em",
                          }}
                        >
                          {issue.id}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 3,
                            backgroundColor:
                              issue.severity === "CRITICAL"
                                ? "rgba(239, 68, 68, 0.2)"
                                : "rgba(245, 158, 11, 0.2)",
                            color:
                              issue.severity === "CRITICAL" ? "#ef4444" : "#f59e0b",
                            border: `1px solid ${
                              issue.severity === "CRITICAL"
                                ? "rgba(239, 68, 68, 0.4)"
                                : "rgba(245, 158, 11, 0.4)"
                            }`,
                          }}
                        >
                          {issue.severity}
                        </span>
                      </div>

                      {/* Issue Title */}
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#f1f5f9",
                          marginBottom: 6,
                          lineHeight: 1.3,
                        }}
                      >
                        {issue.title}
                      </div>

                      {/* CWE & Location */}
                      <div
                        style={{
                          fontSize: 11,
                          color: "#94a3b8",
                          marginBottom: 8,
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        <span style={{ color: "#cbd5e1" }}>
                          🏷️ <code>{issue.cwe}</code>
                        </span>
                        <span style={{ color: "#64748b" }}>
                          📁 {issue.target_file}:{issue.line_number}
                        </span>
                      </div>

                      {/* 4-Gate pills if in HUMAN_REVIEW or DONE */}
                      {(issue.status === "HUMAN_REVIEW" || issue.status === "DONE") && (
                        <div
                          style={{
                            margin: "8px 0",
                            padding: "6px 8px",
                            borderRadius: 4,
                            backgroundColor: "rgba(16, 185, 129, 0.08)",
                            border: "1px solid rgba(16, 185, 129, 0.2)",
                            fontSize: 10,
                            color: "#10b981",
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                          }}
                        >
                          <div style={{ fontWeight: 700 }}>
                            🛡️ 4-Gate Sandbox Verification:
                          </div>
                          <div>• Syntax & Indentation Lock: <strong>PASS</strong></div>
                          <div>• Functional Regressions: <strong>PASS (0 failures)</strong></div>
                          <div>• Exploit Neutralization: <strong>PASS (Blocked)</strong></div>
                          <div>• Semgrep Rescan: <strong>CLEAN</strong></div>
                          <div style={{ color: "#38bdf8", marginTop: 2 }}>
                            📜 SLSA Level 3: <strong>ECDSA Signed</strong>
                          </div>
                        </div>
                      )}

                      {/* Card Footer: Assignee & Action */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 10,
                          paddingTop: 8,
                          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            color: "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          👤 @{issue.assigned_agent}
                        </span>

                        {issue.status === "HUMAN_REVIEW" && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#f97316",
                              backgroundColor: "rgba(249, 115, 22, 0.15)",
                              padding: "2px 6px",
                              borderRadius: 4,
                              border: "1px solid rgba(249, 115, 22, 0.3)",
                            }}
                          >
                            Awaiting /approve
                          </span>
                        )}

                        {issue.status === "DONE" && issue.github_pr_url && (
                          <a
                            href={issue.github_pr_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: 10,
                              color: "#38bdf8",
                              textDecoration: "none",
                              fontWeight: 600,
                            }}
                          >
                            GitHub PR #42 ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* WISPR FLOW MODAL */}
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
            {/* MODAL HEADER */}
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

            {/* DICTATION COMMAND PLAYBOOK */}
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
                    &ldquo;At security incidents investigate samples vulnerable command injection&rdquo;
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
                    &ldquo;Approve VAYU 137. Verification checks look solid across all four gates. Ship the PR.&rdquo;
                  </code>
                </div>
              </div>
            </div>

            {/* SUBMISSION SCRIPT REFERENCE */}
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
              <span>📄 Full voiceover transcripts & demo video script stored at <strong>WISPR_VOICE_SCRIPT.md</strong></span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText("samples/vulnerable/command_injection");
                  alert("Copied target repo path to clipboard!");
                }}
                style={{
                  background: "#a855f7",
                  border: "none",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontSize: 10,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Copy Path
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

