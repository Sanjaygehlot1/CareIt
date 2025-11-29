import React, { useEffect, useState, useMemo } from 'react';
import { Flame, ChevronLeft, ChevronRight, Info, Loader2 } from 'lucide-react';
import {
  format,
  startOfMonth,
  startOfWeek,
  isSameMonth,
  addMonths,
  subMonths,
  addDays,
  subDays,
} from 'date-fns';
import { getStreakInfo } from '../../controllers/reports';

interface StreakDay {
  hasStreak: boolean;
  date: string;
}

interface StreakResponse {
  current_streak: number;
  longest_streak: number;
  data: StreakDay[];
}

const FocusStreakWidget: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [streakData, setStreakData] = useState<StreakDay[]>([]);
  const [streakStats, setStreakStats] = useState({ longest: 0, current: 0 });
  
  const [loading, setLoading] = useState(false);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarDays = Array.from({ length: 42 }, (_, i) => addDays(calendarStart, i));

  useEffect(() => {
    const fetchStreak = async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      
      const cacheKey = `streak_${year}_${month}`;
      const cachedString = localStorage.getItem(cacheKey);
      
      let shouldFetch = true;

      if (cachedString) {
        const cached: StreakResponse = JSON.parse(cachedString);
        setStreakData(cached.data || []);
        setStreakStats({ 
          current: cached.current_streak || 0, 
          longest: cached.longest_streak || 0 
        });

    

      }

      if (!shouldFetch) return;

      setLoading(true);

      try {
        const response: any = await getStreakInfo({ year, month });
        const serverData = response?.data; 

        if (!serverData) return;

        
        if (JSON.stringify(serverData) !== cachedString) {
       
          
          setStreakData(serverData.data || []);
          setStreakStats({ 
            current: serverData.current_streak || 0, 
            longest: serverData.longest_streak || 0 
          });
          
          localStorage.setItem(cacheKey, JSON.stringify(serverData));
        }
      } catch (error) {
        console.error("Failed to fetch streaks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, [currentDate]);

  const streakSet = useMemo(() => {
    const set = new Set<string>();
    streakData.forEach(d => {
      if (d.hasStreak) {
        const dateStr = d.date.split('T')[0];
        set.add(dateStr);
      }
    });
    return set;
  }, [streakData]);

  const hasStreak = (date: Date) => streakSet.has(format(date, 'yyyy-MM-dd'));

  return (
    <div
      className="rounded-3xl p-6 shadow-sm border relative font-sans w-full transition-all duration-300"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        maxWidth: '800px',
        margin: '0 auto'
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Daily Streak</h2>
          
          <div className="group relative flex items-center">
            <Info size={18} className="text-gray-400 cursor-help hover:text-orange-500 transition-colors" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
              <p className="font-semibold mb-1 text-orange-300">Streak Rules:</p>
              <ul className="list-disc pl-3 space-y-1 text-gray-300">
                <li>Coding Duration &gt; 30 mins</li>
                <li><span className="text-gray-500 text-[10px] uppercase font-bold mr-1">OR</span> Commits &gt; 0</li>
              </ul>
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-[6px] border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-stretch">

        <div
          className="flex-1 rounded-2xl flex flex-col items-center justify-center py-8 px-6 relative overflow-hidden min-h-[250px]"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center shadow-sm">
              <Flame size={32} className="text-orange-500 fill-orange-500 animate-pulse" />
            </div>
            <span className="text-6xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {streakStats.current}
            </span>
          </div>

          <p className="font-medium mb-8 text-center" style={{ color: 'var(--text-secondary)' }}>
            Current Streak
          </p>

          <div className="flex items-center gap-3 px-4 py-2 bg-white/50 rounded-xl border border-gray-200/50 backdrop-blur-sm mt-auto shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Best</span>
            <div className="w-px h-3 bg-gray-300"></div>
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{streakStats.longest} Days</span>
          </div>
        </div>

        <div className="flex-1 pt-2">
          <div className="flex justify-between items-center mb-6 px-1">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors">
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                {format(currentDate, 'MMMM yyyy')}
              </span>
              {loading && <Loader2 size={14} className="animate-spin text-orange-500" />}
            </div>

            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-3 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} className="text-xs font-bold text-gray-400 h-8 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-2">
            {calendarDays.map((day, idx) => {
              const inMonth = isSameMonth(day, currentDate);
              const isStreakDay = hasStreak(day);

              const isPrevStreak = hasStreak(subDays(day, 1));
              const isNextStreak = hasStreak(addDays(day, 1));

              const isStart = isStreakDay && !isPrevStreak;
              const isEnd = isStreakDay && !isNextStreak;
              const isSingle = isStreakDay && !isPrevStreak && !isNextStreak;

              return (
                <div key={idx} className="relative h-9 flex items-center justify-center">

                  {isStreakDay && inMonth && !isSingle && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-7 bg-red-100 z-0"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.15)', 
                        left: isStart ? '50%' : '0',
                        right: isEnd ? '50%' : '0',
                        borderRadius: isStart ? '8px 0 0 8px' : isEnd ? '0 8px 8px 0' : '0'
                      }}
                    />
                  )}

                  <span
                    className={`relative z-10 text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300
                      ${!inMonth ? 'text-gray-300 opacity-30' : ''}
                      ${isStreakDay && inMonth ? 'scale-110 shadow-sm' : 'hover:bg-gray-50'} 
                    `}
                    style={{
                      color: !inMonth ? 'var(--text-tertiary)' : isStreakDay ? '#FFFFFF' : 'var(--text-primary)',
                      backgroundColor: isStreakDay && inMonth ? '#EF4444' : 'transparent'
                    }}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusStreakWidget;