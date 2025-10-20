import React from 'react';
import { GitCommit, Calendar, CheckSquare, Zap, Edit2 } from 'lucide-react';

const DailyFocusBar: React.FC = () => {
  return (
    <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }} className="p-5 rounded-xl shadow-card border w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div style={{ backgroundColor: 'var(--accent-primary)' }} className="w-1.5 h-10 rounded-full"></div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Today's Priority:</p>
            <h3 className="text-lg font-semibold group flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <span className="hover:text-orange-600 cursor-pointer transition-colors">
                Ship the new real-time notifications feature
              </span>
              <Edit2 size={16} style={{ color: 'var(--text-tertiary)' }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
          </div>
        </div>
      </div>
      
      <div style={{ backgroundColor: 'var(--border-primary)' }} className="w-full md:w-px md:h-12"></div>

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