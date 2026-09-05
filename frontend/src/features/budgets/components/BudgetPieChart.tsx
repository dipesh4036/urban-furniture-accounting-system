"use client";

import React, { useId, useState } from "react";

export interface BudgetPieChartProps {
  plannedAmount: number;
  achievedAmount: number;
  size?: "mini" | "sm" | "md" | "lg";
  className?: string;
  showLabels?: boolean;
  showLegend?: boolean;
  interactive?: boolean;
}

// Helper to convert polar coordinates to cartesian coordinates in SVG
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

// Generate SVG arc path for a pie slice
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    x,
    y,
    "L",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "Z",
  ].join(" ");
}

export function BudgetPieChart({
  plannedAmount,
  achievedAmount,
  size = "md",
  className = "",
  showLabels = true,
  showLegend = false,
  interactive = true,
}: BudgetPieChartProps) {
  const [hoveredSlice, setHoveredSlice] = useState<"achieved" | "balance" | null>(null);
  const patternId = useId();

  const total = plannedAmount > 0 ? plannedAmount : 1;
  const clampedAchieved = Math.max(0, achievedAmount);
  const achievedRatio = Math.min(1, clampedAchieved / total);
  const balanceRatio = Math.max(0, 1 - achievedRatio);

  const achievedPct = Math.round(achievedRatio * 100);
  const balancePct = Math.round(balanceRatio * 100);

  const dimension =
    size === "mini" ? 38 : size === "sm" ? 80 : size === "md" ? 180 : 280;
  const radius = (dimension - (size === "lg" ? 40 : 8)) / 2;
  const center = dimension / 2;

  // Angles: Start at -90 deg (12 o'clock), sweep clockwise
  // Achieved: 0 to achievedAngle
  const achievedAngle = Math.max(1, Math.min(359.9, achievedRatio * 360));
  const isFullAchieved = achievedRatio >= 0.999;
  const isZeroAchieved = achievedRatio <= 0.001;

  const achievedPath = describeArc(center, center, radius, 0, achievedAngle);
  const balancePath = describeArc(center, center, radius, achievedAngle, 360);

  // Label positions (at ~65% radius out for readability)
  const achievedMidAngle = achievedAngle / 2;
  const balanceMidAngle = achievedAngle + (360 - achievedAngle) / 2;
  const labelRadius = radius * 0.62;
  const achievedPos = polarToCartesian(center, center, labelRadius, achievedMidAngle);
  const balancePos = polarToCartesian(center, center, labelRadius, balanceMidAngle);

  // External wireframe-style label positions for large view
  const extLabelAchieved = polarToCartesian(center, center, radius + 18, achievedMidAngle);
  const extLabelBalance = polarToCartesian(center, center, radius + 18, balanceMidAngle);

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div className="relative inline-block" style={{ width: dimension, height: dimension }}>
        <svg
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
          className="overflow-visible"
        >
          <defs>
            {/* Cross-hatch patterns reflecting the wireframe sketch */}
            <pattern
              id={`hatch-cyan-${patternId}`}
              width="6"
              height="6"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="6" stroke="#0284c7" strokeWidth="1.2" opacity="0.6" />
              <line x1="0" y1="0" x2="6" y2="0" stroke="#0284c7" strokeWidth="1.2" opacity="0.6" />
            </pattern>
            <pattern
              id={`hatch-rose-${patternId}`}
              width="6"
              height="6"
              patternTransform="rotate(-45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="6" stroke="#e11d48" strokeWidth="1.2" opacity="0.6" />
              <line x1="0" y1="0" x2="6" y2="0" stroke="#e11d48" strokeWidth="1.2" opacity="0.6" />
            </pattern>

            {/* Gradient fills */}
            <linearGradient id={`grad-cyan-${patternId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id={`grad-rose-${patternId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>

          {/* Full circle if 100% achieved */}
          {isFullAchieved ? (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill={`url(#grad-cyan-${patternId})`}
              stroke="#0f172a"
              strokeWidth={size === "mini" ? "1.5" : "2.5"}
            />
          ) : isZeroAchieved ? (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill={`url(#grad-rose-${patternId})`}
              stroke="#0f172a"
              strokeWidth={size === "mini" ? "1.5" : "2.5"}
            />
          ) : (
            <g className="transition-transform duration-200">
              {/* Achieved Slice (Cyan/Blue) */}
              <g
                className="cursor-pointer transition-opacity hover:opacity-90"
                onMouseEnter={() => interactive && setHoveredSlice("achieved")}
                onMouseLeave={() => interactive && setHoveredSlice(null)}
              >
                <path
                  d={achievedPath}
                  fill={`url(#grad-cyan-${patternId})`}
                  stroke="#0f172a"
                  strokeWidth={size === "mini" ? "1.5" : "2.5"}
                  strokeLinejoin="round"
                  className={hoveredSlice === "achieved" ? "filter drop-shadow-md" : ""}
                />
                {/* Overlay cross-hatch matching wireframe */}
                <path
                  d={achievedPath}
                  fill={`url(#hatch-cyan-${patternId})`}
                  pointerEvents="none"
                  opacity={size === "mini" ? 0.35 : 0.55}
                />
              </g>

              {/* Balance Slice (Coral/Rose Red) */}
              <g
                className="cursor-pointer transition-opacity hover:opacity-90"
                onMouseEnter={() => interactive && setHoveredSlice("balance")}
                onMouseLeave={() => interactive && setHoveredSlice(null)}
              >
                <path
                  d={balancePath}
                  fill={`url(#grad-rose-${patternId})`}
                  stroke="#0f172a"
                  strokeWidth={size === "mini" ? "1.5" : "2.5"}
                  strokeLinejoin="round"
                  className={hoveredSlice === "balance" ? "filter drop-shadow-md" : ""}
                />
                {/* Overlay cross-hatch matching wireframe */}
                <path
                  d={balancePath}
                  fill={`url(#hatch-rose-${patternId})`}
                  pointerEvents="none"
                  opacity={size === "mini" ? 0.35 : 0.55}
                />
              </g>
            </g>
          )}

          {/* Internal percentages if medium size or above */}
          {(size === "md" || size === "lg") && showLabels && (
            <>
              {achievedRatio > 0.12 && (
                <text
                  x={achievedPos.x}
                  y={achievedPos.y + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={size === "lg" ? "15" : "12"}
                  fontWeight="700"
                  className="pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                >
                  {achievedPct}%
                </text>
              )}
              {balanceRatio > 0.12 && (
                <text
                  x={balancePos.x}
                  y={balancePos.y + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={size === "lg" ? "15" : "12"}
                  fontWeight="700"
                  className="pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                >
                  {balancePct}%
                </text>
              )}
            </>
          )}

          {/* External wireframe labels for large view matching the photo */}
          {size === "lg" && showLabels && (
            <>
              <text
                x={extLabelAchieved.x}
                y={extLabelAchieved.y}
                textAnchor={extLabelAchieved.x < center ? "end" : "start"}
                fill="#0284c7"
                fontSize="13"
                fontWeight="700"
                className="font-mono tracking-tight select-none"
              >
                Achieved ({achievedPct}%)
              </text>
              <text
                x={extLabelBalance.x}
                y={extLabelBalance.y}
                textAnchor={extLabelBalance.x < center ? "end" : "start"}
                fill="#e11d48"
                fontSize="13"
                fontWeight="700"
                className="font-mono tracking-tight select-none"
              >
                Balance ({balancePct}%)
              </text>
            </>
          )}
        </svg>

        {/* Hover Tooltip for mini and medium sizes */}
        {interactive && hoveredSlice && (
          <div
            className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg dark:bg-slate-100 dark:text-slate-900 z-30"
          >
            {hoveredSlice === "achieved"
              ? `Achieved: ₹${clampedAchieved.toLocaleString("en-IN", { minimumFractionDigits: 2 })} (${achievedPct}%)`
              : `Balance: ₹${Math.max(0, total - clampedAchieved).toLocaleString("en-IN", { minimumFractionDigits: 2 })} (${balancePct}%)`}
          </div>
        )}
      </div>

      {/* Legend below chart if requested */}
      {showLegend && (
        <div className="mt-4 flex items-center justify-center gap-5 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-full bg-sky-500 border border-sky-600" />
            <span className="text-foreground">Achieved: {achievedPct}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-full bg-rose-500 border border-rose-600" />
            <span className="text-foreground">Balance: {balancePct}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
