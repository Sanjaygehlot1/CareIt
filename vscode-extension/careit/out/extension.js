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
let breakReminderTimer = null;
const BATCH_INTERVAL = 60_000 * 5; // Send every 5 minutes
const IDLE_THRESHOLD = 2 * 60 * 1000; // 2 minutes idle = pause tracking
let BREAK_THRESHOLD = 90 * 60 * 1000; // configurable from settings
const SESSION_STORAGE_KEY = 'careit.pendingSessions';
const BREAK_SHOWN_KEY = 'careit.breakShownAt';
let currentProject = '';
let currentSessionStart = Date.now();
let lastActivityTime = Date.now();
let todayCodingSeconds = 0;
let continuousCodingStart = Date.now();
let extensionContext;
function activate(context) {
    console.log('CareIt tracker activated');
    extensionContext = context;
    // ── Status bar ──────────────────────────────────────────────
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'careit.sendNow';
    updateStatusBar();
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    // ── Configuration ──────────────────────────────────────────
    const config = vscode.workspace.getConfiguration('careit');
    let apiKey = config.get('apiKey') ?? '';
    let serverUrl = config.get('serverUrl') ?? 'http://localhost:3000';
    const breakMinutes = config.get('breakReminderMinutes') ?? 90;
    BREAK_THRESHOLD = breakMinutes * 60 * 1000;
    // Warn if API key is not set
    if (!apiKey) {
        vscode.window
            .showWarningMessage('CareIt: No API key configured. Your coding activity won\'t be tracked.', 'Open Settings')
            .then(selection => {
            if (selection === 'Open Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', 'careit.apiKey');
            }
        });
    }
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('careit')) {
            const newConfig = vscode.workspace.getConfiguration('careit');
            apiKey = newConfig.get('apiKey') || '';
            serverUrl = newConfig.get('serverUrl') || 'http://localhost:3000';
            vscode.window.showInformationMessage('CareIt: Configuration updated.');
        }
    }));
    // ── Restore persisted sessions (crash recovery) ────────────
    restoreSessions(context);
    // ── Initialize current project ─────────────────────────────
    if (vscode.workspace.workspaceFolders) {
        currentProject = vscode.workspace.workspaceFolders[0].name;
        currentSessionStart = Date.now();
        lastActivityTime = Date.now();
        continuousCodingStart = Date.now();
    }
    // ── Activity listeners ─────────────────────────────────────
    // Typing
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(() => {
        onActivity();
    }));
    // Cursor / selection movement
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(() => {
        onActivity();
    }));
    // Switching between editor tabs
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
        onActivity();
    }));
    // Scrolling (visible range changes)
    context.subscriptions.push(vscode.window.onDidChangeTextEditorVisibleRanges(() => {
        onActivity();
    }));
    // Terminal interaction
    context.subscriptions.push(vscode.window.onDidChangeActiveTerminal(() => {
        onActivity();
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
    // ── Periodic batch sending ─────────────────────────────────
    startBatchTimer(() => sendBatch(serverUrl, apiKey));
    // ── Break reminder checker ─────────────────────────────────
    startBreakReminderTimer(context);
    // ── Status bar updater (every 30s) ─────────────────────────
    const statusTimer = setInterval(() => {
        updateStatusBar();
    }, 30_000);
    // ── Cleanup on deactivation ────────────────────────────────
    context.subscriptions.push({
        dispose: () => {
            recordCurrentSession();
            persistSessions(context);
            if (projectSessions.size > 0) {
                sendBatch(serverUrl, apiKey).catch(err => console.error('Final send failed', err));
            }
            if (batchTimer) {
                clearInterval(batchTimer);
            }
            if (breakReminderTimer) {
                clearInterval(breakReminderTimer);
            }
            clearInterval(statusTimer);
        }
    });
    // ── Manual send command ────────────────────────────────────
    const disposable = vscode.commands.registerCommand('careit.sendNow', async () => {
        recordCurrentSession();
        await sendBatch(serverUrl, apiKey);
        vscode.window.showInformationMessage('CareIt: Analytics sent!');
    });
    context.subscriptions.push(disposable);
}
// ────────────────────────────────────────────────────────────────
// Activity tracking
// ────────────────────────────────────────────────────────────────
function onActivity() {
    const now = Date.now();
    const wasIdle = now - lastActivityTime >= IDLE_THRESHOLD;
    lastActivityTime = now;
    // If returning from idle, start a new continuous coding window
    if (wasIdle) {
        continuousCodingStart = now;
        currentSessionStart = now;
    }
}
// ────────────────────────────────────────────────────────────────
// Session recording
// ────────────────────────────────────────────────────────────────
function recordCurrentSession() {
    if (!currentProject) {
        return;
    }
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
    todayCodingSeconds += durationSeconds;
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
    console.log(`[CareIt] Recorded ${durationSeconds}s on: ${currentProject}`);
    currentSessionStart = now;
    updateStatusBar();
}
// ────────────────────────────────────────────────────────────────
// Status bar
// ────────────────────────────────────────────────────────────────
function updateStatusBar() {
    const h = Math.floor(todayCodingSeconds / 3600);
    const m = Math.floor((todayCodingSeconds % 3600) / 60);
    const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
    statusBarItem.text = `$(pulse) CareIt: ${timeStr}`;
    statusBarItem.tooltip = `Today's coding time: ${timeStr}\nClick to force send analytics`;
}
// ────────────────────────────────────────────────────────────────
// Batch sending
// ────────────────────────────────────────────────────────────────
function startBatchTimer(sendFn) {
    if (batchTimer) {
        return;
    }
    batchTimer = setInterval(async () => {
        const now = Date.now();
        const idleTime = now - lastActivityTime;
        // Don't send if user is idle
        if (idleTime >= IDLE_THRESHOLD) {
            console.log('[CareIt] User idle — skipping batch send.');
            return;
        }
        recordCurrentSession();
        if (projectSessions.size > 0) {
            await sendFn();
        }
    }, BATCH_INTERVAL);
}
async function sendBatch(serverUrl, apiKey) {
    if (projectSessions.size === 0) {
        return;
    }
    if (isSending) {
        return;
    }
    if (!apiKey) {
        console.log('[CareIt] No API key — skipping send.');
        return;
    }
    isSending = true;
    // Snapshot current sessions, then clear
    const sessionsSnapshot = new Map(projectSessions);
    const activities = Array.from(sessionsSnapshot.entries()).map(([project, session]) => ({
        project,
        duration: session.totalDuration,
        timestamp: new Date(session.startTime).toISOString()
    }));
    statusBarItem.text = '$(sync~spin) CareIt: Sending...';
    console.log('[CareIt] Sending batch', activities);
    try {
        console.log(`${serverUrl.replace(/\/$/, '')}/api/v1/analytics/editor-activity`);
        await axios_1.default.post(`${serverUrl.replace(/\/$/, '')}/api/v1/analytics/editor-activity`, activities, {
            headers: { 'careit-api-key': apiKey },
            timeout: 10000
        });
        // Success — clear only the snapshot entries from the live map
        for (const key of sessionsSnapshot.keys()) {
            const live = projectSessions.get(key);
            const snapped = sessionsSnapshot.get(key);
            if (live && snapped) {
                live.totalDuration -= snapped.totalDuration;
                if (live.totalDuration <= 0) {
                    projectSessions.delete(key);
                }
            }
        }
        // Persist remaining sessions
        persistSessions(extensionContext);
        statusBarItem.text = '$(check) CareIt';
        setTimeout(() => updateStatusBar(), 3000);
    }
    catch (err) {
        const status = err?.response?.status;
        console.error(`[CareIt] Send failed (${status || 'network'}):`, err.message);
        if (status === 401) {
            statusBarItem.text = '$(alert) CareIt: Invalid API Key';
            vscode.window
                .showErrorMessage('CareIt: Invalid API key. Please update it in settings.', 'Open Settings')
                .then(sel => {
                if (sel === 'Open Settings') {
                    vscode.commands.executeCommand('workbench.action.openSettings', 'careit.apiKey');
                }
            });
        }
        else {
            statusBarItem.text = '$(alert) CareIt: Retry later';
            setTimeout(() => updateStatusBar(), 5000);
        }
        // Data stays in projectSessions since we only subtract on success
    }
    finally {
        isSending = false;
    }
}
// ────────────────────────────────────────────────────────────────
// Session persistence (crash recovery)
// ────────────────────────────────────────────────────────────────
function persistSessions(context) {
    const data = {};
    projectSessions.forEach((session, project) => {
        data[project] = session;
    });
    context.globalState.update(SESSION_STORAGE_KEY, data);
}
function restoreSessions(context) {
    const stored = context.globalState.get(SESSION_STORAGE_KEY);
    if (stored) {
        for (const [project, session] of Object.entries(stored)) {
            projectSessions.set(project, session);
            todayCodingSeconds += session.totalDuration;
        }
        console.log(`[CareIt] Restored ${Object.keys(stored).length} pending session(s)`);
        // Clear stored data after restoring
        context.globalState.update(SESSION_STORAGE_KEY, undefined);
    }
}
// ────────────────────────────────────────────────────────────────
// Break reminders
// ────────────────────────────────────────────────────────────────
function startBreakReminderTimer(context) {
    // Check every 5 minutes if a break reminder is needed
    breakReminderTimer = setInterval(() => {
        const now = Date.now();
        const idleTime = now - lastActivityTime;
        // Only check if the user is actively coding
        if (idleTime >= IDLE_THRESHOLD) {
            return;
        }
        const continuousMs = now - continuousCodingStart;
        if (continuousMs >= BREAK_THRESHOLD) {
            // Don't show if we already showed one recently (within 30 min)
            const lastShown = context.globalState.get(BREAK_SHOWN_KEY) ?? 0;
            if (now - lastShown < 30 * 60 * 1000) {
                return;
            }
            const totalMins = Math.round(continuousMs / 60_000);
            const h = Math.floor(totalMins / 60);
            const m = totalMins % 60;
            const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
            context.globalState.update(BREAK_SHOWN_KEY, now);
            vscode.window
                .showInformationMessage(`☕ You've been coding for ${timeStr} — time for a stretch break!`, 'Take a Break', 'Remind Later')
                .then(selection => {
                if (selection === 'Take a Break') {
                    // Reset continuous timer
                    continuousCodingStart = Date.now();
                    vscode.window.showInformationMessage('🧘 Enjoy your break! Your streak is safe.');
                }
                // "Remind Later" or dismissed — will check again in 30 min
            });
        }
    }, 5 * 60_000);
}
function deactivate() {
    if (batchTimer) {
        clearInterval(batchTimer);
    }
    if (breakReminderTimer) {
        clearInterval(breakReminderTimer);
    }
}
//# sourceMappingURL=extension.js.map