import React, { useState } from 'react';
import { CanvasItem } from '../../types';
import { CARD_COLORS } from '../../constants/colors';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Trash2, Edit3, CheckCircle2 } from 'lucide-react';

interface FrameCardProps {
  item: CanvasItem;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent | React.PointerEvent, item: CanvasItem) => void;
}

export const FrameCard: React.FC<FrameCardProps> = ({
  item,
  isSelected,
  onSelect,
  onDragStart,
}) => {
  const { updateItem, removeItem, setDecision } = useWorkspace();
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const colors = CARD_COLORS[item.color] || CARD_COLORS.green;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerDown={(e) => {
        // Drag only when clicking header bar
        if ((e.target as HTMLElement).closest('.frame-header')) {
          onDragStart(e, item);
        }
      }}
      style={{
        transform: `translate3d(${item.x}px, ${item.y}px, 0)`,
        width: `${item.width}px`,
        height: `${item.height}px`,
      }}
      className={`absolute top-0 left-0 rounded-3xl border-2 border-dashed ${
        colors.border
      } ${colors.darkBorder} bg-slate-50/40 dark:bg-slate-900/30 backdrop-blur-[2px] transition-all ${
        isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''
      } select-none touch-none pointer-events-auto`}
    >
      {/* Frame Header Bar */}
      <div className="frame-header flex items-center justify-between px-4 py-2.5 rounded-t-3xl bg-white/60 dark:bg-slate-800/60 border-b border-dashed border-slate-200 dark:border-slate-800 cursor-grab active:cursor-grabbing backdrop-blur-md">
        <div className="flex items-center gap-2 flex-1">
          {isEditingTitle ? (
            <input
              type="text"
              value={item.title}
              autoFocus
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              onChange={(e) => updateItem(item.id, { title: e.target.value })}
              className="text-xs font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-purple-400 outline-none w-2/3"
            />
          ) : (
            <h4
              onDoubleClick={() => setIsEditingTitle(true)}
              className="text-xs font-bold tracking-wide uppercase text-slate-600 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400"
            >
              <span>{item.title}</span>
              <Edit3 className="w-3 h-3 opacity-40 hover:opacity-100" />
            </h4>
          )}

          {item.isDecision && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              <CheckCircle2 className="w-3 h-3" /> Locked Pillar
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDecision(item.id, item.isDecision ? null : 'core');
            }}
            title={item.isDecision ? 'Unlock direction pillar' : 'Lock as shared direction pillar'}
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
              item.isDecision
                ? 'bg-emerald-600 text-white'
                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            {item.isDecision ? 'Locked Pillar' : 'Lock Pillar'}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              removeItem(item.id);
            }}
            title="Delete frame (Backspace / Del)"
            className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
