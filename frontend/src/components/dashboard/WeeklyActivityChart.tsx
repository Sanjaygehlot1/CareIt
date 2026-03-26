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
import { TrendingUp, Zap } from 'lucide-react';
import { getEditorStats } from '../../controllers/analytics';
import InfoTooltip from '../ui/InfoTooltip';
import { useDashboard } from '../../context/dashboardContext';

interface ActivityData {
  date: string;
  day: string;
  duration: number;
  focusDuration: number; 
}

const ActivityTrendChart: React.FC = () => {
  const { data: dashboardData } = useDashboard();
  const [stats, setStats] = useState<ActivityData[]>([]);
  const [range, setRange] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
     
      if (range === 7 && dashboardData?.stats) {
        setStats(dashboardData.stats);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await getEditorStats(range);
        setStats(res);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [range, dashboardData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 rounded-xl shadow-2xl border" 
             style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <p className="font-bold text-sm mb-3 border-b pb-2 flex items-center justify-between" style={{ color: 'var(--text-primary)', borderColor: 'var(--card-border)' }}>
            <span>{label}</span>
            <span  className="text-xs opacity-50 font-medium">Daily Split</span>
          </p>
          <div className="space-y-3">
            {payload.map((p: any, i: number) => {
              const seconds = p.value;
              const hrs = Math.floor(seconds / 3600);
              const mins = Math.floor((seconds % 3600) / 60);
              const timeStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
              
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || p.stroke }} />
                  <div className="flex-1">
                    <p style={{color: 'var(--text-primary)'}}  className="text-[10px] uppercase tracking-wider opacity-60 font-bold leading-none mb-1">{p.name}</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{timeStr}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', minHeight: 400 }}
        className="p-6 rounded-2xl shadow-sm border flex flex-col">
        <div className="flex items-center justify-between mb-8">
           <div className="skeleton h-6 w-48 rounded" />
        </div>
        <div className="flex-1 flex items-end gap-3 px-2 pb-8">
          {[40, 70, 45, 90, 65, 50, 80].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col gap-2">
              <div className="skeleton w-full rounded-t-lg opacity-20" style={{ height: `${h}%` }} />
              <div className="skeleton h-3 w-8 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

 
  const maxFocus = stats.reduce((max, s) => s.focusDuration > max.focusDuration ? s : max, stats[0] || {day: 'N/A', focusDuration: 0});

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      className="p-6 rounded-2xl shadow-sm border relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
               <TrendingUp size={18} />
            </div>
            Activity Trends
            <InfoTooltip
              title="Activity Chart"
              items={[
                { color: '#f97316', label: 'Coding Time', desc: 'total editor activity tracked by your VS Code extension' },
                { color: '#8b5cf6', label: 'Focus Sessions', desc: 'deep work time from the built-in focus timer' },
                { color: '#6b7280', label: 'Range Selector', desc: 'switch between 7, 15, or 30 day views' },
              ]}
            />
          </h2>
          <p style={{color: 'var(--text-primary)'}}  className="text-xs font-semibold opacity-50 ml-11 -mt-1 uppercase tracking-widest">
            Last {range} days performance
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex bg-black/5 dark:bg-white/5 p-1 rounded-xl gap-1 border border-black/5 dark:border-white/5">
            {[7, 15, 30].map(r => (
              <button 
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-lg text-[10px] uppercase font-black transition-all duration-300 ${range === r 
                  ? 'bg-white dark:bg-zinc-800 text-orange-500 shadow-lg shadow-orange-500/10' 
                  : 'text-zinc-500 hover:text-orange-400 opacity-60 hover:opacity-100'}`}
              >
                {r}D
              </button>
            ))}
          </div>
           <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span style={{color: 'var(--text-primary)'}}  className="text-[10px] uppercase font-bold opacity-60 tracking-wider">Deep Work</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
              <span style={{color: 'var(--text-primary)'}} className="text-[10px] uppercase font-bold opacity-60 tracking-wider">Total Coding</span>
           </div>
        </div>
      </div>

      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--card-border)" opacity={0.3} />

            <XAxis 
              dataKey={range > 7 ? "date" : "day"} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 600 }}
              dy={15}
              minTickGap={20}
            />

            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
              tickFormatter={(v) => `${(v / 3600).toFixed(0)}h`}
            />

            <Tooltip  content={<CustomTooltip />} cursor={{ stroke: 'var(--card-border)', strokeWidth: 1 }} />

            <Area
              type="monotone"
              dataKey="duration"
              name="Total Coding"
              stroke="#8b5cf6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTotal)"
              animationDuration={2000}
            />

            <Area
              type="monotone"
              dataKey="focusDuration"
              name="Deep Work"
              stroke="#f97316"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorFocus)"
              dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: 'var(--card-bg)' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--card-border)' }}>
         <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <Zap size={14} className="text-orange-500" />
            <span>Highest flow day: <span className="text-orange-500">{maxFocus?.day || 'N/A'}</span></span>
         </div>
         <div style={{color: 'var(--primary)'}}  className="text-[10px]  uppercase font-black tracking-widest">
            CareIt Multi-Stream Activity
         </div>
      </div>
    </div>
  );
};

export default ActivityTrendChart;