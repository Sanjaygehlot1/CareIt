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
let projectSessions = new Map();
let statusBarItem;
let isSending = false;
let batchTimer = null;
const BATCH_INTERVAL = 60_000 * 5; // Send every 5 minutes
const IDLE_THRESHOLD = 2 * 60 * 1000; // 2 minutes idle = new session
let currentProject = '';
let currentSessionStart = Date.now();
let lastActivityTime = Date.now();
function activate(context) {
    console.log('CareIt tracker activated');
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(pulse) CareIt';
    statusBarItem.tooltip = 'Tracking your coding activity';
    statusBarItem.show();
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
    // Initialize current project
    if (vscode.workspace.workspaceFolders) {
        currentProject = vscode.workspace.workspaceFolders[0].name;
        currentSessionStart = Date.now();
        lastActivityTime = Date.now();
    }
    // Track any activity (typing, selection, etc.)
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(() => {
        lastActivityTime = Date.now();
    }));
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(() => {
        lastActivityTime = Date.now();
    }));
    // Track workspace changes (switching projects)
    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(() => {
        recordCurrentSession();
        if (vscode.workspace.workspaceFolders) {
            currentProject = vscode.workspace.workspaceFolders[0].name;
            currentSessionStart = Date.now();
            lastActivityTime = Date.now();
        }
    }));
    // Start periodic batch sending
    startBatchTimer(() => sendBatch(serverUrl, apiKey));
    // Cleanup on deactivation
    context.subscriptions.push({
        dispose: () => {
            recordCurrentSession();
            if (projectSessions.size > 0) {
                sendBatch(serverUrl, apiKey).catch(err => console.error('Final send failed', err));
            }
            if (batchTimer)
                clearInterval(batchTimer);
        }
    });
    // Manual send command
    const disposable = vscode.commands.registerCommand('careit.sendNow', async () => {
        recordCurrentSession();
        await sendBatch(serverUrl, apiKey);
        vscode.window.showInformationMessage('CareIt: Analytics sent');
    });
    context.subscriptions.push(disposable);
}
function recordCurrentSession() {
    if (!currentProject)
        return;
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityTime;
    // If user was idle, don't count this session
    if (timeSinceLastActivity >= IDLE_THRESHOLD) {
        currentSessionStart = now;
        return;
    }
    const durationMs = now - currentSessionStart;
    // Ignore very short sessions (< 5 seconds)
    if (durationMs < 5000) {
        currentSessionStart = now;
        return;
    }
    const durationSeconds = Math.round(durationMs / 1000);
    // Aggregate into project sessions
    const existing = projectSessions.get(currentProject);
    if (existing) {
        existing.totalDuration += durationSeconds;
    }
    else {
        projectSessions.set(currentProject, {
            startTime: currentSessionStart,
            totalDuration: durationSeconds
        });
    }
    console.log(`Recorded ${durationSeconds}s on project: ${currentProject}`);
    currentSessionStart = now;
}
function startBatchTimer(sendFn) {
    if (batchTimer)
        return;
    batchTimer = setInterval(async () => {
        const now = Date.now();
        const idleTime = now - lastActivityTime;
        // Don't send if user is idle
        if (idleTime >= IDLE_THRESHOLD) {
            console.log('User idle — skipping batch send.');
            return;
        }
        recordCurrentSession();
        if (projectSessions.size > 0) {
            await sendFn();
        }
    }, BATCH_INTERVAL);
}
async function sendBatch(serverUrl, apiKey) {
    if (projectSessions.size === 0)
        return;
    if (isSending)
        return;
    isSending = true;
    // Convert Map to array of activities
    const activities = Array.from(projectSessions.entries()).map(([project, session]) => ({
        project,
        duration: session.totalDuration,
        timestamp: new Date(session.startTime).toISOString()
    }));
    // Clear sessions after copying
    projectSessions.clear();
    statusBarItem.text = '$(sync~spin) CareIt: Sending...';
    console.log('Sending batch', activities);
    try {
        await axios_1.default.post(`${serverUrl.replace(/\/$/, '')}/analytics/editor-activity`, activities, {
            headers: { 'careit-api-key': apiKey },
            timeout: 10000
        });
        statusBarItem.text = '$(check) CareIt';
        setTimeout(() => {
            statusBarItem.text = '$(pulse) CareIt';
        }, 3000);
    }
    catch (err) {
        console.error('Failed to send analytics:', err);
        statusBarItem.text = '$(alert) CareIt: Error';
        // Restore failed sessions (merge back)
        activities.forEach(activity => {
            const existing = projectSessions.get(activity.project);
            if (existing) {
                existing.totalDuration += activity.duration;
            }
            else {
                projectSessions.set(activity.project, {
                    startTime: new Date(activity.timestamp).getTime(),
                    totalDuration: activity.duration
                });
            }
        });
    }
    finally {
        isSending = false;
    }
}
function deactivate() {
    if (batchTimer)
        clearInterval(batchTimer);
}
//# sourceMappingURL=extension.js.map