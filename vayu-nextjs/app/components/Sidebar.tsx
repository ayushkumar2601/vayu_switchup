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
        width: collapsed ? 52 : 200,
        minWidth: collapsed ? 52 : 200,
        height: "100vh",
        backgroundColor: "#070809",
        borderRight: "1px solid #1c1d21",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "width 0.18s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        userSelect: "none",
        overflowX: "hidden",
        padding: collapsed ? "16px 8px" : "18px 16px",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* TOP: LOGO & NAV */}
      <div>
        {/* LOGO GLYPH (Blue concentric circle matching the reference screenshot exactly) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            marginBottom: 24,
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
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#f7f8f8",
                  letterSpacing: "-0.2px",
                }}
              >
                VAYU
              </span>
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
              padding: 2,
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {collapsed ? "▶" : "◀"}
          </button>
        </div>

        {/* PRIMARY WORKSPACES */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Link
            href="/dashboard"
            style={{
              fontSize: 13,
              fontWeight: isActive("/dashboard") ? 500 : 400,
              color: isActive("/dashboard") ? "#f7f8f8" : "#8a8f98",
              textDecoration: "none",
              padding: collapsed ? "6px 0" : "4px 0",
              textAlign: collapsed ? "center" : "left",
              display: "block",
            }}
          >
            {collapsed ? "D" : "My Desk"}
          </Link>

          <Link
            href="/issues"
            style={{
              fontSize: 13,
              fontWeight: isActive("/issues") ? 600 : 400,
              color: isActive("/issues") ? "#f7f8f8" : "#8a8f98",
              textDecoration: "none",
              padding: collapsed ? "6px 0" : "4px 0",
              textAlign: collapsed ? "center" : "left",
              display: "block",
            }}
          >
            {collapsed ? "E" : "Everything"}
          </Link>
        </div>

        {/* SECTION: TRACK (MATCHING THE SCREENSHOT EXACTLY) */}
        {!collapsed && (
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#62666d",
                marginBottom: 8,
              }}
            >
              Track
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 12,
                  color: "#8a8f98",
                  cursor: "pointer",
                }}
              >
                <span>• Cuebox</span>
                <span style={{ color: "#eab308", fontSize: 10 }}>★</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 12,
                  color: "#8a8f98",
                  cursor: "pointer",
                }}
              >
                <span>• Wayland</span>
                <span style={{ color: "#eab308", fontSize: 10 }}>★</span>
              </div>

              <div style={{ fontSize: 12, color: "#8a8f98", cursor: "pointer" }}>
                • Bluejay
              </div>
              <div style={{ fontSize: 12, color: "#8a8f98", cursor: "pointer" }}>
                • Dabble
              </div>
              <div style={{ fontSize: 12, color: "#8a8f98", cursor: "pointer" }}>
                • Highlight
              </div>
              <div style={{ fontSize: 12, color: "#8a8f98", cursor: "pointer" }}>
                • Figmate
              </div>
              <div style={{ fontSize: 12, color: "#8a8f98", cursor: "pointer" }}>
                • GGWP
              </div>
              <div style={{ fontSize: 12, color: "#8a8f98", cursor: "pointer" }}>
                • Giraffe
              </div>

              {/* INTERNAL SUB-SECTION */}
              <div style={{ marginTop: 6 }}>
                <div style={{ fontSize: 12, color: "#8a8f98", marginBottom: 4 }}>
                  • Internal
                </div>
                <div
                  style={{
                    paddingLeft: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    fontSize: 11,
                    color: "#62666d",
                  }}
                >
                  <span style={{ cursor: "pointer" }}>LaunchPad</span>
                  <span style={{ cursor: "pointer" }}>Mast</span>
                  <span style={{ cursor: "pointer" }}>Rev</span>
                  <span style={{ cursor: "pointer" }}>Shop Ditto</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: PAGES (PROPER REROUTING ACROSS WHOLE FRONTEND) */}
        {!collapsed && (
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#62666d",
                marginBottom: 8,
              }}
            >
              Pages
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <Link
                href="/reviews"
                style={{
                  fontSize: 12,
                  color: isActive("/reviews") ? "#f7f8f8" : "#8a8f98",
                  fontWeight: isActive("/reviews") ? 500 : 400,
                  textDecoration: "none",
                }}
              >
                • Review Console
              </Link>
              <Link
                href="/"
                style={{
                  fontSize: 12,
                  color: isActive("/") ? "#f7f8f8" : "#8a8f98",
                  fontWeight: isActive("/") ? 500 : 400,
                  textDecoration: "none",
                }}
              >
                • Landing Page
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER (Need Help, Settings) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          paddingTop: 12,
        }}
      >
        {onOpenWispr && (
          <div
            onClick={onOpenWispr}
            style={{
              fontSize: 12,
              color: "#828fff",
              cursor: "pointer",
              textAlign: collapsed ? "center" : "left",
              fontWeight: 500,
            }}
          >
            {collapsed ? "🎙️" : "Wispr Voice Flow"}
          </div>
        )}

        <div
          style={{
            fontSize: 12,
            color: "#62666d",
            cursor: "pointer",
            textAlign: collapsed ? "center" : "left",
          }}
        >
          {collapsed ? "H" : "Need Help"}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#62666d",
            cursor: "pointer",
            textAlign: collapsed ? "center" : "left",
          }}
        >
          {collapsed ? "S" : "Settings"}
        </div>
      </div>
    </aside>
  );
}
