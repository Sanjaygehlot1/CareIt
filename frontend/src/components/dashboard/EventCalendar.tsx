import React, { useEffect, useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import { Tooltip } from 'react-tooltip';
import { getEvents } from '../../controllers/calendar';
import type {  ExtendedEvents } from '../../types/calendar';
import EventDetailsModal from '../Modals/EventDetailsModal';





const EventCalendar: React.FC = () => {

  const [events, setEvents] = useState<ExtendedEvents[]>([]);
  const [modalDate, setModalDate] = useState<Date | null>(null);

  const eventsForModal = useMemo(() => {
    if (!modalDate) return [];
    return events
      .filter(event => new Date(event.start.dateTime || event.start.date).toDateString() === modalDate.toDateString())
      .sort((a, b) => new Date(a.start.dateTime || a.start.date).getTime() - new Date(b.end.dateTime || b.end.date).getTime());
  }, [modalDate, events]);

  const eventHandler = async () => {
    const response = await getEvents();
    console.log(response)
    setEvents(response);
  }

  const onViewDayDetails = (date: any) => {
    setModalDate(date);
  };



  useEffect(() => {
    eventHandler();
  }, [])

  const dayHasEvents = (date: Date) => {
    return events.some(event => new Date(event.start.dateTime || event.start.date).toDateString() === date.toDateString());
  };

  const getTooltipContent = (date: Date) => {
    const dayEvents = events.filter(event => new Date(event.start.dateTime || event.start.date).toDateString() === date.toDateString());
    if (dayEvents.length === 0) return null;

    return `
      <div class="flex items-center justify-between py-1 px-2">
        <span class="text-xs font-semibold">${dayEvents.length} event(s)</span>
        <button 
          class="text-blue-500 text-xs font-bold hover:underline ml-3"
          onclick="viewDayDetails('${date.toISOString()}')"
        >
          View details
        </button>
      </div>
    `;
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && dayHasEvents(date)) {
      return 'has-event';
    }
    return null;
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && dayHasEvents(date)) {
      console.log(date, view)
      return (
        <>
          <a
            className="absolute inset-0"
            data-tooltip-id="calendar-tooltip"
            data-tooltip-html={getTooltipContent(date)}
          ></a>
          <div className="flex justify-center items-center">
            <div className="h-1.5 w-1.5 bg-orange-500 rounded-full mt-1"></div>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div
    style={{backgroundColor : 'var(--card-bg)' , borderColor : 'var(--card-border)', color : 'var(--text-primary)'}}
     className="bg-white items-center w-auto p-4 rounded-xl shadow-sm">
      <Calendar
        className="w-full border-none space-y-0"
        tileClassName={tileClassName}
        tileContent={tileContent}
      />
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