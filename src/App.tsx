import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { getCustomerOrders } from './services/orders.service';
import { useLocation, useNavigate } from 'react-router-dom';

import {

  INITIAL_PROJECTS,

  INITIAL_CRITICAL_SPARES,

  INITIAL_TICKETS,

  INITIAL_ORDERS,

  INITIAL_EVENTS,

  INITIAL_CART,

  INITIAL_NOTIFICATIONS,

  ensureLocationData

} from './data/mockData';

import {

  ProjectItem,

  ProjectLocation,

  LocationMilestone,

  CriticalSpareItem,

  SupportTicketItem,

  OrderItem,

  CartItem,

  NotificationItem,

  CalendarEventItem

} from './types';

// Components

import { Header } from './components/Header';

import {
  getAccountProfile,
  getAccountAvatar
} from './services/account.service';

import { KpiSection, KpiFilterType } from './components/KpiSection';

import { RecentProjectsTable } from './components/RecentProjectsTable';

import { ProjectProgressOverview } from './components/ProjectProgressOverview';

import { CalendarCard } from './components/CalendarCard';

import { CriticalSparesCard } from './components/CriticalSparesCard';

import { SupportTicketsCard } from './components/SupportTicketsCard';

import { RecentOrdersCard } from './components/RecentOrdersCard';

import { QuickActionsCard } from './components/QuickActionsCard';

import { ProjectTrackingView } from './components/ProjectTrackingView';

import { UploadProjectView } from './components/UploadProjectView';

import { CriticalSparesView } from './components/CriticalSparesView';

import { TicketsView } from './components/TicketsView';

import { TicketDetailsView } from './components/TicketDetailsView';

import { OrdersView } from './components/OrdersView';

import { LocationMilestonesView } from './components/LocationMilestonesView';

import { MilestoneTasksView } from './components/MilestoneTasksView';

import { LoginPage, UserProfileData } from './components/LoginPage';

import { AccountProfileView } from './components/AccountProfileView';

import { HelpView } from './components/HelpView';

// Modals

import { UploadProjectModal } from './components/modals/UploadProjectModal';

import { GenerateReportModal } from './components/modals/GenerateReportModal';

import { TicketsModal } from './components/modals/TicketsModal';

import { CriticalSparesModal } from './components/modals/CriticalSparesModal';

import { OrdersModal } from './components/modals/OrdersModal';

import { CalendarModal } from './components/modals/CalendarModal';

import { CartDrawer } from './components/modals/CartDrawer';

import { NotificationsPanel } from './components/modals/NotificationsPanel';

import { ReferralModal } from './components/modals/ReferralModal';

import { HelpInquiryModal } from './components/modals/HelpInquiryModal';

import { UserProfileModal } from './components/modals/UserProfileModal';

import { AddLocationModal } from './components/modals/AddLocationModal';

import { getCustomerDashboard } from './services/dashboardService';

import {
  getProjects,
  getProject,
  TrackingApiError,
} from "./services/projectTracking.service";

import {
  mapTrackingProjectSummary,
  mapProjectTrackingDetail,
} from "./services/mapProjectTrackingResponse";

import { uploadProject } from "./services/uploadProject.service";
import { getCriticalSpares } from "./services/criticalSpares.service";
import {
  getCustomerTickets
} from './services/tickets.service';

import type {
  TicketApiItem
} from './services/tickets.service';

