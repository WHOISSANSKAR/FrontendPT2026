// changes done by vb
import { MilestoneTaskActivity } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const API_PREFIX = import.meta.env.VITE_ORDERS_API_PREFIX || '/api/v1/customer';

const pick = (o: Record<string, unknown>, ...keys: string[]): unknown => {
  for (const k of keys) {
    if (o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k];
  }
  return undefined;
};

const normalizeActivity = (raw: unknown, index: number): MilestoneTaskActivity => {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(pick(o, 'id', 'tconv_id') ?? index),
    user: String(pick(o, 'author', 'user', 'comment_by', 'commentBy') ?? 'PseudoTeam'),
    role: String(pick(o, 'role') ?? 'Admin'),
    text: String(pick(o, 'comment', 'text', 'tconv_comment') ?? ''),
    timestamp: String(
      pick(o, 'comment_date_time', 'commentDateTime', 'tconv_comment_date_time', 'timestamp', 'created_at', 'createdAt') ?? ''
    ),
    type: 'comment',
  };
};

export const getTaskActivity = async (taskId: string): Promise<MilestoneTaskActivity[]> => {
  const token = localStorage.getItem('auth_token');
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${API_PREFIX}/tasks/${encodeURIComponent(taskId)}/activity`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new Error('Unable to reach the server. Please try again.');
  }

  if (res.status === 404 || res.status === 405) return [];

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(typeof data?.detail === 'string' ? data.detail : `Unable to load activity (${res.status}).`);
  }

  const rows: unknown[] = Array.isArray(data) ? data : Array.isArray(data?.activities) ? data.activities : [];
  return rows.map(normalizeActivity).filter((a) => a.text.trim() !== '');
};
