<div align="center">
  <h1>CareIt</h1>
  <p><b>A developer health and productivity tracker</b></p>
</div>

<br />

CareIt is a tool designed to help developers find the sweet spot between deep work and burning out. Instead of just looking at raw commits, it tracks your actual editor time, reminds you to take breaks, and gives you actionable insights on how you focus. 

The project includes a VS Code extension that watches your active session, a Node.js backend to make sense of the data, and a React dashboard where you can check your stats.

## Why we built this

Working as a dev usually means sitting for hours. It's easy to get lost in a problem and realize you haven't moved or taken a sip of water in 4 hours. CareIt tracks your workflow behind the scenes so you can keep a consistent daily streak and step away from the keyboard when it's actually time for a break.

## Features

- **Daily Streaks**: Hit your daily 30-min coding goal to secure your streak. 
- **Break Reminders**: If you code for 90 minutes straight, CareIt nudges you to grab a coffee, stretch, or rest your eyes.
- **Flow Peak Analysis**: Visualize your most productive days and hours.
- **GitHub Integration**: Connect your account via OAuth. Commits sync automatically via webhooks.
- **Project Breakdown**: See exactly which repositories and projects are eating up your time.

  <img width="1900" height="1079" alt="dashboard" src="https://github.com/user-attachments/assets/451c0fc4-5fd5-4344-9ced-1ef68101dd10" />
  <img width="2199" height="1456" alt="analytics" src="https://github.com/user-attachments/assets/1c44161f-c944-48c8-83a4-5d7c22652a6d" />
  <img width="2752" height="1536" alt="todays_agenda" src="https://github.com/user-attachments/assets/a9c4d86a-1b0e-4d77-8bc4-511448d6105b" />
  <img width="1771" height="940" alt="scratchpad" src="https://github.com/user-attachments/assets/82a13cb6-7b3e-44b7-8857-f20d9347d7b7" />
  <img width="2392" height="1536" alt="weekly_goals" src="https://github.com/user-attachments/assets/93976849-3d6f-4e5f-8b55-8fcd79962366" />
  <img width="2752" height="1536" alt="focus_timer" src="https://github.com/user-attachments/assets/de1bfd89-c882-4d12-ba53-1c013754c4df" />
  <img width="2752" height="1536" alt="streak" src="https://github.com/user-attachments/assets/bfed7987-9405-4f90-9b40-6dd4ac105aa9" />
  <img width="2210" height="1366" alt="daily_digest" src="https://github.com/user-attachments/assets/1056a776-68ce-429d-8172-40a5a4d412cb" />
  <img width="2752" height="1536" alt="vs_code" src="https://github.com/user-attachments/assets/babaaab1-0f81-4ff1-84ba-830894d3d5a2" />
  <img width="2491" height="1536" alt="burnout" src="https://github.com/user-attachments/assets/b843f951-c679-41aa-970a-71756d546eba" />

  

## Project Structure

This repo contains three main pieces:

- `/frontend` - The UI. React SPA built with Vite, Tailwind CSS v4, and Recharts.
- `/backend` - The brain. Node.js & Express API using Prisma ORM.
- `/vscode-extension` - The tracker. An editor plugin that records your active coding time locally.

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL 
- A configured GitHub App (needed for commit webhooks and OAuth login)

### Local Setup

To run everything locally, you'll need the database running and the right environment variables set up in the backend.

**1. Start the API**
```bash
cd backend
npm install
# Set up your .env file with your Postgres connection string and GitHub credentials
npx prisma generate
npx prisma db push
npm run dev
```

**2. Start the Frontend**
```bash
cd frontend
npm install
npm run dev
```

**3. Run the Extension**
```bash
cd vscode-extension/careit
npm install
# Open the /vscode-extension folder in VS Code and press F5 to launch the extension host
```

## Contributing
Pull requests are more than welcome. If you find any bugs or have feature ideas, feel free to open an issue.

## License
MIT
