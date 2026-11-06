import type { Metadata } from "next";
import Dashboard from "../dashboard/Dashboard";
import "../dashboard/dashboard.css";

export const metadata: Metadata = {
  title: "VAYU · Pulse & System Reasoning Arena",
  description: "Live Pulse & 3D Threat Terrain Arena for the VAYU cyber reasoning system.",
};

export default function PulsePage() {
  return <Dashboard />;
}
