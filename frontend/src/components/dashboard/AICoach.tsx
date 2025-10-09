import { Lightbulb } from 'lucide-react';
import React from 'react';

const AICoach: React.FC = () => {
  return (
    <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-r-lg">
      <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
        <Lightbulb className="mr-3 text-orange-500" size={24} />
        AI Productivity Coach
      </h2>
      <p className="text-gray-600">
        "Your commit frequency is highest on Thursdays. Consider scheduling your most complex coding tasks for that day to maximize your flow state."
      </p>
    </div>
  );
};

export default AICoach;