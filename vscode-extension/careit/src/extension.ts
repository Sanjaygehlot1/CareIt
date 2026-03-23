import * as vscode from 'vscode';
import axios from 'axios';

interface ProjectActivity {
  project: string;
  duration: number;
  timestamp: string;
}

interface SessionData {
  startTime: number;
  totalDuration: number;
}

let projectSessions: Map<string, SessionData> = new Map();
let statusBarItem: vscode.StatusBarItem;
let isSending = false;
let batchTimer: NodeJS.Timeout | null = null;
let breakReminderTimer: NodeJS.Timeout | null = null;

const BATCH_INTERVAL = 60_000 * 5;       
const IDLE_THRESHOLD = 2 * 60 * 1000;    
let BREAK_THRESHOLD = 90 * 60 * 1000;    
const SESSION_STORAGE_KEY = 'careit.pendingSessions';
const BREAK_SHOWN_KEY = 'careit.breakShownAt';

let currentProject = '';
let currentSessionStart = Date.now();
let lastActivityTime = Date.now();
let todayCodingSeconds = 0;
let continuousCodingStart = Date.now();
let extensionContext: vscode.ExtensionContext;
let currentDay = new Date().toDateString();

export function activate(context: vscode.ExtensionContext) {
  console.log('CareIt tracker activated');
  extensionContext = context;

  
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'careit.sendNow';
  updateStatusBar();
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  
  const config = vscode.workspace.getConfiguration('careit');
  let apiKey = config.get<string>('apiKey') ?? '';
  let serverUrl = config.get<string>('serverUrl') ?? 'http://localhost:3000';
  const breakMinutes = config.get<number>('breakReminderMinutes') ?? 90;
  BREAK_THRESHOLD = breakMinutes * 60 * 1000;


  if (!apiKey) {
    vscode.window
      .showWarningMessage(
        'CareIt: No API key configured. Your coding activity won\'t be tracked.',
        'Open Settings'
      )
      .then(selection => {
        if (selection === 'Open Settings') {
          vscode.commands.executeCommand(
            'workbench.action.openSettings',
            'careit.apiKey'
          );
        }
      });
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('careit')) {
        const newConfig = vscode.workspace.getConfiguration('careit');
        apiKey = newConfig.get<string>('apiKey') || '';
        serverUrl = newConfig.get<string>('serverUrl') || 'http://localhost:3000';
        const breakMins = newConfig.get<number>('breakReminderMinutes') ?? 90;
        BREAK_THRESHOLD = breakMins * 60 * 1000;
        vscode.window.showInformationMessage('CareIt: Configuration updated.');
      }
    })
  );


  restoreSessions(context);


  if (vscode.workspace.workspaceFolders) {
    currentProject = vscode.workspace.workspaceFolders[0].name;
    currentSessionStart = Date.now();
    lastActivityTime = Date.now();
    continuousCodingStart = Date.now();
  }


  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(() => {
      onActivity();
    })
  );


  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(() => {
      onActivity();
    })
  );

 
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => {
      onActivity();
    })
  );


  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorVisibleRanges(() => {
      onActivity();
    })
  );


  context.subscriptions.push(
    vscode.window.onDidChangeActiveTerminal(() => {
      onActivity();
    })
  );


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


  startBatchTimer(() => sendBatch(serverUrl, apiKey));

 
  startBreakReminderTimer(context);


  const statusTimer = setInterval(() => {
    updateStatusBar();
  }, 30_000);

  
  context.subscriptions.push({
    dispose: () => {
      recordCurrentSession();
      persistSessions(context);
      if (projectSessions.size > 0) {
        sendBatch(serverUrl, apiKey).catch(err =>
          console.error('Final send failed', err)
        );
      }
      if (batchTimer) { clearInterval(batchTimer); }
      if (breakReminderTimer) { clearInterval(breakReminderTimer); }
      clearInterval(statusTimer);
    }
  });


  const disposable = vscode.commands.registerCommand('careit.sendNow', async () => {
    recordCurrentSession();
    await sendBatch(serverUrl, apiKey);
    vscode.window.showInformationMessage('CareIt: Analytics sent!');
  });
  context.subscriptions.push(disposable);
}



function onActivity() {
  const now = Date.now();
  const wasIdle = now - lastActivityTime >= IDLE_THRESHOLD;

 
  if (wasIdle) {
    recordCurrentSession(lastActivityTime);
    continuousCodingStart = now;
    currentSessionStart = now;
  }
  
  lastActivityTime = now;
}


function recordCurrentSession(forceEndTime?: number) {
  if (!currentProject) { return; }

  const now = forceEndTime || Date.now();
  const timeSinceLastActivity = Date.now() - lastActivityTime;


  const endTime = (timeSinceLastActivity >= IDLE_THRESHOLD) ? lastActivityTime : now;

  const durationMs = endTime - currentSessionStart;

 
  if (durationMs >= 5000) {
    const durationSeconds = Math.round(durationMs / 1000);
    todayCodingSeconds += durationSeconds;

    
    const existing = projectSessions.get(currentProject);
    if (existing) {
      existing.totalDuration += durationSeconds;
    } else {
      projectSessions.set(currentProject, {
        startTime: currentSessionStart,
        totalDuration: durationSeconds
      });
    }

    console.log(`[CareIt] Recorded ${durationSeconds}s on: ${currentProject}`);
    updateStatusBar();
  }

  currentSessionStart = now;
}


