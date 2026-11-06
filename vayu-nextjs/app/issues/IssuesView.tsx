"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";

export type ColumnId = "inbox" | "up_next" | "in_progress" | "review" | "done";

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

export interface KanbanCard {
  id: string;
  columnId: ColumnId;
  timeAgo: string;
  title: string;
  author: string;
  authorInitial: string;
  comment?: string;
  tag: string;
  tagColor: "blue" | "purple" | "orange" | "salmon" | "indigo" | "pink";
  hasApprove?: boolean;
  isDone?: boolean;
  prUrl?: string;
  isLive?: boolean;
  liveIssueId?: string;
}

// Clean short file representation: extracts filename and line, removing long absolute paths
function getShortFile(path?: string, line?: number): string {
  if (!path) return "app.py";
  const parts = path.split("/").filter(Boolean);
  const file = parts[parts.length - 1] || "app.py";
  return line ? `${file}:${line}` : file;
}

// Clean concise title for live tickets
function formatLiveTitle(issue: SecurityIssue): string {
  let clean = issue.title.replace(/^Vulnerability in [^()]+\(/i, "").replace(/\)$/, "").trim();
  const file = getShortFile(issue.target_file);
  if (!clean || clean.length < 3) clean = "Subprocess Shell True";

  if (clean.toLowerCase().includes("subprocess") || clean.toLowerCase().includes("command")) {
    return `Fix Command Injection (${file})`;
  }
  if (clean.toLowerCase().includes("traversal") || clean.toLowerCase().includes("file")) {
    return `Directory Traversal in ${file}`;
  }
  if (clean.toLowerCase().includes("sql") || clean.toLowerCase().includes("sqlite")) {
    return `SQL Injection in ${file}`;
  }
  return `${clean} in ${file}`;
}

// Short, punchy statement for live tickets matching Mast/Linear reference
function formatLiveStatement(issue: SecurityIssue, col: ColumnId): string {
  const loc = getShortFile(issue.target_file, issue.line_number);
  switch (col) {
    case "inbox":
      return `AST taint detected in ${loc}. Queued for triage.`;
    case "up_next":
      return `Taint flow mapped in ${loc}. Ready for patch synthesis.`;
    case "in_progress":
      return `Synthesizing fix for ${loc}. 4-gate sandbox active.`;
    case "review":
      return `All 4 gates passed. SLSA Level 3 signed. Needs lead sign-off.`;
    case "done":
      return `Remediated and verified in ${loc}. PR #42 merged.`;
    default:
      return `Security check active on ${loc}.`;
  }
}

