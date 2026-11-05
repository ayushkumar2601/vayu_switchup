# VAYU Model Context Protocol (MCP) Server

The **VAYU MCP Server** connects AI coding assistants (Claude Desktop, Claude Code, Cursor, Windsurf, and custom MCP clients) directly to VAYU's autonomous Cyber Reasoning System (CRS).

Through standard Model Context Protocol (MCP) over `stdio`, developers can instruct their AI assistants to inspect codebases, execute deterministic Semgrep static analysis, perform prompt-firewalled root cause analysis, synthesize indentation-locked patches, run 4-gate verification harnesses inside ephemeral sandboxes, and verify cryptographic SLSA v1.0 attestations.

---

## 1. Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│ AI Coding Assistant (Claude Desktop / Cursor / CLI)    │
└───────────────────────────┬────────────────────────────┘
                            │ Standard JSON-RPC over stdio
                            ▼
┌────────────────────────────────────────────────────────┐
│ VAYU FastMCP Server (vayu_mcp.server)                  │
│ - Strict stdout preservation (JSON-RPC only)           │
│ - Logging & diagnostics redirected to stderr           │
│ - Workspace boundary enforcement                       │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│ Session Manager       │       │ Core VAYU Engine      │
│ (vayu_mcp.session)    │       │ (crs.*)               │
│ - Run state isolation │       │ - RepositoryLoader    │
│ - Finding indexing    │       │ - StaticScanner       │
│ - Patch tracking      │       │ - EvidenceBuilder     │
│ - Verification logs   │       │ - ReasoningEngine     │
└───────────────────────┘       │ - PatchGenerator      │
                                │ - VerificationEngine  │
                                │ - SLSASigner / SARIF  │
                                └───────────────────────┘
```

The MCP server is a direct integration layer over the existing `crs/` core package. It introduces zero mock scanners or duplicate patching pipelines.

---

## 2. Tool Inventory (The 9 Core Tools)

### 1. `vayu_get_status`
Inspects server health, Semgrep CLI presence, local Ollama connectivity, verification sandbox environment, and workspace boundary policies.
- **Inputs**: None
- **Side Effects**: Read-only diagnostic check.
- **Returns**: Engine versions, Ollama connectivity status, Semgrep version, active model, and setup guidance.

### 2. `vayu_scan_repository`
Scans an authorized local codebase with Semgrep AST rules and computes an immutable composite SHA-256 fingerprint.
- **Inputs**:
  - `target_path` (string, required): Filesystem path to the target repository.
  - `timeout_seconds` (int, optional, default: 60): Maximum scan timeout.
- **Side Effects**: Read-only scan. Initializes a new `run_id` in the session manager.
- **Returns**: `run_id`, `repository_sha256`, `total_findings`, severity tally, finding IDs, and next steps.

### 3. `vayu_get_findings`
Retrieves normalized vulnerability findings for an existing scan run.
- **Inputs**:
  - `run_id` (string, required): Run identifier returned by `vayu_scan_repository`.
  - `severity` (string, optional): Filter by severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`).
  - `limit` (int, optional, default: 50): Maximum findings to return (1-100).
  - `offset` (int, optional, default: 0): Pagination offset.
- **Side Effects**: Read-only.
- **Returns**: List of findings with line numbers, rule IDs, and bounded evidence summaries.

### 4. `vayu_analyze_finding`
Performs guarded root-cause analysis on a specific finding. Code is bounded to $\pm 5$ lines and quarantined in `UNTRUSTED_REPOSITORY_CONTENT` tags.
- **Inputs**:
  - `run_id` (string, required): Active scan run identifier.
  - `finding_id` (string, required): Vulnerability finding identifier to analyze.
- **Side Effects**: Invokes local Ollama model (or deterministic offline rule fallback).
- **Returns**: Root cause, security impact, remediation strategy, assumptions, and evidence citations.

### 5. `vayu_propose_patch`
Synthesizes a minimal, single-line candidate patch proposal with indentation normalization locking. Validates single-file boundaries, valid hunk line numbers, and rejects file creation/deletion.
- **Inputs**:
  - `run_id` (string, required): Active scan run identifier.
  - `finding_id` (string, required): Finding identifier to remediate.
- **Side Effects**: Generates and structurally validates unified diff. Stores patch in session state. Does **NOT** modify the original repository.
- **Returns**: Candidate unified diff, structural validation result, confidence, and unverified candidate warning.

### 6. `vayu_verify_patch`
Verifies a candidate patch inside an isolated, disposable sandbox directory (`/tmp/aikavach-verification-XXXXXX`).
- **Inputs**:
  - `run_id` (string, required): Active scan run identifier.
  - `finding_id` (string, required): Finding identifier to verify.
