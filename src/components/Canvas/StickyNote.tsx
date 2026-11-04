import React, { useState, useRef } from 'react';
import type { CanvasItem, NoteShape } from '../../types';
import { CARD_COLORS, COLOR_OPTIONS } from '../../constants/colors';
import { NOTE_SHAPES } from '../../constants/shapes';
import { useWorkspace } from '../../context/WorkspaceContext';
import { fireCuteConfetti } from '../../utils/confetti';
import { 
  GitBranch, 
  Star, 
  Trash2, 
  Palette, 
  Shapes,
  CheckCircle2, 
} from 'lucide-react';

interface StickyNoteProps {
  item: CanvasItem;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent | React.PointerEvent, item: CanvasItem) => void;
}

export const StickyNote: React.FC<StickyNoteProps> = ({
  item,
  isSelected,
  onSelect,
  onDragStart,
}) => {
  const { 
    updateItem, 
    removeItem, 
    branchItem, 
    toggleVote, 
    toggleShortlist, 
    activePersonaId 
  } = useWorkspace();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showShapePicker, setShowShapePicker] = useState(false);

  const voteButtonRef = useRef<HTMLButtonElement>(null);

  const colors = CARD_COLORS[item.color] || CARD_COLORS.yellow;
  const hasVoted = item.votes?.includes(activePersonaId);
  const voteCount = item.votes?.length || 0;

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasVoted && voteButtonRef.current) {
      const rect = voteButtonRef.current.getBoundingClientRect();
      fireCuteConfetti(rect.left + rect.width / 2, rect.top);
    }
    toggleVote(item.id);
  };

  const handleBranch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const branchLabel = window.prompt('Enter branch theme or label (e.g. Iteration, Variation, Alternative):', 'Iteration');
    if (branchLabel !== null) {
      branchItem(item.id, branchLabel.trim() || 'Iteration');
    }
  };

  // 100% Solid, fully opaque color themes
  const isPink = item.color === 'pink';
  const isBlue = item.color === 'blue';
  const isYellow = item.color === 'yellow';
  const isGreen = item.color === 'green';
  const isPurple = item.color === 'purple';
  const isPeach = item.color === 'peach';

  const solidColorClass = isPink
    ? 'bg-[#fbcfe8] border-[#f472b6]'
    : isBlue
    ? 'bg-[#bae6fd] border-[#38bdf8]'
    : isYellow
    ? 'bg-[#fef08a] border-[#facc15]'
    : isGreen
    ? 'bg-[#bbf7d0] border-[#4ade80]'
    : isPurple
    ? 'bg-[#e9d5ff] border-[#c084fc]'
    : isPeach
    ? 'bg-[#fed7aa] border-[#fb923c]'
    : `${colors.bg} ${colors.border}`;

  // 10 Note Shape Presets
  const shapeDef = NOTE_SHAPES.find((s) => s.id === (item.shape || 'square')) || NOTE_SHAPES[0];
  const rotation = item.rotation || 0;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('button, input, textarea')) return;
        onDragStart(e, item);
      }}
      style={{
        transform: `translate3d(${item.x}px, ${item.y}px, 0) rotate(${rotation}deg)`,
        width: `${item.width}px`,
        minHeight: `${item.height}px`,
      }}
      className={`absolute top-0 left-0 p-4 shadow-md hover:shadow-xl transition-all cursor-grab active:cursor-grabbing border ${solidColorClass} ${shapeDef.containerClass} text-slate-900 ${
        isSelected ? 'ring-3 ring-purple-600 shadow-2xl scale-[1.01]' : ''
      } flex flex-col justify-between group select-none touch-none relative`}
    >
      {/* Green circular vote badge on top-right corner */}
      {voteCount > 0 && (
        <div
          title={`${voteCount} team vote${voteCount > 1 ? 's' : ''}`}
          className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center shadow-md border-2 border-white z-20 animate-pop-in pointer-events-none"
        >
          {voteCount}
        </div>
      )}

      {/* Top Bar: Author Badge, Shortlist/Decision status, and Actions */}
      <div>
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-black/10">
          <div className="flex items-center gap-1.5">
            <span className="text-sm select-none" title={item.authorName}>
              {item.authorAvatar}
            </span>
            <span className="text-xs font-bold text-slate-900 truncate max-w-[90px]">
              {item.authorName.split(' ')[0]}
            </span>
            {item.isDecision && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-extrabold rounded-md bg-emerald-700 text-white shadow-xs">
                <CheckCircle2 className="w-2.5 h-2.5" /> Core
              </span>
            )}
          </div>

          <div className={`flex items-center gap-0.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70 md:opacity-60 md:group-hover:opacity-100'}`}>
            {/* 10 Shape Picker Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowShapePicker(!showShapePicker);
                  setShowColorPicker(false);
                }}
                title="Change Note Shape (10 Shapes)"
                className="p-1 rounded-lg text-slate-700 hover:text-slate-900 transition-colors"
              >
                <Shapes className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>

              {showShapePicker && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1.5 p-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 animate-pop-in w-44 grid grid-cols-2 gap-1 text-left"
                >
                  <div className="col-span-2 px-1 pb-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    10 Note Shapes
                  </div>
                  {NOTE_SHAPES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        updateItem(item.id, { shape: s.id });
                        setShowShapePicker(false);
                      }}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                        (item.shape || 'square') === s.id
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{s.emoji}</span>
                      <span className="truncate">{s.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Shortlist Star */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleShortlist(item.id);
              }}
              title={item.isShortlisted ? 'Remove from shortlist' : 'Star idea'}
              className={`p-1 rounded-lg transition-colors ${
                item.isShortlisted
                  ? 'text-amber-600 fill-amber-500'
                  : 'text-slate-700 hover:text-amber-600'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" strokeWidth={1.75} />
            </button>

            {/* Color Palette Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorPicker(!showColorPicker);
                  setShowShapePicker(false);
                }}
                title="Change color"
                className="p-1 rounded-lg text-slate-700 hover:text-slate-900 transition-colors"
              >
                <Palette className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>

              {showColorPicker && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1.5 p-1.5 bg-white rounded-xl shadow-xl border border-slate-200 flex gap-1 z-50 animate-pop-in"
                >
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        updateItem(item.id, { color: c.id });
                        setShowColorPicker(false);
                      }}
                      title={c.label}
                      style={{ backgroundColor: c.hex }}
                      className={`w-5 h-5 rounded-full border border-black/20 transition-transform hover:scale-125 ${
                        item.color === c.id ? 'ring-2 ring-purple-600 ring-offset-1' : ''
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeItem(item.id);
              }}
              title="Delete sticky note (Backspace / Del)"
              className="p-1 rounded-lg text-slate-700 hover:text-red-600 hover:bg-red-500/15 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Title */}
        {isEditingTitle ? (
          <input
            type="text"
            value={item.title}
            autoFocus
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
            onChange={(e) => updateItem(item.id, { title: e.target.value })}
            className="w-full text-xs font-bold bg-white/80 text-slate-900 rounded px-1.5 py-0.5 border border-black/20 outline-none mb-1 shadow-xs"
          />
        ) : (
          <h3
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingTitle(true);
            }}
            title="Double-click to edit title"
            className="text-xs font-extrabold text-slate-950 leading-snug mb-1 cursor-text hover:text-purple-900 transition-colors"
          >
            {item.title}
          </h3>
        )}

        {/* Content Body */}
        {isEditingContent ? (
          <textarea
            value={item.content || ''}
            autoFocus
            rows={2}
            onBlur={() => setIsEditingContent(false)}
            onChange={(e) => updateItem(item.id, { content: e.target.value })}
            className="w-full text-xs font-medium bg-white/80 text-slate-900 rounded p-1.5 border border-black/20 outline-none resize-none leading-relaxed shadow-xs"
          />
        ) : (
          <p
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingContent(true);
            }}
            title="Double-click to edit description"
            className="text-xs font-medium text-slate-800 leading-relaxed cursor-text whitespace-pre-wrap hover:opacity-90 transition-opacity line-clamp-3"
          >
            {item.content || 'Click to write details...'}
          </p>
        )}
      </div>

      {/* Bottom Area: Branching Button & Dot Voting */}
      <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center justify-between">
        {/* Branch Button */}
        <button
          onClick={handleBranch}
          title="Branch a new linked idea from this note"
          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-slate-900 hover:text-purple-950 bg-black/5 hover:bg-black/10 rounded-lg transition-all border border-black/10"
        >
          <GitBranch className="w-3 h-3 text-purple-700" strokeWidth={1.75} />
          <span>Branch</span>
        </button>

        {/* Dot Vote Button */}
        <button
          ref={voteButtonRef}
          onClick={handleVote}
          title={hasVoted ? 'Remove your vote' : 'Vote for this idea'}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all hover:scale-105 active:scale-95 border ${
            hasVoted
              ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
              : 'bg-white text-slate-900 border-black/15 hover:border-purple-500 shadow-xs'
          }`}
        >
          <span>{hasVoted ? '💜' : '🤍'}</span>
          <span>Vote</span>
        </button>
      </div>
    </div>
  );
};
