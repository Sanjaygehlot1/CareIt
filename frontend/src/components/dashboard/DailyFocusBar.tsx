import React, { useState, useEffect, useCallback } from 'react';
import { GitCommit, Calendar, CheckSquare, Pencil, Sparkles, X, Check, Loader2, Clock } from 'lucide-react';
import { AxiosInstance } from '../../axios/axiosInstance';

interface FocusStats {
  todayCodingMins: number;
  todayCommits: number;
  meetingCount: number;
  meetingHours: number;
  tasksCompleted: number;
  tasksTotal: number;
}


const Skeleton: React.FC = () => (
  <div
    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
    className="p-5 rounded-xl shadow-card border w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
  >
    <div className="flex-1 flex items-center gap-3">
      <div className="skeleton w-1.5 h-10 rounded-full" />
      <div className="flex flex-col gap-2">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-5 w-64 max-w-full" />
      </div>
    </div>
    <div className="flex items-center gap-x-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-2">
          <div className="skeleton w-5 h-5 rounded" />
          <div className="skeleton h-4 w-14" />
        </div>
      ))}
    </div>
  </div>
);

const Stat: React.FC<{ icon: React.ReactNode; value: string; label: string; loading?: boolean }> = ({ icon, value, label, loading }) => (
  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
    {icon}
    {loading
      ? <div className="skeleton h-4 w-16" />
      : <><span className="font-bold" style={{ color: 'var(--text-primary)' }}>{value}</span> {label}</>}
  </div>
);


function fmtMins(mins: number) {
  if (mins === 0) return '0m';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}


const DailyFocusBar: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  const [priority, setPriority] = useState('');
  const [priorityLoading, setPriorityLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);


  const [stats, setStats] = useState<FocusStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 600);
    return () => clearTimeout(t);
  }, []);


  const fetchPriority = useCallback(async () => {
    try {
      const res = await AxiosInstance.get('/analytics/priority');
      const p = res.data?.data?.priority ?? '';
      setPriority(p);
     
      if (!p) {
        await generateAiPriority(false);
      }
    } catch {
      setPriority('');
    } finally {
      setPriorityLoading(false);
    }
  }, []);


  const fetchStats = useCallback(async () => {
    try {
      const res = await AxiosInstance.get('/analytics/daily-focus-stats');
      setStats(res.data?.data ?? null);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPriority();
    fetchStats();
  }, [fetchPriority, fetchStats]);


  const generateAiPriority = async (withLoadingState = true) => {
    if (withLoadingState) setAiLoading(true);
    try {
      const res = await AxiosInstance.post('/analytics/priority/ai');
      const aiPriority = res.data?.data?.priority ?? '';
      if (aiPriority) {
        setPriority(aiPriority);
       
        await AxiosInstance.post('/analytics/priority', { priority: aiPriority });
        if (editing) {
          setEditValue(aiPriority);
          setEditing(false);
        }
      }
    } catch {
   
    } finally {
      if (withLoadingState) setAiLoading(false);
    }
  };

  const openEdit = () => {
    setEditValue(priority);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditValue('');
  };

  const savePriority = async () => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await AxiosInstance.post('/analytics/priority', { priority: trimmed });
      setPriority(trimmed);
      setEditing(false);
    } catch {
  
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); savePriority(); }
    if (e.key === 'Escape') cancelEdit();
  };

  if (!mounted) return <Skeleton />;

 
  const codingDisplay    = stats ? fmtMins(stats.todayCodingMins) : '--';
  const commitsDisplay   = stats ? String(stats.todayCommits) : '--';
  const meetingsDisplay  = stats ? (stats.meetingCount > 0 ? `${stats.meetingHours}h` : '0') : '--';
  const tasksDisplay     = stats ? `${stats.tasksCompleted}/${stats.tasksTotal || '~'}` : '--';
  const hasMeetings      = stats && stats.meetingCount > 0;


  return (
    <div
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      className="p-5 rounded-xl shadow-card border w-full"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">

      
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: 'var(--accent-primary)' }} className="w-1.5 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Today's Priority
              </p>

              {editing ? (
              
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={80}
                    placeholder="What's the one thing that matters today?"
                    className="flex-1 text-sm font-medium rounded-lg px-3 py-2 outline-none min-w-0"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      border: '1.5px solid var(--accent-primary)',
                    }}
                  />
               
                  <button
                    onClick={() => generateAiPriority(true)}
                    disabled={aiLoading}
                    title="AI suggest"
                    className="p-2 rounded-lg transition-all hover:scale-105 flex-shrink-0"
                    style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}
                  >
                    {aiLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  </button>
                  <button
                    onClick={savePriority}
                    disabled={saving || !editValue.trim()}
                    className="p-2 rounded-lg transition-all hover:scale-105 flex-shrink-0"
                    style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}
                  >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 rounded-lg transition-all hover:scale-105 flex-shrink-0"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : priorityLoading ? (
          
                <div className="skeleton h-5 w-72 max-w-full mt-1" />
              ) : (
         
                <div className="flex items-start gap-2 group">
                  <h3
                    className="text-base font-semibold leading-snug cursor-pointer transition-colors break-words flex-1"
                    style={{ color: 'var(--text-primary)' }}
                    onClick={openEdit}
                    title="Click to edit"
                  >
                    {priority || 'Set your priority for today…'}
                  </h3>
             
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-[-2px]">
                    <button
                      onClick={openEdit}
                      title="Edit manually"
                      className="p-1.5 rounded-md hover:scale-105 transition-all"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => generateAiPriority(true)}
                      disabled={aiLoading}
                      title="Regenerate with AI"
                      className="p-1.5 rounded-md hover:scale-105 transition-all"
                      style={{ color: '#8b5cf6' }}
                    >
                      {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        
        <div
          style={{ backgroundColor: 'var(--border-primary)' }}
          className="w-full md:w-px md:h-12 flex-shrink-0"
        />

        
        <div className="flex items-center gap-x-5 gap-y-3 flex-wrap text-sm">
          <Stat
            icon={<Clock size={18} />}
            value={codingDisplay}
            label="Coding"
            loading={statsLoading}
          />
          <Stat
            icon={<GitCommit size={18} />}
            value={commitsDisplay}
            label="Commits"
            loading={statsLoading}
          />
          {hasMeetings && (
            <Stat
              icon={<Calendar size={18} />}
              value={meetingsDisplay}
              label={`Meeting${stats!.meetingCount !== 1 ? 's' : ''}`}
              loading={statsLoading}
            />
          )}
          <Stat
            icon={<CheckSquare size={18} />}
            value={tasksDisplay}
            label="Tasks"
            loading={statsLoading}
            
          />
        </div>
      </div>
    </div>
  );
};

export default DailyFocusBar;