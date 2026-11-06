"use client";

import React, { useState, useEffect } from "react";
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

interface IssueRow {
  id: string;
  priority: "high" | "medium" | "low" | "urgent";
  status: "in_review" | "in_progress" | "todo" | "done";
  title: string;
  target?: string;
  prNumber?: string;
  prUrl?: string;
  labels: { text: string; color: string }[];
  workingAgent?: string;
  assignee: { name: string; avatar: string; color: string };
  date: string;
  isLive?: boolean;
}

export default function MyIssuesView() {
  const [activeTab, setActiveTab] = useState<"assigned" | "created" | "subscribed" | "activity">("assigned");
  const [liveIssues, setLiveIssues] = useState<SecurityIssue[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchIssues = async () => {
    try {
      const res = await fetch("/api/issues");
      if (res.ok) {
        const data = await res.json();
        setLiveIssues(data);
      }
    } catch (err) {
      console.error("Failed to fetch live issues:", err);
    }
  };

  useEffect(() => {
    fetchIssues();
    const interval = setInterval(fetchIssues, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (issueId: string) => {
    setApprovingId(issueId);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", issue_id: issueId, approver: "Ayush Kumar (Lead)" }),
      });
      if (res.ok) {
        setToastMessage(`✓ Remediation approved by Ayush Kumar. PR #42 published on GitHub!`);
        setTimeout(() => setToastMessage(null), 6000);
        await fetchIssues();
      }
    } catch (err) {
      console.error("Approval error:", err);
    } finally {
      setApprovingId(null);
    }
  };

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  // High-fidelity issue definitions matching the reference screenshot pixel-for-pixel
  const defaultIssues: IssueRow[] = [
    // --- 1. IN REVIEW (3) ---
    {
      id: "VAYU-2498",
      priority: "high",
      status: "in_review",
      title: "Replace subprocess shell=True with immutable argument list",
      target: "samples/vulnerable/command_injection/app.py:261",
      prNumber: "#54910",
      prUrl: "https://github.com/ayushkumar2601/vayu_switchup/pull/42",
      labels: [
        { text: "command_injection", color: "#eab308" },
        { text: "4-Gate Verified", color: "#27a644" },
      ],
      assignee: { name: "Ayush Kumar", avatar: "AK", color: "#2563eb" },
      date: "Oct 9",
    },
    {
      id: "VAYU-2380",
      priority: "high",
      status: "in_review",
      title: "Enforce os.path.basename & directory jail on diagnostic reader",
      target: "samples/vulnerable/path_traversal/app.py:298",
      prNumber: "#55167",
      prUrl: "https://github.com/ayushkumar2601/vayu_switchup/pull/42",
      labels: [{ text: "path_traversal", color: "#38bdf8" }],
      assignee: { name: "VAYU-Gatekeeper", avatar: "VG", color: "#ec4899" },
      date: "Oct 9",
    },
    {
      id: "VAYU-2039",
      priority: "low",
      status: "in_review",
      title: "Parameterize cursor.execute with DB-API tuples on account lookup",
      target: "samples/vulnerable/sql_injection/app.py:220",
      prNumber: "#55209",
      prUrl: "https://github.com/ayushkumar2601/vayu_switchup/pull/42",
      labels: [
        { text: "Bug", color: "#eb5757" },
        { text: "sql_injection", color: "#a855f7" },
      ],
      assignee: { name: "Ayush Kumar", avatar: "AK", color: "#2563eb" },
      date: "Oct 8",
    },

    // --- 2. IN PROGRESS (4) ---
    {
      id: "VAYU-2076",
      priority: "high",
      status: "in_progress",
      title: "Synthesize AST taint neutralization for subprocess execution sink",
      prNumber: "#55423",
      labels: [{ text: "Performance", color: "#27a644" }],
      workingAgent: "@vayu-remediator",
      assignee: { name: "VAYU-Remediator", avatar: "VR", color: "#f59e0b" },
      date: "Oct 6",
    },
    {
      id: "VAYU-2108",
      priority: "high",
      status: "in_progress",
      title: "Executing 4-Gate Fail-Closed Sandbox Harness on droplet ephemeral-338",
      prNumber: "#55409",
      labels: [{ text: "Sandbox", color: "#d0d6e0" }],
      workingAgent: "@vayu-gatekeeper",
      assignee: { name: "VAYU-Gatekeeper", avatar: "VG", color: "#ec4899" },
      date: "Oct 2",
    },
    {
      id: "VAYU-2143",
      priority: "high",
      status: "in_progress",
      title: "Generate SLSA Level 3 ECDSA P-256 Provenance Attestation",
      labels: [{ text: "SLSA", color: "#d0d6e0" }],
      assignee: { name: "VAYU-Remediator", avatar: "VR", color: "#f59e0b" },
      date: "Oct 7",
    },
    {
      id: "VAYU-2187",
      priority: "low",
      status: "in_progress",
      title: "Audit AST Dataflow Sinks on outbound Webhook Worker (SSRF)",
      labels: [{ text: "Bug", color: "#eb5757" }],
      workingAgent: "@vayu-analyst",
      assignee: { name: "VAYU-Analyst", avatar: "VA", color: "#3b82f6" },
      date: "Oct 5",
    },

    // --- 3. TODO (4) ---
    {
      id: "VAYU-2254",
      priority: "high",
      status: "todo",
      title: "Scan AST Sinks for Reflected XSS in Template Search Renderer",
      labels: [{ text: "AppSec", color: "#d0d6e0" }],
      assignee: { name: "Ayush Kumar", avatar: "AK", color: "#2563eb" },
      date: "Oct 10",
    },
    {
      id: "VAYU-2291",
      priority: "high",
      status: "todo",
      title: "Migrate hardcoded production JWT secret to runtime environment lookup",
      labels: [{ text: "Auth", color: "#38bdf8" }],
      assignee: { name: "VAYU-Analyst", avatar: "VA", color: "#3b82f6" },
      date: "Oct 9",
    },
    {
      id: "VAYU-2327",
      priority: "high",
      status: "todo",
      title: "Speed up CI verification harness with local FastMCP taint cache",
      labels: [{ text: "Performance", color: "#27a644" }],
      assignee: { name: "VAYU-Gatekeeper", avatar: "VG", color: "#ec4899" },
      date: "Oct 9",
    },
    {
      id: "VAYU-2358",
      priority: "high",
      status: "todo",
      title: "Validate Link-Local metadata filtering (169.254.169.254) for SSRF",
      labels: [{ text: "Reliability", color: "#38bdf8" }],
      assignee: { name: "Ayush Kumar", avatar: "AK", color: "#2563eb" },
      date: "Oct 4",
    },
  ];

  // Map live issues from SQLite
  const liveRows: IssueRow[] = liveIssues.map((issue) => {
    let status: IssueRow["status"] = "todo";
    if (issue.status === "HUMAN_REVIEW") status = "in_review";
    else if (issue.status === "PATCHING" || issue.status === "VERIFYING" || issue.status === "INVESTIGATING")
      status = "in_progress";
    else if (issue.status === "DONE") status = "done";

    return {
      id: issue.id,
      priority: issue.severity === "CRITICAL" ? "urgent" : "high",
      status,
      title: `${issue.title} (${issue.target_file}:${issue.line_number})`,
      target: `${issue.target_file}:${issue.line_number}`,
      prNumber: "#42",
      prUrl: issue.github_pr_url || "https://github.com/ayushkumar2601/vayu_switchup/pull/42",
      labels: [
        { text: issue.cwe.split(":")[0], color: "#eab308" },
        { text: issue.severity, color: issue.severity === "CRITICAL" ? "#eb5757" : "#f59e0b" },
      ],
      workingAgent: issue.assigned_agent ? `@${issue.assigned_agent}` : undefined,
      assignee: { name: "Ayush Kumar", avatar: "AK", color: "#2563eb" },
      date: "Just now",
      isLive: true,
    };
  });

  const allIssues = [...liveRows, ...defaultIssues];

  const inReviewIssues = allIssues.filter((i) => i.status === "in_review");
  const inProgressIssues = allIssues.filter((i) => i.status === "in_progress");
  const todoIssues = allIssues.filter((i) => i.status === "todo");
  const doneIssues = allIssues.filter((i) => i.status === "done");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        minHeight: "100vh",
        backgroundColor: "#010102",
        color: "#f7f8f8",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
        userSelect: "none",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* 1. TOP HEADER BAR */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px 10px",
          borderBottom: "1px solid #1c1d21",
          backgroundColor: "#010102",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        {/* LEFT: TITLE & SUB-TABS */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <h1
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#f7f8f8",
              margin: 0,
              letterSpacing: "-0.2px",
            }}
          >
            My issues
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {(["assigned", "created", "subscribed", "activity"] as const).map((tab) => {
              const isSelected = activeTab === tab;
              const labels: Record<string, string> = {
                assigned: "Assigned",
                created: "Created",
                subscribed: "Subscribed",
                activity: "Activity",
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    backgroundColor: isSelected ? "#18191a" : "transparent",
                    border: isSelected ? "1px solid #23252a" : "1px solid transparent",
                    color: isSelected ? "#f7f8f8" : "#8a8f98",
                    padding: "3px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: isSelected ? 500 : 400,
                    cursor: "pointer",
                    transition: "all 0.12s ease",
                  }}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: VIEW TOGGLES & ACTIONS */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* FILTER BUTTON */}
          <button
            title="Filter issues"
            style={{
              background: "transparent",
              border: "none",
              color: "#8a8f98",
              cursor: "pointer",
              padding: "4px 6px",
              display: "flex",
              alignItems: "center",
              borderRadius: 4,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>

          {/* DISPLAY / SORTING BUTTON */}
          <button
            title="Display options"
            style={{
              background: "transparent",
              border: "none",
              color: "#8a8f98",
              cursor: "pointer",
              padding: "4px 6px",
              display: "flex",
              alignItems: "center",
              borderRadius: 4,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
            </svg>
          </button>

          {/* VIEW SWITCHER: LIST vs BOARD */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#0f1011",
              border: "1px solid #23252a",
              borderRadius: 6,
              padding: 2,
            }}
          >
            <button
              title="List View (Active)"
              style={{
                background: "#18191a",
                border: "none",
                color: "#f7f8f8",
                padding: "3px 7px",
                borderRadius: 4,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>

            <Link
              href="/issues"
              title="Switch to 5-Column Kanban Board"
              style={{
                background: "transparent",
                border: "none",
                color: "#8a8f98",
                padding: "3px 7px",
                borderRadius: 4,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            backgroundColor: "#0d1117",
            border: "1px solid rgba(56, 189, 248, 0.4)",
            borderRadius: 8,
            padding: "12px 16px",
            color: "#f7f8f8",
            fontSize: 12.5,
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ color: "#27a644", fontSize: 14 }}>✓</span>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: "transparent", border: "none", color: "#62666d", cursor: "pointer", marginLeft: 8 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. MAIN ISSUE GROUPS CONTAINER */}
      <main style={{ flex: 1, padding: "8px 24px 48px", maxWidth: 1440, width: "100%", margin: "0 auto" }}>
        {/* GROUP 1: IN REVIEW */}
        <IssueGroup
          title="In Review"
          count={inReviewIssues.length}
          statusKey="in_review"
          collapsed={!!collapsedGroups["in_review"]}
          onToggle={() => toggleGroup("in_review")}
          statusIcon={
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: "rgba(39, 166, 68, 0.2)",
                border: "1.5px solid #27a644",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#27a644" }} />
            </div>
          }
          issues={inReviewIssues}
          onApprove={handleApprove}
          approvingId={approvingId}
        />

        {/* GROUP 2: IN PROGRESS */}
        <IssueGroup
          title="In Progress"
          count={inProgressIssues.length}
          statusKey="in_progress"
          collapsed={!!collapsedGroups["in_progress"]}
          onToggle={() => toggleGroup("in_progress")}
          statusIcon={
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "1.5px solid #eab308",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderTop: "3px solid #eab308",
                  borderRight: "3px solid #eab308",
                  borderBottom: "3px solid transparent",
                  borderLeft: "3px solid transparent",
                  borderRadius: "50%",
                }}
              />
            </div>
          }
          issues={inProgressIssues}
          onApprove={handleApprove}
          approvingId={approvingId}
        />

        {/* GROUP 3: TODO */}
        <IssueGroup
          title="Todo"
          count={todoIssues.length}
          statusKey="todo"
          collapsed={!!collapsedGroups["todo"]}
          onToggle={() => toggleGroup("todo")}
          statusIcon={
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "1.5px solid #62666d",
              }}
            />
          }
          issues={todoIssues}
          onApprove={handleApprove}
          approvingId={approvingId}
        />

        {/* GROUP 4: DONE (RESOLVED & VERIFIED) */}
        {doneIssues.length > 0 && (
          <IssueGroup
            title="Done"
            count={doneIssues.length}
            statusKey="done"
            collapsed={!!collapsedGroups["done"]}
            onToggle={() => toggleGroup("done")}
            statusIcon={
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  backgroundColor: "#5e6ad2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                }}
              >
                ✓
              </div>
            }
            issues={doneIssues}
            onApprove={handleApprove}
            approvingId={approvingId}
          />
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------------
// SUB-COMPONENT: GROUP SECTION (Matching the Collapsible Linear Header in Screenshot)
// ---------------------------------------------------------------------------------
function IssueGroup({
  title,
  count,
  statusIcon,
  collapsed,
  onToggle,
  issues,
  onApprove,
  approvingId,
}: {
  title: string;
  count: number;
  statusKey: string;
  statusIcon: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  issues: IssueRow[];
  onApprove: (id: string) => void;
  approvingId: string | null;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      {/* GROUP HEADER ROW */}
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 10px",
          cursor: "pointer",
          borderRadius: 6,
          transition: "background 0.12s ease",
        }}
      >
        <span
          style={{
            fontSize: 9,
            color: "#62666d",
            transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
            display: "inline-block",
          }}
        >
          ▼
        </span>

        {statusIcon}

        <span
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: "#f7f8f8",
            letterSpacing: "-0.1px",
          }}
        >
          {title}
        </span>

        <span
          style={{
            fontSize: 12,
            color: "#62666d",
            marginLeft: 2,
          }}
        >
          {count}
        </span>
      </div>

      {/* ISSUE ROWS LIST */}
      {!collapsed && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {issues.map((issue) => (
            <IssueItemRow
              key={issue.id}
              issue={issue}
              onApprove={() => onApprove(issue.id)}
              isApproving={approvingId === issue.id}
            />
          ))}
          {issues.length === 0 && (
            <div
              style={{
                padding: "12px 28px",
                fontSize: 12,
                color: "#62666d",
                fontStyle: "italic",
              }}
            >
              No issues in this state.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------
// SUB-COMPONENT: INDIVIDUAL ISSUE ROW (Pixel-Perfect Linear Row from Screenshot)
// ---------------------------------------------------------------------------------
function IssueItemRow({
  issue,
  onApprove,
  isApproving,
}: {
  issue: IssueRow;
  onApprove: () => void;
  isApproving: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "7px 12px",
        height: 38,
        borderBottom: "1px solid #141516",
        backgroundColor: hovered ? "#0f1011" : "transparent",
        borderRadius: 4,
        transition: "background 0.1s ease",
      }}
    >
      {/* LEFT SECTION: PRIORITY, KEY, STATUS GLYPH, TITLE */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          minWidth: 0,
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* PRIORITY ICON (3 BARS) */}
        <PriorityBars priority={issue.priority} />

        {/* ISSUE KEY */}
        <span
          style={{
            fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
            fontSize: 11.5,
            color: "#8a8f98",
            minWidth: 72,
            flexShrink: 0,
          }}
        >
          {issue.id}
        </span>

        {/* STATUS ICON */}
        <RowStatusIcon status={issue.status} />

        {/* TITLE */}
        <Link
          href={`/reviews?id=${issue.id}`}
          style={{
            fontSize: 13,
            fontWeight: 450,
            color: hovered ? "#5e6ad2" : "#f7f8f8",
            textDecoration: "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            transition: "color 0.12s ease",
          }}
          title={issue.title}
        >
          {issue.title}
        </Link>
      </div>

      {/* RIGHT SECTION: PR BADGE, LABELS, WORKING AGENT, ASSIGNEE AVATAR, DATE */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
          marginLeft: 16,
        }}
      >
        {/* QUICK APPROVE BUTTON ON HOVER (FOR IN REVIEW TICKETS) */}
        {issue.status === "in_review" && hovered && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onApprove();
            }}
            disabled={isApproving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              backgroundColor: "#27a644",
              border: "none",
              color: "#ffffff",
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 4,
              cursor: isApproving ? "not-allowed" : "pointer",
              boxShadow: "0 0 8px rgba(39, 166, 68, 0.4)",
            }}
            title="Authorize Remediation and Ship GitHub PR"
          >
            {isApproving ? "Approving..." : "👍 Approve"}
          </button>
        )}

        {/* GIT PR BADGE (e.g. ⑂ #54910) */}
        {issue.prNumber && (
          <a
            href={issue.prUrl || "https://github.com/ayushkumar2601/vayu_switchup/pull/42"}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 6px",
              borderRadius: 4,
              backgroundColor: "rgba(94, 106, 210, 0.1)",
              border: "1px solid rgba(94, 106, 210, 0.25)",
              color: "#828fff",
              fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace',
              textDecoration: "none",
              transition: "all 0.12s ease",
            }}
            title="View Pull Request on GitHub"
          >
            <span style={{ fontSize: 10 }}>⑂</span>
            <span>{issue.prNumber}</span>
          </a>
        )}

        {/* LABELS / CATEGORIES WITH DOT */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {issue.labels.map((lbl, idx) => (
            <div
              key={idx}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "2px 8px",
                borderRadius: 9999,
                backgroundColor: "#141516",
                border: "1px solid #23252a",
                fontSize: 11,
                color: "#d0d6e0",
                whiteSpace: "nowrap",
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  backgroundColor: lbl.color,
                }}
              />
              <span>{lbl.text}</span>
            </div>
          ))}
        </div>

        {/* LIVE WORKING AGENT PILL (e.g. Working... @avatar) */}
        {issue.workingAgent && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "2px 8px",
              borderRadius: 9999,
              backgroundColor: "#141516",
              border: "1px solid #23252a",
              fontSize: 11,
              color: "#8a8f98",
            }}
            title={`Autonomous Agent Active: ${issue.workingAgent}`}
          >
            <span>Working...</span>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: "#5e6ad2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 8,
                color: "#fff",
                fontWeight: 700,
              }}
            >
              @
            </div>
          </div>
        )}

        {/* ASSIGNEE AVATAR */}
        <div
          title={issue.assignee.name}
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            backgroundColor: issue.assignee.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 700,
            color: "#ffffff",
            border: "1px solid #010102",
          }}
        >
          {issue.assignee.avatar}
        </div>

        {/* DATE / TIMESTAMP */}
        <span
          style={{
            fontSize: 11.5,
            color: "#62666d",
            minWidth: 46,
            textAlign: "right",
          }}
        >
          {issue.date}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------
// SUB-COMPONENT: PRIORITY BARS (3 BARS ICON MATCHING LINEAR)
// ---------------------------------------------------------------------------------
function PriorityBars({ priority }: { priority: IssueRow["priority"] }) {
  const getBarsColor = () => {
    switch (priority) {
      case "urgent":
        return "#eb5757";
      case "high":
        return "#f7f8f8";
      case "medium":
        return "#8a8f98";
      case "low":
      default:
        return "#62666d";
    }
  };

  const activeColor = getBarsColor();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 1.5,
        width: 12,
        height: 12,
        flexShrink: 0,
      }}
      title={`Priority: ${priority}`}
    >
      <div style={{ width: 2, height: 4, backgroundColor: activeColor, borderRadius: 0.5 }} />
      <div
        style={{
          width: 2,
          height: 8,
          backgroundColor: priority === "low" ? "#23252a" : activeColor,
          borderRadius: 0.5,
        }}
      />
      <div
        style={{
          width: 2,
          height: 12,
          backgroundColor: priority === "low" || priority === "medium" ? "#23252a" : activeColor,
          borderRadius: 0.5,
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------------
// SUB-COMPONENT: ROW STATUS ICON (Green check, Yellow half-circle, Hollow circle)
// ---------------------------------------------------------------------------------
function RowStatusIcon({ status }: { status: IssueRow["status"] }) {
  if (status === "in_review") {
    return (
      <div
        style={{
          width: 13,
          height: 13,
          borderRadius: "50%",
          backgroundColor: "rgba(39, 166, 68, 0.2)",
          border: "1.5px solid #27a644",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        title="In Review"
      >
        <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#27a644" }} />
      </div>
    );
  }

  if (status === "in_progress") {
    return (
      <div
        style={{
          width: 13,
          height: 13,
          borderRadius: "50%",
          border: "1.5px solid #eab308",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        title="In Progress"
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderTop: "2.5px solid #eab308",
            borderRight: "2.5px solid #eab308",
            borderBottom: "2.5px solid transparent",
            borderLeft: "2.5px solid transparent",
            borderRadius: "50%",
          }}
        />
      </div>
    );
  }

  if (status === "done") {
    return (
      <div
        style={{
          width: 13,
          height: 13,
          borderRadius: "50%",
          backgroundColor: "#5e6ad2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontSize: 8,
          fontWeight: 700,
          flexShrink: 0,
        }}
        title="Done"
      >
        ✓
      </div>
    );
  }

  // Todo / Backlog
  return (
    <div
      style={{
        width: 13,
        height: 13,
        borderRadius: "50%",
        border: "1.5px solid #62666d",
        flexShrink: 0,
      }}
      title="Todo"
    />
  );
}
