import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { getEditorStats } from '../../controllers/analytics';

interface ActivityData {
  date: string;
  duration: number;
  keystrokes: number;
}

interface ActivityTrendChartProps {
  data?: ActivityData[];
}

const ActivityTrendChart: React.FC<ActivityTrendChartProps> = ({ data }) => {

  const [Stats, setStats] = useState<ActivityTrendChartProps[] | []>([])


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getEditorStats();
        console.log(res)
        setStats(res);

      } catch (error) {
        console.log(error)
      }
    }
    fetchStats()
  }, [])




  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const seconds = payload[0].value;
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);

      let timeDisplay;
      if (hours > 0) {
        timeDisplay = `${hours}h ${minutes}m`;
      } else {
        timeDisplay = `${minutes}m`;
      }

      return (
        <div className="bg-black text-white text-xs p-3 rounded-lg shadow-xl border border-gray-700">
          <p className="font-bold text-base mb-2 border-b border-gray-600 pb-1">{label}</p>
          <p className="mb-1" style={{ color: payload[0].color }}>
            ⏱️ {timeDisplay}
          </p>
        </div>
      );
    }
    return null;
  };

  <defs>
    <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
      <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
    </linearGradient>
  </defs>
  return (
    <div
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)'
      }}
      className="p-6 rounded-xl shadow-sm border h-[45%] flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center" style={{ color: 'var(--text-primary)' }}>
          <TrendingUp className="mr-3" style={{ color: 'var(--accent-primary)' }} size={20} />
          VS Code Activity
        </h2>
      </div>

      {/* ✅ Fixed container height */}
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={Stats}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border-primary)"
              opacity={0.4}
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
              dy={5}
            />

            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
              tickFormatter={(val) => `${(val / 3600).toFixed(1)}h`}
              width={45}
              domain={[0, 'auto']}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="duration"
              name="Time"
              stroke="var(--accent-primary)"
              fillOpacity={1}
              fill="url(#colorTime)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5, fill: 'var(--accent-primary)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] mt-2 text-center" style={{ color: 'var(--text-tertiary)' }}>
        Coding Activity Over Time
      </p>
    </div>
  );
};

export default ActivityTrendChart;