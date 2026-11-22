import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Clock,
  Plus,
  X,
  Calendar as CalendarIcon,
  Tag,
  Briefcase
} from 'lucide-react';
import { CalendarEventItem } from '../types';

interface CalendarCardProps {
  events?: CalendarEventItem[];
  onViewAll?: () => void;
  onOpenFullCalendar?: () => void;
  onSelectEvent?: (event: CalendarEventItem) => void;
  // onAddEvent?: (event: CalendarEventItem) => void;
  onAddEvent?: (event: CalendarEventItem) => Promise<void> | void;
  isPopup?: boolean;
  onClose?: () => void;
}

export const CalendarCard: React.FC<CalendarCardProps> = ({
  events = [],
  onViewAll,
  onOpenFullCalendar,
  onSelectEvent,
  onAddEvent,
  isPopup = false,
  onClose
}) => {
  // Calendar base date (defaults to September 2026)
  // const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 15));
  // // Selected date formatted as YYYY-MM-DD
  // const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-09-15');

  // Today's date in local timezone
const today = new Date();

const todayStr =
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

// Calendar starts at the current month
const [currentDate, setCurrentDate] = useState<Date>(
  () => new Date(today.getFullYear(), today.getMonth(), 1)
);

// Default selected date is today
const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  // Modals for Event Details and Add Event
  const [activeEventDetail, setActiveEventDetail] = useState<CalendarEventItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New event form state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventProject, setNewEventProject] = useState('Project Alpha');
  const [newEventTime, setNewEventTime] = useState('10:00 AM');
  const [newEventType, setNewEventType] = useState<'review' | 'maintenance' | 'meeting' | 'milestone'>('review');
  // const [newEventDate, setNewEventDate] = useState('2026-09-15');
  const [newEventDate, setNewEventDate] = useState(todayStr);

  // Local events state to ensure instant update if parent doesn't update immediately
  // const [localEvents, setLocalEvents] = useState<CalendarEventItem[]>([]);

  // // Merged events
  // const allEvents = useMemo(() => {
  //   const map = new Map<string, CalendarEventItem>();
  //   [...events, ...localEvents].forEach(ev => {
  //     map.set(ev.id, ev);
  //   });
  //   return Array.from(map.values());
  // }, [events, localEvents]);

  const allEvents = events;

  const handleOpenAll = onViewAll || onOpenFullCalendar;

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Current month/year info
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const isCurrentMonth =
  year === today.getFullYear() &&
  month === today.getMonth();

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Month header text
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Compute calendar grid cells
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }
    return cells;
  }, [firstDayOfWeek, daysInMonth]);

  // Set of dates that have events
  const datesWithEvents = useMemo(() => {
    const set = new Set<string>();
    allEvents.forEach(ev => {
      if (ev.date) set.add(ev.date);
    });
    return set;
  }, [allEvents]);

  // Events on currently selected date
  const eventsOnSelectedDate = useMemo(() => {
    return allEvents.filter(ev => ev.date === selectedDateStr);
  }, [allEvents, selectedDateStr]);

  // Fallback upcoming events in current month if no events on selected date
  const upcomingInMonth = useMemo(() => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return allEvents.filter(ev => ev.date.startsWith(monthPrefix));
  }, [allEvents, year, month]);

  const displayedEvents = eventsOnSelectedDate.length > 0 ? eventsOnSelectedDate : upcomingInMonth;

  // Type color styling helper
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'review':
        return { bar: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'maintenance':
        return { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'meeting':
        return { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'milestone':
        return { bar: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { bar: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
  };

  const handleOpenAddModal = () => {
    setNewEventDate(selectedDateStr);
    setNewEventTitle('');
    setIsAddModalOpen(true);
  };

  // const handleCreateEvent = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!newEventTitle.trim()) return;

  //   const created: CalendarEventItem = {
  //     id: `ev-${Date.now()}`,
  //     title: newEventTitle.trim(),
  //     project: newEventProject,
  //     time: newEventTime,
  //     type: newEventType,
  //     date: newEventDate
  //   };

  //   setLocalEvents(prev => [created, ...prev]);
  //   if (onAddEvent) {
  //     onAddEvent(created);
  //   }
  //   // Set selected date to newly created event date
  //   setSelectedDateStr(newEventDate);
  //   // Also navigate view to that month if different
  //   const [y, m] = newEventDate.split('-').map(Number);
  //   if (y && m) {
  //     setCurrentDate(new Date(y, m - 1, 1));
  //   }
  //   setIsAddModalOpen(false);
  // };

  const handleCreateEvent = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!newEventTitle.trim()) return;
  if (newEventDate < todayStr) return;

  const created: CalendarEventItem = {
    id: `temp-${Date.now()}`,
    title: newEventTitle.trim(),
    project: newEventProject,
    time: newEventTime,
    type: newEventType,
    date: newEventDate,
  };

  try {
    await onAddEvent?.(created);

    setSelectedDateStr(newEventDate);

    const [y, m] = newEventDate.split('-').map(Number);

    if (y && m) {
      setCurrentDate(new Date(y, m - 1, 1));
    }

    setIsAddModalOpen(false);
  } catch (error) {
    console.error("Unable to save calendar event:", error);
  }
};

  const handleEventClick = (eventItem: CalendarEventItem) => {
    setActiveEventDetail(eventItem);
    if (onSelectEvent) {
      onSelectEvent(eventItem);
    }
  };

  // Format selected date label
  const selectedDateLabel = useMemo(() => {
    try {
      const [y, m, d] = selectedDateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return selectedDateStr;
    }
  }, [selectedDateStr]);

  return (
    <div 
      id={isPopup ? "calendar-navbar-popup-card" : "calendar-dashboard-card"}
      className={
        isPopup
          ? "bg-white p-3.5 flex flex-col w-full h-[390px] overflow-hidden relative select-none"
          : "bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-3 flex flex-col h-full overflow-hidden relative"
      }
    >
      {/* Top Header */}
      <div className={`flex items-center justify-between pb-1.5 shrink-0 ${isPopup ? 'border-b border-slate-100' : ''}`}>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span>Calendar</span>
          </h2>
          <button
            onClick={handleOpenAddModal}
            id={isPopup ? "btn-calendar-popup-add" : "btn-calendar-quick-add"}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer"
            title="Add new event"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
            <span>Add Event</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {handleOpenAll && (
            <button
              onClick={handleOpenAll}
              id={isPopup ? "btn-calendar-popup-view-all" : "btn-calendar-view-all"}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
          {isPopup && onClose && (
            <button
              onClick={onClose}
              id="btn-calendar-popup-close"
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Close calendar"
              aria-label="Close calendar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Split Body */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 min-h-0 pt-1.5 items-stretch gap-2.5 sm:gap-1 overflow-y-auto sm:overflow-hidden no-scrollbar">
        
        {/* Left Column: Functional Mini Calendar Grid */}
        <div className="h-full flex flex-col justify-between pr-0 sm:pr-2 border-b sm:border-b-0 sm:border-r border-slate-100 min-h-0 pb-2 sm:pb-0">
          {/* Month Header + Navigation */}
          <div className="flex items-center justify-between pb-1 shrink-0">
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              {monthName}
            </span>
            <div className="flex items-center gap-0.5 text-slate-400">
              <button 
                onClick={handlePrevMonth}
                disabled={isCurrentMonth}
                id="btn-calendar-prev-month"
                // className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous month"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleNextMonth}
                id="btn-calendar-next-month"
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                title="Next month"
                aria-label="Next month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 text-center text-[10px] text-slate-400 font-semibold tracking-wider pb-1 shrink-0">
            {weekdays.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="flex-1 grid grid-cols-7 auto-rows-fr text-center text-[11px] items-center min-h-0 gap-y-0.5">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="w-full h-full" />;
              }

              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = dateStr === selectedDateStr;
              const hasEvents = datesWithEvents.has(dateStr);
              const isPastDate = dateStr < todayStr;

              return (
                <button
                  key={`day-${day}-${idx}`}
                  disabled={isPastDate}
                  onClick={() => setSelectedDateStr(dateStr)}
                  id={`calendar-day-btn-${day}`}
                  // className={`w-full h-full min-h-[24px] flex flex-col items-center justify-center relative transition-colors cursor-pointer ${
                  //   isSelected
                  //     ? 'font-bold'
                  //     : 'text-slate-700 hover:text-blue-600 font-medium'
                  // }`}
                  className={`w-full h-full min-h-[24px] flex flex-col items-center justify-center relative transition-colors ${
  isPastDate
    ? 'text-slate-300 cursor-not-allowed'
    : isSelected
      ? 'font-bold cursor-pointer'
      : 'text-slate-700 hover:text-blue-600 font-medium cursor-pointer'
}`}
                >
                  {isSelected ? (
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shadow-xs ring-2 ring-blue-600/30">
                      {day}
                    </span>
                  ) : (
                    <span className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100/80">
                      {day}
                    </span>
                  )}

                  {hasEvents && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute bottom-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Events */}
        <div className="h-full flex flex-col pl-0 sm:pl-2 min-h-0 pt-2 sm:pt-0 py-0.5">
          {/* Subheader */}
          <div className="flex items-center justify-between pb-1 text-[11px] text-slate-500 font-medium border-b border-slate-100 shrink-0">
            <span>
              {eventsOnSelectedDate.length > 0 
                ? `Events (${selectedDateLabel})` 
                : `Upcoming (${selectedDateLabel})`}
            </span>
            <span className="text-[10px] text-slate-400">
              {displayedEvents.length} item{displayedEvents.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Events List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pt-1.5 pr-0.5 scrollbar-thin">
            {displayedEvents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-2">
                <CalendarIcon className="w-5 h-5 text-slate-300 mb-1" />
                <div className="text-xs text-slate-500 font-medium">No events for this day</div>
                <button
                  onClick={handleOpenAddModal}
                  className="mt-1.5 text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  + Add an event
                </button>
              </div>
            ) : (
              displayedEvents.map((ev) => {
                const colorInfo = getTypeColor(ev.type);
                return (
                  <div 
                    key={ev.id}
                    onClick={() => handleEventClick(ev)}
                    id={`calendar-event-item-${ev.id}`}
                    className="flex items-start gap-2 p-2 rounded-lg bg-slate-50/70 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group text-left"
                  >
                    <div className={`w-1 self-stretch rounded-full ${colorInfo.bar} shrink-0 mt-0.5`} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <div className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 shrink-0" />
                          <span>{ev.time}</span>
                        </div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 group-hover:text-blue-600 font-semibold">
                          {ev.date}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-xs leading-snug truncate mt-0.5 group-hover:text-blue-600 transition-colors">
                        {ev.title}
                      </div>
                      <div className="text-[10.5px] text-slate-500 leading-none mt-0.5 truncate flex items-center justify-between">
                        <span>{ev.project}</span>
                        <span className="text-[9px] text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Details →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* EVENT DETAILS MODAL */}
      {activeEventDetail && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setActiveEventDetail(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-5 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
            id="calendar-event-details-modal"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getTypeColor(activeEventDetail.type).badge}`}>
                  {activeEventDetail.type}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug">
                  {activeEventDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveEventDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>Date:</strong> {activeEventDetail.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>Time:</strong> {activeEventDetail.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>Project:</strong> {activeEventDetail.project}</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setActiveEventDetail(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD EVENT MODAL */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-sm w-full max-h-[92dvh] overflow-y-auto no-scrollbar shadow-2xl border border-slate-200 p-4 sm:p-5 space-y-4 animate-in zoom-in-95 duration-150" /* changes done by vb */
            onClick={(e) => e.stopPropagation()}
            id="calendar-add-event-modal"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Add Project Event</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Phase 2 Architectural Review"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    min={todayStr}
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Time</label>
                  <input
                    type="text"
                    required
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Project</label>
                  <select
                    value={newEventProject}
                    onChange={(e) => setNewEventProject(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 bg-white"
                  >
                    <option value="Project Alpha">Project Alpha</option>
                    <option value="Project Beta">Project Beta</option>
                    <option value="Project Gamma">Project Gamma</option>
                    <option value="Project Zephyr">Project Zephyr</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Type</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 bg-white"
                  >
                    <option value="review">Review</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="meeting">Meeting</option>
                    <option value="milestone">Milestone</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-calendar-event"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Save Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
