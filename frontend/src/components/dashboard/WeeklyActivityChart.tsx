import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { getEditorStats } from '../../controllers/analytics';
import { daysToWeeks } from 'date-fns';

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

  const dateToDay = (e: string) => {
    const date = new Date(e);

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return dayName;
  }

  const chartData = data || [
    { date: 'Mon', duration: 3600, keystrokes: 1200 },
    { date: 'Tue', duration: 7200, keystrokes: 4500 },
    { date: 'Wed', duration: 5400, keystrokes: 3000 },
    { date: 'Thu', duration: 9000, keystrokes: 6000 },
    { date: 'Fri', duration: 1800, keystrokes: 800 },
    { date: 'Sat', duration: 4500, keystrokes: 2000 },
    { date: 'Sun', duration: 0, keystrokes: 0 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white text-xs p-3 rounded-lg shadow-xl border border-gray-700">
          <p className="font-bold text-base mb-2 border-b border-gray-600 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="mb-1" style={{ color: entry.color }}>
              {entry.name === 'Time'
                ? `⏱️ ${(entry.value / 3600).toFixed(1)} hrs`
                : `⌨️ ${entry.value} keys`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
          Productivity Velocity
        </h2>
      </div>

     
      <div className="flex-1 w-full h-[22px] min-h-[22px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={Stats} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorKeystrokes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" opacity={0.4} />

            <XAxis
              dataKey= "date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
              dy={5}
              interval="preserveStartEnd"
            />

            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--accent-primary)', fontSize: 10 }}
              tickFormatter={(val) => `${(val / 3600).toFixed(0)}h`}
              width={30}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#3b82f6', fontSize: 10 }}
              tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              width={30}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="_sum.duration"
              name="Time"
              stroke="var(--accent-primary)"
              fillOpacity={1}
              fill="url(#colorTime)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'var(--accent-primary)' }}
              animationDuration={1000}
            />

            <Area
              yAxisId="right"
              type="monotone"
              dataKey="_sum.keystrokes"
              name="Keystrokes"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorKeystrokes)"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6' }}
              animationDuration={1000}
              animationBegin={200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] mt-2 text-center" style={{ color: 'var(--text-tertiary)' }}>
        Time vs. Intensity
      </p>
    </div>
  );
};

export default ActivityTrendChart;