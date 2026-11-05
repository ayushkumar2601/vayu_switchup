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

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <aside
      style={{
        width: collapsed ? 56 : 220,
        minWidth: collapsed ? 56 : 220,
        height: "100vh",
        backgroundColor: "#070809",
        borderRight: "1px solid #23252a",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "width 0.18s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        userSelect: "none",
        overflow: "hidden",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 1. SCROLLABLE TOP & NAVIGATION CONTAINER */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          minHeight: 0,
          padding: collapsed ? "16px 8px" : "18px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {/* BRAND & COLLAPSE TOGGLE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
          }}
        >
          <Link
            href="/issues"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            {/* Iconic Concentric VAYU Glyph */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 0 12px rgba(37, 99, 235, 0.35)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#93c5fd" strokeWidth="1.6" strokeDasharray="3 3" />
                <path
                  d="M7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="12" r="2.8" fill="#60a5fa" />
              </svg>
            </div>
            {!collapsed && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#f7f8f8",
                    letterSpacing: "-0.2px",
                    lineHeight: 1.2,
                  }}
                >
                  VAYU OS
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: "#27a644",
                    letterSpacing: "0.2px",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      backgroundColor: "#27a644",
                      boxShadow: "0 0 6px rgba(39, 166, 68, 0.6)",
                    }}
                  />
                  SecOps Squad
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              background: "transparent",
              border: "none",
              color: "#62666d",
              cursor: "pointer",
              padding: 4,
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 4,
            }}
          >
            {collapsed ? "▶" : "◀"}
          </button>
        </div>

        {/* WORKSPACES NAVIGATION */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Link
            href="/issues"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12.5,
              fontWeight: isActive("/issues") ? 600 : 400,
              color: isActive("/issues") ? "#f7f8f8" : "#8a8f98",
              backgroundColor: isActive("/issues") ? "#141516" : "transparent",
              border: isActive("/issues") ? "1px solid #23252a" : "1px solid transparent",
              borderRadius: 6,
              padding: collapsed ? "6px 0" : "6px 8px",
              textDecoration: "none",
              justifyContent: collapsed ? "center" : "flex-start",
              transition: "all 0.12s ease",
            }}
            title="Everything — Linear Kanban Incident Board"
          >
            <span style={{ fontSize: 13 }}>📋</span>
            {!collapsed && <span>Everything</span>}
          </Link>

          <Link
            href="/reviews"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12.5,
              fontWeight: isActive("/reviews") ? 600 : 400,
              color: isActive("/reviews") ? "#f7f8f8" : "#8a8f98",
              backgroundColor: isActive("/reviews") ? "#141516" : "transparent",
              border: isActive("/reviews") ? "1px solid #23252a" : "1px solid transparent",
              borderRadius: 6,
              padding: collapsed ? "6px 0" : "6px 8px",
              textDecoration: "none",
              justifyContent: collapsed ? "center" : "flex-start",
              transition: "all 0.12s ease",
            }}
            title="Review Console — PR Triage & 4-Gate Sandbox"
          >
            <span style={{ fontSize: 13 }}>🔍</span>
            {!collapsed && <span>Review Console</span>}
          </Link>

          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12.5,
              fontWeight: isActive("/dashboard") ? 600 : 400,
              color: isActive("/dashboard") ? "#f7f8f8" : "#8a8f98",
              backgroundColor: isActive("/dashboard") ? "#141516" : "transparent",
              border: isActive("/dashboard") ? "1px solid #23252a" : "1px solid transparent",
              borderRadius: 6,
              padding: collapsed ? "6px 0" : "6px 8px",
              textDecoration: "none",
              justifyContent: collapsed ? "center" : "flex-start",
              transition: "all 0.12s ease",
            }}
            title="My Desk — System Reasoning & 3D Terrain"
          >
            <span style={{ fontSize: 13 }}>🖥️</span>
            {!collapsed && <span>My Desk</span>}
          </Link>
        </div>

        {/* SECTION: TRACK (VULNERABILITY TARGETS) */}
        {!collapsed && (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                color: "#62666d",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                marginBottom: 4,
                paddingLeft: 4,
              }}
            >
              Track Targets
            </div>

            <Link
              href="/reviews?id=VAYU-8467"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 12,
                color: "#d0d6e0",
                textDecoration: "none",
                padding: "4px 8px",
                borderRadius: 5,
                transition: "background 0.12s ease",
              }}
              title="samples/vulnerable/command_injection"
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#5e6ad2", fontSize: 10 }}>•</span>
                <span>command_injection</span>
              </span>
              <span style={{ color: "#eab308", fontSize: 10 }} title="High Priority Incident">
                ★
              </span>
            </Link>

            <Link
              href="/reviews?id=VAYU-8470"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 12,
                color: "#d0d6e0",
                textDecoration: "none",
                padding: "4px 8px",
                borderRadius: 5,
                transition: "background 0.12s ease",
              }}
              title="samples/vulnerable/path_traversal"
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#a855f7", fontSize: 10 }}>•</span>
                <span>path_traversal</span>
              </span>
              <span style={{ color: "#eab308", fontSize: 10 }} title="High Priority Incident">
                ★
              </span>
            </Link>

            <Link
              href="/reviews?id=VAYU-8469"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 12,
                color: "#d0d6e0",
                textDecoration: "none",
                padding: "4px 8px",
                borderRadius: 5,
                transition: "background 0.12s ease",
              }}
              title="samples/vulnerable/sql_injection"
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#38bdf8", fontSize: 10 }}>•</span>
                <span>sql_injection</span>
              </span>
            </Link>
          </div>
        )}

        {/* SECTION: SECOPS INFRASTRUCTURE */}
        {!collapsed && (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                color: "#62666d",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                marginBottom: 4,
                paddingLeft: 4,
              }}
            >
              Infrastructure
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "#8a8f98",
                padding: "4px 8px",
              }}
              title="Discord Autonomous Incident Gateway: #security-incidents"
            >
              <span style={{ color: "#10b981", fontSize: 10 }}>•</span>
              <span>#security-incidents</span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 9,
                  padding: "1px 5px",
                  borderRadius: 3,
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  color: "#34d399",
                  fontWeight: 600,
                }}
              >
                LIVE
              </span>
            </div>

            <Link
              href="/reviews"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "#8a8f98",
                textDecoration: "none",
                padding: "4px 8px",
                borderRadius: 5,
              }}
              title="4-Gate Fail-Closed Sandbox Verification"
            >
              <span style={{ color: "#f59e0b", fontSize: 10 }}>•</span>
              <span>4-Gate Sandbox</span>
            </Link>

            <Link
              href="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "#8a8f98",
                textDecoration: "none",
                padding: "4px 8px",
                borderRadius: 5,
              }}
              title="SLSA Level 3 ECDSA P-256 Provenance Ledger"
            >
              <span style={{ color: "#ec4899", fontSize: 10 }}>•</span>
              <span>SLSA Provenance</span>
            </Link>
          </div>
        )}

      </div>

      {/* 2. PINNED BOTTOM FOOTER (ZERO COLLISION, EXACT LINEAR TOKENS) */}
      <div
        style={{
          flexShrink: 0,
          borderTop: "1px solid #23252a",
          padding: collapsed ? "12px 6px" : "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          backgroundColor: "#070809",
        }}
      >
        {onOpenWispr && (
          <button
            onClick={onOpenWispr}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 11.5,
              fontWeight: 500,
              color: "#828fff",
              background: "rgba(94, 106, 210, 0.1)",
              border: "1px solid rgba(94, 106, 210, 0.25)",
              borderRadius: 6,
              padding: collapsed ? "6px 0" : "5px 8px",
              cursor: "pointer",
              justifyContent: collapsed ? "center" : "flex-start",
              width: "100%",
              transition: "all 0.12s ease",
            }}
            title="Open Wispr Flow Voice Integration Modal"
          >
            <span>🎙️</span>
            {!collapsed && <span>Wispr Voice Flow</span>}
          </button>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            fontSize: 11,
            color: "#62666d",
            padding: "2px 4px",
          }}
        >
          <span
            style={{ cursor: "pointer", transition: "color 0.12s ease" }}
            title="Documentation and Support"
          >
            {collapsed ? "?" : "Need Help"}
          </span>
          {!collapsed && (
            <span
              style={{ cursor: "pointer", transition: "color 0.12s ease" }}
              title="Platform Settings"
            >
              Settings
            </span>
          )}
        </div>

        {/* USER PROFILE CARD (CLEANLY ANCHORED, ZERO OVERLAP) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            backgroundColor: "#0f1011",
            border: "1px solid #23252a",
            borderRadius: 7,
            padding: collapsed ? "6px" : "6px 8px",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
          title="Ayush Kumar — Incident Commander"
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: "#ffffff",
              flexShrink: 0,
              position: "relative",
            }}
          >
            AK
            <span
              style={{
                position: "absolute",
                bottom: -1,
                right: -1,
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "#27a644",
                border: "1.5px solid #0f1011",
              }}
            />
          </div>

          {!collapsed && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#f7f8f8",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                Ayush Kumar
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "#8a8f98",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                Incident Commander
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
