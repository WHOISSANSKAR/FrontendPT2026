// changes done by vb: fetch the documents uploaded for a project (used by "View Documents").
// NOTE: pseudoteam-pybackend does not have this endpoint yet. The backend stores the SOW file
// (project_list.plist_sow) but exposes no way to list or download it. Expected contract:
//   GET /api/v1/customer/projects/{project_id}/documents
//   -> [{ id, name, file_type?, size_bytes?, uploaded_at?, url }]
// Until it exists, the request returns 404 and the UI shows a "not available yet" message.
import axios from "axios";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

export interface ProjectDocument {
  id: string | number;
  name: string;
  file_type?: string;
  size_bytes?: number;
  uploaded_at?: string;
  url?: string;
}

export class DocumentsUnavailableError extends Error {}

export const getProjectDocuments = async (projectId: string): Promise<ProjectDocument[]> => {
  const token = localStorage.getItem("auth_token");
  try {
    const res = await axios.get(
      `${API_BASE_URL}/v1/customer/projects/${encodeURIComponent(projectId)}/documents`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    const data = res.data;
    const list = Array.isArray(data) ? data : Array.isArray(data?.documents) ? data.documents : [];
    return list as ProjectDocument[];
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 404 || status === 405) {
      throw new DocumentsUnavailableError("Document viewing is not available yet.");
    }
    throw new Error(
      typeof error?.response?.data?.detail === "string"
        ? error.response.data.detail
        : "Unable to load documents."
    );
  }
};

/** Make relative URLs from the API absolute against the API host. */
export const resolveDocumentUrl = (url?: string) => {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  const origin = API_BASE_URL.replace(/\/api$/, "");
  return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
};
