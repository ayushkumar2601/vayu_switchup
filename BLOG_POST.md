# From 68-Day MTTR to 2 Minutes: How We Built an Autonomous DevSecOps Engineering Team in Discord Using Switch and VAYU CRS

*By Ayush Kumar • Flip the Switch Hackathon 2026*  
*Targeting Track 01 (Best Business Workflow) & Side Track (Best Blog)*

---

## The Existential Dilemma of Modern DevSecOps

In software engineering, finding a critical vulnerability is only 5% of the battle. The true nightmare is the **Mean Time to Remediate (MTTR)**, which currently averages **68 days** across the enterprise software industry.

Why does it take over two months to fix an injection vulnerability or a hardcoded secret? 

Because security remediation is completely fragmented:
1. An alert fires in Sentry, Datadog, or GitHub Dependabot.
2. An on-call engineer gets paged, context-switches to a bash terminal, and manually tries to read logs.
3. They jump into Slack to ask: *"Who owns the checkout service? Did anyone touch `app.py` in the last release?"*
4. A security engineer opens a static analyzer to trace whether the input is actually tainted.
5. A developer drafts a patch, but is terrified of breaking production.
6. The PR sits in code review purgatory for three weeks waiting for QA sign-off.

We asked a radical question for the **Flip the Switch Hackathon**:  
**What if your security operations team wasn’t an external silo, but an autonomous engineering squad living right inside your team chat?**

Meet **VAYU OS** — an Autonomous Security Engineering & Operations Platform powered by **Switch** (`sandbox-quantum/switch`).

---

## Why Switch is the Critical Missing Layer

Most AI security tools are isolated CLI commands or web dashboards. But developers don't live in isolated dashboards; **developers live in Slack, Discord, and Microsoft Teams**.

**Switch** provides the open-source infrastructure that turns AI models into interactive teammates:
- Every chat channel becomes a **Room** with a shared message and context log.
- Agents join with their own name, role, and avatar.
- Agents and humans communicate via the **Switch Agent Protocol** (Server-Sent Events inbound, HTTP outbound).

Instead of replacing our existing Cyber Reasoning System (**VAYU**), we wrapped Switch around it to create an autonomous multi-agent squad.

---

## Meet the Squad: 3 Autonomous Teammates

We defined our squad topology in `switch/templates/vayu-secops.template.yaml`:

```yaml
version: "1.0"
team: "vayu-secops"
agents:
  - name: "vayu-analyst"
    description: "Deep CPG and AST taint flow security investigator."
    addressing: anyone
  - name: "vayu-remediator"
    description: "Autonomous patch synthesis and 4-gate sandbox verification engineer."
    addressing: owner-agents
  - name: "vayu-gatekeeper"
    description: "Security policy enforcer and human-in-the-loop release manager."
    addressing: anyone
room:
  name: "security-incidents"
  bridge: "discord"
```

### 1. `🔍 @vayu-analyst` (The Investigator)
When an incident is reported, the Analyst traverses the repository's Abstract Syntax Tree (AST) and Code Property Graph (CPG). It traces the taint flow from the user-controlled parameter to the dangerous execution sink (e.g. `subprocess.run(shell=True)`). 

Crucially, it passes all repository code through VAYU’s **Prompt Firewall**, wrapping untrusted code in strict data tags so malicious comments cannot trigger prompt injection.

### 2. `🛠️ @vayu-remediator` (The Patch & Verification Engineer)
The Remediator receives the finding and synthesizes a minimal, indentation-locked code diff. 

Unlike typical AI bots that simply guess a fix and hallucinate success, the Remediator provisions an **isolated ephemeral sandbox** and subjects the patch to VAYU’s **Four-Gate Fail-Closed Verification Engine**:
* **Gate 1 (Syntax & Indentation Lock):** AST validation ensures zero syntax errors or whitespace corruption.
* **Gate 2 (Functional Tests):** Runs the full test suite to guarantee zero functional regressions.
* **Gate 3 (Exploit Neutralization):** Replays the actual exploit payload against the sandbox; the attack must be blocked.
* **Gate 4 (Semgrep Rescan):** Deterministic static analysis confirms no lingering or newly introduced vulnerabilities.

Once verified, it generates an **in-toto SLSA Level 3 Cryptographic Attestation** signed with an ECDSA P-256 keypair.

### 3. `🛡️ @vayu-gatekeeper` (The Human-in-the-Loop Release Gate)
We established a non-negotiable security invariant: **An LLM can never approve its own patch.**

The Gatekeeper posts the verified diff, test logs, and cryptographic SLSA digest into Discord and requests human sign-off:  
> `@Ayush (Incident Commander): All 4 verification gates passed. Do you authorize opening a remediation PR? Reply /approve VAYU-101.`

Only when an authenticated human lead types `/approve` does the Gatekeeper create the remediation branch, commit the patch with provenance, and open the GitHub PR.

---

## Under the Hood: The Switch Agent Protocol Bridge

We built an asynchronous Python client (`switch/bridge/client.py`) that subscribes to Switch's SSE event stream:

```python
async def listen_events(self, room_id: str, handler: Callable):
    url = f"{self.base_url}/rooms/{room_id}/events"
    async with aconnect_sse(client, "GET", url, headers=self._headers) as event_source:
        async for sse in event_source.aiter_sse():
            event = SwitchEvent(
                event_id=sse.id,
                event_type=sse.event or "message.created",
                room_id=room_id,
                data=json.loads(sse.data)
            )
            await handler(event)
```

When an event arrives, our `MessageDispatcher` routes commands and mentions. Notice the autonomous handoff:

```python
# When VAYU-Analyst completes investigation, it autonomously notifies Remediator
if response.sender_agent_id == "vayu-analyst" and response.metadata.get("status") == "handoff_to_remediator":
    logger.info("Autonomous Handoff: VAYU-Analyst -> VAYU-Remediator")
    remediator_response = await handle_remediator_task(...)
    await self.client.post_message(remediator_response)
```

---

## The Complete Incident Lifecycle in 150 Seconds

Here is what our live Discord room looks like during an incident:

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
@@ -261,1 +261,1 @@
- subprocess.run(command, shell=True, check=False)
+ subprocess.run(command.split(), check=False)

🛡️ 4-Gate Fail-Closed Sandbox Verification Results:
• Gate 1 (Syntax/AST Build): ✅ PASS
• Gate 2 (Functional Tests): ✅ PASS (0 regressions)
• Gate 3 (Exploit Neutralization): ✅ PASS (Payload blocked)
• Gate 4 (Semgrep Static Rescan): ✅ PASS (Clean)
📜 SLSA Level 3 Provenance: sha256:9f5d307bc022ee24... (ECDSA Signed)
👉 Action Required: @Ayush Reply /approve VAYU-108 to authorize release.

👨‍💻 Ayush:
/approve VAYU-108

🛡️ @vayu-gatekeeper:
### 🚀 VAYU-Gatekeeper Release Authorization Complete
Issue ID: VAYU-108 — Status: RESOLVED & MERGED
Authorized By: Ayush (Role: Incident Commander)
• Remediation Branch: vayu-fix/vayu-108-cwe78
• Verified Patch Committed with Cryptographic SLSA Attestation
• GitHub Pull Request: https://github.com/ayushkumar2601/vayucs/pull/42
🎯 MTTR Outcome: Resolved and shipped in 2 minutes!
```

Simultaneously, our Next.js Linear-style board (`/issues`) updates in real time over SSE, moving the issue card from `INVESTIGATING` ➔ `PATCHING` ➔ `VERIFYING` ➔ `HUMAN_REVIEW` ➔ `DONE`.

---

## Key Lessons Learned Building on Switch

1. **Collaboration Beats Chatbots:** A single chatbot trying to do everything fails. Breaking responsibilities across an Analyst, a Remediator, and a Gatekeeper creates clear division of labor and builds trust.
2. **Determinism is Mandatory for Security:** You can never let an LLM verify its own code. Keeping the 4 verification gates deterministic and independent in an ephemeral sandbox guarantees zero regressions.
3. **Switch is the Future of Human-AI Teaming:** Putting agents where humans already collaborate removes the friction of adopting new tools.

**Mean Time to Remediate went from 68 days to 2 minutes.** That is the power of Switch + VAYU OS.

---
*Open-source repository, reproduction scripts, and live demos available at: [github.com/ayushkumar2601/vayucs](https://github.com/ayushkumar2601/vayucs)*

