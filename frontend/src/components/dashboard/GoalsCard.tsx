import { useState, useEffect, useCallback } from 'react';
import {
    Target, Sparkles, Plus, Trash2, Check, Loader2,
    Code2, Zap, Timer, Trophy, PenLine, ChevronDown, X
} from 'lucide-react';
import {
    getGoals, createGoal, updateGoal, deleteGoal, generateAiGoals,
    type Goal, type CreateGoalPayload
} from '../../controllers/goals';



const GOAL_TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
    CODING_TIME: { label: 'Coding Time', icon: <Code2 size={14} />, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    STREAK:      { label: 'Streak',      icon: <Zap size={14} />,   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    FOCUS_TIME:  { label: 'Focus Time',  icon: <Timer size={14} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    COMMITS:     { label: 'Commits',     icon: <Trophy size={14} />,color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    CUSTOM:      { label: 'Custom',      icon: <PenLine size={14} />,color: '#6b7280',bg: 'rgba(107,114,128,0.1)' },
};

const PERIOD_OPTIONS: { value: Goal['period']; label: string }[] = [
    { value: 'DAILY',   label: 'Daily' },
    { value: 'WEEKLY',  label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
];

const TYPE_OPTIONS: { value: Goal['type']; label: string; unitHint: string; targetHint: string }[] = [
    { value: 'CODING_TIME', label: 'Coding Time',  unitHint: 'minutes', targetHint: 'e.g. 120' },
    { value: 'STREAK',      label: 'Streak',       unitHint: 'days',    targetHint: 'e.g. 7' },
    { value: 'FOCUS_TIME',  label: 'Focus Time',   unitHint: 'minutes', targetHint: 'e.g. 60' },
    { value: 'COMMITS',     label: 'Commits',      unitHint: 'commits', targetHint: 'e.g. 10' },
    { value: 'CUSTOM',      label: 'Custom',       unitHint: '',        targetHint: 'e.g. 5' },
];



function ProgressRing({ progress, size = 52, stroke = 5, color }: {
    progress: number; size?: number; stroke?: number; color: string;
}) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = Math.min(progress / 100, 1) * circ;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="var(--bg-tertiary)" strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.5s ease' }} />
        </svg>
    );
}

function GoalCard({ goal, onDelete, onToggle }: {
    goal: Goal;
    onDelete: (id: number) => void;
    onToggle: (id: number, completed: boolean) => void;
}) {
    const meta = GOAL_TYPE_META[goal.type] ?? GOAL_TYPE_META.CUSTOM;
    const progressPct = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
    const [deleting, setDeleting] = useState(false);
    const [toggling, setToggling] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        await onDelete(goal.id);
    };

    const handleToggle = async () => {
        setToggling(true);
        await onToggle(goal.id, !goal.completed);
        setToggling(false);
    };

    return (
        <div
            className="rounded-2xl p-4 flex items-start gap-4 transition-all group"
            style={{
                backgroundColor: 'var(--card-bg)',
                border: `1px solid ${goal.completed ? 'rgba(16,185,129,0.3)' : 'var(--card-border)'}`,
                opacity: deleting ? 0.5 : 1,
            }}
        >
          
            <div className="relative flex-shrink-0 cursor-pointer" onClick={handleToggle}>
                <ProgressRing progress={progressPct} color={goal.completed ? '#10b981' : meta.color} />
                <div className="absolute inset-0 flex items-center justify-center">
                    {toggling ? (
                        <Loader2 size={14} className="animate-spin" style={{ color: meta.color }} />
                    ) : goal.completed ? (
                        <Check size={16} color="#10b981" strokeWidth={3} />
                    ) : (
                        <span className="text-[11px] font-bold" style={{ color: meta.color }}>
                            {Math.round(progressPct)}%
                        </span>
                    )}
                </div>
            </div>

          
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span
                                className={`text-sm font-semibold leading-tight ${goal.completed ? 'line-through opacity-60' : ''}`}
                                style={{ color: 'var(--text-primary)' }}
                            >
                                {goal.title}
                            </span>
                            {goal.isAiGenerated && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                                    style={{ backgroundColor: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>
                                    <Sparkles size={9} />AI
                                </span>
                            )}
                        </div>
                        {goal.description && (
                            <p className="text-xs mt-0.5 opacity-70 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                                {goal.description}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 flex-shrink-0"
                    >
                        <Trash2 size={14} className="text-red-400" />
                    </button>
                </div>

                <div className="mt-2.5">
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%`, backgroundColor: goal.completed ? '#10b981' : meta.color }}
                        />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                            {goal.currentValue.toFixed(goal.type === 'CUSTOM' ? 0 : 0)} / {goal.targetValue} {goal.unit}
                        </span>
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px]"
                            style={{ backgroundColor: meta.bg, color: meta.color }}>
                            {meta.icon}
                            <span className="font-medium">{meta.label}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AddGoalModal({ onClose, onSaved }: { onClose: () => void; onSaved: (g: Goal) => void }) {
    const [form, setForm] = useState<CreateGoalPayload>({
        title: '',
        description: '',
        type: 'CODING_TIME',
        period: 'WEEKLY',
        targetValue: 120,
        unit: 'minutes',
    });
    const [saving, setSaving] = useState(false);

    const selectedType = TYPE_OPTIONS.find(t => t.value === form.type)!;

    const handleTypeChange = (type: Goal['type']) => {
        const meta = TYPE_OPTIONS.find(t => t.value === type)!;
        setForm(prev => ({ ...prev, type, unit: meta.unitHint }));
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
                    <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
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
                        <input
                            required
                            value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            placeholder="e.g. Code for 2 hours daily"
                            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: '1px solid var(--input-border)',
                                color: 'var(--text-primary)',
                            }}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Description (optional)</label>
                        <input
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            placeholder="Why this goal matters to you…"
                            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: '1px solid var(--input-border)',
                                color: 'var(--text-primary)',
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Type</label>
                            <div className="relative">
                                <select
                                    value={form.type}
                                    onChange={e => handleTypeChange(e.target.value as Goal['type'])}
                                    className="w-full px-3 py-2 rounded-xl text-sm outline-none appearance-none pr-8"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        border: '1px solid var(--input-border)',
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-secondary)' }} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Period</label>
                            <div className="relative">
                                <select
                                    value={form.period}
                                    onChange={e => setForm(p => ({ ...p, period: e.target.value as Goal['period'] }))}
                                    className="w-full px-3 py-2 rounded-xl text-sm outline-none appearance-none pr-8"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        border: '1px solid var(--input-border)',
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    {PERIOD_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-secondary)' }} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Target *</label>
                            <input
                                required
                                type="number"
                                min={1}
                                value={form.targetValue}
                                onChange={e => setForm(p => ({ ...p, targetValue: Number(e.target.value) }))}
                                placeholder={selectedType.targetHint}
                                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Unit</label>
                            <input
                                value={form.unit}
                                onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                                placeholder={selectedType.unitHint || 'unit'}
                                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving || !form.title.trim()}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:opacity-90 flex items-center justify-center gap-2"
                        style={{ backgroundColor: 'var(--accent-primary)' }}
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        {saving ? 'Creating…' : 'Create Goal'}
                    </button>
                </form>
            </div>
        </div>
    );
}


type Period = 'WEEKLY' | 'MONTHLY' | 'DAILY';

const GoalsCard = () => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [activePeriod, setActivePeriod] = useState<Period>('WEEKLY');
    const [aiError, setAiError] = useState('');

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
        const result = await generateAiGoals(activePeriod);
        setAiLoading(false);
        if (result?.goals) {
            setGoals(prev => [...result.goals, ...prev]);
        } else {
            setAiError('AI generation failed. Make sure your GEMINI_API_KEY is set in the backend.');
        }
    };

    const completed = goals.filter(g => g.completed).length;
    const total = goals.length;
    const overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <>
            <div
                className="rounded-2xl p-5 shadow-sm w-full"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--text-primary)',
                }}
            >
               
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(249,115,22,0.1)' }}>
                            <Target size={18} style={{ color: 'var(--accent-primary)' }} />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>Goals</h2>
                            {total > 0 && (
                                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                    {completed}/{total} completed · {overallProgress}%
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        
                        <div className="flex rounded-xl overflow-hidden text-[11px] font-medium"
                            style={{ border: '1px solid var(--card-border)' }}>
                            {PERIOD_OPTIONS.map(p => (
                                <button
                                    key={p.value}
                                    onClick={() => setActivePeriod(p.value)}
                                    className="px-2.5 py-1.5 transition-colors"
                                    style={{
                                        backgroundColor: activePeriod === p.value ? 'var(--accent-primary)' : 'transparent',
                                        color: activePeriod === p.value ? '#fff' : 'var(--text-secondary)',
                                    }}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                      
                        <button
                            onClick={handleAiGenerate}
                            disabled={aiLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all disabled:opacity-60 hover:opacity-90"
                            style={{
                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                color: 'white',
                            }}
                            title="Let AI set goals based on your coding data"
                        >
                            {aiLoading
                                ? <Loader2 size={12} className="animate-spin" />
                                : <Sparkles size={12} />}
                            {aiLoading ? 'Thinking…' : 'AI Goals'}
                        </button>

                    
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all hover:opacity-90"
                            style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
                        >
                            <Plus size={12} />
                            Add
                        </button>
                    </div>
                </div>

            
                {total > 0 && (
                    <div className="mb-4">
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <div
                                className="h-1.5 rounded-full transition-all duration-700"
                                style={{
                                    width: `${overallProgress}%`,
                                    background: 'linear-gradient(90deg, var(--accent-primary), #10b981)',
                                }}
                            />
                        </div>
                    </div>
                )}

                {aiError && (
                    <div className="mb-3 p-3 rounded-xl text-xs" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {aiError}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
                    </div>
                ) : goals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <Target size={22} style={{ color: 'var(--text-tertiary)' }} />
                        </div>
                        <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No {activePeriod.toLowerCase()} goals yet</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                Add one manually or let AI generate goals based on your data.
                            </p>
                        </div>
                        <div className="flex gap-2 mt-1">
                            <button onClick={() => setShowModal(true)}
                                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-90"
                                style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                                <Plus size={12} className="inline mr-1" />Add Goal
                            </button>
                            <button onClick={handleAiGenerate} disabled={aiLoading}
                                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-90 disabled:opacity-60"
                                style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', color: 'white' }}>
                                <Sparkles size={12} className="inline mr-1" />AI Goals
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {goals.map(goal => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                onDelete={handleDelete}
                                onToggle={handleToggle}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showModal && <AddGoalModal onClose={() => setShowModal(false)} onSaved={handleAddGoal} />}
        </>
    );
};

export default GoalsCard;
