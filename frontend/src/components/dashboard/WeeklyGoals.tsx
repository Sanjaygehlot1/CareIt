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
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
        <Target className="mr-3 text-orange-500" size={24} />
        Weekly Goals
      </h2>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-600">Progress</span>
          <span className="text-sm font-medium text-orange-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="space-y-3">
        {goals.map((goal, index) => (
          <div key={index} className="flex items-center">
            <CheckCircle2 size={20} className={goal.completed ? 'text-green-500' : 'text-gray-300'} />
            <span className={`ml-3 text-sm ${goal.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {goal.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyGoals;