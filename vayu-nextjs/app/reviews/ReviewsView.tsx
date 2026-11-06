"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import "./reviews.css";

interface DiffLineItem {
  num?: number | string;
  sign?: " " | "-" | "+";
  type: "context" | "deletion" | "addition";
  content: string;
  highlightWords?: string[];
  tokens?: { text: string; className?: string }[];
}

interface ReviewItem {
  id: string;
  title: string;
  section: "needs_review" | "in_review" | "completed";
  statusText: string;
  statusType: "waiting" | "reviewing" | "rejected" | "completed";
  author: string;
  authorAvatar: string;
  timeAgo: string;
  totalAdditions: number;
  totalDeletions: number;
  fileAdditions: number;
  fileDeletions: number;
  targetFile: string;
  targetFilePath: string;
  fileType: string;
  diffLines: DiffLineItem[];
  cwe?: string;
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  isLiveRun?: boolean;
  reasoning?: {
    rootCause: string;
    securityImpact: string;
    remediationStrategy: string;
    model: string;
  };
  verification?: {
    buildPassed: boolean;
    testsPassed: boolean;
    exploitPassed: boolean;
    rescanPassed: boolean;
    approved: boolean;
    provenanceHash: string;
  };
  guide?: {
    ruleId: string;
    ruleDescription: string;
    guideline: string;
  };
}

