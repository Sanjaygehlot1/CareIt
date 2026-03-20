import React, { useState, useEffect } from 'react';
import { GitCommit, Calendar, CheckSquare } from 'lucide-react';

const DailyFocusBar: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 600);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) {
    return (
      <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        className="p-5 rounded-xl shadow-card border w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
    
        <div className="flex-1 flex items-center gap-3">
          <div className="skeleton w-1.5 h-10 rounded-full" />
          <div className="flex flex-col gap-2">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-5 w-64 max-w-full" />
          </div>
        </div>
  
        <div className="flex items-center gap-x-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className="skeleton w-5 h-5 rounded" />
              <div className="skeleton h-4 w-14" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      className="p-5 rounded-xl shadow-card border w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div style={{ backgroundColor: 'var(--accent-primary)' }} className="w-1.5 h-10 rounded-full" />
          <div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Today's Priority:</p>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              <span className="hover:text-orange-600 cursor-pointer transition-colors">
                Ship the new real-time notifications feature
              </span>
            </h3>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--border-primary)' }} className="w-full md:w-px md:h-12" />

      <div className="flex items-center gap-x-6 text-sm">
        <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
          <GitCommit size={20} />
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>32</span> Commits
        </div>
        <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
          <Calendar size={20} />
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>8.5h</span> Meetings
        </div>
        <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
          <CheckSquare size={20} />
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>14</span> Tasks
        </div>
      </div>
    </div>
  );
};

export default DailyFocusBar;