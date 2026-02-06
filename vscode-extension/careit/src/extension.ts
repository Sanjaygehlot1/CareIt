import * as vscode from 'vscode';
import axios from 'axios';

interface ProjectActivity {
  project: string;
  duration: number; // total seconds spent on this project
  timestamp: string; // when this session started
}

let projectSessions: Map<string, { startTime: number; totalDuration: number }> = new Map();
let statusBarItem: vscode.StatusBarItem;
let isSending = false;
let batchTimer: NodeJS.Timeout | null = null;

const BATCH_INTERVAL = 60_000 * 5; // Send every 5 minutes
const IDLE_THRESHOLD = 2 * 60 * 1000; // 2 minutes idle = new session

let currentProject = '';
let currentSessionStart = Date.now();
let lastActivityTime = Date.now();

export function activate(context: vscode.ExtensionContext) {
  console.log('CareIt tracker activated');

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = '$(pulse) CareIt';
  statusBarItem.tooltip = 'Tracking your coding activity';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  const config = vscode.workspace.getConfiguration('careit');
  let apiKey = config.get<string>('apiKey') ?? '';
  let serverUrl = config.get<string>('serverUrl') ?? 'http://localhost:3000';

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('careit')) {
        const newConfig = vscode.workspace.getConfiguration('careit');
        apiKey = newConfig.get<string>('apiKey') || '';
        serverUrl = newConfig.get<string>('serverUrl') || 'http://localhost:3000';
        vscode.window.showInformationMessage('CareIt configuration updated.');
      }
    })
  );

  // Initialize current project
  if (vscode.workspace.workspaceFolders) {
    currentProject = vscode.workspace.workspaceFolders[0].name;
    currentSessionStart = Date.now();
    lastActivityTime = Date.now();
  }

  // Track any activity (typing, selection, etc.)
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(() => {
      lastActivityTime = Date.now();
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(() => {
      lastActivityTime = Date.now();
    })
  );

  // Track workspace changes (switching projects)
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      recordCurrentSession();
      if (vscode.workspace.workspaceFolders) {
        currentProject = vscode.workspace.workspaceFolders[0].name;
        currentSessionStart = Date.now();
        lastActivityTime = Date.now();
      }
    })
  );

  // Start periodic batch sending
  startBatchTimer(() => sendBatch(serverUrl, apiKey));

  // Cleanup on deactivation
  context.subscriptions.push({
    dispose: () => {
      recordCurrentSession();
      if (projectSessions.size > 0) {
        sendBatch(serverUrl, apiKey).catch(err => console.error('Final send failed', err));
      }
      if (batchTimer) clearInterval(batchTimer);
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
  if (!currentProject) return;

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
  } else {
    projectSessions.set(currentProject, {
      startTime: currentSessionStart,
      totalDuration: durationSeconds
    });
  }

  console.log(`Recorded ${durationSeconds}s on project: ${currentProject}`);
  
  currentSessionStart = now;
}

function startBatchTimer(sendFn: () => Promise<void>) {
  if (batchTimer) return;

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

async function sendBatch(serverUrl: string, apiKey: string) {
  if (projectSessions.size === 0) return;
  if (isSending) return;

  isSending = true;

  // Convert Map to array of activities
  const activities: ProjectActivity[] = Array.from(projectSessions.entries()).map(
    ([project, session]) => ({
      project,
      duration: session.totalDuration,
      timestamp: new Date(session.startTime).toISOString()
    })
  );

  // Clear sessions after copying
  projectSessions.clear();

  statusBarItem.text = '$(sync~spin) CareIt: Sending...';
  console.log('Sending batch', activities);

  try {
    await axios.post(
      `${serverUrl.replace(/\/$/, '')}/analytics/editor-activity`,
      activities,
      {
        headers: { 'careit-api-key': apiKey },
        timeout: 10000
      }
    );

    statusBarItem.text = '$(check) CareIt';
    setTimeout(() => {
      statusBarItem.text = '$(pulse) CareIt';
    }, 3000);
  } catch (err) {
    console.error('Failed to send analytics:', err);
    statusBarItem.text = '$(alert) CareIt: Error';

    // Restore failed sessions (merge back)
    activities.forEach(activity => {
      const existing = projectSessions.get(activity.project);
      if (existing) {
        existing.totalDuration += activity.duration;
      } else {
        projectSessions.set(activity.project, {
          startTime: new Date(activity.timestamp).getTime(),
          totalDuration: activity.duration
        });
      }
    });
  } finally {
    isSending = false;
  }
}

export function deactivate() {
  if (batchTimer) clearInterval(batchTimer);
}