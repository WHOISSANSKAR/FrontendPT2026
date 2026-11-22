// changes done by vb: Minutes of Meeting (MOM) for a project — read-only for the customer.
// The admin records each meeting (what was discussed, changes to locations/tasks, action items);
// the customer only sees the latest saved MOMs. No mock data: everything comes from the backend.
//
// Backend contract this expects (not in pseudoteam-pybackend yet — admin side to be built):
//   GET /api/v1/customer/projects/{project_id}/moms
//   -> { "success": true, "moms": [ MOM, ... ] }   (a plain array is also accepted)
//
//   MOM = {
//     id, phase, milestone, task,
//     prepared_by, prepared_on, meeting_type,
//     attendees_present: string[] | "A, B",  attendees_absent: string[] | "C, D",
//     agenda: string[] | "line 1\nline 2",    summary: string,
//     action_items: [ { action, owner, due_date, status } ],
//     next_meeting, updated_at
//   }
// camelCase keys (preparedBy, actionItems, dueDate, ...) are accepted too.
// Until the endpoint exists the request returns 404 and the UI shows a friendly empty state.

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
).replace(/\/$/, '');

export interface MomActionItem {
  action: string;
  owner: string;
  dueDate: string;
  status: string;
}

export interface ProjectMom {
  id: string;
  phase: string;
  milestone: string;
  task: string;
  preparedBy: string;
  preparedOn: string;
  meetingType: string;
  present: string[];
  absent: string[];
  agenda: string[];
  summary: string;
  actionItems: MomActionItem[];
  nextMeeting: string;
  updatedAt: string;
}

export class MomUnavailableError extends Error {}

type Raw = Record<string, unknown>;

const pick = (o: Raw, ...keys: string[]): unknown => {
  for (const k of keys) {
    if (o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k];
  }
  return undefined;
};

const str = (v: unknown): string => (v === undefined || v === null ? '' : String(v).trim());

/** Accept an array, or a comma/newline separated string. */
const list = (v: unknown, splitter: RegExp): string[] => {
  if (Array.isArray(v)) return v.map((x) => str(x)).filter(Boolean);
  const s = str(v);
  return s ? s.split(splitter).map((x) => x.trim()).filter(Boolean) : [];
};

const toActionItem = (a: unknown): MomActionItem => {
  const o = (a && typeof a === 'object' ? a : {}) as Raw;
  return {
    action: str(pick(o, 'action', 'title', 'description')),
    owner: str(pick(o, 'owner', 'assigned_to', 'assignedTo')),
    dueDate: str(pick(o, 'due_date', 'dueDate', 'due')),
    status: str(pick(o, 'status')) || 'Open',
  };
};

export const normalizeMom = (raw: unknown, index = 0): ProjectMom => {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Raw;
  const actions = pick(o, 'action_items', 'actionItems', 'actions');
  return {
    id: str(pick(o, 'id', 'mom_id', 'momId')) || `mom-${index}`,
    phase: str(pick(o, 'phase')),
    milestone: str(pick(o, 'milestone', 'milestone_name', 'milestoneName')),
    task: str(pick(o, 'task', 'task_name', 'taskName')),
    preparedBy: str(pick(o, 'prepared_by', 'preparedBy')),
    preparedOn: str(pick(o, 'prepared_on', 'preparedOn', 'meeting_date', 'meetingDate', 'created_at', 'createdAt')),
    meetingType: str(pick(o, 'meeting_type', 'meetingType', 'type')),
    present: list(pick(o, 'attendees_present', 'attendeesPresent', 'present'), /[,\n]/),
    absent: list(pick(o, 'attendees_absent', 'attendeesAbsent', 'absent'), /[,\n]/),
    agenda: list(pick(o, 'agenda'), /\n/),
    summary: str(pick(o, 'summary', 'discussion', 'notes')),
    actionItems: Array.isArray(actions) ? actions.map(toActionItem).filter((a) => a.action) : [],
    nextMeeting: str(pick(o, 'next_meeting', 'nextMeeting')),
    updatedAt: str(pick(o, 'updated_at', 'updatedAt')),
  };
};

export const getProjectMoms = async (projectId: string): Promise<ProjectMom[]> => {
  const token = localStorage.getItem('auth_token');
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/v1/customer/projects/${encodeURIComponent(projectId)}/moms`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new Error('Unable to reach the server. Please try again.');
  }

  if (res.status === 404 || res.status === 405) {
    throw new MomUnavailableError('Meeting minutes are not available yet.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      typeof data?.detail === 'string' ? data.detail : `Unable to load meeting minutes (${res.status}).`
    );
  }

  const rows: unknown[] = Array.isArray(data) ? data : Array.isArray(data?.moms) ? data.moms : [];
  return rows.map(normalizeMom);
};
