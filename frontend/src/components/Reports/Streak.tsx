import { useEffect, useState } from 'react';
import { Loader2, Coffee } from 'lucide-react';
import { getStreakInfo, toggleStreakReminder } from '../../controllers/reports';

interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  todayComplete: boolean;
  weekStatus: boolean[];
  todayCodingDuration: number;
  streakEmailReminder: boolean;
}

const BREAK_THRESHOLD_SECONDS = 90 * 60;
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Divider = () => (
  <div className="hidden sm:block w-px h-9 flex-shrink-0" style={{ backgroundColor: 'var(--card-border)' }} />
);

const Stat = ({ label, value, unit }: { label: string; value: string; unit?: string }) => (
  <div className="flex flex-col gap-0.5 min-w-fit">
    <span className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
      {label}
    </span>
    <div className="flex items-baseline gap-1">
      <span className="text-[28px] font-medium leading-none" style={{ color: 'var(--text-primary)' }}>
        {value}
      </span>
      {unit && (
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {unit}
        </span>
      )}
    </div>
  </div>
);

const StreakCard = () => {
  const [streakStats, setStreakStats] = useState<StreakStats>({
    currentStreak: 0,
    longestStreak: 0,
    todayComplete: false,
    weekStatus: [],
    todayCodingDuration: 0,
    streakEmailReminder: true,
  });
  const [loading, setLoading] = useState(true);
  const [emailToggleLoading, setEmailToggleLoading] = useState(false);
  const [breakDismissed, setBreakDismissed] = useState(false);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await getStreakInfo();
        setStreakStats(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStreak();
  }, []);

  const handleToggleEmailReminder = async () => {
    setEmailToggleLoading(true);
    try {
      const newValue = !streakStats.streakEmailReminder;
      await toggleStreakReminder(newValue);
      setStreakStats(prev => ({ ...prev, streakEmailReminder: newValue }));
    } catch (error) {
      console.error(error);
    } finally {
      setEmailToggleLoading(false);
    }
  };

  const formatCodingTime = () => {
    const totalMins = Math.floor(streakStats.todayCodingDuration / 60);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const shouldShowBreak =
    streakStats.todayCodingDuration >= BREAK_THRESHOLD_SECONDS && !breakDismissed;

  if (loading) {
    return (
      <div className="flex flex-col gap-3 w-full">
   
        <div className="rounded-2xl px-6 py-4 w-full"
          style={{ backgroundColor: 'var(--card-bg)', border: '0.5px solid var(--card-border)' }}>
          <div className="flex items-center gap-5 flex-wrap">
    
            {[80, 60, 72, 56].map((w, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="skeleton h-2.5 w-10" />
                <div className={`skeleton h-7`} style={{ width: w }} />
              </div>
            ))}
            <div className="hidden sm:block w-px h-9 flex-shrink-0" style={{ backgroundColor: 'var(--card-border)' }} />
     
            <div className="flex items-center gap-2 flex-1 justify-center">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="skeleton w-7 h-7 rounded-full" />
                  <div className="skeleton h-2 w-5" />
                </div>
              ))}
            </div>
            <div className="hidden sm:block w-px h-9 flex-shrink-0" style={{ backgroundColor: 'var(--card-border)' }} />
     
            <div className="skeleton h-7 w-28 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">

      <div
        className="rounded-2xl px-6 py-4 w-full"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '0.5px solid var(--card-border)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="flex items-center gap-5 flex-wrap">
          <Stat label="Current" value={String(streakStats.currentStreak)} unit="days" />

          <Divider />

          <div className="flex items-center gap-2 flex-1 justify-center">
            {WEEK_DAYS.map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    backgroundColor: streakStats.weekStatus[i]
                      ? 'var(--color-success-bg, #d1fae5)'
                      : 'var(--color-muted-bg, #f3f4f6)',
                  }}
                >
                  {streakStats.weekStatus[i] && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <polyline
                        points="2,6 5,9 10,3"
                        stroke="var(--color-success, #10b981)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className="text-[10px] font-medium"
                  style={{
                    color: streakStats.weekStatus[i]
                      ? 'var(--color-success, #10b981)'
                      : 'var(--text-muted)',
                  }}
                >
                  {day}
                </span>
              </div>
            ))}
          </div>

          <Divider />

          <Stat label="Best" value={String(streakStats.longestStreak)} unit="days" />

          <Divider />

          <Stat label="Today" value={formatCodingTime()} />

          <Divider />

    
          <button
            onClick={handleToggleEmailReminder}
            disabled={emailToggleLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-opacity disabled:opacity-50 min-w-fit"
            style={{
              border: '0.5px solid var(--card-border)',
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '12px',
            }}
          >
            {emailToggleLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  flexShrink: 0,
                  backgroundColor: streakStats.streakEmailReminder ? '#10b981' : 'var(--card-border)',
                  display: 'inline-block',
                }}
              />
            )}
            {streakStats.streakEmailReminder ? 'Reminders on' : 'Reminders off'}
          </button>
        </div>
      </div>

      {shouldShowBreak && (
        <div
          className="rounded-2xl px-5 py-4 w-full flex items-center justify-between gap-4 flex-wrap"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '0.5px solid var(--card-border)',
            color: 'var(--text-primary)',
          }}
        >
          <div className="flex items-center gap-3">
            <Coffee size={18} className="text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium m-0" style={{ color: 'var(--text-primary)' }}>
                Time for a break
              </p>
              <p className="text-xs m-0" style={{ color: 'var(--text-muted)' }}>
                {formatCodingTime()} coded today — stretch for 5 min.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBreakDismissed(true)}
              className="px-3 py-1.5 rounded-xl text-xs transition-opacity hover:opacity-70"
              style={{
                border: '0.5px solid var(--card-border)',
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
              }}
            >
              Dismiss
            </button>
            <button
              onClick={() => setBreakDismissed(true)}
              className="px-3 py-1.5 rounded-xl text-xs text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#f59e0b' }}
            >
              Taking a break
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakCard;