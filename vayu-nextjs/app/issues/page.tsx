import { Metadata } from "next";
import IssuesView from "./IssuesView";

export const metadata: Metadata = {
  title: "VAYU OS — Linear-Style Autonomous Security Operations Board",
  description: "Collaborative security engineering team powered by Switch.",
};

export default function IssuesPage() {
  return <IssuesView />;
}

