const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

interface UploadProjectResponse {
  success: boolean;
  message: string;
  project: {
    id: number;
    projectId: string;
    title: string;
    status: string;
    customerId: string;
    sowUploaded: boolean;
  };
}

export async function uploadProject(
  formData: FormData
): Promise<UploadProjectResponse> {
  const token = localStorage.getItem("auth_token");

  const response = await fetch(
    `${API_BASE_URL}/v1/customer/projects`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: formData,
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail;

    const message = Array.isArray(detail)
      ? detail.map((item: any) => item.msg).join(", ")
      : typeof detail === "string"
        ? detail
        : data?.message || "Unable to upload project.";

    throw new Error(message);
  }

  return data as UploadProjectResponse;
}