// Default base cards matching the Mast / Linear design screenshot
const INITIAL_DEFAULT_CARDS: KanbanCard[] = [
  // --- INBOX ---
  {
    id: "inbox-1",
    columnId: "inbox",
    timeAgo: "Added 2 days ago",
    title: "UI toggle for event blocks.",
    author: "Glenn Jones",
    authorInitial: "G",
    comment: "Minor UI: can we show 3 blocks without seats?",
    tag: "Cuebox",
    tagColor: "blue",
  },
  {
    id: "inbox-2",
    columnId: "inbox",
    timeAgo: "Added 5 days ago",
    title: "Page loading clarification needed.",
    author: "Leandro Varanda",
    authorInitial: "L",
    comment: "@dave clarify which pages load on Notifications click?",
    tag: "Rev",
    tagColor: "orange",
  },

  // --- UP NEXT ---
  {
    id: "upnext-1",
    columnId: "up_next",
    timeAgo: "Added 1 day ago",
    title: "Update Ticket Designs in Mock.",
    author: "Brantley Mathis",
    authorInitial: "B",
    comment: "@prakash please update ticket designs to match styling.",
    tag: "Mast",
    tagColor: "purple",
  },
  {
    id: "upnext-2",
    columnId: "up_next",
    timeAgo: "Added 2 days ago",
    title: "Revert to Pop Over Version",
    author: "Dream Tucker",
    authorInitial: "D",
    comment: "Talked to the engs, can we revert to popover from before?",
    tag: "Cuebox",
    tagColor: "blue",
  },
  {
    id: "upnext-3",
    columnId: "up_next",
    timeAgo: "Added 2 days ago",
    title: "Polish designs and reach out to devs",
    author: "Design Lead",
    authorInitial: "D",
    tag: "Dabble",
    tagColor: "indigo",
  },
  {
    id: "upnext-4",
    columnId: "up_next",
    timeAgo: "Added 3 days ago",
    title: "Remote user approvals/comments",
    author: "Product Ops",
    authorInitial: "P",
    tag: "Giraffe",
    tagColor: "orange",
  },
  {
    id: "upnext-5",
    columnId: "up_next",
    timeAgo: "Added 4 days ago",
    title: "Redo landing page for Sono Dojo",
    author: "Marketing",
    authorInitial: "M",
    tag: "LaunchPad",
    tagColor: "pink",
  },

  // --- IN PROGRESS ---
  {
    id: "inprog-1",
    columnId: "in_progress",
    timeAgo: "Added 2 days ago",
    title: "Include lien waiver statement.",
    author: "Ivan Erickson",
    authorInitial: "I",
    comment: "Questionnaire statement for lien waiver should show here.",
    tag: "Bluejay",
    tagColor: "blue",
  },
  {
    id: "inprog-2",
    columnId: "in_progress",
    timeAgo: "Added 2 days ago",
    title: "Button Styling Concerns",
    author: "Tori Bates",
    authorInitial: "T",
    comment: "Review hover padding and radius on secondary buttons.",
    tag: "Mast",
    tagColor: "purple",
  },

  // --- REVIEW ---
  {
    id: "rev-1",
    columnId: "review",
    timeAgo: "Submitted for review 1 hour ago",
    title: "Add Search Bar.",
    author: "Sabrina Deleon",
    authorInitial: "S",
    comment: "We need to add a search bar here. In case of permalink.",
    tag: "Rev",
    tagColor: "orange",
    hasApprove: true,
  },
  {
    id: "rev-2",
    columnId: "review",
    timeAgo: "Submitted for review 3 hours ago",
    title: "Update Material Editor Info.",
    author: "Ellis Ochoa",
    authorInitial: "E",
    comment: "Need to update info on the material editor page.",
    tag: "Wayland",
    tagColor: "salmon",
    hasApprove: true,
  },
  {
    id: "rev-3",
    columnId: "review",
    timeAgo: "Submitted for review 3 hours ago",
    title: "Add Membership Renewal Button.",
    author: "Glenn Jones",
    authorInitial: "G",
    comment: "Major UX: add button for renewal / flex pass.",
    tag: "Cuebox",
    tagColor: "blue",
    hasApprove: true,
  },

  // --- DONE ---
  {
    id: "done-1",
    columnId: "done",
    timeAgo: "Completed 3 days ago",
    title: "Feedback Screen Implementation",
    author: "Ellis Ochoa",
    authorInitial: "E",
    comment: "Feedback widget integrated into checkout flow.",
    tag: "Wayland",
    tagColor: "salmon",
    isDone: true,
    prUrl: "https://github.com/ayushkumar2601/vayu_switchup/pull/42",
  },
];

