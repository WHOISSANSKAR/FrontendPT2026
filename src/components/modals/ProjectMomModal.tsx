// changes done by vb: new "View MOM" modal — a collapsible tree of the project structure:
// Project → Locations → Milestones → Tasks. Each level has its own colour.
// Uses the project data already loaded on the Project Tracking page (no extra API calls).
import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  ChevronRight,
  FolderKanban,
  MapPin,
  Flag,
  ListChecks,
  ChevronsDownUp,
  ChevronsUpDown,
  CalendarRange,
} from 'lucide-react';
import { ProjectItem } from '../../types';

interface ProjectMomModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem;
}

// Colour theme per tree level
const LEVEL = {
  project: {
    card: 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-transparent shadow-[0_10px_24px_rgba(37,99,235,0.28)]',
    icon: 'bg-white/20 text-white ring-1 ring-white/30',
    meta: 'text-blue-100',
    bar: 'bg-white/25',
    fill: 'bg-white',
    line: 'border-blue-300',
  },
  location: {
    card: 'bg-emerald-50 border-emerald-200 hover:border-emerald-300 text-emerald-950',
    icon: 'bg-emerald-500 text-white',
    meta: 'text-emerald-700/80',
    bar: 'bg-emerald-100',
    fill: 'bg-emerald-500',
    line: 'border-emerald-300',
  },
  milestone: {
    card: 'bg-amber-50 border-amber-200 hover:border-amber-300 text-amber-950',
    icon: 'bg-amber-500 text-white',
    meta: 'text-amber-700/80',
    bar: 'bg-amber-100',
    fill: 'bg-amber-500',
    line: 'border-amber-300',
  },
  task: {
    card: 'bg-violet-50 border-violet-200 text-violet-950',
    icon: 'bg-violet-500 text-white',
    meta: 'text-violet-700/80',
    bar: 'bg-violet-100',
    fill: 'bg-violet-500',
    line: 'border-violet-300',
  },
} as const;

const statusPill = (status?: string) => {
  const s = (status || '').toLowerCase();
  if (s === 'completed') return 'bg-emerald-600 text-white';
  if (s === 'in progress') return 'bg-blue-600 text-white';
  if (s === 'at risk' || s === 'critical') return 'bg-rose-600 text-white';
  if (s === 'on hold') return 'bg-slate-600 text-white';
  return 'bg-white text-slate-600 ring-1 ring-inset ring-slate-300';
};

const pct = (n: number | undefined) => Math.max(0, Math.min(100, Math.round(Number(n || 0))));

/** One coloured box in the tree */
const NodeCard: React.FC<{
  level: keyof typeof LEVEL;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  status?: string;
  progress?: number;
  count?: { n: number; label: string };
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}> = ({ level, icon: Icon, title, subtitle, status, progress, count, expandable, expanded, onToggle }) => {
  const theme = LEVEL[level];
  const Tag = expandable ? 'button' : 'div';
  return (
    <Tag
      {...(expandable ? { type: 'button', onClick: onToggle, 'aria-expanded': expanded } : {})}
      className={`group flex w-full items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left transition-all sm:gap-3 sm:px-3 ${theme.card} ${
        expandable ? 'cursor-pointer hover:-translate-y-px hover:shadow-md' : ''
      }`}
    >
      {/* changes done by vb: chevron only on expandable boxes (no empty spacer on tasks) */}
      {expandable && (
        <ChevronRight
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''} ${level === 'project' ? 'text-white/80' : 'opacity-60'}`}
        />
      )}
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${theme.icon}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        {/* changes done by vb: titles wrap to 2 lines instead of being cut off */}
        <span className="line-clamp-2 text-sm font-semibold leading-snug">{title}</span>
        {subtitle && (
          <span className={`mt-0.5 flex items-start gap-1 text-[11px] leading-snug ${theme.meta}`}>
            <CalendarRange className="mt-px h-3 w-3 shrink-0" />
            <span>{subtitle}</span>
          </span>
        )}
      </span>

      {typeof progress === 'number' && (
        <span className="hidden w-28 shrink-0 items-center gap-2 sm:flex">
          <span className={`h-1.5 flex-1 overflow-hidden rounded-full ${theme.bar}`}>
            <span className={`block h-full rounded-full ${theme.fill}`} style={{ width: `${pct(progress)}%` }} />
          </span>
          <span className="w-9 text-right font-mono text-[11px] font-semibold">{pct(progress)}%</span>
        </span>
      )}
      {count && (
        <span
          className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold sm:inline ${
            level === 'project' ? 'bg-white/20 text-white' : 'bg-white/80 text-slate-700 ring-1 ring-inset ring-black/5'
          }`}
        >
          {count.n} {count.label}
        </span>
      )}
      {status && (
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${level === 'project' ? 'bg-white/20 text-white' : statusPill(status)}`}>
          {status}
        </span>
      )}
    </Tag>
  );
};

/** Indented children with a tree connector line in the parent's colour */
const Branch: React.FC<{ lineClass: string; children: React.ReactNode }> = ({ lineClass, children }) => (
  // changes done by vb: tighter indent on small screens so deep levels keep room for text
  <ul className={`ml-3 mt-2 space-y-2 border-l-2 border-dashed pl-3 sm:ml-[26px] sm:pl-5 ${lineClass}`}>{children}</ul>
);

const Leaf: React.FC<{ lineClass: string; children: React.ReactNode }> = ({ lineClass, children }) => (
  <li className="relative">
    {/* horizontal elbow from the branch line to this node */}
    <span className={`absolute -left-3 top-[22px] w-3 border-t-2 border-dashed sm:-left-5 sm:w-5 ${lineClass}`} />
    {children}
  </li>
);

export const ProjectMomModal: React.FC<ProjectMomModalProps> = ({ isOpen, onClose, project }) => {
  const [openNodes, setOpenNodes] = useState<Set<string>>(() => new Set(['project']));

  // All expandable node ids (for Expand all)
  const allIds = useMemo(() => {
    const ids = ['project'];
    (project.locations || []).forEach((l) => {
      ids.push(`loc-${l.id}`);
      (l.milestones || []).forEach((m) => ids.push(`ms-${l.id}-${m.id}`));
    });
    return ids;
  }, [project]);

  useEffect(() => {
    if (isOpen) setOpenNodes(new Set(['project']));
  }, [isOpen, project.id]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggle = (id: string) =>
    setOpenNodes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const locations = project.locations || [];
  const totalMilestones = locations.reduce((n, l) => n + (l.milestones?.length || 0), 0);
  const totalTasks = locations.reduce(
    (n, l) => n + (l.milestones || []).reduce((m, ms) => m + (ms.tasks?.length || 0), 0),
    0
  );
  const allOpen = openNodes.size >= allIds.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-2 backdrop-blur-sm sm:p-5"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Project MOM structure"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full max-h-[880px] w-full max-w-[980px] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.35)]"
      >
        {/* Header */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-[#1E3A8A] via-blue-600 to-indigo-600 px-4 py-4 text-white sm:px-6">
          <span className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-bold leading-tight">MOM — Project Structure</h3>
              <p className="mt-0.5 truncate text-xs text-blue-100">
                {project.name} · {locations.length} location{locations.length === 1 ? '' : 's'} · {totalMilestones} milestones · {totalTasks} tasks
              </p>
            </div>
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

        {/* Toolbar: legend + expand/collapse */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/70 px-4 py-2.5 sm:px-6">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-gradient-to-br from-blue-600 to-indigo-600" /> Project</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-500" /> Location</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-amber-500" /> Milestone</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-violet-500" /> Task</span>
          </div>
          <button
            type="button"
            onClick={() => setOpenNodes(allOpen ? new Set(['project']) : new Set(allIds))}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 cursor-pointer"
          >
            {allOpen ? <ChevronsDownUp className="h-3.5 w-3.5" /> : <ChevronsUpDown className="h-3.5 w-3.5" />}
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5">
          <NodeCard
            level="project"
            icon={FolderKanban}
            title={project.name}
            subtitle={`${project.startDate} → ${project.expectedCompletion}`}
            progress={project.progress}
            count={{ n: locations.length, label: locations.length === 1 ? 'location' : 'locations' }}
            status={project.status}
            expandable
            expanded={openNodes.has('project')}
            onToggle={() => toggle('project')}
          />

          {openNodes.has('project') && (
            locations.length === 0 ? (
              <p className="ml-12 mt-3 text-sm text-slate-500">No locations have been added to this project yet.</p>
            ) : (
              <Branch lineClass={LEVEL.project.line}>
                {locations.map((loc) => {
                  const locId = `loc-${loc.id}`;
                  const milestones = loc.milestones || [];
                  const place = [loc.city, loc.state, loc.country].filter(Boolean).join(', ');
                  return (
                    <Leaf key={loc.id} lineClass={LEVEL.project.line}>
                      <NodeCard
                        level="location"
                        icon={MapPin}
                        title={place || 'Location'}
                        subtitle={loc.phase ? `Phase: ${loc.phase}` : undefined}
                        progress={loc.progress}
                        count={{ n: milestones.length, label: milestones.length === 1 ? 'milestone' : 'milestones' }}
                        status={loc.status}
                        expandable
                        expanded={openNodes.has(locId)}
                        onToggle={() => toggle(locId)}
                      />

                      {openNodes.has(locId) && (
                        milestones.length === 0 ? (
                          <p className="ml-12 mt-2 text-xs text-slate-500">No milestones yet.</p>
                        ) : (
                          <Branch lineClass={LEVEL.location.line}>
                            {milestones.map((ms) => {
                              const msId = `ms-${loc.id}-${ms.id}`;
                              const tasks = ms.tasks || [];
                              return (
                                <Leaf key={ms.id} lineClass={LEVEL.location.line}>
                                  <NodeCard
                                    level="milestone"
                                    icon={Flag}
                                    title={ms.name}
                                    subtitle={`${ms.startDate} → ${ms.endDate}`}
                                    progress={ms.progress}
                                    count={{ n: tasks.length, label: tasks.length === 1 ? 'task' : 'tasks' }}
                                    status={ms.status}
                                    expandable
                                    expanded={openNodes.has(msId)}
                                    onToggle={() => toggle(msId)}
                                  />

                                  {openNodes.has(msId) && (
                                    tasks.length === 0 ? (
                                      <p className="ml-12 mt-2 text-xs text-slate-500">No tasks yet.</p>
                                    ) : (
                                      <Branch lineClass={LEVEL.milestone.line}>
                                        {tasks.map((t) => (
                                          <Leaf key={t.id} lineClass={LEVEL.milestone.line}>
                                            <NodeCard
                                              level="task"
                                              icon={ListChecks}
                                              title={t.name}
                                              subtitle={`${t.startDate} → ${t.endDate}`}
                                              progress={t.progress}
                                              status={t.status}
                                            />
                                          </Leaf>
                                        ))}
                                      </Branch>
                                    )
                                  )}
                                </Leaf>
                              );
                            })}
                          </Branch>
                        )
                      )}
                    </Leaf>
                  );
                })}
              </Branch>
            )
          )}
        </div>
      </div>
    </div>
  );
};
