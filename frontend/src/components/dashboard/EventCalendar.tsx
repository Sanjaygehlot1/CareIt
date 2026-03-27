import React, { useEffect, useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import { Tooltip } from 'react-tooltip';
import { getEvents } from '../../controllers/calendar';
import type { ExtendedEvents } from '../../types/calendar';
import EventDetailsModal from '../Modals/EventDetailsModal';
import { getAuth } from '../../context/authContext';


import { Maximize2, Minimize2, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import '../../styles/calendar.css';

const EventCalendar: React.FC = () => {
    const { user } = getAuth();
    const [events, setEvents] = useState<ExtendedEvents[]>([]);
    const [modalDate, setModalDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMaximized, setIsMaximized] = useState(false);

    const eventsForModal = useMemo(() => {
        if (!modalDate) return [];
        return events
            .filter(event => new Date(event.start.dateTime || event.start.date).toDateString() === modalDate.toDateString())
            .sort((a, b) => new Date(a.start.dateTime || a.start.date).getTime() - new Date(b.end.dateTime || b.end.date).getTime());
    }, [modalDate, events]);

    const eventHandler = async () => {
        try {
            const response = await getEvents();
            setEvents(response);
        } finally {
            setLoading(false);
        }
    }

    const onViewDayDetails = (date: any) => {
        setModalDate(date);
    };

    useEffect(() => {
        eventHandler();
    }, [])

    useEffect(() => {
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMaximized) setIsMaximized(false);
        };
        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [isMaximized]);

    if (loading) {
        return (
            <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                className="bg-white items-center w-auto p-4 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="skeleton w-32 h-4 rounded" />
                    <div className="skeleton w-6 h-6 rounded" />
                </div>
                <div className="flex items-center justify-between mb-4">
                    <div className="skeleton w-6 h-6 rounded" />
                    <div className="skeleton h-4 w-28" />
                    <div className="skeleton w-6 h-6 rounded" />
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="skeleton h-3 rounded mx-auto" style={{ width: 20 }} />
                    ))}
                </div>
                {Array.from({ length: 5 }).map((_, row) => (
                    <div key={row} className="grid grid-cols-7 gap-1 mb-1">
                        {Array.from({ length: 7 }).map((_, col) => (
                            <div key={col} className="skeleton h-8 rounded-lg" />
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    const getEventIcon = (summary: string) => {
        const s = summary.toLowerCase();
        if (s.includes('starters')) return '🥋';
        if (s.includes('kotlin')) return '🟦';
        if (s.includes('icpc') || s.includes('codeforces')) return '📊';
        if (s.includes('atcoder')) return '🥋';
        if (s.includes('weekly')) return '🕒';
        if (s.includes('meeting') || s.includes('sync')) return '👥';
        return '📅';
    };

    const dayHasEvents = (date: Date) => {
        return events.some(event => new Date(event.start.dateTime || event.start.date).toDateString() === date.toDateString());
    };

    const tileClassName = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month' && dayHasEvents(date)) {
            return 'has-event';
        }
        return null;
    };

    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const dayEvents = events.filter(event => new Date(event.start.dateTime || event.start.date).toDateString() === date.toDateString());

            if (dayEvents.length === 0) return null;

            if (!isMaximized) {
                return (
                    <div className="flex justify-center items-center mt-auto mb-1">
                        <div className="h-1.5 w-1.5 bg-orange-500 rounded-full"></div>
                    </div>
                );
            }

            return (
                <div className="flex flex-col gap-1 mt-8 w-full px-2 pb-2 overflow-hidden items-start h-full">
                    {dayEvents.slice(0, 3).map(event => (
                        <div key={event.id} className="w-full flex items-center gap-2 bg-zinc-800/80 hover:bg-orange-500/20 hover:text-orange-400 transition-all rounded-lg px-2 py-1 text-[10px] font-bold text-white truncate border border-white/5">
                            <span className="shrink-0">{getEventIcon(event.summary)}</span>
                            <span className="truncate">{event.summary}</span>
                        </div>
                    ))}
                    {dayEvents.length > 3 && (
                        <span className="text-[10px] font-black opacity-30 ml-2 mt-0.5 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                            +{dayEvents.length - 3} more
                        </span>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className={`careit-calendar ${isMaximized ? 'calendar-maximized shadow-2xl z-[200]' : 'calendar-sidebar relative'}`}>
            {!user?.calendar && !loading && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm rounded-xl text-center p-8 select-none border border-white/5"
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="flex flex-col items-center"
                    >
                        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-2xl">
                            <CalendarIcon size={32} className="text-orange-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 leading-none tracking-tight">Sync Your Schedule</h3>
                        <p className="text-[11px] font-medium text-zinc-400 mb-8 max-w-[200px] leading-relaxed opacity-80">
                            Connect your Google Calendar to manage your weekly focus and events seamlessly.
                        </p>
                        <a 
                            href="/settings" 
                            className="group flex items-center gap-3 bg-gradient-to-br from-orange-400 to-orange-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-orange-600/30"
                        >
                            <span>Connect Integration</span>
                            <Maximize2 size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                    </motion.div>
                </motion.div>
            )}

            {!isMaximized && (
                <motion.div
                    layoutId="calendar-card"
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--card-border)',
                        color: 'var(--text-primary)',
                    }}
                    className="bg-white flex flex-col p-4 rounded-xl shadow-sm border h-full overflow-hidden"
                >
                    <div className="w-full flex items-center justify-between mb-2 px-1 shrink-0">
                        <div className="flex items-center gap-2 text-[10px] font-bold opacity-30 uppercase tracking-widest leading-none">
                            <CalendarIcon size={12} className="text-orange-500" />
                            <span>Schedule</span>
                        </div>
                        <button
                            onClick={() => setIsMaximized(true)}
                            className="p-1 rounded-lg transition-all hover:bg-orange-500/10 text-orange-500 active:scale-95"
                        >
                            <Maximize2 size={14} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <Calendar
                            tileClassName={tileClassName}
                            tileContent={tileContent}
                            onClickDay={onViewDayDetails}
                        />
                    </div>
                </motion.div>
            )}

            {/* The Full-screen Maximized Version */}
            <AnimatePresence>
                {isMaximized && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-8 isolate">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md -z-10"
                            onClick={() => setIsMaximized(false)}
                        />

                        <motion.div
                            layoutId="calendar-card"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--card-border)',
                                color: 'var(--text-primary)',
                                width: 'min(1100px, 100%)',
                                height: 'min(720px, 90vh)',
                            }}
                            className="bg-white flex flex-col p-6 rounded-2xl shadow-2xl border overflow-hidden"
                        >
                            <div className="w-full flex items-center justify-between mb-6 px-2 shrink-0">
                                <div className="flex items-center gap-3 text-sm font-bold opacity-40 uppercase tracking-[0.2em] leading-none">
                                    <CalendarIcon size={18} className="text-orange-500" />
                                    <span>Detailed Schedule</span>
                                </div>
                                <button
                                    onClick={() => setIsMaximized(false)}
                                    className="p-2 rounded-xl transition-all hover:bg-orange-500/10 text-orange-500 active:scale-90"
                                >
                                    <Minimize2 size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto scrollbar-hide py-2">
                                <Calendar
                                    className="border-none w-full !bg-transparent text-inherit"
                                    
                                    tileClassName={tileClassName}
                                    tileContent={tileContent}
                                    onClickDay={onViewDayDetails}
                                />
                            </div>

                            <div className="mt-6 pt-4 border-t w-full text-center text-[10px] font-black uppercase tracking-[0.4em] opacity-20 pointer-events-none"
                                style={{ borderColor: 'var(--border-primary)' }}>
                                Press Esc to collapse
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Tooltip
                id="calendar-tooltip"
                place="top"
                className="custom-tooltip"
                clickable
                afterShow={() => {
                    (window as any).viewDayDetails = (isoString: string) => {
                        onViewDayDetails(new Date(isoString))
                    }
                }}
            />
            <EventDetailsModal
                events={eventsForModal}
                isOpen={!!modalDate}
                onClose={() => setModalDate(null)}
                date={modalDate}
            />
        </div>
    );
};

export default EventCalendar;