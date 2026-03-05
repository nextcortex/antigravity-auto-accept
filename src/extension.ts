/**
 * Antigravity Auto-Accept — Main extension entry point.
 * Periodically fires all Antigravity accept/approve commands and
 * auto-clicks Accept/Run buttons via UIA (Windows) or CDP (macOS/Linux).
 *
 * 100% local & secure. No telemetry, no analytics, no external calls.
 */
import * as vscode from 'vscode';
import { initLogger, getOutputChannel, setDebugMode, logInfo } from './logger';
import { ConfigManager } from './config';
import { AutoAcceptService, ALL_AUTO_SETTINGS } from './auto-accept';
import { SidebarProvider } from './sidebar/provider';

let statusBarItem: vscode.StatusBarItem;
let sidebarProvider: SidebarProvider;
let isActivated = false;

export async function activate(ctx: vscode.ExtensionContext): Promise<void> {
    if (isActivated) return;
    isActivated = true;

    try {
        initLogger(ctx);
        logInfo('Antigravity Auto-Accept: Activating…');

        const configManager = new ConfigManager();
        const cfg = configManager.getConfig();
        setDebugMode(cfg.debugMode);

        const autoAccept = new AutoAcceptService(cfg.autoAcceptInterval, {
            commands: cfg.autoAcceptCommands,
            enabledSettings: cfg.autoAcceptSettings,
            acceptKeywords: cfg.autoAcceptKeywords,
            rejectKeywords: cfg.autoAcceptRejectKeywords,
        });
        ctx.subscriptions.push({ dispose: () => autoAccept.dispose() });

        if (cfg.autoAccept) autoAccept.start();

        // Timestamp-based guard: ignore config-driven autoAccept toggle for
        // 2 seconds after a command-driven toggle to avoid revert from stale reads.
        let lastCommandToggle = 0;

        // Sidebar
        sidebarProvider = new SidebarProvider(ctx.extensionUri);
        ctx.subscriptions.push(
            vscode.window.registerWebviewViewProvider(SidebarProvider.viewType, sidebarProvider)
        );

        // Status bar
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBarItem.command = 'aga.toggleAutoAccept';
        ctx.subscriptions.push(statusBarItem);
        updateStatusBar(autoAccept.isRunning());

        // Commands
        try {
            ctx.subscriptions.push(
                vscode.commands.registerCommand('aga.toggleAutoAccept', async () => {
                    logInfo(`Command 'aga.toggleAutoAccept' triggered.`);
                    lastCommandToggle = Date.now();
                    autoAccept.toggle();
                    const running = autoAccept.isRunning();
                    logInfo(`Toggle command: new running state is ${running}`);

                    // Update all UI immediately
                    logInfo(`Updating status bar and sidebar with state: ${running}`);
                    updateStatusBar(running);
                    sidebarProvider.postUpdate(running);
                    vscode.window.showInformationMessage(
                        running ? '✅ Auto-Accept: ON' : '⏸️ Auto-Accept: OFF'
                    );

                    // Persist to config (fires onDidChangeConfiguration, but guard protects)
                    configManager.update('autoAccept', running).catch(() => { });
                }),
                vscode.commands.registerCommand('aga.showLogs', () => {
                    const ch = getOutputChannel();
                    if (ch) ch.show(true);
                    else vscode.window.showWarningMessage('Output channel not initialized.');
                })
            );
        } catch (cmdErr) {
            logInfo(`Warning: Commands already registered? ${cmdErr}`);
            vscode.window.showWarningMessage('Auto-Accept commands already registered. Please completely restart the IDE.');
        }

        // React to setting changes
        ctx.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('aga')) {
                    const newCfg = configManager.getConfig();
                    setDebugMode(newCfg.debugMode);
                    autoAccept.updateInterval(newCfg.autoAcceptInterval);
                    autoAccept.updateCommands(newCfg.autoAcceptCommands);
                    autoAccept.updateEnabledSettings(newCfg.autoAcceptSettings);
                    autoAccept.updateKeywords(newCfg.autoAcceptKeywords, newCfg.autoAcceptRejectKeywords);

                    // Only sync autoAccept on/off from config if NOT recently
                    // toggled via command (prevents stale config reads from reverting)
                    if (Date.now() - lastCommandToggle > 2000) {
                        if (newCfg.autoAccept !== autoAccept.isRunning()) {
                            if (newCfg.autoAccept) autoAccept.start();
                            else autoAccept.stop();
                        }
                        updateStatusBar(autoAccept.isRunning());
                        sidebarProvider.postUpdate(autoAccept.isRunning());
                    }
                }
            })
        );

        sidebarProvider.postUpdate(autoAccept.isRunning());
        logInfo('Antigravity Auto-Accept: Activated');
    } catch (err: any) {
        // Surface activation errors visibly so the user can report them
        const msg = err?.message || String(err);
        console.error('[AGA] Activation failed:', msg, err?.stack);
        vscode.window.showErrorMessage(`Antigravity Auto-Accept failed to activate: ${msg}`);
    }
}

function updateStatusBar(running: boolean): void {
    statusBarItem.text = running ? '$(check-all) Auto-Accept ON' : '$(circle-slash) Auto-Accept OFF';
    statusBarItem.tooltip = running
        ? 'Auto-Accept is active — click to toggle off'
        : 'Auto-Accept is paused — click to toggle on';
    statusBarItem.backgroundColor = running
        ? new vscode.ThemeColor('statusBarItem.warningBackground')
        : undefined;
    statusBarItem.show();
}

export function deactivate(): void {
    isActivated = false;
    // AutoAcceptService.dispose() is called via subscriptions
}

