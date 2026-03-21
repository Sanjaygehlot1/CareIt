import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTimer } from './TimerHook'
import { Pause, Play, RotateCcw, Maximize2, Minimize2, BrainCircuit } from 'lucide-react'
import { getThemeContext } from '../../context/ThemeContext';

function Timer() {
    const { isFocused, resetTimer, startTimer, stopTimer, totalTime } = useTimer()
    const { theme } = getThemeContext()
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        if (isFullScreen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; }
    }, [isFullScreen]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <>
           
            <div
                style={{
                    backgroundColor: isFocused ? 'rgba(249,115,22,0.1)' : 'var(--card-bg)',
                    borderColor: isFocused ? 'rgba(249,115,22,0.4)' : 'var(--card-border)',
                    color: isFocused ? '#f97316' : 'var(--text-primary)',
                    boxShadow: isFocused ? '0 0 15px rgba(249,115,22,0.15)' : 'none'
                }}
                className={`flex items-center border px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-300`}
            >
                <div className="flex items-center gap-2">
                    {isFocused ? (
                        <Pause onClick={stopTimer} size={15} className="cursor-pointer hover:scale-110 transition-transform" />
                    ) : (
                        <Play onClick={startTimer} size={15} className="cursor-pointer hover:scale-110 transition-transform" />
                    )}
                    
                    <span className="font-mono bg-transparent w-[45px] text-center">{formatTime(totalTime)}</span>
                    
                    <div className="w-px h-4 bg-current opacity-20 mx-1" />
                    
                    <RotateCcw onClick={resetTimer} size={14} className="cursor-pointer hover:scale-110 opacity-70 hover:opacity-100 transition-all" />
                    <button onClick={() => setIsFullScreen(true)} className="ml-0.5" title="Deep Work Mode">
                        <Maximize2 size={14} className="cursor-pointer hover:scale-110 opacity-70 hover:opacity-100 transition-all" />
                    </button>
                </div>
            </div>

            {isFullScreen && createPortal(
                <div data-theme={theme} className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300"
                    style={{ 
                        backgroundColor: 'var(--bg-primary)',
                        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(249,115,22,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.05) 0%, transparent 40%)'
                    }}
                >
                    <button 
                        onClick={() => setIsFullScreen(false)}
                        className="absolute top-8 right-8 p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <Minimize2 size={24} />
                    </button>

                    <div className="flex flex-col items-center gap-8 max-w-md w-full">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                            style={{ backgroundColor: isFocused ? 'rgba(249,115,22,0.1)' : 'var(--bg-tertiary)', color: isFocused ? '#f97316' : 'var(--text-secondary)' }}>
                            <BrainCircuit size={18} className={isFocused ? "animate-pulse" : ""} />
                            <span className="text-sm font-semibold uppercase tracking-widest">
                                {isFocused ? "Deep Work Active" : "Ready to focus?"}
                            </span>
                        </div>

                        {/* Interactive Circle Timer */}
                        <div className="relative w-72 h-72 flex items-center justify-center rounded-full"
                            style={{
                                background: isFocused 
                                    ? 'conic-gradient(#f97316 0%, transparent 100%)' 
                                    : 'var(--bg-tertiary)',
                                animation: isFocused ? 'spin 10s linear infinite' : 'none',
                                boxShadow: isFocused ? '0 0 50px rgba(249,115,22,0.2)' : 'none',
                                border: '1px solid var(--card-border)'
                             }}
                        >
                            
                            <div className="absolute inset-1.5 rounded-full flex flex-col items-center justify-center"
                                style={{ 
                                    backgroundColor: 'var(--bg-primary)',
                                    animation: isFocused ? 'spin 10s linear infinite reverse' : 'none'
                                }}>
                                <span className="text-6xl font-black font-mono tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                    {formatTime(totalTime)}
                                </span>
                                <span className="text-sm mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                                    Time Focused
                                </span>
                            </div>
                        </div>

                        
                        <div className="flex items-center gap-6 mt-4">
                            <button 
                                onClick={resetTimer}
                                className="p-4 rounded-full transition-all hover:scale-105"
                                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                            >
                                <RotateCcw size={24} />
                            </button>
                            
                            <button 
                                onClick={isFocused ? stopTimer : startTimer}
                                className="w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-105 hover:shadow-lg"
                                style={{ 
                                    background: isFocused ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, #f97316, #ea580c)',
                                    color: isFocused ? 'var(--text-primary)' : 'white'
                                }}
                            >
                                {isFocused ? <Pause size={32} /> : <Play size={32} className="ml-2" />}
                            </button>
                        </div>

                       
                        <p className="text-center mt-8 max-w-sm text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {isFocused 
                                ? "Close your other tabs. Put your phone away. You are in the zone. Every minute counts." 
                                : "Start the timer to begin tracking your focus session. Uninterrupted deep work is where the magic happens."}
                        </p>
                    </div>
                    
                    <style dangerouslySetInnerHTML={{__html: `
                        @keyframes spin { 100% { transform: rotate(360deg); } }
                    `}} />
                </div>,
                document.body
            )}
        </>
    )
}

export default Timer;