- **Side Effects**: Clones repository to temporary sandbox, applies patch, and executes:
  - **Gate 1**: Build/Syntax AST compilation check (`py_compile`).
  - **Gate 2**: Functional unit test suite (`pytest`).
  - **Gate 3**: Security property AST invariant check (`ast.walk`).
  - **Gate 4**: Independent static rescan (`semgrep`).
  Destroys temporary sandbox upon exit. Original repository remains completely untouched.
- **Returns**: Final verdict (`VERIFIED` vs `REJECTED`), gate-by-gate pass/fail breakdown, and failure reasons.

### 7. `vayu_get_run_status`
Retrieves the comprehensive end-to-end execution state and summary of a scan run.
- **Inputs**:
  - `run_id` (string, required): Active scan run identifier.
- **Side Effects**: Read-only.
- **Returns**: Findings count, analyzed count, patch proposal count, verified/rejected count, and per-finding statuses (`DISCOVERED`, `ANALYZED`, `PROPOSED`, `VERIFIED`, `REJECTED`).

### 8. `vayu_export_sarif`
Exports scan findings and verified remediation outcomes in OASIS SARIF v2.1.0 format.
- **Inputs**:
  - `run_id` (string, required): Active scan run identifier.
  - `output_path` (string, optional): Target file path to write SARIF JSON. If omitted, returns SARIF object directly in tool output.
- **Side Effects**: Writes SARIF JSON if path is provided.
- **Returns**: Export confirmation or full SARIF document.

### 9. `vayu_get_provenance`
Generates and cryptographically verifies an in-toto SLSA v1.0 provenance attestation signed with ECDSA (curve `SECP256R1` over SHA-256).
- **Inputs**:
  - `run_id` (string, required): Active scan run identifier.
  - `finding_id` (string, optional): Target finding identifier (defaults to first verified finding).
- **Side Effects**: Read-only cryptographic attestation generation.
- **Returns**: In-toto SLSA v1.0 statement, repository SHA-256, patch SHA-256, verification gate logs, and signature verification outcome (`signature_valid: true`).

---

## 3. Local Installation & Startup

### Option A: Editable Local Development Installation (Recommended)
```bash
# 1. Clone repository & activate virtual environment
cd /path/to/vayu
source venv/bin/activate

# 2. Install VAYU in editable mode with MCP dependencies
pip install -e .

# 3. Test that the console script is installed and runnable
vayu-mcp --help
```

### Option B: Isolated Installation via `uv`
```bash
# Run vayu-mcp directly through uv without activating a shell
uv run --directory /path/to/vayu vayu-mcp
```

### Starting the Server Manually
To test the server on standard I/O:
```bash
vayu-mcp
```
*(The server will await JSON-RPC initialization frames on stdin and stream responses to stdout.)*

---

## 4. Example Developer Workflow

In an MCP-enabled coding client (e.g. Claude Desktop or Cursor), a developer can conduct a complete autonomous audit and remediation cycle using natural language:

1. **Check Status**: *"Check if VAYU is available and which model is running."*
   $\to$ Client calls `vayu_get_status`
2. **Scan Codebase**: *"Scan the repository at `samples/vulnerable/command_injection`."*
   $\to$ Client calls `vayu_scan_repository(target_path="samples/vulnerable/command_injection")`
3. **Inspect High-Severity Findings**: *"Show me any high-severity findings."*
   $\to$ Client calls `vayu_get_findings(run_id="...", severity="HIGH")`
4. **Analyze Root Cause**: *"Analyze finding SF-23B37C4E."*
   $\to$ Client calls `vayu_analyze_finding(run_id="...", finding_id="SF-23B37C4E")`
5. **Propose Candidate Fix**: *"Propose a minimal patch for this finding."*
   $\to$ Client calls `vayu_propose_patch(run_id="...", finding_id="SF-23B37C4E")`
6. **Verify in Sandbox**: *"Verify the candidate patch in the isolated sandbox across all 4 gates."*
   $\to$ Client calls `vayu_verify_patch(run_id="...", finding_id="SF-23B37C4E")`
7. **Verify Cryptographic Provenance**: *"Show the SLSA v1.0 attestation for this verified fix."*
   $\to$ Client calls `vayu_get_provenance(run_id="...", finding_id="SF-23B37C4E")`
8. **Export SARIF**: *"Export the security findings to `artifacts/report.sarif`."*
   $\to$ Client calls `vayu_export_sarif(run_id="...", output_path="artifacts/report.sarif")`
