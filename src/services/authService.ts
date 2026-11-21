
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

export interface CustomerLoginRequest {
  email: string;
  password: string;
}

export interface CustomerLoginUser {
  id: number;
  name: string;
  email: string;
  profile_complete: boolean;
}

export interface CustomerLoginResponse {
  success: boolean;
  message: string;
  access_token: string;
  token_type: string;
  redirect_to: string;
  user: CustomerLoginUser;
}

// changes done by vb: sign-up request/response types + customerRegister()
export interface CustomerRegisterRequest {
  name: string;
  email: string;
  password: string;
}

// The backend may return a token (auto sign-in) or just a success message.
export interface CustomerRegisterResponse {
  success: boolean;
  message?: string;
  access_token?: string;
  token_type?: string;
  redirect_to?: string;
  user?: CustomerLoginUser;
}

// changes done by vb: calls POST /v1/auth/customer/register.
// NOTE: this endpoint does not exist in pseudoteam-pybackend yet; the sign-up page shows a
// friendly message on 404/405 until the backend team adds it.
export const customerRegister = async (
  payload: CustomerRegisterRequest
): Promise<CustomerRegisterResponse> => {
  const response = await axios.post<CustomerRegisterResponse>(
    `${API_BASE_URL}/v1/auth/customer/register`,
    payload
  );

  return response.data;
};

export const customerLogin = async (
  credentials: CustomerLoginRequest
): Promise<CustomerLoginResponse> => {
  const response = await axios.post<CustomerLoginResponse>(
    `${API_BASE_URL}/v1/auth/customer/login`,
    credentials
  );

  return response.data;
};
