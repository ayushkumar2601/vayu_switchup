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

interface MockCard {
  id: string;
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
}

export default function IssuesView() {
  const [issues, setIssues] = useState<SecurityIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [showWisprModal, setShowWisprModal] = useState(false);

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

  // Live issue categorizations
  const liveInProgress = issues.filter((i) => i.status === "PATCHING" || i.status === "VERIFYING");
  const liveInReview = issues.filter((i) => i.status === "HUMAN_REVIEW");
  const liveDone = issues.filter((i) => i.status === "DONE");
  const liveInbox = issues.filter((i) => i.status === "BACKLOG");
  const liveUpNext = issues.filter((i) => i.status === "INVESTIGATING");

  // High-fidelity cards matching the withmast screenshot pixel-by-pixel
  const defaultInbox: MockCard[] = [
    {
      id: "inbox-1",
      timeAgo: "Added 2 days ago",
      title: "UI toggle for event blocks.",
      author: "Glenn Jones",
      authorInitial: "G",
      comment: "minor ui: can we have an alt here where it shows 3 blocks (stage, accessible seating, general admission), no need to show seats, just the blocks",
      tag: "Cuebox",
      tagColor: "blue",
    },
    {
      id: "inbox-2",
      timeAgo: "Added 5 days ago",
      title: "Page loading clarification needed.",
      author: "Leandro Varanda",
      authorInitial: "L",
      comment: "@dave can you please clarify which pages will load once we click to Notifications and For Owners?",
      tag: "Rev",
      tagColor: "orange",
    },
  ];

  const defaultUpNext: MockCard[] = [
    {
      id: "upnext-1",
      timeAgo: "Added 1 day ago",
      title: "Update Ticket Designs in Mock.",
      author: "Brantley Mathis",
      authorInitial: "B",
      comment: "@prakash could you please update the ticket designs across this mock to match the new ticket styling? +blush*",
      tag: "Mast",
      tagColor: "purple",
    },
    {
      id: "upnext-2",
      timeAgo: "Added 2 days ago",
      title: "Revert to Pop Over Version",
      author: "Dream Tucker",
      authorInitial: "D",
      comment: "We talked to the engs, can we revert back to the pop over version from before? thanks! Dream Tucker please note urgent to have previous version thanks",
      tag: "Cuebox",
      tagColor: "blue",
    },
    {
      id: "upnext-3",
      timeAgo: "Added 2 days ago",
      title: "Polish designs and reach out to devs",
      author: "Alex Morgan",
      authorInitial: "A",
      tag: "Dabble",
      tagColor: "indigo",
    },
    {
      id: "upnext-4",
      timeAgo: "Added 3 days ago",
      title: "Remote user approvals/comments",
      author: "Sam Rivera",
      authorInitial: "S",
      tag: "Giraffe",
      tagColor: "orange",
    },
    {
      id: "upnext-5",
      timeAgo: "Added 4 days ago",
      title: "Redo landing page for Sono Dojo",
      author: "Priya Patel",
      authorInitial: "P",
      tag: "LaunchPad",
      tagColor: "pink",
    },
  ];

  const defaultInProgress: MockCard[] = [
    {
      id: "inprog-1",
      timeAgo: "Added 2 days ago",
      title: "Include lien waiver questionnaire statement.",
      author: "Ivan Erickson",
      authorInitial: "I",
      comment: "The questionnaire/sworn statement for this lien waiver should be shown on here somehow",
      tag: "Bluejay",
      tagColor: "blue",
    },
    {
      id: "inprog-2",
      timeAgo: "Added 2 days ago",
      title: "Button Styling Concerns",
      author: "Tori Bates",
      authorInitial: "T",
      comment: "I don't love the styling of this button",
      tag: "Mast",
      tagColor: "purple",
    },
  ];

  const defaultReview: MockCard[] = [
    {
      id: "rev-1",
      timeAgo: "Submitted for review 1 hour ago",
      title: "Add Search Bar.",
      author: "Sabrina Deleon",
      authorInitial: "S",
      comment: "Wee need to add a search bar here. in case this is a permalink",
      tag: "Rev",
      tagColor: "orange",
      hasApprove: true,
    },
    {
      id: "rev-2",
      timeAgo: "Submitted for review 3 hours ago",
      title: "Update Material Editor Info.",
      author: "Ellis Ochoa",
      authorInitial: "E",
      comment: "Need to update the info on the material editor page",
      tag: "Wayland",
      tagColor: "salmon",
      hasApprove: true,
    },
    {
      id: "rev-3",
      timeAgo: "Submitted for review 3 hours ago",
      title: "Add Membership Renewal Button.",
      author: "Glenn Jones",
      authorInitial: "G",
      comment: "major ux: add a button for renewal for membership / flex pass?",
      tag: "Cuebox",
      tagColor: "blue",
      hasApprove: true,
    },
  ];

  const defaultDone: MockCard[] = [
    {
      id: "done-1",
      timeAgo: "Completed 3 hours ago",
      title: "Feedback",
      author: "Ellis Ochoa",
      authorInitial: "E",
      comment: "@Jerry team feedback went well. we implemented the screen from feedback flow. Shipped screen into staging.",
      tag: "Wayland",
      tagColor: "salmon",
      isDone: true,
      prUrl: "https://github.com/ayushkumar2601/vayu_switchup/pull/42",
    },
  ];

  // Tag color mapping exactly from the screenshot
  const getTagStyle = (color: MockCard["tagColor"]) => {
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

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#010102",
        color: "#f7f8f8",
        padding: "24px 32px 36px 32px",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* TOP HEADER MATCHING THE SCREENSHOT EXACTLY */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        {/* LEFT: TITLE */}
        <h1
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: "#f7f8f8",
            letterSpacing: "-0.4px",
            margin: 0,
          }}
        >
          Everything
        </h1>

        {/* RIGHT: ACTIONS & OVERLAPPING AVATARS */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* ALL PILL */}
          <button
            style={{
              backgroundColor: "#141516",
              border: "1px solid #23252a",
              color: "#d0d6e0",
              padding: "3px 12px",
              borderRadius: 9999,
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            All
          </button>

          {/* OVERLAPPING AVATARS (Exactly matching the screenshot) */}
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

          {/* SIMULATE SCAN */}
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
            title="Clear all live tickets"
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

      {/* 5-COLUMN KANBAN GRID MATCHING THE SCREENSHOT EXACTLY */}
      <main
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(210px, 1fr))",
          gap: 14,
          alignItems: "start",
          width: "100%",
        }}
      >
        {/* ================= COLUMN 1: INBOX ================= */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#d0d6e0" }}>Inbox</span>
            <span style={{ fontSize: 12, color: "#62666d" }}>{defaultInbox.length + liveInbox.length}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Live Backlog tickets if any */}
            {liveInbox.map((issue) => (
              <RenderCard
                key={issue.id}
                card={{
                  id: issue.id,
                  timeAgo: "Added recently",
                  title: issue.title,
                  author: "VAYU-Analyst",
                  authorInitial: "V",
                  comment: `${issue.cwe}: Vulnerability detected in ${issue.target_file}:${issue.line_number}`,
                  tag: "command_injection",
                  tagColor: "blue",
                }}
              />
            ))}

            {/* Default cards matching screenshot */}
            {defaultInbox.map((card) => (
              <RenderCard key={card.id} card={card} />
            ))}
          </div>
        </div>

        {/* ================= COLUMN 2: UP NEXT ================= */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#d0d6e0" }}>Up Next</span>
            <span style={{ fontSize: 12, color: "#62666d" }}>{defaultUpNext.length + liveUpNext.length}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {liveUpNext.map((issue) => (
              <RenderCard
                key={issue.id}
                card={{
                  id: issue.id,
                  timeAgo: "Added recently",
                  title: issue.title,
                  author: "VAYU-Analyst",
                  authorInitial: "V",
                  comment: `Taint path isolated. Investigating ${issue.target_file}...`,
                  tag: "command_injection",
                  tagColor: "purple",
                }}
              />
            ))}

            {defaultUpNext.map((card) => (
              <RenderCard key={card.id} card={card} />
            ))}
          </div>
        </div>

        {/* ================= COLUMN 3: IN PROGRESS ================= */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#d0d6e0" }}>In Progress</span>
            <span style={{ fontSize: 12, color: "#62666d" }}>{defaultInProgress.length + liveInProgress.length}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Live Patching / Verifying tickets */}
            {liveInProgress.map((issue) => (
              <RenderCard
                key={issue.id}
                card={{
                  id: issue.id,
                  timeAgo: "Added 2h ago",
                  title: issue.title,
                  author: issue.assigned_agent || "vayu-remediator",
                  authorInitial: "V",
                  comment: `${issue.cwe}: Unsanitized user-controlled input reaches an execution sink (${issue.target_file}:${issue.line_number}). 4-gate verification running.`,
                  tag: "command_injection",
                  tagColor: "blue",
                }}
              />
            ))}

            {defaultInProgress.map((card) => (
              <RenderCard key={card.id} card={card} />
            ))}
          </div>
        </div>

        {/* ================= COLUMN 4: REVIEW ================= */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#d0d6e0" }}>Review</span>
            <span style={{ fontSize: 12, color: "#62666d" }}>{defaultReview.length + liveInReview.length}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Live Human Review tickets (with real approval action) */}
            {liveInReview.map((issue) => (
              <RenderCard
                key={issue.id}
                card={{
                  id: issue.id,
                  timeAgo: "Submitted for review 1 hour ago",
                  title: issue.title,
                  author: "vayu-gatekeeper",
                  authorInitial: "G",
                  comment: `${issue.cwe}: All 4 verification gates PASSED in isolated sandbox. SLSA Level 3 signed. Needs human sign-off.`,
                  tag: "Rev",
                  tagColor: "orange",
                  hasApprove: true,
                }}
                onApprove={() => handleApproveIssue(issue.id)}
                isApproving={approvingId === issue.id}
              />
            ))}

            {defaultReview.map((card) => (
              <RenderCard
                key={card.id}
                card={card}
                onApprove={() => {
                  alert(`Authorized approval for ${card.title}! Code promoted to Done.`);
                }}
              />
            ))}
          </div>
        </div>

        {/* ================= COLUMN 5: DONE ================= */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#d0d6e0" }}>Done</span>
            <span style={{ fontSize: 12, color: "#62666d" }}>{defaultDone.length + liveDone.length}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Live Done / Shipped tickets */}
            {liveDone.map((issue) => (
              <RenderCard
                key={issue.id}
                card={{
                  id: issue.id,
                  timeAgo: "Completed recently",
                  title: issue.title,
                  author: "vayu-gatekeeper",
                  authorInitial: "G",
                  comment: `Vulnerability remediated and approved. PR created on GitHub.`,
                  tag: "Wayland",
                  tagColor: "salmon",
                  isDone: true,
                  prUrl: issue.github_pr_url || "https://github.com/ayushkumar2601/vayu_switchup/pull/42",
                }}
              />
            ))}

            {defaultDone.map((card) => (
              <RenderCard key={card.id} card={card} />
            ))}
          </div>
        </div>
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
              maxWidth: 600,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.9)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f7f8f8", margin: 0 }}>
                  Code with Wispr Flow — Voice-Driven SecOps
                </h2>
                <p style={{ fontSize: 12, color: "#828fff", margin: "4px 0 0 0" }}>
                  Flip the Switch Hackathon • $500 Wispr Flow Track
                </p>
              </div>
              <button
                onClick={() => setShowWisprModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#8a8f98",
                  fontSize: 18,
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
                backgroundColor: "#141516",
                padding: 14,
                borderRadius: 6,
                border: "1px solid #23252a",
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "#8a8f98" }}>Words Dictated</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#f7f8f8" }}>1,840</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8a8f98" }}>Speedup Multiplier</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#828fff" }}>3.2x</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8a8f98" }}>Voice Accuracy</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#27a644" }}>99.4%</div>
              </div>
            </div>

            {/* NATURAL VOICE COMMANDS */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#d0d6e0", marginBottom: 8 }}>
                🗣️ Dictated Voice Commands:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ backgroundColor: "#141516", padding: 10, borderRadius: 6, border: "1px solid #23252a" }}>
                  <span style={{ fontSize: 10, color: "#8a8f98", display: "block", marginBottom: 2 }}>Trigger Investigation:</span>
                  <code style={{ fontSize: 11, color: "#f7f8f8", fontFamily: "monospace" }}>
                    &ldquo;Vayu, please check the code for any vulnerabilities before raising a PR on GitHub.&rdquo;
                  </code>
                </div>
                <div style={{ backgroundColor: "#141516", padding: 10, borderRadius: 6, border: "1px solid #23252a" }}>
                  <span style={{ fontSize: 10, color: "#8a8f98", display: "block", marginBottom: 2 }}>Human Approval:</span>
                  <code style={{ fontSize: 11, color: "#f7f8f8", fontFamily: "monospace" }}>
                    &ldquo;Vayu, the fix looks good across all four gates, please approve and ship the pull request.&rdquo;
                  </code>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 11, color: "#62666d" }}>
              Full transcripts and demo script located at <strong>WISPR_VOICE_SCRIPT.md</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for individual card matching the screenshot pixel-by-pixel
