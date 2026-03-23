# CareIt Tracker

CareIt Tracker is the official companion extension for the [CareIt](https://github.com/Sanjaygehlot1/CareIt) developer productivity platform. It sits quietly in the background of VS Code, automatically tracking your active coding time and syncing it straight to your CareIt dashboard.

No manual stopwatches, no clunky manual entries. 

## Features

- **Seamless Time Tracking**: Automatically tracks the exact amount of time you actively spend coding. It monitors keystrokes, active window changes, scrolling, and terminal use.
- **Smart Idle Detection**: Walked away to grab a coffee? If you stop interacting with the editor for 2 minutes, CareIt automatically pauses the timer so your stats stay highly accurate.
- **Automatic Project Detection**: Understands exactly which workspace you are currently in and tags your time to that specific project name.
- **Health & Break Reminders**: We all forget to stretch. If you've been relentlessly typing for an extended period, CareIt will tap you on the shoulder with a gentle reminder to take a break.
- **Status Bar Integration**: See your total coding time for the current day pinned neatly right in your VS Code status bar.

## Setup & Configuration

This extension requires a paired CareIt account to sync your stats. 

1. Create a free account or login to your CareIt dashboard.
2. Navigate to **Settings** > **Developer Settings** entirely inside the web application.
3. Click **Generate Key** and copy your VS Code Extension Key.
4. In VS Code, open your User Settings (`Ctrl+,` or `Cmd+,`).
5. Search for `CareIt` and paste your key into the `CareIt: Api Key` field. 

If you are self-hosting your own CareIt backend engine, make sure to update the `CareIt: Server Url` setting to point to your live instance (e.g., `http://localhost:3000`).

## Extension Settings

You can customize how the extension works through the built-in VS Code settings (`careit.*`):

* `careit.apiKey`: The private API key linked to your specific CareIt account profile.
* `careit.serverUrl`: The endpoint URL where your data batches are pushed.
* `careit.breakReminderMinutes`: The continuous coding threshold (in minutes) before CareIt suggests you take a visual or stretching break (Default: `90`).

## Data Privacy & Security

Your code is your business. This extension **never** reads, tracks, or transmits any of the actual code you write, your file names, or your directory structures beyond the top-level active workspace folder name. It solely tracks numerical timestamps associated with IDE interaction events.

Data is batched locally and sent over HTTPS exclusively to your defined `serverUrl`.

## Release Notes

### 0.0.1
Initial release! Implements native passive tracking, break reminders, status bar activity polling, and offline recovery persistence.
