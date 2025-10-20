import { useTimer } from './TimerHook'
import { Pause, Play,TimerReset} from 'lucide-react'

function Timer() {

    const { isFocused, resetTimer, startTimer, stopTimer, totalTime } = useTimer()

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    return (
       <button
  style={{
    backgroundColor: 'var(--card-bg)',
    borderColor: 'var(--card-border)',
    color: 'var(--text-primary)',
  }}
  className="flex items-center border px-3 py-2 rounded-lg text-sm font-semibold
             hover:opacity-90 transition-all duration-200 ease-in-out"
>
  <TimerReset
    onClick={resetTimer}
    size={18}
    className="mr-2 cursor-pointer hover:scale-110 transition-transform duration-200 ease-in-out"
  />
  {isFocused ? (
    <Pause
      onClick={stopTimer}
      size={18}
      className="mr-2 cursor-pointer hover:scale-110 transition-transform duration-200 ease-in-out"
    />
  ) : (
    <Play
      onClick={startTimer}
      size={18}
      className="mr-2 cursor-pointer hover:scale-110 transition-transform duration-100 ease-in-out"
    />
  )}
  {formatTime(totalTime)}
</button>

    )
}

export default Timer
