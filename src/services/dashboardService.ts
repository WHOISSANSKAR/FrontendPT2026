
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

export interface DashboardResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    name: string;
    username: string | null;
    email: string;
    profile_complete: boolean;
  };
  dashboard: {
    projects: any[];
    recentProjects: any[];
    projectKpis: {
      totalProjects: number;
      notStarted: number;
      inProgress: number;
      completed: number;
      critical: number;
    };
    projectProgress: any[];
    overallProgress: number;
    unreadNotificationsCount: number;
    notifications: any[];
    cartCount: number;
    addedToCart: any[];
    calendarEvents: any[];
  };
}

export const getCustomerDashboard =
  async (): Promise<DashboardResponse> => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Authentication token not found.");
    }

    const response = await fetch(
      `${API_BASE_URL}/v1/customer/dashboard`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      throw new Error(
        errorData?.detail || "Failed to fetch dashboard data."
      );
    }

    return response.json();
  };
