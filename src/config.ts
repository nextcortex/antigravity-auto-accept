import * as vscode from 'vscode';

export interface AgmConfig {
    debugMode: boolean;
    autoAccept: boolean;
    autoAcceptInterval: number;
    autoAcceptCommands: string[];
    autoAcceptSettings: string[];
    autoAcceptKeywords: string[];
    autoAcceptRejectKeywords: string[];
}

const MIN_AUTO_ACCEPT = 200;

export class ConfigManager {
    private section = 'aga';

    get<T>(key: string, fallback: T): T {
        const val = vscode.workspace.getConfiguration(this.section).get<T>(key, fallback);
        if (key === 'autoAcceptInterval' && typeof val === 'number') return Math.max(val, MIN_AUTO_ACCEPT) as T;
        return val;
    }

    async update(key: string, value: unknown): Promise<void> {
        await vscode.workspace.getConfiguration(this.section).update(key, value, vscode.ConfigurationTarget.Global);
    }

    getConfig(): AgmConfig {
        return {
            debugMode: this.get('debugMode', false),
            autoAccept: this.get('autoAccept', false),
            autoAcceptInterval: this.get('autoAcceptInterval', 800),
            autoAcceptCommands: this.get('autoAcceptCommands', [
                'antigravity.agent.acceptAgentStep',
                'antigravity.terminalCommand.accept',
                'antigravity.command.accept',
                'antigravity.acceptCompletion',
                'antigravity.prioritized.agentAcceptAllInFile',
                'antigravity.prioritized.agentAcceptFocusedHunk',
                'antigravity.prioritized.supercompleteAccept',
                'antigravity.prioritized.terminalSuggestion.accept',
            ]),
            autoAcceptSettings: this.get('autoAcceptSettings', [
                'antigravity.agent.terminal.autoExecutionPolicy',
                'antigravity.agent.terminal.confirmCommands',
                'antigravity.agent.terminal.allowedCommands',
                'antigravity.terminal.autoRun',
                'cortex.agent.autoRun',
                'geminicodeassist.agentYoloMode',
                'gemini.cli.yoloMode',
            ]),
            autoAcceptKeywords: this.get('autoAcceptKeywords', [
                'accept', 'run', 'retry', 'apply', 'execute', 'confirm', 'allow once', 'allow',
            ]),
            autoAcceptRejectKeywords: this.get('autoAcceptRejectKeywords', [
                'skip', 'reject', 'cancel', 'close', 'refine', 'always', 'aga:',
            ]),
        };
    }
}
