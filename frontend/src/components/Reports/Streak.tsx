import { useEffect, useState } from 'react';
import { Loader2, Zap, ChevronRight, Check } from 'lucide-react';
import { getStreakInfo } from '../../controllers/reports';
interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  todayComplete: boolean;
  weekStatus: []
}

const StreakCard = () => {
  const [streakStats, setStreakStats] = useState<StreakStats>({
    currentStreak: 0,
    longestStreak: 0,
    todayComplete: false,
    weekStatus: []
  });
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await getStreakInfo();
        console.log(res)
        setStreakStats(res.data);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl p-8 shadow-sm border flex items-center justify-center min-h-[280px]"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <div
      className="rounded-3xl p-6 bg-white shadow-sm"
      style={{
        maxWidth: '380px',
        border: '1px solid #e5e7eb',
        backgroundColor : 'var(--card-bg)' , borderColor : 'var(--card-border)', color : 'var(--text-primary)'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={22} className="text-orange-500 fill-orange-500" />
          <h2 style={{ color: 'var(--accent-primary)' }} className="text-lg font-semibold text-gray-900">
            Streak
          </h2>
        </div>

        <button className="flex items-center gap-0.5 text-sm text-gray-500 hover:text-gray-700">
          View Details
          <ChevronRight size={18} strokeWidth={2} />
        </button>
      </div>

      <div className="mb-5">
        <div  className="flex items-baseline gap-1.5">
          <span style={{ color: 'var(--accent-primary)' }} className="text-[42px] font-bold leading-none text-gray-900">
            {streakStats.currentStreak}
          </span>
          <span className="text-base text-gray-500 font-normal">days</span>
        </div>
      </div>

      <div className="flex justify-between mb-6">
        {weekDays.map((day, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div style={{ color: 'var(--accent-primary)' }} className={`w-10 h-10 rounded-full flex items-center justify-center ${streakStats.weekStatus[index]
              ? 'bg-emerald-500'
              : 'bg-gray-200'
              }`}>
              {streakStats.weekStatus[index] && (
                <Check size={20} className="text-white" strokeWidth={3} />
              )}
            </div>
            <span style={{ color: 'var(--accent-primary)' }} className={`text-sm font-semibold ${streakStats.weekStatus[index]
              ? 'text-emerald-600'
              : 'text-gray-400'
              }`}>
              {day}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div  className="text-sm text-gray-500 mb-1 font-normal">
            Longest Streak
          </div>
          <div style={{ color: 'var(--accent-primary)' }} className="text-gray-900">
            <span className="text-[28px] font-bold leading-none">
              {streakStats.longestStreak}
            </span>
            <span className="text-base font-normal text-gray-500 ml-1">
              days
            </span>
          </div>
        </div>


      </div>
    </div>
  );
};

export default StreakCard;