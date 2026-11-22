import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Edit2,
  MapPin,
  MessageSquare,
  Send,
  Trash2,
  X,
  CheckSquare,
  Eye
} from 'lucide-react';
import { ProjectItem, ProjectLocation, LocationMilestone, LocationComment } from '../types';
import { isMilestoneOverdue, isOverdue, isTaskOverdue } from '../utils/overdue';
import {
  getLocationComments,
  createLocationComment,
  updateLocationComment,
  deleteLocationComment
} from '../services/comments.service';

interface LocationMilestonesViewProps {
  project: ProjectItem;
  initialLocation: ProjectLocation;
  onBackToTracking: () => void;
  onBackToDashboard: () => void;
  onSelectLocation?: (location: ProjectLocation) => void;
  onViewMilestoneTasks?: (milestone: LocationMilestone) => void;
  onUpdateProjectLocation?: (projectId: string, updatedLocation: ProjectLocation) => void;
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

export const LocationMilestonesView: React.FC<LocationMilestonesViewProps> = ({
  project,
  initialLocation,
  onBackToTracking,
  onBackToDashboard,
  onSelectLocation,
  onViewMilestoneTasks,
  onUpdateProjectLocation,
  currentUser
}) => {
  // Selected location ID controlled within the project
  const [selectedLocationId, setSelectedLocationId] = useState<string>(initialLocation.id);

  // Detail inspection state
  const [inspectingMilestone, setInspectingMilestone] = useState<LocationMilestone | null>(null);

  // Sync if initialLocation changes from outside
  useEffect(() => {
    setSelectedLocationId(initialLocation.id);
  }, [initialLocation.id]);

  const handleSelectLocation = (loc: ProjectLocation) => {
    setSelectedLocationId(loc.id);
    if (onSelectLocation) {
      onSelectLocation(loc);
    }
  };

  // All locations for this project
  const locations = useMemo(() => {
    return project.locations && project.locations.length > 0
      ? project.locations
      : [initialLocation];
  }, [project.locations, initialLocation]);

  // Current active location object
  const activeLocation = useMemo(() => {
    return locations.find(l => l.id === selectedLocationId) || initialLocation;
  }, [locations, selectedLocationId, initialLocation]);

  // Horizontal scroll container refs and handlers
  const locationScrollRef = useRef<HTMLDivElement>(null);
  const isDraggingLocationRef = useRef(false);
  const startXLocationRef = useRef(0);
  const scrollLeftLocationRef = useRef(0);
  const hasMovedLocationRef = useRef(false);

  const handleLocationWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!locationScrollRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      locationScrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleLocationMouseDown = (e: React.MouseEvent) => {
    if (!locationScrollRef.current) return;
    isDraggingLocationRef.current = true;
    hasMovedLocationRef.current = false;
    startXLocationRef.current = e.pageX - locationScrollRef.current.offsetLeft;
    scrollLeftLocationRef.current = locationScrollRef.current.scrollLeft;
  };

  const handleLocationMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingLocationRef.current || !locationScrollRef.current) return;
    const x = e.pageX - locationScrollRef.current.offsetLeft;
    const walk = x - startXLocationRef.current;
    if (Math.abs(walk) > 4) {
      hasMovedLocationRef.current = true;
      locationScrollRef.current.scrollLeft = scrollLeftLocationRef.current - walk;
    }
  };

  const handleLocationMouseUp = () => {
    isDraggingLocationRef.current = false;
  };

  // Center selected location in selector view when location changes
  useEffect(() => {
    if (!locationScrollRef.current) return;
    const activeEl = locationScrollRef.current.querySelector<HTMLElement>(`#location-pill-${activeLocation.id}`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeLocation.id]);

  // Local state for interactive milestones and comments per location
  const [locationMilestonesMap, setLocationMilestonesMap] = useState<Record<string, LocationMilestone[]>>({});
  const [locationCommentsMap, setLocationCommentsMap] = useState<Record<string, LocationComment[]>>({});

  // Always use real API milestones from activeLocation (never mock fallback)
  const activeMilestones = useMemo(() => {
    if (locationMilestonesMap[activeLocation.id]) {
      return locationMilestonesMap[activeLocation.id];
    }
    return Array.isArray(activeLocation.milestones) ? activeLocation.milestones : [];
  }, [locationMilestonesMap, activeLocation]);

  // Comments are loaded from the FastAPI backend for the selected location.
  const activeComments = locationCommentsMap[activeLocation.id] ?? [];
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Comment posting state
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadComments = async () => {
      setCommentsLoading(true);
      setCommentsError(null);
      setEditingCommentId(null);
      setEditingText('');

      try {
        const comments = await getLocationComments(activeLocation.id);
        if (!cancelled) {
          setLocationCommentsMap(prev => ({
            ...prev,
            [activeLocation.id]: comments
          }));
        }
      } catch (error) {
        if (!cancelled) {
          setCommentsError(
            error instanceof Error ? error.message : 'Unable to load comments.'
          );
          setLocationCommentsMap(prev => ({
            ...prev,
            [activeLocation.id]: []
          }));
        }
      } finally {
        if (!cancelled) {
          setCommentsLoading(false);
        }
      }
    };

    loadComments();

    return () => {
      cancelled = true;
    };
  }, [activeLocation.id]);

  // Milestone edit/action state
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'In Progress' | 'Pending'>('All');
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newMilestoneStart, setNewMilestoneStart] = useState('');
  const [newMilestoneEnd, setNewMilestoneEnd] = useState('');

  // Milestone statistics
  const completedMilestones = activeMilestones.filter(
    m => m.status === 'Completed' || m.progress >= 100
  ).length;
  const totalMilestones = activeMilestones.length;

  // Handle Post Comment
  const handlePostComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const commentText = newCommentText.trim();
    if (!commentText || commentSubmitting) return;

    setCommentSubmitting(true);
    setCommentsError(null);

    try {
      const savedComment = await createLocationComment(
        activeLocation.id,
        commentText
      );

      const updatedComments = [
        savedComment,
        ...(locationCommentsMap[activeLocation.id] ?? [])
      ];

      setLocationCommentsMap(prev => ({
        ...prev,
        [activeLocation.id]: updatedComments
      }));

      if (onUpdateProjectLocation) {
        onUpdateProjectLocation(project.id, {
          ...activeLocation,
          comments: updatedComments
        });
      }

      setNewCommentText('');
    } catch (error) {
      setCommentsError(
        error instanceof Error ? error.message : 'Unable to post comment.'
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Handle Save Edited Comment
  const handleSaveEditComment = async (commentId: string) => {
    const commentText = editingText.trim();
    if (!commentText || commentSubmitting) return;

    setCommentSubmitting(true);
    setCommentsError(null);

    try {
      const savedComment = await updateLocationComment(
        commentId,
        commentText
      );

      const updatedComments = (locationCommentsMap[activeLocation.id] ?? []).map(
        comment => comment.id === commentId ? savedComment : comment
      );

      setLocationCommentsMap(prev => ({
        ...prev,
        [activeLocation.id]: updatedComments
      }));

      if (onUpdateProjectLocation) {
        onUpdateProjectLocation(project.id, {
          ...activeLocation,
          comments: updatedComments
        });
      }

      setEditingCommentId(null);
      setEditingText('');
    } catch (error) {
      setCommentsError(
        error instanceof Error ? error.message : 'Unable to update comment.'
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (commentSubmitting) return;

    setCommentSubmitting(true);
    setCommentsError(null);

    try {
      await deleteLocationComment(commentId);

      const updatedComments = (locationCommentsMap[activeLocation.id] ?? [])
        .filter(comment => comment.id !== commentId);

      setLocationCommentsMap(prev => ({
        ...prev,
        [activeLocation.id]: updatedComments
      }));

      if (onUpdateProjectLocation) {
        onUpdateProjectLocation(project.id, {
          ...activeLocation,
          comments: updatedComments
        });
      }

      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setEditingText('');
      }
    } catch (error) {
      setCommentsError(
        error instanceof Error ? error.message : 'Unable to delete comment.'
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Handle Milestone Status Change
  const handleUpdateMilestoneStatus = (milestoneId: string, nextStatus: LocationMilestone['status']) => {
    const updatedMilestones = activeMilestones.map(m => {
      if (m.id === milestoneId) {
        const nextProgress = nextStatus === 'Completed' ? 100 : nextStatus === 'Pending' ? 0 : 50;
        return {
          ...m,
          status: nextStatus,
          progress: nextProgress
        };
      }
      return m;
    });

    setLocationMilestonesMap(prev => ({
      ...prev,
      [activeLocation.id]: updatedMilestones
    }));

    const totalProgressSum = updatedMilestones.reduce((acc, m) => acc + m.progress, 0);
    const calculatedLocationProgress = updatedMilestones.length > 0
      ? Math.round(totalProgressSum / updatedMilestones.length)
      : 0;

    if (onUpdateProjectLocation) {
      onUpdateProjectLocation(project.id, {
        ...activeLocation,
        progress: calculatedLocationProgress,
        status: calculatedLocationProgress === 100 ? 'Completed' : 'In Progress',
        milestones: updatedMilestones
      });
    }
  };

  // Handle Add New Milestone
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneName.trim()) return;

    const newMilestone: LocationMilestone = {
      id: `m-${Date.now()}`,
      name: newMilestoneName.trim(),
      description: newMilestoneDesc.trim() || 'Scheduled execution and site validation.',
      startDate: newMilestoneStart || new Date().toISOString().slice(0, 10),
      endDate: newMilestoneEnd || new Date().toISOString().slice(0, 10),
      status: 'Pending',
      progress: 0
    };

    const updatedMilestones = [...activeMilestones, newMilestone];

    setLocationMilestonesMap(prev => ({
      ...prev,
      [activeLocation.id]: updatedMilestones
    }));

    if (onUpdateProjectLocation) {
      onUpdateProjectLocation(project.id, {
        ...activeLocation,
        milestones: updatedMilestones
      });
    }

    setShowAddMilestoneModal(false);
    setNewMilestoneName('');
    setNewMilestoneDesc('');
    setNewMilestoneStart('');
    setNewMilestoneEnd('');
  };

  // Render Status Pill
  const renderStatusPill = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Completed</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>In Progress</span>
          </span>
        );
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Critical</span>
          </span>
        );
      case 'Pending':
      case 'Not Started':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>{status}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{status}</span>
          </span>
        );
    }
  };

  // Filtered Milestones
  const filteredMilestones = useMemo(() => {
    if (statusFilter === 'All') return activeMilestones;
    return activeMilestones.filter(m => m.status === statusFilter);
  }, [activeMilestones, statusFilter]);

  return (
    <div 
      id="location-milestones-viewport"
      className="flex-1 min-h-[calc(100dvh-56px)] overflow-y-auto flex flex-col bg-[#F4F6F9] px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 gap-2 sm:gap-2.5 select-none" /* changes done by vb */
    >
      {/* 1. Breadcrumbs + Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={onBackToTracking}
            id="btn-back-to-project-tracking"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded-md hover:bg-blue-50 transition-colors cursor-pointer mr-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Project Tracking</span>
          </button>
          <span className="text-slate-300">|</span>
          <button 
            onClick={onBackToDashboard}
            className="text-slate-500 hover:text-blue-600 transition-colors cursor-pointer font-medium"
          >
            Dashboard
          </button>
          <span className="text-slate-300">/</span>
          <button 
            onClick={onBackToTracking}
            className="text-slate-500 hover:text-blue-600 transition-colors cursor-pointer font-medium"
          >
            Projects
          </button>
          <span className="text-slate-300">/</span>
          <button 
            onClick={onBackToTracking}
            className="text-slate-700 hover:text-blue-700 transition-colors cursor-pointer font-semibold"
          >
            {project.name}
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-semibold">{activeLocation.city}</span>
          <span className="text-slate-300">/</span>
          <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200/80">
            Milestones
          </span>
        </div>
      </div>

      {/* 2. Top Location Selector Bar */}
      <div 
        id="top-location-selector-bar"
        className="bg-white rounded-xl border border-slate-200/90 px-3.5 py-1.5 flex items-center justify-between shadow-2xs shrink-0 gap-3 overflow-hidden"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-1 shrink-0 select-none">
            Locations:
          </span>
          <div 
            id="location-selector-scroll-container"
            ref={locationScrollRef}
            onWheel={handleLocationWheel}
            onMouseDown={handleLocationMouseDown}
            onMouseMove={handleLocationMouseMove}
            onMouseUp={handleLocationMouseUp}
            onMouseLeave={handleLocationMouseUp}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none flex-nowrap w-full select-none py-0.5 scroll-x-visible" /* changes done by vb */
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {locations.map((loc, idx) => {
              const isSelected = loc.id === activeLocation.id;
              return (
                <React.Fragment key={loc.id}>
                  {idx > 0 && (
                    <span className="text-slate-300 font-normal select-none px-0.5 shrink-0">|</span>
                  )}
                  <button
                    onClick={(e) => {
                      if (hasMovedLocationRef.current) {
                        e.preventDefault();
                        return;
                      }
                      handleSelectLocation(loc);
                    }}
                    id={`location-pill-${loc.id}`}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700 ring-2 ring-blue-600/20'
                        : 'bg-slate-50 text-slate-700 hover:text-blue-700 hover:bg-blue-50 border border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <span 
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          loc.progress === 100 
                            ? isSelected ? 'bg-emerald-300 ring-2 ring-white/30' : 'bg-emerald-500'
                            : isSelected ? 'bg-sky-200' : 'bg-blue-500'
                        }`} 
                      />
                      <span>{loc.city}</span>
                      {(loc.countryCode || loc.country) && (
                        <span className={`text-[10px] font-normal ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          ({loc.countryCode || loc.country})
                        </span>
                      )}
                    </span>

                    <span 
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full leading-none shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200/70 text-slate-600'
                      }`}
                    >
                      {loc.progress}%
                    </span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 shrink-0 pl-2">
          <span>Active:</span>
          <span className="font-bold text-slate-800">{activeLocation.city}</span>
          <span className="text-slate-300">•</span>
          <span className="text-blue-600 font-semibold">{activeLocation.phase}</span>
        </div>
      </div>

      {/* 3. Header */}
      <div 
        id="location-milestones-header"
        className="bg-[#F2F7FF] rounded-xl border border-blue-100 px-3.5 py-1.5 flex items-center justify-between shadow-2xs shrink-0"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight flex items-center gap-2">
                <span>{activeLocation.city} — Milestones</span>
                {renderStatusPill(activeLocation.status)}
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-600 font-medium truncate">
              <span className="font-bold text-blue-700 bg-blue-50/80 px-1.5 py-0.2 rounded border border-blue-200/60">
                {project.name}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-800 font-semibold">
                <MapPin className="w-3 h-3 text-blue-600" />
                <span>Location: {activeLocation.city}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">
                Region: <span className="font-medium text-slate-700">{activeLocation.state} ({activeLocation.country})</span>
              </span>
              {activeLocation.assignedTeam && activeLocation.assignedTeam !== '—' && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">
                    Team: <span className="font-medium text-slate-700">{activeLocation.assignedTeam}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Overall Progress
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-24 h-1.5 bg-slate-200/80 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    activeLocation.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${activeLocation.progress}%` }}
                />
              </div>
              <span className="text-xs font-black text-blue-900 font-mono">
                {activeLocation.progress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Location Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 shrink-0">
        <div className="bg-white rounded-xl border border-slate-200/90 py-1 px-2.5 shadow-2xs">
          <div className="text-[10px] font-medium text-slate-500">Overall Progress</div>
          <div className="text-sm font-extrabold text-slate-900 font-mono mt-0.5 leading-tight flex items-center justify-between">
            <span>{activeLocation.progress}%</span>
            <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-1 py-0.2 rounded">
              {activeLocation.progress === 100 ? 'Verified' : 'Targeted'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                activeLocation.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${activeLocation.progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 py-1 px-2.5 shadow-2xs">
          <div className="text-[10px] font-medium text-slate-500">Current Phase</div>
          <div className="text-xs font-bold text-slate-900 truncate mt-0.5 leading-tight" title={activeLocation.phase}>
            {activeLocation.phase}
          </div>
          <div className="text-[9px] text-blue-600 font-medium truncate mt-0.5">
            Site Stage Execution
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 py-1 px-2.5 shadow-2xs">
          <div className="text-[10px] font-medium text-slate-500">Total Milestones</div>
          <div className="text-sm font-extrabold text-slate-900 font-mono mt-0.5 leading-tight">
            {completedMilestones}/{totalMilestones}
          </div>
          <div className="text-[9px] text-indigo-600 font-medium truncate mt-0.5">
            {totalMilestones === 0
              ? 'No milestones added'
              : completedMilestones === totalMilestones
                ? 'All cleared'
                : `${totalMilestones - completedMilestones} pending`}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 py-1 px-2.5 shadow-2xs">
          <div className="text-[10px] font-medium text-slate-500">Status</div>
          <div className="mt-0.5">
            {renderStatusPill(activeLocation.status)}
          </div>
          <div className="text-[9px] text-slate-500 truncate mt-0.5">
            Telemetry validated
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 py-1 px-2.5 shadow-2xs">
          <div className="text-[10px] font-medium text-slate-500">Last Updated</div>
          <div className="text-xs font-bold text-slate-900 truncate mt-0.5 leading-tight">
            {activeLocation.lastUpdated && activeLocation.lastUpdated !== '—'
              ? activeLocation.lastUpdated
              : project.lastUpdated || '—'}
          </div>
          <div className="text-[9px] text-slate-500 truncate mt-0.5">
            Synchronized with field
          </div>
        </div>
      </div>

      {/* 5. Milestone Progress & Horizontal Lifecycle Timeline */}
      <div 
        id="location-milestone-timeline-card"
        className="bg-white rounded-xl border border-slate-200/90 px-4 py-3 shadow-2xs shrink-0"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-900 tracking-tight">
              {activeLocation.city} Milestone Progress & Lifecycle Timeline
            </h2>
            <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
              {activeLocation.progress}% Complete
            </span>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Location Phase: <span className="font-semibold text-slate-800">{activeLocation.phase}</span>
          </div>
        </div>

        <div className="relative pt-2 pb-1 px-3">
          <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full rounded-full flex overflow-hidden transition-all duration-500"
              style={{ width: `${activeLocation.progress}%` }}
            >
              <div 
                style={{ width: `${Math.min(100, (25 / Math.max(1, activeLocation.progress)) * 100)}%` }} 
                className="h-full bg-sky-200 border-r border-white/40" 
                title="0-25% Initiation"
              />
              {activeLocation.progress > 25 && (
                <div 
                  style={{ width: `${Math.min(100, ((Math.min(50, activeLocation.progress) - 25) / activeLocation.progress) * 100)}%` }} 
                  className="h-full bg-sky-300 border-r border-white/40" 
                  title="25-50% Planning & Design"
                />
              )}
              {activeLocation.progress > 50 && (
                <div 
                  style={{ width: `${Math.min(100, ((Math.min(75, activeLocation.progress) - 50) / activeLocation.progress) * 100)}%` }} 
                  className="h-full bg-blue-400 border-r border-white/40" 
                  title="50-75% Implementation"
                />
              )}
              {activeLocation.progress > 75 && (
                <div 
                  style={{ width: `${Math.min(100, ((activeLocation.progress - 75) / activeLocation.progress) * 100)}%` }} 
                  className="h-full bg-blue-600" 
                  title="75-100% Completion"
                />
              )}
            </div>
          </div>

          <div className="absolute top-2 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
            {[
              { percent: 0, label: 'Start' },
              { percent: 25, label: 'Stage 1' },
              { percent: 50, label: 'Stage 2' },
              { percent: 75, label: 'Stage 3' },
              { percent: 100, label: 'Final' }
            ].map((node) => {
              const isCompleted = activeLocation.progress >= node.percent && node.percent > 0;
              const isStart = node.percent === 0;
              const isCurrent = Math.abs(activeLocation.progress - node.percent) <= 12;

              return (
                <div 
                  key={node.percent} 
                  className="flex flex-col items-center -translate-y-1"
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 shadow-xs transition-colors ${
                    isCompleted
                      ? 'bg-blue-600 border-white text-white'
                      : isCurrent
                        ? 'bg-white border-blue-600 text-blue-600 ring-2 ring-blue-100'
                        : isStart
                          ? 'bg-blue-600 border-white text-white'
                          : 'bg-slate-100 border-slate-300 text-slate-400'
                  }`}>
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

          {/* changes done by vb */}
          <div className="flex justify-between mx-0.5 mt-2.5 text-[10px] font-semibold text-slate-800">
            {[0, 25, 50, 75, 100].map((p) => (
              <div key={p} className="w-5 flex justify-center">
                <span className="whitespace-nowrap">{p}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Stable Two-Column Grid: Milestone Table (Left) + Comments Card (Right) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* LEFT SIDE: Milestone Table */}
        <div 
          id="location-milestones-table-card"
          className="col-span-1 lg:col-span-8 min-w-0 min-h-[300px] h-auto lg:h-full bg-white rounded-xl border border-slate-200/90 flex flex-col overflow-hidden shadow-2xs"
        >
          <div className="px-3 py-1.5 border-b border-slate-100 shrink-0 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                {activeLocation.city} Milestones & Verification Gates
              </h3>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {filteredMilestones.length} of {activeMilestones.length}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
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
              </select>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto no-scrollbar scroll-x-visible" /* changes done by vb */>
            {filteredMilestones.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse min-w-[560px]">
                <thead>
                  <tr className="bg-[#EBF3FE] border-b border-blue-200/80 text-[10px] font-bold text-[#1E3A8A] uppercase tracking-wider sticky top-0 z-10">
                    <th className="py-2 px-3 text-[#1E3A8A]">Milestone</th>
                    <th className="py-2 px-2.5 text-[#1E3A8A]">Description</th>
                    <th className="py-2 px-2.5 whitespace-nowrap text-[#1E3A8A]">Start Date</th>
                    <th className="py-2 px-2.5 whitespace-nowrap text-[#1E3A8A]">End Date</th>
                    <th className="py-2 px-2.5 text-[#1E3A8A]">Status</th>
                    <th className="py-2 px-2.5 w-28 text-[#1E3A8A]">Progress</th>
                    <th className="py-2 px-3 text-right text-[#1E3A8A]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMilestones.map((milestone) => {
                    const overdue = isMilestoneOverdue(milestone);
                    const ownDateOverdue = isOverdue(milestone.endDate, milestone.status, milestone.progress);
                    const overdueTasks = (milestone.tasks || []).filter(isTaskOverdue).length;
                    return (
                      <tr
                        key={milestone.id}
                        data-overdue={overdue ? 'true' : undefined}
                        className={`transition-colors group ${
                          overdue
                            ? 'bg-rose-50 hover:bg-rose-100/70 outline outline-2 -outline-offset-2 outline-rose-300'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className={`py-2 px-3 font-semibold text-slate-900 align-top ${overdue ? 'border-l-4 border-rose-500' : ''}`}>
                          <div className="flex items-start gap-1.5">
                            {milestone.status === 'Completed' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            ) : milestone.status === 'In Progress' ? (
                              <Clock className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${overdue ? 'text-rose-600' : 'text-blue-600'}`} />
                            ) : (
                              <div className={`w-3.5 h-3.5 rounded-full border shrink-0 mt-0.5 ${overdue ? 'border-rose-500' : 'border-slate-300'}`} />
                            )}
                            <div className="min-w-0">
                              <span className={`font-semibold leading-snug ${overdue ? 'text-rose-800' : 'text-slate-800'}`}>
                                {milestone.name}
                              </span>
                              {overdue && (
                                <span className="mt-1 flex w-fit items-center gap-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                  {ownDateOverdue ? 'Overdue' : `${overdueTasks} task${overdueTasks === 1 ? '' : 's'} overdue`}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-2.5 text-slate-600 text-[11px] leading-relaxed max-w-[220px] align-top">
                          {milestone.description || '—'}
                        </td>
                        <td className="py-2 px-2.5 text-slate-700 font-mono text-[11px] whitespace-nowrap align-top">
                          {formatDisplayDate(milestone.startDate)}
                        </td>
                        <td className={`py-2 px-2.5 font-mono text-[11px] whitespace-nowrap align-top ${ownDateOverdue ? 'text-rose-700 font-bold' : 'text-slate-700'}`}>
                          {formatDisplayDate(milestone.endDate)}
                        </td>
                        <td className="py-2 px-2.5 whitespace-nowrap align-top">
                          {renderStatusPill(milestone.status)}
                        </td>
                        <td className="py-2 px-2.5 align-top">
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  milestone.progress === 100 
                                    ? 'bg-emerald-500' 
                                    : milestone.progress === 0
                                      ? 'bg-slate-200'
                                      : 'bg-blue-600'
                                }`}
                                style={{ width: `${milestone.progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono font-semibold text-slate-700 w-7 text-right">
                              {milestone.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right whitespace-nowrap align-top">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                if (onViewMilestoneTasks) {
                                  onViewMilestoneTasks(milestone);
                                } else {
                                  setInspectingMilestone(milestone);
                                }
                              }}
                              id={`btn-view-milestone-${milestone.id}`}
                              className="px-2 py-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/70 rounded transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="View Task Timeline"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Details</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {activeMilestones.length === 0
                    ? `No milestones added for ${activeLocation.city} yet`
                    : 'No milestones matching filter'}
                </div>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                  {activeMilestones.length === 0
                    ? 'Milestones will appear here once they are scheduled for this location.'
                    : `Adjust status filter to view other milestones for ${activeLocation.city}.`}
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

        {/* RIGHT SIDE: Comments Card */}
        <div 
          id="location-comments-card"
          className="col-span-1 lg:col-span-4 min-w-0 min-h-[300px] h-auto lg:h-full bg-[#F0F6FF] rounded-xl border border-blue-200/90 flex flex-col overflow-hidden shadow-2xs"
        >
          <div className="bg-[#E5F0FF] border-b border-blue-200/80 px-3.5 py-2 shrink-0 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-700" />
                <h3 className="text-xs font-bold text-[#0F172A] tracking-tight">
                  Comments
                </h3>
              </div>
              <p className="text-[10px] text-blue-900/75 font-medium">
                {activeLocation.city} updates
              </p>
            </div>
            <span className="text-[10px] font-bold bg-white text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full shadow-2xs">
              {activeComments.length} {activeComments.length === 1 ? 'comment' : 'comments'}
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5">
            {commentsLoading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Loading comments...
              </div>
            ) : (
              <>
                {commentsError && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-[11px] text-rose-700">
                    {commentsError}
                  </div>
                )}
                {activeComments.length > 0 ? (
                  activeComments.map((comment) => (
                    <div 
                      key={comment.id}
                      className="bg-white rounded-lg border border-blue-100 p-2.5 shadow-2xs text-xs space-y-1.5 transition-all hover:border-blue-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                            {comment.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 leading-tight">
                              {comment.author}
                            </div>
                            <div className="text-[10px] text-slate-500 leading-tight">
                              {comment.role}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {comment.timestamp}
                            {comment.edited && ' (edited)'}
                          </span>
                          {editingCommentId !== comment.id && (
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditingText(comment.text);
                              }}
                              disabled={commentSubmitting}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer disabled:opacity-50"
                              title="Edit Comment"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={commentSubmitting}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete Comment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {editingCommentId === comment.id ? (
                        <div className="mt-1 space-y-1.5">
                          <textarea
                            value={editingText}
                            disabled={commentSubmitting}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full text-xs p-2 bg-slate-50 border border-blue-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none text-slate-800"
                            rows={2}
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setEditingCommentId(null)}
                              className="px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEditComment(comment.id)}
                              disabled={commentSubmitting || !editingText.trim()}
                              className="px-2.5 py-0.5 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs cursor-pointer disabled:opacity-50"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-700 text-[11px] leading-relaxed whitespace-pre-wrap">
                          {comment.text}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-4 text-center text-slate-500">
                    <MessageSquare className="w-6 h-6 text-slate-300 mb-1" />
                    <p className="text-xs font-semibold text-slate-700">No comments yet</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Post the first update or engineering observation for {activeLocation.city}.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <form 
            onSubmit={handlePostComment}
            className="p-2.5 bg-white/95 border-t border-blue-200/80 shrink-0 flex flex-col gap-1.5"
          >
            <div className="relative">
              <textarea
                value={newCommentText}
                disabled={commentSubmitting || commentsLoading}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={`Post update or site note for ${activeLocation.city}...`}
                className="w-full p-2 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none transition-all resize-none shadow-inner"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePostComment();
                  }
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">
                Posting as <strong className="text-slate-700">{currentUser}</strong>
              </span>
              <button
                type="submit"
                disabled={!newCommentText.trim() || commentSubmitting || commentsLoading}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-3 h-3" />
                <span>Post Comment</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Add Milestone Modal */}
      {showAddMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Milestone — {activeLocation.city}</h3>
                  <p className="text-[11px] text-slate-500">{project.name} · Location Checkpoint</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddMilestoneModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Milestone Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Servo Axis Alignment & Optical Gate Calibration"
                  value={newMilestoneName}
                  onChange={(e) => setNewMilestoneName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Summary of deliverables, equipment checks, and verification criteria."
                  value={newMilestoneDesc}
                  onChange={(e) => setNewMilestoneDesc(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newMilestoneStart}
                    onChange={(e) => setNewMilestoneStart(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Target End Date
                  </label>
                  <input
                    type="date"
                    value={newMilestoneEnd}
                    onChange={(e) => setNewMilestoneEnd(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMilestoneModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Milestone Details Inspection Modal */}
      {inspectingMilestone && (
        <div 
          id="milestone-details-modal"
          className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Milestone Details</h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {activeLocation.city} Facility • {project.name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectingMilestone(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Milestone Name
                </label>
                <div className="text-sm font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/80">
                  {inspectingMilestone.name}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Description & Deliverables
                </label>
                <p className="text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/80 leading-relaxed">
                  {inspectingMilestone.description || '—'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Start Date</span>
                  <span className="text-xs font-mono font-semibold text-slate-800 mt-0.5 block">
                    {formatDisplayDate(inspectingMilestone.startDate)}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">End Date</span>
                  <span className="text-xs font-mono font-semibold text-slate-800 mt-0.5 block">
                    {formatDisplayDate(inspectingMilestone.endDate)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 items-center">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Status</span>
                  <div>{renderStatusPill(inspectingMilestone.status)}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Progress</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${inspectingMilestone.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                        style={{ width: `${inspectingMilestone.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-800">{inspectingMilestone.progress}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              {inspectingMilestone.status === 'Completed' ? (
                <button
                  onClick={() => {
                    handleUpdateMilestoneStatus(inspectingMilestone.id, 'In Progress');
                    setInspectingMilestone(prev => prev ? { ...prev, status: 'In Progress', progress: 50 } : null);
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Re-open (In Progress)
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleUpdateMilestoneStatus(inspectingMilestone.id, 'Completed');
                    setInspectingMilestone(prev => prev ? { ...prev, status: 'Completed', progress: 100 } : null);
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Mark Complete</span>
                </button>
              )}

              <button
                onClick={() => setInspectingMilestone(null)}
                className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};