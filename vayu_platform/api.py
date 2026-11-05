from __future__ import annotations
"""FastAPI Coordination & Live SSE API for VAYU OS."""

import asyncio
import json
import os
import time
from typing import Any, AsyncGenerator, Dict, List, Optional

from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Route
from sse_starlette.sse import EventSourceResponse

from vayu_platform.state import SecurityIssue, global_state

# Event broadcaster queue for live web dashboard SSE stream
_subscribers: List[asyncio.Queue] = []


async def broadcast_event(event_type: str, data: Dict[str, Any]) -> None:
    """Broadcast state change event to all connected dashboard SSE clients."""
    payload = json.dumps({"event": event_type, "data": data, "timestamp": time.time()})
    for queue in list(_subscribers):
        try:
            await queue.put(payload)
        except Exception:
            _subscribers.remove(queue)


async def list_issues_endpoint(request: Request) -> JSONResponse:
    """Return all security issues grouped by status."""
    status_filter = request.query_params.get("status")
    issues = global_state.list_issues(status=status_filter)
    return JSONResponse([i.to_dict() for i in issues])


async def get_issue_endpoint(request: Request) -> JSONResponse:
    """Return single issue details with verification record."""
    issue_id = request.path_params["issue_id"]
    issue = global_state.get_issue(issue_id)
    if not issue:
        return JSONResponse({"error": "Issue not found"}, status_code=404)

    verification = global_state.get_verification(issue_id)
    resp = issue.to_dict()
    resp["verification"] = verification.to_dict() if verification else None
    return JSONResponse(resp)


async def approve_issue_endpoint(request: Request) -> JSONResponse:
    """Approve an issue awaiting human review (can be called from web dashboard)."""
    issue_id = request.path_params["issue_id"]
    body = {}
    try:
        body = await request.json()
    except Exception:
        pass

    approver = body.get("approver", "SecOps Lead (Web)")
    issue = global_state.get_issue(issue_id)
    if not issue:
        return JSONResponse({"error": "Issue not found"}, status_code=404)

    if issue.status != "HUMAN_REVIEW":
        return JSONResponse({"error": f"Issue cannot be approved from status {issue.status}"}, status_code=400)

    verification = global_state.get_verification(issue_id)
    if not verification or not verification.approved:
        return JSONResponse({"error": "All 4 verification gates must pass before approval"}, status_code=403)

    github_repo = os.getenv("GITHUB_REPOSITORY", "ayushkumar2601/vayucs")
    pr_url = f"https://github.com/{github_repo}/pull/42"

    updated = global_state.update_issue_status(
        issue_id=issue_id,
        status="DONE",
        github_pr_url=pr_url,
        actor_name=approver,
        actor_type="HUMAN",
    )
    await broadcast_event("issue.approved", updated.to_dict() if updated else {})
    return JSONResponse(updated.to_dict() if updated else {})


async def sse_event_stream(request: Request) -> EventSourceResponse:
    """Server-Sent Events endpoint streaming live issue updates to the dashboard."""
    queue: asyncio.Queue = asyncio.Queue()
    _subscribers.append(queue)

    async def event_generator() -> AsyncGenerator[Dict[str, str], None]:
        try:
            # Emit current snapshot first
            initial_issues = [i.to_dict() for i in global_state.list_issues()]
            yield {
                "event": "snapshot",
                "data": json.dumps({"issues": initial_issues}),
            }

            while True:
                if await request.is_disconnected():
                    break
                data = await queue.get()
                yield {"event": "update", "data": data}
        finally:
            if queue in _subscribers:
                _subscribers.remove(queue)

    return EventSourceResponse(event_generator())


routes = [
    Route("/api/issues", list_issues_endpoint, methods=["GET"]),
    Route("/api/issues/{issue_id}", get_issue_endpoint, methods=["GET"]),
    Route("/api/issues/{issue_id}/approve", approve_issue_endpoint, methods=["POST"]),
    Route("/api/stream", sse_event_stream, methods=["GET"]),
]

middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
]

app = Starlette(routes=routes, middleware=middleware)
