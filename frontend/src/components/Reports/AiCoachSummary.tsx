import { useEffect, useState, useCallback } from 'react';
import { AxiosInstance } from '../../axios/axiosInstance';
import { Sparkles, BrainCircuit, RefreshCw } from 'lucide-react';
import InfoTooltip from '../ui/InfoTooltip';

const SESSION_CACHE_KEY = 'careit_ai_coach_summary';

export default function AiCoachSummary() {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSummary = useCallback(async (forced = false) => {
    
    if (isRefreshing) return;

    if (!forced) {
      const cached = sessionStorage.getItem(SESSION_CACHE_KEY);
      if (cached) {
        setSummary(cached);
        setLoading(false);
        return;
      }
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const res = await AxiosInstance.get('/reports/coach-summary');
      const newSummary = res.data.data.summary;
      
      if (newSummary) {
        setSummary(newSummary);
        sessionStorage.setItem(SESSION_CACHE_KEY, newSummary);
      }
    } catch (err) {
      console.error("Coach Summary failed:", err);
      if (!summary) setSummary("Unable to reach the AI Coach right now. Please check your connection and try again.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [isRefreshing, summary]); 

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="p-5 rounded-2xl border relative overflow-hidden group transition-all duration-500 hover:shadow-xl hover:shadow-orange-500/10"
         style={{ 
            backgroundColor: 'var(--card-bg)', 
            borderColor: 'var(--card-border)',
            backgroundImage: 'radial-gradient(circle at top right, rgba(249, 115, 22, 0.05), transparent 70%)' 
         }}>
      
     
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-orange-500/10 transition-colors duration-700" />

      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 shrink-0">
          <BrainCircuit size={22} className={loading ? "animate-pulse" : ""} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-orange-500 flex items-center gap-1.5">
                CareIt AI Coach Insight
                <InfoTooltip
                  title="AI Coach"
                  items={[
                    { color: '#f97316', label: 'Personalized Insight', desc: 'generated from your recent activity data' },
                    { color: '#8b5cf6', label: 'Analyzes Patterns', desc: 'coding time, streaks, goals, and focus sessions' },
                    { color: '#10b981', label: 'Refresh', desc: 'click the refresh icon to generate a fresh insight' },
                    { color: '#6b7280', label: 'Session Cache', desc: 'auto-refreshes on your next visit' },
                  ]}
                />
              </h3>
              <Sparkles size={14} className="text-orange-400" />
            </div>

            <button
              onClick={() => fetchSummary(true)}
              disabled={isRefreshing}
              className={`p-2 rounded-xl transition-all hover:bg-orange-500/10 text-orange-400 hover:text-orange-500 flex items-center justify-center hover:cursor-pointer ${isRefreshing ? 'opacity-50' : 'hover:scale-110 active:scale-90'}`}
              title="Generate fresh AI insight"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>

          {(loading && !isRefreshing) ? (
            <div className="space-y-2 mt-2">
              <div className="h-4 w-full bg-black/5 dark:bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-black/5 dark:bg-white/5 rounded animate-pulse" />
            </div>
          ) : (
            <p className={`text-lg font-medium leading-relaxed transition-opacity duration-300 ${isRefreshing ? 'opacity-40' : 'opacity-100'}`} style={{ color: 'var(--text-primary)' }}>
              {summary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
