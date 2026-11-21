
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

// ==================================================
// TICKET API INTERFACES
// ==================================================

export interface TicketApiItem {
  id: number;
  ticketNumber: string;
  title: string;
  description: string | null;
  project: string;
  projectId: number | string | null;
  status: string;
  createdDate: string;
  dateTime: string | null;
  conversationId: number | string | null;
  assignedToPtId: number | string | null;
  assignedToSpId: number | string | null;
  attachmentAvailable: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  assignee: string | null;
}

export interface TicketsResponse {
  success: boolean;
  message: string;
  counts: {
    open: number;
    in_progress: number;
    resolved: number;
    total: number;
  };
  total_tickets: number;
  tickets: TicketApiItem[];
}

export interface TicketDetailResponse {
  success: boolean;
  message: string;
  ticket: TicketApiItem;
}

export interface CreateTicketResponse {
  success: boolean;
  message: string;
  ticket: TicketApiItem;
}

export interface CreateTicketPayload {
  projectId: number | string;
  title: string;
  description?: string;
  attachment?: File | null;
}

// ==================================================
// AUTHENTICATION HEADERS
// ==================================================

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

// JSON headers for JSON requests
function getJsonAuthHeaders(): HeadersInit {
  return {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
  };
}

// ==================================================
// COMMON API ERROR HANDLER
// ==================================================

function getApiErrorMessage(data: any, fallback: string): string {
  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item: any) => item.msg || "Validation error")
      .join(", ");
  }

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  return fallback;
}

// ==================================================
// CREATE CUSTOMER TICKET
// POST /api/v1/customer/tickets/
// ==================================================

export async function createCustomerTicket(
  payload: CreateTicketPayload
): Promise<CreateTicketResponse> {
  const formData = new FormData();

  formData.append("project_id", String(payload.projectId));
  formData.append("title", payload.title.trim());
  formData.append("description", payload.description?.trim() || "");

  if (payload.attachment) {
    formData.append("attachment", payload.attachment);
  }

  const response = await fetch(
    `${API_BASE_URL}/v1/customer/tickets/`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: formData,
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, "Unable to create ticket.")
    );
  }

  return data as CreateTicketResponse;
}

// ==================================================
// GET ALL CUSTOMER TICKETS
// GET /api/v1/customer/tickets/
// ==================================================

export async function getCustomerTickets(): Promise<TicketsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/v1/customer/tickets/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, "Unable to fetch tickets.")
    );
  }

  return data as TicketsResponse;
}

// ==================================================
// GET SINGLE CUSTOMER TICKET
// GET /api/v1/customer/tickets/{ticket_id}
// ==================================================

export async function getCustomerTicketDetail(
  ticketId: string | number
): Promise<TicketDetailResponse> {
  const response = await fetch(
    `${API_BASE_URL}/v1/customer/tickets/${ticketId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, "Unable to fetch ticket details.")
    );
  }

  return data as TicketDetailResponse;
}

// ==================================================
// UPDATE CUSTOMER TICKET STATUS
// PATCH /api/v1/customer/tickets/{ticket_id}/status
// ==================================================

export async function updateCustomerTicketStatus(
  ticketId: string | number,
  status: string
) {
  const response = await fetch(
    `${API_BASE_URL}/v1/customer/tickets/${ticketId}/status`,
    {
      method: "PATCH",
      headers: getJsonAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({ status }),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, "Unable to update ticket status.")
    );
  }

  return data;
}

// ==================================================
// DOWNLOAD CUSTOMER TICKET ATTACHMENT
// GET /api/v1/customer/tickets/{ticket_id}/attachment
// ==================================================

export async function downloadCustomerTicketAttachment(
  ticketId: string | number
): Promise<Blob> {
  const response = await fetch(
    `${API_BASE_URL}/v1/customer/tickets/${ticketId}/attachment`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      getApiErrorMessage(data, "Unable to download attachment.")
    );
  }

  return response.blob();
}