import {
  getCustomerNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from './services/notifications.service';

import {
  getCustomerTodos,
  createTodo
} from './services/todo.service';

import type { TodoApiItem } from './services/todo.service';

export const App: React.FC = () => {

  const location = useLocation();

  const navigate = useNavigate();

  // Authentication State: check localStorage and current path

  // const [isAuthenticated, setIsAuthenticated] = useState(() => {

  //   if (typeof window === 'undefined') return true;

  //   if (window.location.pathname === '/login') return false;

  //   const stored = localStorage.getItem('pseudoteam_authenticated');

  //   return stored !== 'false';

  // });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {

    if (typeof window === 'undefined') return false;

    // changes done by vb: /signup also shows the auth screen
    if (window.location.pathname === '/login' || window.location.pathname === '/signup') {

      return false;

    }

    return Boolean(localStorage.getItem('auth_token'));

  });

  // Navigation & View State

  const [currentView, setCurrentView] = useState<'dashboard' | 'tracking' | 'upload' | 'spares' | 'tickets' | 'ticket-details' | 'orders' | 'location-milestones' | 'milestone-tasks' | 'account' | 'help'>('dashboard');

  const [userProfileData, setUserProfileData] = useState<UserProfileData | undefined>(undefined);
  const [currentUserName, setCurrentUserName] = useState<string>(
    () => localStorage.getItem('customer_name') || ''
  );

  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);

  const [activeNav, setActiveNav] = useState('dashboard');

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);

  const [openTicketModalInitially, setOpenTicketModalInitially] = useState(false);

  // Core Data State

  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);

  const [selectedProject, setSelectedProject] = useState<ProjectItem>(INITIAL_PROJECTS[0]);

  const [spares, setSpares] = useState<CriticalSpareItem[]>(INITIAL_CRITICAL_SPARES);
  const [sparesLoading, setSparesLoading] = useState(false);
  const [sparesError, setSparesError] = useState<string | null>(null);

  // const [tickets, setTickets] = useState<SupportTicketItem[]>(INITIAL_TICKETS);

  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);

  // const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // const [events, setEvents] = useState<CalendarEventItem[]>(INITIAL_EVENTS);

  const [events, setEvents] = useState<CalendarEventItem[]>([]);

  // const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pseudoteam_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const [dashboardLoading, setDashboardLoading] = useState(false);

  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<any>(null);

  const [recentProjects, setRecentProjects] = useState<ProjectItem[]>([]);

  const [projectProgressData, setProjectProgressData] = useState<any[]>([]);

  const [overallProgress, setOverallProgress] = useState(0);

  // const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  // Modals Visibility

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [isReportOpen, setIsReportOpen] = useState(false);

  const [isTicketsOpen, setIsTicketsOpen] = useState(false);

  const [isSparesOpen, setIsSparesOpen] = useState(false);

  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [isReferralOpen, setIsReferralOpen] = useState(false);

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);

  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<ProjectLocation | null>(null);

  const [selectedMilestone, setSelectedMilestone] = useState<LocationMilestone | null>(null);

  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [trackingProjects, setTrackingProjects] = useState<ProjectItem[]>([]);
  const [trackingSelectedProject, setTrackingSelectedProject] =
    useState<ProjectItem | null>(null);

  // Dedicated route navigation for Location Milestones

  // const navigateToLocationMilestones = useCallback((projectId: string, locationId: string) => {

  //   const targetProject = projects.find(p => p.id === projectId || p.code.toLowerCase() === projectId.toLowerCase()) || selectedProject;

  //   const targetLocation = (targetProject.locations || []).find(l => l.id === locationId || l.city.toLowerCase() === locationId.toLowerCase())

  //     || (targetProject.locations && targetProject.locations[0])

  //     || selectedLocation;

  //   if (targetProject) setSelectedProject(targetProject);

  //   if (targetLocation) setSelectedLocation(targetLocation);

  //   const locId = targetLocation?.id || locationId;

  //   navigate(`/projects/${targetProject.id}/locations/${locId}/milestones`);

  // }, [projects, selectedProject, selectedLocation, navigate]);


  const navigateToLocationMilestones = useCallback(
    (projectId: string, locationId: string) => {
      const targetProject =
        (trackingSelectedProject?.id === projectId
          ? trackingSelectedProject
          : null) ||
        trackingProjects.find(p => p.id === projectId) ||
        projects.find(
          p => p.id === projectId ||
            p.code.toLowerCase() === projectId.toLowerCase()
        ) ||
        selectedProject;

      const targetLocation = (targetProject.locations || []).find(
        l => l.id === locationId ||
          l.city.toLowerCase() === locationId.toLowerCase()
      );

      if (!targetLocation) {
        console.error("Location not found:", locationId);
        return;
      }

      setSelectedProject(targetProject);
      setSelectedLocation(targetLocation);

      navigate(
        `/projects/${targetProject.id}/locations/${targetLocation.id}/milestones`
      );
    },
    [
      trackingSelectedProject,
      trackingProjects,
      projects,
      selectedProject,
      navigate
    ]
  );

  const handleAddTodo = async (newEvent: CalendarEventItem) => {
    try {
      const savedTodo = await createTodo({
        td_event: newEvent.title,
        td_date: newEvent.date,
      });

      const savedEvent: CalendarEventItem = {
        id: String(savedTodo.td_id),
        title: savedTodo.td_event,
        date: String(savedTodo.td_date).split("T")[0],
        time: "",
        project: "",
        type: "meeting",
      };

      setEvents(prev => [
        savedEvent,
        ...prev.filter(event => event.id !== savedEvent.id),
      ]);

      showToast(`Todo "${savedEvent.title}" created successfully.`);
    } catch (error) {
      console.error("Create Todo API Error:", error);

      showToast(
        error instanceof Error
          ? error.message
          : "Unable to create Todo."
      );

      throw error;
    }
  };


  // Dedicated route navigation for Milestone Tasks Timeline

  const navigateToMilestoneTasks = useCallback((

    project: ProjectItem,

    location: ProjectLocation,

    milestone: LocationMilestone

  ) => {

    setSelectedProject(project);

    setSelectedLocation(location);

    setSelectedMilestone(milestone);

    navigate(`/projects/${project.id}/locations/${location.id}/milestones/${milestone.id}/tasks`);

  }, [navigate]);

  const mapApiTicket = (ticket: TicketApiItem): SupportTicketItem => {
    return {
      id: String(ticket.id),
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
      description: ticket.description || '',
      project: ticket.project || 'General',
      projectId: ticket.projectId ? String(ticket.projectId) : undefined,

      // Backend currently does not provide priority.
      priority: 'Not specified',

      status: ticket.status as SupportTicketItem['status'],

      assignee: ticket.assignee || '',
      createdDate: ticket.createdDate || 'Date not available',

      attachmentAvailable: ticket.attachmentAvailable,

      conversationId: ticket.conversationId,
      assignedToPtId: ticket.assignedToPtId,
      assignedToSpId: ticket.assignedToSpId,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const loadTickets = async () => {
      try {
        setTicketsLoading(true);
        setTicketsError(null);

        const response = await getCustomerTickets();

        if (!response.success) {
          throw new Error(
            response.message || 'Unable to load tickets.'
          );
        }

        if (cancelled) return;

        const mappedTickets = response.tickets.map(mapApiTicket);

        console.log("Mapped API Tickets:", mappedTickets);

        setTickets(mappedTickets);

      } catch (error) {
        if (cancelled) return;

        console.error("Tickets API Error:", error);

        setTicketsError(
          error instanceof Error
            ? error.message
            : 'Unable to load tickets.'
        );

      } finally {
        if (!cancelled) {
          setTicketsLoading(false);
        }
      }
    };

    loadTickets();

    return () => {
      cancelled = true;
    };

  }, [isAuthenticated]);

  // Sync React Router URL changes to state so browser refresh / back / forward keeps user on exact page

  // useEffect(() => {

  //   const path = location.pathname;

  //   const searchParams = new URLSearchParams(location.search);

  //   // if (path === '/login') {

  //   //   setIsAuthenticated(false);

  //   //   return;

  //   // }

  //   // // Ensure authenticated if user visits or refreshes any workspace route directly

  //   // const stored = localStorage.getItem('pseudoteam_authenticated');

  //   // if (stored !== 'false') {

  //   //   setIsAuthenticated(true);

  //   // }

  //   if (path === '/login') {
  //     setIsAuthenticated(false);
  //     return;
  //   }

  //   // This App does not currently render a separate complete-profile view.
  //   // Avoid leaving users on an unhandled URL after login.
  //   if (path === '/complete-profile') {
  //     navigate('/dashboard', { replace: true });
  //     return;
  //   }

  //   const token = localStorage.getItem('auth_token');

  //   if (token) {

  //     setIsAuthenticated(true);

  //   } else {

  //     setIsAuthenticated(false);

  //     navigate('/login');

  //     return;

  //   }

  //   // 1. Tasks Timeline: /projects/:projectId/locations/:locationId/milestones/:milestoneId/tasks

  //   const tasksMatch = path.match(/^\/projects\/([^/]+)\/locations\/([^/]+)\/milestones\/([^/]+)\/tasks\/?$/);

  //   if (tasksMatch) {

  //     const [, pId, lId, mId] = tasksMatch;

  //     // const targetProj = projects.find(p => p.id === pId || p.code.toLowerCase() === pId.toLowerCase() || p.name.toLowerCase().includes(pId.toLowerCase())) || projects[0];

  //     const targetProj =
  //       (trackingSelectedProject?.id === pId
  //         ? trackingSelectedProject
  //         : null) ||
  //       trackingProjects.find(p => p.id === pId) ||
  //       projects.find(
  //         p =>
  //           p.id === pId ||
  //           p.code.toLowerCase() === pId.toLowerCase()
  //       ) ||
  //       (selectedProject?.id === pId ? selectedProject : null);

  //     if (targetProj) {

  //       setSelectedProject(targetProj);

  //       const targetLoc = (targetProj.locations || []).find(l => l.id === lId || l.city.toLowerCase() === lId.toLowerCase())

  //         || (targetProj.locations && targetProj.locations[0]);

  //       if (targetLoc) {

  //         setSelectedLocation(targetLoc);

  //         const { milestones } = ensureLocationData(targetProj, targetLoc);

  //         const targetMilestone = milestones.find(m => m.id === mId || m.name.toLowerCase().includes(mId.toLowerCase())) || milestones[0];

  //         if (targetMilestone) {

  //           setSelectedMilestone(targetMilestone);

  //         }

  //       }

  //       setCurrentView('milestone-tasks');

  //       setActiveNav('projects');

  //       return;

  //     }

  //   }

  //   // 2. Location Milestones: /projects/:projectId/locations/:locationId/milestones

  //   const locMatch = path.match(/^\/projects\/([^/]+)\/locations\/([^/]+)\/milestones\/?$/);

  //   // if (locMatch) {

  //   //   const [, pId, lId] = locMatch;

  //   //   const targetProj = projects.find(p => p.id === pId || p.code.toLowerCase() === pId.toLowerCase() || p.name.toLowerCase().includes(pId.toLowerCase())) || projects[0];

  //   //   if (targetProj) {

  //   //     setSelectedProject(targetProj);

  //   //     const targetLoc = (targetProj.locations || []).find(l => l.id === lId || l.city.toLowerCase() === lId.toLowerCase())

  //   //       || (targetProj.locations && targetProj.locations[0]);

  //   //     if (targetLoc) {

  //   //       setSelectedLocation(targetLoc);

  //   //     }

  //   //     setCurrentView('location-milestones');

  //   //     setActiveNav('projects');

  //   //     return;

  //   //   }

  //   // }


  //   if (locMatch) {
  //     const [, pId, lId] = locMatch;

  //     const targetProj =
  //       (trackingSelectedProject?.id === pId
  //         ? trackingSelectedProject
  //         : null) ||
  //       trackingProjects.find(p => p.id === pId) ||
  //       projects.find(
  //         p => p.id === pId ||
  //           p.code.toLowerCase() === pId.toLowerCase()
  //       );

  //     if (targetProj) {
  //       setSelectedProject(targetProj);

  //       const targetLoc = (targetProj.locations || []).find(
  //         l => l.id === lId ||
  //           l.city.toLowerCase() === lId.toLowerCase()
  //       );

  //       if (targetLoc) {
  //         setSelectedLocation(targetLoc);
  //         setCurrentView('location-milestones');
  //         setActiveNav('projects');
  //         return;
  //       }

  //       console.error("Location not found for project:", pId, lId);
  //     }
  //   }


  //   // 3. /projects/:projectId/milestones or /milestones (supports ?location=locId)

  //   const milestonesMatch = path.match(/^\/projects\/([^/]+)\/milestones\/?$/) || (path === '/milestones' ? ['/milestones', selectedProject?.id || 'prj-1'] : null);

  //   if (milestonesMatch) {

  //     const pId = milestonesMatch[1];

  //     const targetProj = projects.find(p => p.id === pId || p.code.toLowerCase() === pId.toLowerCase() || p.name.toLowerCase().includes(pId.toLowerCase())) || selectedProject || projects[0];

  //     if (targetProj) {

  //       setSelectedProject(targetProj);

  //       const locQuery = searchParams.get('location');

  //       const targetLoc = locQuery

  //         ? (targetProj.locations || []).find(l => l.id === locQuery || l.city.toLowerCase() === locQuery.toLowerCase()) || (targetProj.locations && targetProj.locations[0])

  //         : (targetProj.locations && targetProj.locations[0]);

  //       if (targetLoc) {

  //         setSelectedLocation(targetLoc);

  //       }

  //       setCurrentView('location-milestones');

  //       setActiveNav('projects');

  //       return;

  //     }

  //   }

  //   // 4. Ticket Details: /tickets/:ticketId

  //   const ticketMatch = path.match(/^\/tickets\/([^/]+)\/?$/);

  //   if (ticketMatch && ticketMatch[1] !== 'new') {

  //     const tId = ticketMatch[1];

  //     // const targetTicket = tickets.find(t =>

  //     //   t.ticketNumber.toLowerCase() === tId.toLowerCase() ||

  //     //   t.id.toLowerCase() === tId.toLowerCase() ||

  //     //   t.ticketNumber.replace(/[^0-9]/g, '') === tId.replace(/[^0-9]/g, '')

  //     // ) || tickets[0];

  //     const targetTicket = tickets.find(t =>
  //       t.ticketNumber.toLowerCase() === tId.toLowerCase() ||
  //       t.id.toLowerCase() === tId.toLowerCase() ||
  //       t.ticketNumber.replace(/[^0-9]/g, '') ===
  //       tId.replace(/[^0-9]/g, '')
  //     );

  //     if (targetTicket) {
  //       setSelectedTicket(targetTicket);
  //       setCurrentView('ticket-details');
  //       setActiveNav('tickets');
  //       return;
  //     }

  //     if (targetTicket) {

  //       setSelectedTicket(targetTicket);

  //       setCurrentView('ticket-details');

  //       setActiveNav('tickets');

  //       return;

  //     }

  //   }

  //   // 5. Track Tickets List: /tickets

  //   if (path === '/tickets') {

  //     setCurrentView('tickets');

  //     setActiveNav('tickets');

  //     if (searchParams.get('openTicket') === 'true') {

  //       setOpenTicketModalInitially(true);

  //     } else {

  //       setOpenTicketModalInitially(false);

  //     }

  //     return;

  //   }

  //   // 6. Orders History: /orders

  //   if (path === '/orders') {

  //     setCurrentView('orders');

  //     setActiveNav('orders');

  //     return;

  //   }

  //   // 7. Critical Spares: /critical-spares or /spares

  //   if (path === '/critical-spares' || path === '/spares') {

  //     setCurrentView('spares');

  //     setActiveNav('spares');

  //     return;

  //   }

  //   // 8. Reports: /reports

  //   if (path === '/reports') {

  //     setCurrentView('dashboard');

  //     setActiveNav('reports');

  //     setIsReportOpen(true);

  //     return;

  //   }

  //   // 9. Calendar: /calendar

  //   if (path === '/calendar') {

  //     setCurrentView('dashboard');

  //     setActiveNav('calendar');

  //     setIsCalendarOpen(true);

  //     return;

  //   }

  //   // 10. Help / Support Tickets: /help

  //   if (path === '/help') {

  //     setCurrentView('help');

  //     setActiveNav('help');

  //     return;

  //   }

  //   // 11. Account & Profile: /account or /profile

  //   if (path === '/account' || path === '/profile') {

  //     setCurrentView('account');

  //     setActiveNav('account');

  //     return;

  //   }

  //   // 12. Upload Project: /upload-project

  //   if (path === '/upload-project') {

  //     setCurrentView('upload');

  //     setActiveNav('dashboard');

  //     return;

  //   }

  //   // 13. Project Tracking: /projects/:projectId

  //   if (path.startsWith('/projects/')) {

  //     const pId = path.split('/')[2];

  //     const targetProj = projects.find(p => p.id === pId || p.code.toLowerCase() === pId.toLowerCase() || p.name.toLowerCase().includes(pId.toLowerCase()));

  //     if (targetProj) {

  //       setSelectedProject(targetProj);

  //     }

  //     setCurrentView('tracking');

  //     setActiveNav('projects');

  //     return;

  //   }

  //   // 14. Projects generic: /projects

  //   if (path === '/projects') {

  //     setCurrentView('tracking');

  //     setActiveNav('projects');

  //     return;

  //   }

  //   // 15. Dashboard: / or /dashboard

  //   if (path === '/' || path === '/dashboard') {

  //     setCurrentView('dashboard');

  //     setActiveNav('dashboard');

  //     return;

  //   }

  //   // }, [location.pathname, location.search, projects, tickets, selectedProject, navigate]);
  // }, [
  //   location.pathname,
  //   location.search,
  //   projects,
  //   tickets,
  //   selectedProject,
  //   trackingProjects,
  //   trackingSelectedProject,
  //   navigate
  // ]);



  useEffect(() => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);

    // changes done by vb: treat /signup like /login (don't redirect it away)
    if (path === '/login' || path === '/signup') {
      setIsAuthenticated(false);
      return;
    }

    // This App does not currently render a separate complete-profile view.
    // Avoid leaving users on an unhandled URL after login.
    if (path === '/complete-profile') {
      navigate('/dashboard', { replace: true });
      return;
    }

    const token = localStorage.getItem('auth_token');

    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      navigate('/login');
      return;
    }

    // 1. Tasks Timeline:
    // /projects/:projectId/locations/:locationId/milestones/:milestoneId/tasks
    const tasksMatch = path.match(
      /^\/projects\/([^/]+)\/locations\/([^/]+)\/milestones\/([^/]+)\/tasks\/?$/
    );

    if (tasksMatch) {
      const [, pId, lId, mId] = tasksMatch;

      // Prefer project data loaded from the FastAPI tracking API.
      const targetProj =
        (trackingSelectedProject?.id === pId
          ? trackingSelectedProject
          : null) ||
        trackingProjects.find(p => p.id === pId) ||
        projects.find(
          p =>
            p.id === pId ||
            p.code.toLowerCase() === pId.toLowerCase()
        ) ||
        (selectedProject?.id === pId ? selectedProject : null);

      if (!targetProj) {
        console.error('Project not found:', pId);
        return;
      }

      setSelectedProject(targetProj);

      // Find the exact location from the selected project.
      const targetLoc = (targetProj.locations || []).find(
        l => l.id === lId
      );

      if (!targetLoc) {
        console.error('Location not found:', lId);
        return;
      }

      setSelectedLocation(targetLoc);

      // Use milestones received from FastAPI.
      // Only use mock fallback if the milestones property is missing.
      const milestones = Array.isArray(targetLoc.milestones)
        ? targetLoc.milestones
        : ensureLocationData(targetProj, targetLoc).milestones;

      // Find the exact milestone. Do not automatically select the first one.
      const targetMilestone = milestones.find(
        m => m.id === mId
      );

      if (!targetMilestone) {
        console.error('Milestone not found:', {
          projectId: pId,
          locationId: lId,
          milestoneId: mId,
          availableMilestones: milestones.map(m => ({
            id: m.id,
            name: m.name
          }))
        });
        return;
      }

      setSelectedMilestone(targetMilestone);

      setCurrentView('milestone-tasks');
      setActiveNav('projects');

      return;
    }

    // 2. Location Milestones:
    // /projects/:projectId/locations/:locationId/milestones
    const locMatch = path.match(
      /^\/projects\/([^/]+)\/locations\/([^/]+)\/milestones\/?$/
    );

    if (locMatch) {
      const [, pId, lId] = locMatch;

      const targetProj =
        (trackingSelectedProject?.id === pId
          ? trackingSelectedProject
          : null) ||
        trackingProjects.find(p => p.id === pId) ||
        projects.find(
          p =>
            p.id === pId ||
            p.code.toLowerCase() === pId.toLowerCase()
        );

      if (targetProj) {
        setSelectedProject(targetProj);

        const targetLoc = (targetProj.locations || []).find(
          l =>
            l.id === lId ||
            l.city.toLowerCase() === lId.toLowerCase()
        );

        if (targetLoc) {
          setSelectedLocation(targetLoc);
          setCurrentView('location-milestones');
          setActiveNav('projects');
          return;
        }

        console.error('Location not found for project:', pId, lId);
      }
    }

    // 3. /projects/:projectId/milestones or /milestones
    // Supports ?location=locId
    const milestonesMatch =
      path.match(/^\/projects\/([^/]+)\/milestones\/?$/) ||
      (path === '/milestones'
        ? ['/milestones', selectedProject?.id || 'prj-1']
        : null);

    if (milestonesMatch) {
      const pId = milestonesMatch[1];

      const targetProj =
        trackingSelectedProject?.id === pId
          ? trackingSelectedProject
          : trackingProjects.find(p => p.id === pId) ||
          projects.find(
            p =>
              p.id === pId ||
              p.code.toLowerCase() === pId.toLowerCase() ||
              p.name.toLowerCase().includes(pId.toLowerCase())
          ) ||
          selectedProject ||
          projects[0];

      if (targetProj) {
        setSelectedProject(targetProj);

        const locQuery = searchParams.get('location');

        const targetLoc = locQuery
          ? (targetProj.locations || []).find(
            l =>
              l.id === locQuery ||
              l.city.toLowerCase() === locQuery.toLowerCase()
          ) || targetProj.locations?.[0]
          : targetProj.locations?.[0];

        if (targetLoc) {
          setSelectedLocation(targetLoc);
        }

        setCurrentView('location-milestones');
        setActiveNav('projects');

        return;
      }
    }

    // 4. Ticket Details: /tickets/:ticketId
    const ticketMatch = path.match(/^\/tickets\/([^/]+)\/?$/);

    if (ticketMatch && ticketMatch[1] !== 'new') {
      const tId = ticketMatch[1];

      const targetTicket = tickets.find(
        t =>
          t.ticketNumber.toLowerCase() === tId.toLowerCase() ||
          t.id.toLowerCase() === tId.toLowerCase() ||
          t.ticketNumber.replace(/[^0-9]/g, '') ===
          tId.replace(/[^0-9]/g, '')
      );

      if (targetTicket) {
        setSelectedTicket(targetTicket);
        setCurrentView('ticket-details');
        setActiveNav('tickets');
        return;
      }
    }

    // 5. Track Tickets List: /tickets
    if (path === '/tickets') {
      setCurrentView('tickets');
      setActiveNav('tickets');

      if (searchParams.get('openTicket') === 'true') {
        setOpenTicketModalInitially(true);
      } else {
        setOpenTicketModalInitially(false);
      }

      return;
    }

    // 6. Orders History: /orders
    if (path === '/orders') {
      setCurrentView('orders');
      setActiveNav('orders');
      return;
    }

    // 7. Critical Spares: /critical-spares or /spares
    if (path === '/critical-spares' || path === '/spares') {
      setCurrentView('spares');
      setActiveNav('spares');
      return;
    }

    // 8. Reports: /reports
    if (path === '/reports') {
      setCurrentView('dashboard');
      setActiveNav('reports');
      setIsReportOpen(true);
      return;
    }

    // 9. Calendar: /calendar
    if (path === '/calendar') {
      setCurrentView('dashboard');
      setActiveNav('calendar');
      setIsCalendarOpen(true);
      return;
    }

    // 10. Help / Support Tickets: /help
    if (path === '/help') {
      setCurrentView('help');
      setActiveNav('help');
      return;
    }

    // 11. Account & Profile: /account or /profile
    if (path === '/account' || path === '/profile') {
      setCurrentView('account');
      setActiveNav('account');
      return;
    }

    // 12. Upload Project: /upload-project
    if (path === '/upload-project') {
      setCurrentView('upload');
      setActiveNav('dashboard');
      return;
    }

    // 13. Project Tracking: /projects/:projectId
    if (path.startsWith('/projects/')) {
      const pId = path.split('/')[2];

      const targetProj =
        trackingSelectedProject?.id === pId
          ? trackingSelectedProject
          : trackingProjects.find(p => p.id === pId) ||
          projects.find(
            p =>
              p.id === pId ||
              p.code.toLowerCase() === pId.toLowerCase() ||
              p.name.toLowerCase().includes(pId.toLowerCase())
          );

      if (targetProj) {
        setSelectedProject(targetProj);
      }

      setCurrentView('tracking');
      setActiveNav('projects');
      return;
    }

    // 14. Projects generic: /projects
    if (path === '/projects') {
      setCurrentView('tracking');
      setActiveNav('projects');
      return;
    }

    // 15. Dashboard: / or /dashboard
    if (path === '/' || path === '/dashboard') {
      setCurrentView('dashboard');
      setActiveNav('dashboard');
      return;
    }
  }, [
    location.pathname,
    location.search,
    projects,
    tickets,
    selectedProject,
    trackingProjects,
    trackingSelectedProject,
    navigate
  ]);


  useEffect(() => {

    if (!isAuthenticated) return;

    let cancelled = false;

    const loadDashboard = async () => {

      try {

        setDashboardLoading(true);

        setDashboardError(null);

        const response = await getCustomerDashboard();

        if (!response?.success) {
          throw new Error(response?.message || "Unable to load dashboard data.");
        }

        if (cancelled) return;

        const dashboard = response.dashboard;

        if (!dashboard || typeof dashboard !== "object") {
          throw new Error("Dashboard data is missing from the API response.");
        }

        // Normalize optional API arrays before mapping them.
        const projectProgress = Array.isArray(dashboard.projectProgress)
          ? dashboard.projectProgress
          : [];
        const dashboardProjects = Array.isArray(dashboard.projects)
          ? dashboard.projects
          : [];
        const dashboardRecentProjects = Array.isArray(dashboard.recentProjects)
          ? dashboard.recentProjects
          : [];
        // const dashboardNotifications = Array.isArray(dashboard.notifications)
        //   ? dashboard.notifications
        //   : [];
        const dashboardCalendarEvents = Array.isArray(dashboard.calendarEvents)
          ? dashboard.calendarEvents
          : [];

        // Map all projects.
        const mappedProjects = dashboardProjects.map((project: any) =>
          mapDashboardProject(project, projectProgress)
        );

        // Map recent projects.
        const mappedRecentProjects = dashboardRecentProjects.map((project: any) =>
          mapDashboardProject(project, projectProgress)
        );

        setDashboardData(response);

        setProjects(mappedProjects);

        setRecentProjects(mappedRecentProjects);

        if (mappedProjects.length > 0) {

          setSelectedProject(mappedProjects[0]);

        }

        // Project progress

        setProjectProgressData(projectProgress);

        setOverallProgress(dashboard.overallProgress || 0);

        // changes done by vb: the dashboard API only *estimates* progress from project status
        // (Not Started = 0%, In Progress = 50%, Completed = 100%). Overlay the real milestone/task
        // progress from GET /customer/projects/tracking. If that call fails, keep the dashboard values.
        getProjects()
          .then((tracking) => {
            if (cancelled) return;
            const byId = new Map(
              (tracking?.projects || []).map((t) => [String(t.project_id), t])
            );
            if (byId.size === 0) return;

            const withRealProgress = (p: ProjectItem): ProjectItem => {
              const t = byId.get(String(p.id));
              if (!t) return p;
              return {
                ...p,
                progress: Number(t.overall_progress ?? p.progress) || 0,
                currentPhase: t.current_phase || p.currentPhase,
                milestonesCount: t.total_milestones ?? p.milestonesCount,
                completedMilestones: t.completed_milestones ?? p.completedMilestones,
                locationsCount: t.total_locations ?? p.locationsCount,
                countriesCount: t.total_countries ?? p.countriesCount,
              };
            };

            setProjects((prev) => prev.map(withRealProgress));
            setRecentProjects((prev) => prev.map(withRealProgress));

            const values = Array.from(byId.values()).map((t) => Number(t.overall_progress) || 0);
            setOverallProgress(Math.round(values.reduce((a, b) => a + b, 0) / values.length));
          })
          .catch((err) => {
            console.warn('Real project progress unavailable; using dashboard estimates.', err);
          });

        // Notifications

        // setNotifications(

        //   dashboardNotifications.map((item: any) => ({

        //     id: String(item.id),

        //     title: item.title || "",

        //     message: item.message || "",

        //     time: item.time ? String(item.time) : "",

        //     read: Boolean(item.read),

        //     type: "update",

        //     link: item.link || undefined,

        //   }))

        // );

        // setUnreadNotificationsCount(

        //   dashboard.unreadNotificationsCount || 0

        // );

        // Calendar events

        // setEvents(

        //   dashboardCalendarEvents.map((item: any) => ({

        //     id: String(item.id),

        //     title: item.title || "",

        //     date: item.date ? String(item.date).split("T")[0] : "",

        //     time: "",

        //     project: "",

        //     type: "meeting",

        //   }))

        // );

      } catch (error) {

        if (!cancelled) {

          const message =

            error instanceof Error

              ? error.message

              : "Unable to load dashboard.";

          setDashboardError(message);

          console.error("Dashboard API error:", error);

          // Handle expired/invalid authentication when the API client preserves
          // the HTTP status (Axios: error.response.status; fetch wrappers: error.status).
          const errorStatus =
            typeof error === "object" && error !== null
              ? (error as any).response?.status ?? (error as any).status
              : undefined;

          if (errorStatus === 401) {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("pseudoteam_authenticated");
            setIsAuthenticated(false);
            setDashboardData(null);
            navigate("/login", { replace: true });
          }

        }

      } finally {

        if (!cancelled) {

          setDashboardLoading(false);

        }

      }

    };

    loadDashboard();

    return () => {

      cancelled = true;

    };

  }, [isAuthenticated, navigate]);

  // Load projects and project details for the Project Tracking screen
  // useEffect(() => {
  //   if (!isAuthenticated || currentView !== 'tracking') return;

  //   let cancelled = false;

  //   const loadTrackingData = async () => {
  //     try {
  //       setTrackingLoading(true);
  //       setTrackingError(null);

  //       // 1. Fetch all tracking project summaries
  //       const response = await getProjects();

  //       if (!response?.success) {
  //         throw new Error(
  //           response?.message || 'Unable to load tracking projects.'
  //         );
  //       }

  //       if (cancelled) return;

  //       const mappedProjects = (response.projects || []).map(
  //         mapTrackingProjectSummary
  //       );

  //       setTrackingProjects(mappedProjects);

  //       if (mappedProjects.length === 0) {
  //         setTrackingSelectedProject(null);
  //         return;
  //       }

  //       // 2. Select the project from the URL, or the first project
  //       const projectIdFromUrl = location.pathname.split('/')[2];

  //       const selectedSummary =
  //         mappedProjects.find(p => p.id === projectIdFromUrl) ||
  //         mappedProjects[0];

  //       // 3. Fetch complete tracking details for the selected project
  //       const detailResponse = await getProject(selectedSummary.id);

  //       if (cancelled) return;

  //       if (!detailResponse?.success) {
  //         throw new Error(
  //           detailResponse?.message || 'Unable to load project details.'
  //         );
  //       }

  //       const detailedProject = mapProjectTrackingDetail(detailResponse);

  //       setTrackingSelectedProject(detailedProject);

  //     } catch (error) {
  //       if (cancelled) return;

  //       console.error('Project Tracking API error:', error);

  //       setTrackingError(
  //         error instanceof Error
  //           ? error.message
  //           : 'Unable to load project tracking data.'
  //       );

  //       if (error instanceof TrackingApiError && error.status === 401) {
  //         localStorage.removeItem('auth_token');
  //         setIsAuthenticated(false);
  //         navigate('/login', { replace: true });
  //       }

  //     } finally {
  //       if (!cancelled) {
  //         setTrackingLoading(false);
  //       }
  //     }
  //   };

  //   loadTrackingData();

  //   return () => {
  //     cancelled = true;
  //   };
  // }, [isAuthenticated, currentView, location.pathname, navigate]);

  // Load projects and project details for Project Tracking, Location Milestones, and Milestone Tasks
  useEffect(() => {
    const isProjectRoute =
      currentView === 'tracking' ||
      currentView === 'location-milestones' ||
      currentView === 'milestone-tasks' ||
      location.pathname.startsWith('/projects/');

    if (!isAuthenticated || !isProjectRoute) return;

    let cancelled = false;

    const loadTrackingData = async () => {
      try {
        setTrackingLoading(true);
        setTrackingError(null);

        // 1. Fetch all tracking project summaries if not loaded yet
        let mappedProjects = trackingProjects;
        if (mappedProjects.length === 0) {
          const response = await getProjects();

          if (!response?.success) {
            throw new Error(
              response?.message || 'Unable to load tracking projects.'
            );
          }

          if (cancelled) return;

          mappedProjects = (response.projects || []).map(
            mapTrackingProjectSummary
          );
          setTrackingProjects(mappedProjects);
        }

        if (mappedProjects.length === 0) {
          setTrackingSelectedProject(null);
          return;
        }

        // 2. Select the project from the URL, or the first project
        const projectIdFromUrl = location.pathname.split('/')[2];

        const selectedSummary =
          mappedProjects.find(p => p.id === projectIdFromUrl) ||
          mappedProjects[0];

        // Skip re-fetching if we already hold full detail for this project
        if (
          trackingSelectedProject &&
          trackingSelectedProject.id === selectedSummary.id &&
          Array.isArray(trackingSelectedProject.locations)
        ) {
          return;
        }

        // 3. Fetch complete tracking details for the selected project
        const detailResponse = await getProject(selectedSummary.id);

        if (cancelled) return;

        if (!detailResponse?.success) {
          throw new Error(
            detailResponse?.message || 'Unable to load project details.'
          );
        }

        const detailedProject = mapProjectTrackingDetail(detailResponse);

        setTrackingSelectedProject(detailedProject);
        setSelectedProject(detailedProject);

      } catch (error) {
        if (cancelled) return;

        console.error('Project Tracking API error:', error);

        setTrackingError(
          error instanceof Error
            ? error.message
            : 'Unable to load project tracking data.'
        );

        if (error instanceof TrackingApiError && error.status === 401) {
          localStorage.removeItem('auth_token');
          setIsAuthenticated(false);
          navigate('/login', { replace: true });
        }

      } finally {
        if (!cancelled) {
          setTrackingLoading(false);
        }
      }
    };

    loadTrackingData();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, currentView, location.pathname, trackingProjects, trackingSelectedProject, navigate]);

  // Feedback Toast

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {

    setToastMessage(msg);

    setTimeout(() => {

      setToastMessage((prev) => (prev === msg ? null : prev));

    }, 2800);

  };

  // Sync upload modal trigger with Upload Project Page view

  useEffect(() => {

    if (isUploadOpen) {

      setCurrentView('upload');

      setIsUploadOpen(false);

    }

  }, [isUploadOpen]);

  // Sync orders modal trigger with Orders Page view

  useEffect(() => {

    if (isOrdersOpen) {

      setCurrentView('orders');

      setActiveNav('orders');

      setIsOrdersOpen(false);

    }

  }, [isOrdersOpen]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const loadCriticalSpares = async () => {
      try {
        setSparesLoading(true);
        setSparesError(null);

        const response = await getCriticalSpares();

        if (!response.success) {
          throw new Error(
            response.message || "Unable to load critical spares."
          );
        }

        if (cancelled) return;

        // console.log("Critical Spares API Response:", response);
        setSpares(
          response.spares.map((item) => ({
            id: String(item.id),
            partNumber: item.serialNo ?? "—",
            name: item.name ?? "Unnamed Spare",
            category: item.category ?? item.family ?? "Uncategorized",
            stock: item.stock ?? item.qty ?? 0,
            minThreshold: 0,
            status: item.status
              ? (item.status as CriticalSpareItem["status"])
              : "Unknown",
            unitCost: String(item.price ?? 0),
            supplier: item.spEmail ?? "—",
            leadTimeDays: 0,
            serialNo: item.serialNo ?? undefined,
            hwIdentifier: item.hwIdentifier ?? undefined,
            modelNo: item.modelNo ?? undefined,
            qty: item.qty ?? 0,
            family: item.family ?? undefined,
            city: item.city ?? undefined,
            state: item.state ?? undefined,
          }))
        );

      } catch (error) {
        if (cancelled) return;

        setSparesError(
          error instanceof Error
            ? error.message
            : "Unable to load critical spares."
        );
      } finally {
        if (!cancelled) {
          setSparesLoading(false);
        }
      }
    };

    loadCriticalSpares();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);


  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const loadNotifications = async () => {
      try {
        const response = await getCustomerNotifications();

        if (!response.success || cancelled) return;

        const mappedNotifications: NotificationItem[] =
          response.notifications.map((item) => ({
            id: String(item.id),
            title: item.title || "Notification",
            message: item.message || "",
            time: item.time || "",
            read: Boolean(item.read),
            type: (
              ["alert", "update", "order", "ticket"].includes(item.type)
                ? item.type
                : "update"
            ) as NotificationItem["type"],
            link: item.link || undefined,
            projectId: item.projectId
          }));

        setNotifications(mappedNotifications);
        setUnreadNotificationsCount(response.unread_count);
      } catch (error) {
        console.error("Notification API error:", error);
      }
    };

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const loadTodos = async () => {
      try {
        const todos = await getCustomerTodos();

        if (cancelled) return;

        const mappedEvents: CalendarEventItem[] = todos.map(
          (todo: TodoApiItem) => ({
            id: String(todo.td_id),
            title: todo.td_event,
            date: String(todo.td_date).split("T")[0],
            time: "",
            project: "",
            type: "meeting",
          })
        );

        setEvents(mappedEvents);
      } catch (error) {
        if (!cancelled) {
          console.error("Todo API Error:", error);
          showToast(
            error instanceof Error
              ? error.message
              : "Unable to load Todos."
          );
        }
      }
    };

    loadTodos();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);


  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    let avatarUrl: string | null = null;

    const loadHeaderProfile = async () => {
      try {
        const response = await getAccountProfile();

        if (cancelled || !response.success) return;

        const profile = response.profile;

        setCurrentUserName(profile.fullName || '');
        setCurrentUserEmail(profile.email || '');

        if (profile.hasAvatar) {
          const imageUrl = await getAccountAvatar();

          if (cancelled) {
            URL.revokeObjectURL(imageUrl);
            return;
          }

          avatarUrl = imageUrl;
          setCurrentUserAvatar(imageUrl);
        } else {
          setCurrentUserAvatar(null);
        }
      } catch (error) {
        console.error('Header profile loading error:', error);
      }
    };

    loadHeaderProfile();

    return () => {
      cancelled = true;

      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [isAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem('pseudoteam_cart', JSON.stringify(cart));
    } catch {
      // ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    if (sparesLoading || !spares.length) return;
    setCart(prev =>
      prev
        .map(item => {
          const match = spares.find(s => s.id === item.id);
          if (!match) return item;
          const maxStock = Math.max(0, Number(match.stock ?? match.qty ?? 0));
          if (maxStock <= 0) return null;
          return item.quantity > maxStock
            ? { ...item, quantity: maxStock }
            : item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  }, [spares, sparesLoading]);

  const totalCartUnits = useMemo(
    () => cart.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [cart]
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const loadOrders = async () => {
      try {
        setOrdersLoading(true);
        setOrdersError(null);
        const mappedOrders = await getCustomerOrders();
        if (!cancelled) {
          setOrders(mappedOrders);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Orders API Error:', err);
          setOrdersError(
            err instanceof Error ? err.message : 'Unable to load order history.'
          );
        }
      } finally {
        if (!cancelled) {
          setOrdersLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Active KPI Filter State

  const [activeKpiFilter, setActiveKpiFilter] = useState<KpiFilterType>(null);

  const handleKpiToggle = (filterKey: 'not_started' | 'in_progress' | 'delivered' | 'at_risk') => {

    setActiveKpiFilter(prev => prev === filterKey ? null : filterKey);

  };

  const activeKpiFilterLabel = useMemo(() => {

    switch (activeKpiFilter) {

      case 'not_started':

        return 'Not Started';

      case 'in_progress':

        return 'In Progress';

      case 'delivered':

        return 'Delivered';

      case 'at_risk':

        return 'At Risk / On Hold';

      default:

        return null;

    }

  }, [activeKpiFilter]);

  // Dynamic KPI counts derived from projects state

  // const kpiStats = useMemo(() => {

  //   const notStarted = projects.filter(p => p.status === 'Not Started').length;

  //   const inProgress = projects.filter(p => p.status === 'In Progress').length;

  //   const completed = projects.filter(p => p.status === 'Completed' || p.status === 'Delivered').length;

  //   const critical = projects.filter(p => p.status === 'Critical' || p.status === 'At Risk' || p.status === 'On Hold').length;

  //   return {

  //     totalProjects: notStarted,

  //     notStarted,

  //     inProgress,

  //     completed,

  //     critical

  //   };

  // }, [projects]);

  const kpiStats = useMemo(() => {

    const kpis = dashboardData?.dashboard?.projectKpis;

    if (!kpis) {

      return {

        totalProjects: 0,

        notStarted: 0,

        inProgress: 0,

        completed: 0,

        critical: 0,

      };

    }

    return {

      totalProjects: Number(kpis.totalProjects ?? 0),

      notStarted: Number(kpis.notStarted ?? 0),

      inProgress: Number(kpis.inProgress ?? 0),

      completed: Number(kpis.completed ?? 0),

      critical: Number(kpis.critical ?? 0),

    };

  }, [dashboardData]);

  // const displayedRecentProjects = useMemo(() => {

  //   // let result = recentProjects;
  //       let result = projects;

  //   if (activeKpiFilter === 'not_started') {

  //     result = result.filter(p => p.status === 'Not Started');

  //   } else if (activeKpiFilter === 'in_progress') {

  //     result = result.filter(p => p.status === 'In Progress');

  //   } else if (activeKpiFilter === 'delivered') {

  //     result = result.filter(

  //       p => p.status === 'Completed' || p.status === 'Delivered'

  //     );

  //   } else if (activeKpiFilter === 'at_risk') {

  //     result = result.filter(

  //       p => ['Critical', 'At Risk', 'On Hold'].includes(p.status)

  //     );

  //   }

  //   if (!searchQuery.trim()) return result;

  //   const q = searchQuery.toLowerCase();

  //   return result.filter(p =>

  //     p.name.toLowerCase().includes(q) ||

  //     p.customer.toLowerCase().includes(q) ||

  //     p.code.toLowerCase().includes(q) ||

  //     p.category.toLowerCase().includes(q)

  //   );

  // }, [projects, activeKpiFilter, searchQuery]);

  const displayedRecentProjects = useMemo(() => {
    let result = projects;

    if (activeKpiFilter === 'not_started') {
      result = result.filter(p => p.status === 'Not Started');
    } else if (activeKpiFilter === 'in_progress') {
      result = result.filter(p => p.status === 'In Progress');
    } else if (activeKpiFilter === 'delivered') {
      result = result.filter(
        p => p.status === 'Completed' || p.status === 'Delivered'
      );
    } else if (activeKpiFilter === 'at_risk') {
      result = result.filter(
        p => ['Critical', 'At Risk', 'On Hold'].includes(p.status)
      );
    }

    if (!searchQuery.trim()) return result;

    const q = searchQuery.toLowerCase();

    return result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.customer.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [projects, activeKpiFilter, searchQuery]);

  // Handle Project Selection for Tracking

  const handleSelectProject = (project: ProjectItem) => {

    setSelectedProject(project);

    navigate(`/projects/${project.id}`);

  };

  // Add new project

  const handleAddProject = (newProject: ProjectItem) => {

    setProjects(prev => [newProject, ...prev]);

    setSelectedProject(newProject);

    setIsUploadOpen(false);

    showToast(`Project "${newProject.name}" has been uploaded and created successfully.`);

    navigate(`/projects/${newProject.id}`);

  };

  const handleUploadProject = async (formData: FormData) => {
    const response = await uploadProject(formData);

    if (!response?.success || !response.project?.id) {
      throw new Error(
        response?.message || "Project upload failed."
      );
    }

    showToast(
      response.message || "Project uploaded successfully."
    );

    navigate(`/projects/${response.project.id}`);
  };

  // Add spare item to cart

  // changes done by vb: accepts a quantity (from the Qty picker) instead of always adding 1
  // const handleAddToCart = (spare: CriticalSpareItem, quantity: number = 1) => {

  //   const qty = Math.max(1, Math.floor(quantity) || 1);

  //   setCart(prev => {

  //     const existing = prev.find(item => item.id === spare.id);

  //     if (existing) {

  //       return prev.map(item =>

  //         // changes done by vb: add the chosen qty instead of +1
  //         item.id === spare.id ? { ...item, quantity: item.quantity + qty } : item

  //       );

  //     }

  //     return [

  //       ...prev,

  //       {

  //         id: spare.id,

  //         name: spare.name,

  //         partNumber: spare.partNumber,

  //         // changes done by vb: String() so numeric unitCost from the API doesn't crash .replace
  //         unitPrice: parseFloat(String(spare.unitCost).replace(/[^0-9.]/g, '')) || 450,

  //         quantity: qty, // changes done by vb

  //         category: spare.category

  //       }

  //     ];

  //   });

  //   showToast(`Added ${qty} × ${spare.name} to Requisition Cart.`); // changes done by vb

  // };

  // Add spare item to cart (capped at available stock) and open cart drawer
  const handleAddToCart = (spare: CriticalSpareItem, quantity: number = 1) => {
    const availableStock = Math.max(0, Number(spare.stock ?? spare.qty ?? 0));

    if (availableStock <= 0) {
      showToast(`"${spare.name}" is currently out of stock.`);
      return;
    }

    const requestedQty = Math.max(1, Math.floor(quantity) || 1);
    const existingItem = cart.find(item => item.id === spare.id);
    const currentCartQty = existingItem ? existingItem.quantity : 0;
    const remainingAllowed = availableStock - currentCartQty;

    if (remainingAllowed <= 0) {
      showToast(
        `Maximum available stock (${availableStock}) for "${spare.name}" is already in your cart.`
      );
      setIsSparesOpen(false);
      setIsCartOpen(true);
      return;
    }

    const qtyToAdd = Math.min(requestedQty, remainingAllowed);

    setCart(prev => {
      const existing = prev.find(item => item.id === spare.id);

      if (existing) {
        return prev.map(item =>
          item.id === spare.id
            ? { ...item, quantity: item.quantity + qtyToAdd }
            : item
        );
      }

      return [
        ...prev,
        {
          id: spare.id,
          name: spare.name,
          partNumber: spare.partNumber,
          unitPrice:
            parseFloat(String(spare.unitCost).replace(/[^0-9.]/g, '')) || 450,
          quantity: qtyToAdd,
          category: spare.category,
        },
      ];
    });

    if (qtyToAdd < requestedQty) {
      showToast(
        `Added ${qtyToAdd} × ${spare.name} (capped at available stock of ${availableStock}).`
      );
    } else {
      showToast(`Added ${qtyToAdd} × ${spare.name} to Requisition Cart.`);
    }

    // Close spares modal if open and display the cart drawer
    setIsSparesOpen(false);
    setIsCartOpen(true);
  };

  // Update Cart Quantity (capped at available stock)
  const handleUpdateCartQuantity = (id: string, delta: number) => {
    const matchingSpare = spares.find(s => s.id === id);
    const maxStock = matchingSpare
      ? Math.max(0, Number(matchingSpare.stock ?? matchingSpare.qty ?? 0))
      : Infinity;

    setCart(prev =>
      prev.map(item => {
        if (item.id === id) {
          const proposedQty = item.quantity + delta;
          if (proposedQty <= 0) return item;
          if (proposedQty > maxStock) {
            showToast(
              `Cannot exceed available stock (${maxStock}) for "${item.name}".`
            );
            return { ...item, quantity: maxStock };
          }
          return { ...item, quantity: proposedQty };
        }
        return item;
      })
    );
  };

  // Update Cart Quantity

  // const handleUpdateCartQuantity = (id: string, delta: number) => {

  //   setCart(prev =>

  //     prev.map(item => {

  //       if (item.id === id) {

  //         const newQty = item.quantity + delta;

  //         return newQty > 0 ? { ...item, quantity: newQty } : item;

  //       }

  //       return item;

  //     })

  //   );

  // };

  // Remove Item from Cart

  const handleRemoveFromCart = (id: string) => {

    setCart(prev => prev.filter(item => item.id !== id));

  };

  // Cart Checkout

  const handleCartCheckout = () => {

    setCart([]);

    showToast('Enterprise requisition submitted to procurement dispatch.');

  };

  // Add Ticket

  const handleAddTicket = (newTicket: SupportTicketItem) => {

    setTickets(prev => [newTicket, ...prev]);

    showToast(`Ticket ${newTicket.ticketNumber} dispatched to engineering QA.`);

  };

  // Add Location to Project

  const handleAddLocationToProject = (projectId: string, newLocation: ProjectLocation) => {

    setProjects(prev => prev.map(p => {

      if (p.id === projectId) {

        const updatedLocs = [...(p.locations || []), newLocation];

        const updatedCountries = new Set(updatedLocs.map(l => l.country)).size;

        return {

          ...p,

          locations: updatedLocs,

          locationsCount: updatedLocs.length,

          countriesCount: updatedCountries

        };

      }

      return p;

    }));

    if (selectedProject.id === projectId) {

      setSelectedProject(prev => {

        const updatedLocs = [...(prev.locations || []), newLocation];

        return {

          ...prev,

          locations: updatedLocs,

          locationsCount: updatedLocs.length,

          countriesCount: new Set(updatedLocs.map(l => l.country)).size

        };

      });

    }

    showToast(`Added location ${newLocation.city}, ${newLocation.country} to project.`);

  };

  // Handle Nav Header clicks

  const handleNavClick = (tabId: string) => {

    setActiveNav(tabId);

    if (tabId === 'dashboard') {

      navigate('/dashboard');

    } else if (tabId === 'projects') {

      navigate(`/projects/${selectedProject?.id || 'prj-1'}`);

    } else if (tabId === 'reports') {

      navigate('/reports');

    } else if (tabId === 'spares') {

      navigate('/critical-spares');

    } else if (tabId === 'tickets') {

      navigate('/tickets');

    } else if (tabId === 'orders') {

      navigate('/orders');

    } else if (tabId === 'calendar') {

      navigate('/calendar');

    } else if (tabId === 'account') {

      navigate('/account');

    } else if (tabId === 'help') {

      navigate('/help');

    }

  };


  const handleMarkNotificationAsRead = async (id: string) => {
    const notification = notifications.find((item) => item.id === id);

    if (!notification || notification.read) return;

    try {
      await markNotificationAsRead(id);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, read: true } : item
        )
      );

      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      showToast(
        error instanceof Error ? error.message : "Unable to update notification."
      );
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    if (unreadNotificationsCount === 0) return;

    try {
      await markAllNotificationsAsRead();

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, read: true }))
      );

      setUnreadNotificationsCount(0);
      showToast("All notifications marked as read.");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      showToast(
        error instanceof Error ? error.message : "Unable to update notifications."
      );
    }
  };


  if (!isAuthenticated) {

    return (

      <>

        {/* <LoginPage 

          onLoginSuccess={(username, profileData) => {

            localStorage.setItem('pseudoteam_authenticated', 'true');

            setIsAuthenticated(true);

            if (profileData) {

              setUserProfileData(profileData);

            }

            if (profileData && (profileData.country || profileData.city || profileData.entityType)) {

              showToast(`Profile completed! Welcome to your workspace, ${username || 'Vaniya Batra'}.`);

            } else {

              showToast(`Welcome back, ${username || 'Vaniya Batra'}`);

            }

            navigate('/dashboard');

          }} 

        /> */}

        <LoginPage

          // onLoginSuccess={(username, profileData) => {

          //   setIsAuthenticated(true);

          //   if (profileData) {

          //     setUserProfileData(profileData);

          //   }

          //   showToast(`Welcome back, ${username || 'Customer'}!`);

          //   // The complete-profile view is not implemented in this App yet.
          //   navigate('/dashboard');

          // }}

          onLoginSuccess={(username, profileData) => {
            setIsAuthenticated(true);

            if (username) {
              setCurrentUserName(username);
              localStorage.setItem('customer_name', username);
            }

            if (profileData) {
              setUserProfileData(profileData);
            }

            showToast(`Welcome back, ${username || 'Customer'}!`);

            navigate('/dashboard');
          }}

        />

        {toastMessage && (

          <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-xl shadow-lg border border-slate-700/60 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">

            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />

            <span>{toastMessage}</span>

          </div>

        )}

      </>

    );

  }

  return (

    <div

      id="pseudoteam-app-root"

      className="w-full h-screen max-h-screen overflow-hidden bg-[#F4F6F9] text-slate-800 flex flex-col font-sans select-none animate-in fade-in duration-700 ease-out"

    >

      {/* 1. Global Header (56px) */}

      {/* <Header

        activeNav={activeNav}

        onNavClick={handleNavClick}

        searchQuery={searchQuery}

        onSearchChange={setSearchQuery}

        notifications={notifications}

        cart={cart}

        projects={projects}

        events={events}

        onAddEvent={(newEvent) => {

          setEvents(prev => [newEvent, ...prev]);

          showToast(`Event "${newEvent.title}" scheduled.`);

        }}

        onOpenFullCalendar={() => navigate('/calendar')}

        onSelectProject={(projectId) => navigate(`/projects/${projectId}`)}

        onOpenUpload={() => navigate('/upload-project')}

        onOpenCart={() => setIsCartOpen(true)}

        onOpenNotifications={() => setIsNotificationsOpen(true)}

        onOpenProfile={() => navigate('/account')}

        onOpenReferral={() => setIsReferralOpen(true)}

        // onLogout={() => {

        //   localStorage.setItem('pseudoteam_authenticated', 'false');

        //   setIsAuthenticated(false);

        //   showToast('Signed out of PseudoTeam workspace.');

        //   navigate('/login');

        // }}

        onLogout={() => {

          localStorage.removeItem('auth_token');

          localStorage.removeItem('pseudoteam_authenticated');

          setIsAuthenticated(false);

          setDashboardData(null);

          showToast('Signed out of PseudoTeam workspace.');

          navigate('/login');

        }}

      /> */}

      <Header
        activeNav={activeNav}
        onNavClick={handleNavClick}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        notifications={notifications}
        notificationCount={unreadNotificationsCount}
        cart={cart}
        // cartCount={totalCartUnits}
        cartCount={cart.length}
        projects={projects}
        events={events}
        userName={currentUserName}
        userEmail={currentUserEmail}
        avatarUrl={currentUserAvatar}
        // onAddEvent={(newEvent) => {
        //   setEvents(prev => [newEvent, ...prev]);
        //   showToast(`Event "${newEvent.title}" scheduled.`);
        // }}
        onAddEvent={handleAddTodo}
        onOpenFullCalendar={() => navigate('/calendar')}
        onSelectProject={(projectId) => navigate(`/projects/${projectId}`)}
        onOpenUpload={() => navigate('/upload-project')}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => navigate('/account')}
        onOpenReferral={() => setIsReferralOpen(true)}
        // onLogout={() => {
        //   localStorage.removeItem('auth_token');
        //   localStorage.removeItem('pseudoteam_authenticated');

        //   setIsAuthenticated(false);
        //   setDashboardData(null);

        //   showToast('Signed out of PseudoTeam workspace.');
        //   navigate('/login');
        // }}
        onLogout={() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('pseudoteam_authenticated');
          localStorage.removeItem('pseudoteam_cart');
          setCart([]);

          setIsAuthenticated(false);
          setDashboardData(null);

          showToast('Signed out of PseudoTeam workspace.');
          navigate('/login');
        }}
      />

      {/* Subtle Toast notification */}

      {toastMessage && (

        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-xl shadow-lg border border-slate-700/60 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">

          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />

          <span>{toastMessage}</span>

        </div>

      )}

      {/* 2. Main Content Area */}

      {currentView === 'upload' ? (

        // <UploadProjectView

        //   onCancel={() => navigate('/dashboard')}

        //   onAddProject={handleAddProject}

        // />

        <UploadProjectView
          onCancel={() => navigate('/dashboard')}
          onAddProject={handleUploadProject}
        />

        // ) : currentView === 'tracking' ? (

        //   <ProjectTrackingView

        //     project={selectedProject}

        //     allProjects={projects}

        //     onSelectProject={(p) => navigate(`/projects/${p.id}`)}

        //     onBackToDashboard={() => navigate('/dashboard')}

        //     onGenerateReport={() => navigate('/reports')}

        //     onViewTickets={() => navigate('/tickets')}

        //     onRequestSpare={() => setIsSparesOpen(true)}

        //     onAddLocation={() => setIsAddLocationOpen(true)}

        //     onViewLocationDetails={(loc) => {

        //       navigateToLocationMilestones(selectedProject.id, loc.id);

        //     }}

        //     onUploadDocs={() => navigate('/upload-project')}

        //   />

        // ) : currentView === 'location-milestones' && selectedLocation ? (

      ) : currentView === 'tracking' ? (
        trackingLoading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
            Loading project tracking...
          </div>
        ) : trackingError ? (
          <div
            className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            role="alert"
          >
            {trackingError}
          </div>
        ) : !trackingSelectedProject ? (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
            No projects available for tracking.
          </div>
        ) : (
          <ProjectTrackingView
            project={trackingSelectedProject}
            allProjects={trackingProjects}
            onSelectProject={(p) => navigate(`/projects/${p.id}`)}
            onBackToDashboard={() => navigate('/dashboard')}
            onGenerateReport={() => navigate('/reports')}
            onViewTickets={() => navigate('/tickets')}
            onRequestSpare={() => setIsSparesOpen(true)}
            onAddLocation={() => setIsAddLocationOpen(true)}
            onViewLocationDetails={(loc) => {
              navigateToLocationMilestones(trackingSelectedProject.id, loc.id);
            }}
            onUploadDocs={() => navigate('/upload-project')}
          />
        )
      ) : currentView === 'location-milestones' && selectedLocation ? (

        <LocationMilestonesView

          project={selectedProject}

          initialLocation={selectedLocation}

          currentUser={currentUserName || 'Customer'}

          onSelectLocation={(loc) => {

            setSelectedLocation(loc);

            navigate(`/projects/${selectedProject.id}/locations/${loc.id}/milestones`);

          }}

          onViewMilestoneTasks={(milestone) => {

            navigateToMilestoneTasks(selectedProject, selectedLocation, milestone);

          }}

          onBackToTracking={() => navigate(`/projects/${selectedProject.id}`)}

          onBackToDashboard={() => navigate('/dashboard')}

          onUpdateProjectLocation={(projectId, updatedLoc) => {

            setProjects(prev => prev.map(p => {

              if (p.id === projectId) {

                const updatedLocs = (p.locations || []).map(l => l.id === updatedLoc.id ? updatedLoc : l);

                return {

                  ...p,

                  locations: updatedLocs

                };

              }

              return p;

            }));

            setSelectedProject(prev => {

              if (prev.id === projectId) {

                const updatedLocs = (prev.locations || []).map(l => l.id === updatedLoc.id ? updatedLoc : l);

                return {

                  ...prev,

                  locations: updatedLocs

                };

              }

              return prev;

            });

            setSelectedLocation(updatedLoc);

          }}

        />

      ) : currentView === 'milestone-tasks' && selectedLocation && selectedMilestone ? (

        <MilestoneTasksView

          project={selectedProject}

          location={selectedLocation}

          initialMilestone={selectedMilestone}
          currentUser={currentUserName || 'Customer'}

          onBackToMilestones={() => {

            navigate(`/projects/${selectedProject.id}/locations/${selectedLocation.id}/milestones`);

          }}

          onBackToTracking={() => navigate(`/projects/${selectedProject.id}`)}

          onBackToDashboard={() => navigate('/dashboard')}

          onSelectMilestone={(m) => {

            setSelectedMilestone(m);

          }}

        />

        // ) : currentView === 'spares' ? (

        //   <CriticalSparesView

        //     spares={spares}

        //     onBackToDashboard={() => navigate('/dashboard')}

        //     onAddToCart={handleAddToCart}

        //   />

      ) : currentView === 'spares' ? (

        <CriticalSparesView

          spares={spares}

          cart={cart}

          onBackToDashboard={() => navigate('/dashboard')}

          onAddToCart={handleAddToCart}

        />

      ) : currentView === 'tickets' ? (

        // <TicketsView

        //   tickets={tickets}

        //   onBackToDashboard={() => navigate('/dashboard')}

        //   onViewTicketDetails={(tkt) => {

        //     setSelectedTicket(tkt);

        //     navigate(`/tickets/${tkt.ticketNumber}`);

        //   }}

        //   onAddTicket={handleAddTicket}

        //   isOpenModalInitial={openTicketModalInitially}

        // />
        <TicketsView
          tickets={tickets}
          projects={projects}
          defaultProjectId={selectedProject?.id}
          onBackToDashboard={() => navigate('/dashboard')}
          onViewTicketDetails={(tkt) => {
            setSelectedTicket(tkt);
            navigate(`/tickets/${tkt.ticketNumber}`);
          }}
          onAddTicket={handleAddTicket}
          isOpenModalInitial={openTicketModalInitially}
        />

      ) : currentView === 'ticket-details' && selectedTicket ? (

        <TicketDetailsView

          ticket={selectedTicket}

          onBackToTickets={() => navigate('/tickets')}

          onBackToDashboard={() => navigate('/dashboard')}

          onUpdateTicketStatus={(ticketId, newStatus) => {

            setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));

            setSelectedTicket(prev => prev && prev.id === ticketId ? { ...prev, status: newStatus } : prev);

          }}

        />

      ) : currentView === 'orders' ? (

        <OrdersView

          orders={orders}
          loading={ordersLoading}
          error={ordersError}

          onBackToDashboard={() => navigate('/dashboard')}

        />

      ) : currentView === 'account' ? (

        <AccountProfileView

          initialProfileData={userProfileData}

          onBackToDashboard={() => navigate('/dashboard')}

          onShowToast={showToast}

        />

      ) : currentView === 'help' ? (

        <HelpView

          onAddTicket={handleAddTicket}

          onShowToast={showToast}

          onBackToDashboard={() => navigate('/dashboard')}

        />

      ) : (

        /* MAIN DASHBOARD: 

           Begins directly with KPI section below header (NO welcome hero banner, NO large Refer & Earn banner).

           Fits inside 1440 × 900 without page scroll.

        */

        <main

          id="main-dashboard-viewport"

          className="flex-1 p-2.5 sm:p-3 lg:px-4 lg:py-2.5 flex flex-col gap-2.5 max-w-[1680px] w-full mx-auto overflow-y-auto xl:overflow-hidden min-h-0 xl:h-[calc(100vh-56px)] select-text"

        >

          {dashboardLoading && (
            <div
              className="shrink-0 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700"
              role="status"
              aria-live="polite"
            >
              Loading dashboard...
            </div>
          )}

          {dashboardError && (
            <div
              className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {dashboardError}
            </div>
          )}

          {/* KPI Section: 5 items immediately below header */}

          <div className="shrink-0">

            <KpiSection

              stats={kpiStats}

              activeFilter={activeKpiFilter}

              onKpiClick={handleKpiToggle}

              onUploadClick={() => setCurrentView('upload')}

              onOpenUpload={() => setCurrentView('upload')}

            />

          </div>

          {/* Grid Row 1: Recent Projects + Project Progress Overview + Calendar */}

          {/* changes done by vb
              Only stretch/shrink to fill the viewport at xl, where the dashboard is a fixed-height layout.
              Below xl the page scrolls, so this row must keep its natural height or it overlaps Row 2. */}
          <div className="shrink-0 xl:shrink xl:flex-1 xl:min-h-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-2.5">

            {/* Recent Projects Table */}

            <div className="col-span-1 md:col-span-2 xl:col-span-5 h-auto md:h-[340px] xl:h-full min-h-[260px] xl:min-h-0">

              <RecentProjectsTable

                projects={displayedRecentProjects}

                activeFilterLabel={activeKpiFilterLabel}

                onClearFilter={() => setActiveKpiFilter(null)}

                onSelectProject={(projectId) => navigate(`/projects/${projectId}`)}

                onViewAll={() => navigate(`/projects/${projects[0]?.id || 'prj-1'}`)}

                onUploadProject={() => navigate('/upload-project')}

              />

            </div>

            {/* Project Progress Overview */}

            {/* <div className="col-span-1 md:col-span-1 xl:col-span-4 h-auto md:h-[340px] xl:h-full min-h-[250px] xl:min-h-0">

              <ProjectProgressOverview

                onViewFullReports={() => navigate('/reports')}

              />

            </div> */}

            {/* Project Progress Overview */}
            <div className="col-span-1 md:col-span-1 xl:col-span-4 h-auto md:h-[340px] xl:h-full min-h-[250px] xl:min-h-0">
              <ProjectProgressOverview
                projects={projects}
                onViewFullReports={() => navigate('/reports')}
              />
            </div>

            {/* Calendar */}

            <div className="col-span-1 md:col-span-1 xl:col-span-3 h-auto md:h-[340px] xl:h-full min-h-[280px] xl:min-h-0">

              <CalendarCard

                events={events}

                onViewAll={() => navigate('/calendar')}

                onOpenFullCalendar={() => navigate('/calendar')}

                // onAddEvent={(newEvent) => {

                //   setEvents(prev => [newEvent, ...prev]);

                //   showToast(`Event "${newEvent.title}" scheduled.`);

                // }}

                onAddEvent={handleAddTodo}

              />

            </div>

          </div>

          {/* Grid Row 2: 4 cards (Critical Spares, Support Tickets, Recent Orders, Quick Actions) */}

          <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 h-auto xl:h-[202px]">

            {/* 1. Critical Spares */}

            <div className="h-auto xl:h-full min-h-[175px] xl:min-h-0">

              <CriticalSparesCard

                onViewAll={() => navigate('/critical-spares')}

                onRequestSpare={() => setIsSparesOpen(true)}

              />

            </div>

            {/* 2. Support Tickets */}

            <div className="h-auto xl:h-full min-h-[175px] xl:min-h-0">

              <SupportTicketsCard

                onViewAll={() => navigate('/tickets')}

                onCreateTicket={() => navigate('/tickets?openTicket=true')}

              />

            </div>

            {/* 3. Recent Orders */}

            <div className="h-auto xl:h-full min-h-[175px] xl:min-h-0">

              <RecentOrdersCard

                orders={orders}

                onViewAll={() => navigate('/orders')}

              />

            </div>

            {/* 4. Quick Actions */}

            <div className="h-auto xl:h-full min-h-[175px] xl:min-h-0">

              <QuickActionsCard

                onUploadProject={() => navigate('/upload-project')}

                onGenerateReport={() => navigate('/reports')}

                onTrackProject={() => navigate(`/projects/${projects[0]?.id || 'prj-1'}`)}

                onViewTickets={() => navigate('/tickets')}

                onViewOrders={() => navigate('/orders')}

                onRequestSpare={() => setIsSparesOpen(true)}

                onCreateInquiry={() => navigate('/help')}

                onOpenCart={() => setIsCartOpen(true)}

              />

            </div>

          </div>

        </main>

      )}

      {/* Interactive Modals & Drawers */}

      <UploadProjectModal

        isOpen={isUploadOpen}

        onClose={() => setIsUploadOpen(false)}

        onAddProject={handleAddProject}

      />

      <GenerateReportModal

        isOpen={isReportOpen}

        onClose={() => {

          setIsReportOpen(false);

          if (location.pathname === '/reports') navigate('/dashboard');

        }}

        projects={projects}

        defaultProject={selectedProject}

      />

      <TicketsModal

        isOpen={isTicketsOpen}

        onClose={() => setIsTicketsOpen(false)}

        tickets={tickets}

        onAddTicket={handleAddTicket}

        initialProjectName={selectedProject?.name}

      />

      {/* <CriticalSparesModal

        isOpen={isSparesOpen}

        onClose={() => setIsSparesOpen(false)}

        spares={spares}

        onAddToCart={handleAddToCart}

      /> */}

      <CriticalSparesModal

        isOpen={isSparesOpen}

        onClose={() => setIsSparesOpen(false)}

        spares={spares}

        cart={cart}

        onAddToCart={handleAddToCart}

      />

      <OrdersModal

        isOpen={isOrdersOpen}

        onClose={() => setIsOrdersOpen(false)}

        orders={orders}

      />

      <CalendarModal

        isOpen={isCalendarOpen}

        onClose={() => {

          setIsCalendarOpen(false);

          if (location.pathname === '/calendar') navigate('/dashboard');

        }}

        events={events}

        onAddEvent={handleAddTodo} // changes done by vb: "+ New event" in the Teams-style calendar saves a Todo

      />

      <CartDrawer

        isOpen={isCartOpen}

        onClose={() => setIsCartOpen(false)}

        cart={cart}

        spares={spares}

        onUpdateQuantity={handleUpdateCartQuantity}

        onRemoveItem={handleRemoveFromCart}

        onCheckout={handleCartCheckout}

      />

      {/* <NotificationsPanel

        isOpen={isNotificationsOpen}

        onClose={() => setIsNotificationsOpen(false)}

        notifications={notifications}

        onMarkAllAsRead={() => {

          setNotifications(prev => prev.map(n => ({ ...n, read: true })));

          showToast('All notifications marked as read.');

        }}

      /> */}


      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
      />


      <ReferralModal

        isOpen={isReferralOpen}

        onClose={() => setIsReferralOpen(false)}

      />

      <HelpInquiryModal

        isOpen={isHelpOpen}

        onClose={() => setIsHelpOpen(false)}

        onAddTicket={handleAddTicket}

        onShowToast={showToast}

      />

      <UserProfileModal

        isOpen={isUserProfileOpen}

        onClose={() => setIsUserProfileOpen(false)}

        onOpenFullAccount={() => {

          setIsUserProfileOpen(false);

          navigate('/account');

        }}

        // onLogout={() => {

        //   setIsUserProfileOpen(false);

        //   localStorage.setItem('pseudoteam_authenticated', 'false');

        //   setIsAuthenticated(false);

        //   showToast('Signed out of PseudoTeam workspace.');

        //   navigate('/login');

        // }}

        onLogout={() => {

          localStorage.removeItem('auth_token');

          localStorage.removeItem('pseudoteam_authenticated');

          setIsAuthenticated(false);

          setDashboardData(null);

          showToast('Signed out of PseudoTeam workspace.');

          navigate('/login');

        }}

      />

      <AddLocationModal

        isOpen={isAddLocationOpen}

        onClose={() => setIsAddLocationOpen(false)}

        project={selectedProject}

        onAddLocation={handleAddLocationToProject}

      />

    </div>

  );

};