export default function IssuesView() {
  const [issues, setIssues] = useState<SecurityIssue[]>([]);
  const [, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [showWisprModal, setShowWisprModal] = useState(false);

  // Drag and drop state
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ColumnId | null>(null);

  // Position overrides for moved cards (persists moves across both default and live cards)
  const [overrides, setOverrides] = useState<Record<string, ColumnId>>({});

  const fetchIssues = async () => {
    try {
      const res = await fetch("/api/issues");
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
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
      setOverrides({});
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

  const handleApproveIssue = async (cardId: string, issueId?: string) => {
    setApprovingId(cardId);
    try {
      if (issueId) {
        const res = await fetch("/api/issues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "approve", issue_id: issueId, approver: "Ayush Kumar (Lead)" }),
        });
        if (res.ok) {
          await fetchIssues();
        }
      }
      // Optimistically move card to 'done' column
      setOverrides((prev) => ({ ...prev, [cardId]: "done" }));
    } catch (err) {
      console.error("Failed to approve issue:", err);
    } finally {
      setApprovingId(null);
    }
  };

  // Convert live issues into KanbanCard models
  const liveCards: KanbanCard[] = useMemo(() => {
    return issues.map((issue) => {
      let naturalCol: ColumnId = "inbox";
      if (issue.status === "DONE") naturalCol = "done";
      else if (issue.status === "HUMAN_REVIEW") naturalCol = "review";
      else if (issue.status === "PATCHING" || issue.status === "VERIFYING") naturalCol = "in_progress";
      else if (issue.status === "INVESTIGATING") naturalCol = "up_next";
      else naturalCol = "inbox";

      const effectiveCol = overrides[issue.id] || naturalCol;
      const shortLoc = getShortFile(issue.target_file, issue.line_number);

      const tag = issue.cwe.toLowerCase().includes("path")
        ? "path_traversal"
        : issue.cwe.toLowerCase().includes("sql")
        ? "sql_injection"
        : "command_injection";

      const tagColor: KanbanCard["tagColor"] = issue.cwe.toLowerCase().includes("path")
        ? "orange"
        : issue.cwe.toLowerCase().includes("sql")
        ? "purple"
        : "blue";

      return {
        id: issue.id,
        columnId: effectiveCol,
        isLive: true,
        liveIssueId: issue.id,
        timeAgo: issue.status === "DONE" ? "Completed recently" : "Added 2h ago",
        title: formatLiveTitle(issue),
        author: issue.assigned_agent || (effectiveCol === "review" ? "vayu-gatekeeper" : "vayu-remediator"),
        authorInitial: effectiveCol === "review" ? "G" : "V",
        comment: formatLiveStatement(issue, effectiveCol),
        tag: tag,
        tagColor: tagColor,
        hasApprove: effectiveCol === "review",
        isDone: effectiveCol === "done",
        prUrl: issue.github_pr_url || (effectiveCol === "done" ? "https://github.com/ayushkumar2601/vayu_switchup/pull/42" : undefined),
      };
    });
  }, [issues, overrides]);

  // Combine default mock cards (with user drag overrides applied)
  const defaultCardsWithOverrides: KanbanCard[] = useMemo(() => {
    return INITIAL_DEFAULT_CARDS.map((card) => {
      const effectiveCol = overrides[card.id] || card.columnId;
      return {
        ...card,
        columnId: effectiveCol,
        hasApprove: effectiveCol === "review",
        isDone: effectiveCol === "done",
        prUrl: effectiveCol === "done" ? (card.prUrl || "https://github.com/ayushkumar2601/vayu_switchup/pull/42") : undefined,
      };
    });
  }, [overrides]);

  // All cards combined
  const allCards = useMemo(() => {
    return [...liveCards, ...defaultCardsWithOverrides];
  }, [liveCards, defaultCardsWithOverrides]);

  // Group cards by column
  const columnsData = useMemo(() => {
    const cols: Record<ColumnId, KanbanCard[]> = {
      inbox: [],
      up_next: [],
      in_progress: [],
      review: [],
      done: [],
    };
    allCards.forEach((c) => {
      if (cols[c.columnId]) {
        cols[c.columnId].push(c);
      }
    });
    return cols;
  }, [allCards]);

  // Drag and Drop event handlers
  const handleDragStart = (e: React.DragEvent, cardId: string, fromCol: ColumnId) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ cardId, fromCol }));
    e.dataTransfer.effectAllowed = "move";
    setDraggedCardId(cardId);
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colId: ColumnId) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverCol === colId) {
      setDragOverCol(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetCol: ColumnId) => {
    e.preventDefault();
    setDragOverCol(null);
    setDraggedCardId(null);

    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    try {
      const { cardId, fromCol } = JSON.parse(raw);
      if (fromCol === targetCol) return;

      // Optimistically move card
      setOverrides((prev) => ({ ...prev, [cardId]: targetCol }));

      // If it's a live issue, update SQLite via /api/issues
      const foundLive = issues.find((i) => i.id === cardId);
      if (foundLive) {
        let backendStatus = "BACKLOG";
        if (targetCol === "done") backendStatus = "DONE";
        else if (targetCol === "review") backendStatus = "HUMAN_REVIEW";
        else if (targetCol === "in_progress") backendStatus = "PATCHING";
        else if (targetCol === "up_next") backendStatus = "INVESTIGATING";
        else backendStatus = "BACKLOG";

        await fetch("/api/issues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_status",
            issue_id: cardId,
            status: backendStatus,
            actor: "Ayush Kumar (Lead)",
          }),
        });
      }
    } catch (err) {
      console.error("Drop handling error:", err);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#010102",
        color: "#f7f8f8",
        padding: "24px 28px 36px 28px",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
        overflowX: "hidden",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* TOP HEADER */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 22,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* LEFT: TITLE & SUBHEAD */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: "#f7f8f8",
              letterSpacing: "-0.4px",
              margin: 0,
            }}
          >
            Everything
          </h1>
          <span style={{ fontSize: 12, color: "#62666d", fontWeight: 400 }}>
            {allCards.length} issues across 5 stages
          </span>
        </div>

        {/* RIGHT: CONTROLS & AVATARS */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* ALL PILL */}
          <button
            style={{
              backgroundColor: "#141516",
              border: "1px solid #23252a",
              color: "#d0d6e0",
              padding: "4px 12px",
              borderRadius: 9999,
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            All
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
            <Link
              href="/my-issues"
              title="Switch to Linear Grouped List View"
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
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </Link>

            <button
              title="Board View (Active)"
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
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
            </button>
          </div>

          {/* OVERLAPPING AVATARS */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              title="Ayush Kumar (Lead)"
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                backgroundColor: "#2563eb",
                border: "2px solid #010102",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 600,
                color: "#fff",
                zIndex: 5,
              }}
            >
              A
            </div>
            <div
              title="VAYU-Analyst"
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                backgroundColor: "#3b82f6",
                border: "2px solid #010102",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 600,
                color: "#fff",
                marginLeft: -6,
                zIndex: 4,
              }}
            >
              A
            </div>
            <div
              title="VAYU-Remediator"
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                backgroundColor: "#f59e0b",
                border: "2px solid #010102",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 600,
                color: "#fff",
                marginLeft: -6,
                zIndex: 3,
              }}
            >
              R
            </div>
            <div
              title="VAYU-Gatekeeper"
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                backgroundColor: "#ec4899",
                border: "2px solid #010102",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 600,
                color: "#fff",
                marginLeft: -6,
                zIndex: 2,
              }}
            >
              G
            </div>
            <div
              title="Switch Daemon"
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                backgroundColor: "#10b981",
                border: "2px solid #010102",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 600,
                color: "#fff",
                marginLeft: -6,
                zIndex: 1,
              }}
            >
              S
            </div>
          </div>

          {/* SIMULATE SCAN / + INCIDENT */}
          <button
            onClick={handleSimulateScan}
            disabled={isScanning}
            style={{
              backgroundColor: "#0f1011",
              border: "1px solid #23252a",
              color: "#d0d6e0",
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {isScanning ? "Scanning..." : "+ Incident"}
          </button>

          {/* CLEAR */}
          <button
            onClick={handleClearBoard}
            title="Reset board & clear live issues"
            style={{
              backgroundColor: "#0f1011",
              border: "1px solid #23252a",
              color: "#8a8f98",
              padding: "4px 8px",
              borderRadius: 6,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Clear
          </button>

          {/* REFRESH */}
          <button
            onClick={fetchIssues}
            title="Refresh issues"
            style={{
              backgroundColor: "#0f1011",
              border: "1px solid #23252a",
              color: "#8a8f98",
              padding: "4px 8px",
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
              backgroundColor: "rgba(94, 106, 210, 0.15)",
              border: "1px solid rgba(94, 106, 210, 0.4)",
              color: "#828fff",
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            🎙️ Wispr Flow
          </button>
        </div>
      </header>

      {/* 5-COLUMN DRAGGABLE KANBAN BOARD */}
      <main
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 12,
          alignItems: "start",
          width: "100%",
          minWidth: 0,
        }}
      >
        {/* ================= COLUMN 1: INBOX ================= */}
        <KanbanColumn
          colId="inbox"
          title="Inbox"
          cards={columnsData.inbox}
          isDragOver={dragOverCol === "inbox"}
          draggedCardId={draggedCardId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, "inbox")}
          onDragLeave={(e) => handleDragLeave(e, "inbox")}
          onDrop={(e) => handleDrop(e, "inbox")}
          onApprove={(card) => handleApproveIssue(card.id, card.liveIssueId)}
          approvingId={approvingId}
        />

        {/* ================= COLUMN 2: UP NEXT ================= */}
        <KanbanColumn
          colId="up_next"
          title="Up Next"
          cards={columnsData.up_next}
          isDragOver={dragOverCol === "up_next"}
          draggedCardId={draggedCardId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, "up_next")}
          onDragLeave={(e) => handleDragLeave(e, "up_next")}
          onDrop={(e) => handleDrop(e, "up_next")}
          onApprove={(card) => handleApproveIssue(card.id, card.liveIssueId)}
          approvingId={approvingId}
        />

        {/* ================= COLUMN 3: IN PROGRESS ================= */}
        <KanbanColumn
          colId="in_progress"
          title="In Progress"
          cards={columnsData.in_progress}
          isDragOver={dragOverCol === "in_progress"}
          draggedCardId={draggedCardId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, "in_progress")}
          onDragLeave={(e) => handleDragLeave(e, "in_progress")}
          onDrop={(e) => handleDrop(e, "in_progress")}
          onApprove={(card) => handleApproveIssue(card.id, card.liveIssueId)}
          approvingId={approvingId}
        />

        {/* ================= COLUMN 4: REVIEW ================= */}
        <KanbanColumn
          colId="review"
          title="Review"
          cards={columnsData.review}
          isDragOver={dragOverCol === "review"}
          draggedCardId={draggedCardId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, "review")}
          onDragLeave={(e) => handleDragLeave(e, "review")}
          onDrop={(e) => handleDrop(e, "review")}
          onApprove={(card) => handleApproveIssue(card.id, card.liveIssueId)}
          approvingId={approvingId}
        />

        {/* ================= COLUMN 5: DONE ================= */}
        <KanbanColumn
          colId="done"
          title="Done"
          cards={columnsData.done}
          isDragOver={dragOverCol === "done"}
          draggedCardId={draggedCardId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, "done")}
          onDragLeave={(e) => handleDragLeave(e, "done")}
          onDrop={(e) => handleDrop(e, "done")}
          onApprove={(card) => handleApproveIssue(card.id, card.liveIssueId)}
          approvingId={approvingId}
        />
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
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(4px)",
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
              backgroundColor: "#0f1011",
              border: "1px solid #23252a",
              borderRadius: 8,
              maxWidth: 580,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 22,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.9)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "#f7f8f8", margin: 0 }}>
                  Code with Wispr Flow — Voice-Driven SecOps
                </h2>
                <p style={{ fontSize: 11, color: "#828fff", margin: "4px 0 0 0" }}>
                  Flip the Switch Hackathon • $500 Wispr Flow Track
                </p>
              </div>
              <button
                onClick={() => setShowWisprModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#8a8f98",
                  fontSize: 16,
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
                gap: 10,
                marginBottom: 16,
                backgroundColor: "#141516",
                padding: 12,
                borderRadius: 6,
                border: "1px solid #23252a",
              }}
            >
              <div>
                <div style={{ fontSize: 10, color: "#8a8f98" }}>Words Spoken</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: "#f7f8f8" }}>1,840</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#8a8f98" }}>Speedup Multiplier</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: "#828fff" }}>3.2x</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#8a8f98" }}>Dictation Accuracy</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: "#27a644" }}>99.4%</div>
              </div>
            </div>

            {/* NATURAL VOICE COMMANDS */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#d0d6e0", marginBottom: 6 }}>
                🗣️ Dictated Voice Triggers:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ backgroundColor: "#141516", padding: 8, borderRadius: 6, border: "1px solid #23252a" }}>
                  <span style={{ fontSize: 10, color: "#8a8f98", display: "block" }}>Security Investigation:</span>
                  <code style={{ fontSize: 11, color: "#f7f8f8", fontFamily: "monospace" }}>
                    &ldquo;Vayu, please check the code for any vulnerabilities before raising a PR on GitHub.&rdquo;
                  </code>
                </div>
                <div style={{ backgroundColor: "#141516", padding: 8, borderRadius: 6, border: "1px solid #23252a" }}>
                  <span style={{ fontSize: 10, color: "#8a8f98", display: "block" }}>Human Release Sign-off:</span>
                  <code style={{ fontSize: 11, color: "#f7f8f8", fontFamily: "monospace" }}>
                    &ldquo;Vayu, the fix looks good across all four gates, please approve and ship the pull request.&rdquo;
                  </code>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 11, color: "#62666d" }}>
              Full transcripts and demo script located at <strong>docs/WISPR_VOICE_SCRIPT.md</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// KANBAN COLUMN COMPONENT (DRAG TARGET)
