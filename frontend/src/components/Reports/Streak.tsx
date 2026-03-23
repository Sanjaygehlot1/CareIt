import { useEffect, useState } from 'react';
import { Loader2, Coffee, GitCommit, Check } from 'lucide-react';
import { getStreakInfo, toggleStreakReminder } from '../../controllers/reports';
import InfoTooltip from '../ui/InfoTooltip';

interface StreakProgress {
  todayCodingDuration: number;
  todayCommits: number;
  streakThreshold: number;
  hasStreak: boolean;
}

interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  todayComplete: boolean;
  weekStatus: boolean[];
  streakProgress: StreakProgress;
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

function fmtSec(seconds: number) {
  if (seconds <= 0) return '0m';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const StreakProgressTracker = ({ progress }: { progress: StreakProgress }) => {
  const pct = Math.min(100, Math.round((progress.todayCodingDuration / progress.streakThreshold) * 100));
  const remaining = Math.max(0, progress.streakThreshold - progress.todayCodingDuration);
  const completed = progress.hasStreak;

  return (
    <div className="flex flex-col gap-1.5 min-w-[140px]">
      <span className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        Today's Progress
      </span>
      <div className="flex items-center gap-2.5">
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              backgroundColor: completed ? '#10b981' : '#f97316',
            }}
          />
        </div>
        <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color: completed ? '#10b981' : '#f97316' }}>
          {pct}%
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {completed ? (
            <span className="flex items-center gap-1 text-emerald-500 font-medium">
              <Check size={11} /> Streak secured
            </span>
          ) : (
            <>{fmtSec(remaining)} left</>
          )}
        </span>
        <span className="flex items-center gap-1 text-[11px]" style={{ color: progress.todayCommits > 0 ? '#10b981' : 'var(--text-muted)' }}>
          <GitCommit size={11} />
          {progress.todayCommits > 0 ? `${progress.todayCommits} commit${progress.todayCommits !== 1 ? 's' : ''}` : 'No commits'}
        </span>
      </div>
    </div>
  );
};

const StreakCard = () => {
  const [streakStats, setStreakStats] = useState<StreakStats>({
    currentStreak: 0,
    longestStreak: 0,
    todayComplete: false,
    weekStatus: [],
    streakProgress: { todayCodingDuration: 0, todayCommits: 0, streakThreshold: 1800, hasStreak: false },
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

  const shouldShowBreak =
    streakStats.streakProgress.todayCodingDuration >= BREAK_THRESHOLD_SECONDS && !breakDismissed;

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
          <div className="flex items-center gap-1.5">
            <Stat label="Current" value={String(streakStats.currentStreak)} unit="days" />
            <InfoTooltip
              title="Streak Rules"
              items={[
                { color: '#f97316', label: '30 Minutes', desc: 'code for at least 30 min to secure your streak' },
                { color: '#10b981', label: 'Commits', desc: 'tracked via GitHub App but don\'t count toward the streak' },
                { color: '#f87171', label: 'Resets', desc: 'missing a day resets your current streak to 0' },
                { color: '#fbbf24', label: 'Break Reminder', desc: 'appears after 90 min of continuous coding' },
              ]}
            />
          </div>

          <Divider />

           <div className="flex items-center gap-2 flex-1 justify-center">
            {WEEK_DAYS.map((day, i) => {
              const todayIndex = (new Date().getDay() + 6) % 7;
              const hasStreak = streakStats.weekStatus[i];
              const isToday = i === todayIndex;
              const isPast = i < todayIndex;
              const isMissed = isPast && !hasStreak;

              const bgColor = hasStreak
                ? 'var(--color-success-bg, #d1fae5)'
                : isMissed
                  ? '#fee2e2'
                  : 'var(--color-muted-bg, #f3f4f6)';

              const textColor = hasStreak
                ? 'var(--color-success, #10b981)'
                : isMissed
                  ? '#ef4444'
                  : 'var(--text-muted)';

              return (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors relative"
                    style={{ backgroundColor: bgColor }}
                  >

                    {isToday && !hasStreak && (
                      <span
                        className="absolute inset-0 rounded-full animate-pulse"
                        style={{ border: '1.5px solid var(--accent-primary)', opacity: 0.5 }}
                      />
                    )}
                    {hasStreak && (
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
                    {isMissed && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2,2 L10,10 M10,2 L2,10"
                          stroke="#ef4444"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: isToday && !hasStreak ? 'var(--accent-primary)' : textColor }}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>

          <Divider />

          <Stat label="Best" value={String(streakStats.longestStreak)} unit="days" />

          <Divider />

          <StreakProgressTracker progress={streakStats.streakProgress} />

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
          <InfoTooltip
            title="Streak Reminders"
            items={[
              { color: '#10b981', label: 'Daily Email', desc: 'sends a reminder if you haven\'t hit 30 min by evening' },
              { color: '#6b7280', label: 'Toggle', desc: 'click the button to turn reminders on or off' },
            ]}
          />
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
                {fmtSec(streakStats.streakProgress.todayCodingDuration)} coded today — stretch for 5 min.
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