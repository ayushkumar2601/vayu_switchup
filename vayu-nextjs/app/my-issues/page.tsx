import { Metadata } from "next";
import { Suspense } from "react";
import MyIssuesView from "./MyIssuesView";

export const metadata: Metadata = {
  title: "My issues — VAYU OS Autonomous Security Engineering",
  description: "Linear-style security incident triage and operations list grouped by review, progress, and verification.",
};

export default function MyIssuesPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#010102",
            color: "#8a8f98",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
          }}
        >
          Loading My issues...
        </div>
      }
    >
      <MyIssuesView />
    </Suspense>
  );
}