// ==============================================================================
function KanbanColumn({
  colId,
  title,
  cards,
  isDragOver,
  draggedCardId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onApprove,
  approvingId,
}: {
  colId: ColumnId;
  title: string;
  cards: KanbanCard[];
  isDragOver: boolean;
  draggedCardId: string | null;
  onDragStart: (e: React.DragEvent, cardId: string, fromCol: ColumnId) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onApprove: (card: KanbanCard) => void;
  approvingId: string | null;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        width: "100%",
        padding: 6,
        borderRadius: 8,
        backgroundColor: isDragOver ? "rgba(94, 106, 210, 0.05)" : "transparent",
        border: isDragOver ? "1px dashed rgba(94, 106, 210, 0.5)" : "1px solid transparent",
        transition: "background-color 0.15s ease, border-color 0.15s ease",
        boxSizing: "border-box",
      }}
    >
      {/* COLUMN HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12,
          paddingLeft: 4,
          paddingRight: 4,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: "#d0d6e0" }}>{title}</span>
        <span style={{ fontSize: 12, color: "#62666d" }}>{cards.length}</span>
      </div>

      {/* CARDS LIST */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          minHeight: 120,
        }}
      >
        {cards.map((card) => (
          <KanbanCardItem
            key={card.id}
            card={card}
            isBeingDragged={draggedCardId === card.id}
            onDragStart={(e) => onDragStart(e, card.id, colId)}
            onDragEnd={onDragEnd}
            onApprove={() => onApprove(card)}
            isApproving={approvingId === card.id}
          />
        ))}

        {cards.length === 0 && (
          <div
            style={{
              padding: "24px 12px",
              textAlign: "center",
              fontSize: 11,
              color: "#62666d",
              border: "1px dashed #23252a",
              borderRadius: 6,
            }}
          >
            Drag issues here
          </div>
        )}
      </div>
    </div>
  );
}

