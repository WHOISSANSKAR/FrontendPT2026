import { OrderItem } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const API_PREFIX =
  import.meta.env.VITE_ORDERS_API_PREFIX || "/api/v1/customer";

export interface OrderPlacedApiRow {
  ordplcd_id: number | string;
  ordplcd_hw_id: string;
  ordplcd_customer_id: string;
  ordplcd_address: string | null;
  ordplcd_qty_placed: number;
  ordplcd_no_of_items: number;
  ordplcd_order_no: string;
  ordplcd_amt: number | string;
  ordplcd_status: string;
  ordplcd_delivery_date: string | null;
  ordplcd_order_date: string;
  ordplcd_sp_id: string | null;
  ordplcd_final_qty: number | null;
  ordplcd_final_amount: number | string | null;
  created_at: string | null;
  updated_at: string | null;
  // Optional enriched fields if backend joins hardware/SP tables
  hw_name?: string | null;
  sp_name?: string | null;
  currency?: string | null;
}

export interface CustomerOrdersResponse {
  success: boolean;
  message: string;
  total_orders: number;
  orders: OrderPlacedApiRow[];
}

export interface MappedOrderItem extends OrderItem {
  rawOrderDate: string;
  deliveryDate?: string;
  address?: string;
  qtyPlaced: number;
  finalQty?: number;
  rawAmount: number;
  finalAmount?: number;
  hwId: string;
  spId?: string;
}

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("auth_token");
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const normalizeOrderStatus = (rawStatus: string): OrderItem["status"] => {
  const s = String(rawStatus || "").trim().toLowerCase();
  if (s === "delivered" || s === "completed") return "Delivered";
  if (s === "processing" || s === "in progress" || s === "dispatched" || s === "shipped") {
    return "Processing";
  }
  if (s === "cancelled" || s === "canceled" || s === "rejected") return "Cancelled";
  return "Pending";
};

const formatDisplayDate = (raw?: string | null): string => {
  if (!raw) return "—";
  const trimmed = String(raw).trim();
  if (!trimmed) return "—";

  // Match YYYY-MM-DD
  const iso = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }

  // Match DD-MM-YYYY or DD/MM/YYYY
  const dmy = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmy) {
    const d = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return trimmed;
};

const formatCurrencyAmount = (amount: number, currency?: string | null): string => {
  const code = (currency || "INR").toUpperCase();
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${code} ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  }
};

export const mapOrderRowToOrderItem = (row: OrderPlacedApiRow): MappedOrderItem => {
  const orderNumber = row.ordplcd_order_no?.startsWith("#")
    ? row.ordplcd_order_no
    : `#${row.ordplcd_order_no || row.ordplcd_id}`;

  const effectiveAmount =
    row.ordplcd_final_amount !== null && row.ordplcd_final_amount !== undefined
      ? Number(row.ordplcd_final_amount)
      : Number(row.ordplcd_amt || 0);

  const effectiveQty =
    row.ordplcd_final_qty !== null && row.ordplcd_final_qty !== undefined
      ? Number(row.ordplcd_final_qty)
      : Number(row.ordplcd_qty_placed || 0);

  const itemsCount = Number(row.ordplcd_no_of_items || 1);

  const vendorLabel =
    row.sp_name ||
    (row.ordplcd_sp_id ? `Vendor #${row.ordplcd_sp_id}` : "PseudoTeam Procurement");

  const detailParts: string[] = [];
  if (row.hw_name) {
    detailParts.push(row.hw_name);
  } else if (row.ordplcd_hw_id) {
    detailParts.push(`Hardware ID: ${row.ordplcd_hw_id}`);
  }
  detailParts.push(`Qty: ${effectiveQty}`);
  if (row.ordplcd_delivery_date) {
    detailParts.push(`Delivery: ${formatDisplayDate(row.ordplcd_delivery_date)}`);
  }
  if (row.ordplcd_address) {
    detailParts.push(row.ordplcd_address);
  }

  return {
    id: String(row.ordplcd_id),
    orderNumber,
    vendor: vendorLabel,
    itemsCount,
    itemsDetail: detailParts,
    totalAmount: formatCurrencyAmount(effectiveAmount, row.currency),
    status: normalizeOrderStatus(row.ordplcd_status),
    date: formatDisplayDate(row.ordplcd_order_date || row.created_at),
    rawOrderDate: row.ordplcd_order_date || row.created_at || "",
    deliveryDate: row.ordplcd_delivery_date
      ? formatDisplayDate(row.ordplcd_delivery_date)
      : undefined,
    address: row.ordplcd_address || undefined,
    qtyPlaced: Number(row.ordplcd_qty_placed || 0),
    finalQty:
      row.ordplcd_final_qty !== null && row.ordplcd_final_qty !== undefined
        ? Number(row.ordplcd_final_qty)
        : undefined,
    rawAmount: Number(row.ordplcd_amt || 0),
    finalAmount:
      row.ordplcd_final_amount !== null && row.ordplcd_final_amount !== undefined
        ? Number(row.ordplcd_final_amount)
        : undefined,
    hwId: row.ordplcd_hw_id,
    spId: row.ordplcd_sp_id || undefined,
  };
};

