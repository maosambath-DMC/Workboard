import React from 'react';
import { CanvasItem } from '../../types';

interface ConnectorsLayerProps {
  items: CanvasItem[];
  selectedItemId: string | null;
}

export const ConnectorsLayer: React.FC<ConnectorsLayerProps> = ({ items, selectedItemId }) => {
  const itemMap = new Map<string, CanvasItem>();
  items.forEach((item) => itemMap.set(item.id, item));

  // Find all items with parentId that exists in itemMap
  const connections = items
    .filter((item) => item.parentId && itemMap.has(item.parentId))
    .map((child) => {
      const parent = itemMap.get(child.parentId!)!;
      return {
        id: `${parent.id}->${child.id}`,
        parent,
        child,
        label: child.branchLabel,
        isSelected: selectedItemId === child.id || selectedItemId === parent.id,
      };
    });

  if (connections.length === 0) return null;

  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-0">
      <defs>
        <marker
          id="arrow-end"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#a855f7" />
        </marker>
        <marker
          id="arrow-end-active"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#ec4899" />
        </marker>
        <filter id="glow-line" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {connections.map((conn) => {
        const { parent, child, label, isSelected, id } = conn;

        // Calculate anchors with safe defaults
        const pW = parent.width || 200;
        const pH = parent.height || 100;
        const cW = child.width || 200;
        const cH = child.height || 100;

        const parentCenterX = parent.x + pW / 2;
        const parentCenterY = parent.y + pH / 2;
        const childCenterX = child.x + cW / 2;
        const childCenterY = child.y + cH / 2;

        let startX: number;
        let startY: number;
        let endX: number;
        let endY: number;

        if (childCenterX > parentCenterX + 60) {
          // Child is to the right
          startX = parent.x + pW;
          startY = parent.y + pH / 2;
          endX = child.x;
          endY = child.y + cH / 2;
        } else if (childCenterX < parentCenterX - 60) {
          // Child is to the left
          startX = parent.x;
          startY = parent.y + pH / 2;
          endX = child.x + cW;
          endY = child.y + cH / 2;
        } else if (childCenterY > parentCenterY) {
          // Child is below
          startX = parent.x + pW / 2;
          startY = parent.y + pH;
          endX = child.x + cW / 2;
          endY = child.y;
        } else {
          // Child is above
          startX = parent.x + pW / 2;
          startY = parent.y;
          endX = child.x + cW / 2;
          endY = child.y + cH;
        }

        const deltaX = Math.abs(endX - startX);
        const curveOffset = Math.max(40, deltaX * 0.45);

        const cp1X = startX < endX ? startX + curveOffset : startX - curveOffset;
        const cp1Y = startY;
        const cp2X = startX < endX ? endX - curveOffset : endX + curveOffset;
        const cp2Y = endY;

        const pathData = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

        // Midpoint for label
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;

        return (
          <g key={id} className="transition-all duration-300">
            {/* Glow / background line for visibility */}
            <path
              d={pathData}
              fill="none"
              stroke={isSelected ? 'rgba(236, 72, 153, 0.4)' : 'rgba(168, 85, 247, 0.25)'}
              strokeWidth={isSelected ? 6 : 4}
              strokeLinecap="round"
            />
            {/* Main animated line */}
            <path
              d={pathData}
              fill="none"
              stroke={isSelected ? '#ec4899' : '#a855f7'}
              strokeWidth={isSelected ? 2.5 : 2}
              strokeDasharray="6 5"
              className="animate-dash-flow"
              strokeLinecap="round"
            />
            {/* Start circle dot */}
            <circle
              cx={startX}
              cy={startY}
              r={4}
              fill={isSelected ? '#ec4899' : '#a855f7'}
              className="transition-all"
            />
            {/* End circle dot */}
            <circle
              cx={endX}
              cy={endY}
              r={5}
              fill={isSelected ? '#ec4899' : '#a855f7'}
              className="transition-all"
            />

            {/* Branch Label Badge */}
            {label && (
              <g transform={`translate(${midX}, ${midY})`}>
                <foreignObject
                  x={-60}
                  y={-14}
                  width={120}
                  height={28}
                  className="overflow-visible pointer-events-auto"
                >
                  <div className="flex items-center justify-center">
                    <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wide rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-sm backdrop-blur-md whitespace-nowrap select-none hover:scale-105 transition-transform">
                      🌱 {label}
                    </span>
                  </div>
                </foreignObject>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};
