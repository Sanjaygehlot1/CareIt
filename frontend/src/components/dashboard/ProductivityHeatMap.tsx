// src/components/dashboard/ProductivityHeatmap.tsx
import { GitCommit } from 'lucide-react';
import React from 'react';

const ProductivityHeatmap: React.FC = () => {
  // Placeholder data: 0 = no activity, 4 = high activity
  const activityLevels = Array.from({ length: 98 }, () => Math.floor(Math.random() * 5));

  const getColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-orange-100';
      case 2: return 'bg-orange-200';
      case 3: return 'bg-orange-300';
      case 4: return 'bg-orange-400';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
        <GitCommit className="mr-3 text-orange-500" size={24} />
        Productivity Heatmap
      </h2>
      <div className="grid grid-cols-14 gap-1.5">
        {activityLevels.map((level, index) => (
          <div
            key={index}
            className={`w-full aspect-square rounded ${getColor(level)} tooltip`}
            data-tip={`Activity: ${level}`} // For daisyUI tooltip or similar
          />
        ))}
      </div>
       <p className="text-xs text-gray-400 mt-2">Activity for the last 14 weeks.</p>
    </div>
  );
};

export default ProductivityHeatmap;