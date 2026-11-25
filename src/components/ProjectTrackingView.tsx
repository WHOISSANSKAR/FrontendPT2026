import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  FileText,
  Ticket,
  PackagePlus,
  Search,
  Check,
  Globe,
  Eye,
  FolderOpen,
  ClipboardList,
  Upload
} from 'lucide-react';
import { ProjectItem, ProjectLocation, ProjectStatus } from '../types';
import { ProjectMomModal } from './modals/ProjectMomModal';
import { ProjectDocumentsModal } from './modals/ProjectDocumentsModal';
import {
  getLocationOverdueInfo,
  getProjectOverdueInfo,
  OverdueNavigationTarget,
} from '../utils/overdueHierarchy';
import { OverdueDot } from './OverdueDot';

interface ProjectTrackingViewProps {
  project?: ProjectItem | null;
  allProjects?: ProjectItem[];
  onSelectProject?: (project: ProjectItem) => void;
  onBackToDashboard: () => void;
  onGenerateReport: (project: ProjectItem) => void;
  onViewTickets: (project: ProjectItem) => void;
  onRequestSpare: () => void;
  onAddLocation: (project: ProjectItem) => void;
  onViewLocationDetails: (location: ProjectLocation) => void;
  onUploadDocs: (project?: ProjectItem) => void;
  onNavigateToOverdueTarget?: (target: OverdueNavigationTarget) => void;
}

const formatTableDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  const parsed = new Date(`${dateStr.split('T')[0]}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const ProjectTrackingView: React.FC<ProjectTrackingViewProps> = ({
  project,
  allProjects,
  onSelectProject,
  onBackToDashboard,
  onGenerateReport,
  onViewTickets,
  onRequestSpare,
  onAddLocation,
  onViewLocationDetails,
  onUploadDocs,
  onNavigateToOverdueTarget,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isMomOpen, setIsMomOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  const activeProject = project ?? allProjects?.[0] ?? null;
  const activeProjectId = activeProject?.id ?? '';

  const selectorProjects = useMemo(() => {
    const sourceList = allProjects ?? [];

    const priorityNames = [
      'Project Alpha',
      'Project Beta',
      'Project Gamma',
      'Project Delta',
      'Project Apex',
      'Project Orion'
    ];

    const ordered: ProjectItem[] = [];

    priorityNames.forEach((name) => {
      const match = sourceList.find(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      );

      if (match && !ordered.some((p) => p.id === match.id)) {
        ordered.push(match);
      }
    });

    sourceList.forEach((p) => {
      if (!ordered.some((existing) => existing.id === p.id)) {
        ordered.push(p);
      }
    });

    return ordered;
  }, [allProjects]);

  const projectScrollRef = useRef<HTMLDivElement>(null);
  const isDraggingProjectRef = useRef(false);
  const startXProjectRef = useRef(0);
  const scrollLeftProjectRef = useRef(0);
  const hasMovedProjectRef = useRef(false);

  const handleProjectWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!projectScrollRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      projectScrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleProjectMouseDown = (e: React.MouseEvent) => {
    if (!projectScrollRef.current) return;
    isDraggingProjectRef.current = true;
    hasMovedProjectRef.current = false;
    startXProjectRef.current = e.pageX - projectScrollRef.current.offsetLeft;
    scrollLeftProjectRef.current = projectScrollRef.current.scrollLeft;
  };

  const handleProjectMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingProjectRef.current || !projectScrollRef.current) return;
    const x = e.pageX - projectScrollRef.current.offsetLeft;
    const walk = x - startXProjectRef.current;
    if (Math.abs(walk) > 4) {
      hasMovedProjectRef.current = true;
      projectScrollRef.current.scrollLeft = scrollLeftProjectRef.current - walk;
    }
  };

  const handleProjectMouseUp = () => {
    isDraggingProjectRef.current = false;
  };

  useEffect(() => {
    if (!projectScrollRef.current || !activeProjectId) return;
    const activeEl = projectScrollRef.current.querySelector<HTMLElement>(
      `#project-pill-${activeProjectId}`
    );
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeProjectId]);

  const projectLocations = activeProject?.locations ?? [];
  const projectProgressValue = activeProject?.progress ?? 0;

  const filteredLocations = useMemo(() => {
    return projectLocations.filter((loc) => {
      const matchesSearch =
        searchQuery === '' ||
        loc.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.phase.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCountry = countryFilter === 'All' || loc.country === countryFilter;
      const matchesStatus = statusFilter === 'All' || loc.status === statusFilter;

      return matchesSearch && matchesCountry && matchesStatus;
    });
  }, [projectLocations, searchQuery, countryFilter, statusFilter]);

  const uniqueCountries = useMemo(() => {
    const set = new Set(projectLocations.map((l) => l.country));
    return ['All', ...Array.from(set)];
  }, [projectLocations]);

  const renderStatusPill = (status: ProjectLocation['status'] | ProjectStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            In Progress
          </span>
        );
      case 'On Hold':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            On Hold
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {status}
          </span>
        );
    }
  };

  const milestones = [
    { percent: 0, label: '0%', title: 'Initiation' },
    { percent: 25, label: '25%', title: 'Planning & Design' },
    { percent: 50, label: '50%', title: 'Implementation' },
    { percent: 75, label: '75%', title: 'Deployment & Commissioning' },
    { percent: 100, label: '100%', title: 'Completion' }
  ];

  return (
    <div
      id="project-tracking-container"
      className="flex-1 min-h-[calc(100dvh-56px)] overflow-y-auto flex flex-col bg-[#F4F6F9] px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 gap-2 sm:gap-2.5 select-none"
    >
      {/* 1. Breadcrumbs + Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={onBackToDashboard}
            id="btn-back-to-projects"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500">Projects</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">
            {activeProject ? activeProject.name : 'No Project Available'}
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
            Project Tracking
          </span>
        </div>

        {activeProject && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              id="btn-view-mom"
              onClick={() => setIsMomOpen(true)}
              className="text-xs font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>View MOM</span>
            </button>
            <button
              id="btn-view-documents"
              onClick={() => setIsDocsOpen(true)}
              className="text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>View Documents</span>
            </button>
          </div>
        )}
      </div>

      {!activeProject ? (
        <div
          id="empty-projects-placeholder"
          className="flex-1 bg-white rounded-xl border border-slate-200/90 flex flex-col items-center justify-center p-8 text-center shadow-2xs min-h-[420px]"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-3">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">
            No project available
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Upload to get started and track project milestones, locations, and progress here.
          </p>
          <button
            type="button"
            id="btn-empty-upload-project"
            onClick={() => onUploadDocs()}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload to get started</span>
          </button>
        </div>
      ) : (
        <>
          {/* 2. Horizontal Project Selector Bar */}
          <div
            id="project-selector-bar"
            className="bg-white rounded-xl border border-slate-200/90 p-1 px-1.5 flex items-center shadow-2xs shrink-0 overflow-hidden w-full"
          >
            <div
              id="project-selector-scroll-container"
              ref={projectScrollRef}
              onWheel={handleProjectWheel}
              onMouseDown={handleProjectMouseDown}
              onMouseMove={handleProjectMouseMove}
              onMouseUp={handleProjectMouseUp}
              onMouseLeave={handleProjectMouseUp}
              className="flex items-center gap-1.5 w-full overflow-x-auto no-scrollbar scrollbar-none flex-nowrap select-none py-0.5 scroll-x-visible"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {selectorProjects.map((p) => {
                const isSelected =
                  p.id === activeProject.id ||
                  p.name.toLowerCase() === activeProject.name.toLowerCase();
                const isCritical =
                  p.status === 'Critical' || p.name.toLowerCase().includes('delta');

                const projInfo = getProjectOverdueInfo(p);
                const hasOverdueTaskOrChild =
                  projInfo.hasOverdueTask ||
                  projInfo.hasOverdueMilestone ||
                  projInfo.hasOverdueLocation;

                return (
                  <button
                    key={p.id}
                    onClick={(e) => {
                      if (hasMovedProjectRef.current) {
                        e.preventDefault();
                        return;
                      }
                      onSelectProject?.(p);
                    }}
                    id={`project-pill-${p.id}`}
                    className={`shrink-0 flex items-center justify-between gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700 ring-2 ring-blue-600/20'
                        : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50/90 border border-slate-200/90 hover:border-slate-300'
                    } ${
                      projInfo.isSelfOverdue
                        ? 'outline outline-2 outline-rose-500'
                        : ''
                    }`}
                  >
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      {hasOverdueTaskOrChild && (
                        <OverdueDot
                          title={
                            projInfo.firstTarget?.label ||
                            `Jump to overdue task in ${p.name}`
                          }
                          onLightBg={!isSelected}
                          onClick={() => {
                            if (projInfo.firstTarget && onNavigateToOverdueTarget) {
                              onNavigateToOverdueTarget(projInfo.firstTarget);
                            } else {
                              onSelectProject?.(p);
                            }
                          }}
                        />
                      )}
                      {isCritical && !hasOverdueTaskOrChild && (
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isSelected ? 'bg-rose-300 ring-2 ring-white/40' : 'bg-rose-500'
                          }`}
                          title="Critical status"
                        />
                      )}
                      <span>{p.name}</span>
                    </span>

                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full shrink-0 leading-none ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : isCritical
                            ? 'bg-rose-50 text-rose-600 border border-rose-200/80'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p.progress}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Project Header Bar */}
          <div className="bg-[#F2F7FF] rounded-xl border border-blue-100 px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs shrink-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                {activeProject.name}
              </h1>
              {renderStatusPill(activeProject.status)}
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {projectProgressValue}% Complete
              </span>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => onGenerateReport(activeProject)}
                id="btn-tracking-generate-report"
                className="text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Generate Report</span>
              </button>

              <button
                onClick={() => onViewTickets(activeProject)}
                id="btn-tracking-view-tickets"
                className="text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Ticket className="w-3.5 h-3.5 text-slate-500" />
                <span>View Tickets</span>
              </button>

              <button
                onClick={onRequestSpare}
                id="btn-tracking-request-spare"
                className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 px-2.5 py-1.5 rounded-lg border border-blue-200/80 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <PackagePlus className="w-3.5 h-3.5" />
                <span>Request Spare</span>
              </button>
            </div>
          </div>

          {/* 4. Project Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 shrink-0">
            <div className="bg-white rounded-xl border border-slate-200/90 py-1.5 px-2.5 shadow-2xs">
              <div className="text-[11px] font-medium text-slate-500">Overall Progress</div>
              <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5 leading-tight">
                {projectProgressValue}%
              </div>
              <div className="text-[10px] text-emerald-600 font-medium truncate">
                {activeProject.velocity}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 py-1.5 px-2.5 shadow-2xs">
              <div className="text-[11px] font-medium text-slate-500">Current Phase</div>
              <div
                className="text-sm font-bold text-slate-900 truncate mt-0.5 leading-tight"
                title={activeProject.currentPhase}
              >
                {activeProject.currentPhase}
              </div>
              <div className="text-[10px] text-blue-600 font-medium truncate">
                Active execution
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 py-1.5 px-2.5 shadow-2xs">
              <div className="text-[11px] font-medium text-slate-500">Locations</div>
              <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5 leading-tight">
                {activeProject.locationsCount}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                Across {activeProject.countriesCount} countries
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 py-1.5 px-2.5 shadow-2xs">
              <div className="text-[11px] font-medium text-slate-500">Milestones</div>
              <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5 leading-tight">
                {activeProject.completedMilestones}/{activeProject.milestonesCount}
              </div>
              <div className="text-[10px] text-indigo-600 font-medium truncate">
                Key checkpoints
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 py-1.5 px-2.5 shadow-2xs">
              <div className="text-[11px] font-medium text-slate-500">Last Updated</div>
              <div className="text-sm font-bold text-slate-900 truncate mt-0.5 leading-tight">
                {activeProject.lastUpdated}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                Synchronized
              </div>
            </div>
          </div>

          {/* 5. Overall Project Progress & Horizontal Lifecycle Timeline */}
          <div className="bg-white rounded-xl border border-slate-200/90 px-4 py-3.5 shadow-2xs shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-900 tracking-tight">
                  Overall Project Progress
                </h2>
                <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                  {projectProgressValue}% Complete
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Target Completion:{' '}
                <span className="font-semibold text-slate-800">
                  {activeProject.expectedCompletion}
                </span>
              </div>
            </div>

            <div className="relative pt-2 pb-1 px-3">
              <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full flex overflow-hidden transition-all duration-500"
                  style={{ width: `${projectProgressValue}%` }}
                >
                  {projectProgressValue > 0 && (
                    <div
                      style={{
                        width: `${Math.min(100, (25 / projectProgressValue) * 100)}%`
                      }}
                      className="h-full bg-sky-200 border-r border-white/40"
                      title="0-25% Initiation"
                    />
                  )}
                  {projectProgressValue > 25 && (
                    <div
                      style={{
                        width: `${
                          (Math.min(50, projectProgressValue) - 25) / projectProgressValue * 100
                        }%`
                      }}
                      className="h-full bg-sky-300 border-r border-white/40"
                      title="25-50% Planning & Design"
                    />
                  )}
                  {projectProgressValue > 50 && (
                    <div
                      style={{
                        width: `${
                          (Math.min(75, projectProgressValue) - 50) / projectProgressValue * 100
                        }%`
                      }}
                      className="h-full bg-blue-400 border-r border-white/40"
                      title="50-75% Implementation"
                    />
                  )}
                  {projectProgressValue > 75 && (
                    <div
                      style={{
                        width: `${((projectProgressValue - 75) / projectProgressValue) * 100}%`
                      }}
                      className="h-full bg-blue-600"
                      title="75-100% Completion"
                    />
                  )}
                </div>
              </div>

              <div className="absolute top-2 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                {milestones.map((m) => {
                  const isCompleted = projectProgressValue >= m.percent && m.percent > 0;
                  const isStart = m.percent === 0;
                  const isCurrent = Math.abs(projectProgressValue - m.percent) <= 12;

                  return (
                    <div
                      key={m.percent}
                      className="flex flex-col items-center -translate-y-1"
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border-2 shadow-xs transition-colors ${
                          isCompleted
                            ? 'bg-blue-600 border-white text-white'
                            : isCurrent
                              ? 'bg-white border-blue-600 text-blue-600 ring-2 ring-blue-100'
                              : isStart
                                ? 'bg-blue-600 border-white text-white'
                                : 'bg-slate-100 border-slate-300 text-slate-400'
                        }`}
                      >
                        {isCompleted || isStart ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between mx-0.5 mt-3 text-[10px] font-semibold text-slate-800">
                {milestones.map((m) => (
                  <div key={m.percent} className="w-5 flex justify-center">
                    <span className="whitespace-nowrap">{m.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Lower Split: Locations & Phases (Left) + Project Information Card (Right) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2.5 min-h-0">
            {/* Left: Locations & Phases Table (8 cols on lg) */}
            <div className="col-span-1 lg:col-span-8 bg-white rounded-xl border border-slate-200/90 flex flex-col h-auto lg:h-full overflow-hidden shadow-2xs min-h-[300px]">
              {/* Header & Filter Controls */}
              <div className="px-3 py-2 border-b border-slate-100 shrink-0 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                      Locations & Phases
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Showing {filteredLocations.length} of {projectLocations.length} locations
                    </span>
                  </div>
                </div>

                {/* Filter Row */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search country, state, city, phase..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 text-xs shrink-0">
                    <span className="text-[11px] font-medium text-slate-500">Country:</span>
                    <select
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                      className="text-xs bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {uniqueCountries.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs shrink-0">
                    <span className="text-[11px] font-medium text-slate-500">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-xs bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="All">All</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto overflow-x-auto no-scrollbar scroll-x-visible">
                {filteredLocations.length > 0 ? (
                  <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-semibold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                        <th className="py-1.5 px-3">Country</th>
                        <th className="py-1.5 px-2.5">State</th>
                        <th className="py-1.5 px-2.5">City</th>
                        <th className="py-1.5 px-3">Phase</th>
                        <th className="py-1.5 px-2.5 whitespace-nowrap">Start Date</th>
                        <th className="py-1.5 px-2.5 whitespace-nowrap">End Date</th>
                        <th className="py-1.5 px-2.5">Status</th>
                        <th className="py-1.5 px-2.5 w-28">Progress</th>
                        <th className="py-1.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLocations.map((loc) => {
                        const locInfo = getLocationOverdueInfo(loc, activeProject.id);
                        const hasOverdueTaskOrMilestone =
                          locInfo.hasOverdueTask || locInfo.hasOverdueMilestone;

                        return (
                          <tr
                            key={loc.id}
                            className={`transition-colors group ${
                              locInfo.isSelfOverdue
                                ? 'bg-rose-50/45 hover:bg-rose-50/80 ring-1 ring-inset ring-rose-500'
                                : 'hover:bg-slate-50/70'
                            }`}
                          >
                            <td className="py-1.5 px-3 font-semibold text-slate-800">
                              <div className="flex items-center gap-2">
                                {hasOverdueTaskOrMilestone && (
                                  <OverdueDot
                                    title={
                                      locInfo.firstTarget?.label ||
                                      `Jump to overdue task in ${loc.city}`
                                    }
                                    onLightBg={true}
                                    onClick={() => {
                                      if (locInfo.firstTarget && onNavigateToOverdueTarget) {
                                        onNavigateToOverdueTarget(locInfo.firstTarget);
                                      } else {
                                        onViewLocationDetails(loc);
                                      }
                                    }}
                                  />
                                )}
                                <span>{loc.country}</span>
                              </div>
                            </td>
                            <td className="py-1.5 px-2.5 text-slate-600">{loc.state}</td>
                            <td
                              className={`py-1.5 px-2.5 font-medium ${
                                locInfo.isSelfOverdue
                                  ? 'text-rose-700 font-semibold'
                                  : 'text-slate-600'
                              }`}
                            >
                              {loc.city}
                            </td>
                            <td className="py-1.5 px-3 font-medium text-slate-800">
                              {loc.phase}
                            </td>
                            <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">
                              {formatTableDate(loc.startDate)}
                            </td>
                            <td
                              className={`py-1.5 px-2.5 whitespace-nowrap ${
                                locInfo.isSelfOverdue
                                  ? 'text-rose-700 font-semibold'
                                  : 'text-slate-600'
                              }`}
                            >
                              {formatTableDate(loc.endDate)}
                            </td>
                            <td className="py-1.5 px-2.5 whitespace-nowrap">
                              {renderStatusPill(loc.status)}
                            </td>
                            <td className="py-1.5 px-2.5">
                              <div className="flex items-center gap-1.5">
                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      loc.progress === 100
                                        ? 'bg-emerald-500'
                                        : loc.progress < 40
                                          ? 'bg-amber-500'
                                          : 'bg-blue-600'
                                    }`}
                                    style={{ width: `${loc.progress}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-mono font-semibold text-slate-700 w-7 text-right">
                                  {loc.progress}%
                                </span>
                              </div>
                            </td>
                            <td className="py-1.5 px-3 text-right whitespace-nowrap">
                              <button
                                onClick={() => onViewLocationDetails(loc)}
                                className="px-2 py-0.5 text-[11px] font-semibold text-blue-600 bg-blue-50/70 hover:bg-blue-100 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View Details</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      No locations or phases yet
                    </div>
                    <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                      Locations and project phases will appear here once they are added.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Project Information Card (4 cols on lg) */}
            <div
              id="project-information-card"
              className="col-span-1 lg:col-span-4 bg-[#F0F6FF] rounded-xl border border-blue-200/90 flex flex-col justify-between overflow-hidden shadow-2xs h-auto lg:h-full min-h-[300px]"
            >
              <div className="bg-[#E5F0FF] border-b border-blue-200/80 px-3.5 py-2 shrink-0">
                <h3 className="text-xs font-bold text-[#0F172A] tracking-tight">
                  Project Information
                </h3>
                <p className="text-[11px] text-blue-900/75 font-medium">
                  Core parameters and governance details
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-between px-3.5 py-1 divide-y divide-blue-200/60 text-xs">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600 font-medium">Customer</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {activeProject.customer}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600 font-medium">Project ID</span>
                  <span className="font-mono font-semibold text-[#2563EB] bg-white border border-blue-200 px-2 py-0.5 rounded shadow-2xs text-right">
                    {activeProject.code}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600 font-medium">Project Manager</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {activeProject.manager}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600 font-medium">Start Date</span>
                  <span className="font-medium text-slate-800 text-right">
                    {activeProject.startDate}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600 font-medium">Expected Completion</span>
                  <span className="font-medium text-slate-800 text-right">
                    {activeProject.expectedCompletion}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600 font-medium">Budget Allocation</span>
                  <span className="font-mono font-bold text-slate-900 text-right">
                    {activeProject.budget}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600 font-medium">Final Budget</span>
                  <span className="font-mono font-bold text-emerald-700 text-right">
                    {activeProject.finalBudget || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600 font-medium">Current Status</span>
                  <div className="text-right">{renderStatusPill(activeProject.status)}</div>
                </div>
              </div>

              <div className="px-3.5 py-1.5 bg-[#E5F0FF]/70 border-t border-blue-200/80 flex items-center justify-between text-[10px] text-blue-900/80 font-medium shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                  <span>Contract verified</span>
                </span>
                <span>Enterprise SLA Active</span>
              </div>
            </div>
          </div>

          <ProjectMomModal
            isOpen={isMomOpen}
            onClose={() => setIsMomOpen(false)}
            project={activeProject}
          />
          <ProjectDocumentsModal
            isOpen={isDocsOpen}
            onClose={() => setIsDocsOpen(false)}
            project={activeProject}
            onUpload={() => {
              setIsDocsOpen(false);
              onUploadDocs(activeProject);
            }}
          />
        </>
      )}
    </div>
  );
};