// changes done by vb: the orders endpoint that is live in the backend (app/services/order_service.py)
// returns camelCase fields (orderNumber, status, date, amount, ...), while this service was written for
// raw orders_placed columns (ordplcd_order_no, ...) from the unfinished customer_orders.py. That mismatch
// showed "#undefined" on screen. This converter renames camelCase rows to the raw column names BEFORE the
// existing mapOrderRowToOrderItem runs. Rows that already use raw column names pass through untouched,
// so the existing mapping is unchanged and keeps working once customer_orders.py is finished.
type CamelCaseOrderRow = {
  id?: number | string;
  orderNumber?: string;
  vendor?: string | null;
  itemsCount?: number;
  itemDescription?: string | null;
  status?: string;
  date?: string | null;
  hardwareId?: string | number | null;
  quantityPlaced?: number;
  finalQuantity?: number | null;
  amount?: number | string;
  finalAmount?: number | string | null;
  address?: string | null;
  deliveryDate?: string | null;
  supplierId?: string | null;
  supplierEmail?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const toRawOrderRow = (row: OrderPlacedApiRow | CamelCaseOrderRow): OrderPlacedApiRow => {
  // Already in raw column format → leave exactly as it is.
  if (row && typeof row === "object" && "ordplcd_order_no" in row) {
    return row as OrderPlacedApiRow;
  }

  const c = (row || {}) as CamelCaseOrderRow;
  // "Supplier" is the backend's placeholder when no supplier is known — treat it as no name.
  const supplierName =
    c.vendor && c.vendor !== "Supplier" ? c.vendor : c.supplierEmail || null;

  return {
    ordplcd_id: c.id ?? "",
    ordplcd_hw_id: c.hardwareId != null ? String(c.hardwareId) : "",
    ordplcd_customer_id: "",
    ordplcd_address: c.address ?? null,
    ordplcd_qty_placed: Number(c.quantityPlaced ?? 0),
    ordplcd_no_of_items: Number(c.itemsCount ?? 1),
    ordplcd_order_no: c.orderNumber ?? "",
    ordplcd_amt: c.amount ?? 0,
    ordplcd_status: c.status ?? "",
    ordplcd_delivery_date: c.deliveryDate ?? null,
    ordplcd_order_date: c.date ?? "",
    ordplcd_sp_id: c.supplierId ?? null,
    ordplcd_final_qty: c.finalQuantity ?? null,
    ordplcd_final_amount: c.finalAmount ?? null,
    created_at: c.createdAt ?? null,
    updated_at: c.updatedAt ?? null,
    hw_name: c.itemDescription ?? null,
    sp_name: supplierName,
  };
};

export const getCustomerOrders = async (): Promise<MappedOrderItem[]> => {
  const response = await fetch(`${API_BASE_URL}${API_PREFIX}/orders`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || `Failed to load orders (${response.status})`
    );
  }

  if (data?.success === false) {
    throw new Error(data.message || "Unable to fetch customer orders.");
  }

  const rows: OrderPlacedApiRow[] = Array.isArray(data?.orders) ? data.orders : [];
  // changes done by vb: normalise each row to raw column names first (see toRawOrderRow above)
  return rows.map(toRawOrderRow).map(mapOrderRowToOrderItem);
};