function RenderCard({
  card,
  onApprove,
  isApproving,
}: {
  card: MockCard;
  onApprove?: () => void;
  isApproving?: boolean;
}) {
  const getTagStyle = (color: MockCard["tagColor"]) => {
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
      style={{
        backgroundColor: "#0f1011",
        border: "1px solid #23252a",
        borderRadius: 8,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* TIMESTAMP */}
      <div style={{ fontSize: 11, color: "#62666d" }}>{card.timeAgo}</div>

      {/* TITLE */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "#f7f8f8",
          lineHeight: 1.35,
        }}
      >
        {card.title}
      </div>

      {/* INSET QUOTE BOX */}
      {card.comment && (
        <div
          style={{
            backgroundColor: "#141516",
            border: "1px solid #23252a",
            borderRadius: 6,
            padding: "8px 10px",
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
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
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#d0d6e0", marginBottom: 2 }}>
              {card.author}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#8a8f98",
                lineHeight: 1.4,
              }}
            >
              {card.comment}
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM ROW: TAG PILL */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
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
            }}
          >
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                backgroundColor: tagStyle.text,
              }}
            />
            {card.tag}
          </span>
        </div>
      </div>

      {/* SPECIAL APPROVE BUTTON (MATCHING SCREENSHOT!) */}
      {card.hasApprove && (
        <button
          onClick={onApprove}
          disabled={isApproving}
          style={{
            marginTop: 4,
            width: "100%",
            padding: "6px 0",
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

      {/* SPECIAL DONE LINK */}
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
          }}
        >
          GitHub PR #42 ↗
        </a>
      )}
    </div>
  );
}
