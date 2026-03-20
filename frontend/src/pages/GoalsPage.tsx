import { useState, useEffect, useCallback } from 'react';
import {
    Target, Sparkles, Plus, Trash2, Check, Loader2,
    Code2, Zap, Timer, Trophy, PenLine, ChevronDown, X,
    TrendingUp, CheckCircle2, Circle
} from 'lucide-react';
import {
    getGoals, createGoal, updateGoal, deleteGoal, generateAiGoals,
    type Goal, type CreateGoalPayload
} from '../controllers/goals';



const GOAL_TYPE_META: Record<string, {
    label: string; icon: React.ReactNode; color: string; bg: string; border: string;
}> = {
    CODING_TIME: { label: 'Coding Time', icon: <Code2 size={15} />, color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)' },
    STREAK: { label: 'Streak', icon: <Zap size={15} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
    FOCUS_TIME: { label: 'Focus Time', icon: <Timer size={15} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.25)' },
    COMMITS: { label: 'Commits', icon: <Trophy size={15} />, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
    CUSTOM: { label: 'Custom', icon: <PenLine size={15} />, color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.25)' },
};

const PERIOD_OPTIONS: { value: Goal['period']; label: string; desc: string }[] = [
    { value: 'DAILY', label: 'Daily', desc: 'Reset every day' },
    { value: 'WEEKLY', label: 'Weekly', desc: 'Reset every Monday' },
    { value: 'MONTHLY', label: 'Monthly', desc: 'Reset every 1st' },
];

const TYPE_OPTIONS: { value: Goal['type']; label: string; unitHint: string; targetHint: string }[] = [
    { value: 'CODING_TIME', label: 'Coding Time', unitHint: 'minutes', targetHint: 'e.g. 120' },
    { value: 'STREAK', label: 'Streak', unitHint: 'days', targetHint: 'e.g. 7' },
    { value: 'FOCUS_TIME', label: 'Focus Time', unitHint: 'minutes', targetHint: 'e.g. 60' },
    { value: 'COMMITS', label: 'Commits', unitHint: 'commits', targetHint: 'e.g. 10' },
    { value: 'CUSTOM', label: 'Custom', unitHint: '', targetHint: 'e.g. 5' },
];



function ProgressRing({ progress, size = 56, stroke = 5, color }: {
    progress: number; size?: number; stroke?: number; color: string;
}) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = Math.min(progress / 100, 1) * circ;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-tertiary)" strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.5s ease' }} />
        </svg>
    );
}



function GoalCard({ goal, onDelete, onToggle }: {
    goal: Goal; onDelete: (id: number) => void; onToggle: (id: number, completed: boolean) => void;
}) {
    const meta = GOAL_TYPE_META[goal.type] ?? GOAL_TYPE_META.CUSTOM;
    const pct = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
    const [deleting, setDeleting] = useState(false);
    const [toggling, setToggling] = useState(false);

    return (
        <div
            className="rounded-2xl p-5 flex items-start gap-5 group transition-all hover:shadow-md"
            style={{
                backgroundColor: 'var(--card-bg)',
                border: `1px solid ${goal.completed ? 'rgba(16,185,129,0.35)' : 'var(--card-border)'}`,
                opacity: deleting ? 0.4 : 1,
            }}
        >
        
            <div
                className="relative flex-shrink-0 cursor-pointer select-none"
                onClick={async () => {
                    setToggling(true);
                    await onToggle(goal.id, !goal.completed);
                    setToggling(false);
                }}
                title={goal.completed ? 'Mark incomplete' : 'Mark complete'}
            >
                <ProgressRing progress={pct} color={goal.completed ? '#10b981' : meta.color} />
                <div className="absolute inset-0 flex items-center justify-center">
                    {toggling
                        ? <Loader2 size={14} className="animate-spin" style={{ color: meta.color }} />
                        : goal.completed
                            ? <Check size={16} color="#10b981" strokeWidth={3} />
                            : <span className="text-[11px] font-bold" style={{ color: meta.color }}>{Math.round(pct)}%</span>
                    }
                </div>
            </div>

    
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span
                                className={`font-semibold ${goal.completed ? 'line-through opacity-50' : ''}`}
                                style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}
                            >
                                {goal.title}
                            </span>
                            {goal.isAiGenerated && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                    style={{ backgroundColor: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>
                                    <Sparkles size={9} />AI
                                </span>
                            )}
                        </div>
                        {goal.description && (
                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                {goal.description}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={async () => { setDeleting(true); await onDelete(goal.id); }}
                        disabled={deleting}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-xl flex-shrink-0 hover:bg-red-50"
                    >
                        {deleting ? <Loader2 size={14} className="animate-spin text-red-400" /> : <Trash2 size={14} className="text-red-400" />}
                    </button>
                </div>

                <div className="mt-3">
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <div
                            className="h-2 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: goal.completed ? '#10b981' : meta.color }}
                        />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
                            style={{ backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
                            {meta.icon}
                            {meta.label}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}


function AddGoalModal({ onClose, onSaved }: { onClose: () => void; onSaved: (g: Goal) => void }) {
    const [form, setForm] = useState<CreateGoalPayload>({
        title: '', description: '', type: 'CODING_TIME', period: 'WEEKLY', targetValue: 120, unit: 'minutes',
    });
    const [saving, setSaving] = useState(false);
    const selectedType = TYPE_OPTIONS.find(t => t.value === form.type)!;

    const handleTypeChange = (type: Goal['type']) => {
        const meta = TYPE_OPTIONS.find(t => t.value === type)!;
        setForm(p => ({ ...p, type, unit: meta.unitHint }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        setSaving(true);
        const created = await createGoal(form);
        setSaving(false);
        if (created) onSaved(created);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ backgroundColor: 'var(--modal-overlay)' }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
                style={{ backgroundColor: 'var(--modal-bg)', border: '1px solid var(--card-border)' }}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Target size={18} style={{ color: 'var(--accent-primary)' }} />
                        New Goal
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-lg hover:opacity-70">
                        <X size={18} style={{ color: 'var(--text-secondary)' }} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Goal name *</label>
                        <input required value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            placeholder="e.g. Code for 2 hours daily"
                            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Description (optional)</label>
                        <input value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            placeholder="Why this goal matters…"
                            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Type</label>
                            <div className="relative">
                                <select value={form.type} onChange={e => handleTypeChange(e.target.value as Goal['type'])}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none"
                                    style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}>
                                    {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-secondary)' }} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Period</label>
                            <div className="relative">
                                <select value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value as Goal['period'] }))}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none"
                                    style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}>
                                    {PERIOD_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-secondary)' }} />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Target *</label>
                            <input required type="number" min={1} value={form.targetValue}
                                onChange={e => setForm(p => ({ ...p, targetValue: Number(e.target.value) }))}
                                placeholder={selectedType.targetHint}
                                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }} />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Unit</label>
                            <input value={form.unit}
                                onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                                placeholder={selectedType.unitHint || 'unit'}
                                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }} />
                        </div>
                    </div>
                    <button type="submit" disabled={saving || !form.title.trim()}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:opacity-90 flex items-center justify-center gap-2"
                        style={{ backgroundColor: 'var(--accent-primary)' }}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        {saving ? 'Creating…' : 'Create Goal'}
                    </button>
                </form>
            </div>
        </div>
    );
}


