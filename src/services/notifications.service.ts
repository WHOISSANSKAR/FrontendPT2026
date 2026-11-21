
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

export interface NotificationApiItem {
  id: number;
  title: string;
  message: string;
  link: string | null;
  projectId: string;
  read: boolean;
  type: string;
  time: string;
}

interface NotificationListResponse {
  success: boolean;
  notifications: NotificationApiItem[];
  unread_count: number;
}

interface NotificationActionResponse {
  success: boolean;
  message: string;
}

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const handleApiError = async (response: Response): Promise<never> => {
  const errorData = await response.json().catch(() => null);
  throw new Error(
    errorData?.detail || "Notification request failed."
  );
};

export const getCustomerNotifications =
  async (): Promise<NotificationListResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/v1/customer/notifications`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      return handleApiError(response);
    }

    return response.json();
  };

export const markNotificationAsRead =
  async (notificationId: string | number): Promise<NotificationActionResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/v1/customer/notifications/${notificationId}/read`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      return handleApiError(response);
    }

    return response.json();
  };

export const markAllNotificationsAsRead =
  async (): Promise<NotificationActionResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/v1/customer/notifications/read-all`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      return handleApiError(response);
    }

    return response.json();
  };
