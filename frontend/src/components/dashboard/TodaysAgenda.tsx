import { CalendarClock } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const events = [
  { time: '10:00 AM', title: 'Team Standup' },
  { time: '11:30 AM', title: 'Design Review - Project Phoenix' },
  { time: '02:00 PM', title: 'Focus Time Block' },
  { time: '04:30 PM', title: '1-on-1 with Manager' },
];

const TodaysAgenda: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 700);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) {
    return (
      <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        className="p-6 rounded-xl shadow-card border">
   
        <div className="flex items-center gap-3 mb-5">
          <div className="skeleton w-6 h-6 rounded" />
          <div className="skeleton h-5 w-32" />
        </div>
   
        <div className="space-y-4">
          {[60, 80, 50, 70].map((w, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="skeleton h-4 w-20 flex-shrink-0" />
              <div className="skeleton w-1.5 h-1.5 rounded-full flex-shrink-0" />
              <div className="skeleton h-4 flex-1" style={{ maxWidth: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      className="p-6 rounded-xl shadow-card border">
      <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
        <CalendarClock className="mr-3" style={{ color: 'var(--accent-primary)' }} size={24} />
        Today's Agenda
      </h2>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="flex items-center space-x-4">
            <span className="font-medium text-sm w-24" style={{ color: 'var(--text-secondary)' }}>{event.time}</span>
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }} />
            <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{event.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaysAgenda;