# VAYU MCP Client Configuration Guide

This guide details how to connect the **VAYU MCP Server** to compatible AI coding clients using standard `stdio` transport.

---

## 1. Prerequisites

Before configuring your client, verify that VAYU is installed and runnable on your machine:

```bash
# 1. Activate your virtual environment
cd /path/to/vayu
source venv/bin/activate

# 2. Install VAYU in editable mode (if not already done)
pip install -e .

# 3. Test that the executable is working
vayu-mcp --help
```

Locate the absolute path to your Python virtual environment executable:
- macOS/Linux: `/path/to/vayu/venv/bin/vayu-mcp`
- Windows: `C:\path\to\vayu\venv\Scripts\vayu-mcp.exe`

---

## 2. Claude Desktop Setup

### Configuration File Locations
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Option A: Using the Virtualenv Executable (Recommended)
Add VAYU under `mcpServers` in your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "vayu": {
      "command": "/Users/ayush/Desktop/hackto/vayu/venv/bin/vayu-mcp",
      "args": [
        "--allowed-root", "/Users/ayush/Desktop/hackto/vayu"
      ],
      "env": {
        "AIKAVACH_OLLAMA_URL": "http://127.0.0.1:11434",
        "AIKAVACH_OLLAMA_MODEL": "gemma4:31b-cloud",
        "VAYU_MCP_MODE": "auto"
      }
    }
  }
}
```

### Option B: Using `uv`
If you use `uv`, you can run the server directly without pointing to a virtualenv script:

```json
{
  "mcpServers": {
    "vayu": {
      "command": "uv",
      "args": [
        "run",
        "--directory",
        "/Users/ayush/Desktop/hackto/vayu",
        "vayu-mcp"
      ],
      "env": {
        "VAYU_CONFIG": "/Users/ayush/Desktop/hackto/vayu/examples/vayu-config.example.toml"
      }
    }
  }
}
```

### Restart & Verification
1. Completely quit Claude Desktop (`Cmd + Q` on macOS, or right-click tray icon and exit).
2. Re-open Claude Desktop.
3. Look for the hammer icon ($\mathbf{\Omega}$) in the chat input bar.
4. Verify that the 9 VAYU tools appear:
   - `vayu_get_status`
   - `vayu_scan_repository`
   - `vayu_get_findings`
   - `vayu_analyze_finding`
   - `vayu_propose_patch`
   - `vayu_verify_patch`
   - `vayu_get_run_status`
   - `vayu_export_sarif`
   - `vayu_get_provenance`

---

## 3. Cursor Setup

### Configuration File Location
Create or edit `.cursor/mcp.json` in your project root, or navigate to **Cursor Settings $\to$ Features $\to$ MCP**:

```json
{
  "mcpServers": {
    "vayu": {
      "command": "/Users/ayush/Desktop/hackto/vayu/venv/bin/vayu-mcp",
      "args": [],
      "env": {
        "AIKAVACH_OLLAMA_URL": "http://127.0.0.1:11434",
        "AIKAVACH_OLLAMA_MODEL": "gemma4:31b-cloud"
      }
    }
  }
}
```

Click **"Enable"** or restart Cursor. In Composer or Chat, Cursor will automatically leverage VAYU when you ask questions like *"Scan this repository for security vulnerabilities."*

---

## 4. Claude Code CLI Setup

To enable VAYU in the official Anthropic Claude Code terminal CLI:

```bash
# Add VAYU MCP server to Claude Code
claude mcp add vayu -- /Users/ayush/Desktop/hackto/vayu/venv/bin/vayu-mcp

# Verify the integration
claude mcp list
```

---

## 5. Generic stdio MCP Client Configuration

Any MCP-compliant client that supports `stdio` transport can connect to VAYU using the following schema:

| Property | Value |
|---|---|
| **Protocol** | Model Context Protocol (MCP) |
| **Transport** | `stdio` |
| **Command** | `/path/to/vayu/venv/bin/vayu-mcp` |
| **Args** | `["--mode", "auto"]` |
| **Env** | `AIKAVACH_OLLAMA_URL=http://localhost:11434`, `AIKAVACH_OLLAMA_MODEL=gemma4:31b-cloud` |

---

## 6. Troubleshooting Common Issues

### 1. Tool Calls Hang or Time Out
- Check if Ollama is running:
  ```bash
  curl http://localhost:11434/api/tags
  ```
- If you don't have Ollama running, switch to deterministic offline mode:
  Set `"VAYU_MCP_MODE": "offline"` in your client config `env` block.

### 2. Client Reports "Server Disconnected Unexpectedly"
- Ensure no prints to `sys.stdout` are happening outside the FastMCP protocol.
- Check stderr logs in your client's developer console (e.g. Claude Desktop Developer Tools $\to$ Console).

### 3. "Access Denied: Path Outside Authorized Roots"
- By default, VAYU restricts operations to the current working directory or paths specified in `--allowed-root`.
- Add your project directory using the `--allowed-root` argument:
  ```json
  "args": ["--allowed-root", "/path/to/my/target/project"]
  ```

---

## 7. Uninstallation & Removal

To disconnect VAYU from your client:
1. Remove the `"vayu"` entry from your client configuration JSON file.
2. Restart the client application.
3. To uninstall the Python package from your virtual environment:
   ```bash
   pip uninstall vayu-crs
   ```
*(Target repositories, scan histories, and user files are never deleted during uninstallation.)*
