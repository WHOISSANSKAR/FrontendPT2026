import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Layers,
  MapPin,
  MessageSquare,
  Send,
  X,
  Sparkles,
  AlertTriangle,
  CheckSquare,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { getTaskActivity } from '../services/taskActivity.service';
import {
  ProjectItem,
  ProjectLocation,
  LocationMilestone,
  MilestoneTask,
  MilestoneTaskActivity
} from '../types';
import {
  getMilestoneOverdueInfo,
  getTaskOverdueInfo,
} from '../utils/overdueHierarchy';
import { OverdueDot } from './OverdueDot';

interface MilestoneTasksViewProps {
  project: ProjectItem;
  location: ProjectLocation;
  initialMilestone: LocationMilestone;
  allMilestones?: LocationMilestone[];
  onBackToMilestones: () => void;
  onBackToTracking: () => void;
  onBackToDashboard: () => void;
  onSelectMilestone?: (milestone: LocationMilestone) => void;
  currentUser?: string;
}

const formatDisplayDate = (dateStr?: string): string => {
  if (!dateStr) return '—';
  const trimmed = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const parsed = new Date(`${trimmed}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  }
  return trimmed;
};

export const MilestoneTasksView: React.FC<MilestoneTasksViewProps> = ({
  project,
  location,
  initialMilestone,
  allMilestones: propMilestones,
  onBackToMilestones,
  onBackToTracking,
  onBackToDashboard,
  onSelectMilestone,
  currentUser = 'Customer'
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightTaskId = searchParams.get('taskId');

  const locationMilestones = useMemo(() => {
    if (Array.isArray(propMilestones)) {
      return propMilestones;
    }
    if (Array.isArray(location.milestones)) {
      return location.milestones;
    }
    return [initialMilestone];
  }, [propMilestones, location.milestones, initialMilestone]);

  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>(initialMilestone.id);

  useEffect(() => {
    setSelectedMilestoneId(initialMilestone.id);
  }, [initialMilestone.id]);

  const activeMilestone = useMemo(() => {
    return locationMilestones.find(m => m.id === selectedMilestoneId) || initialMilestone;
  }, [locationMilestones, selectedMilestoneId, initialMilestone]);

  const milestoneScrollRef = useRef<HTMLDivElement>(null);
  const isDraggingMilestoneRef = useRef(false);
  const startXMilestoneRef = useRef(0);
  const scrollLeftMilestoneRef = useRef(0);
  const hasMovedMilestoneRef = useRef(false);

  const handleMilestoneWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!milestoneScrollRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      milestoneScrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleMilestoneMouseDown = (e: React.MouseEvent) => {
    if (!milestoneScrollRef.current) return;
    isDraggingMilestoneRef.current = true;
    hasMovedMilestoneRef.current = false;
    startXMilestoneRef.current = e.pageX - milestoneScrollRef.current.offsetLeft;
    scrollLeftMilestoneRef.current = milestoneScrollRef.current.scrollLeft;
  };

  const handleMilestoneMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingMilestoneRef.current || !milestoneScrollRef.current) return;
    const x = e.pageX - milestoneScrollRef.current.offsetLeft;
    const walk = x - startXMilestoneRef.current;
    if (Math.abs(walk) > 4) {
      hasMovedMilestoneRef.current = true;
      milestoneScrollRef.current.scrollLeft = scrollLeftMilestoneRef.current - walk;
    }
  };

  const handleMilestoneMouseUp = () => {
    isDraggingMilestoneRef.current = false;
  };

  useEffect(() => {
    if (!milestoneScrollRef.current) return;
    const activeEl = milestoneScrollRef.current.querySelector<HTMLElement>(`#milestone-selector-pill-${activeMilestone.id}`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeMilestone.id]);

  const handleSelectMilestone = (m: LocationMilestone) => {
    setSelectedMilestoneId(m.id);
    if (onSelectMilestone) {
      onSelectMilestone(m);
    }
    navigate(
      `/projects/${project.id}/locations/${location.id}/milestones/${m.id}/tasks`,
      { replace: true }
    );
  };

  const [tasksMap, setTasksMap] = useState<Record<string, MilestoneTask[]>>({});

  const activeTasks = useMemo(() => {
    if (tasksMap[activeMilestone.id]) {
      return tasksMap[activeMilestone.id];
    }
    return Array.isArray(activeMilestone.tasks) ? activeMilestone.tasks : [];
  }, [tasksMap, activeMilestone]);

  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'In Progress' | 'Pending' | 'At Risk'>('All');

  const filteredTasks = useMemo(() => {
    if (statusFilter === 'All') return activeTasks;
    return activeTasks.filter(t => t.status === statusFilter);
  }, [activeTasks, statusFilter]);

  useEffect(() => {
    if (!highlightTaskId) return;
    const el = document.getElementById(`milestone-task-card-${highlightTaskId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightTaskId, filteredTasks]);

  const [openActivityIds, setOpenActivityIds] = useState<Record<string, boolean>>({});
  const [taskActivity, setTaskActivity] = useState<
    Record<string, { loading: boolean; error: string | null; items: MilestoneTaskActivity[] }>
  >({});

  const toggleTaskActivity = async (task: MilestoneTask) => {
    const willOpen = !openActivityIds[task.id];
    setOpenActivityIds(prev => ({ ...prev, [task.id]: willOpen }));
    if (!willOpen) return;

    setTaskActivity(prev => ({
      ...prev,
      [task.id]: { loading: true, error: null, items: prev[task.id]?.items ?? [] },
    }));
    try {
      const items = await getTaskActivity(task.id);
      setTaskActivity(prev => ({ ...prev, [task.id]: { loading: false, error: null, items } }));
    } catch (err) {
      setTaskActivity(prev => ({
        ...prev,
        [task.id]: {
          loading: false,
          error: err instanceof Error ? err.message : 'Unable to load activity.',
          items: prev[task.id]?.items ?? [],
        },
      }));
    }
  };

  const [milestoneNotes, setMilestoneNotes] = useState<
    Record<string, { id: string; user: string; text: string; time: string }[]>
  >({});
  const [newMilestoneNote, setNewMilestoneNote] = useState('');

  const totalTasksCount = activeTasks.length;
  const completedTasksCount = activeTasks.filter(
    t => t.status === 'Completed' || t.progress === 100
  ).length;

  const calculatedCompletion = useMemo(() => {
    if (activeTasks.length === 0) return Number(activeMilestone.progress || 0);
    const totalWeight = activeTasks.reduce((sum, t) => sum + Number(t.weightage || 0), 0);
    if (totalWeight <= 0) {
      const avg = activeTasks.reduce((sum, t) => sum + Number(t.progress || 0), 0) / activeTasks.length;
      return Math.round(avg);
    }
    const earnedWeight = activeTasks.reduce(
      (sum, t) => sum + (Number(t.progress || 0) * Number(t.weightage || 0)) / 100,
      0
    );
    return Math.round((earnedWeight / totalWeight) * 100);
  }, [activeTasks, activeMilestone.progress]);

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskWeight, setNewTaskWeight] = useState(20);
  const [newTaskStart, setNewTaskStart] = useState('');
  const [newTaskEnd, setNewTaskEnd] = useState('');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    const newTask: MilestoneTask = {
      id: `tsk-${activeMilestone.id}-${Date.now()}`,
      taskNumber: `TASK ${String(activeTasks.length + 1).padStart(2, '0')}`,
      name: newTaskName.trim(),
      description: newTaskDesc.trim() || `Verification deliverable for ${activeMilestone.name}.`,
      status: 'In Progress',
      weightage: Number(newTaskWeight) || 20,
      progress: 0,
      startDate: newTaskStart.trim() || activeMilestone.startDate,
      endDate: newTaskEnd.trim() || activeMilestone.endDate,
      assignee: currentUser,
      activities: [
        {
          id: `act-${Date.now()}`,
          user: currentUser,
          role: 'Customer',
          text: `Task created for ${activeMilestone.name}.`,
          timestamp: 'Just now',
          type: 'status_change'
        } as MilestoneTaskActivity
      ]
    };

    setTasksMap(prev => ({
      ...prev,
      [activeMilestone.id]: [...activeTasks, newTask]
    }));

    setShowAddTaskModal(false);
    setNewTaskName('');
    setNewTaskDesc('');
    setNewTaskWeight(20);
    setNewTaskStart('');
    setNewTaskEnd('');
  };

  const handlePostMilestoneNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneNote.trim()) return;

    const note = {
      id: `mn-${Date.now()}`,
      user: currentUser,
      text: newMilestoneNote.trim(),
      time: 'Just now'
    };

    setMilestoneNotes(prev => ({
      ...prev,
      [activeMilestone.id]: [note, ...(prev[activeMilestone.id] || [])]
    }));

    setNewMilestoneNote('');
  };

  const renderStatusPill = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
            <span>In Progress</span>
          </span>
        );
      case 'At Risk':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shadow-2xs">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>At Risk</span>
          </span>
        );
      case 'Not Started':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Not Started</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{status || 'Pending'}</span>
          </span>
        );
    }
  };

  const regionTag = location.countryCode || (location.country && location.country !== '—' ? location.country : '');

  return (
    <div
      id="milestone-tasks-viewport"
      className="w-full min-h-[calc(100dvh-56px)] flex-1 overflow-y-auto lg:overflow-hidden lg:h-[calc(100dvh-56px)] lg:max-h-[calc(100dvh-56px)] flex flex-col bg-[#F4F6F9] px-3 sm:px-4 lg:px-6 py-2 gap-2 select-none"
    >
      {/* 1. Breadcrumbs + Navigation Bar */}
      <div className="flex items-center shrink-0">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium min-w-0">
          <button
            onClick={onBackToMilestones}
            id="btn-back-to-milestones"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded-md hover:bg-blue-50 transition-colors cursor-pointer mr-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Milestones</span>
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={onBackToDashboard}
            className="hover:text-blue-700 transition-colors cursor-pointer font-medium"
          >
            Dashboard
          </button>
          <span>/</span>
          <button
            onClick={onBackToTracking}
            className="hover:text-blue-700 transition-colors cursor-pointer font-medium"
          >
            Projects
          </button>
          <span>/</span>
          <button
            onClick={onBackToTracking}
            className="hover:text-blue-700 transition-colors cursor-pointer font-medium"
          >
            {project.name}
          </button>
          <span>/</span>
          <button
            onClick={onBackToMilestones}
            className="hover:text-blue-700 transition-colors cursor-pointer font-medium flex items-center gap-1"
          >
            <MapPin className="w-3 h-3 text-blue-600 inline" />
            <span>{location.city}</span>
          </button>
          <span>/</span>
          <button
            onClick={onBackToMilestones}
            className="hover:text-blue-700 transition-colors cursor-pointer font-medium"
          >
            Milestones
          </button>
          <span>/</span>
          <span className="font-semibold text-slate-800 truncate max-w-[280px]">
            {activeMilestone.name}
          </span>
        </div>
      </div>

      {/* 2. Top Milestone Selector Bar */}
      <div
        id="top-milestone-selector-bar"
        className="bg-white rounded-xl border border-slate-200/90 px-3.5 py-1.5 flex items-center justify-between shadow-2xs shrink-0 gap-3 overflow-hidden"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-1 shrink-0 select-none">
            Milestones:
          </span>
          <div
            id="milestone-selector-scroll-container"
            ref={milestoneScrollRef}
            onWheel={handleMilestoneWheel}
            onMouseDown={handleMilestoneMouseDown}
            onMouseMove={handleMilestoneMouseMove}
            onMouseUp={handleMilestoneMouseUp}
            onMouseLeave={handleMilestoneMouseUp}
            className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar scrollbar-none flex-nowrap w-full select-none scroll-x-visible"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {locationMilestones.map((m, idx) => {
              const isSelected = m.id === activeMilestone.id;
              const mInfo = getMilestoneOverdueInfo(m, project.id, location.id);

              return (
                <React.Fragment key={m.id}>
                  {idx > 0 && (
                    <span className="text-slate-300 font-normal select-none px-0.5 shrink-0">|</span>
                  )}
                  <button
                    onClick={(e) => {
                      if (hasMovedMilestoneRef.current) {
                        e.preventDefault();
                        return;
                      }
                      handleSelectMilestone(m);
                    }}
                    id={`milestone-selector-pill-${m.id}`}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700 ring-2 ring-blue-600/20'
                        : 'bg-slate-50 text-slate-700 hover:text-blue-700 hover:bg-blue-50 border border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      {mInfo.hasAnyOverdue && (
                        <OverdueDot
                          title={
                            mInfo.hasOverdueTask
                              ? `${mInfo.overdueTaskCount} overdue task(s) in ${m.name}`
                              : `Milestone overdue: ${m.name}`
                          }
                          onLightBg={!isSelected}
                        />
                      )}
                      {!mInfo.hasAnyOverdue && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            m.status === 'Completed' || m.progress === 100
                              ? isSelected ? 'bg-emerald-300 ring-2 ring-white/30' : 'bg-emerald-500'
                              : isSelected ? 'bg-sky-200' : 'bg-blue-500'
                          }`}
                        />
                      )}
                      <span>{m.name}</span>
                    </span>

                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full leading-none shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200/70 text-slate-600'
                      }`}
                    >
                      {m.progress}%
                    </span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 shrink-0 pl-2">
          <span>Active:</span>
          <span className="font-bold text-slate-800 truncate max-w-[200px]">{activeMilestone.name}</span>
          <span className="text-slate-300">•</span>
          <span className="text-blue-600 font-semibold">{calculatedCompletion}% Done</span>
        </div>
      </div>

      {/* 3. Milestone Header */}
      <div
        id="milestone-tasks-header"
        className="bg-[#F2F7FF] rounded-xl border border-blue-100 px-3.5 py-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 shadow-2xs shrink-0"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight flex flex-wrap items-center gap-2">
                <span>{activeMilestone.name} — Task Timeline</span>
                {renderStatusPill(activeMilestone.status)}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[11px] text-slate-600 font-medium">
              <span className="font-bold text-blue-700 bg-blue-50/80 px-1.5 py-0.2 rounded border border-blue-200/60">
                {project.name}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-800 font-semibold">
                <MapPin className="w-3 h-3 text-blue-600" />
                <span>{location.city}</span>
                {regionTag && (
                  <span className="text-slate-400 font-normal">({regionTag})</span>
                )}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 truncate">
                Milestone: <strong className="text-slate-700">{activeMilestone.name}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <div className="text-right">
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Task Completion
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-24 h-1.5 bg-slate-200/80 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    calculatedCompletion === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${calculatedCompletion}%` }}
                />
              </div>
              <span className="text-xs font-black text-blue-900 font-mono">
                {calculatedCompletion}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Milestone Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 shrink-0">
        <div className="bg-white rounded-xl border border-slate-200/90 py-1 px-2.5 shadow-2xs">
          <div className="text-[10px] font-medium text-slate-500">Overall Task Progress</div>
          <div className="text-sm font-extrabold text-slate-900 font-mono mt-0.5 leading-tight flex items-center justify-between">
            <span>{calculatedCompletion}%</span>
            <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-1 py-0.2 rounded">
              {calculatedCompletion === 100 ? 'Verified' : 'In Execution'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                calculatedCompletion === 100 ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${calculatedCompletion}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 py-1 px-2.5 shadow-2xs">
          <div className="text-[10px] font-medium text-slate-500">Milestone Status</div>
          <div className="mt-0.5">
            {renderStatusPill(activeMilestone.status)}
          </div>
          <div className="text-[9px] text-slate-500 truncate mt-0.5">
            {activeMilestone.status === 'Completed' ? 'Engineering sign-off complete' : 'Field tasks in progress'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 py-1 px-2.5 shadow-2xs">
          <div className="text-[10px] font-medium text-slate-500">Total Tasks</div>
          <div className="text-sm font-extrabold text-slate-900 font-mono mt-0.5 leading-tight">
            {completedTasksCount} / {totalTasksCount}
          </div>
          <div className="text-[9px] text-indigo-600 font-medium truncate mt-0.5">
            {totalTasksCount === 0
              ? 'No tasks added'
              : completedTasksCount === totalTasksCount
                ? 'All tasks complete'
                : `${totalTasksCount - completedTasksCount} remaining`}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 py-1 px-2.5 shadow-2xs">
          <div className="text-[10px] font-medium text-slate-500">Start Date</div>
          <div className="text-xs font-bold text-slate-900 truncate mt-0.5 leading-tight">
            {formatDisplayDate(activeMilestone.startDate)}
          </div>
          <div className="text-[9px] text-slate-500 truncate mt-0.5">
            Baseline planned start
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 py-1 px-2.5 shadow-2xs">
          <div className="text-[10px] font-medium text-slate-500">End Date</div>
          <div className="text-xs font-bold text-slate-900 truncate mt-0.5 leading-tight">
            {formatDisplayDate(activeMilestone.endDate)}
          </div>
          <div className="text-[9px] text-slate-500 truncate mt-0.5">
            Gate sign-off deadline
          </div>
        </div>
      </div>

      {/* 5. Overall Task Progress (Horizontal Segmented Bar Card) */}
      <div
        id="overall-task-progress-card"
        className="bg-white rounded-xl border border-slate-200/90 px-3.5 py-2 shadow-2xs shrink-0"
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Overall Task Progress</span>
            </h2>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {calculatedCompletion}% completed across all tasks
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[10px] font-medium text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-blue-600 inline-block" />
              <span>Verified Completed</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-sky-400 inline-block" />
              <span>Active Work</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-slate-100 border border-slate-200 inline-block" />
              <span>Remaining</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 w-full">
          {Array.from({ length: 10 }).map((_, idx) => {
            const segmentThreshold = (idx + 1) * 10;
            const isFull = calculatedCompletion >= segmentThreshold;
            const isPartial = calculatedCompletion > idx * 10 && calculatedCompletion < segmentThreshold;

            return (
              <div
                key={idx}
                className={`flex-1 h-3 rounded-sm transition-all duration-300 relative overflow-hidden ${
                  isFull
                    ? 'bg-blue-600 shadow-2xs'
                    : isPartial
                      ? 'bg-sky-400 animate-pulse'
                      : 'bg-slate-100 border border-slate-200/70'
                }`}
                title={`Segment ${idx + 1}: ${idx * 10}% to ${segmentThreshold}%`}
              >
                {isPartial && (
                  <div
                    className="h-full bg-blue-600 rounded-sm"
                    style={{ width: `${((calculatedCompletion - idx * 10) / 10) * 100}%` }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
          <span>{completedTasksCount} of {totalTasksCount} tasks verified for this milestone</span>
          <span className="font-mono font-semibold text-slate-700">
            Cumulative Weight: {activeTasks.reduce((s, t) => s + Number(t.weightage || 0), 0)}%
          </span>
        </div>
      </div>

      {/* 6. Stable Two-Column Grid: LEFT (Task Timeline) + RIGHT (Milestone Information) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:overflow-hidden">
        {/* LEFT COLUMN: Task Timeline (8 cols) */}
        <div
          id="milestone-tasks-timeline-card"
          className="col-span-1 lg:col-span-8 min-w-0 min-h-[280px] lg:min-h-0 h-full bg-white rounded-xl border border-slate-200/90 flex flex-col overflow-hidden shadow-2xs"
        >
          <div className="px-3 py-1.5 border-b border-slate-100 shrink-0 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-xs font-bold text-slate-900 tracking-tight shrink-0">
                Task Timeline ({filteredTasks.length})
              </h3>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full truncate">
                {activeMilestone.name}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs shrink-0">
              <span className="text-[11px] font-medium text-slate-500">Filter:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="At Risk">At Risk</option>
              </select>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
            {filteredTasks.length > 0 ? (
              <div className="relative pl-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {filteredTasks.map((task) => {
                  const isCompleted = task.status === 'Completed' || task.progress === 100;
                  const isInProgress = task.status === 'In Progress';
                  const isAtRisk = task.status === 'At Risk';
                  const { isSelfOverdue: isOverdueTask } = getTaskOverdueInfo(task);
                  const isHighlighted = highlightTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      id={`milestone-task-card-${task.id}`}
                      className="relative mb-3 last:mb-0"
                    >
                      <div className="absolute -left-6 top-3 -translate-x-1/2 flex items-center justify-center z-10">
                        {isCompleted ? (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-4 ring-white shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : isInProgress ? (
                          <div className="w-5 h-5 rounded-full bg-white border-2 border-blue-600 text-blue-600 flex items-center justify-center ring-4 ring-blue-100 shadow-xs animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                          </div>
                        ) : isAtRisk ? (
                          <div className="w-5 h-5 rounded-full bg-rose-50 border-2 border-rose-500 text-rose-600 flex items-center justify-center ring-4 ring-rose-100 shadow-xs">
                            <AlertTriangle className="w-2.5 h-2.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-400 flex items-center justify-center ring-4 ring-white shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          </div>
                        )}
                      </div>

                      <div
                        data-overdue={isOverdueTask ? 'true' : undefined}
                        className={`rounded-xl border p-3 shadow-2xs transition-all hover:shadow-xs ${
                          isOverdueTask
                            ? 'bg-rose-50 border-rose-300 border-l-4 border-l-rose-500 outline outline-2 -outline-offset-2 outline-rose-400 hover:border-rose-400'
                            : 'bg-white border-slate-200/90 hover:border-blue-300'
                        } ${isHighlighted ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${isOverdueTask ? 'text-rose-700 bg-white border-rose-200' : 'text-blue-700 bg-blue-50 border-blue-200'}`}>
                                {task.taskNumber}
                              </span>
                              <h4 className={`text-xs font-bold leading-tight ${isOverdueTask ? 'text-rose-800' : 'text-slate-900'}`}>
                                {task.name}
                              </h4>
                              {isOverdueTask && (
                                <span className="flex items-center gap-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                  Overdue
                                </span>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                                {task.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                              Weightage: <strong className="text-slate-800">{task.weightage}%</strong>
                            </span>
                            {renderStatusPill(task.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-12 gap-3 items-center mt-2.5 pt-2 border-t border-slate-100 text-xs">
                          <div className="col-span-7 flex items-center gap-2">
                            <span className="text-[10px] font-medium text-slate-500 w-14 shrink-0">
                              Progress:
                            </span>
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  task.progress === 100
                                    ? 'bg-emerald-500'
                                    : task.progress === 0
                                      ? 'bg-slate-200'
                                      : 'bg-blue-600'
                                }`}
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-800 w-9 text-right">
                              {task.progress}%
                            </span>
                          </div>

                          <div className={`col-span-5 flex items-center justify-end gap-1 text-[11px] font-mono ${isOverdueTask ? 'text-rose-700 font-semibold' : 'text-slate-500'}`}>
                            <Calendar className={`w-3 h-3 shrink-0 ${isOverdueTask ? 'text-rose-500' : 'text-slate-400'}`} />
                            <span className="truncate">
                              {formatDisplayDate(task.startDate)} — {formatDisplayDate(task.endDate)}
                            </span>
                          </div>
                        </div>

                        {(() => {
                          const isOpen = !!openActivityIds[task.id];
                          const state = taskActivity[task.id];
                          const items = state?.items ?? [];
                          return (
                            <div className="mt-2 pt-2 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => toggleTaskActivity(task)}
                                aria-expanded={isOpen}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{isOpen ? 'Hide activity' : 'Show activity'}</span>
                                {items.length > 0 && (
                                  <span className="ml-0.5 px-1.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] text-blue-700">
                                    {items.length}
                                  </span>
                                )}
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                              </button>

                              {isOpen && (
                                <div className="mt-2 space-y-2">
                                  {state?.loading && items.length === 0 ? (
                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 py-1">
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      Loading activity…
                                    </div>
                                  ) : state?.error ? (
                                    <div className="text-[11px] text-rose-600 py-1">{state.error}</div>
                                  ) : items.length === 0 ? (
                                    <div className="text-[11px] text-slate-400 italic py-1">
                                      No activity yet. Updates from the PseudoTeam team will appear here.
                                    </div>
                                  ) : (
                                    items.map(act => (
                                      <div key={act.id} className="flex gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                          {(act.user || 'P').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex flex-wrap items-center gap-x-1.5 text-[10px]">
                                            <span className="font-bold text-slate-800">{act.user}</span>
                                            <span className="px-1.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-semibold">{act.role}</span>
                                            {act.timestamp && <span className="text-slate-400 font-mono">{act.timestamp}</span>}
                                          </div>
                                          <p className="text-[11px] text-slate-700 mt-0.5 leading-relaxed whitespace-pre-line">{act.text}</p>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {activeTasks.length === 0
                    ? `No tasks added for ${activeMilestone.name} yet`
                    : 'No tasks matching filter'}
                </div>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                  {activeTasks.length === 0
                    ? 'Tasks will appear here once they are scheduled for this milestone.'
                    : `Adjust status filter to see tasks for ${activeMilestone.name}.`}
                </p>
                {statusFilter !== 'All' && (
                  <button
                    onClick={() => setStatusFilter('All')}
                    className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Milestone Information Panel (4 cols) */}
        <div
          id="milestone-information-card"
          className="col-span-1 lg:col-span-4 min-w-0 min-h-[280px] lg:min-h-0 h-full bg-white rounded-xl border border-slate-200/90 flex flex-col overflow-hidden shadow-2xs"
        >
          <div className="px-3 py-1.5 border-b border-slate-100 shrink-0 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                Milestone Information
              </h3>
            </div>
            {renderStatusPill(activeMilestone.status)}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 scrollbar-thin">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Milestone Name
              </span>
              <div className="text-xs font-bold text-slate-900 mt-0.5 leading-snug">
                {activeMilestone.name}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Scope & Deliverables
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                {activeMilestone.description || '—'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/70">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Location</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {location.city}{regionTag ? ` (${regionTag})` : ''}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/70">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Team</span>
                <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                  {location.assignedTeam || '—'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/70">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Start Date</span>
                <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                  {formatDisplayDate(activeMilestone.startDate)}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/70">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">End Date</span>
                <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                  {formatDisplayDate(activeMilestone.endDate)}
                </span>
              </div>
            </div>

            <div
              id="milestone-field-notes-card"
              className="bg-[#F0F6FF] rounded-xl border border-blue-200/90 flex flex-col overflow-hidden shadow-2xs mt-1"
            >
              <div className="bg-[#E5F0FF] border-b border-blue-200/80 px-3 py-1.5 shrink-0 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-700" />
                    <h4 className="text-xs font-bold text-[#0F172A] tracking-tight">
                      Milestone Notes & Comments
                    </h4>
                  </div>
                  <p className="text-[10px] text-blue-900/75 font-medium">
                    Field observations for {activeMilestone.name}
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-white text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full shadow-2xs">
                  {(milestoneNotes[activeMilestone.id] || []).length} notes
                </span>
              </div>

              <div className="p-2.5 space-y-2">
                {(milestoneNotes[activeMilestone.id] || []).length > 0 ? (
                  milestoneNotes[activeMilestone.id].map((note) => (
                    <div key={note.id} className="bg-white rounded-lg border border-blue-100 p-2.5 shadow-2xs text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center">
                            {note.user.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="font-semibold text-slate-900 text-[11px]">{note.user}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono">{note.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        {note.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-slate-500">
                    <MessageSquare className="w-5 h-5 text-blue-300 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-700">No milestone notes yet</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Post an engineering update or inspection note for this milestone.
                    </p>
                  </div>
                )}
              </div>

              <form
                onSubmit={handlePostMilestoneNote}
                className="p-2.5 bg-white/95 border-t border-blue-200/80 shrink-0 flex flex-col gap-1.5"
              >
                <textarea
                  value={newMilestoneNote}
                  onChange={(e) => setNewMilestoneNote(e.target.value)}
                  placeholder={`Post milestone update for ${activeMilestone.name}...`}
                  className="w-full p-2 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none transition-all resize-none shadow-inner"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handlePostMilestoneNote(e);
                    }
                  }}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Posting as <strong className="text-slate-700">{currentUser}</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={!newMilestoneNote.trim()}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post Note</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Create Milestone Task</h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {activeMilestone.name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Task Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Servo axis zero-backlash optical alignment"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Task Description & Requirements
                </label>
                <textarea
                  placeholder="Specific technical criteria or inspection scope..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Weightage (% of Milestone): {newTaskWeight}%
                </label>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={newTaskWeight}
                  onChange={(e) => setNewTaskWeight(Number(e.target.value))}
                  className="w-full cursor-pointer accent-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newTaskStart}
                    onChange={(e) => setNewTaskStart(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newTaskEnd}
                    onChange={(e) => setNewTaskEnd(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};