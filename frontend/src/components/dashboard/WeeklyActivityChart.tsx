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
    <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }} className="p-6 rounded-xl shadow-card border">
      <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
        <BarChart3 className="mr-3" style={{ color: 'var(--accent-primary)' }} size={24} />
        Weekly Activity Trend
      </h2>
      <div className="flex justify-between items-end h-48 space-x-2">
        {weeklyData.map((data) => (
          <div key={data.day} className="flex-1 flex flex-col items-center">
            <div
              className="w-3/4 rounded-t-md transition-all hover:opacity-80"
              style={{ 
                height: `${(data.value / maxValue) * 100}%`,
                backgroundColor: 'var(--accent-primary)'
              }}
            ></div>
            <span className="text-xs font-medium mt-2" style={{ color: 'var(--text-secondary)' }}>{data.day}</span>
          </div>
        ))}
      </div>
       <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-tertiary)' }}>Your productivity hotspots for the week.</p>
    </div>
  );
};
// Note: A library like Recharts or Chart.js would be perfect for adding tooltips and more interactivity here.
export default WeeklyActivityChart;