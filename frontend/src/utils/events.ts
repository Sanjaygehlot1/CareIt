// Get the current date to make events relative
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();
const currentDay = now.getDate();

export const demoEvents = [
  {
    summary: 'Team Standup',
    start: new Date(currentYear, currentMonth, currentDay, 10, 0, 0), // Today at 10:00 AM
    
  },
  {
    summary: 'Project Phoenix - Design Review',
    start: new Date(currentYear, currentMonth, currentDay, 14, 0, 0), // Today at 2:00 PM
  },
  {
    summary: 'Submit Weekly Report',
    start: new Date(currentYear, currentMonth, currentDay - 1, 17, 0, 0), // Yesterday at 5:00 PM
  },
  {
    summary: 'Q4 Planning Offsite',
    start: new Date(currentYear, currentMonth, currentDay + 2), // 2 days from now
  },
  {
    summary: 'Deploy New Feature',
    start: new Date(currentYear, currentMonth, currentDay + 5), // 5 days from now
  },
];