// changes done by vb: "View MOM" rebuilt as a Minutes-of-Meeting viewer (replaces the earlier
// project-structure tree). Read-only for the customer: the admin records what was discussed
// (changes to locations, tasks, etc.) and the customer sees the latest saved minutes.
// Layout follows the MOM template: Basic details → Attendees → Discussion → Action items → Close.
// Data comes only from the backend (see services/mom.service.ts) — no mock data.
import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  FileText,
  ClipboardList,
  Users,
  MessageSquareText,
  ListChecks,
  CalendarClock,
  CalendarDays,
  UserCheck,
  UserX,
  Loader2,
  AlertCircle,
  Lock,
  FolderKanban,
  Layers,
  Flag,
  SquareCheckBig,
  PenLine,
  Video,
} from 'lucide-react';
import { ProjectItem } from '../../types';
import { getProjectMoms, MomUnavailableError, ProjectMom } from '../../services/mom.service';
import { parseUiDate, isOverdue } from '../../utils/overdue';

interface ProjectMomModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem;
}

const fmtDate = (v?: string, withWeekday = false) => {
  const d = parseUiDate(v || '');
  if (!d) return v || '—';
  return d.toLocaleDateString('en-GB', {
    ...(withWeekday ? { weekday: 'short' as const } : {}),
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';

// Action-item statuses that mean "finished" (MOM uses Done/Closed/Resolved as well as Completed)
const FINISHED = ['done', 'completed', 'complete', 'closed', 'resolved', 'fulfilled', 'cancelled', 'canceled'];
const isFinished = (status: string) => FINISHED.includes(status.trim().toLowerCase());
/** Overdue only when the due date has passed AND the item isn't finished */
const isActionOverdue = (dueDate: string, status: string) => !isFinished(status) && isOverdue(dueDate, status);

const statusTone = (status: string, overdue: boolean) => {
  const s = status.trim().toLowerCase();
  if (['done', 'completed', 'complete', 'closed', 'resolved', 'fulfilled'].includes(s))
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (s === 'cancelled' || s === 'canceled') return 'bg-slate-100 text-slate-600 ring-slate-200';
  if (overdue) return 'bg-rose-50 text-rose-700 ring-rose-200';
  if (s === 'in progress' || s === 'ongoing') return 'bg-blue-50 text-blue-700 ring-blue-200';
  return 'bg-amber-50 text-amber-700 ring-amber-200';
};

/** Section wrapper — mirrors the bold headings of the MOM template */
const Section: React.FC<{ icon: React.ElementType; title: string; tone: string; children: React.ReactNode }> = ({
  icon: Icon,
  title,
  tone,
  children,
}) => (
  <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5">
    <h4 className="mb-3 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-slate-800">
      <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="h-4 w-4" />
      </span>
      {title}
    </h4>
    {children}
  </section>
);

const Field: React.FC<{ icon: React.ElementType; label: string; value?: string }> = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
    <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
      <Icon className="h-3.5 w-3.5 text-slate-400" />
      {label}
    </div>
    <div className={`mt-1 text-sm font-semibold ${value ? 'text-slate-900' : 'text-slate-400'}`}>{value || '—'}</div>
  </div>
);

const PersonChip: React.FC<{ name: string; present: boolean }> = ({ name, present }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-xs font-medium ring-1 ring-inset ${
      present ? 'bg-emerald-50 text-emerald-800 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-rose-200'
    }`}
  >
    <span
      className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${
        present ? 'bg-emerald-500' : 'bg-rose-400'
      }`}
    >
      {initials(name)}
    </span>
    {name}
  </span>
);

export const ProjectMomModal: React.FC<ProjectMomModalProps> = ({ isOpen, onClose, project }) => {
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable' | 'error'>('loading');
  const [error, setError] = useState('');
  const [moms, setMoms] = useState<ProjectMom[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Load the project's MOMs whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (!project.id) {
      setMoms([]);
      setState('ready');
      return;
    }
    let cancelled = false;
    setState('loading');
    getProjectMoms(project.id)
      .then((list) => {
        if (cancelled) return;
        // newest meeting first
        const sorted = [...list].sort(
          (a, b) => (parseUiDate(b.preparedOn)?.getTime() || 0) - (parseUiDate(a.preparedOn)?.getTime() || 0)
        );
        setMoms(sorted);
        setSelectedId(sorted[0]?.id ?? null);
        setState('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof MomUnavailableError) setState('unavailable');
        else {
          setError(err instanceof Error ? err.message : 'Unable to load meeting minutes.');
          setState('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, project.id]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const selected = useMemo(() => moms.find((m) => m.id === selectedId) || moms[0], [moms, selectedId]);

  if (!isOpen) return null;

  const renderEmpty = (icon: React.ElementType, title: string, body: string, tone = 'text-slate-300') => {
    const Icon = icon;
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100">
          <Icon className={`h-8 w-8 ${tone}`} />
        </div>
        <p className="mt-4 text-base font-semibold text-slate-800">{title}</p>
        <p className="mt-1 max-w-md text-sm text-slate-500">{body}</p>
      </div>
    );
  };

  const renderDetail = (m: ProjectMom) => (
    <div className="space-y-4">
      {/* Title strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-indigo-50 via-white to-blue-50 p-4 ring-1 ring-indigo-100">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">Meeting held on</p>
          <p className="text-lg font-bold text-slate-900">{fmtDate(m.preparedOn, true)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {m.meetingType && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
              <Video className="h-3.5 w-3.5" />
              {m.meetingType}
            </span>
          )}
          {m.updatedAt && (
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
              Updated {fmtDate(m.updatedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Basic details */}
      <Section icon={ClipboardList} title="Basic details" tone="bg-blue-100 text-blue-700">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <Field icon={FolderKanban} label="Project" value={project.name} />
          <Field icon={Layers} label="Phase" value={m.phase} />
          <Field icon={Flag} label="Milestone" value={m.milestone} />
          <Field icon={SquareCheckBig} label="Task" value={m.task} />
          <Field icon={PenLine} label="Prepared by" value={m.preparedBy} />
          <Field icon={CalendarDays} label="Prepared on" value={m.preparedOn ? fmtDate(m.preparedOn) : ''} />
          <Field icon={Video} label="Meeting type" value={m.meetingType} />
        </div>
      </Section>

      {/* Attendees */}
      <Section icon={Users} title="Attendees" tone="bg-emerald-100 text-emerald-700">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <UserCheck className="h-4 w-4" /> Present ({m.present.length})
            </p>
            {m.present.length ? (
              <div className="flex flex-wrap gap-2">
                {m.present.map((n) => <PersonChip key={`p-${n}`} name={n} present />)}
              </div>
            ) : (
              <p className="text-sm text-slate-400">—</p>
            )}
          </div>
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-rose-600">
              <UserX className="h-4 w-4" /> Absent ({m.absent.length})
            </p>
            {m.absent.length ? (
              <div className="flex flex-wrap gap-2">
                {m.absent.map((n) => <PersonChip key={`a-${n}`} name={n} present={false} />)}
              </div>
            ) : (
              <p className="text-sm text-slate-400">None</p>
            )}
          </div>
        </div>
      </Section>

      {/* Discussion details */}
      <Section icon={MessageSquareText} title="Discussion details" tone="bg-violet-100 text-violet-700">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Agenda</p>
            {m.agenda.length ? (
              <ol className="space-y-1.5">
                {m.agenda.map((a, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-slate-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">
                      {i + 1}
                    </span>
                    <span className="leading-snug">{a}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-slate-400">—</p>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Summary</p>
            {m.summary ? (
              <p className="whitespace-pre-line rounded-xl border-l-4 border-violet-400 bg-violet-50/50 px-4 py-3 text-sm leading-relaxed text-slate-700">
                {m.summary}
              </p>
            ) : (
              <p className="text-sm text-slate-400">—</p>
            )}
          </div>
        </div>
      </Section>

      {/* Action items */}
      <Section icon={ListChecks} title={`Action items (${m.actionItems.length})`} tone="bg-amber-100 text-amber-700">
        {m.actionItems.length === 0 ? (
          <p className="text-sm text-slate-400">No action items recorded.</p>
        ) : (
          <>
            {/* Table on larger screens */}
            <div className="hidden overflow-hidden rounded-xl ring-1 ring-slate-200 md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="w-10 px-3 py-2.5">#</th>
                    <th className="px-3 py-2.5">Action</th>
                    <th className="px-3 py-2.5">Owner</th>
                    <th className="px-3 py-2.5">Due date</th>
                    <th className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {m.actionItems.map((a, i) => {
                    const overdue = isActionOverdue(a.dueDate, a.status);
                    return (
                      <tr key={i} className={overdue ? 'bg-rose-50/40' : ''}>
                        <td className="px-3 py-2.5 font-mono text-xs text-slate-400">{i + 1}</td>
                        <td className="px-3 py-2.5 font-medium text-slate-800">{a.action}</td>
                        <td className="px-3 py-2.5">
                          {a.owner ? (
                            <span className="inline-flex items-center gap-2 text-slate-700">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                                {initials(a.owner)}
                              </span>
                              {a.owner}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className={`px-3 py-2.5 whitespace-nowrap ${overdue ? 'font-semibold text-rose-700' : 'text-slate-600'}`}>
                          {a.dueDate ? fmtDate(a.dueDate) : '—'}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${statusTone(a.status, overdue)}`}>
                            {overdue ? 'Overdue' : a.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Cards on phones */}
            <ul className="space-y-2 md:hidden">
              {m.actionItems.map((a, i) => {
                const overdue = isActionOverdue(a.dueDate, a.status);
                return (
                  <li key={i} className={`rounded-xl border p-3 ${overdue ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">
                        <span className="mr-1.5 font-mono text-xs text-slate-400">{i + 1}.</span>
                        {a.action}
                      </p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${statusTone(a.status, overdue)}`}>
                        {overdue ? 'Overdue' : a.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {a.owner || '—'} · Due {a.dueDate ? fmtDate(a.dueDate) : '—'}
                    </p>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Section>

      {/* Close */}
      <Section icon={CalendarClock} title="Close" tone="bg-sky-100 text-sky-700">
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-sky-50 to-white px-4 py-3 ring-1 ring-sky-100">
          <CalendarDays className="h-5 w-5 text-sky-600" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-700">Next meeting</p>
            <p className={`text-sm font-bold ${m.nextMeeting ? 'text-slate-900' : 'text-slate-400'}`}>
              {m.nextMeeting ? fmtDate(m.nextMeeting, true) : 'Not scheduled'}
            </p>
          </div>
        </div>
      </Section>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-2 backdrop-blur-sm sm:p-5" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Minutes of meeting"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full max-h-[920px] w-full max-w-[1240px] flex-col overflow-hidden rounded-[22px] bg-slate-50 shadow-[0_30px_80px_rgba(15,23,42,0.35)]"
      >
        {/* Header */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-[#1E3A8A] via-blue-600 to-indigo-600 px-4 py-4 text-white sm:px-6">
          <span className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold leading-tight">Minutes of Meeting</h3>
                <p className="truncate text-xs text-blue-100">
                  {project.name || 'Project'}
                  {state === 'ready' && ` · ${moms.length} meeting${moms.length === 1 ? '' : 's'}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-blue-50 ring-1 ring-white/20 sm:inline-flex">
                <Lock className="h-3.5 w-3.5" />
                Read-only · updated by your PseudoTeam admin
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-xl p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1">
          {state === 'loading' && (
            <div className="flex flex-1 flex-col items-center justify-center text-slate-500">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
              <p className="mt-2 text-sm">Loading meeting minutes…</p>
            </div>
          )}

          {state === 'unavailable' && (
            <div className="flex-1">
              {renderEmpty(
                FileText,
                'No meeting minutes yet',
                'Minutes from your project meetings will appear here once your PseudoTeam admin records them — including any changes agreed to locations, milestones or tasks.'
              )}
            </div>
          )}

          {state === 'error' && (
            <div className="flex-1">{renderEmpty(AlertCircle, 'Couldn’t load meeting minutes', error, 'text-rose-400')}</div>
          )}

          {state === 'ready' && moms.length === 0 && (
            <div className="flex-1">
              {renderEmpty(
                FileText,
                'No meeting minutes yet',
                'Minutes from your project meetings will appear here once your PseudoTeam admin records them.'
              )}
            </div>
          )}

          {state === 'ready' && moms.length > 0 && selected && (
            <>
              {/* Meeting list */}
              <aside className="hidden w-[280px] shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-3 lg:block">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Meetings</p>
                <ul className="space-y-1.5">
                  {moms.map((m, i) => {
                    const d = parseUiDate(m.preparedOn);
                    const active = m.id === selected.id;
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(m.id)}
                          className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors cursor-pointer ${
                            active ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg ${
                              active ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span className="text-[9px] font-semibold uppercase leading-none opacity-80">
                              {d ? d.toLocaleDateString('en-GB', { month: 'short' }) : '—'}
                            </span>
                            <span className="text-base font-bold leading-tight">{d ? d.getDate() : '?'}</span>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span className="truncate text-[13px] font-semibold text-slate-900">
                                {m.meetingType || 'Meeting'}
                              </span>
                              {i === 0 && (
                                <span className="rounded-full bg-emerald-100 px-1.5 py-px text-[9px] font-bold uppercase text-emerald-700">
                                  Latest
                                </span>
                              )}
                            </span>
                            <span className="block truncate text-[11px] text-slate-500">
                              {m.agenda[0] || m.summary || 'Minutes recorded'}
                            </span>
                            <span className="block text-[10.5px] text-slate-400">
                              {m.actionItems.length} action item{m.actionItems.length === 1 ? '' : 's'}
                              {m.preparedBy ? ` · ${m.preparedBy}` : ''}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </aside>

              {/* Selected meeting */}
              <div className="flex min-w-0 flex-1 flex-col">
                {/* Meeting picker for small screens */}
                <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:hidden">
                  {moms.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedId(m.id)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                        m.id === selected.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {fmtDate(m.preparedOn)}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto p-3 sm:p-5">{renderDetail(selected)}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
