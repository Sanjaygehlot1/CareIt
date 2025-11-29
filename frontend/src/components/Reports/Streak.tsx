import React, { useState } from 'react';
import { Flame, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  startOfWeek, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  isWithinInterval,
  subDays,
  addDays
} from 'date-fns';

const FocusStreakWidget: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentStreak = 1475;
  const previousStreak = 120;
  
  const streakEnd = new Date();
  const streakStart = subDays(streakEnd, 5); 

  
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  

  const calendarDays = Array.from({ length: 42 }, (_, i) => addDays(calendarStart, i));

  const isStreakDate = (date: Date) => {
    return isWithinInterval(date, { start: streakStart, end: streakEnd });
  };

  const isStreakStart = (date: Date) => isSameDay(date, streakStart);
  const isStreakEnd = (date: Date) => isSameDay(date, streakEnd);

  return (
    <div 
      className="rounded-3xl p-6 shadow-sm border relative font-sans w-full"
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
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max p-3 bg-gray-800 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
              <p className="font-semibold mb-1 text-orange-300">Streak Criteria (Daily):</p>
              <ul className="list-disc pl-3 space-y-1 text-gray-300">
                <li>Coding Duration &gt; 30 mins</li>
                <li><span className="text-gray-500 text-[10px] uppercase font-bold mr-1">OR</span> Commits &gt; 0</li>
              </ul>
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-[6px] border-t-gray-800"></div>
            </div>
          </div>
        </div>

       
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        
        <div 
          className="flex-1 rounded-2xl flex flex-col items-center justify-center py-8 px-6 relative overflow-hidden min-h-[250px]"
          style={{ backgroundColor: 'var(--bg-tertiary)' }} 
        >
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shadow-sm">
              <Flame size={28} className="text-orange-500 fill-orange-500" />
            </div>
            <span className="text-5xl sm:text-6xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {currentStreak}
            </span>
          </div>
          
          <p className="font-medium mb-8 text-center" style={{ color: 'var(--text-secondary)' }}>
            Days of studying
          </p>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-lg border border-gray-200/50 backdrop-blur-sm mt-auto">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Previous Best</span>
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{previousStreak} Days</span>
          </div>
        </div>

        <div className="flex-1 pt-2">
          <div className="flex justify-between items-center mb-4 px-2">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} className="text-xs font-medium text-gray-400 h-8 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1 sm:gap-y-2">
            {calendarDays.map((day, idx) => {
              const inMonth = isSameMonth(day, currentDate);
              const inStreak = isStreakDate(day);
              const isStart = isStreakStart(day);
              const isEnd = isStreakEnd(day);

              return (
                <div key={idx} className="relative h-8 sm:h-9 flex items-center justify-center">
                  
                  {inStreak && inMonth && (
                    <div 
                      className={`absolute top-1 bottom-1 bg-red-100 z-0
                        ${isStart ? 'left-1 rounded-l-full' : 'left-0'}
                        ${isEnd ? 'right-1 rounded-r-full' : 'right-0'}
                      `}
                      style={{ 
                        left: isStart ? '15%' : '0', 
                        right: isEnd ? '15%' : '0',
                        backgroundColor: 'rgba(254, 202, 202, 0.5)' 
                      }}
                    />
                  )}

                  <span 
                    className={`relative z-10 text-sm font-medium w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all
                      ${!inMonth ? 'text-gray-300 opacity-50' : ''}
                      ${inStreak && inMonth ? 'text-blue-600 font-bold' : ''}
                      ${!inStreak && inMonth ? 'text-gray-600' : ''}
                    `}
                    style={{ 
                      color: !inMonth ? 'var(--text-tertiary)' : inStreak ? '#DC2626' : 'var(--text-primary)'
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