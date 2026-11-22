import React from 'react';
import { ArrowRight, X } from 'lucide-react';
import { ProjectItem } from '../types';

interface RecentProjectsTableProps {
  title?: string;
  projects: ProjectItem[];
  onSelectProject: (projectId: string) => void;
  onViewAll?: () => void;
  onUploadProject?: () => void;
  onGenerateReport?: (project: ProjectItem) => void;
  activeFilterLabel?: string | null;
  onClearFilter?: () => void;
}

export const RecentProjectsTable: React.FC<RecentProjectsTableProps> = ({
  title = 'Projects',
  projects,
  onSelectProject,
  onViewAll,
  activeFilterLabel,
  onClearFilter
}) => {
  // changes done by vb: empty-state text — names the active filter, or a plain "No projects found."
  const emptyMessage = activeFilterLabel
    ? `No “${activeFilterLabel}” projects found.`
    : 'No projects found.';

  // changes done by vb: customer column shows only the first name (full name on hover)
  const firstName = (full: string) => (full || '').trim().split(/\s+/)[0] || '—';

  // changes done by vb: show at most the first 2 words of a project name, then "..."
  const shortName = (name: string) => {
    const words = (name || '').trim().split(/\s+/).filter(Boolean);
    return words.length > 2 ? `${words.slice(0, 2).join(' ')}...` : words.join(' ');
  };

  // changes done by vb: "Updated" shows only the date as dd/mm/yyyy (no time).
  // Handles "YYYY-MM-DD[ HH:MM:SS]", "DD-MM-YYYY[ ...]", "DD/MM/YYYY" and other parseable dates.
  const formatUpdatedDate = (value?: string) => {
    if (!value) return '—';
    const v = value.trim();
    const pad = (n: number | string) => String(n).padStart(2, '0');
    let m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return `${pad(m[3])}/${pad(m[2])}/${m[1]}`;
    m = v.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (m) return `${pad(m[1])}/${pad(m[2])}/${m[3]}`;
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    return v;
  };

  // Parse date strings reliably across ISO, YYYY-MM-DD, and DD/MM/YYYY formats
  const parseDateValue = (value?: string | null): Date | null => {
    if (!value) return null;
    const v = String(value).trim();
    if (!v) return null;

    let m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) {
      return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 23, 59, 59, 999);
    }

    m = v.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (m) {
      return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), 23, 59, 59, 999);
    }

    const parsed = new Date(v);
    if (!Number.isNaN(parsed.getTime())) {
      parsed.setHours(23, 59, 59, 999);
      return parsed;
    }

    return null;
  };

  // Check if a target end date has passed (ignoring Completed / Delivered / Cancelled items)
  const isDateOverdue = (dateStr?: string | null, status?: string): boolean => {
    const normalizedStatus = (status || '').toLowerCase();
    if (
      normalizedStatus === 'completed' ||
      normalizedStatus === 'delivered' ||
      normalizedStatus === 'cancelled'
    ) {
      return false;
    }

    const dueEnd = parseDateValue(dateStr);
    if (!dueEnd) return false;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return dueEnd.getTime() < todayStart.getTime();
  };

  // Red dot indicator: any location in the project has crossed its end date
  const hasOverdueLocation = (project: ProjectItem): boolean => {
    const locations = project.locations || [];
    return locations.some((loc: any) =>
      isDateOverdue(
        loc.expectedCompletion || loc.endDate || loc.dueDate || loc.targetDate,
        loc.status
      )
    );
  };

  // Red outline indicator: the project itself has crossed its end date
  const isProjectOverdue = (project: ProjectItem): boolean =>
    isDateOverdue(
      project.expectedCompletion || (project as any).endDate,
      project.status
    );

  const getInitials = (project: ProjectItem) => {
    if (project.code && project.code.length <= 4) {
      return project.code;
    }
    const words = project.name.split(' ').filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return project.name.slice(0, 2).toUpperCase();
  };

  const getBadgeStyle = (code: string) => {
    switch (code) {
      case 'PA':
        return 'bg-blue-50 text-blue-600';
      case 'PB':
        return 'bg-indigo-50 text-indigo-600';
      case 'PG':
        return 'bg-emerald-50 text-emerald-600';
      case 'PD':
        return 'bg-rose-50 text-rose-600';
      case 'PAX':
        return 'bg-amber-50 text-amber-600';
      case 'DAU':
        return 'bg-sky-50 text-sky-600';
      case 'APT':
        return 'bg-cyan-50 text-cyan-600';
      case 'CSG':
        return 'bg-teal-50 text-teal-600';
      case 'JFM':
        return 'bg-violet-50 text-violet-600';
      case 'MLE':
        return 'bg-blue-50 text-blue-700';
      case 'BPM':
        return 'bg-emerald-50 text-emerald-700';
      case 'PMI':
        return 'bg-indigo-50 text-indigo-700';
      case 'GWA':
        return 'bg-amber-50 text-amber-700';
      case 'KRF':
        return 'bg-purple-50 text-purple-700';
      case 'CRI':
        return 'bg-emerald-50 text-emerald-700';
      case 'HID':
        return 'bg-teal-50 text-teal-700';
      case 'NDU':
        return 'bg-blue-50 text-blue-800';
      case 'GCT':
        return 'bg-rose-50 text-rose-700';
      case 'BCH':
        return 'bg-amber-50 text-amber-700';
      case 'MMS':
        return 'bg-rose-50 text-rose-700';
      default: {
        const hash = code.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const palette = [
          'bg-blue-50 text-blue-600',
          'bg-indigo-50 text-indigo-600',
          'bg-emerald-50 text-emerald-600',
          'bg-amber-50 text-amber-600',
          'bg-purple-50 text-purple-600'
        ];
        return palette[hash % palette.length];
      }
    }
  };

  const renderStatusPill = (status: ProjectItem['status']) => {
    switch (status) {
      case 'In Progress':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200/70">
            In Progress
          </span>
        );
      case 'Completed':
      case 'Delivered':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70">
            {status}
          </span>
        );
      case 'Critical':
      case 'At Risk':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-600 border border-rose-200/70">
            {status}
          </span>
        );
      case 'On Hold':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/70">
            On Hold
          </span>
        );
      case 'Not Started':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/80">
            Not Started
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  // changes done by vb: colour follows the real progress (not just the stored status, which can say
  // "Not Started" while work is underway). Risk / hold states keep their warning colours.
  const getProgressBarColor = (status: ProjectItem['status'], progress: number = 0) => {
    if (status === 'Critical' || status === 'At Risk') return 'bg-gradient-to-r from-rose-500 to-orange-400';
    if (status === 'On Hold') return 'bg-gradient-to-r from-amber-500 to-yellow-400';
    if (progress >= 100 || status === 'Completed' || status === 'Delivered') return 'bg-gradient-to-r from-emerald-500 to-teal-400';
    return 'bg-gradient-to-r from-blue-600 to-cyan-400';
  };

  // changes done by vb: tidy percentage label (37.5% stays, 40.0 -> 40%)
  const formatPct = (n: number) => `${Math.round((Number(n) || 0) * 10) / 10}%`;

  return (
    <div 
      id="recent-projects-card"
      className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-3 flex flex-col h-full overflow-hidden"
    >
      {/* 1. Header with Title, Count Badge, Active Filter Badge (if active), and View All */}
      <div className="flex items-center justify-between pb-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight shrink-0">
            {title}
          </h2>

          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
            {projects.length}
          </span>

          {activeFilterLabel && (
            <span 
              id="recent-projects-filter-badge"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0 animate-in fade-in duration-150"
            >
              <span>{activeFilterLabel}</span>
              <button
                type="button"
                onClick={onClearFilter}
                id="btn-clear-recent-projects-filter"
                className="hover:bg-blue-200/70 rounded-full p-0.5 text-blue-600 hover:text-blue-900 transition-colors cursor-pointer"
                title="Clear filter"
                aria-label="Clear filter"
              >
                <X className="w-3 h-3 stroke-[2.5]" />
              </button>
            </span>
          )}
        </div>

        <button
          onClick={onViewAll}
          id="btn-view-all-recent-projects"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition-colors cursor-pointer shrink-0"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 2. Scrollable Table Container - 100% hidden scrollbar across all OS & browsers */}
      <div 
        id="recent-projects-scroll-container"
        className="flex-1 min-h-0 overflow-y-auto overflow-x-auto no-scrollbar scrollbar-none select-text"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {/* Mobile View (< 640px): Cards */}
        <div className="block sm:hidden space-y-2 pb-1">
          {projects.length > 0 ? (
            projects.map((project) => {
              const badge = getInitials(project);
              const badgeColor = getBadgeStyle(badge);
              const locationOverdue = hasOverdueLocation(project);
              const projectOverdue = isProjectOverdue(project);

              return (
                <div 
                  key={project.id}
                  id={`recent-project-mobile-card-${project.id}`}
                  title={projectOverdue ? 'Project end date has passed' : undefined}
                  className={`p-2.5 rounded-xl transition-colors flex flex-col gap-2 ${
                    projectOverdue
                      ? 'border border-red-500 ring-1 ring-inset ring-red-500 bg-red-50/30 hover:bg-red-50/50'
                      : 'border border-slate-100 bg-slate-50/50 hover:bg-blue-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {locationOverdue && (
                        <span
                          title="One or more locations have passed their end date"
                          aria-label="Location end date overdue"
                          className="w-2 h-2 rounded-full bg-red-500 shrink-0"
                        />
                      )}
                      <div className={`w-6 h-6 rounded-md ${badgeColor} flex items-center justify-center font-bold text-[10px] shrink-0`}>
                        {badge}
                      </div>
                      <span className="font-bold text-slate-900 text-xs truncate" title={project.name}>
                        {shortName(project.name)} {/* changes done by vb */}
                      </span>
                    </div>
                    <div className="shrink-0">
                      {renderStatusPill(project.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[140px]" title={project.customer}>{firstName(project.customer)}</span> {/* changes done by vb: first name only */}
                    <span className="font-mono text-[10px]">{formatUpdatedDate(project.lastUpdated)}</span> {/* changes done by vb */}
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="flex-1 h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(project.status, project.progress)} shadow-[0_0_6px_rgba(37,99,235,0.25)]`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 font-mono">
                      {formatPct(project.progress)} {/* changes done by vb */}
                    </span>
                    <button
                      onClick={() => onSelectProject(project.id)}
                      id={`btn-mobile-view-${project.id}`}
                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors cursor-pointer shrink-0 ml-1"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            // changes done by vb: no "Reset Filter" link; message depends on whether a filter is active
            <div className="py-8 text-center text-slate-400">
              <p className="text-xs font-medium text-slate-500">{emptyMessage}</p>
            </div>
          )}
        </div>

        {/* Tablet & Desktop View (>= 640px): Full Table */}
        <table className="hidden sm:table w-full text-left border-collapse text-xs min-w-[560px]">
          {/* Sticky Table Header */}
          <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_0_#F1F5F9]">
            <tr className="text-slate-400 font-semibold text-[11px] border-b border-slate-100 bg-white">
              <th className="pb-2 pt-1 pr-2 font-semibold bg-white w-44">Project</th>
              {/* changes done by vb: every column except Project is centre-aligned */}
              <th className="pb-2 pt-1 px-2 font-semibold bg-white w-28 text-center">Customer</th>
              <th className="pb-2 pt-1 px-2 font-semibold bg-white w-24 text-center">Status</th>
              <th className="pb-2 pt-1 px-2 font-semibold bg-white w-32 text-center">Progress</th>
              <th className="pb-2 pt-1 px-2 font-semibold bg-white w-24 text-center">Updated</th>
              <th className="pb-2 pt-1 font-semibold bg-white text-center w-16">Action</th>
            </tr>
          </thead>

          {/* Scrollable Project Rows */}
          <tbody className="divide-y divide-slate-50">
            {projects.length > 0 ? (
              projects.map((project) => {
                const badge = getInitials(project);
                const badgeColor = getBadgeStyle(badge);
                const locationOverdue = hasOverdueLocation(project);
                const projectOverdue = isProjectOverdue(project);

                return (
                  <tr 
                    key={project.id}
                    id={`recent-project-row-${project.id}`}
                    title={projectOverdue ? 'Project end date has passed' : undefined}
                    className={`transition-colors h-9 ${
                      projectOverdue
                        ? 'outline outline-1 -outline-offset-1 outline-red-500 rounded-lg bg-red-50/25 hover:bg-red-50/45'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Project name + badge + overdue location red dot */}
                    <td className="py-1.5 pr-2 pl-1.5">
                      <div className="flex items-center gap-2">
                        {locationOverdue && (
                          <span
                            title="One or more locations have passed their end date"
                            aria-label="Location end date overdue"
                            className="w-2 h-2 rounded-full bg-red-500 shrink-0"
                          />
                        )}
                        <div className={`w-6 h-6 rounded-md ${badgeColor} flex items-center justify-center font-bold text-[10px] shrink-0`}>
                          {badge}
                        </div>
                        <span className="font-bold text-slate-900 text-xs whitespace-nowrap truncate max-w-[160px]" title={project.name}>
                          {shortName(project.name)} {/* changes done by vb: max 2 words, full name on hover */}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-1.5 px-2 text-slate-600 font-normal whitespace-nowrap truncate max-w-[130px] text-center" title={project.customer}>
                      {firstName(project.customer)} {/* changes done by vb: first name only, centred */}
                    </td>

                    {/* Status */}
                    <td className="py-1.5 px-2 whitespace-nowrap text-center"> {/* changes done by vb: centred */}
                      {renderStatusPill(project.status)}
                    </td>

                    {/* Progress bar + percentage */}
                    <td className="py-1.5 px-2">
                      {/* changes done by vb: percentage stacked above the bar, both centred on the column */}
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-[11px] font-semibold text-slate-700 font-mono leading-none">
                          {formatPct(project.progress)}
                        </span>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(project.status, project.progress)} shadow-[0_0_6px_rgba(37,99,235,0.25)]`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Updated */}
                    <td className="py-1.5 px-2 text-slate-500 text-[11px] whitespace-nowrap text-center">
                      {formatUpdatedDate(project.lastUpdated)} {/* changes done by vb: date only, dd/mm/yyyy */}
                    </td>

                    {/* Action Button */}
                    <td className="py-1.5 pr-1.5 text-center whitespace-nowrap"> {/* changes done by vb: centred */}
                      <button
                        onClick={() => onSelectProject(project.id)}
                        id={`btn-view-${project.id}`}
                        className="px-2.5 py-0.5 text-[11px] font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-100 hover:text-blue-700 rounded transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">
                  {/* changes done by vb: no "Reset Filter" link; message depends on whether a filter is active */}
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <p className="text-xs font-medium text-slate-500">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};