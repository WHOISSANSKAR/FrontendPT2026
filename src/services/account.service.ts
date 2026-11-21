
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

// ==================================================
// ACCOUNT PROFILE INTERFACE
// ==================================================

export interface AccountProfile {
  id: number;
  username: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  userType: string | null;
  organization: string | null;

  country: string | null;
  state: string | null;
  address: string | null;
  pincode: string | null;

  about: string | null;
  cin: string | null;
  gstNumber: string | null;
  aadhaarNumber: string | null;
  aadhaarFileName: string | null;

  body: string | null;
  dateOfRegistration: string | null;
  referredBy: string | null;
  promoCode: string | null;

  verified: boolean;
  profileCompletion: string | number | null;
  loginEnabled: boolean;
  hasAvatar: boolean;

  createdAt: string | null;
  updatedAt: string | null;
}

export interface AccountResponse {
  success: boolean;
  message: string;
  profile: AccountProfile;
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

function getJsonAuthHeaders(): HeadersInit {
  return {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
  };
}

// ==================================================
// COMMON ERROR HANDLER
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
// GET ACCOUNT PROFILE
// GET /api/v1/customer/account/
// ==================================================

export async function getAccountProfile(): Promise<AccountResponse> {
  const response = await fetch(
    `${API_BASE_URL}/v1/customer/account/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, "Unable to fetch account profile.")
    );
  }

  return data as AccountResponse;
}

// ==================================================
// UPDATE PROFILE
// PATCH /api/v1/customer/account/profile
// ==================================================

export async function updateAccountProfile(payload: {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  user_type?: string;
  organization?: string;
}) {
  const response = await fetch(
    `${API_BASE_URL}/v1/customer/account/profile`,
    {
      method: "PATCH",
      headers: getJsonAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, "Unable to update profile.")
    );
  }

  return data as AccountResponse;
}

// ==================================================
// UPDATE LOCATION
// PATCH /api/v1/customer/account/location
// ==================================================

export async function updateAccountLocation(payload: {
  country?: string;
  state?: string;
  address?: string;
  pincode?: string;
}) {
  const response = await fetch(
    `${API_BASE_URL}/v1/customer/account/location`,
    {
      method: "PATCH",
      headers: getJsonAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, "Unable to update location.")
    );
  }

  return data as AccountResponse;
}

// ==================================================
// UPDATE IDENTITY
// PATCH /api/v1/customer/account/identity
// ==================================================

export async function updateAccountIdentity(payload: {
  about?: string;
  organization_name?: string;
  cin?: string;
  gst_number?: string;
  aadhaar_number?: string;
  aadhaar_file_name?: string;
}) {
  const response = await fetch(
    `${API_BASE_URL}/v1/customer/account/identity`,
    {
      method: "PATCH",
      headers: getJsonAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, "Unable to update identity information.")
    );
  }

  return data as AccountResponse;
}

// ==================================================
// UPDATE PASSWORD
// PATCH /api/v1/customer/account/password
// ==================================================

export async function updateAccountPassword(payload: {
  current_password: string;
  new_password: string;
}) {
  const response = await fetch(
    `${API_BASE_URL}/v1/customer/account/password`,
    {
      method: "PATCH",
      headers: getJsonAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, "Unable to update password.")
    );
  }

  return data;
}


// ==================================================
// GET PROFILE PICTURE
// GET /api/v1/customer/account/avatar
// ==================================================

export async function getAccountAvatar(): Promise<string> {
  const response = await fetch(
    `${API_BASE_URL}/v1/customer/account/avatar`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      getApiErrorMessage(data, "Unable to fetch profile picture.")
    );
  }

  const imageBlob = await response.blob();

  return URL.createObjectURL(imageBlob);
}


// ==================================================
// UPLOAD PROFILE PICTURE
// PUT /api/v1/customer/account/avatar
// ==================================================

export async function uploadAccountAvatar(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/v1/customer/account/avatar`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      credentials: "include",
      body: formData,
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, "Unable to upload profile picture.")
    );
  }

  return data;
}


// ==================================================
// DELETE PROFILE PICTURE
// DELETE /api/v1/customer/account/avatar
// ==================================================

export async function deleteAccountAvatar() {
  const response = await fetch(
    `${API_BASE_URL}/v1/customer/account/avatar`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, "Unable to remove profile picture.")
    );
  }

  return data;
}
