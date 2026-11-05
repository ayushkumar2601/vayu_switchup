# How to Use VAYU (Autonomous CRS)

This guide explains how to configure and run the Vayu Autonomous Cyber Reasoning System.

> [!TIP]
> **Preparing for a presentation or hackathon demo?** See the complete [DEMO_GUIDE.md](file:///Users/ayush/Desktop/hackto/vayu/DEMO_GUIDE.md) for the word-for-word presentation script, terminal matrix, and judge Q&A defense.

## 1. Prerequisites (Ollama)
Vayu requires Ollama to run the AI models locally. Make sure you have Ollama installed and your desired model downloaded.

For example, to use the Llama 3 model:
```bash
ollama pull llama3
```

## 2. Environment Setup
Before running the Vayu CLI, you must activate the Python virtual environment and load the environment variables.

Run these commands in your terminal:
```bash
# 1. Activate the Python environment
source venv/bin/activate

# 2. Load your local environment variables
source .env.local
```

Your `.env.local` file should look like this:
```bash
export AIKAVACH_LLM_PROVIDER=ollama
export AIKAVACH_OLLAMA_URL=http://localhost:11434
export AIKAVACH_OLLAMA_MODEL=llama3  # Or qwen2.5-coder:7b-instruct
```

## 3. Running the Vayu CLI
The main command to run the autonomous reasoning system is:

```bash
python -m crs.vayu <path_to_repository>
```

### Example
To test the system against the provided vulnerable sample:
```bash
python -m crs.vayu samples/vulnerable/command_injection
```

## 4. What Happens When You Run It?
When you execute the command, the Vayu CLI runs completely autonomously through a 4-stage pipeline:

1. **FIND (Static Analysis):** It scans the target repository for vulnerabilities (e.g., Command Injection).
2. **REASON (AI Reasoning):** The local Ollama model analyzes the finding to determine the root cause, security impact, and remediation strategy.
3. **PATCH (AI Generation):** The AI generates a secure code patch that removes the vulnerability while preserving the program's intended structure.
4. **VERIFY (Formal Verification):** The system isolates the code, applies the patch, and runs tests to ensure the application still builds and functions correctly before marking it as `VERIFIED`.

## 5. Using the VAYU Skills CLI

VAYU includes a dedicated Skills CLI (`vayu skills`) inspired by modern agent tooling, allowing you to install reusable AI coding skills directly into your local repositories or global client environments.

### Quick Start

```bash
# Explore the bundled skills catalog
vayu skills list

# Search for skills by topic
vayu skills search security

# Install a skill into your current project (.agents/skills/)
vayu skills add security-analysis

# Install globally for user-level AI clients
vayu skills add security-analysis --global

# Install an external skill from GitHub
vayu skills add frontend-design --from https://github.com/anthropics/skills

# Inspect a skill's details and instructions preview
vayu skills info security-analysis

# Run diagnostics and verify skills health
vayu skills doctor

# Remove an installed skill
vayu skills remove security-analysis
```

### Supported Bundled Skills

- `security-analysis` — Vulnerability detection & root-cause reasoning
- `secure-code-review` — Defect identification & unsafe pattern checking
- `vulnerability-remediation` — Minimal, single-site security patch proposals
- `patch-verification` — 4-gate fail-closed deterministic verification
- `prompt-injection-defense` — Untrusted content isolation & prompt firewalls
- `sast-workflow` — Semgrep AST rules & evidence synthesis
- `mcp-development` — Model Context Protocol tool development
- `vayu-development` — VAYU system architecture & coding invariants

