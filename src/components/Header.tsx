import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ShoppingCart,
  ChevronDown,
  Layers,
  CheckCircle2,
  X,
  User,
  ShieldCheck,
  LogOut,
  Sparkles,
  ExternalLink,
  Menu
} from 'lucide-react';
import { ActiveNavTab, NotificationItem, CartItem, ProjectItem, CalendarEventItem } from '../types';
import { CalendarCard } from './CalendarCard';

interface HeaderProps {
  activeTab?: ActiveNavTab;
  setActiveTab?: (tab: ActiveNavTab) => void;
  activeNav?: string;
  onNavClick?: (tabId: string) => void;
  notifications?: NotificationItem[];
  notificationCount?: number;
  cart?: CartItem[];
  cartCount?: number;
  projects?: ProjectItem[];
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onOpenNotifications?: () => void;
  onOpenCart?: () => void;
  onOpenProfile?: () => void;
  onOpenReferral?: () => void;
  onOpenUpload?: () => void;
  onSelectProject?: (projectId: string) => void;
  onLogout?: () => void;
  events?: CalendarEventItem[];
  onAddEvent?: (event: CalendarEventItem) => void;
  onOpenFullCalendar?: () => void;
  userName?: string;
  userEmail?: string;
  avatarUrl?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeNav,
  onNavClick,
  notifications = [],
  notificationCount,
  cart = [],
  cartCount,
  onOpenNotifications,
  onOpenCart,
  onOpenProfile,
  onOpenReferral,
  onOpenUpload,
  onSelectProject,
  projects = [],
  onLogout,
  searchQuery,
  onSearchChange,
  events = [],
  onAddEvent,
  onOpenFullCalendar,
  userName = '',
  userEmail = '',
  avatarUrl = null
}) => {
  const [internalSearch, setInternalSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Calendar floating popup state and refs
  const [isCalendarPopupOpen, setIsCalendarPopupOpen] = useState(false);
  const calendarButtonRef = useRef<HTMLButtonElement>(null);
  const calendarPopupRef = useRef<HTMLDivElement>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number; width: number }>({ top: 56, left: 100, width: 440 });

  const updatePopupPosition = () => {
    if (!calendarButtonRef.current) return;
    const rect = calendarButtonRef.current.getBoundingClientRect();
    const width = Math.min(440, window.innerWidth - 24);

    // Position directly below the Calendar item, centered relative to the button
    let left = rect.left + rect.width / 2 - width / 2;
    // Bound within viewport with at least 12px margin
    if (left + width > window.innerWidth - 12) {
      left = window.innerWidth - 12 - width;
    }
    if (left < 12) {
      left = 12;
    }

    setPopupPos({
      top: rect.bottom + 6,
      left: Math.round(left),
      width: Math.round(width)
    });
  };

  useEffect(() => {
    if (isCalendarPopupOpen) {
      updatePopupPosition();
      window.addEventListener('resize', updatePopupPosition);
      window.addEventListener('scroll', updatePopupPosition, true);
      return () => {
        window.removeEventListener('resize', updatePopupPosition);
        window.removeEventListener('scroll', updatePopupPosition, true);
      };
    }
  }, [isCalendarPopupOpen]);

  const query = typeof searchQuery === 'string' ? searchQuery : internalSearch;
  const setQuery = (val: string) => {
    setInternalSearch(val);
    if (onSearchChange) onSearchChange(val);
  };

  const safeNotifications = notifications || [];
  const safeCart = cart || [];
  const safeProjects = projects || [];

  // const unreadCount = typeof notificationCount === 'number' 
  //   ? notificationCount 
  //   : safeNotifications.filter(n => n && !n.read).length || 3;

  const unreadCount = typeof notificationCount === 'number'
    ? notificationCount
    : safeNotifications.filter(n => n && !n.read).length;

  // const resolvedCartCount = typeof cartCount === 'number'
  //   ? cartCount
  //   : safeCart.reduce((sum, item) => sum + (item?.quantity || 1), 0) || 9;

  const resolvedCartCount = typeof cartCount === 'number'
  ? cartCount
  : safeCart.length;

  const currentTab: ActiveNavTab = activeTab || (() => {
    if (activeNav === 'dashboard') return 'Dashboard';
    if (activeNav === 'projects' || activeNav === 'tracking') return 'Projects';
    if (activeNav === 'reports') return 'Reports';
    if (activeNav === 'spares' || activeNav === 'critical-spares') return 'Critical Spares';
    if (activeNav === 'tickets') return 'Tickets';
    if (activeNav === 'orders') return 'Orders';
    if (activeNav === 'calendar') return 'Calendar';
    if (activeNav === 'help') return 'Help';
    if (activeNav === 'account') return 'Account';
    return 'Dashboard';
  })();

  const handleTabClick = (tab: ActiveNavTab) => {
    if (tab === 'Calendar') {
      // Toggle floating calendar popup without navigating away
      setIsCalendarPopupOpen(prev => !prev);
      return;
    }
    // If opening any other tab, close calendar popup
    setIsCalendarPopupOpen(false);
    if (setActiveTab) {
      setActiveTab(tab);
    }
    if (onNavClick) {
      const tabMap: Record<ActiveNavTab, string> = {
        'Dashboard': 'dashboard',
        'Projects': 'projects',
        'Reports': 'reports',
        'Critical Spares': 'spares',
        'Tickets': 'tickets',
        'Orders': 'orders',
        'Calendar': 'calendar',
        'Help': 'help',
        'Account': 'account'
      };
      onNavClick(tabMap[tab] || tab.toLowerCase());
    }
  };

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchFocused(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setIsMobileMenuOpen(false);
      }
      if (
        calendarPopupRef.current &&
        !calendarPopupRef.current.contains(target) &&
        calendarButtonRef.current &&
        !calendarButtonRef.current.contains(target)
      ) {
        setIsCalendarPopupOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCalendarPopupOpen(false);
        setUserMenuOpen(false);
        setSearchFocused(false);
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navItems: ActiveNavTab[] = [
    'Dashboard',
    'Projects',
    'Reports',
    'Critical Spares',
    'Tickets',
    'Orders',
    // changes done by vb: 'Calendar' removed from the navbar (desktop + mobile menu).
    // The calendar is still available from "View All" on the dashboard calendar card (/calendar).
    'Help',
    'Account'
  ];

  // Search filter
  const filteredProjects = query.trim()
    ? safeProjects.filter(p =>
      p && (
        (p.name || '').toLowerCase().includes(query.toLowerCase()) ||
        (p.code || '').toLowerCase().includes(query.toLowerCase()) ||
        (p.customer || '').toLowerCase().includes(query.toLowerCase())
      )
    )
    : [];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 select-none shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* changes done by vb */}
      <div className="max-w-[1720px] mx-auto px-2 min-[360px]:px-3 sm:px-4 lg:px-6 h-[56px] flex items-center justify-between gap-1.5 min-[360px]:gap-2 sm:gap-4">

        {/* Left: Brand + Subtitle + Mobile Hamburger */}
        {/* changes done by vb */}
        <div className="flex items-center gap-1 min-[360px]:gap-2 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 -ml-1 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 shrink-0"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open navigation menu"}
            id="btn-header-mobile-hamburger"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => {
              handleTabClick('Dashboard');
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center text-left transition-opacity hover:opacity-90 cursor-pointer py-1 min-w-0"
            id="header-brand-logo"
            aria-label="PseudoTeam Dashboard"
          >
            {/* changes done by vb: new PseudoTeam logo (public/pseudoteam-logo.png) on a dark navy badge
                so its light text is readable on the white header */}
            <span className="inline-flex items-center min-w-0 rounded-xl bg-gradient-to-br from-[#0B1736] to-[#1E3A8A] px-1.5 min-[360px]:px-2 py-0.5 shadow-[0_4px_12px_rgba(11,23,54,0.25)] ring-1 ring-white/10">
              <img
                src="/pseudoteam-logo.png"
                alt="PseudoTeam"
                className="h-7 min-[360px]:h-8 sm:h-10 w-auto max-w-full min-[360px]:max-w-[110px] sm:max-w-[140px] min-w-0 object-contain select-none"
                referrerPolicy="no-referrer"
              />
            </span>
          </button>

          {/* Navigation Items (Desktop & Wide Tablets) */}
          {/* changes done by vb */}
          <nav className="hidden xl:flex items-center gap-0.5 xl:gap-1 ml-1 sm:ml-2 overflow-x-auto no-scrollbar">
            {navItems.map((tab) => {
              const isCalendarItem = tab === 'Calendar';
              const isActive = isCalendarItem
                ? (isCalendarPopupOpen || currentTab === 'Calendar')
                : (currentTab === tab && !isCalendarPopupOpen);

              return (
                <button
                  key={tab}
                  ref={isCalendarItem ? calendarButtonRef : undefined}
                  onClick={() => handleTabClick(tab)}
                  id={`nav-item-${tab.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`relative px-2.5 xl:px-3 py-4 text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap ${isActive
                      ? 'text-blue-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {tab}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-blue-600 rounded-t-sm" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Search + Notifications + Cart + User Avatar */}
        <div className="flex items-center gap-0.5 min-[360px]:gap-1.5 sm:gap-3 shrink-0">

          {/* Mobile Search Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden xl:flex 2xl:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 flex items-center justify-center" /* changes done by vb */
            title="Search"
            aria-label="Search"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>

          {/* Desktop/Tablet Global Search Bar */}
          {/* changes done by vb */}
          <div ref={searchRef} className="relative hidden md:block xl:hidden 2xl:block w-44 lg:w-60 2xl:w-72">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search projects, tickets, spares..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                id="global-search-input"
                className="w-full pl-9 pr-7 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 placeholder-slate-400 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Search Dropdown */}
            {searchFocused && query.trim() && (
              <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Matching Projects
                </div>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProject?.(p.id);
                        setSearchFocused(false);
                        setQuery('');
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="font-medium text-slate-800">{p.name}</div>
                        <div className="text-[11px] text-slate-500">{p.code} · {p.customer}</div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {p.progress}%
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-3 text-xs text-slate-500 text-center">
                    No matching items found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons: Notifications & Cart */}
          <div className="flex items-center gap-0.5 min-[360px]:gap-1 sm:gap-2">
            {/* Notifications Button */}
            <button
              onClick={onOpenNotifications}
              id="header-notifications-button"
              className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Notifications"
              aria-label="Notifications"
            >
              <span className="relative inline-flex items-center justify-center">
                <Bell className="w-[19px] h-[19px] stroke-[1.8]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs leading-none">
                    {unreadCount}
                  </span>
                )}
              </span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              id="header-cart-button"
              className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Requisitions & Cart"
              aria-label="Requisitions & Cart"
            >
              <span className="relative inline-flex items-center justify-center">
                <ShoppingCart className="w-[19px] h-[19px] stroke-[1.8]" />
                {resolvedCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs leading-none">
                    {resolvedCartCount}
                  </span>
                )}
              </span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-1 sm:mx-2 hidden sm:block" />

          {/* User Profile Dropdown */}
          <div ref={userMenuRef} className="relative pl-0.5">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              id="header-user-dropdown-button"
              className="h-10 flex items-center gap-1.5 sm:gap-2 px-1 min-[360px]:px-1.5 hover:bg-slate-100 rounded-lg transition-colors text-left cursor-pointer"
              aria-label="User Profile menu"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName || 'Customer'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {userName
                      .trim()
                      .split(/\\s+/)
                      .filter(Boolean)
                      .map(part => part.charAt(0))
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || 'C'}
                  </div>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  {userName || 'Customer'}
                </div>
              </div>
              {/* changes done by vb */}
              <ChevronDown className="hidden min-[360px]:block w-3.5 h-3.5 text-slate-400 transition-transform duration-150" />
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-xs">
                <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/50">
                  <div className="font-semibold text-slate-900">{userName || 'Customer'}</div>
                  <div className="text-[11px] text-slate-500">{userEmail}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium">
                    <ShieldCheck className="w-3 h-3" /> Enterprise Admin Verified
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenProfile();
                    }}
                    id="menu-user-profile"
                    className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Account & Profile
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenReferral();
                    }}
                    id="menu-refer-program"
                    className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Refer a Friend</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    id="menu-logout"
                    className="w-full px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Search Bar Dropdown */}
      {/* changes done by vb */}
      {isMobileSearchOpen && (
        <div className="md:hidden xl:block 2xl:hidden border-t border-slate-200 bg-white px-3 sm:px-4 py-2.5 shadow-sm animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              autoFocus
              placeholder="Search projects, tickets, spares..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {query.trim() && (
            <div className="mt-2 max-h-48 overflow-y-auto divide-y divide-slate-100">
              {filteredProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProject?.(p.id);
                    setIsMobileSearchOpen(false);
                    setQuery('');
                  }}
                  className="w-full py-2.5 px-2 text-left flex items-center justify-between text-xs hover:bg-slate-50 rounded transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-slate-800">{p.name}</div>
                    <div className="text-[11px] text-slate-500">{p.code} · {p.customer}</div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {p.progress}%
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Responsive Mobile Navigation Drawer */}
      {/* changes done by vb */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          id="header-mobile-drawer"
          className="xl:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[calc(100dvh-56px)] overflow-y-auto no-scrollbar"
        >
          <div className="p-3 sm:p-4 space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Navigation Menu
            </div>
            {navItems.map((tab) => {
              const isCalendarItem = tab === 'Calendar';
              const isActive = isCalendarItem
                ? (isCalendarPopupOpen || currentTab === 'Calendar')
                : (currentTab === tab && !isCalendarPopupOpen);

              return (
                <button
                  key={tab}
                  onClick={() => {
                    handleTabClick(tab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] cursor-pointer ${isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'
                    }`}
                >
                  <span>{tab}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-white" />}
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-100 mt-2 space-y-1">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenProfile?.();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors min-h-[44px] cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Account & Profile</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout?.();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-sm font-semibold transition-colors min-h-[44px] cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Calendar Popup directly below Calendar navbar item */}
      {isCalendarPopupOpen && (
        <div
          ref={calendarPopupRef}
          id="calendar-navbar-popup"
          style={{
            position: 'fixed',
            top: `${popupPos.top}px`,
            left: `${popupPos.left}px`,
            width: `${popupPos.width}px`,
            maxHeight: 'calc(100dvh - 72px)', // changes done by vb
          }}
          className="z-50 bg-white rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.14),0_4px_12px_rgba(0,0,0,0.06)] border border-slate-200/90 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <CalendarCard
            events={events}
            isPopup={true}
            onClose={() => setIsCalendarPopupOpen(false)}
            onViewAll={() => {
              setIsCalendarPopupOpen(false);
              onOpenFullCalendar?.();
            }}
            onOpenFullCalendar={() => {
              setIsCalendarPopupOpen(false);
              onOpenFullCalendar?.();
            }}
            onAddEvent={onAddEvent}
          />
        </div>
      )}
    </header>
  );
};