// const mapDashboardProject = (

//   project: any,

//   progressData: any[] = []

// ): ProjectItem => {

//   const progressEntry = progressData.find(

//     (item) => String(item.id) === String(project.id)

//   );

//   const status = project.status || "Unknown";

//   return {

//     id: String(project.id),

//     code: String(project.projectId || project.id),

//     name: project.title || "Untitled Project",

//     customer: project.customerName || "",

//     category: project.category || project.type || "General",

//     status: status as ProjectItem["status"],

//     progress: progressEntry?.progress ?? 0,

//     currentPhase: project.statusDescription || status,

//     velocity: "",

//     manager: "",

//     startDate: project.startDate || "",

//     expectedCompletion: project.endDate || "",

//     budget: String(project.budget ?? 0),

//     lastUpdated: project.updatedAt || project.createdAt || "",

//     milestonesCount: 0,

//     completedMilestones: 0,

//     locationsCount: 0,

//     countriesCount: 0,

//     locations: [],

//   };

// };

const mapDashboardProject = (
  project: any,
  progressData: any[] = []
): ProjectItem => {
  const progressEntry = progressData.find(
    (item) => String(item.id) === String(project.id)
  );

  const status = project.status || "Unknown";

  const rawFinalBudget =
    project.finalPrice ??
    project.final_price ??
    project.plist_final_price ??
    null;

  return {
    id: String(project.id),

    code: String(project.projectId || project.id),

    name: project.title || "Untitled Project",

    customer: project.customerName || "",

    category: project.category || project.type || "General",

    status: status as ProjectItem["status"],

    progress: progressEntry?.progress ?? 0,

    currentPhase: project.statusDescription || status,

    velocity: "",

    manager: "",

    startDate: project.startDate || "",

    expectedCompletion: project.endDate || "",

    budget: String(project.budget ?? 0),

    finalBudget: rawFinalBudget != null ? String(rawFinalBudget) : undefined,

    lastUpdated: project.updatedAt || project.createdAt || "",

    milestonesCount: 0,

    completedMilestones: 0,

    locationsCount: 0,

    countriesCount: 0,

    locations: [],
  };
};

export default App;