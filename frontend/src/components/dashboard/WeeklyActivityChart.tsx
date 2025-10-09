// src/components/dashboard/WeeklyActivityChart.tsx
import { BarChart3 } from 'lucide-react';
import React from 'react';

const weeklyData = [
  { day: 'Mon', value: 65 },
  { day: 'Tue', value: 78 },
  { day: 'Wed', value: 92 },
  { day: 'Thu', value: 81 },
  { day: 'Fri', value: 75 },
  { day: 'Sat', value: 40 },
  { day: 'Sun', value: 30 },
];

const WeeklyActivityChart: React.FC = () => {
  const maxValue = Math.max(...weeklyData.map(d => d.value));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
        <BarChart3 className="mr-3 text-orange-500" size={24} />
        Weekly Activity Trend
      </h2>
      <div className="flex justify-between items-end h-48 space-x-2">
        {weeklyData.map((data) => (
          <div key={data.day} className="flex-1 flex flex-col items-center">
            <div
              className="w-3/4 bg-orange-300 hover:bg-orange-400 rounded-t-md transition-all"
              style={{ height: `${(data.value / maxValue) * 100}%` }}
            ></div>
            <span className="text-xs font-medium text-gray-500 mt-2">{data.day}</span>
          </div>
        ))}
      </div>
       <p className="text-xs text-gray-400 mt-2 text-center">Your productivity hotspots for the week.</p>
    </div>
  );
};
// Note: A library like Recharts or Chart.js would be perfect for adding tooltips and more interactivity here.
export default WeeklyActivityChart;