function updateStatusBar() {
  const todayStr = new Date().toDateString();
  if (todayStr !== currentDay) {
    todayCodingSeconds = 0;
    currentDay = todayStr;
  }

  const h = Math.floor(todayCodingSeconds / 3600);
  const m = Math.floor((todayCodingSeconds % 3600) / 60);

  const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
  statusBarItem.text = `$(pulse) CareIt: ${timeStr}`;
  statusBarItem.tooltip = `Today's coding time: ${timeStr}\nClick to force send analytics`;
}


function startBatchTimer(sendFn: () => Promise<void>) {
  if (batchTimer) { return; }

  batchTimer = setInterval(async () => {
    const now = Date.now();
    const idleTime = now - lastActivityTime;

   
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

async function sendBatch(serverUrl: string, apiKey: string) {
  if (projectSessions.size === 0) { return; }
  if (isSending) { return; }
  if (!apiKey) {
    console.log('[CareIt] No API key — skipping send.');
    return;
  }

  isSending = true;

  const sessionsSnapshot = new Map(projectSessions);
  const activities: ProjectActivity[] = Array.from(sessionsSnapshot.entries()).map(
    ([project, session]) => ({
      project,
      duration: session.totalDuration,
      timestamp: new Date(session.startTime).toISOString()
    })
  );

  statusBarItem.text = '$(sync~spin) CareIt: Sending...';
  console.log('[CareIt] Sending batch', activities);

  try {
    console.log(`${serverUrl.replace(/\/$/, '')}/api/v1/analytics/editor-activity`)
    await axios.post(
      `${serverUrl.replace(/\/$/, '')}/api/v1/analytics/editor-activity`,
      activities,
      {
        headers: { 'careit-api-key': apiKey },
        timeout: 10000
      }
    );


    for (const key of sessionsSnapshot.keys()) {
      const live = projectSessions.get(key);
      const snapped = sessionsSnapshot.get(key);
      if (live && snapped) {
        live.totalDuration -= snapped.totalDuration;
        if (live.totalDuration <= 0) {
          projectSessions.delete(key);
        } else {
          live.startTime = Date.now();
        }
      }
    }

  
    persistSessions(extensionContext);

    statusBarItem.text = '$(check) CareIt';
    setTimeout(() => updateStatusBar(), 3000);
  } catch (err: any) {
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
    } else {
      statusBarItem.text = '$(alert) CareIt: Retry later';
      setTimeout(() => updateStatusBar(), 5000);
    }

    
  } finally {
    isSending = false;
  }
}

function persistSessions(context: vscode.ExtensionContext) {
  const data: Record<string, SessionData> = {};
  projectSessions.forEach((session, project) => {
    data[project] = session;
  });
  context.globalState.update(SESSION_STORAGE_KEY, data);
}

function restoreSessions(context: vscode.ExtensionContext) {
  const stored = context.globalState.get<Record<string, SessionData>>(SESSION_STORAGE_KEY);
  if (stored) {
    for (const [project, session] of Object.entries(stored)) {
      projectSessions.set(project, session);
      todayCodingSeconds += session.totalDuration;
    }
    console.log(`[CareIt] Restored ${Object.keys(stored).length} pending session(s)`);
    
    context.globalState.update(SESSION_STORAGE_KEY, undefined);
  }
}


function startBreakReminderTimer(context: vscode.ExtensionContext) {
  
  breakReminderTimer = setInterval(() => {
    const now = Date.now();
    const idleTime = now - lastActivityTime;

    
    if (idleTime >= IDLE_THRESHOLD) { return; }

    const continuousMs = now - continuousCodingStart;
    if (continuousMs >= BREAK_THRESHOLD) {
      
      const lastShown = context.globalState.get<number>(BREAK_SHOWN_KEY) ?? 0;
      if (now - lastShown < 30 * 60 * 1000) { return; }

      const totalMins = Math.round(continuousMs / 60_000);
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;

      context.globalState.update(BREAK_SHOWN_KEY, now);

      vscode.window
        .showInformationMessage(
          `☕ You've been coding for ${timeStr} — time for a stretch break!`,
          'Take a Break',
          'Remind Later'
        )
        .then(selection => {
          if (selection === 'Take a Break') {
         
            continuousCodingStart = Date.now();
            vscode.window.showInformationMessage('🧘 Enjoy your break! Your streak is safe.');
          }
          
        });
    }
  }, 5 * 60_000);
}

export function deactivate() {
  if (batchTimer) { clearInterval(batchTimer); }
  if (breakReminderTimer) { clearInterval(breakReminderTimer); }
}