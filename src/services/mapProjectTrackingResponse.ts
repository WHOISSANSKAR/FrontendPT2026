import {
  ProjectItem,
  ProjectLocation,
  LocationMilestone,
  ProjectStatus,
  MilestoneTask,
} from "../types";

import {
  TrackingProjectSummary,
  TrackingProjectDetailResponse,
  TrackingLocation,
  TrackingMilestone,
  TrackingTask,
} from "./projectTracking.service";

const toId = (value: number | string | null | undefined): string => {
  return value == null ? "" : String(value);
};

const toIsoDateOnly = (value: string | null | undefined): string | undefined => {
  if (!value) return undefined;
  const trimmed = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }
  const dmyMatch = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})/);
  if (dmyMatch) {
    const [, dd, mm, yyyy] = dmyMatch;
    return `${yyyy}-${mm}-${dd}`;
  }
  return undefined;
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) return "—";

  const iso = toIsoDateOnly(value);
  const date = iso ? new Date(`${iso}T00:00:00`) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatBudget = (
  amount: number | null | undefined,
  currency: string | null | undefined
): string => {
  if (amount == null) return "—";

  if (!currency) {
    return String(amount);
  }

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

export const mapTrackingProjectSummary = (
  item: TrackingProjectSummary
): ProjectItem => {
  return {
    id: toId(item.project_id),
    code: item.project_code || toId(item.project_id),
    name: item.project_name || "Untitled Project",

    customer: "—",
    category: "—",

    status: (item.project_status || "Not Started") as ProjectStatus,
    progress: Number(item.overall_progress || 0),

    currentPhase: item.current_phase || "Not Started",
    velocity: "—",
    manager: "—",

    startDate: "—",
    expectedCompletion: "—",
    budget: "—",
    finalBudget: "—",

    lastUpdated: formatDate(item.last_updated),

    milestonesCount: Number(item.total_milestones || 0),
    completedMilestones: Number(item.completed_milestones || 0),

    locationsCount: Number(item.total_locations || 0),
    countriesCount: Number(item.total_countries || 0),

    locations: [],
  };
};

const mapTaskStatus = (
  status: string | null | undefined
): MilestoneTask["status"] => {
  const normalizedStatus = (status || "").toLowerCase().trim();

  switch (normalizedStatus) {
    case "completed":
    case "fulfilled":
    case "fullfilled":
      return "Completed";

    case "in progress":
      return "In Progress";

    case "at risk":
      return "At Risk";

    case "not started":
      return "Not Started";

    case "pending":
    default:
      return "Pending";
  }
};

type ExtendedTrackingTask = TrackingTask & {
  service_provider_status?: string | null;
  proof_completion_approved?: boolean;
  has_poc_blob?: boolean;
  poc_available?: boolean;
  poc_approved?: boolean;
  poc_url?: string | null;
  poc_file_url?: string | null;
  poc_file_name?: string | null;
  poc_notes?: string | null;
  can_view_poc?: boolean;
};

const mapTrackingTask = (
  task: ExtendedTrackingTask,
  index: number
): MilestoneTask => {
  const effectiveStatus =
    ["fulfilled", "fullfilled", "completed"].includes(
      String(task.service_provider_status || "").trim().toLowerCase()
    )
      ? task.service_provider_status
      : task.status;

  return {
    id: toId(task.id),
    name: task.title || "Untitled Task",
    taskNumber: `TASK ${String(index + 1).padStart(2, "0")}`,
    description: task.description || "",
    status: mapTaskStatus(effectiveStatus),
    weightage: Number(task.weightage || 0),
    progress: Number(task.progress || 0),
    startDate: toIsoDateOnly(task.start_date) || formatDate(task.start_date),
    endDate: toIsoDateOnly(task.end_date) || formatDate(task.end_date),
    activities: [],
    service_provider_status: task.service_provider_status ?? null,
    proof_completion_approved: task.proof_completion_approved,
    has_poc_blob: task.has_poc_blob,
    poc_available: task.poc_available,
    poc_approved: task.poc_approved,
    poc_url: task.poc_url ?? null,
    poc_file_url: task.poc_file_url ?? null,
    poc_file_name: task.poc_file_name ?? null,
    poc_notes: task.poc_notes ?? null,
    can_view_poc: task.can_view_poc,
  } as MilestoneTask;
};

const mapTrackingMilestone = (
  milestone: TrackingMilestone
): LocationMilestone => {
  const tasks: MilestoneTask[] = (milestone.tasks || []).map(
    (task, index) => mapTrackingTask(task, index)
  );

  return {
    id: toId(milestone.id),
    name: milestone.name || "Untitled Milestone",
    description: milestone.description || "",
    startDate: toIsoDateOnly(milestone.start_date) || formatDate(milestone.start_date),
    endDate: toIsoDateOnly(milestone.end_date) || formatDate(milestone.end_date),
    status: (milestone.status || "Pending") as LocationMilestone["status"],
    progress: Number(milestone.progress || 0),
    tasks,
  };
};

const mapTrackingLocation = (
  location: TrackingLocation
): ProjectLocation => {
  const milestones = (location.milestones || []).map(
    mapTrackingMilestone
  );

  const currentMilestone =
    milestones.find(
      (milestone) =>
        String(milestone.status).toLowerCase() === "in progress"
    ) || milestones[0];

  return {
    id: toId(location.id),
    country: location.country || "—",
    countryCode: "",
    state: location.state || "—",
    city: location.city || "—",
    phase: currentMilestone?.name || "Not Started",
    status: (location.status || "Pending") as ProjectLocation["status"],
    progress: Number(location.progress || 0),
    startDate: toIsoDateOnly(location.start_date),
    endDate: toIsoDateOnly(location.end_date),
    assignedTeam: "—",
    lastUpdated: formatDate(location.updated_at || location.created_at),
    milestones,
    comments: [],
  };
};

export const mapProjectTrackingDetail = (
  response: TrackingProjectDetailResponse
): ProjectItem => {
  const project = response.project as TrackingProjectDetailResponse["project"] & {
    final_price?: number | null;
    plist_final_price?: number | null;
    final_budget?: number | null;
  };

  const locations = (response.locations || []).map(
    mapTrackingLocation
  );

  const rawFinalBudget =
    project.final_price ??
    project.plist_final_price ??
    project.final_budget ??
    null;

  return {
    id: toId(project.project_id),
    code: project.project_code || toId(project.project_id),
    name: project.project_name || "Untitled Project",
    customer: project.customer_name || "—",
    category: project.category || project.project_type || "—",
    status: (
      project.project_status ||
      project.status ||
      "Not Started"
    ) as ProjectStatus,
    progress: Number(response.overall_progress || 0),
    currentPhase: response.current_phase || "Not Started",
    velocity: "—",
    manager: project.project_manager_id
      ? String(project.project_manager_id)
      : "—",
    startDate: formatDate(project.start_date),
    expectedCompletion: formatDate(project.end_date),
    budget: formatBudget(project.budget, project.currency),
    finalBudget: formatBudget(rawFinalBudget, project.currency),
    lastUpdated: formatDate(response.last_updated),
    milestonesCount: Number(response.total_milestones || 0),
    completedMilestones: Number(response.completed_milestones || 0),
    locationsCount: Number(response.total_locations ?? locations.length),
    countriesCount: Number(response.total_countries || 0),
    locations,
  };
};