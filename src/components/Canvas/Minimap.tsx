import React, { useState } from 'react';
import { CanvasItem } from '../../types';
import { CARD_COLORS } from '../../constants/colors';
import { Map, ChevronDown, ChevronUp } from 'lucide-react';

interface MinimapProps {
  items: CanvasItem[];
  zoom: number;
  panOffset: { x: number; y: number };
  onNavigate: (newPan: { x: number; y: number }) => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  items,
  zoom,
  panOffset,
  onNavigate,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Compute world bounding box
  const minX = 0;
  const minY = 0;
  const maxX = 2200;
  const maxY = 1400;

  const mapWidth = 180;
  const mapHeight = 115;

  const scaleX = mapWidth / (maxX - minX);
  const scaleY = mapHeight / (maxY - minY);

  // Viewport calculation
  const vpWidth = (window.innerWidth / zoom) * scaleX;
  const vpHeight = (window.innerHeight / zoom) * scaleY;
  const vpLeft = (-panOffset.x / zoom) * scaleX;
  const vpTop = (-panOffset.y / zoom) * scaleY;

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert click in minimap to world coordinate
    const worldX = clickX / scaleX;
    const worldY = clickY / scaleY;

    // Center viewport at world coordinate
    const targetPanX = -(worldX * zoom - window.innerWidth / 2);
    const targetPanY = -(worldY * zoom - window.innerHeight / 2);

    onNavigate({ x: targetPanX, y: targetPanY });
  };

  return (
    <div className="hidden md:flex absolute bottom-6 right-6 z-20 flex-col items-end pointer-events-auto select-none">
      <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-md overflow-hidden transition-all">
        {/* Minimap Header */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Map className="w-3.5 h-3.5 text-purple-500" />
            <span>Navigator</span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Minimap Canvas Area */}
        {!isCollapsed && (
          <div
            onClick={handleMinimapClick}
            style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
            className="relative bg-slate-100/60 dark:bg-slate-950/60 cursor-crosshair overflow-hidden"
          >
            {/* Render item nodes */}
            {items.map((item) => {
              const x = item.x * scaleX;
              const y = item.y * scaleY;
              const w = Math.max(4, item.width * scaleX);
              const h = Math.max(3, item.height * scaleY);
              const isFrame = item.type === 'frame';

              return (
                <div
                  key={item.id}
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                  }}
                  className={`absolute rounded-xs pointer-events-none ${
                    isFrame
                      ? 'border border-dashed border-purple-400 bg-purple-500/10'
                      : 'bg-purple-500/80 dark:bg-purple-400/80 shadow-xs'
                  }`}
                />
              );
            })}

            {/* Viewport Indicator Rectangle */}
            <div
              style={{
                left: `${Math.max(0, vpLeft)}px`,
                top: `${Math.max(0, vpTop)}px`,
                width: `${Math.min(mapWidth, vpWidth)}px`,
                height: `${Math.min(mapHeight, vpHeight)}px`,
              }}
              className="absolute border-2 border-purple-600 dark:border-purple-400 bg-purple-500/15 rounded pointer-events-none transition-all duration-75"
            />
          </div>
        )}
      </div>
    </div>
  );
};
