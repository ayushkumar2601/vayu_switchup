"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface SidebarProps {
  onOpenWispr?: () => void;
}

export default function Sidebar({ onOpenWispr }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside
      style={{
        width: collapsed ? 68 : 240,
        minWidth: collapsed ? 68 : 240,
        height: "100vh",
        backgroundColor: "#090a0f",
        borderRight: "1px solid rgba(255, 255, 255, 0.07)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "width 0.22s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        userSelect: "none",
        overflowX: "hidden",
      }}
    >
      {/* TOP BRAND & COLLAPSE TOGGLE */}
      <div>
        <div
          style={{
            padding: collapsed ? "18px 0" : "18px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* SVG Logo matching the blue concentric icon in the screenshot */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px rgba(37, 99, 235, 0.4)",
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />
                <path d="M7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="3" fill="#60a5fa" />
              </svg>
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", letterSpacing: "0.02em" }}>
                  VAYU OS
                </div>
                <div style={{ fontSize: 10, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10b981" }} />
                  SecOps Squad
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              background: "transparent",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              padding: 4,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
            }}
          >
            {collapsed ? "▶" : "◀"}
          </button>
        </div>

        {/* PRIMARY WORKSPACES */}
        <div style={{ padding: collapsed ? "12px 6px" : "14px 10px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Link
              href="/dashboard"
              title="My Desk / System Reasoning"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: collapsed ? "8px 0" : "8px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: isActive("/dashboard") ? 600 : 400,
                color: isActive("/dashboard") ? "#ffffff" : "#94a3b8",
                backgroundColor: isActive("/dashboard") ? "#181a24" : "transparent",
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <span style={{ fontSize: 14 }}>🖥️</span>
              {!collapsed && <span>My Desk</span>}
            </Link>

            <Link
              href="/issues"
              title="Everything / Linear Operations Kanban"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: collapsed ? "8px 0" : "8px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: isActive("/issues") ? 600 : 400,
                color: isActive("/issues") ? "#ffffff" : "#94a3b8",
                backgroundColor: isActive("/issues") ? "#181a24" : "transparent",
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <span style={{ fontSize: 14 }}>📋</span>
              {!collapsed && <span>Everything</span>}
            </Link>
          </div>

          {/* SECTION: TRACK (MATCHING THE SCREENSHOT EXACTLY) */}
          <div style={{ marginTop: 22 }}>
            {!collapsed && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#475569",
                  padding: "0 12px 8px 12px",
                }}
              >
                Track
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: collapsed ? "center" : "space-between",
                  padding: collapsed ? "6px 0" : "6px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  color: "#cbd5e1",
                  cursor: "pointer",
                }}
                title="Target: command_injection"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#38bdf8" }} />
                  {!collapsed && <span>command_injection</span>}
                </div>
                {!collapsed && <span style={{ color: "#eab308", fontSize: 11 }}>★</span>}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: collapsed ? "center" : "space-between",
                  padding: collapsed ? "6px 0" : "6px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  color: "#cbd5e1",
                  cursor: "pointer",
                }}
                title="Target: path_traversal"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#a855f7" }} />
                  {!collapsed && <span>path_traversal</span>}
                </div>
                {!collapsed && <span style={{ color: "#eab308", fontSize: 11 }}>★</span>}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: collapsed ? "6px 0" : "6px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 6,
                  fontSize: 12,
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
                title="Discord: #security-incidents"
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10b981" }} />
                {!collapsed && <span>#security-incidents</span>}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: collapsed ? "6px 0" : "6px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 6,
                  fontSize: 12,
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
                title="SLSA Level 3 Provenance"
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#f59e0b" }} />
                {!collapsed && <span>SLSA Provenance</span>}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: collapsed ? "6px 0" : "6px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 6,
                  fontSize: 12,
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
                title="4-Gate Fail-Closed Sandbox"
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#ec4899" }} />
                {!collapsed && <span>4-Gate Sandbox</span>}
              </div>
            </div>
          </div>

          {/* SECTION: NAVIGATION TO OTHER PAGES */}
          <div style={{ marginTop: 22 }}>
            {!collapsed && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#475569",
                  padding: "0 12px 8px 12px",
                }}
              >
                Pages
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Link
                href="/reviews"
                title="Review Console (Diff Triage)"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "8px 0" : "8px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 6,
                  fontSize: 12,
                  color: isActive("/reviews") ? "#ffffff" : "#94a3b8",
                  backgroundColor: isActive("/reviews") ? "#181a24" : "transparent",
                  textDecoration: "none",
                }}
              >
                <span style={{ fontSize: 13 }}>🔍</span>
                {!collapsed && <span>Review Console</span>}
              </Link>

              <Link
                href="/"
                title="Overview & 3D Interactive Landing"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "8px 0" : "8px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 6,
                  fontSize: 12,
                  color: isActive("/") ? "#ffffff" : "#94a3b8",
                  backgroundColor: isActive("/") ? "#181a24" : "transparent",
                  textDecoration: "none",
                }}
              >
                <span style={{ fontSize: 13 }}>🌐</span>
                {!collapsed && <span>Landing Page</span>}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER */}
      <div
        style={{
          padding: collapsed ? "14px 6px" : "14px 12px",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {onOpenWispr && (
          <button
            onClick={onOpenWispr}
            title="Wispr Voice Flow Scorecard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: collapsed ? "6px 0" : "6px 10px",
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: 6,
              background: "rgba(168, 85, 247, 0.12)",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              color: "#d8b4fe",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <span>🎙️</span>
            {!collapsed && <span>Wispr Voice Flow</span>}
          </button>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: collapsed ? "6px 0" : "6px 10px",
            justifyContent: collapsed ? "center" : "flex-start",
            fontSize: 12,
            color: "#64748b",
            cursor: "pointer",
          }}
          title="Need Help / Documentation"
        >
          <span>❓</span>
          {!collapsed && <span>Need Help</span>}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: collapsed ? "6px 0" : "6px 10px",
            justifyContent: collapsed ? "center" : "flex-start",
            fontSize: 12,
            color: "#64748b",
            cursor: "pointer",
          }}
          title="Settings"
        >
          <span>⚙️</span>
          {!collapsed && <span>Settings</span>}
        </div>

        {!collapsed && (
          <div
            style={{
              marginTop: 6,
              padding: "8px 10px",
              borderRadius: 6,
              backgroundColor: "#13141c",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              A
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Ayush Kumar
              </div>
              <div style={{ fontSize: 10, color: "#10b981" }}>Commander</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
