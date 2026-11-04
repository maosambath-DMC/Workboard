import React, { useState, useRef } from 'react';
import type { CanvasItem } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { fireCuteConfetti } from '../../utils/confetti';
import { Trash2, GitBranch, Star, Maximize2, ImagePlus } from 'lucide-react';

interface CanvasImageProps {
  item: CanvasItem;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent | React.PointerEvent, item: CanvasItem) => void;
}

export const CanvasImage: React.FC<CanvasImageProps> = ({
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

  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{ startX: number; startW: number }>({ startX: 0, startW: 0 });
  const [showFullModal, setShowFullModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        updateItem(item.id, { 
          imageUrl: dataUrl,
          title: file.name.replace(/\.[^/.]+$/, '') 
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const hasVoted = item.votes?.includes(activePersonaId);
  const voteCount = item.votes?.length || 0;

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasVoted) {
      fireCuteConfetti(e.clientX, e.clientY);
    }
    toggleVote(item.id);
  };

  const handleBranch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const branchLabel = window.prompt('Enter branch theme or label:', 'Visual Reference');
    if (branchLabel !== null) {
      branchItem(item.id, branchLabel.trim() || 'Visual Reference');
    }
  };

  // Resize handler
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = { startX: e.clientX, startW: item.width || 300 };

    const handleMouseMove = (moveEv: MouseEvent) => {
      const delta = moveEv.clientX - resizeStartRef.current.startX;
      const newWidth = Math.max(160, Math.min(800, resizeStartRef.current.startW + delta));
      updateItem(item.id, { width: Math.round(newWidth) });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button, .resize-handle')) return;
          onDragStart(e, item);
        }}
        style={{
          transform: `translate3d(${item.x}px, ${item.y}px, 0)`,
          width: `${item.width || 300}px`,
        }}
        className={`absolute top-0 left-0 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-xl transition-shadow cursor-grab active:cursor-grabbing select-none touch-none group ${
          isSelected ? 'ring-3 ring-purple-500 shadow-2xl' : ''
        }`}
      >
        {/* Hidden File Picker to Replace Image */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Floating Top Minimalist Action Bar */}
        <div className={`absolute top-2.5 right-2.5 z-20 flex items-center gap-1 transition-opacity bg-black/60 backdrop-blur-md p-1 rounded-xl text-white ${
          isSelected ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            title="Upload or change image"
            className="p-1 rounded-lg hover:text-amber-300 transition-colors"
          >
            <ImagePlus className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>

          <button
            onClick={handleVote}
            title={hasVoted ? 'Remove vote' : 'Vote for image'}
            className={`p-1 rounded-lg transition-colors ${hasVoted ? 'text-pink-400' : 'hover:text-pink-300'}`}
          >
            <Star className={`w-3.5 h-3.5 ${hasVoted ? 'fill-current' : ''}`} strokeWidth={1.75} />
          </button>

          <button
            onClick={handleBranch}
            title="Branch idea from this picture"
            className="p-1 rounded-lg hover:text-purple-300 transition-colors"
          >
            <GitBranch className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>

          <button
            onClick={() => setShowFullModal(true)}
            title="View full image"
            className="p-1 rounded-lg hover:text-sky-300 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>

          <button
            onClick={() => removeItem(item.id)}
            title="Delete picture"
            className="p-1 rounded-lg hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Little Vote Count Badge if voted */}
        {voteCount > 0 && (
          <div className="absolute -top-2 -right-2 z-20 w-5 h-5 rounded-full bg-emerald-500 text-white text-[11px] font-black flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 pointer-events-none">
            {voteCount}
          </div>
        )}

        {/* The Picture Itself */}
        <div className="w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950">
          <img
            src={item.imageUrl}
            alt={item.title || 'Canvas picture'}
            className="w-full h-auto object-cover pointer-events-none block"
            loading="lazy"
          />
        </div>

        {/* Optional Title Caption underneath if provided */}
        {item.title && item.title !== 'Image' && (
          <div className="px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
            {item.title}
          </div>
        )}

        {/* Resize Handle in Bottom Right */}
        <div
          onMouseDown={handleResizeStart}
          className="resize-handle absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white dark:bg-slate-800 border-2 border-purple-500 rounded-full cursor-nwse-resize z-20 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          title="Drag to resize picture"
        />
      </div>

      {/* Full Resolution Modal on double-click or expand */}
      {showFullModal && (
        <div
          onClick={() => setShowFullModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 cursor-zoom-out animate-pop-in"
        >
          <img
            src={item.imageUrl}
            alt={item.title}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
};
