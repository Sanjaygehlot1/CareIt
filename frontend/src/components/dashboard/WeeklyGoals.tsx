// src/components/dashboard/WeeklyGoals.tsx
import { CheckCircle2, Target } from 'lucide-react';
import React from 'react';

const goals = [
  { text: 'Deploy the new authentication service', completed: true },
  { text: 'Finalize Q4 roadmap presentation', completed: true },
  { text: 'Onboard the new frontend developer', completed: false },
  { text: 'Review all open pull requests', completed: false },
];

const WeeklyGoals: React.FC = () => {
  const completedGoals = goals.filter(g => g.completed).length;
  const progress = (completedGoals / goals.length) * 100;

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }} className="p-6 rounded-xl shadow-card border">
      <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
        <Target className="mr-3" style={{ color: 'var(--accent-primary)' }} size={24} />
        Weekly Goals
      </h2>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Progress</span>
          <span className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>{Math.round(progress)}%</span>
        </div>
        <div className="w-full rounded-full h-2.5" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <div className="h-2.5 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: 'var(--accent-primary)' }}></div>
        </div>
      </div>

      <div className="space-y-3">
        {goals.map((goal, index) => (
          <div key={index} className="flex items-center">
            <CheckCircle2 
              size={20} 
              style={{ color: goal.completed ? '#10b981' : 'var(--text-tertiary)' }} 
            />
            <span 
              className={`ml-3 text-sm ${goal.completed ? 'line-through' : ''}`}
              style={{ color: goal.completed ? 'var(--text-tertiary)' : 'var(--text-primary)' }}
            >
              {goal.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyGoals;