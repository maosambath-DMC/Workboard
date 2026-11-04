import React from 'react';
import type { CanvasItem } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  GitBranch, 
  Trash2, 
  ArrowRight, 
  Layers, 
  ExternalLink 
} from 'lucide-react';

interface CanvasMiniboardProps {
  item: CanvasItem;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent, item: CanvasItem) => void;
}

export const CanvasMiniboard: React.FC<CanvasMiniboardProps> = ({
  item,
  isSelected,
  onSelect,
  onDragStart,
}) => {
  const { openProject, removeItem, branchItem, projects } = useWorkspace();

  const targetProjectId = item.targetProjectId || 'project-bloom';
  const targetProject = projects.find((p) => p.id === targetProjectId);

  const handleEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    openProject(targetProjectId);
  };

  const handleBranch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const branchLabel = window.prompt('Enter branch theme or connection to this sub-board:', 'Sub-flow');
    if (branchLabel !== null) {
      branchItem(item.id, branchLabel.trim() || 'Sub-board');
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onDragStart(e, item);
      }}
      style={{
        transform: `translate3d(${item.x}px, ${item.y}px, 0)`,
        width: `${item.width || 280}px`,
      }}
      className={`absolute top-0 left-0 rounded-3xl p-4 bg-white dark:bg-slate-900 border-2 border-purple-300 dark:border-purple-800 shadow-lg hover:shadow-2xl transition-all cursor-grab active:cursor-grabbing select-none group ${
        isSelected ? 'ring-3 ring-purple-600 shadow-2xl scale-[1.02]' : ''
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" strokeWidth={1.75} />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300">
            Miniboard Portal
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleBranch}
            title="Branch idea to/from this sub-board"
            className="p-1 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <GitBranch className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
          <button
            onClick={() => removeItem(item.id)}
            title="Delete miniboard portal"
            className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Miniature Whiteboard Preview Window */}
      <div 
        onClick={handleEnter}
        className="w-full h-28 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 relative overflow-hidden p-2 flex flex-col justify-between cursor-pointer group/portal hover:border-purple-400 transition-colors mb-3"
      >
        {/* Dotted grid preview */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1.2px,transparent_1.2px)] [background-size:10px_10px] pointer-events-none" />

        {/* Mini simulated notes on the miniboard */}
        <div className="relative z-10 flex gap-1.5">
          <div className="w-10 h-10 rounded-lg bg-[#fbcfe8] border border-[#f472b6] shadow-xs flex flex-col justify-between p-1">
            <div className="w-5 h-1 bg-black/30 rounded" />
            <div className="w-6 h-1 bg-black/20 rounded" />
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#bae6fd] border border-[#38bdf8] shadow-xs flex flex-col justify-between p-1">
            <div className="w-6 h-1 bg-black/30 rounded" />
            <div className="w-4 h-1 bg-black/20 rounded" />
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#fef08a] border border-[#facc15] shadow-xs flex flex-col justify-between p-1">
            <div className="w-5 h-1 bg-black/30 rounded" />
            <div className="w-7 h-1 bg-black/20 rounded" />
          </div>
        </div>

        {/* Hover Click to Enter overlay */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-white/90 dark:bg-slate-900/90 px-2 py-1 rounded-lg backdrop-blur-xs border border-purple-200 dark:border-purple-800 shadow-xs group-hover/portal:scale-[1.02] transition-transform">
          <span>Click to Enter Whiteboard</span>
          <ExternalLink className="w-3 h-3" />
        </div>
      </div>

      {/* Board Title & CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate max-w-[160px]">
            {item.title || targetProject?.title || 'Sub-board Canvas'}
          </h4>
          <span className="text-[10px] text-slate-400 font-medium">
            {targetProject?.items.length || 6} items inside
          </span>
        </div>

        <button
          onClick={handleEnter}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95"
        >
          <span>Enter</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
