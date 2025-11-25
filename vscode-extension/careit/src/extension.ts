import * as vscode from 'vscode';
import axios from 'axios';

let batch: any[] = [];
let batchTimer: NodeJS.Timeout | null = null;
const BATCH_INTERVAL = 30_000; 
const MAX_BATCH = 50;

function startBatchTimer(sendFn: () => Promise<void>) {
  if (batchTimer) return;
  batchTimer = setInterval(async () => {
    if (batch.length > 0) {
      await sendFn();
    }
  }, BATCH_INTERVAL);
}

async function sendBatch(serverUrl: string, apiKey: string) {
  if (batch.length === 0) return;
  const payload = batch.splice(0, batch.length);
  try {
    await axios.post(`${serverUrl.replace(/\/$/, '')}/analytics/editor-activity`, payload, {
      headers: { 'x-api-key': apiKey },
      timeout: 5000,
    });
  } catch (err) {
    console.error('Failed to send analytics:', err);
    batch.unshift(...payload);
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('DigitalTwin tracker activated');

  const config = vscode.workspace.getConfiguration('digitaltwin');
  let apiKey = config.get<string>('apiKey') ?? '';
  let serverUrl = config.get<string>('serverUrl') ?? 'http://localhost:3000';

  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('digitaltwin.apiKey')) {
      apiKey = vscode.workspace.getConfiguration('digitaltwin').get('apiKey') || '';
    }
    if (e.affectsConfiguration('digitaltwin.serverUrl')) {
      serverUrl = vscode.workspace.getConfiguration('digitaltwin').get('serverUrl') || 'http://localhost:3000';
    }
  }));

  let currentFile = vscode.window.activeTextEditor?.document.fileName || '';
  let currentStart = Date.now();

  function recordChunk(file: string, durationMs: number, keystrokes = 0) {
    const data = {
      userId: apiKey || 'anonymous', 
      project: vscode.workspace.name || 'unknown',
      language: (vscode.window.activeTextEditor?.document.languageId) || 'plain',
      duration: Math.round(durationMs / 1000),
      file,
      keystrokes,
      timestamp: new Date().toISOString()
    };
    batch.push(data);
    if (batch.length >= MAX_BATCH) {
      sendBatch(serverUrl, apiKey);
    }
    startBatchTimer(() => sendBatch(serverUrl, apiKey));
  }

  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
    const now = Date.now();
    const duration = now - currentStart;
    if (currentFile) recordChunk(currentFile, duration, 0);
    currentFile = editor?.document.fileName || '';
    currentStart = now;
  }));

  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(doc => {
    const now = Date.now();
    const duration = now - currentStart;
    recordChunk(doc.fileName, duration, 0);
    // reset start to now
    currentStart = now;
  }));

  let keystrokeCount = 0;
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
    keystrokeCount += event.contentChanges.reduce((s, c) => s + (c.text.length || 0), 0);
    if (keystrokeCount > 200) {
      const now = Date.now();
      const duration = now - currentStart;
      recordChunk(event.document.fileName, duration, keystrokeCount);
      keystrokeCount = 0;
      currentStart = now;
    }
  }));

  context.subscriptions.push({
    dispose: () => {
      const now = Date.now();
      const duration = now - currentStart;
      if (currentFile && duration > 1000) {
        recordChunk(currentFile, duration, keystrokeCount);
      }
      if (batch.length > 0) sendBatch(serverUrl, apiKey);
      if (batchTimer) {
        clearInterval(batchTimer);
        batchTimer = null;
      }
    }
  });

  const disposable = vscode.commands.registerCommand('digitaltwin.sendNow', async () => {
    await sendBatch(serverUrl, apiKey);
    vscode.window.showInformationMessage('DigitalTwin: Sent analytics batch');
  });
  context.subscriptions.push(disposable);
}

export function deactivate() {
}
