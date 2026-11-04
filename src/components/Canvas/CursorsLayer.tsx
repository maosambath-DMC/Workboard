import React from 'react';
import type { PeerCursor } from '../../types';

interface CursorsLayerProps {
  peerCursors: PeerCursor[];
}

export const CursorsLayer: React.FC<CursorsLayerProps> = ({ peerCursors }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
      {peerCursors.map((peer) => {
        const isAndrea = peer.personaName.toLowerCase() === 'andrea';
        const isSimon = peer.personaName.toLowerCase() === 'simon';
        const isDavid = peer.personaName.toLowerCase() === 'david';

        // Custom wedge orientation matching screenshot
        return (
          <div
            key={peer.personaId}
            style={{
              transform: `translate3d(${peer.x}px, ${peer.y}px, 0)`,
              transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
            className="absolute top-0 left-0 flex items-center pointer-events-none select-none"
          >
            {/* Custom Wedge Pointer Arrow directly matching screenshot */}
            <div className="relative flex items-center">
              {/* Pointer Arrow SVG */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  transform: isSimon ? 'rotate(-10deg)' : isDavid ? 'rotate(-60deg)' : 'rotate(10deg)',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                }}
                className="z-10"
              >
                <path
                  d="M3 2L21 11L12 14L8 22L3 2Z"
                  fill={peer.color}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Connected Name Pill matching screenshot */}
              <div
                style={{ backgroundColor: peer.color }}
                className={`px-3 py-1 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1 -ml-1 border border-white/20 tracking-wide select-none ${
                  isDavid ? 'mt-4' : isSimon ? 'ml-1' : ''
                }`}
              >
                {peer.hasStar && <span>★</span>}
                {peer.avatar && !peer.hasStar && <span className="text-xs">{peer.avatar}</span>}
                <span>{peer.personaName}</span>
              </div>
            </div>

            {/* Optional action/thought tag */}
            {peer.activeAction && (
              <div className="ml-2 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-800 backdrop-blur-sm whitespace-nowrap">
                {peer.activeAction}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
