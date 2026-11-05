import { Metadata } from "next";
import { Suspense } from "react";
import ReviewsView from "./ReviewsView";

export const metadata: Metadata = {
  title: "VAYU CRS — Security Code Reviews & Automated Triage",
  description: "Autonomous Cyber Reasoning System code review and verified diff triage console.",
};

export default function ReviewsPage() {
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
          Loading Security Reviews...
        </div>
      }
    >
      <ReviewsView />
    </Suspense>
  );
}
