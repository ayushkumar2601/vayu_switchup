"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#010102",
        overflow: "hidden",
        color: "#f7f8f8",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
      }}
    >
      {!isLandingPage && <Sidebar />}
      <div
        id="app-main-content"
        style={{
          flex: 1,
          minWidth: 0,
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
          backgroundColor: "#010102",
        }}
      >
        {children}
      </div>
    </div>
  );
}
