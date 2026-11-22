// changes done by vb: rebuilt as a Microsoft Teams-style calendar (Day / Week / Month views).
// Today is highlighted, past days are dimmed and upcoming days are bright. Opened by "View All"
// on the dashboard calendar card (route /calendar). The previous simple list version was replaced.
// changes done by vb (beautify pass): gradient header, sidebar with mini-calendar + "Up next"
// agenda + legend, rounded tile month grid, weekend tint, refined chips and week/day headers.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { CalendarEventItem } from '../../types';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEventItem[];
  /** changes done by vb: optional — lets "+ New event" save a Todo (same handler as the dashboard card) */
  onAddEvent?: (event: CalendarEventItem) => Promise<void> | void;
}

type ViewMode = 'day' | 'week' | 'month';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOUR_HEIGHT = 56; // px per hour row in Day / Week view

// ---- date helpers (local time, YYYY-MM-DD keys) ----
const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfWeek = (d: Date) => addDays(d, -d.getDay());
const sameDay = (a: Date, b: Date) => toKey(a) === toKey(b);
const fromKey = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const formatHour = (h: number) => (h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`);

/** Parse "10:30", "10:30 AM", "2 PM" etc. into minutes after midnight; null when there is no usable time. */
const parseTimeToMinutes = (raw?: string): number | null => {
  if (!raw) return null;
  const m = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] || 0);
  const ap = m[3]?.toLowerCase();
  if (ap === 'pm' && h < 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
};

/** 6-week month matrix used by the sidebar mini calendar */
const monthMatrix = (anchor: Date) => {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
};

const TYPE_META: Record<CalendarEventItem['type'], { label: string; chip: string; dot: string }> = {
  meeting: { label: 'Meeting / Todo', chip: 'bg-blue-50 text-blue-900 ring-blue-200/70', dot: 'bg-blue-500' },
  review: { label: 'Review', chip: 'bg-violet-50 text-violet-900 ring-violet-200/70', dot: 'bg-violet-500' },
  maintenance: { label: 'Maintenance', chip: 'bg-amber-50 text-amber-900 ring-amber-200/70', dot: 'bg-amber-500' },
  milestone: { label: 'Milestone', chip: 'bg-emerald-50 text-emerald-900 ring-emerald-200/70', dot: 'bg-emerald-500' },
};

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, events, onAddEvent }) => {
  const [view, setView] = useState<ViewMode>('month');
  const [cursor, setCursor] = useState(() => new Date()); // the date the current view is anchored on
  const [miniCursor, setMiniCursor] = useState(() => new Date()); // month shown in the sidebar mini calendar
  const [now, setNow] = useState(() => new Date());

  // Quick "New event" form
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDate, setDraftDate] = useState(() => toKey(new Date()));
  const [saving, setSaving] = useState(false);
  const [composerError, setComposerError] = useState('');

  const gridScrollRef = useRef<HTMLDivElement>(null);

  // Keep "now" fresh so the red current-time line moves
  useEffect(() => {
    if (!isOpen) return;
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, [isOpen]);

  // Reset to today each time the calendar opens
  useEffect(() => {
    if (isOpen) {
      const t = new Date();
      setCursor(t);
      setMiniCursor(t);
      setNow(t);
    }
  }, [isOpen]);

  // Esc closes the composer first, then the calendar
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (composerOpen) setComposerOpen(false);
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, composerOpen, onClose]);

  // Scroll the time grid to ~1h before now when today is on screen, otherwise to 8 AM
  useEffect(() => {
    if (!isOpen || view === 'month' || !gridScrollRef.current) return;
    const today = new Date();
    const showsToday =
      view === 'day' ? sameDay(cursor, today) : toKey(startOfWeek(cursor)) === toKey(startOfWeek(today));
    const hour = showsToday ? Math.max(0, today.getHours() - 1) : 8;
    gridScrollRef.current.scrollTop = hour * HOUR_HEIGHT;
  }, [isOpen, view, cursor]);

  // Keep the mini calendar on the month being viewed
  useEffect(() => {
    setMiniCursor(new Date(cursor.getFullYear(), cursor.getMonth(), 1));
  }, [cursor]);

  const todayKey = toKey(now);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEventItem[]> = {};
    events.forEach((ev) => {
      const key = String(ev.date).split('T')[0];
      if (!key) return;
      (map[key] ||= []).push(ev);
    });
    Object.values(map).forEach((list) =>
      list.sort((a, b) => (parseTimeToMinutes(a.time) ?? -1) - (parseTimeToMinutes(b.time) ?? -1))
    );
    return map;
  }, [events]);

  // Next upcoming events (today onwards) for the sidebar agenda
  const upcoming = useMemo(
    () =>
      Object.keys(eventsByDate)
        .filter((k) => k >= todayKey)
        .sort()
        .flatMap((k) => eventsByDate[k].map((ev) => ({ key: k, ev })))
        .slice(0, 6),
    [eventsByDate, todayKey]
  );

  // Which days the current view shows
  const visibleDays = useMemo(() => {
    if (view === 'day') return [new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate())];
    if (view === 'week') {
      const start = startOfWeek(cursor);
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const start = startOfWeek(first);
    const weeks = Math.ceil((first.getDay() + last.getDate()) / 7);
    return Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i));
  }, [view, cursor]);

  if (!isOpen) return null;

  const dayState = (d: Date): 'past' | 'today' | 'future' => {
    const k = toKey(d);
    return k < todayKey ? 'past' : k === todayKey ? 'today' : 'future';
  };

  const go = (dir: -1 | 1) => {
    if (view === 'day') setCursor((c) => addDays(c, dir));
    else if (view === 'week') setCursor((c) => addDays(c, dir * 7));
    else setCursor((c) => new Date(c.getFullYear(), c.getMonth() + dir, 1));
  };

  const openDay = (d: Date) => {
    setCursor(d);
    setView('day');
  };

  const title = (() => {
    if (view === 'month') return cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (view === 'day')
      return cursor.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const s = visibleDays[0];
    const e = visibleDays[6];
    const sameMonth = s.getMonth() === e.getMonth();
    return `${s.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – ${e.toLocaleDateString('en-US', {
      month: sameMonth ? undefined : 'long',
      day: 'numeric',
    })}, ${e.getFullYear()}`;
  })();

  const openComposer = (date?: Date) => {
    if (!onAddEvent) return;
    setDraftTitle('');
    setDraftDate(toKey(date || now));
    setComposerError('');
    setComposerOpen(true);
  };

  const saveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddEvent || saving) return;
    const t = draftTitle.trim();
    if (!t) {
      setComposerError('Please add a title.');
      return;
    }
    setSaving(true);
    setComposerError('');
    try {
      await onAddEvent({ id: `tmp-${Date.now()}`, title: t, date: draftDate, time: '', project: '', type: 'meeting' });
      setComposerOpen(false);
      setCursor(fromKey(draftDate));
    } catch (err) {
      setComposerError(err instanceof Error ? err.message : 'Unable to save the event.');
    } finally {
      setSaving(false);
    }
  };

  const renderChip = (ev: CalendarEventItem, past: boolean, compact?: boolean) => {
    const meta = TYPE_META[ev.type] || TYPE_META.meeting;
    return (
      <div
        key={ev.id}
        title={`${ev.title}${ev.time ? ` · ${ev.time}` : ''}${ev.project ? ` · ${ev.project}` : ''}`}
        className={`flex min-w-0 items-center gap-1.5 rounded-md ring-1 ring-inset ${compact ? 'px-1.5 py-[3px] text-[11px]' : 'h-full px-2 py-1 text-xs'} font-medium ${meta.chip} ${
          past ? 'opacity-50 saturate-50' : 'shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
        }`}
      >
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} />
        {ev.time && <span className="shrink-0 font-semibold">{ev.time}</span>}
        <span className="truncate">{ev.title}</span>
      </div>
    );
  };

  // ------------------------------------------------------------------ SIDEBAR
  const renderSidebar = () => {
    const days = monthMatrix(miniCursor);
    return (
      <aside className="hidden w-[272px] shrink-0 flex-col gap-5 overflow-y-auto border-r border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-white p-4 lg:flex">
        {onAddEvent && (
          <button
            type="button"
            onClick={() => openComposer()}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)] transition-all hover:brightness-110 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New event
          </button>
        )}

        {/* Mini month calendar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate-900">
              {miniCursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <div className="flex">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setMiniCursor((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setMiniCursor((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center text-[10px] font-semibold uppercase text-slate-400">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1">{w[0]}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5 text-center">
            {days.map((d) => {
              const state = dayState(d);
              const inMonth = d.getMonth() === miniCursor.getMonth();
              const selected = sameDay(d, cursor) && state !== 'today';
              const hasEvents = (eventsByDate[toKey(d)] || []).length > 0;
              return (
                <button
                  key={toKey(d)}
                  type="button"
                  onClick={() => openDay(d)}
                  aria-label={d.toDateString()}
                  className={`relative mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11.5px] transition-colors cursor-pointer ${
                    state === 'today'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 font-bold text-white shadow-[0_3px_8px_rgba(37,99,235,0.4)]'
                      : selected
                        ? 'bg-blue-100 font-semibold text-blue-700'
                        : state === 'past'
                          ? `${inMonth ? 'text-slate-400' : 'text-slate-300'} hover:bg-slate-100`
                          : `${inMonth ? 'font-medium text-slate-800' : 'text-slate-400'} hover:bg-blue-50`
                  }`}
                >
                  {d.getDate()}
                  {hasEvents && state !== 'today' && (
                    <span className={`absolute bottom-0.5 h-1 w-1 rounded-full ${state === 'past' ? 'bg-slate-300' : 'bg-blue-500'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Up next */}
        <div>
          <div className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            Up next
          </div>
          {upcoming.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-3 py-5 text-center">
              <CalendarDays className="mx-auto h-6 w-6 text-slate-300" />
              <p className="mt-1.5 text-xs font-medium text-slate-500">Nothing scheduled yet</p>
              {onAddEvent && (
                <button
                  type="button"
                  onClick={() => openComposer()}
                  className="mt-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  + Add an event
                </button>
              )}
            </div>
          ) : (
            <ul className="space-y-1.5">
              {upcoming.map(({ key, ev }) => {
                const d = fromKey(key);
                const meta = TYPE_META[ev.type] || TYPE_META.meeting;
                const isToday = key === todayKey;
                return (
                  <li key={ev.id}>
                    <button
                      type="button"
                      onClick={() => openDay(d)}
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-2 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/40 cursor-pointer"
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg ${
                          isToday ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="text-[9px] font-semibold uppercase leading-none opacity-80">
                          {d.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-sm font-bold leading-tight">{d.getDate()}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-slate-900">{ev.title}</span>
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          {isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'long' })}
                          {ev.time ? ` · ${ev.time}` : ' · All day'}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* changes done by vb */}
      </aside>
    );
  };

  // ------------------------------------------------------------------ MONTH VIEW
  const renderMonth = () => (
    <div className="flex h-full min-h-0 flex-col p-2 sm:p-3">
      <div className="grid grid-cols-7 gap-1.5 pb-1.5">
        {WEEKDAYS.map((w, i) => {
          const isTodayCol = i === now.getDay() && visibleDays.some((d) => sameDay(d, now));
          return (
            <div
              key={w}
              className={`px-2 text-[11px] font-semibold uppercase tracking-wider ${isTodayCol ? 'text-blue-600' : 'text-slate-400'}`}
            >
              {w}
            </div>
          );
        })}
      </div>
      <div
        className="grid flex-1 min-h-0 grid-cols-7 gap-1.5"
        style={{ gridTemplateRows: `repeat(${visibleDays.length / 7}, minmax(0, 1fr))` }}
      >
        {visibleDays.map((d) => {
          const state = dayState(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const weekend = d.getDay() === 0 || d.getDay() === 6;
          const dayEvents = eventsByDate[toKey(d)] || [];
          const shown = dayEvents.slice(0, 3);
          const extra = dayEvents.length - shown.length;

          return (
            <div
              key={toKey(d)}
              role="button"
              tabIndex={0}
              aria-label={`${d.toDateString()}${state === 'today' ? ', today' : ''}, ${dayEvents.length} events`}
              onClick={() => openDay(d)}
              onKeyDown={(e) => { if (e.key === 'Enter') openDay(d); }}
              className={`group relative flex min-h-[78px] flex-col gap-1 overflow-hidden rounded-xl p-1.5 text-left transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:p-2 ${
                state === 'today'
                  ? 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 ring-2 ring-blue-500/70 shadow-[0_8px_22px_rgba(37,99,235,0.16)]'
                  : state === 'past'
                    ? `${inMonth ? 'bg-slate-100/70' : 'bg-slate-100/40'} ring-1 ring-slate-200/60 hover:bg-slate-100`
                    : `${weekend ? 'bg-indigo-50/40' : 'bg-white'} ring-1 ${inMonth ? 'ring-slate-200/80' : 'ring-slate-100'} shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:-translate-y-px hover:ring-blue-300 hover:shadow-[0_6px_16px_rgba(37,99,235,0.10)]`
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-[13px] ${
                    state === 'today'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 font-bold text-white shadow-[0_3px_10px_rgba(37,99,235,0.45)]'
                      : state === 'past'
                        ? inMonth ? 'text-slate-400' : 'text-slate-300'
                        : inMonth ? 'font-semibold text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {d.getDate() === 1 && !inMonth
                    ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : d.getDate()}
                </span>
                {state === 'today' && (
                  <span className="hidden rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white sm:inline">
                    Today
                  </span>
                )}
                {onAddEvent && state === 'future' && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); openComposer(d); }}
                    aria-label={`New event on ${d.toDateString()}`}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white opacity-0 shadow-sm transition-all hover:bg-blue-700 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Chips on larger screens, dots on phones */}
              <div className="hidden min-w-0 flex-col gap-1 sm:flex">
                {shown.map((ev) => renderChip(ev, state === 'past', true))}
                {extra > 0 && (
                  <span className="px-1 text-[11px] font-semibold text-blue-600">+{extra} more</span>
                )}
              </div>
              {dayEvents.length > 0 && (
                <div className="mt-auto flex gap-0.5 sm:hidden">
                  {dayEvents.slice(0, 4).map((ev) => (
                    <span key={ev.id} className={`h-1.5 w-1.5 rounded-full ${state === 'past' ? 'bg-slate-300' : (TYPE_META[ev.type] || TYPE_META.meeting).dot}`} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ------------------------------------------------------------------ DAY / WEEK VIEW
  const renderTimeGrid = () => {
    const cols = visibleDays;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const colTemplate = `60px repeat(${cols.length}, minmax(0, 1fr))`;

    return (
      <div className="flex h-full min-h-0 flex-col overflow-x-auto">
        <div className={`flex h-full min-h-0 flex-col ${cols.length > 1 ? 'min-w-[760px]' : ''}`}>
          {/* Day headers */}
          <div className="grid gap-1.5 border-b border-slate-200/80 bg-white px-2 py-2" style={{ gridTemplateColumns: colTemplate }}>
            <div />
            {cols.map((d) => {
              const state = dayState(d);
              return (
                <button
                  type="button"
                  key={toKey(d)}
                  onClick={() => openDay(d)}
                  className={`flex items-center justify-center gap-2 rounded-xl px-2 py-2 transition-colors cursor-pointer ${
                    state === 'today'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_6px_16px_rgba(37,99,235,0.3)]'
                      : state === 'past'
                        ? 'text-slate-400 hover:bg-slate-100'
                        : 'text-slate-800 hover:bg-blue-50'
                  }`}
                >
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${state === 'today' ? 'text-blue-100' : ''}`}>
                    {d.toLocaleDateString('en-US', { weekday: cols.length === 1 ? 'long' : 'short' })}
                  </span>
                  <span className={`text-xl leading-none ${state === 'past' ? 'font-medium' : 'font-bold'}`}>{d.getDate()}</span>
                </button>
              );
            })}
          </div>

          {/* All-day row (Todos have a date but no time) */}
          <div className="grid border-b border-slate-200/80 bg-slate-50/50" style={{ gridTemplateColumns: colTemplate }}>
            <div className="flex items-center justify-end px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">All day</div>
            {cols.map((d) => {
              const state = dayState(d);
              const allDay = (eventsByDate[toKey(d)] || []).filter((ev) => parseTimeToMinutes(ev.time) === null);
              return (
                <div
                  key={toKey(d)}
                  className={`min-h-[38px] space-y-1 border-l border-slate-200/70 p-1 ${state === 'today' ? 'bg-blue-50/60' : ''}`}
                >
                  {allDay.map((ev) => renderChip(ev, state === 'past', true))}
                </div>
              );
            })}
          </div>

          {/* Hours */}
          <div ref={gridScrollRef} className="relative flex-1 min-h-0 overflow-y-auto">
            <div className="relative grid" style={{ gridTemplateColumns: colTemplate, height: 24 * HOUR_HEIGHT }}>
              {/* Hour labels */}
              <div className="relative">
                {Array.from({ length: 24 }, (_, h) => (
                  <div
                    key={h}
                    className="absolute right-2.5 -translate-y-1/2 text-[10.5px] font-medium text-slate-400"
                    style={{ top: h * HOUR_HEIGHT }}
                  >
                    {h === 0 ? '' : formatHour(h)}
                  </div>
                ))}
              </div>

              {cols.map((d) => {
                const state = dayState(d);
                const weekend = d.getDay() === 0 || d.getDay() === 6;
                const timed = (eventsByDate[toKey(d)] || []).filter((ev) => parseTimeToMinutes(ev.time) !== null);
                return (
                  <div
                    key={toKey(d)}
                    onDoubleClick={() => state !== 'past' && openComposer(d)}
                    className={`relative border-l border-slate-200/70 ${
                      state === 'past' ? 'bg-slate-50' : state === 'today' ? 'bg-blue-50/25' : weekend ? 'bg-indigo-50/25' : 'bg-white'
                    }`}
                  >
                    {/* hour + half-hour lines */}
                    {Array.from({ length: 24 }, (_, h) => (
                      <React.Fragment key={h}>
                        <div className="absolute inset-x-0 border-t border-slate-200/70" style={{ top: h * HOUR_HEIGHT }} />
                        <div className="absolute inset-x-0 border-t border-dashed border-slate-100" style={{ top: h * HOUR_HEIGHT + HOUR_HEIGHT / 2 }} />
                      </React.Fragment>
                    ))}

                    {/* Today: shade the part of the day that has passed */}
                    {state === 'today' && (
                      <div
                        className="pointer-events-none absolute inset-x-0 top-0 bg-slate-100/60"
                        style={{ height: (nowMinutes / 60) * HOUR_HEIGHT }}
                      />
                    )}

                    {timed.map((ev) => {
                      const start = parseTimeToMinutes(ev.time) as number;
                      const isPast = state === 'past' || (state === 'today' && start + 30 < nowMinutes);
                      return (
                        <div key={ev.id} className="absolute inset-x-1" style={{ top: (start / 60) * HOUR_HEIGHT + 2, height: HOUR_HEIGHT - 4 }}>
                          {renderChip(ev, isPast)}
                        </div>
                      );
                    })}

                    {/* Current time line (Teams-style red line) */}
                    {state === 'today' && (
                      <div className="pointer-events-none absolute inset-x-0 z-10" style={{ top: (nowMinutes / 60) * HOUR_HEIGHT }}>
                        <div className="relative h-[2px] bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]">
                          <span className="absolute -left-[6px] -top-[5px] h-3 w-3 rounded-full border-2 border-white bg-rose-500 shadow" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const todayLong = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-2 backdrop-blur-sm animate-in fade-in duration-200 sm:p-5"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Calendar"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full max-h-[920px] w-full max-w-[1440px] flex-col overflow-hidden rounded-[22px] border border-white/60 bg-white text-slate-800 shadow-[0_30px_80px_rgba(15,23,42,0.35)] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-[#1E3A8A] via-blue-600 to-indigo-600 px-4 py-3.5 text-white sm:px-6">
          {/* soft decorative glows */}
          <span className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <span className="pointer-events-none absolute left-1/3 -bottom-20 h-40 w-40 rounded-full bg-sky-300/20 blur-2xl" />

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold leading-tight sm:text-lg">Calendar</h3>
                <p className="truncate text-xs text-blue-100">Today is {todayLong}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onAddEvent && (
                <button
                  type="button"
                  onClick={() => openComposer()}
                  aria-label="New event"
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-white px-2.5 py-2 text-xs font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50 sm:px-3.5 lg:hidden cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New event</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white cursor-pointer"
                aria-label="Close calendar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {renderSidebar()}

          <div className="flex min-w-0 flex-1 flex-col">
            {/* Toolbar */}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 px-3 py-2.5 sm:px-4">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCursor(new Date())}
                  className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-colors hover:border-blue-300 hover:text-blue-700 cursor-pointer"
                >
                  Today
                </button>
                <div className="flex items-center rounded-full border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                  <button type="button" onClick={() => go(-1)} aria-label="Previous" className="rounded-l-full p-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="h-4 w-px bg-slate-200" />
                  <button type="button" onClick={() => go(1)} aria-label="Next" className="rounded-r-full p-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <span className="ml-1.5 text-[15px] font-bold tracking-tight text-slate-900 sm:text-lg" aria-live="polite">{title}</span>
              </div>

              <div role="tablist" aria-label="Calendar view" className="flex rounded-full bg-slate-100 p-1 text-xs font-semibold">
                {(['day', 'week', 'month'] as ViewMode[]).map((v) => (
                  <button
                    key={v}
                    role="tab"
                    type="button"
                    aria-selected={view === v}
                    onClick={() => setView(v)}
                    className={`rounded-full px-3.5 py-1.5 capitalize transition-all cursor-pointer ${
                      view === v ? 'bg-white text-blue-700 shadow-[0_1px_4px_rgba(15,23,42,0.12)]' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick "New event" composer */}
            {composerOpen && (
              <form
                onSubmit={saveDraft}
                className="flex shrink-0 flex-wrap items-center gap-2 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50/60 px-3 py-2.5 sm:px-4"
              >
                <input
                  autoFocus
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="Add a title"
                  aria-label="Event title"
                  className="h-9 min-w-[180px] flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <input
                  type="date"
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                  aria-label="Event date"
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setComposerOpen(false)}
                  className="h-9 rounded-xl px-3 text-xs font-semibold text-slate-600 hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
                {composerError && <span className="w-full text-xs font-medium text-rose-600">{composerError}</span>}
              </form>
            )}

            {/* Body — keyed so switching view/period fades in */}
            <div key={`${view}-${toKey(view === 'month' ? new Date(cursor.getFullYear(), cursor.getMonth(), 1) : cursor)}`} className="flex-1 min-h-0 animate-in fade-in duration-200">
              {view === 'month' ? renderMonth() : renderTimeGrid()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
