import { useEffect, useState } from 'react';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { AxiosInstance } from '../../axios/axiosInstance';
import { Activity, PieChart as PieChartIcon, Info, Code2, Flame, Github } from 'lucide-react';
import InfoTooltip from '../ui/InfoTooltip';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

interface ReportData {
    timeAllocation: { name: string, value: number, color: string }[],
    productivityByDay: { name: string, value: number }[],
    projectBreakdown: { name: string, value: number }[],
    activityHeatmap: {
        source: 'github' | 'local',
        data: { date: string, count: number }[]
    }
}

export default function AdvancedReports() {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        AxiosInstance.get('/reports/advanced')
            .then(res => {
                setData(res.data.data);
            })
            .catch(err => console.error("Failed to load advanced reports:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-80 skeleton rounded-xl" />
                    <div className="h-80 skeleton rounded-xl" />
                </div>
                <div className="h-64 skeleton rounded-xl" />
            </div>
        );
    }

    if (!data) return null;

    
    const heatmapData = data.activityHeatmap.data.slice(-90);
    const blocks = [];
    for (let i = 0; i < 3; i++) {
        blocks.push(heatmapData.slice(i * 30, (i + 1) * 30));
    }

    return (
        <div className="space-y-8 mt-6 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
                <div className="p-6 rounded-xl border shadow-sm flex flex-col" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                    <h3 className="text-lg font-semibold flex items-center mb-6" style={{ color: 'var(--text-primary)' }}>
                        <PieChartIcon className="mr-3" size={20} style={{ color: 'var(--accent-primary)' }} />
                        Time Allocation <span className="text-xs ml-2 font-medium opacity-60">(Last 7 Days)</span>
                        <span className="ml-1">
                          <InfoTooltip
                            title="Time Allocation"
                            items={[
                              { color: '#f97316', label: 'Deep Work', desc: 'concentrated coding time without interruptions' },
                              { color: '#ef4444', label: 'Meetings', desc: 'aggregated from your Google Calendar events' },
                              { color: '#8b5cf6', label: 'Coding', desc: 'general development and editor activity' },
                            ]}
                          />
                        </span>
                    </h3>
                    <div className="flex-1 flex justify-center items-center relative min-h-[300px]">
                        {data.timeAllocation.length === 0 ? (
                            <div className="flex flex-col items-center opacity-50">
                                <Info style={{ color: 'var(--text-secondary)' }} size={32} className="mb-2" />
                                <span style={{ color: 'var(--text-secondary)' }} className="text-sm">No recorded data</span>
                            </div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.timeAllocation}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                            animationDuration={1500}
                                        >
                                            {data.timeAllocation.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(val: number) => [`${val} hrs`, 'Duration']}
                                            contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', borderRadius: '12px', color: 'var(--text-primary)' }}
                                            itemStyle={{ color: 'var(--text-primary)', padding: '2px 0' }}
                                            labelStyle={{ display: 'none' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-[-10px]">
                                    <span className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                        {data.timeAllocation.reduce((acc, curr) => acc + curr.value, 0).toFixed(1)}h
                                    </span>
                                    <span style={{ color: 'var(--text-secondary)' }} className="text-[9px] uppercase font-black tracking-[0.2em] opacity-60">Total Time</span>
                                </div>
                                <div className="absolute -bottom-4 w-full flex justify-center gap-3 text-[11px] font-bold flex-wrap px-4">
                                    {data.timeAllocation.map((entry, i) => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm transition-all hover:translate-y-[-2px]" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-secondary)', borderColor: 'var(--card-border)' }}>
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                            <span>{entry.name}</span>
                                            <span style={{ color: 'var(--accent-primary)' }} className="font-black border-l pl-2 border-primary/20">{entry.value}h</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

              
                <div className="p-6 rounded-xl border shadow-sm flex flex-col" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                    <h3 className="text-lg font-semibold flex items-center mb-6" style={{ color: 'var(--text-primary)' }}>
                        <Activity className="mr-3" size={20} style={{ color: 'var(--accent-primary)' }} />
                        Flow Peak <span className="text-xs ml-2 font-medium opacity-60">(Avg Mins)</span>
                        <span className="ml-1">
                          <InfoTooltip
                            title="Flow Peak"
                            items={[
                              { color: '#f97316', label: 'Peak Day', desc: 'the day with the highest average coding minutes is highlighted' },
                              { color: '#6b7280', label: 'Daily Average', desc: 'average coding time per day over the last week' },
                            ]}
                          />
                        </span>
                    </h3>
                    <div className="flex-1 min-h-[250px] relative w-full pr-4">
                        {data.productivityByDay.every(d => d.value === 0) ? (
                            <div style={{ color: 'var(--text-secondary)' }} className="flex flex-col h-full justify-center items-center opacity-50 absolute inset-0">
                                <Info size={32} className="mb-2" />
                                <span className="text-sm">Low activity this week</span>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.productivityByDay} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                                    <Tooltip
                                        cursor={{ fill: 'var(--text-primary)', opacity: 0.05 }}
                                        contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', borderRadius: '12px', color: 'var(--text-primary)' }}
                                        itemStyle={{ color: 'var(--text-primary)' }}
                                        labelStyle={{ color: 'var(--text-primary)' }}
                                    />
                                    <Bar dataKey="value" fill="var(--accent-primary)" radius={[6, 6, 6, 6]} animationDuration={1500}>
                                        {data.productivityByDay.map((entry, index) => {
                                            const maxVal = Math.max(...data.productivityByDay.map(d => d.value));
                                            return <Cell key={`cell-${index}`} fill={entry.value === maxVal ? "var(--accent-primary)" : "var(--accent-light)"} />;
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                <h3 className="text-sm font-bold flex items-center mb-6 opacity-80 uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
                    <Code2 className="mr-2" size={16} style={{ color: 'var(--accent-primary)' }} />
                    Engineering Focus
                    <span className="ml-1">
                      <InfoTooltip
                        title="Engineering Focus"
                        items={[
                          { color: '#f97316', label: 'Project Breakdown', desc: 'horizontal bars showing time spent per project' },
                          { color: '#6b7280', label: 'Top Projects', desc: 'ranked by total coding hours from your editor' },
                        ]}
                      />
                    </span>
                </h3>
                <div className="h-48 relative">
                    {data.projectBreakdown.length == 0 ? (
                        <div style={{ color: 'var(--text-secondary)' }} className="flex flex-col h-full justify-center items-center opacity-50 absolute inset-0">
                            <Info size={32} className="mb-2" />
                            <span className="text-sm">No projects recorded</span>
                        </div>
                    ) : <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={data.projectBreakdown}
                            margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                            barCategoryGap={4}
                        >
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={40} tick={{ fill: 'var(--text-primary)', fontSize: 11, fontWeight: 700 }} />
                            <Tooltip 
                                cursor={{ fill: 'var(--text-primary)', opacity: 0.05 }} 
                                contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', borderRadius: '12px', color: 'var(--text-primary)' }}
                                itemStyle={{ color: 'var(--text-primary)' }}
                                labelStyle={{ color: 'var(--text-primary)' }}
                            />
                            <Bar style={{ color: 'var(--accent-primary)' }} dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {data.projectBreakdown.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={'var(--accent-primary)'} fillOpacity={1 - (index * 0.15)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    }

                </div>
            </div>

            <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <h3 className="text-sm font-bold flex items-center opacity-80 uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
                            <Flame className="mr-2" size={16} style={{ color: 'var(--accent-primary)' }} />
                            Contribution Heatmap
                            <span className="ml-1">
                              <InfoTooltip
                                title="Contribution Heatmap"
                                items={[
                                  { color: '#f97316', label: 'Activity Grid', desc: 'each square is one day, darker = more activity' },
                                  { color: '#10b981', label: 'GitHub Sync', desc: 'shows real contributions when GitHub is connected' },
                                  { color: '#6b7280', label: 'Fallback', desc: 'uses local editor sessions if GitHub is not linked' },
                                ]}
                              />
                            </span>
                        </h3>
                        {data.activityHeatmap.source === 'local' && (
                            <a href="/settings" className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[9px] font-black uppercase hover:bg-orange-500/20 transition-all">
                                <Github size={10} />
                                Connect GitHub
                            </a>
                        )}
                    </div>
                    <div style={{ color: 'var(--text-primary)' }} className="flex items-center gap-1.5 text-[9px] font-black uppercase">
                        <span  >Low</span>
                        {[0.2, 0.4, 0.7, 1.0].map((o, i) => (
                            <div key={i} className="w-2.5 h-2.5 rounded-[2px] bg-accent-primary"
                                style={{ backgroundColor: 'var(--accent-primary)', opacity: o }} />
                        ))}
                        <span>High</span>
                    </div>
                </div>

                <div style={{ color: 'var(--text-primary)' }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {blocks.map((block, bIdx) => (
                        <div key={bIdx} className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-bold  uppercase tracking-[0.2em]">
                                <span>{bIdx === 0 ? 'Month 1' : bIdx === 1 ? 'Month 2' : 'Present'}</span>
                                <span>{block.length}d</span>
                            </div>
                            <div className="grid grid-cols-10 gap-1.5">
                                {block.map((day) => (
                                    <div
                                        key={day.date}
                                        data-tooltip-id="heatmap-tooltip"
                                        data-tooltip-content={`${day.date}: ${day.count} ${data.activityHeatmap.source === 'github' ? 'contributions' : 'sessions'}`}
                                        className={`w-full aspect-square rounded-[3px] transition-all hover:scale-125 cursor-default`}
                                        style={{
                                            backgroundColor: day.count > 0 ? 'var(--accent-primary)' : 'var(--bg-primary)',
                                            border: day.count > 0 ? 'none' : '1px solid var(--card-border)',
                                            opacity: day.count === 0 ? 0.4 : (day.count < 3 ? 0.6 : (day.count < 6 ? 0.8 : 1))
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {data.activityHeatmap.source === 'local' && (
                    <div className="mt-8 flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-orange-500/20 bg-orange-500/5">
                        <Github size={14} className="text-orange-500" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-orange-500">
                            Connect your GitHub profile for real-time heatmap sync
                        </span>
                    </div>
                )}
                <ReactTooltip id="heatmap-tooltip" className="custom-tooltip" place="top" opacity={1} />
            </div>
        </div>
    );
}