function StatsBar({ goals }: { goals: Goal[] }) {
    const total = goals.length;
    const completed = goals.filter(g => g.completed).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const byType = Object.entries(GOAL_TYPE_META).map(([type, meta]) => ({
        ...meta, type, count: goals.filter(g => g.type === type).length
    })).filter(t => t.count > 0);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            
            <div className="col-span-2 sm:col-span-2 rounded-2xl p-4 flex items-center gap-4"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <div className="relative w-16 h-16 flex-shrink-0">
                    <svg width={64} height={64} style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx={32} cy={32} r={26} fill="none" stroke="var(--bg-tertiary)" strokeWidth={6} />
                        <circle cx={32} cy={32} r={26} fill="none"
                            stroke="var(--accent-primary)" strokeWidth={6}
                            strokeDasharray={`${(pct / 100) * 2 * Math.PI * 26} ${2 * Math.PI * 26}`}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dasharray 0.7s ease' }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{pct}%</span>
                    </div>
                </div>
                <div>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{completed}<span className="text-base font-normal" style={{ color: 'var(--text-secondary)' }}>/{total}</span></p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Goals completed</p>
                    <div className="flex gap-2 mt-1.5">
                        {byType.map(t => (
                            <span key={t.type} className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                                style={{ backgroundColor: t.bg, color: t.color }}>
                                {t.count} {t.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            
            <div className="rounded-2xl p-4 flex flex-col justify-between"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
                    <Circle size={16} className="text-red-400" />
                </div>
                <div>
                    <p className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{total - completed}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>In progress</p>
                </div>
            </div>

         
            <div className="rounded-2xl p-4 flex flex-col justify-between"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
                <div>
                    <p className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{completed}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Completed</p>
                </div>
            </div>
        </div>
    );
}


const GoalsPage = () => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [activePeriod, setActivePeriod] = useState<Goal['period']>('WEEKLY');
    const [aiError, setAiError] = useState('');
    const [aiSuccess, setAiSuccess] = useState('');

    const fetchGoals = useCallback(async () => {
        setLoading(true);
        const data = await getGoals(activePeriod);
        setGoals(data);
        setLoading(false);
    }, [activePeriod]);

    useEffect(() => { fetchGoals(); }, [fetchGoals]);

    const handleDelete = async (id: number) => {
        const ok = await deleteGoal(id);
        if (ok) setGoals(prev => prev.filter(g => g.id !== id));
    };

    const handleToggle = async (id: number, completed: boolean) => {
        const updated = await updateGoal(id, { completed });
        if (updated) setGoals(prev => prev.map(g => g.id === id ? updated : g));
    };

    const handleAddGoal = (g: Goal) => {
        setGoals(prev => [g, ...prev]);
        setShowModal(false);
    };

    const handleAiGenerate = async () => {
        setAiLoading(true);
        setAiError('');
        setAiSuccess('');
        const result = await generateAiGoals();
        setAiLoading(false);
        if (result?.goals?.length) {
            setGoals(prev => [...result.goals, ...prev]);
            setAiSuccess(`✦ AI generated ${result.goals.length} goals based on your coding data`);
            setTimeout(() => setAiSuccess(''), 5000);
        } else {
            setAiError('AI generation failed. Make sure GEMINI_API_KEY is set in the backend .env');
        }
    };

    const filtered = goals;

    return (
        <div style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-32">

       
                <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                                <Target size={20} color="white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Goals</h1>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Track your progress, powered by your data</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={handleAiGenerate} disabled={aiLoading}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:opacity-90 shadow-md"
                            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                            {aiLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                            {aiLoading ? 'AI is thinking…' : 'Generate with AI'}
                        </button>
                        <button onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shadow-md"
                            style={{ backgroundColor: 'var(--accent-primary)' }}>
                            <Plus size={15} />
                            Add Goal
                        </button>
                    </div>
                </div>

              
                {aiSuccess && (
                    <div className="mb-4 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-medium"
                        style={{ backgroundColor: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)' }}>
                        <Sparkles size={15} />{aiSuccess}
                    </div>
                )}
                {aiError && (
                    <div className="mb-4 px-4 py-3 rounded-2xl text-sm"
                        style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {aiError}
                    </div>
                )}

       
                {!loading && filtered.length > 0 && <StatsBar goals={filtered} />}

          
                <div className="flex items-center gap-1 mb-5 p-1 rounded-2xl w-fit"
                    style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                    {PERIOD_OPTIONS.map(p => (
                        <button key={p.value} onClick={() => setActivePeriod(p.value)}
                            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                            style={{
                                backgroundColor: activePeriod === p.value ? 'var(--accent-primary)' : 'transparent',
                                color: activePeriod === p.value ? '#fff' : 'var(--text-secondary)',
                            }}>
                            {p.label}
                            <span className="ml-1.5 text-xs opacity-60">{p.desc}</span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col gap-3">
                   
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                            <div className="col-span-2 rounded-2xl p-4 flex items-center gap-4"
                                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                                <div className="skeleton w-16 h-16 rounded-full flex-shrink-0" />
                                <div className="flex flex-col gap-2 flex-1">
                                    <div className="skeleton h-6 w-20" />
                                    <div className="skeleton h-3 w-28" />
                                    <div className="flex gap-2"><div className="skeleton h-4 w-16 rounded-full" /><div className="skeleton h-4 w-14 rounded-full" /></div>
                                </div>
                            </div>
                            {[1, 2].map(i => (
                                <div key={i} className="rounded-2xl p-4"
                                    style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                                    <div className="skeleton w-8 h-8 rounded-xl mb-4" />
                                    <div className="skeleton h-7 w-10 mb-1.5" />
                                    <div className="skeleton h-3 w-20" />
                                </div>
                            ))}
                        </div>
                      
                        {[1, 2, 3].map(i => (
                            <div key={i} className="rounded-2xl p-5 flex items-start gap-5"
                                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                                <div className="skeleton w-14 h-14 rounded-full flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="skeleton h-4 mb-2" style={{ width: `${55 + i * 12}%` }} />
                                    <div className="skeleton h-3 w-2/5 mb-4" />
                                    <div className="skeleton h-2 w-full rounded-full mb-2" />
                                    <div className="flex justify-between"><div className="skeleton h-3 w-20" /><div className="skeleton h-5 w-24 rounded-full" /></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                        <div className="w-16 h-16 rounded-3xl flex items-center justify-center"
                            style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <TrendingUp size={28} style={{ color: 'var(--text-tertiary)' }} />
                        </div>
                        <div>
                            <p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                                No {activePeriod.toLowerCase()} goals yet
                            </p>
                            <p className="text-sm mt-1 max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
                                Add a goal manually, or let AI analyse your coding history and generate personalised goals for you.
                            </p>
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button onClick={() => setShowModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                                style={{ backgroundColor: 'var(--accent-primary)' }}>
                                <Plus size={14} />Add Goal
                            </button>
                            <button onClick={handleAiGenerate} disabled={aiLoading}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                                style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' }}>
                                <Sparkles size={14} />AI Goals
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filtered.map(goal => (
                            <GoalCard key={goal.id} goal={goal} onDelete={handleDelete} onToggle={handleToggle} />
                        ))}
                    </div>
                )}
            </div>

            {showModal && <AddGoalModal onClose={() => setShowModal(false)} onSaved={handleAddGoal} />}
        </div>
    );
};

export default GoalsPage;
