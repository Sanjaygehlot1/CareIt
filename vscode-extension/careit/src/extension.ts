import * as vscode from 'vscode';
import axios from 'axios';

// Interfaces for type safety
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

const BATCH_INTERVAL = 30_000; // Send every 30 seconds
const MAX_BATCH_SIZE = 50;
const IDLE_THRESHOLD = 60 * 2 * 1000; // 2 minutes (in ms). If duration > this, we cap it.

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

    // 2. Load Config
    const config = vscode.workspace.getConfiguration('careit');
    let apiKey = config.get<string>('apiKey') ?? '';
    let serverUrl = config.get<string>('serverUrl') ?? 'http://localhost:3000';

    // 3. Watch for Config Changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('careit')) {
            const newConfig = vscode.workspace.getConfiguration('careit');
            apiKey = newConfig.get<string>('apiKey') || '';
            serverUrl = newConfig.get<string>('serverUrl') || 'http://localhost:3000';
            vscode.window.showInformationMessage('CareIt configuration updated.');
        }
    }));

    // 4. Initialize Tracking State
    if (vscode.window.activeTextEditor) {
        currentFile = vscode.window.activeTextEditor.document.fileName;
        currentStartTime = Date.now();
        lastActivityTime = Date.now();
    }

    // --- EVENT HANDLERS ---

    // A. Switch Files
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        // 1. Record the file we just left
        processActivityAndReset();

        // 2. Set up the new file
        if (editor) {
            currentFile = editor.document.fileName;
            currentStartTime = Date.now();
            lastActivityTime = Date.now();
        } else {
            currentFile = '';
        }
    }));

    // B. Save File
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(doc => {
        if (doc.fileName === currentFile) {
            processActivityAndReset();
        }
    }));

    // C. Typing (Keystrokes)
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        // Only track if it's the active document
        if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
            lastActivityTime = Date.now(); // Update activity timestamp
            keystrokeCount += event.contentChanges.reduce((acc, change) => acc + change.text.length, 0);
        }
    }));

    // D. Selection Change (Counts as activity even if not typing)
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(() => {
        lastActivityTime = Date.now();
    }));

    // --- BATCH TIMER ---
    startBatchTimer(() => sendBatch(serverUrl, apiKey));

    // --- CLEANUP ---
    context.subscriptions.push({
        dispose: () => {
            processActivityAndReset(); // Capture final moments
            if (batch.length > 0) sendBatch(serverUrl, apiKey);
            if (batchTimer) clearInterval(batchTimer);
        }
    });

    // Manual Send Command
    const disposable = vscode.commands.registerCommand('careit.sendNow', async () => {
        await processActivityAndReset(); // Flush current pending time
        await sendBatch(serverUrl, apiKey);
        vscode.window.showInformationMessage('CareIt: Analytics sent');
    });
    context.subscriptions.push(disposable);
}

// --- HELPER FUNCTIONS ---

/**
 * Calculates time spent on the current file, adds to batch, and resets counters.
 */
function processActivityAndReset() {
    if (!currentFile) return;

    const now = Date.now();
    let durationMs = now - currentStartTime;

    // IDLE CHECK: If user hasn't touched keyboard/mouse for a while, 
    // don't count the time they were away.
    const timeSinceLastActivity = now - lastActivityTime;
    if (timeSinceLastActivity > IDLE_THRESHOLD) {
        // If idle, we only count the time up until they went idle
        durationMs = durationMs - timeSinceLastActivity;
    }

    // Only record if duration is meaningful (> 1 second)
    if (durationMs > 1000) {
        const project = vscode.workspace.workspaceFolders 
            ? vscode.workspace.workspaceFolders[0].name 
            : 'No Project';

        const languageId = vscode.window.activeTextEditor 
            ? vscode.window.activeTextEditor.document.languageId 
            : 'plain';

        const payload: ActivityPayload = {
            userId: 'dynamic-key', // Will be filled by header usually, but keeping structure
            project,
            language: languageId,
            duration: Math.round(durationMs / 1000), // Seconds
            file: currentFile,
            keystrokes: keystrokeCount,
            timestamp: new Date().toISOString()
        };

        batch.push(payload);
        console.log(`Recorded: ${payload.duration}s in ${payload.file}`);
    }

    // Reset State
    currentStartTime = now;
    lastActivityTime = now;
    keystrokeCount = 0;
}

function startBatchTimer(sendFn: () => Promise<void>) {
    if (batchTimer) return;
    batchTimer = setInterval(async () => {
        // Also process current activity periodically so we don't lose data if VS Code crashes
        processActivityAndReset(); 
        
        if (batch.length > 0) {
            await sendFn();
        }
    }, BATCH_INTERVAL);
}

async function sendBatch(serverUrl: string, apiKey: string) {
    if (batch.length === 0) return;

    // Take snapshot of batch
    const payloadToSend = [...batch];
    batch = []; // Clear immediately to prevent duplicates, re-add on fail

    statusBarItem.text = "$(sync~spin) CareIt: Sending...";

    try {
        await axios.post(`${serverUrl.replace(/\/$/, '')}/analytics/editor-activity`, payloadToSend, {
            headers: { 'careit-api-key': apiKey },
            timeout: 10000, // 10s timeout
        });
        statusBarItem.text = "$(check) CareIt";
        // Reset icon after 3 seconds
        setTimeout(() => { statusBarItem.text = "$(pulse) CareIt"; }, 3000);
        
    } catch (err) {
        console.error('Failed to send analytics:', err);
        statusBarItem.text = "$(alert) CareIt: Error";
        
        // Put failed items back at the start of the queue
        batch.unshift(...payloadToSend);
        
        // Cap batch size to prevent memory overflow if server is down for days
        if (batch.length > 500) {
            batch = batch.slice(0, 500);
        }
    }
}

export function deactivate() {
    if (batchTimer) clearInterval(batchTimer);
}