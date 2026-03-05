import * as vscode from 'vscode';
import { ALL_AUTO_SETTINGS } from '../auto-accept';

export interface SidebarState {
    autoAcceptEnabled: boolean;
    autoAcceptConfig?: AutoAcceptConfigState;
}

export interface AutoAcceptConfigState {
    commands: string[];
    enabledSettings: string[];
    allSettings: { key: string; label: string }[];
    acceptKeywords: string[];
    rejectKeywords: string[];
    interval: number;
}

/** Generate a hex nonce for CSP (base64 can contain +/= which breaks CSP) */
function getNonce(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export class SidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'antigravityAutoAccept.configPanel';
    private _view?: vscode.WebviewView;

    constructor(private _extensionUri: vscode.Uri) { }

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.onDidReceiveMessage(async msg => {
            switch (msg.type) {
                case 'webviewReady':
                    this.postUpdate();
                    break;
                case 'toggleAutoAccept':
                    await vscode.commands.executeCommand('aga.toggleAutoAccept');
                    break;
                case 'updateAutoAcceptConfig':
                    if (msg.config) {
                        try {
                            const config = vscode.workspace.getConfiguration('aga');
                            await config.update('autoAcceptCommands', msg.config.commands, vscode.ConfigurationTarget.Global);
                            await config.update('autoAcceptKeywords', msg.config.acceptKeywords, vscode.ConfigurationTarget.Global);
                            await config.update('autoAcceptRejectKeywords', msg.config.rejectKeywords, vscode.ConfigurationTarget.Global);
                            await config.update('autoAcceptSettings', msg.config.enabledSettings, vscode.ConfigurationTarget.Global);
                            await config.update('autoAcceptInterval', msg.config.interval, vscode.ConfigurationTarget.Global);
                            vscode.window.showInformationMessage('✅ Auto-Accept configuration saved');
                        } catch (err) {
                            vscode.window.showErrorMessage('❌ Failed to save configuration');
                        }
                    }
                    break;
            }
        });

        this._setHtml();
    }

    postUpdate(running?: boolean): void {
        if (!this._view) return;
        const config = vscode.workspace.getConfiguration('aga');

        const allSettingsMapped = ALL_AUTO_SETTINGS.map(s => ({ key: s.key, label: s.key }));

        const state: SidebarState = {
            autoAcceptEnabled: running !== undefined ? running : config.get<boolean>('autoAccept', false),
            autoAcceptConfig: {
                commands: config.get<string[]>('autoAcceptCommands', []),
                enabledSettings: config.get<string[]>('autoAcceptSettings', []),
                allSettings: allSettingsMapped,
                acceptKeywords: config.get<string[]>('autoAcceptKeywords', []),
                rejectKeywords: config.get<string[]>('autoAcceptRejectKeywords', []),
                interval: config.get<number>('autoAcceptInterval', 800)
            }
        };
        this._view.webview.postMessage({ type: 'update', payload: state });
    }

    private _setHtml(): void {
        if (!this._view) return;
        const webview = this._view.webview;
        const nonce = getNonce();

        const stylesUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js'));
        const cspSource = webview.cspSource;

        webview.html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${cspSource}; img-src ${cspSource} data:;">
  <link href="${stylesUri}" rel="stylesheet" />
</head>
<body>
  <div id="agm-app"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }
}