// 1. EXACT MOCK REVIEWS MATCHING SCREENSHOT (media_1793945309560_fb1f7fd0.png)
const INITIAL_REVIEWS: ReviewItem[] = [
  // SECTION 1: Needs your review (3)
  {
    id: "DRV-8467",
    title: "Improve vehicle sync state handling",
    section: "needs_review",
    statusText: "Waiting for your review",
    statusType: "waiting",
    author: "Elena Rostova",
    authorAvatar: "ER",
    timeAgo: "1h",
    totalAdditions: 10,
    totalDeletions: 11,
    fileAdditions: 4,
    fileDeletions: 4,
    targetFile: "HomeScreen.tsx",
    targetFilePath: "kinetic-ios/src/screens/Home/HomeScreen.tsx",
    fileType: "TS",
    diffLines: [
      {
        num: 1,
        sign: " ",
        type: "context",
        content: "import React from 'react'",
        tokens: [
          { text: "import ", className: "kw-token" },
          { text: "React " },
          { text: "from ", className: "kw-token" },
          { text: "'react'", className: "str-token" },
        ],
      },
      {
        num: 2,
        sign: " ",
        type: "context",
        content: "import { View, ActivityIndicator } from 'react-native'",
        tokens: [
          { text: "import ", className: "kw-token" },
          { text: "{ View, ActivityIndicator } " },
          { text: "from ", className: "kw-token" },
          { text: "'react-native'", className: "str-token" },
        ],
      },
      {
        sign: "-",
        type: "deletion",
        content: "import { useVehicleState } from '@hooks/useVehicleState'",
        tokens: [
          { text: "import ", className: "kw-token" },
          { text: "{ useVehicleState } " },
          { text: "from ", className: "kw-token" },
          { text: "'@hooks/useVehicleState'", className: "str-token" },
        ],
      },
      {
        num: 3,
        sign: "+",
        type: "addition",
        content: "import { useVehicleState, SyncStatus } from '@hooks/useVehicleState'",
        tokens: [
          { text: "import ", className: "kw-token" },
          { text: "{ useVehicleState, " },
          { text: "SyncStatus", className: "diff-hl-add" },
          { text: " } " },
          { text: "from ", className: "kw-token" },
          { text: "'@hooks/useVehicleState'", className: "str-token" },
        ],
      },
      {
        num: 4,
        sign: " ",
        type: "context",
        content: "import { Dashboard } from '@components/Dashboard'",
        tokens: [
          { text: "import ", className: "kw-token" },
          { text: "{ Dashboard } " },
          { text: "from ", className: "kw-token" },
          { text: "'@components/Dashboard'", className: "str-token" },
        ],
      },
      {
        num: 5,
        sign: " ",
        type: "context",
        content: "import { EmptyState } from '@components/EmptyState'",
        tokens: [
          { text: "import ", className: "kw-token" },
          { text: "{ EmptyState } " },
          { text: "from ", className: "kw-token" },
          { text: "'@components/EmptyState'", className: "str-token" },
        ],
      },
      {
        num: 6,
        sign: " ",
        type: "context",
        content: "",
      },
      {
        num: 7,
        sign: " ",
        type: "context",
        content: "export const HomeScreen = () => {",
        tokens: [
          { text: "export ", className: "kw-token" },
          { text: "const ", className: "kw-token" },
          { text: "HomeScreen = () => {" },
        ],
      },
      {
        sign: "-",
        type: "deletion",
        content: "  const { vehicleState, isFullySynced } = useVehicleState()",
        tokens: [
          { text: "  const ", className: "kw-token" },
          { text: "{ vehicleState, " },
          { text: "isFullySynced", className: "diff-hl-del" },
          { text: " } = useVehicleState()" },
        ],
      },
      {
        num: 8,
        sign: "+",
        type: "addition",
        content: "  const { vehicleState, syncStatus } = useVehicleState()",
        tokens: [
          { text: "  const ", className: "kw-token" },
          { text: "{ vehicleState, " },
          { text: "syncStatus", className: "diff-hl-add" },
          { text: " } = useVehicleState()" },
        ],
      },
      {
        num: 9,
        sign: " ",
        type: "context",
        content: "",
      },
      {
        sign: "-",
        type: "deletion",
        content: "  if (!isFullySynced) {",
        tokens: [
          { text: "  if (", className: "kw-token" },
          { text: "!isFullySynced", className: "diff-hl-del" },
          { text: ") {" },
        ],
      },
      {
        num: 10,
        sign: "+",
        type: "addition",
        content: "  if (syncStatus === SyncStatus.PENDING) {",
        tokens: [
          { text: "  if (", className: "kw-token" },
          { text: "syncStatus === SyncStatus.PENDING", className: "diff-hl-add" },
          { text: ") {" },
        ],
      },
      {
        num: 11,
        sign: " ",
        type: "context",
        content: "    return <ActivityIndicator size=\"large\" />",
        tokens: [
          { text: "    return ", className: "kw-token" },
          { text: "<ActivityIndicator ", className: "tag-token" },
          { text: "size=", className: "prop-token" },
          { text: "\"large\"", className: "str-token" },
          { text: " />", className: "tag-token" },
        ],
      },
      {
        num: 12,
        sign: " ",
        type: "context",
        content: "  }",
      },
      {
        num: 13,
        sign: " ",
        type: "context",
        content: "  if (!vehicleState) {",
        tokens: [
          { text: "  if (", className: "kw-token" },
          { text: "!vehicleState) {" },
        ],
      },
      {
        num: 14,
        sign: " ",
        type: "context",
        content: "    return null",
        tokens: [
          { text: "    return ", className: "kw-token" },
          { text: "null", className: "kw-token" },
        ],
      },
      {
        num: 15,
        sign: " ",
        type: "context",
        content: "  }",
      },
      {
        num: 16,
        sign: " ",
        type: "context",
        content: "  return (",
        tokens: [{ text: "  return (", className: "kw-token" }],
      },
      {
        num: 17,
        sign: " ",
        type: "context",
        content: "    <View>",
        tokens: [{ text: "    <View>", className: "tag-token" }],
      },
      {
        sign: "-",
        type: "deletion",
        content: "      <Dashboard state={vehicleState} />",
        tokens: [
          { text: "      <Dashboard ", className: "tag-token" },
          { text: "state=", className: "prop-token" },
          { text: "{vehicleState} />" },
        ],
      },
      {
        num: 18,
        sign: "+",
        type: "addition",
        content: "      <Dashboard state={vehicleState} syncStatus={syncStatus} />",
        tokens: [
          { text: "      <Dashboard ", className: "tag-token" },
          { text: "state=", className: "prop-token" },
          { text: "{vehicleState} " },
          { text: "syncStatus={syncStatus}", className: "diff-hl-add" },
          { text: " />", className: "tag-token" },
        ],
      },
      {
        num: 19,
        sign: " ",
        type: "context",
        content: "    </View>",
        tokens: [{ text: "    </View>", className: "tag-token" }],
      },
      {
        num: 20,
        sign: " ",
        type: "context",
        content: "  )",
      },
      {
        num: 21,
        sign: " ",
        type: "context",
        content: "}",
      },
    ],
    reasoning: {
      rootCause: "The component relied on a binary boolean flag (isFullySynced) instead of a discriminated sync union (SyncStatus.PENDING | ERROR | READY). This caused race conditions during intermittent vehicle connectivity.",
      securityImpact: "Unsynchronized vehicle telemetry state can lead to stale command dispatch and erroneous telemetry visualization.",
      remediationStrategy: "Migrate useVehicleState consumer to SyncStatus enum and pass syncStatus downstream into Dashboard.",
      model: "gemma 4 (cloud reasoning)",
    },
    verification: {
      buildPassed: true,
      testsPassed: true,
      exploitPassed: true,
      rescanPassed: true,
      approved: true,
      provenanceHash: "sha256:7b1a29f8c0e29411dd78e35cf8230198aa4752",
    },
    guide: {
      ruleId: "kinetic.state.discriminated-union-sync",
      ruleDescription: "Ensure distributed device telemetry uses discriminated union statuses rather than bare booleans.",
      guideline: "Follow VAYU Invariant 3: Constrained Patch Generation — preserve existing JSX hierarchy while upgrading state hooks.",
    },
  },
  {
    id: "DRV-8468",
    title: "Refactor notification model and captur...",
    section: "needs_review",
    statusText: "Waiting for your review",
    statusType: "waiting",
    author: "Devon Harris",
    authorAvatar: "DH",
    timeAgo: "1h",
    totalAdditions: 18,
    totalDeletions: 6,
    fileAdditions: 18,
    fileDeletions: 6,
    targetFile: "NotificationService.ts",
    targetFilePath: "kinetic-ios/src/services/notifications/NotificationService.ts",
    fileType: "TS",
    diffLines: [
      { num: 42, sign: " ", type: "context", content: "export interface NotificationPayload {" },
      { sign: "-", type: "deletion", content: "  readonly error?: string;" },
      { num: 43, sign: "+", type: "addition", content: "  readonly error?: StructuredErrorPayload;", tokens: [{ text: "  readonly error?: " }, { text: "StructuredErrorPayload", className: "diff-hl-add" }, { text: ";" }] },
      { num: 44, sign: " ", type: "context", content: "  readonly retryCount: number;" },
      { sign: "-", type: "deletion", content: "  dispatch(): Promise<void>;" },
      { num: 45, sign: "+", type: "addition", content: "  dispatch(options?: DispatchOptions): Promise<DispatchResult>;", tokens: [{ text: "  dispatch(" }, { text: "options?: DispatchOptions", className: "diff-hl-add" }, { text: "): Promise<DispatchResult>;" }] },
      { num: 46, sign: " ", type: "context", content: "}" },
    ],
    reasoning: {
      rootCause: "Unstructured string errors dropped stack frames and telemetry correlation IDs during notification failures.",
      securityImpact: "Prevents incident audit trail loss and telemetry evasion.",
      remediationStrategy: "Enforce StructuredErrorPayload schema with nonces.",
      model: "gemma 4",
    },
  },
  {
    id: "DRV-8469",
    title: "Prevent duplicate trip creation",
    section: "needs_review",
    statusText: "Waiting for your review",
    statusType: "waiting",
    author: "Prakash Verma",
    authorAvatar: "PV",
    timeAgo: "2h",
    totalAdditions: 8,
    totalDeletions: 2,
    fileAdditions: 8,
    fileDeletions: 2,
    targetFile: "TripController.ts",
    targetFilePath: "kinetic-ios/src/controllers/trip/TripController.ts",
    fileType: "TS",
    diffLines: [
      { num: 88, sign: " ", type: "context", content: "export async function createTrip(req: TripRequest) {" },
      { sign: "-", type: "deletion", content: "  const trip = await db.trips.insert(req.body);" },
      { num: 89, sign: "+", type: "addition", content: "  const idempotencyKey = req.headers['idempotency-key'];", tokens: [{ text: "  const " }, { text: "idempotencyKey", className: "diff-hl-add" }, { text: " = req.headers['idempotency-key'];" }] },
      { num: 90, sign: "+", type: "addition", content: "  const trip = await db.trips.upsertByIdempotency(idempotencyKey, req.body);" },
      { num: 91, sign: " ", type: "context", content: "  return trip;" },
      { num: 92, sign: " ", type: "context", content: "}" },
    ],
    reasoning: {
      rootCause: "Concurrent mobile retries on flaky 4G connections triggered double-billing trip creation.",
      securityImpact: "Financial race condition vulnerability in trip creation gateway.",
      remediationStrategy: "Enforce idempotency key deduplication at the controller entrypoint.",
      model: "gemma 4",
    },
  },

  // SECTION 2: You're reviewing (2)
  {
    id: "DRV-8470",
    title: "Add high contrast theme to Rider app",
    section: "in_review",
    statusText: "In Review",
    statusType: "reviewing",
    author: "Alex Morgan",
    authorAvatar: "AM",
    timeAgo: "4h",
    totalAdditions: 32,
    totalDeletions: 14,
    fileAdditions: 32,
    fileDeletions: 14,
    targetFile: "Theme.ts",
    targetFilePath: "kinetic-ios/src/design-system/tokens/Theme.ts",
    fileType: "TS",
    diffLines: [
      { num: 12, sign: " ", type: "context", content: "export const HighContrastTheme = {" },
      { num: 13, sign: "+", type: "addition", content: "  background: '#000000',", tokens: [{ text: "  background: " }, { text: "'#000000'", className: "diff-hl-add" }, { text: "," }] },
      { num: 14, sign: "+", type: "addition", content: "  foreground: '#FFFFFF',", tokens: [{ text: "  foreground: " }, { text: "'#FFFFFF'", className: "diff-hl-add" }, { text: "," }] },
      { num: 15, sign: "+", type: "addition", content: "  contrastRatio: 21.0,", tokens: [{ text: "  contrastRatio: " }, { text: "21.0", className: "diff-hl-add" }, { text: "," }] },
      { num: 16, sign: " ", type: "context", content: "};" },
    ],
  },
  {
    id: "DRV-8471",
    title: "Fix overflow on header",
    section: "in_review",
    statusText: "You requested changes",
    statusType: "rejected",
    author: "Jordan Lee",
    authorAvatar: "JL",
    timeAgo: "1d",
    totalAdditions: 5,
    totalDeletions: 3,
    fileAdditions: 5,
    fileDeletions: 3,
    targetFile: "Header.tsx",
    targetFilePath: "kinetic-ios/src/components/navigation/Header.tsx",
    fileType: "TS",
    diffLines: [
      { num: 28, sign: " ", type: "context", content: "<header style={{" },
      { sign: "-", type: "deletion", content: "  overflow: 'visible'," },
      { num: 29, sign: "+", type: "addition", content: "  overflow: 'hidden',", tokens: [{ text: "  overflow: " }, { text: "'hidden'", className: "diff-hl-add" }, { text: "," }] },
      { num: 30, sign: "+", type: "addition", content: "  textOverflow: 'ellipsis',", tokens: [{ text: "  textOverflow: " }, { text: "'ellipsis'", className: "diff-hl-add" }, { text: "," }] },
      { num: 31, sign: " ", type: "context", content: "}}>" },
    ],
  },

  // SECTION 3: Completed (1473)
  {
    id: "VAYU-8467",
    title: "Fix OS command injection via subprocess.run",
    section: "completed",
    statusText: "Approved & Merged",
    statusType: "completed",
    author: "VAYU Autonomous CRS",
    authorAvatar: "V",
    timeAgo: "2d",
    totalAdditions: 1,
    totalDeletions: 1,
    fileAdditions: 1,
    fileDeletions: 1,
    targetFile: "app.py",
    targetFilePath: "samples/vulnerable/command_injection/app.py",
    fileType: "PY",
    cwe: "CWE-78: OS Command Injection",
    severity: "CRITICAL",
    diffLines: [
      { num: 260, sign: " ", type: "context", content: "        # Execute diagnostic command safely" },
      { sign: "-", type: "deletion", content: "        subprocess.run(command, shell=True, check=False)", tokens: [{ text: "        subprocess.run(command, " }, { text: "shell=True", className: "diff-hl-del" }, { text: ", check=False)" }] },
      { num: 261, sign: "+", type: "addition", content: "        subprocess.run(command.split(), check=False)", tokens: [{ text: "        subprocess.run(" }, { text: "command.split()", className: "diff-hl-add" }, { text: ", check=False)" }] },
      { num: 262, sign: " ", type: "context", content: "        return (0, \"Diagnostic complete\")" },
    ],
    reasoning: {
      rootCause: "The application invoked subprocess.run() with shell=True, letting unvalidated strings execute arbitrary shell commands.",
      securityImpact: "Remote code execution (RCE) on host container.",
      remediationStrategy: "Eliminate shell=True and pass command arguments as an array to subprocess.run().",
      model: "gemma 4",
    },
    verification: {
      buildPassed: true,
      testsPassed: true,
      exploitPassed: true,
      rescanPassed: true,
      approved: true,
      provenanceHash: "sha256:0b25132ca2411664ef1d1ef29948ebef4f978001afbeb89773407bdea591517f",
    },
    guide: {
      ruleId: "aikavach.python.subprocess-shell-true",
      ruleDescription: "User-controlled command execution may be possible when subprocess uses shell=True.",
      guideline: "VAYU Invariant 4: Fail-closed verification gates must ensure no subprocess call retains shell=True.",
    },
  },
];

