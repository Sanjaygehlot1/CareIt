import React from 'react';
import { Calendar, Clock, X, Zap, MapPin, FileText, User, Link2, Paperclip, Train } from 'lucide-react';
import { format } from 'date-fns';
import type { ExtendedEvents } from '../../types/calendar';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: ExtendedEvents[];
  date: Date | null;
}

const EventDetailsModal: React.FC<ModalProps> = ({ isOpen, onClose, events, date }) => {
  if (!isOpen || !date) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: 'var(--modal-overlay)' }}
    >
      <div
        className="relative rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] flex flex-col"
        style={{ backgroundColor: 'var(--modal-bg)' }}
      >
        {/* Header */}
        <div className="p-6 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <Calendar size={20} style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Events for {format(date, 'MMMM d, yyyy')}
            </h2>
          </div>

          <hr style={{ borderColor: 'var(--border-primary)' }} />
        </div>

        {/* Events List */}
        <div className="px-6 pb-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {events.length > 0 ? (
              events.map((event, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  style={{
                    borderColor: 'var(--card-border)',
                    backgroundColor: 'var(--card-bg)',
                  }}
                >
                  {/* Time and Title */}
                  <div className="flex items-start gap-4 mb-3">
                    <div className="text-center flex-shrink-0 w-20">
                      <Clock
                        className="mx-auto mb-1"
                        size={18}
                        style={{ color: 'var(--accent-primary)' }}
                      />
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {format(new Date(event.start.dateTime || event.start.date!), 'h:mm a')}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        to {format(new Date(event.end.dateTime || event.end.date!), 'h:mm a')}
                      </p>
                    </div>

                    <div
                      className="border-l-2 pl-4 flex-1"
                      style={{ borderColor: 'var(--accent-light)' }}
                    >
                      <h3
                        className="font-semibold text-lg mb-3"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {event.summary}
                      </h3>

                      {/* Description */}
                      {event.description && (
                        <div className="flex items-start gap-2 mb-2">
                          <FileText
                            size={16}
                            className="mt-0.5 flex-shrink-0"
                            style={{ color: 'var(--text-secondary)' }}
                          />
                          <p
                            className="text-sm whitespace-pre-wrap"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {event.description}
                          </p>
                        </div>
                      )}

                      {/* Location / Journey */}
                      {event.location && (
                        <div className="flex items-start gap-2 mb-2">
                          <Train
                            size={16}
                            className="mt-0.5 flex-shrink-0"
                            style={{ color: 'var(--text-secondary)' }}
                          />
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <span className="font-medium">Journey / Location:</span>{' '}
                            {event.location}
                          </p>
                        </div>
                      )}

                      {/* Source (Email link) */}
                      {event.source?.url && (
                        <div className="flex items-start gap-2 mb-2">
                          <Link2
                            size={16}
                            className="mt-0.5 flex-shrink-0"
                            style={{ color: 'var(--text-secondary)' }}
                          />
                          <a
                            href={event.source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm hover:underline"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            View Source (Email / Calendar)
                          </a>
                        </div>
                      )}

                      {/* Creator */}
                      {event.creator?.email && (
                        <div className="flex items-start gap-2 mb-2">
                          <User
                            size={16}
                            className="mt-0.5 flex-shrink-0"
                            style={{ color: 'var(--text-secondary)' }}
                          />
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <span className="font-medium">Created by:</span>{' '}
                            {event.creator.email}
                          </div>
                        </div>
                      )}

                      {/* Attendees */}
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-start gap-2 mb-2">
                          <User
                            size={16}
                            className="mt-0.5 flex-shrink-0"
                            style={{ color: 'var(--text-secondary)' }}
                          />
                          <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                            <span className="font-medium">Attendees:</span>
                            <ul className="list-disc ml-5">
                              {event.attendees.map((att, i) => (
                                <li key={i}>{att.email}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Conference Data */}
                      {event.conferenceData && (
                        <div className="flex items-start gap-2 mb-2">
                          {event.conferenceData.conferenceSolution?.iconUri && (
                            <img
                              src={event.conferenceData.conferenceSolution.iconUri}
                              alt="Conference Icon"
                              width={18}
                              height={18}
                              className="mt-0.5 flex-shrink-0"
                            />
                          )}
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <span className="font-medium">
                              {event.conferenceData.conferenceSolution?.name}:
                            </span>{' '}
                            <a
                              href={event.hangoutLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              Join Meeting
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Attachments */}
                      {event.attachments && event.attachments.length > 0 && (
                        <div className="flex items-start gap-2 mb-2">
                          <Paperclip
                            size={16}
                            className="mt-0.5 flex-shrink-0"
                            style={{ color: 'var(--text-secondary)' }}
                          />
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <span className="font-medium">Attachments:</span>
                            <ul className="list-disc ml-5">
                              {event.attachments.map((file, i) => (
                                <li key={i}>
                                  <a
                                    href={file.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                    style={{ color: 'var(--text-secondary)' }}
                                  >
                                    {file.title || 'View File'}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                <Zap
                  size={24}
                  className="mx-auto mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                />
                <p className="text-sm font-medium">No events scheduled for this day.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