// ==============================================================================
// KANBAN CARD ITEM (DRAGGABLE ITEM)
// ==============================================================================
function KanbanCardItem({
  card,
  isBeingDragged,
  onDragStart,
  onDragEnd,
  onApprove,
  isApproving,
}: {
  card: KanbanCard;
  isBeingDragged: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onApprove?: () => void;
  isApproving?: boolean;
}) {
  const getTagStyle = (color: KanbanCard["tagColor"]) => {
    switch (color) {
      case "blue":
        return { bg: "#131f33", text: "#60a5fa", border: "#1e3a8a" };
      case "purple":
        return { bg: "#201530", text: "#c084fc", border: "#3b1d60" };
      case "orange":
        return { bg: "#2a170e", text: "#fb923c", border: "#542914" };
      case "salmon":
        return { bg: "#2c1218", text: "#f87171", border: "#5c1d29" };
      case "indigo":
        return { bg: "#151b36", text: "#818cf8", border: "#252d5e" };
      case "pink":
        return { bg: "#2d1325", text: "#f472b6", border: "#5c1e48" };
      default:
        return { bg: "#141516", text: "#d0d6e0", border: "#23252a" };
    }
  };

  const tagStyle = getTagStyle(card.tagColor);

  return (
    <div
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        backgroundColor: "#0f1011",
        border: "1px solid #23252a",
        borderRadius: 8,
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 7,
        minWidth: 0,
        maxWidth: "100%",
        overflow: "hidden",
        cursor: "grab",
        opacity: isBeingDragged ? 0.35 : 1,
        transform: isBeingDragged ? "scale(0.98)" : "none",
        transition: "border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease",
        boxSizing: "border-box",
      }}
      onMouseEnter={(e) => {
        if (!isBeingDragged) {
          e.currentTarget.style.borderColor = "#34343a";
          e.currentTarget.style.backgroundColor = "#111213";
        }
      }}
      onMouseLeave={(e) => {
        if (!isBeingDragged) {
          e.currentTarget.style.borderColor = "#23252a";
          e.currentTarget.style.backgroundColor = "#0f1011";
        }
      }}
    >
      {/* TIMESTAMP & DRAG HANDLE */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#62666d",
          minWidth: 0,
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {card.timeAgo}
        </span>
        <span
          title="Drag to move card"
          style={{
            fontSize: 10,
            color: "#3e3e44",
            letterSpacing: -1,
            userSelect: "none",
            cursor: "grab",
          }}
        >
          ⋮⋮
        </span>
      </div>

      {/* TITLE */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "#f7f8f8",
          lineHeight: 1.35,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {card.title}
      </div>

      {/* INSET QUOTE / COMMENT BOX */}
      {card.comment && (
        <div
          style={{
            backgroundColor: "#141516",
            border: "1px solid #23252a",
            borderRadius: 6,
            padding: "7px 9px",
            display: "flex",
            gap: 7,
            alignItems: "flex-start",
            minWidth: 0,
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: "#23252a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 500,
              color: "#d0d6e0",
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            {card.authorInitial}
          </div>
          <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#d0d6e0",
                marginBottom: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {card.author}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#8a8f98",
                lineHeight: 1.4,
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}
            >
              {card.comment}
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM ROW: TAG PILL */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2, minWidth: 0 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            padding: "2px 8px",
            borderRadius: 9999,
            backgroundColor: tagStyle.bg,
            color: tagStyle.text,
            border: `1px solid ${tagStyle.border}`,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              backgroundColor: tagStyle.text,
              flexShrink: 0,
            }}
          />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {card.tag}
          </span>
        </span>
      </div>

      {/* SPECIAL APPROVE BUTTON (IN REVIEW COLUMN) */}
      {card.hasApprove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onApprove?.();
          }}
          disabled={isApproving}
          style={{
            marginTop: 3,
            width: "100%",
            padding: "5px 0",
            borderRadius: 6,
            border: "1px solid #1c4527",
            backgroundColor: "rgba(39, 166, 68, 0.08)",
            color: "#4ade80",
            fontSize: 11,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            transition: "background 0.15s, border 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(39, 166, 68, 0.16)";
            e.currentTarget.style.borderColor = "#27a644";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(39, 166, 68, 0.08)";
            e.currentTarget.style.borderColor = "#1c4527";
          }}
        >
          <span>👍</span> {isApproving ? "Approving..." : "Approve"}
        </button>
      )}

      {/* SPECIAL DONE LINK (IN DONE COLUMN) */}
      {card.isDone && card.prUrl && (
        <a
          href={card.prUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 11,
            color: "#828fff",
            textDecoration: "none",
            marginTop: 2,
            display: "inline-block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          GitHub PR #42 ↗
        </a>
      )}
    </div>
  );
}
