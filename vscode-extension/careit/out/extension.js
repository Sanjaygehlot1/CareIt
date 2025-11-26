"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
let batch = [];
let batchTimer = null;
let statusBarItem;
const BATCH_INTERVAL = 30_000;
const MAX_BATCH_SIZE = 50;
const IDLE_THRESHOLD = 60 * 2 * 1000;
let currentFile = '';
let currentStartTime = Date.now();
let lastActivityTime = Date.now();
let keystrokeCount = 0;
function activate(context) {
    console.log('CareIt tracker activated');
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(pulse) CareIt";
    statusBarItem.tooltip = "Tracking your coding activity";
    statusBarItem.show();
    console.log('--> 2. Status Bar Created');
    context.subscriptions.push(statusBarItem);
    const config = vscode.workspace.getConfiguration('careit');
    let apiKey = config.get('apiKey') ?? '';
    let serverUrl = config.get('serverUrl') ?? 'http://localhost:3000';
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('careit')) {
            const newConfig = vscode.workspace.getConfiguration('careit');
            apiKey = newConfig.get('apiKey') || '';
            serverUrl = newConfig.get('serverUrl') || 'http://localhost:3000';
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
        }
        else {
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
            if (batch.length > 0)
                sendBatch(serverUrl, apiKey);
            if (batchTimer)
                clearInterval(batchTimer);
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
    if (!currentFile)
        return;
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
        const payload = {
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
function startBatchTimer(sendFn) {
    if (batchTimer)
        return;
    batchTimer = setInterval(async () => {
        processActivityAndReset();
        if (batch.length > 0) {
            await sendFn();
        }
    }, BATCH_INTERVAL);
}
async function sendBatch(serverUrl, apiKey) {
    if (batch.length === 0)
        return;
    const data = [...batch];
    batch = [];
    statusBarItem.text = "$(sync~spin) CareIt: Sending...";
    try {
        await axios_1.default.post(`${serverUrl.replace(/\/$/, '')}/analytics/editor-activity`, data, {
            headers: { 'careit-api-key': apiKey },
            timeout: 10000,
        });
        statusBarItem.text = "$(check) CareIt";
        setTimeout(() => { statusBarItem.text = "$(pulse) CareIt"; }, 3000);
    }
    catch (err) {
        console.error('Failed to send analytics:', err);
        statusBarItem.text = "$(alert) CareIt: Error";
        batch.unshift(...data);
        if (batch.length > 500) {
            batch = batch.slice(0, 500);
        }
    }
}
function deactivate() {
    if (batchTimer)
        clearInterval(batchTimer);
}
//# sourceMappingURL=extension.js.map