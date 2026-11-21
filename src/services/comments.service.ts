
import type { LocationComment } from "../types";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

interface ApiLocationComment {
  id: string | number;
  author: string;
  role: string;
  avatar?: string;
  text: string;
  timestamp: string;
  edited?: boolean;
}

interface CommentsResponse {
  success: boolean;
  comments: ApiLocationComment[];
  message?: string;
  detail?: string;
}

interface CommentResponse {
  success: boolean;
  comment: ApiLocationComment;
  message?: string;
  detail?: string;
}

interface DeleteCommentResponse {
  success: boolean;
  message?: string;
  detail?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || `Request failed (${response.status})`
    );
  }

  if (data.success === false) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data as T;
}

function mapComment(comment: ApiLocationComment): LocationComment {
  return {
    id: String(comment.id),
    author: comment.author,
    role: comment.role,
    avatar: comment.avatar,
    text: comment.text,
    timestamp: comment.timestamp,
    edited: comment.edited ?? false,
  };
}

// GET: Fetch comments for a location
export async function getLocationComments(
  locationId: string | number
): Promise<LocationComment[]> {
  const response = await fetch(
    `${API_BASE_URL}/v1/customer/comments/locations/${locationId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await handleResponse<CommentsResponse>(response);

  return data.comments.map(mapComment);
}

// POST: Create a comment
export async function createLocationComment(
  locationId: string | number,
  text: string
): Promise<LocationComment> {
  const response = await fetch(
    `${API_BASE_URL}/v1/customer/comments/locations/${locationId}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    }
  );

  const data = await handleResponse<CommentResponse>(response);

  return mapComment(data.comment);
}

// PATCH: Update a comment
export async function updateLocationComment(
  commentId: string | number,
  text: string
): Promise<LocationComment> {
  const response = await fetch(
    `${API_BASE_URL}/v1/customer/comments/${commentId}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    }
  );

  const data = await handleResponse<CommentResponse>(response);

  return mapComment(data.comment);
}

// DELETE: Delete a comment
export async function deleteLocationComment(
  commentId: string | number
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/v1/customer/comments/${commentId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  await handleResponse<DeleteCommentResponse>(response);
}
