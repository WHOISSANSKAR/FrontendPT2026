// changes done by vb: shared "is this overdue?" helpers for locations, milestones and tasks.
// Overdue = the end date is before today AND the item is not completed.
import type { LocationMilestone, MilestoneTask, ProjectLocation } from '../types';

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
};

/** Parse the date strings the UI uses: "20 Dec 2026", "2026-12-20", "20-12-2026", "20/12/2026". */
export const parseUiDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const v = String(value).trim();
  if (!v || v === '—') return null;

  let m = v.match(/^(\d{1,2})\s+([A-Za-z]{3,})\.?,?\s+(\d{4})/); // 20 Dec 2026
  if (m && MONTHS[m[2].slice(0, 4).toLowerCase()] !== undefined) {
    return new Date(Number(m[3]), MONTHS[m[2].slice(0, 4).toLowerCase()], Number(m[1]));
  }
  if (m && MONTHS[m[2].slice(0, 3).toLowerCase()] !== undefined) {
    return new Date(Number(m[3]), MONTHS[m[2].slice(0, 3).toLowerCase()], Number(m[1]));
  }
  m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); // 2026-12-20
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  m = v.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/); // 20-12-2026 / 20/12/2026
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));

  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const DONE = new Set(['completed', 'complete', 'fulfilled', 'fullfilled', 'delivered']);

export const isDoneStatus = (status?: string | null, progress?: number) =>
  DONE.has(String(status || '').trim().toLowerCase()) || Number(progress) >= 100;

/** True when endDate is before today (midnight) and the item isn't done. */
export const isOverdue = (endDate?: string | null, status?: string | null, progress?: number, today = new Date()) => {
  if (isDoneStatus(status, progress)) return false;
  const end = parseUiDate(endDate);
  if (!end) return false;
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return end.getTime() < startOfToday.getTime();
};

export const isTaskOverdue = (t: MilestoneTask) => isOverdue(t.endDate, t.status, t.progress);

/** A milestone is overdue if its own end date passed while unfinished, or any of its tasks is overdue. */
export const isMilestoneOverdue = (m: LocationMilestone) =>
  isOverdue(m.endDate, m.status, m.progress) || (m.tasks || []).some(isTaskOverdue);

/** A location is overdue if its end date passed while unfinished, or any milestone/task inside is overdue. */
export const isLocationOverdue = (l: ProjectLocation) =>
  isOverdue(l.endDate, l.status, l.progress) || (l.milestones || []).some(isMilestoneOverdue);

/** Count of overdue milestones + tasks in a location (for tooltips). */
export const countOverdueInLocation = (l: ProjectLocation) => {
  let milestones = 0;
  let tasks = 0;
  (l.milestones || []).forEach((m) => {
    if (isOverdue(m.endDate, m.status, m.progress)) milestones++;
    tasks += (m.tasks || []).filter(isTaskOverdue).length;
  });
  return { milestones, tasks };
};
