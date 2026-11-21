
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

export interface TodoApiItem {
  td_id: number;
  td_user_id: number;
  td_user_type: string;
  td_event: string;
  td_date: string;
  td_status: "pending" | "completed";
}

export interface CreateTodoPayload {
  td_event: string;
  td_date: string;
}

export interface UpdateTodoPayload {
  td_event?: string;
  td_date?: string;
}

export interface UpdateTodoStatusPayload {
  td_status: "pending" | "completed";
}

interface TodoDeleteResponse {
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
    errorData?.detail || "Todo request failed."
  );
};

// Get all Todos
export const getCustomerTodos = async (): Promise<TodoApiItem[]> => {
  const response = await fetch(`${API_BASE_URL}/v1/todo/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return handleApiError(response);
  }

  return response.json();
};

// Create a Todo
export const createTodo = async (
  payload: CreateTodoPayload
): Promise<TodoApiItem> => {
  const response = await fetch(`${API_BASE_URL}/v1/todo/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return handleApiError(response);
  }

  return response.json();
};

// Update a Todo
export const updateTodo = async (
  todoId: number,
  payload: UpdateTodoPayload
): Promise<TodoApiItem> => {
  const response = await fetch(
    `${API_BASE_URL}/v1/todo/${todoId}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    return handleApiError(response);
  }

  return response.json();
};

// Mark Todo as completed or pending
export const updateTodoStatus = async (
  todoId: number,
  payload: UpdateTodoStatusPayload
): Promise<TodoApiItem> => {
  const response = await fetch(
    `${API_BASE_URL}/v1/todo/${todoId}/status`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    return handleApiError(response);
  }

  return response.json();
};

// Delete a Todo
export const deleteTodo = async (
  todoId: number
): Promise<TodoDeleteResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/v1/todo/${todoId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    return handleApiError(response);
  }

  return response.json();
};
