import React from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Plus,
  ArrowRight
} from 'lucide-react';

export type KpiFilterType = 'not_started' | 'in_progress' | 'delivered' | 'at_risk' | null;

interface KpiStatsType {
  totalProjects?: number;
  notStarted?: number;
  inProgress?: number;
  completed?: number;
  critical?: number;
}

interface KpiSectionProps {
  totalProjects?: number;
  inProgressCount?: number;
  completedCount?: number;
  criticalCount?: number;
  stats?: KpiStatsType;
  onOpenUpload?: () => void;
  onUploadClick?: () => void;
  activeFilter?: KpiFilterType;
  onKpiClick?: (filterKey: 'not_started' | 'in_progress' | 'delivered' | 'at_risk') => void;
}

export const KpiSection: React.FC<KpiSectionProps> = ({
  totalProjects,
  inProgressCount,
  completedCount,
  criticalCount,
  stats,
  onOpenUpload,
  onUploadClick,
  activeFilter = null,
  onKpiClick
}) => {
  const handleUpload = onOpenUpload || onUploadClick || (() => {});

  const notStarted = stats?.notStarted ?? (totalProjects ?? stats?.totalProjects ?? 4);
  const inProgress = inProgressCount ?? stats?.inProgress ?? 10;
  const delivered = completedCount ?? stats?.completed ?? 6;
  const atRisk = criticalCount ?? stats?.critical ?? 4;

  const isNotStartedActive = activeFilter === 'not_started';
  const isInProgressActive = activeFilter === 'in_progress';
  const isDeliveredActive = activeFilter === 'delivered';
  const isAtRiskActive = activeFilter === 'at_risk';

  return (
    <section className="w-full shrink-0" id="dashboard-kpi-section">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-2.5 items-stretch lg:h-[80px]">
        
        {/* Card 1: Projects Not Started */}
        <div 
          id="kpi-card-not-started"
          onClick={() => onKpiClick?.('not_started')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onKpiClick?.('not_started');
            }
          }}
          className={`bg-[#EEF5FF] rounded-xl py-2 px-3 sm:py-2.5 sm:px-3.5 min-h-[74px] sm:min-h-[80px] relative overflow-hidden flex flex-col justify-between h-full group transition-all cursor-pointer ${
            isNotStartedActive
              ? 'border-2 border-blue-600 shadow-[0_0_0_1px_#2563EB,0_4px_16px_rgba(37,99,235,0.22)] ring-2 ring-blue-500/20'
              : 'border border-blue-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-blue-300'
          }`}
          title="Click to filter by Projects Not Started"
        >
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100/90 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                {notStarted}
              </span>
            </div>
            <div 
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-colors shadow-2xs ${
                isNotStartedActive 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/80 group-hover:bg-white text-slate-500 group-hover:text-slate-800'
              }`}
            >
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>

          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-600 z-10 truncate flex items-center justify-between mt-1 sm:mt-0">
            <span>Projects Not Started</span>
            {isNotStartedActive && (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.2 rounded">
                Active
              </span>
            )}
          </div>

          <svg 
            className="absolute bottom-0 right-0 w-32 h-10 pointer-events-none z-0" 
            viewBox="0 0 160 60" 
            fill="none" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0 60 Q 60 50, 95 32 T 160 12 L 160 60 Z" 
              fill="url(#blueWave)" 
            />
            <defs>
              <linearGradient id="blueWave" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.08" />
                <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.32" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Card 2: Projects In Progress */}
        <div 
          id="kpi-card-in-progress"
          onClick={() => onKpiClick?.('in_progress')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onKpiClick?.('in_progress');
            }
          }}
          className={`bg-[#FEFCE8] rounded-xl py-2 px-3 sm:py-2.5 sm:px-3.5 min-h-[74px] sm:min-h-[80px] relative overflow-hidden flex flex-col justify-between h-full group transition-all cursor-pointer ${
            isInProgressActive
              ? 'border-2 border-blue-600 shadow-[0_0_0_1px_#2563EB,0_4px_16px_rgba(37,99,235,0.22)] ring-2 ring-blue-500/20'
              : 'border border-amber-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-amber-300'
          }`}
          title="Click to filter by Projects In Progress"
        >
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-100/90 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                {inProgress}
              </span>
            </div>
            <div 
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-colors shadow-2xs ${
                isInProgressActive 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/80 group-hover:bg-white text-slate-500 group-hover:text-slate-800'
              }`}
            >
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>

          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-600 z-10 truncate flex items-center justify-between mt-1 sm:mt-0">
            <span>Projects In Progress</span>
            {isInProgressActive && (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.2 rounded">
                Active
              </span>
            )}
          </div>

          <svg 
            className="absolute bottom-0 right-0 w-32 h-10 pointer-events-none z-0" 
            viewBox="0 0 160 60" 
            fill="none" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0 60 Q 60 52, 95 34 T 160 14 L 160 60 Z" 
              fill="url(#amberWave)" 
            />
            <defs>
              <linearGradient id="amberWave" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.08" />
                <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#D97706" stopOpacity="0.32" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Card 3: Projects Delivered */}
        <div 
          id="kpi-card-delivered"
          onClick={() => onKpiClick?.('delivered')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onKpiClick?.('delivered');
            }
          }}
          className={`bg-[#F0FDF4] rounded-xl py-2 px-3 sm:py-2.5 sm:px-3.5 min-h-[74px] sm:min-h-[80px] relative overflow-hidden flex flex-col justify-between h-full group transition-all cursor-pointer ${
            isDeliveredActive
              ? 'border-2 border-blue-600 shadow-[0_0_0_1px_#2563EB,0_4px_16px_rgba(37,99,235,0.22)] ring-2 ring-blue-500/20'
              : 'border border-emerald-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-emerald-300'
          }`}
          title="Click to filter by Projects Delivered"
        >
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-100/90 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                {delivered}
              </span>
            </div>
            <div 
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-colors shadow-2xs ${
                isDeliveredActive 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/80 group-hover:bg-white text-slate-500 group-hover:text-slate-800'
              }`}
            >
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>

          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-600 z-10 truncate flex items-center justify-between mt-1 sm:mt-0">
            <span>Projects Delivered</span>
            {isDeliveredActive && (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.2 rounded">
                Active
              </span>
            )}
          </div>

          <svg 
            className="absolute bottom-0 right-0 w-32 h-10 pointer-events-none z-0" 
            viewBox="0 0 160 60" 
            fill="none" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0 60 Q 60 52, 95 34 T 160 14 L 160 60 Z" 
              fill="url(#emeraldWave)" 
            />
            <defs>
              <linearGradient id="emeraldWave" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.08" />
                <stop offset="60%" stopColor="#10B981" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.32" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Card 4: Projects At Risk / On Hold */}
        <div 
          id="kpi-card-at-risk"
          onClick={() => onKpiClick?.('at_risk')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onKpiClick?.('at_risk');
            }
          }}
          className={`bg-[#FFF1F2] rounded-xl py-2 px-3 sm:py-2.5 sm:px-3.5 min-h-[74px] sm:min-h-[80px] relative overflow-hidden flex flex-col justify-between h-full group transition-all cursor-pointer ${
            isAtRiskActive
              ? 'border-2 border-blue-600 shadow-[0_0_0_1px_#2563EB,0_4px_16px_rgba(37,99,235,0.22)] ring-2 ring-blue-500/20'
              : 'border border-rose-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-rose-300'
          }`}
          title="Click to filter by Projects At Risk / On Hold"
        >
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-100/90 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                {atRisk}
              </span>
            </div>
            <div 
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-colors shadow-2xs ${
                isAtRiskActive 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/80 group-hover:bg-white text-slate-500 group-hover:text-slate-800'
              }`}
            >
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>

          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-600 z-10 truncate flex items-center justify-between mt-1 sm:mt-0">
            <span>Projects At Risk / On Hold</span>
            {isAtRiskActive && (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.2 rounded">
                Active
              </span>
            )}
          </div>

          <svg 
            className="absolute bottom-0 right-0 w-32 h-10 pointer-events-none z-0" 
            viewBox="0 0 160 60" 
            fill="none" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0 60 Q 60 52, 95 34 T 160 14 L 160 60 Z" 
              fill="url(#roseWave)" 
            />
            <defs>
              <linearGradient id="roseWave" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.08" />
                <stop offset="60%" stopColor="#F43F5E" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#E11D48" stopOpacity="0.32" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 5. Upload Project Button - Modern High-Tech Enterprise Style */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1 h-full min-h-[48px] flex items-center">
          <button
            onClick={handleUpload}
            id="kpi-upload-project-btn"
            className="w-full h-[48px] sm:h-[50px] relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25 active:translate-y-0 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm rounded-xl px-4 flex items-center justify-between shadow-md shadow-blue-900/15 border border-blue-400/25 transition-all duration-300 cursor-pointer group after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:-translate-x-full hover:after:translate-x-full after:transition-transform after:duration-1000"
          >
            {/* High-tech micro grid accent */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:8px_8px] opacity-10 pointer-events-none" />

            <div className="flex items-center gap-2.5 relative z-10">
              <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 group-hover:scale-105 group-hover:bg-white/25 transition-all">
                <Plus className="w-3.5 h-3.5 stroke-[2.5] text-white" />
              </div>
              <span className="tracking-tight text-white font-bold">Upload Project</span>
            </div>

            <div className="relative z-10 flex items-center text-blue-200 group-hover:text-white transition-colors">
              <ArrowRight className="w-4 h-4 upload-btn-arrow-icon" />
            </div>
          </button>
        </div>

      </div>
    </section>
  );
};
