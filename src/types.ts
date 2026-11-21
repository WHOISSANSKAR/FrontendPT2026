export type ProjectStatus = 'In Progress' | 'Completed' | 'Delivered' | 'On Hold' | 'Critical' | 'At Risk' | 'Not Started';

export interface LocationMilestone {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'Completed' | 'In Progress' | 'Pending' | 'On Hold';
  progress: number;
  tasks?: MilestoneTask[];
}

export interface MilestoneTaskActivity {
  id: string;
  user: string;
  role: string;
  avatar?: string;
  text: string;
  timestamp: string;
  type?: 'comment' | 'status_change' | 'inspection' | 'approval';
  edited?: boolean;
}

export interface MilestoneTask {
  id: string;
  taskNumber: string; // e.g. "TASK 01"
  name: string;
  description?: string;
  status: 'Completed' | 'In Progress' | 'Pending' | 'At Risk' | 'Not Started';
  weightage: number; // percentage weight, e.g. 20
  progress: number; // 0 to 100
  startDate: string;
  endDate: string;
  assignee?: string;
  activities: MilestoneTaskActivity[];
}

export interface LocationComment {
  id: string;
  author: string;
  role: string;
  avatar?: string;
  text: string;
  timestamp: string;
  edited?: boolean;
}

export interface ProjectLocation {
  id: string;
  country: string;
  countryCode: string;
  state: string;
  city: string;
  phase: string;
  status: 'In Progress' | 'Completed' | 'On Hold' | 'Pending' | 'Critical';
  progress: number;
  assignedTeam?: string;
  lastUpdated?: string;
  milestones?: LocationMilestone[];
  comments?: LocationComment[];
  startDate?: string;
  endDate?: string;
}

export interface ProjectItem {
  id: string;
  code: string;
  name: string;
  customer: string;
  category: string;
  status: ProjectStatus;
  progress: number;
  currentPhase: string;
  velocity: string;
  manager: string;
  startDate: string;
  expectedCompletion: string;
  budget: string;
  finalBudget?: string;
  lastUpdated: string;
  milestonesCount: number;
  completedMilestones: number;
  locationsCount: number;
  countriesCount: number;
  locations: ProjectLocation[];
  
}

export interface CriticalSpareItem {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  stock: number;
  minThreshold: number;
  // status: 'Critical' | 'Low Stock' | 'Pending' | 'Normal';
  status: 'Critical' | 'Low Stock' | 'Pending' | 'Normal' | 'Unknown';
  unitCost: string;
  supplier: string;
  leadTimeDays: number;
  serialNo?: string;
  hwIdentifier?: string;
  modelNo?: string;
  qty?: number;
  family?: string;
  city?: string;
  state?: string;
  projectId?: string;
  projectTitle?: string;
}

// export interface SupportTicketItem {
//   id: string;
//   ticketNumber: string;
//   title: string;
//   description?: string;
//   project: string;
//   priority: 'Critical' | 'High' | 'Medium' | 'Low';
//   status: 'Open' | 'Pending' | 'In Progress' | 'Resolved' | 'Closed';
//   assignee: string;
//   manager?: string;
//   managerEmail?: string;
//   createdDate: string;
//   attachment?: {
//     name: string;
//     size: string;
//     type: string;
//     url?: string;
//   };
// }


export interface SupportTicketItem {
  id: string;
  ticketNumber: string;
  title: string;
  description?: string;
  project: string;
  projectId?: string;

  priority: 'Critical' | 'High' | 'Medium' | 'Low' | 'Not specified';

  status: 'Open' | 'Pending' | 'In Progress' | 'Resolved' | 'Closed';

  assignee: string;
  manager?: string;
  managerEmail?: string;
  createdDate: string;

  attachmentAvailable?: boolean;

  attachment?: {
    name: string;
    size: string;
    type: string;
    url?: string;
  };

  conversationId?: string | number | null;
  assignedToPtId?: string | number | null;
  assignedToSpId?: string | number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  itemsCount: number;
  status: 'Processing' | 'Delivered' | 'Pending' | 'Shipped' | 'Cancelled';
  date: string;
  totalAmount: string;
  vendor: string;
  itemsDetail?: string[];
  trackingNumber?: string;
  shippingAddress?: string;
}

export interface CalendarEventItem {
  id: string;
  time: string;
  title: string;
  project: string;
  type: 'review' | 'maintenance' | 'meeting' | 'milestone';
  date: string; // YYYY-MM-DD
}

// export interface NotificationItem {
//   id: string;
//   title: string;
//   message: string;
//   time: string;
//   read: boolean;
//   type: 'alert' | 'update' | 'order' | 'ticket';
//   link?: string;
// }


export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'update' | 'order' | 'ticket';
  link?: string;
  projectId?: string;
}


export interface CartItem {
  id: string;
  spareId: string;
  partNumber: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export type ActiveNavTab =
  | 'Dashboard'
  | 'Projects'
  | 'Reports'
  | 'Critical Spares'
  | 'Tickets'
  | 'Orders'
  | 'Calendar'
  | 'Help'
  | 'Account';
