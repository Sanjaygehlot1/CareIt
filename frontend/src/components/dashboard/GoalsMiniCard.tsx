import { useState, useEffect } from 'react';
import { Target, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getGoals, type Goal } from '../../controllers/goals';
import InfoTooltip from '../ui/InfoTooltip';

const GOAL_TYPE_COLORS: Record<string, string> = {
    CODING_TIME: '#f97316',
    STREAK: '#f59e0b',
    FOCUS_TIME: '#8b5cf6',
    COMMITS: '#10b981',
    CUSTOM: '#6b7280',
};

import { useDashboard } from '../../context/dashboardContext';

const GoalsMiniCard = () => {
    const navigate = useNavigate();
    const { data: dashboardData, loading: dashboardLoading } = useDashboard();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (dashboardData?.goals) {
            // Filter only weekly goals for the mini card
            const weeklyGoals = dashboardData.goals.filter((g: Goal) => g.period === 'WEEKLY');
            setGoals(weeklyGoals.slice(0, 4));
            setLoading(false);
            return;
        }

        // Only fetch if dashboard data is missing (unlikely since it's wrapped)
        if (!dashboardLoading) {
            getGoals('WEEKLY').then(data => {
                setGoals(data.slice(0, 4));
                setLoading(false);
            });
        }
    }, [dashboardData, dashboardLoading]);

    const completed = goals.filter(g => g.completed).length;
    const total = goals.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div
            className="rounded-2xl p-5 shadow-sm w-full"
            style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                color: 'var(--text-primary)',
            }}
        >
           
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(249,115,22,0.1)' }}>
                        <Target size={18} style={{ color: 'var(--accent-primary)' }} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                        Weekly Goals
                        <InfoTooltip
                          title="Goals"
                          items={[
                            { color: '#f97316', label: 'Coding Time', desc: 'auto-tracked from VS Code extension' },
                            { color: '#f59e0b', label: 'Streak', desc: 'consecutive days of 30+ min coding' },
                            { color: '#8b5cf6', label: 'Focus Time', desc: 'deep work sessions from the focus timer' },
                            { color: '#10b981', label: 'Commits', desc: 'synced from GitHub pushes' },
                            { color: '#6b7280', label: 'Custom', desc: 'manually created goals you track yourself' },
                          ]}
                        />
                    </h2>
                        {!loading && total > 0 && (
                            <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                                {completed}/{total} completed
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => navigate('/goals')}
                    className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                    style={{ color: 'var(--accent-primary)' }}
                >
                    View all
                    <ArrowRight size={13} />
                </button>
            </div>

       
            {!loading && total > 0 && (
                <div className="mb-4">
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <div
                            className="h-1.5 rounded-full transition-all duration-700"
                            style={{
                                width: `${pct}%`,
                                background: pct === 100 ? '#10b981' : 'linear-gradient(90deg, var(--accent-primary), #f59e0b)',
                            }}
                        />
                    </div>
                    <p className="text-[11px] mt-1 text-right" style={{ color: 'var(--text-secondary)' }}>{pct}%</p>
                </div>
            )}

      
            {loading ? (
                <div className="space-y-3">
           
                    <div className="skeleton h-1.5 w-full rounded-full mb-4" />
                    {[70, 50, 85, 40].map((w, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="skeleton w-4 h-4 rounded-full flex-shrink-0" />
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <div className="skeleton h-3 rounded" style={{ width: `${w}%` }} />
                                    <div className="skeleton h-3 w-10 rounded ml-2" />
                                </div>
                                <div className="skeleton h-1 w-full rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : goals.length === 0 ? (
                <div className="flex flex-col items-center py-5 gap-3 text-center">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No weekly goals set</p>
                    <button
                        onClick={() => navigate('/goals')}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' }}
                    >
                        <Sparkles size={12} />Set goals with AI
                    </button>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {goals.map(goal => {
                        const pct = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                        const color = GOAL_TYPE_COLORS[goal.type] ?? '#6b7280';
                        return (
                            <div key={goal.id} className="flex items-center gap-3">
                         
                                {goal.completed
                                    ? <CheckCircle2 size={16} className="flex-shrink-0" style={{ color: '#10b981' }} />
                                    : <div className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: color }} />
                                }
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span
                                            className={`text-xs font-medium truncate ${goal.completed ? 'line-through opacity-50' : ''}`}
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {goal.title}
                                        </span>
                                        <span className="text-[10px] ml-2 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                                            {goal.currentValue}/{goal.targetValue}
                                        </span>
                                    </div>
                                    <div className="w-full h-1 rounded-full" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                        <div
                                            className="h-1 rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%`, backgroundColor: goal.completed ? '#10b981' : color }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}

               
                    <button
                        onClick={() => navigate('/goals')}
                        className="w-full mt-1 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80 flex items-center justify-center gap-1.5"
                        style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                    >
                        Manage all goals
                        <ArrowRight size={12} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default GoalsMiniCard;
