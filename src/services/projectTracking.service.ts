const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const API_PREFIX =
  import.meta.env.VITE_TRACKING_API_PREFIX || "/api/v1/customer";

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("auth_token");

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export class TrackingApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "TrackingApiError";
    this.status = status;
  }
}

async function trackingRequest<T>(path: string): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${API_PREFIX}${path}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    }
  );

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      responseData?.detail ||
      responseData?.message ||
      `Request failed with status ${response.status}`;

    throw new TrackingApiError(message, response.status);
  }

  if (responseData?.success === false) {
    throw new Error(
      responseData.message || "Unable to fetch project tracking data."
    );
  }

  return responseData as T;
}

// API response types

export interface TrackingProjectsResponse {
  success: boolean;
  message: string;
  total_projects: number;
  projects: TrackingProjectSummary[];
}

export interface TrackingProjectSummary {
  project_id: number | string;
  project_code: string | null;
  project_name: string | null;
  project_status: string | null;
  overall_progress: number;
  current_phase: string | null;
  total_locations: number;
  total_countries: number;
  total_milestones: number;
  completed_milestones: number;
  last_updated: string | null;
}

export interface TrackingTask {
  id: number | string;
  title: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  date_of_completion: string | null;
  status: string | null;
  service_provider_status: string | null;
  weightage: number;
  normalized_weightage: number;
  progress: number;
  proof_completion_approved: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface TrackingMilestone {
  id: number | string;
  name: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  weightage: number;
  progress: number;
  weighted_contribution: number;
  total_tasks: number;
  completed_tasks: number;
  tasks: TrackingTask[];
  created_at: string | null;
  updated_at: string | null;
}

export interface TrackingLocation {
  id: number | string;
  country: string | null;
  state: string | null;
  city: string | null;
  pincode: string | null;
  address: string | null;
  status: string | null;
  start_date?: string | null;
  end_date?: string | null;
  weightage: number;
  progress: number;
  weighted_contribution: number;
  total_milestones: number;
  completed_milestones: number;
  milestones: TrackingMilestone[];
  created_at: string | null;
  updated_at: string | null;
}

export interface TrackingProjectDetail {
  project_id: number | string;
  project_code: string | null;
  project_name: string | null;
  description: string | null;
  project_type: string | null;
  category: string | null;
  customer_name: string | null;
  customer_email: string | null;
  contact_number: string | null;
  start_date: string | null;
  end_date: string | null;
  currency: string | null;
  budget: number;
  final_price: number | null;
  plist_final_price?: number | null;
  status: string | null;
  project_status: string | null;
  project_status_description: string | null;
  project_manager_id: number | string | null;
}

export interface TrackingProjectDetailResponse {
  success: boolean;
  message: string;
  project: TrackingProjectDetail;
  overall_progress: number;
  current_phase: string | null;
  total_locations: number;
  total_countries: number;
  total_milestones: number;
  completed_milestones: number;
  last_updated: string | null;
  locations: TrackingLocation[];
}

// Fetch all customer projects for the project selector.
export const getProjects = async (): Promise<TrackingProjectsResponse> => {
  return trackingRequest<TrackingProjectsResponse>("/projects/tracking");
};

// Fetch complete tracking details for one project.
export const getProject = async (
  projectId: number | string
): Promise<TrackingProjectDetailResponse> => {
  return trackingRequest<TrackingProjectDetailResponse>(
    `/projects/${encodeURIComponent(String(projectId))}/tracking`
  );
};