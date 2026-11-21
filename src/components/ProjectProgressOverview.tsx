import React, { useState, useMemo } from 'react';
import { BarChart2, ChevronDown } from 'lucide-react';
import { ProjectItem } from '../types';

interface ProjectProgressOverviewProps {
  projects?: ProjectItem[];
  overallProgress?: number;
  onViewFullReports?: () => void;
}

interface DataPoint {
  label: string;
  notStarted: number;
  inProgress: number;
  onHold: number;
  delivered: number;
}

const parseProjectDate = (project: ProjectItem): Date | null => {
  const candidates = [project.lastUpdated, project.startDate, project.expectedCompletion];
  for (const raw of candidates) {
    if (!raw || raw === '—') continue;
    const trimmed = String(raw).trim();
    // YYYY-MM-DD
    const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      const d = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
      if (!Number.isNaN(d.getTime())) return d;
    }
    // DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      const d = new Date(Number(dmyMatch[3]), Number(dmyMatch[2]) - 1, Number(dmyMatch[1]));
      if (!Number.isNaN(d.getTime())) return d;
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
};

const normalizeStatus = (
  status?: string
): 'notStarted' | 'inProgress' | 'onHold' | 'delivered' => {
  const s = String(status || '').trim().toLowerCase();
  if (s === 'delivered' || s === 'completed') return 'delivered';
  if (s === 'in progress') return 'inProgress';
  if (s === 'on hold' || s === 'critical' || s === 'at risk') return 'onHold';
  return 'notStarted';
};

