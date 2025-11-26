import * as vscode from 'vscode';
import axios from 'axios';

interface ActivityPayload {
    userId: string;
    project: string;
    language: string;
    duration: number;
    file: string;
    keystrokes: number;
    timestamp: string;
}

let batch: ActivityPayload[] = [];
let batchTimer: NodeJS.Timeout | null = null;
let statusBarItem: vscode.StatusBarItem;

const BATCH_INTERVAL = 30_000; 
const MAX_BATCH_SIZE = 50;
const IDLE_THRESHOLD = 60 * 2 * 1000; 
let currentFile = '';
let currentStartTime = Date.now();
let lastActivityTime = Date.now();
let keystrokeCount = 0;

export function activate(context: vscode.ExtensionContext) {
    console.log('CareIt tracker activated');

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(pulse) CareIt";
    statusBarItem.tooltip = "Tracking your coding activity";
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    const config = vscode.workspace.getConfiguration('careit');
    let apiKey = config.get<string>('apiKey') ?? '';
    let serverUrl = config.get<string>('serverUrl') ?? 'http://localhost:3000';

    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('careit')) {
            const newConfig = vscode.workspace.getConfiguration('careit');
            apiKey = newConfig.get<string>('apiKey') || '';
            serverUrl = newConfig.get<string>('serverUrl') || 'http://localhost:3000';
            vscode.window.showInformationMessage('CareIt configuration updated.');
        }
    }));

    if (vscode.window.activeTextEditor) {
        currentFile = vscode.window.activeTextEditor.document.fileName;
        currentStartTime = Date.now();
        lastActivityTime = Date.now();
    }


    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        processActivityAndReset();

        if (editor) {
            currentFile = editor.document.fileName;
            currentStartTime = Date.now();
            lastActivityTime = Date.now();
        } else {
            currentFile = '';
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(doc => {
        if (doc.fileName === currentFile) {
            processActivityAndReset();
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
            lastActivityTime = Date.now();
            keystrokeCount += event.contentChanges.reduce((acc, change) => acc + change.text.length, 0);
        }
    }));

    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(() => {
        lastActivityTime = Date.now();
    }));

    startBatchTimer(() => sendBatch(serverUrl, apiKey));

    context.subscriptions.push({
        dispose: () => {
            processActivityAndReset(); 
            if (batch.length > 0) sendBatch(serverUrl, apiKey);
            if (batchTimer) clearInterval(batchTimer);
        }
    });

    const disposable = vscode.commands.registerCommand('careit.sendNow', async () => {
        await processActivityAndReset();
        await sendBatch(serverUrl, apiKey);
        vscode.window.showInformationMessage('CareIt: Analytics sent');
    });
    context.subscriptions.push(disposable);
}


function processActivityAndReset() {
    if (!currentFile) return;

    const now = Date.now();
    let durationMs = now - currentStartTime;

    
    const timeSinceLastActivity = now - lastActivityTime;
    if (timeSinceLastActivity > IDLE_THRESHOLD) {
        durationMs = durationMs - timeSinceLastActivity;
    }

    if (durationMs > 1000) {
        const project = vscode.workspace.workspaceFolders 
            ? vscode.workspace.workspaceFolders[0].name 
            : 'No Project';

        const languageId = vscode.window.activeTextEditor 
            ? vscode.window.activeTextEditor.document.languageId 
            : 'plain';

        const payload: ActivityPayload = {
            userId: 'dynamic-key', 
            project,
            language: languageId,
            duration: Math.round(durationMs / 1000), 
            file: currentFile,
            keystrokes: keystrokeCount,
            timestamp: new Date().toISOString()
        };

        batch.push(payload);
        console.log(`Recorded: ${payload.duration}s in ${payload.file}`);
    }

    currentStartTime = now;
    lastActivityTime = now;
    keystrokeCount = 0;
}

function startBatchTimer(sendFn: () => Promise<void>) {
    if (batchTimer) return;
    batchTimer = setInterval(async () => {
        processActivityAndReset(); 
        
        if (batch.length > 0) {
            await sendFn();
        }
    }, BATCH_INTERVAL);
}

async function sendBatch(serverUrl: string, apiKey: string) {
    if (batch.length === 0) return;

    const payloadToSend = [...batch];
    batch = [];
    statusBarItem.text = "$(sync~spin) CareIt: Sending...";

    try {
        await axios.post(`${serverUrl.replace(/\/$/, '')}/analytics/editor-activity`, payloadToSend, {
            headers: { 'careit-api-key': apiKey },
            timeout: 10000,
        });
        statusBarItem.text = "$(check) CareIt";
        setTimeout(() => { statusBarItem.text = "$(pulse) CareIt"; }, 3000);
        
    } catch (err) {
        console.error('Failed to send analytics:', err);
        statusBarItem.text = "$(alert) CareIt: Error";
        
        batch.unshift(...payloadToSend);
        
        if (batch.length > 500) {
            batch = batch.slice(0, 500);
        }
    }
}

export function deactivate() {
    if (batchTimer) clearInterval(batchTimer);
}