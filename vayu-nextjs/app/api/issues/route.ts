import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { pythonExecutable, REPO_ROOT } from "../_lib/engine";

const execFileAsync = promisify(execFile);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status") ?? "";

  // 1. Try FastAPI coordination service first
  try {
    const fastApiRes = await fetch(`http://localhost:8000/api/issues${statusFilter ? `?status=${statusFilter}` : ""}`, {
      signal: AbortSignal.timeout(1000),
    });
    if (fastApiRes.ok) {
      const data = await fastApiRes.json();
      return NextResponse.json(data);
    }
  } catch {
    // FastAPI not running, fall through to Python state reader
  }

  // 2. Direct read from vayu_platform.state via Python
  try {
    const pyScript = `
import json
import os
import sys

# Ensure repository root is in sys.path
sys.path.insert(0, os.getcwd())

from vayu_platform.state import global_state

status = "${statusFilter}" if "${statusFilter}" else None
issues = global_state.list_issues(status=status)
print(json.dumps([i.to_dict() for i in issues]))
`;
    const { stdout } = await execFileAsync(
      pythonExecutable(),
      ["-c", pyScript],
      {
        cwd: REPO_ROOT,
        env: { ...process.env, PYTHONPATH: REPO_ROOT },
        timeout: 5000,
      }
    );
    const data = JSON.parse(stdout.trim() || "[]");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to query vayu_platform state:", error);
    return NextResponse.json([], { status: 200 });
  }
}

