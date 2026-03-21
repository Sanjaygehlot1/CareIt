import { CalendarClock, CalendarX } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { getEvents } from '../../controllers/calendar';
import type { ExtendedEvents } from '../../types/calendar';

const TodaysAgenda: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<ExtendedEvents[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetchEvents = async () => {
      try {
        const responseEvents = await getEvents();
        if (!mounted) return;
        
   
        const today = new Date().toDateString();
        const todaysEvents = responseEvents.filter((ev: ExtendedEvents) => {
           const evDate = new Date(ev.start.dateTime || ev.start.date);
           return evDate.toDateString() === today;
        });

     
        todaysEvents.sort((a: ExtendedEvents, b: ExtendedEvents) => {
           return new Date(a.start.dateTime || a.start.date).getTime() - new Date(b.start.dateTime || b.start.date).getTime();
        });

        setEvents(todaysEvents.slice(0, 5)); 
      } catch (err) {
        console.error("Failed to load Agenda:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchEvents();

    return () => { mounted = false; };
  }, []);

  const formatTime = (dateStr: Date | string) => {
    const d = new Date(dateStr);
  
    if (!dateStr.toString().includes('T')) return 'All Day';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(/^0/, '');
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        className="p-6 rounded-xl shadow-card border">
   
        <div className="flex items-center gap-3 mb-5">
          <div className="skeleton w-6 h-6 rounded" />
          <div className="skeleton h-5 w-32" />
        </div>
   
        <div className="space-y-4">
          {[60, 80, 50].map((w, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="skeleton h-4 w-20 flex-shrink-0" />
              <div className="skeleton w-1.5 h-1.5 rounded-full flex-shrink-0" />
              <div className="skeleton h-4 flex-1" style={{ maxWidth: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      className="p-6 rounded-xl shadow-card border">
      <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
        <CalendarClock className="mr-3" style={{ color: 'var(--accent-primary)' }} size={24} />
        Today's Agenda
      </h2>
      
      {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6">
              <CalendarX size={32} className="mb-2 opacity-20" style={{ color: 'var(--text-primary)' }} />
              <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
                  Your schedule is beautifully clear today.
              </p>
          </div>
      ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={event.id || index} className="flex items-start space-x-4">
                <span className="font-medium text-sm w-20 pt-0.5 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  {formatTime(event.start.dateTime || event.start.date)}
                </span>
                <div className="w-1.5 h-1.5 rounded-full shrink-0 relative top-2" style={{ backgroundColor: 'var(--accent-primary)' }} />
                <div className="flex-1 flex flex-col min-w-0">
                   <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }} title={event.summary}>
                     {event.summary || "Busy"}
                   </span>
                  
                   {event.end?.dateTime && (
                       <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                           Until {formatTime(event.end.dateTime)}
                       </span>
                   )}
                </div>
              </div>
            ))}
          </div>
      )}
    </div>
  );
};

export default TodaysAgenda;