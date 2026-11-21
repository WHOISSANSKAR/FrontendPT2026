
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

export interface CriticalSpareApiItem {
  id: number;
  serialNo: string | null;
  hwIdentifier: string | null;
  modelNo: string | null;
  name: string | null;
  qty: number | null;
  stock: number | null;
  family: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  price: number | null;
  spEmail: string | null;
  spId: number | string | null;
  status: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CriticalSparesResponse {
  success: boolean;
  message: string;
  total_spares: number;
  spares: CriticalSpareApiItem[];
}

export async function getCriticalSpares(): Promise<CriticalSparesResponse> {
  const token = localStorage.getItem("auth_token");

  const response = await fetch(
   `${API_BASE_URL}/v1/customer/critical-spares/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : data?.message || "Unable to fetch critical spares.";

    throw new Error(message);
  }

  return data as CriticalSparesResponse;
}