// Build smooth cubic bezier SVG path through points
const buildSmoothPath = (coords: { x: number; y: number }[]): string => {
  if (coords.length === 0) return '';
  if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i];
    const next = coords[i + 1];
    const midX = (curr.x + next.x) / 2;
    d += ` C ${midX.toFixed(1)} ${curr.y.toFixed(1)}, ${midX.toFixed(1)} ${next.y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  }
  return d;
};

export const ProjectProgressOverview: React.FC<ProjectProgressOverviewProps> = ({
  projects = [],
}) => {
  const [timeRange, setTimeRange] = useState<'This Month' | 'This Quarter' | 'This Year'>('This Month');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const {
    series,
    yTicks,
    deliveredPath,
    deliveredAreaPath,
    inProgressPath,
    onHoldPath,
    notStartedPath,
    pointCoords,
    latestCounts,
  } = useMemo(() => {
    const now = new Date();
    const bucketDates: { date: Date; label: string }[] = [];

    if (timeRange === 'This Month') {
      // 7 checkpoints across the last 30 days (every 5 days)
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 5);
        const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        bucketDates.push({ date: d, label });
      }
    } else if (timeRange === 'This Quarter') {
      // 7 checkpoints across the last 90 days (every 15 days)
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 15);
        const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        bucketDates.push({ date: d, label });
      }
    } else {
      // 7 checkpoints across the last 12 months (every 2 months)
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i * 2 + 1, 0);
        const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
        bucketDates.push({ date: d, label });
      }
    }

    const parsedProjects = projects.map((p) => ({
      statusKey: normalizeStatus(p.status),
      date: parseProjectDate(p),
    }));

    // Cumulative counts up to each checkpoint so trends reflect actual DB state
    const points: DataPoint[] = bucketDates.map(({ date, label }, idx) => {
      const cutoff = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).getTime();
      const isLast = idx === bucketDates.length - 1;

      const counts = {
        notStarted: 0,
        inProgress: 0,
        onHold: 0,
        delivered: 0,
      };

      parsedProjects.forEach((p) => {
        // Include all projects on the final point, and projects created/updated on or before cutoff for earlier points
        if (isLast || !p.date || p.date.getTime() <= cutoff) {
          counts[p.statusKey] += 1;
        }
      });

      return { label, ...counts };
    });

    const latest = points[points.length - 1] || {
      label: '',
      notStarted: 0,
      inProgress: 0,
      onHold: 0,
      delivered: 0,
    };

    const rawMax = Math.max(
      1,
      ...points.flatMap((pt) => [pt.notStarted, pt.inProgress, pt.onHold, pt.delivered])
    );

    // Round Y-axis top to a clean multiple of 5 (minimum 5 or 10)
    const step = rawMax <= 10 ? 2 : Math.ceil(rawMax / 5);
    const yMax = step * 5;

    const yTop = 15;
    const yBottom = 190;
    const ySpan = yBottom - yTop;

    const ticks = [5, 4, 3, 2, 1, 0].map((i) => {
      const val = i * step;
      const y = yBottom - (val / yMax) * ySpan;
      return { label: String(val), y };
    });

    const xPositions = [30, 105, 180, 260, 345, 420, 490];
    const toY = (val: number) => yBottom - (Math.min(yMax, Math.max(0, val)) / yMax) * ySpan;

    const deliveredCoords = points.map((pt, i) => ({ x: xPositions[i], y: toY(pt.delivered) }));
    const inProgressCoords = points.map((pt, i) => ({ x: xPositions[i], y: toY(pt.inProgress) }));
    const onHoldCoords = points.map((pt, i) => ({ x: xPositions[i], y: toY(pt.onHold) }));
    const notStartedCoords = points.map((pt, i) => ({ x: xPositions[i], y: toY(pt.notStarted) }));

    const dPath = buildSmoothPath(deliveredCoords);
    const dAreaPath = dPath
      ? `${dPath} L ${xPositions[xPositions.length - 1]} ${yBottom} L ${xPositions[0]} ${yBottom} Z`
      : '';

    return {
      series: points,
      yTicks: ticks,
      deliveredPath: dPath,
      deliveredAreaPath: dAreaPath,
      inProgressPath: buildSmoothPath(inProgressCoords),
      onHoldPath: buildSmoothPath(onHoldCoords),
      notStartedPath: buildSmoothPath(notStartedCoords),
      pointCoords: xPositions.map((x, i) => ({
        x,
        deliveredY: deliveredCoords[i].y,
        inProgressY: inProgressCoords[i].y,
        onHoldY: onHoldCoords[i].y,
        notStartedY: notStartedCoords[i].y,
      })),
      latestCounts: latest,
    };
  }, [projects, timeRange]);

  return (
    <div 
      id="project-progress-overview-card"
      className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-3 flex flex-col h-full overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BarChart2 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
            Project Progress Overview
          </h2>
        </div>

        {/* Dropdown: This Month */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            <span>{timeRange}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-28 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30 text-xs">
              {(['This Month', 'This Quarter', 'This Year'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTimeRange(t);
                    setDropdownOpen(false);
                  }}
                  className={`w-full px-2.5 py-1 text-left transition-colors cursor-pointer ${
                    timeRange === t ? 'text-blue-600 font-semibold bg-blue-50' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend Row (Actual DB Statuses with Live Counts) */}
      <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 pt-1.5 pb-1 text-[10.5px] sm:text-[11px] text-slate-600 font-medium shrink-0">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
          <span>Not Started ({latestCounts.notStarted})</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span>In Progress ({latestCounts.inProgress})</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>On Hold ({latestCounts.onHold})</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>Delivered ({latestCounts.delivered})</span>
        </div>
      </div>

      {/* Main Multi-Line Chart (exact same visual UI, dynamically driven by DB projects) */}
      <div
        className="flex-1 w-full relative min-h-[160px] flex items-center"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <svg 
          className="w-full h-full overflow-visible" 
          viewBox="0 0 500 205" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="completedAreaCompact" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {yTicks.map((grid) => (
            <g key={grid.label}>
              <text 
                x="18" 
                y={grid.y + 3.5} 
                fontSize="10" 
                fill="#94A3B8" 
                textAnchor="end"
                className="font-mono select-none"
              >
                {grid.label}
              </text>
              <line 
                x1="28" 
                y1={grid.y} 
                x2="495" 
                y2={grid.y} 
                stroke="#F1F5F9" 
                strokeWidth="1" 
              />
            </g>
          ))}

          {/* Green Area Fill under Delivered line */}
          {deliveredAreaPath && (
            <path
              d={deliveredAreaPath}
              fill="url(#completedAreaCompact)"
            />
          )}

          {/* Line 1: Delivered (Green #10B981) */}
          {deliveredPath && (
            <path
              d={deliveredPath}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          )}

          {/* Line 2: In Progress (Amber #F59E0B) */}
          {inProgressPath && (
            <path
              d={inProgressPath}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          )}

          {/* Line 3: On Hold (Rose #EF4444) */}
          {onHoldPath && (
            <path
              d={onHoldPath}
              fill="none"
              stroke="#EF4444"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          )}

          {/* Line 4: Not Started (Blue #3B82F6) */}
          {notStartedPath && (
            <path
              d={notStartedPath}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          )}

          {/* Hover vertical guide & active dots */}
          {hoveredIndex !== null && pointCoords[hoveredIndex] && (
            <g>
              <line
                x1={pointCoords[hoveredIndex].x}
                y1="15"
                x2={pointCoords[hoveredIndex].x}
                y2="190"
                stroke="#CBD5E1"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle cx={pointCoords[hoveredIndex].x} cy={pointCoords[hoveredIndex].deliveredY} r="3.2" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx={pointCoords[hoveredIndex].x} cy={pointCoords[hoveredIndex].inProgressY} r="3.2" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx={pointCoords[hoveredIndex].x} cy={pointCoords[hoveredIndex].onHoldY} r="3.2" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx={pointCoords[hoveredIndex].x} cy={pointCoords[hoveredIndex].notStartedY} r="3.2" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
            </g>
          )}

          {/* Invisible hover columns for smooth point inspection */}
          {pointCoords.map((pt, idx) => (
            <rect
              key={series[idx]?.label || idx}
              x={pt.x - 32}
              y="10"
              width="64"
              height="185"
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setHoveredIndex(idx)}
            />
          ))}

          {/* X-Axis labels */}
          {series.map((item, idx) => {
            const x = pointCoords[idx]?.x ?? 30;
            const anchor = idx === 0 ? 'start' : idx === series.length - 1 ? 'end' : 'middle';
            return (
              <text 
                key={`${item.label}-${idx}`}
                x={idx === series.length - 1 ? 485 : x} 
                y="202" 
                fontSize="9" 
                fill="#94A3B8" 
                textAnchor={anchor}
                className="font-medium select-none"
              >
                {item.label}
              </text>
            );
          })}
        </svg>

        {/* Floating Tooltip on Hover */}
        {hoveredIndex !== null && series[hoveredIndex] && (
          <div
            className="absolute top-1 left-9 bg-slate-900/95 text-white text-[10px] rounded-lg px-2.5 py-1.5 shadow-md pointer-events-none z-20 flex items-center gap-2.5"
          >
            <span className="font-bold text-slate-200 border-r border-slate-700 pr-2">
              {series[hoveredIndex].label}
            </span>
            <span className="text-blue-300 font-mono">NS: {series[hoveredIndex].notStarted}</span>
            <span className="text-amber-300 font-mono">IP: {series[hoveredIndex].inProgress}</span>
            <span className="text-rose-300 font-mono">OH: {series[hoveredIndex].onHold}</span>
            <span className="text-emerald-300 font-mono">DL: {series[hoveredIndex].delivered}</span>
          </div>
        )}
      </div>
    </div>
  );
};