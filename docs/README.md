# 📚 VAYU Documentation Hub

Welcome to the comprehensive documentation suite for **VAYU OS — Autonomous Cyber Reasoning System (CRS) & Switch SecOps Multi-Agent Platform**.

VAYU is an autonomous cyber reasoning system inspired by DARPA's AI Cyber Challenge (AIxCC), designed to detect, reason about, synthesize minimal patches for, and deterministically verify security vulnerabilities with zero human intervention. Integrated with **SandboxAQ Switch**, VAYU deploys an autonomous SecOps incident squad right inside your chat platform (Discord, Slack).

---

## 🗺️ Documentation Directory

| Document | Description | Target Audience |
|---|---|---|
| **[Master Technical Documentation](../TECHNICAL_DOCUMENTATION.md)** | Unified, monolithic technical manual covering the complete system architecture, Switch multi-agent protocol, mathematical invariants, data contracts, and threat models. | Architects, Security Researchers, Core Contributors |
| **[System README](../README.md)** | Root repository overview, 30-second quickstarts, system architecture badges, and Linear UI previews. | Everyone |
| **[Architecture & Design Specification](ARCHITECTURE.md)** | Deep architectural analysis, the 7-layer subsystem breakdown, and DARPA AIxCC design philosophy. | Systems Engineers & Architects |
| **[Formal Security Invariants](DESIGN.md)** | Formal safety invariants, mathematical models, and zero-trust LLM boundary definitions. | Security Engineers & Cryptographers |
| **[Switch Multi-Agent Specification](SWITCH_README.md)** | Autonomous incident squad architecture, SSE bridge, room message schemas, and human sign-off loop. | Multi-Agent Developers & Integrators |
| **[Wispr Flow Voice Dictation](WISPR_VOICE_SCRIPT.md)** | Natural voice dictation transcripts, intent normalization pipelines, and hackathon audio guides. | Voice Operators & Hackathon Reviewers |
| **[Technical Blog Post](BLOG_POST.md)** | Complete technical deep-dive: "From 68-Day MTTR to 2 Minutes: How We Built an Autonomous DevSecOps Engineering Team in Discord". | General Readers & Hackathon Judges |
| **[Subagent Engineering Directives](skills.md)** | Engineering handbook, subagent operational rules, and Antigravity IDE coding directives. | Subagent Developers & AI Assistants |
| **[Operational How-To Guide](HOW_TO_USE.md)** | Step-by-step setup, Ollama environment configuration, and local running instructions. | Developers & System Operators |
| **[Verification & Cloud Sandboxing](cloud-and-local-sandboxing.md)** | Dual-mode verification: Local ephemeral `/tmp` sandboxes vs **DigitalOcean Cloud KVM Droplets** with RAM-only Ed25519 tunnels and 10m TTL kill switch. | DevOps, Cloud Engineers, SREs |
| **[CLI & Operational Reference](cli-reference.md)** | Complete CLI reference for `vayu`, `vayu scan`, `vayu skills`, and `vayu-mcp`, flags, arguments, and exit codes. | Operators & Developers |
| **[Model Context Protocol (MCP) Server](mcp-server.md)** | Architectural guide and complete reference for the 9 core MCP tools running over JSON-RPC `stdio`. | AI Assistant Integrators |
| **[MCP Client Configuration Guide](mcp-clients.md)** | Step-by-step configuration for Claude Desktop, Cursor, Windsurf, Claude Code, and Goose. | Developers using AI IDEs |
| **[MCP Security Architecture](mcp-security.md)** | Security boundary enforcement, session isolation, and filesystem traversal defenses for MCP. | AppSec & Security Auditors |
| **[VAYU Skills Ecosystem](skills-ecosystem.md)** | Agent Skills architecture (`.agents/skills/`), catalog of 8 bundled skills, and `vayu skills` CLI workflows. | Agent Tooling Developers |
| **[Real-Time Streaming & Web Review Console](web-review-console.md)** | Next.js 16 Web Dashboard, NDJSON streaming wire protocol (`crs.stream`), 3D WebGL terrain, Linear Kanban & Triage, and direct GitHub commit/PR push. | Frontend & Fullstack Engineers |
| **[SLSA Provenance & SARIF Export](slsa-and-sarif.md)** | in-toto SLSA v1.0 attestations, ECDSA (P-256) cryptographic signatures, and OASIS SARIF v2.1.0 reporting. | Supply Chain & Compliance Teams |
| **[Python API Reference](api-reference.md)** | Comprehensive module-by-module Python API documentation and Pydantic data contracts. | Software Developers & SDK Users |

---

## ⚡ Quick Navigation

### 1. Running the Switch Multi-Agent Interactive Demo
```bash
bash run_switch_demo.sh --demo
```

### 2. Running Local Scan & Auto-Remediation
```bash
source venv/bin/activate
source .env.local
python -m crs.vayu samples/vulnerable/command_injection
```

### 3. Running with DigitalOcean Hardware Hypervisor Sandbox
```bash
python -m crs.vayu scan samples/vulnerable/command_injection --sandbox digitalocean
```

### 4. Launching the Linear Web UI Suite
```bash
cd vayu-nextjs
npm run dev
# Open http://localhost:3000/issues (Kanban)
# Open http://localhost:3000/my-issues (Triage List)
# Open http://localhost:3000/reviews (Code Review Console)
# Open http://localhost:3000/dashboard (3D Reasoning Terrain)
```
