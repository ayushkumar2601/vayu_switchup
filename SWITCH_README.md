# ⚡ VAYU OS × Switch
## Autonomous Security Engineering Team & Multi-Agent Operations Platform
### *Detect vulnerabilities. Delegate remediation. Verify every patch. Ship secure code — together with AI teammates.*

[![Tests Passing](https://img.shields.io/badge/Tests-212%20Passing-brightgreen?style=for-the-badge&logo=pytest)](https://github.com/ayushkumar2601/vayucs)
[![Switch Protocol](https://img.shields.io/badge/Switch-Agent%20Protocol%20v1.0-blueviolet?style=for-the-badge)](https://github.com/sandbox-quantum/switch)
[![Verification](https://img.shields.io/badge/Verification-4--Gate%20Fail--Closed-success?style=for-the-badge)](https://github.com/ayushkumar2601/vayucs)
[![SLSA Level 3](https://img.shields.io/badge/Provenance-SLSA%20Level%203%20ECDSA-orange?style=for-the-badge)](https://github.com/ayushkumar2601/vayucs)

---

## 🏆 Hackathon Submissions & Target Tracks

* **Primary Track:** **Track 01 — Best Business Workflow ($2,000)**  
  *Enterprise Security Incident Response Squad:* An engineering team collaborates with `@vayu-analyst`, `@vayu-remediator`, and `@vayu-gatekeeper` in `#security-incidents` to investigate zero-days, synthesize verified patches, run 4-gate sandbox verification, and authorize GitHub PR releases.
* **Secondary Track:** **Track 02 — Best Personal / Creative Workflow ($2,000)**  
  *Personal Security Debt Backlog:* A solo developer connects personal repositories in `#personal-security` (`@vayu scan my repos and fix tech debt`) to maintain an automated Linear-style security backlog.
* **Side Track:** **Best Blog (AirPods 5)**  
  Complete technical architecture writeup: [BLOG_POST.md](./BLOG_POST.md)
* **Side Track:** **Code with Wispr ($500)**  
  Voice-dictated agent prompts, room commands, and demo voiceover: [WISPR_VOICE_SCRIPT.md](./WISPR_VOICE_SCRIPT.md)
* **Social Track:** **#HowISwitch (Mechanical Keyboards)**  
  Demo video and architectural breakdown on social channels.

---

## 🚀 30-Second Quickstart & Reproduction

You can reproduce the complete end-to-end multi-agent incident remediation workflow in one command:

```bash
# 1. Run the interactive end-to-end incident demo
bash run_switch_demo.sh --demo

# 2. Run the full test suite (all 202 unit & integration tests)
bash run_switch_demo.sh --test

# 3. View the Linear-Style Real-time Operations Board
cd vayu-nextjs && npm run dev
# Open http://localhost:3000/issues in your browser
```

---

## 🧠 System Architecture

```
[ Discord / Slack / Mattermost ]
             ▲
             │ (Chat Messages & Commands)
             ▼
[ Switch Agent Bridge (sandbox-quantum/switch) ]
   • Server-Sent Events (SSE Inbound)
   • HTTP POST (Outbound Room Messages)
             ▲
             │ (Switch Agent Protocol)
             ▼
[ VAYU OS Multi-Agent Squad ]
   ├── 🔍 @vayu-analyst     --> AST Taint Graph + Prompt Firewall (Untrusted Data Isolation)
   ├── 🛠️ @vayu-remediator  --> Minimal Patch Synthesis + 4-Gate Ephemeral Sandbox Verification
   └── 🛡️ @vayu-gatekeeper  --> Non-Negotiable Invariants + Human Sign-off (/approve)
             ▲
             │ (State & Telemetry)
             ▼
[ VAYU Operations Console (Next.js 16) ]
   • Linear-Style Kanban Board (/issues)
   • Real-Time Diff Viewer & Gate Pills (/reviews)
   • GitHub PR Release & SLSA Attestation
```

---

## 🛡️ The Four Verification Gates (Fail-Closed)

VAYU OS never trusts raw LLM output. Every synthesized patch must pass four deterministic verification gates inside an isolated ephemeral workspace before it can be presented to a human:

1. **Gate 1: Syntax & Indentation Lock** — Validates Python AST syntax and verifies that no out-of-scope files or indentation levels were modified.
2. **Gate 2: Functional Regression Tests** — Executes the repository's test harness to ensure zero functional regressions.
3. **Gate 3: Exploit Neutralization** — Replays the exploit payload against the patched code; the exploit must be neutralized and blocked.
4. **Gate 4: Semgrep Static Rescan** — Re-runs static analysis to verify zero lingering or introduced vulnerabilities.

Once all four gates pass, VAYU generates an **in-toto SLSA Level 3 Cryptographic Attestation** signed with an ECDSA P-256 keypair.

---

## 🔒 Non-Negotiable Security Invariants

1. **LLM Self-Approval Blocked:** An AI agent is strictly prohibited from approving its own patch.
2. **No Unverified Patches:** Only patches that pass 100% of all 4 verification gates can reach human review.
3. **Mandatory Human Sign-off:** No code is pushed to remote Git branches or opened as a PR without an authenticated human executing `/approve <issue_id>` in chat.
4. **Prompt Firewall Isolation:** All repository code and external inputs are wrapped in `BEGIN_UNTRUSTED_REPOSITORY_EVIDENCE` tags to eliminate prompt injection risks.
5. **Byte-Identical Original Invariant:** The host repository is never modified directly; execution is restricted to disposable sandboxes.

---

## 💬 Live Chat Workflow Example

```
👨‍💻 Ayush (Incident Commander):
@vayu-analyst investigate samples/vulnerable/command_injection

🔍 @vayu-analyst:
### 🔍 VAYU-Analyst Investigation Report
Issue ID: VAYU-108 | Severity: HIGH | CWE: CWE-78: Subprocess Shell True
Affected File: samples/vulnerable/command_injection/app.py:261
AST Taint Flow: app.py:176 (_initialize_schema) ➔ app.py:261 (subprocess.run)
Root Cause: User input concatenated into subprocess.run(shell=True).
👉 Handoff: Delegating remediation to @vayu-remediator.

🛠️ @vayu-remediator:
### 🛠️ VAYU-Remediator Patch & Verification Report
Issue ID: VAYU-108 | Target: app.py
```diff
- subprocess.run(command, shell=True, check=False)
+ subprocess.run(command.split(), check=False)
```
🛡️ 4-Gate Fail-Closed Sandbox Verification Results:
• Gate 1 (Syntax/AST Build): ✅ PASS
• Gate 2 (Functional Tests): ✅ PASS (0 regressions)
• Gate 3 (Exploit Neutralization): ✅ PASS (Payload blocked)
• Gate 4 (Semgrep Static Rescan): ✅ PASS (Clean)
📜 SLSA Level 3 Provenance: sha256:9f5d307bc022ee24... (ECDSA Signed)
👉 Action Required: @Ayush Reply `/approve VAYU-108` to authorize release.

👨‍💻 Ayush:
/approve VAYU-108

🛡️ @vayu-gatekeeper:
### 🚀 VAYU-Gatekeeper Release Authorization Complete
Issue ID: VAYU-108 — Status: RESOLVED & MERGED
Authorized By: Ayush (Role: Incident Commander)
• Remediation Branch Created: vayu-fix/vayu-108-cwe78
• Verified Patch Committed with Cryptographic SLSA Provenance
• GitHub Pull Request: https://github.com/ayushkumar2601/vayucs/pull/42
🎯 MTTR Outcome: Resolved and shipped in 2 minutes!
```

