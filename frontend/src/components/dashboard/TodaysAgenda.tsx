// src/components/dashboard/TodaysAgenda.tsx
import { CalendarClock } from 'lucide-react';
import React from 'react';

const events = [
  { time: '10:00 AM', title: 'Team Standup' },
  { time: '11:30 AM', title: 'Design Review - Project Phoenix' },
  { time: '02:00 PM', title: 'Focus Time Block' },
  { time: '04:30 PM', title: '1-on-1 with Manager' },
];

const TodaysAgenda: React.FC = () => {
  return (
    <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }} className="p-6 rounded-xl shadow-card border">
      <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
        <CalendarClock className="mr-3" style={{ color: 'var(--accent-primary)' }} size={24} />
        Today's Agenda
      </h2>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="flex items-center space-x-4">
            <span className="font-medium text-sm w-24" style={{ color: 'var(--text-secondary)' }}>{event.time}</span>
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
            <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{event.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaysAgenda;