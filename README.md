# ⚡ Antigravity Auto-Accept

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=nextcortex.nextcortex-antigravity-auto-accept"><img src="https://img.shields.io/visual-studio-marketplace/d/nextcortex.nextcortex-antigravity-auto-accept?style=flat-square&logo=visual-studio-code" alt="Visual Studio Marketplace Downloads"></a>
  <a href="https://open-vsx.org/extension/nextcortex/nextcortex-antigravity-auto-accept"><img src="https://img.shields.io/open-vsx/dt/nextcortex/nextcortex-antigravity-auto-accept?style=flat-square&logo=eclipse" alt="Open VSX Downloads"></a>
  <img src="https://img.shields.io/badge/version-3.0.2-0078d4?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-43a047?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/telemetry-none-e53935?style=flat-square" alt="Telemetry">
</p>

<p align="center">
  <a href="https://nextcortex.github.io/"><img src="https://img.shields.io/badge/🌐_Website-nextcortex.github.io-blue?style=for-the-badge" alt="Website"></a>
  <a href="https://nextcortex.github.io/donate.html"><img src="https://img.shields.io/badge/💖_Donate-Support_NextCortex-ff69b4?style=for-the-badge" alt="Donate"></a>
</p>

**Let the AI agent work uninterrupted.** This extension automatically accepts commands, file edits, terminal actions, and suggestions from the AI agent in [Antigravity IDE](https://antigravity.dev) (a Visual Studio Code fork) — enabling fully hands-free operation.

---

## What does this extension do?

When you use the AI agent in Antigravity IDE, it normally asks for your confirmation before every action:
- *"Accept this file edit?"*
- *"Run this command in the terminal?"*
- *"Apply this suggestion?"*

**This extension says "Yes" automatically to everything**, so the agent can work non-stop without waiting for you.

### In a nutshell:
1. **Enable** with `Ctrl+Shift+A` (or `Cmd+Shift+A` on Mac)
2. The status bar shows **"Auto-Accept ON"** (yellow background)
3. The agent works without interruptions — the extension accepts everything for you
4. **Disable** with the same shortcut whenever you want

---

## 🚀 Installation

1. Download the `.vsix` file from [Releases](https://github.com/nextcortex/antigravity-auto-accept/releases)
2. In Antigravity IDE: `Ctrl+Shift+P` → **"Extensions: Install from VSIX..."**
3. Select the downloaded `.vsix` file
4. Done! Use `Ctrl+Shift+A` to toggle

---

## 📖 Quick Start

| Action | How |
|---|---|
| **Toggle on / off** | `Ctrl+Shift+A` (`Cmd+Shift+A` on Mac) |
| **Toggle on / off** | Click the status bar item (bottom right) |
| **View logs** | Command Palette → *"Antigravity Auto-Accept: Show Logs"* |

When **active**, the status bar shows:
> ✅ **Auto-Accept ON** (yellow background)

When **paused**:
> ⏸️ **Auto-Accept OFF**

---

## 🎛️ Configuration Sidebar

The extension adds an interactive configuration panel to the Activity Bar (left sidebar). Click the **Antigravity Auto-Accept** icon to open it.

The sidebar is divided into the following sections:

### 🚀 Auto-Accept Toggle
The main on/off switch at the top. Click it to toggle Auto-Accept globally. Shows the current state (ON/OFF) and the keyboard shortcut (`Ctrl+Shift+A`).

### 📋 Accept Commands (gray chips)
A list of **internal VS Code command IDs** that the extension fires every tick (every 800ms by default). These are the behind-the-scenes commands that Antigravity IDE exposes for accepting agent steps, file edits, terminal commands, and code completions.

Each gray chip represents one command. You can:
- **Remove** a command by clicking the `×` on its chip
- **Add** a new command by typing the command ID in the text field and clicking the blue `+` button

Default commands:
| Command | What it accepts |
|---|---|
| `antigravity.agent.acceptAgentStep` | Accepts the current agent action step |
| `antigravity.terminalCommand.accept` | Accepts a pending terminal command from the agent |
| `antigravity.command.accept` | Accepts a generic agent command |
| `antigravity.acceptCompletion` | Accepts an inline code completion |
| `antigravity.prioritized.agentAcceptAllInFile` | Accepts all pending agent edits in the current file |
| `antigravity.prioritized.agentAcceptFocusedHunk` | Accepts the currently focused diff hunk |
| `antigravity.prioritized.supercompleteAccept` | Accepts a supercomplete suggestion |
| `antigravity.prioritized.terminalSuggestion.accept` | Accepts a terminal suggestion |

> If a command is not available (because there's nothing pending), it is silently ignored.

### ✅ Accept Keywords (green chips)
These are **button text keywords** that the extension searches for in the IDE's visible UI. When the auto-clicker finds a button whose text matches one of these keywords (case-insensitive), it **clicks it automatically**.

Default keywords: `accept`, `run`, `retry`, `apply`, `execute`, `confirm`, `allow once`, `allow`

You can add or remove keywords to match buttons in your specific IDE version.

### 🚫 Reject Keywords (red chips)
These are the **safety net**. Any button whose text matches a reject keyword will **never** be auto-clicked, even if it also matches an accept keyword. This prevents dangerous or destructive actions.

Default keywords: `skip`, `reject`, `cancel`, `close`, `refine`, `always`, `aga:`

> For example, if a dialog has both an "Accept" and a "Cancel" button, the extension will click "Accept" and leave "Cancel" alone.

### ⚡ Auto-Execution Settings (checkboxes)
These checkboxes represent **native IDE configuration keys** that control whether the agent can act without asking permission. When checked `[✓]`, the extension will **force** these settings to their "auto-approve" values while Auto-Accept is ON. When you turn Auto-Accept OFF, all settings are **restored to their original values** automatically.

| Setting | What it does when enabled |
|---|---|
| `antigravity.agent.terminal.autoExecutionPolicy` | Grants the agent permission to run terminal scripts without asking. Set to `always`. |
| `antigravity.agent.terminal.confirmCommands` | Disables the confirmation popup before running terminal commands. Set to `false`. |
| `antigravity.agent.terminal.allowedCommands` | Whitelists all commands (`["*"]`), so no command is blocked by the IDE's security filter. |
| `antigravity.terminal.autoRun` | The terminal auto-runs pasted commands without waiting for you to press Enter. Set to `true`. |
| `cortex.agent.autoRun` | Underlying Cortex/Cursor-based agents apply code without showing diff review. Set to `true`. |
| `geminicodeassist.agentYoloMode` | Enables the fast auto-approve mode for Google Gemini Code Assist (if installed). Set to `true`. |
| `gemini.cli.yoloMode` | Writes `approval_mode: yolo` to `~/.gemini/settings.json` so the Gemini CLI tool auto-approves actions. Set to `true`. |

> **Important:** Unchecking a setting in the sidebar means the extension will **not** force that particular setting at all — it will remain at whatever value you have set manually in your IDE preferences.

### ⏱️ Interval (ms)
How often (in milliseconds) the extension runs its acceptance cycle — executing all commands and scanning for buttons. Default is `800ms`. Minimum is `200ms`, maximum is `5000ms`.

- **Lower values** = faster reaction, higher CPU usage
- **Higher values** = slower reaction, lower CPU usage
- **Recommended:** `800ms` (default) for a good balance

### 💾 Save Config (green button)
After making changes in any of the sections above, click **Save Config** to persist your changes to VS Code's global settings. Changes take effect immediately.

---

## 🔧 Settings (JSON)

You can also configure the extension via VS Code settings (`Ctrl+,` → search for `agm`). The sidebar is the recommended way, but all options are also available as JSON:

### Basic

| Setting | Default | Description |
|---|---|---|
| `aga.autoAccept` | `false` | Whether Auto-Accept starts automatically when the IDE launches |
| `aga.autoAcceptInterval` | `800` | Check interval in milliseconds (min: 200, max: 5000) |
| `aga.debugMode` | `false` | Enables detailed debug logging in the output channel |

### Advanced

| Setting | Description |
|---|---|
| `aga.autoAcceptCommands` | Array of VS Code command IDs to execute every tick |
| `aga.autoAcceptSettings` | Array of IDE setting keys to force-enable while active |
| `aga.autoAcceptKeywords` | Array of button text keywords to auto-click (accept list) |
| `aga.autoAcceptRejectKeywords` | Array of button text keywords to **never** auto-click (reject list) |

---

## ⚙️ How It Works (technical details)

The extension uses **four mechanisms** simultaneously:

### 1. VS Code Internal Commands
Every tick (default: 800ms), the extension calls all commands listed in `aga.autoAcceptCommands`. Each command triggers an internal IDE action (accept a file edit, approve a terminal command, etc.). If the command is not available (nothing pending), the call is silently ignored.

### 2. IDE Setting Overrides
When activated, the extension saves the current values of all checked Auto-Execution Settings, then forces them to their "auto-approve" values. When deactivated, **all original values are restored** — nothing is permanently changed.

### 3. UI Button Auto-Clicker
In addition to internal commands, the extension physically finds and clicks visible buttons in the IDE:

#### Windows (UI Automation)
- Uses the native Windows **UI Automation** API (zero configuration needed)
- A PowerShell script (`uia-worker.ps1`) locates the Antigravity IDE window and clicks buttons matching accept keywords
- Starts automatically when Auto-Accept is enabled

#### macOS / Linux (Chrome DevTools Protocol)
- Uses **CDP** (Chrome DevTools Protocol) via local WebSocket
- **Requirement:** Launch Antigravity IDE with the flag:
  ```bash
  antigravity --remote-debugging-port=9000
  ```
- Connects to `127.0.0.1` on ports 8996–9004 and searches for buttons in the DOM
- If CDP is unavailable, a one-time warning is shown

### 4. Gemini CLI (Yolo Mode)
If you have [Gemini CLI](https://github.com/google-gemini/gemini-cli) installed, the extension writes `approval_mode: yolo` to `~/.gemini/settings.json`. When deactivated, it restores the previous value.

---

## 🔒 Security & Privacy

- **100% local** — all operations run on `127.0.0.1`, never connects to the internet
- **No telemetry** — zero external network calls
- **No data collection** — nothing leaves your machine
- **Fully reversible** — deactivating restores all original settings
- **Open source** — you can audit every line of code

---

## 🗂️ Project Structure

```
src/
├── extension.ts          ← Entry point: commands, status bar, sidebar registration
├── auto-accept.ts        ← Core service: timer, command execution, settings management
├── cdp-handler.ts        ← UI auto-clicker: UIA (Windows) and CDP (macOS/Linux)
├── uia-worker.ps1        ← PowerShell script for Windows UI Automation
├── config.ts             ← Configuration reader (VS Code settings)
├── logger.ts             ← Output channel for logs
└── sidebar/
    ├── provider.ts       ← WebviewViewProvider for the sidebar panel
    ├── webview.js        ← Sidebar UI logic (vanilla JS, no dependencies)
    └── webview.css        ← Sidebar styles (integrates with VS Code themes)
```

---

## 🛠️ Development

### Requirements
- Node.js 18+
- npm

### Commands

```bash
npm install          # Install dependencies
npm run build        # Build the extension
npm run watch        # Build in watch mode (development)
npm run package      # Build + generate .vsix for distribution
```

### Testing changes
1. Run `npm run build`
2. Press `F5` in VS Code to open an Extension Development Host window
3. Use `Ctrl+Shift+A` to test the toggle

---

## 📋 Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+A` | Toggle Auto-Accept on/off |
| `Cmd+Shift+A` | Toggle Auto-Accept on/off (Mac) |

---

## 📄 License

MIT — see [LICENSE](LICENSE).

---

## 👤 Author

**[NextCortex](https://github.com/nextcortex)**
