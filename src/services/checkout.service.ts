// changes done by vb
import { getCustomerOrders, MappedOrderItem } from "./orders.service";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const API_PREFIX = import.meta.env.VITE_ORDERS_API_PREFIX || "/api/v1/customer";

export interface DeliveryAddress {
  id: number;
  address: string;
  createdAt?: string | null;
}

export interface PlaceOrderLine {
  hardwareId: number;
  quantity: number;
}

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem("auth_token");
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const errorText = (data: any, fallback: string): string => {
  const d = data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d) && d[0]?.msg) return String(d[0].msg);
  return data?.message || fallback;
};

const request = async (path: string, init: RequestInit, fallback: string) => {
  const res = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, {
    ...init,
    headers: authHeaders(),
    credentials: "include",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.success === false) {
    throw new Error(errorText(data, `${fallback} (${res.status})`));
  }
  return data;
};

const toAddress = (a: any): DeliveryAddress => ({
  id: Number(a.id),
  address: String(a.address ?? ""),
  createdAt: a.created_at ?? null,
});

export const getDeliveryAddresses = async (): Promise<DeliveryAddress[]> => {
  const data = await request("/order-addresses", { method: "GET" }, "Unable to load saved addresses");
  return Array.isArray(data?.addresses) ? data.addresses.map(toAddress) : [];
};

export const addDeliveryAddress = async (address: string): Promise<DeliveryAddress> => {
  const data = await request(
    "/order-addresses",
    { method: "POST", body: JSON.stringify({ address }) },
    "Unable to save address"
  );
  return toAddress(data.address);
};

export const placeCartOrder = async (
  addressId: number,
  lines: PlaceOrderLine[]
): Promise<{ placed: number; orders: MappedOrderItem[] }> => {
  const data = await request(
    "/orders/place",
    {
      method: "POST",
      body: JSON.stringify({
        address_id: addressId,
        items: lines.map((l) => ({ hardware_id: l.hardwareId, quantity: l.quantity })),
      }),
    },
    "Unable to place order"
  );
  const placed = Array.isArray(data?.orders) ? data.orders.length : 0;
  const orders = await getCustomerOrders();
  return { placed, orders };
};