export default function ReviewsView() {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [selectedId, setSelectedId] = useState<string>("DRV-8467");
  const [filterMode, setFilterMode] = useState<"for_me" | "created">("for_me");
  const [activeTab, setActiveTab] = useState<"activity" | "guide" | "diff">("diff");
  const [reviewedMap, setReviewedMap] = useState<Record<string, boolean>>({});
  const [starredMap, setStarredMap] = useState<Record<string, boolean>>({});
  const [completedCollapsed, setCompletedCollapsed] = useState<boolean>(true);
  const [needsReviewCollapsed, setNeedsReviewCollapsed] = useState<boolean>(false);
  const [reviewingCollapsed, setReviewingCollapsed] = useState<boolean>(false);
  const [isSplitView, setIsSplitView] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string>("");

  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");

  useEffect(() => {
    if (queryId && reviews.some((r) => r.id === queryId)) {
      setSelectedId(queryId);
    }
  }, [queryId, reviews]);

  const selectedReview = useMemo(() => {
    return reviews.find((r) => r.id === selectedId) || reviews[0];
  }, [reviews, selectedId]);

  // Toggle Reviewed status for current file/review
  const handleToggleReviewed = useCallback((id: string) => {
    setReviewedMap((prev) => {
      const next = !prev[id];
      setActionNotice(next ? `Marked ${id} as Reviewed` : `Unmarked ${id}`);
      setTimeout(() => setActionNotice(""), 3000);
      return { ...prev, [id]: next };
    });
  }, []);

  const handleToggleStar = useCallback((id: string) => {
    setStarredMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Filter lists according to sections
  const needsReviewList = useMemo(
    () => reviews.filter((r) => r.section === "needs_review"),
    [reviews]
  );
  const reviewingList = useMemo(
    () => reviews.filter((r) => r.section === "in_review"),
    [reviews]
  );
  const completedList = useMemo(
    () => reviews.filter((r) => r.section === "completed"),
    [reviews]
  );

  return (
    <div className="linear-reviews-container">
      {/* 1. MIDDLE COLUMN: REVIEWS TRIAGE LIST */}
      <aside className="ln-middle-col">
        {/* Header: Reviews & Filter Switcher */}
        <div className="ln-middle-header">
          <div className="ln-middle-title">Reviews</div>

          <div className="ln-filter-switcher">
            <button
              className={`ln-filter-pill ${filterMode === "for_me" ? "active" : ""}`}
              onClick={() => setFilterMode("for_me")}
            >
              For me
            </button>
            <button
              className={`ln-filter-pill ${filterMode === "created" ? "active" : ""}`}
              onClick={() => setFilterMode("created")}
            >
              Created
            </button>
          </div>
        </div>

        {/* Scrollable Groups */}
        <div className="ln-middle-scroll">
          {/* Section 1: Needs your review */}
          <div className="ln-triage-group">
            <div
              className="ln-group-header"
              onClick={() => setNeedsReviewCollapsed(!needsReviewCollapsed)}
            >
              <div className="group-title">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ color: "#8a8f98" }}>
                  <path
                    d="M3 4.5A1.5 1.5 0 1 1 6 4.5A1.5 1.5 0 0 1 3 4.5ZM10 11.5A1.5 1.5 0 1 1 13 11.5A1.5 1.5 0 0 1 10 11.5ZM4.5 6V11.5M11.5 10V4.5M4.5 11.5H7.5M11.5 4.5H8.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Needs your review</span>
              </div>
              <span className="group-count">{needsReviewList.length}</span>
              <span className="group-chevron">{needsReviewCollapsed ? "▸" : "▾"}</span>
            </div>

            {!needsReviewCollapsed &&
              needsReviewList.map((item) => {
                const isActive = item.id === selectedId;
                const isReviewed = !!reviewedMap[item.id];
                return (
                  <div
                    key={item.id}
                    className={`ln-review-card ${isActive ? "active" : ""}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <div className="ln-card-title">{item.title}</div>
                    <div className="ln-card-meta">
                      <div className="ln-card-status waiting">
                        <span className="status-icon" style={{ color: "#27a644", fontSize: 11 }}>✔</span>
                        <span>{isReviewed ? "Reviewed" : item.statusText}</span>
                      </div>
                      <div className="ln-card-right">
                        <span className="ln-branch-icon">
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M11.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm-2.25.75a2.25 2.25 0 1 1 3 2.122v2.628a3.751 3.751 0 0 1-2.404 3.513 2.25 2.25 0 1 1-1.442-.876A2.25 2.25 0 0 0 11 8V5.372A2.25 2.25 0 0 1 9.5 3.25zM4.25 10.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zM2 11.25a2.25 2.25 0 1 1 3 2.122v-6.744a2.25 2.25 0 1 1 1.5 0v6.744A2.25 2.25 0 0 1 2 11.25z" />
                          </svg>
                        </span>
                        <div className="ln-avatar">{item.authorAvatar}</div>
                        <span className="ln-card-time">{item.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Section 2: You're reviewing */}
          <div className="ln-triage-group">
            <div
              className="ln-group-header"
              onClick={() => setReviewingCollapsed(!reviewingCollapsed)}
            >
              <div className="group-title">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ color: "#8a8f98" }}>
                  <path
                    d="M3 4.5A1.5 1.5 0 1 1 6 4.5A1.5 1.5 0 0 1 3 4.5ZM10 11.5A1.5 1.5 0 1 1 13 11.5A1.5 1.5 0 0 1 10 11.5ZM4.5 6V11.5M11.5 10V4.5M4.5 11.5H7.5M11.5 4.5H8.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>You&apos;re reviewing</span>
              </div>
              <span className="group-count">{reviewingList.length}</span>
              <span className="group-chevron">{reviewingCollapsed ? "▸" : "▾"}</span>
            </div>

            {!reviewingCollapsed &&
              reviewingList.map((item) => {
                const isActive = item.id === selectedId;
                const isRejected = item.statusType === "rejected";
                return (
                  <div
                    key={item.id}
                    className={`ln-review-card ${isActive ? "active" : ""}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <div className="ln-card-title">{item.title}</div>
                    <div className="ln-card-meta">
                      <div className={`ln-card-status ${isRejected ? "rejected" : "reviewing"}`}>
                        {isRejected ? (
                          <>
                            <span className="status-icon" style={{ color: "#ef4444", fontSize: 10 }}>✖</span>
                            <span>{item.statusText}</span>
                          </>
                        ) : (
                          <span>{item.statusText}</span>
                        )}
                      </div>
                      <div className="ln-card-right">
                        <span className="ln-branch-icon">
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M11.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm-2.25.75a2.25 2.25 0 1 1 3 2.122v2.628a3.751 3.751 0 0 1-2.404 3.513 2.25 2.25 0 1 1-1.442-.876A2.25 2.25 0 0 0 11 8V5.372A2.25 2.25 0 0 1 9.5 3.25zM4.25 10.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zM2 11.25a2.25 2.25 0 1 1 3 2.122v-6.744a2.25 2.25 0 1 1 1.5 0v6.744A2.25 2.25 0 0 1 2 11.25z" />
                          </svg>
                        </span>
                        <div className="ln-avatar">{item.authorAvatar}</div>
                        <span className="ln-card-time">{item.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Section 3: Completed */}
          <div className="ln-triage-group">
            <div
              className="ln-group-header"
              onClick={() => setCompletedCollapsed(!completedCollapsed)}
            >
              <div className="group-title">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ color: "#8a8f98" }}>
                  <path
                    d="M13.3333 4L5.99996 11.3333L2.66663 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Completed</span>
              </div>
              <span className="group-count">1473</span>
              <span className="group-chevron">{completedCollapsed ? "▸" : "▾"}</span>
            </div>

            {!completedCollapsed &&
              completedList.map((item) => {
                const isActive = item.id === selectedId;
                return (
                  <div
                    key={item.id}
                    className={`ln-review-card ${isActive ? "active" : ""}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <div className="ln-card-title">{item.title}</div>
                    <div className="ln-card-meta">
                      <div className="ln-card-status waiting">
                        <span className="status-icon" style={{ color: "#27a644", fontSize: 10 }}>✔</span>
                        <span>{item.statusText}</span>
                      </div>
                      <div className="ln-card-right">
                        <span className="ln-branch-icon">
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M11.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm-2.25.75a2.25 2.25 0 1 1 3 2.122v2.628a3.751 3.751 0 0 1-2.404 3.513 2.25 2.25 0 1 1-1.442-.876A2.25 2.25 0 0 0 11 8V5.372A2.25 2.25 0 0 1 9.5 3.25zM4.25 10.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zM2 11.25a2.25 2.25 0 1 1 3 2.122v-6.744a2.25 2.25 0 1 1 1.5 0v6.744A2.25 2.25 0 0 1 2 11.25z" />
                          </svg>
                        </span>
                        <div className="ln-avatar">{item.authorAvatar}</div>
                        <span className="ln-card-time">{item.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </aside>

      {/* 2. RIGHT MAIN PANEL (CODE DIFF & REVIEW DETAILS) */}
      <main className="ln-main-col">
        {/* Top Breadcrumb Bar */}
        <header className="ln-main-topbar">
          <div className="ln-topbar-left">
            <div className="ln-pr-status-dot" title="Open Pull Request">
              <div className="ln-pr-status-dot-inner" />
            </div>
            <span className="ln-pr-id">{selectedReview.id}</span>
            <span className="ln-breadcrumb-chevron">›</span>
            <span className="ln-pr-branch-icon">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm-2.25.75a2.25 2.25 0 1 1 3 2.122v2.628a3.751 3.751 0 0 1-2.404 3.513 2.25 2.25 0 1 1-1.442-.876A2.25 2.25 0 0 0 11 8V5.372A2.25 2.25 0 0 1 9.5 3.25zM4.25 10.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zM2 11.25a2.25 2.25 0 1 1 3 2.122v-6.744a2.25 2.25 0 1 1 1.5 0v6.744A2.25 2.25 0 0 1 2 11.25z" />
              </svg>
            </span>
            <span className="ln-pr-title">{selectedReview.title}</span>
            <div className="ln-pr-stats">
              <span className="ln-pr-stats-add">+{selectedReview.totalAdditions}</span>
              <span className="ln-pr-stats-del">-{selectedReview.totalDeletions}</span>
            </div>

            <div className="ln-topbar-actions">
              <button
                className="ln-topbar-icon-btn"
                onClick={() => handleToggleStar(selectedReview.id)}
                title={starredMap[selectedReview.id] ? "Starred" : "Star"}
              >
                {starredMap[selectedReview.id] ? "★" : "☆"}
              </button>
              <button className="ln-topbar-icon-btn" title="More options">
                ···
              </button>
            </div>
          </div>

          <div className="ln-topbar-right">
            {actionNotice && (
              <span
                style={{
                  fontSize: 11,
                  color: "#4ade80",
                  fontFamily: "var(--ln-font-sans)",
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: "rgba(34, 197, 94, 0.12)",
                }}
              >
                {actionNotice}
              </span>
            )}
            <button className="ln-topbar-util-icon" title="Notifications">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1.5A3.5 3.5 0 0 0 4.5 5v2.946c0 .35-.11.693-.314.98L3.153 10.38A1 1 0 0 0 3.967 12H12.03a1 1 0 0 0 .814-1.62l-1.033-1.454a1.69 1.69 0 0 1-.314-.98V5A3.5 3.5 0 0 0 8 1.5zM6.5 13a1.5 1.5 0 0 0 3 0h-3z" />
              </svg>
            </button>
            <button className="ln-topbar-util-icon" title="History & Timeline">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.75 4.75a.75.75 0 0 0-1.5 0v3.5c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5H8.75V4.75z" />
              </svg>
            </button>
            <div className="ln-topbar-avatar" title="Ayush Kumar">
              AK
            </div>
          </div>
        </header>

        {/* Sub-header Tab Bar */}
        <div className="ln-subheader-bar">
          <div className="ln-subheader-tabs">
            <button
              className={`ln-tab-pill ${activeTab === "activity" ? "active" : ""}`}
              onClick={() => setActiveTab("activity")}
            >
              Activity
            </button>
            <button
              className={`ln-tab-pill ${activeTab === "guide" ? "active" : ""}`}
              onClick={() => setActiveTab("guide")}
            >
              Guide
            </button>
            <button
              className={`ln-tab-pill ${activeTab === "diff" ? "active" : ""}`}
              onClick={() => setActiveTab("diff")}
            >
              Diff
            </button>
          </div>

          <div className="ln-subheader-right">
            <button
              className="ln-preview-pill"
              onClick={() => {
                setActionNotice("Full Screen Preview");
                setTimeout(() => setActionNotice(""), 2000);
              }}
              title="Preview component"
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 1 0V2h3.5a.5.5 0 0 0 0-1H1.5zm13 0a.5.5 0 0 0-.5.5V2H10.5a.5.5 0 0 0 0 1H14v3.5a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-.5-.5zM1.5 15a.5.5 0 0 0 .5-.5V14h3.5a.5.5 0 0 0 0-1H2v-3.5a.5.5 0 0 0-1 0v4a.5.5 0 0 0 .5.5zm13 0a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-1 0V14h-3.5a.5.5 0 0 0 0 1H14.5z" />
              </svg>
              <span>Preview</span>
            </button>

            <button
              className="ln-split-toggle-btn"
              onClick={() => setIsSplitView(!isSplitView)}
              title={isSplitView ? "Switch to unified diff" : "Switch to side-by-side diff"}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                <path d="M0 2.5A1.5 1.5 0 0 1 1.5 1h13A1.5 1.5 0 0 1 16 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 13.5v-11zM7.25 2.5v11h7.25a.25.25 0 0 0 .25-.25v-10.5a.25.25 0 0 0-.25-.25H7.25zm-1.5 0H1.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h4.25v-11z" />
              </svg>
            </button>
          </div>
        </div>

        {/* TAB 1: DIFF VIEWER (DEFAULT MATCHING SCREENSHOT) */}
        {activeTab === "diff" && (
          <div className="ln-diff-scroll-pane">
            <div className="ln-file-card">
              {/* File Header */}
              <div className="ln-file-header">
                <div className="ln-file-header-left">
                  <span className="ln-file-badge">{selectedReview.fileType}</span>
                  <span className="ln-file-name">{selectedReview.targetFile}</span>
                  <span className="ln-file-path">{selectedReview.targetFilePath}</span>
                </div>

                <div className="ln-file-header-right">
                  <div className="ln-file-stats">
                    <span className="ln-pr-stats-add">+{selectedReview.fileAdditions}</span>
                    <span className="ln-pr-stats-del">-{selectedReview.fileDeletions}</span>
                  </div>

                  <button
                    className={`ln-reviewed-btn ${reviewedMap[selectedReview.id] ? "reviewed" : ""}`}
                    onClick={() => handleToggleReviewed(selectedReview.id)}
                  >
                    <div className="ln-reviewed-circle">
                      {reviewedMap[selectedReview.id] && (
                        <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
                        </svg>
                      )}
                    </div>
                    <span>Reviewed</span>
                  </button>
                </div>
              </div>

              {/* Code Diff Table */}
              <div className="ln-diff-table">
                {selectedReview.diffLines.map((line, idx) => {
                  const isDel = line.type === "deletion";
                  const isAdd = line.type === "addition";
                  return (
                    <div
                      key={idx}
                      className={`ln-diff-row ${isDel ? "deletion" : isAdd ? "addition" : ""}`}
                    >
                      <div className="ln-gutter">
                        {isDel ? "" : line.num ?? ""}
                      </div>
                      <div className="ln-diff-content">
                        {line.tokens ? (
                          line.tokens.map((token, tIdx) => (
                            <span key={tIdx} className={token.className}>
                              {token.text}
                            </span>
                          ))
                        ) : (
                          <span>{line.content}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVITY (PULL REQUEST & 4-GATE VERIFICATION) */}
        {activeTab === "activity" && (
          <div className="ln-diff-scroll-pane">
            <div className="ln-tab-content-container">
              <div className="ln-tab-card">
                <div className="ln-tab-card-header">
                  <span>PR Investigation & Automated Verification</span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#27a644",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "#27a644",
                      }}
                    />
                    Fail-Closed Verified
                  </span>
                </div>

                <div style={{ fontSize: 13, color: "#d0d6e0", lineHeight: 1.6 }}>
                  {selectedReview.reasoning?.rootCause ||
                    "This review proposes targeted invariant fixes verified in the ephemeral isolated sandbox."}
                </div>

                {selectedReview.verification && (
                  <div className="ln-gates-list">
                    <div className="ln-gate-item">
                      <div className="ln-gate-badge passed">✔</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>Gate 1: AST Invariant Sanitization</div>
                        <div style={{ fontSize: 11, color: "#8a8f98" }}>
                          Verified abstract syntax tree eliminates taint sinks
                        </div>
                      </div>
                    </div>

                    <div className="ln-gate-item">
                      <div className="ln-gate-badge passed">✔</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>Gate 2: Reproducer Exploit</div>
                        <div style={{ fontSize: 11, color: "#8a8f98" }}>
                          Deterministic payload blocked in isolated sandbox
                        </div>
                      </div>
                    </div>

                    <div className="ln-gate-item">
                      <div className="ln-gate-badge passed">✔</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>Gate 3: Regression Suite</div>
                        <div style={{ fontSize: 11, color: "#8a8f98" }}>
                          100% existing test pass rate preserved
                        </div>
                      </div>
                    </div>

                    <div className="ln-gate-item">
                      <div className="ln-gate-badge passed">✔</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>Gate 4: Security Invariant Rescan</div>
                        <div style={{ fontSize: 11, color: "#8a8f98" }}>
                          0 rule violations detected post-patch
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="ln-actions-bar">
                  <button
                    className="ln-btn-primary"
                    onClick={() => {
                      handleToggleReviewed(selectedReview.id);
                      setActionNotice(`PR #${selectedReview.id} approved & ready for deployment`);
                    }}
                  >
                    <span>✔ Approve Review</span>
                  </button>
                  <button
                    className="ln-btn-secondary"
                    onClick={() => {
                      setActionNotice("Changes requested — ticket reassigned to remediator");
                      setTimeout(() => setActionNotice(""), 3000);
                    }}
                  >
                    <span>✖ Request Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GUIDE (REMEDIATION RULES & INVARIANTS) */}
        {activeTab === "guide" && (
          <div className="ln-diff-scroll-pane">
            <div className="ln-tab-content-container">
              <div className="ln-tab-card">
                <div className="ln-tab-card-header">
                  <span>Remediation Guidelines & Invariants</span>
                  <span
                    style={{
                      fontFamily: "var(--ln-font-mono)",
                      fontSize: 11,
                      color: "#8a8f98",
                    }}
                  >
                    {selectedReview.guide?.ruleId || "linear.review.invariant"}
                  </span>
                </div>

                <div style={{ fontSize: 13, color: "#d0d6e0", lineHeight: 1.6 }}>
                  {selectedReview.guide?.guideline ||
                    "Linear state hygiene requires strict discriminated union matching, avoiding bare boolean flags across asynchronous network boundaries."}
                </div>

                <div
                  style={{
                    backgroundColor: "#030404",
                    border: "1px solid #23252a",
                    borderRadius: 6,
                    padding: "12px 14px",
                    fontFamily: "var(--ln-font-mono)",
                    fontSize: 12,
                    color: "#9ba1b0",
                  }}
                >
                  <div>// Safe Pattern Reference:</div>
                  <div style={{ color: "#7ee787", marginTop: 4 }}>
                    + const &#123; vehicleState, syncStatus &#125; = useVehicleState()
                  </div>
                  <div style={{ color: "#7ee787" }}>
                    + if (syncStatus === SyncStatus.PENDING) return &lt;ActivityIndicator /&gt;
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
