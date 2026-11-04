import React, { useState, useRef } from 'react';
import { CanvasItem, CardColor } from '../../types';
import { CARD_COLORS, COLOR_OPTIONS } from '../../constants/colors';
import { PERSONAS } from '../../constants/personas';
import { useWorkspace } from '../../context/WorkspaceContext';
import { fireCuteConfetti } from '../../utils/confetti';
import { 
  GitBranch, 
  Star, 
  Trash2, 
  ExternalLink, 
  Palette, 
  CheckCircle2, 
  Image as ImageIcon,
  Copy,
  Check
} from 'lucide-react';

interface ReferenceCardProps {
  item: CanvasItem;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent | React.PointerEvent, item: CanvasItem) => void;
}

export const ReferenceCard: React.FC<ReferenceCardProps> = ({
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
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState(item.imageUrl || '');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const voteButtonRef = useRef<HTMLButtonElement>(null);

  const colors = CARD_COLORS[item.color] || CARD_COLORS.peach;
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

  const handleCopyColor = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const handleSaveImage = (e: React.FormEvent) => {
    e.preventDefault();
    updateItem(item.id, { imageUrl: imageUrlInput.trim() });
    setIsEditingImage(false);
  };

  const handleBranch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const branchLabel = window.prompt('Enter branch theme or label (e.g. Color Mood, Architectural Motif, Lighting):', 'Visual Inspiration');
    if (branchLabel !== null) {
      branchItem(item.id, branchLabel.trim() || 'Inspiration');
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('button, input, textarea, a')) return;
        onDragStart(e, item);
      }}
      style={{
        transform: `translate3d(${item.x}px, ${item.y}px, 0)`,
        width: `${item.width}px`,
        minHeight: `${item.height}px`,
      }}
      className={`absolute top-0 left-0 rounded-2xl overflow-hidden shadow-md transition-shadow cursor-grab active:cursor-grabbing border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ${
        isSelected ? 'ring-3 ring-purple-500 shadow-xl scale-[1.01]' : 'hover:shadow-lg'
      } flex flex-col justify-between group select-none touch-none`}
    >
      <div>
        {/* Image Preview / Banner */}
        <div className="relative w-full h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden group/img">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105 pointer-events-none"
              onError={(e) => {
                // fallback placeholder
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80';
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <ImageIcon className="w-8 h-8 opacity-60" />
              <span className="text-xs font-medium">Add Image URL</span>
            </div>
          )}

          {/* Quick Edit Image Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingImage(!isEditingImage);
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-md opacity-0 group-hover/img:opacity-100 transition-opacity"
            title="Edit image URL"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>

          {/* Reference pill tag */}
          <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1">
            <span>📷 Reference</span>
            {item.linkUrl && (
              <a
                href={item.linkUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="hover:text-purple-300 ml-0.5"
                title="Open source link"
              >
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>

        {/* Image URL Form Popup */}
        {isEditingImage && (
          <form
            onSubmit={handleSaveImage}
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex gap-1"
          >
            <input
              type="url"
              placeholder="Paste Image URL..."
              value={imageUrlInput}
              autoFocus
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="flex-1 text-xs px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 outline-none"
            />
            <button
              type="submit"
              className="px-2.5 py-1 text-xs font-semibold rounded bg-purple-600 text-white hover:bg-purple-700"
            >
              Save
            </button>
          </form>
        )}

        {/* Card Body */}
        <div className="p-3.5">
          {/* Top Bar: Author Badge, Shortlist, and Actions */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="text-base select-none">{item.authorAvatar}</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                {item.authorName.split(' ')[0]}
              </span>
              {item.isDecision && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  <CheckCircle2 className="w-3 h-3" /> Core
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Shortlist Star */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleShortlist(item.id);
                }}
                title={item.isShortlisted ? 'Remove from shortlist' : 'Star / Shortlist idea'}
                className={`p-1 rounded-full transition-colors ${
                  item.isShortlisted
                    ? 'text-amber-500 hover:text-amber-600 bg-amber-100 dark:bg-amber-950/60'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </button>

              {/* Color Palette Menu */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPicker(!showColorPicker);
                  }}
                  title="Change theme color"
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Palette className="w-3.5 h-3.5" />
                </button>

                {showColorPicker && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 flex gap-1 z-50 animate-pop-in"
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
                        className={`w-5 h-5 rounded-full border border-black/10 transition-transform hover:scale-125 ${
                          item.color === c.id ? 'ring-2 ring-purple-500 ring-offset-1' : ''
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
                title="Delete reference (Backspace / Del)"
                className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
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
              className="w-full text-sm font-bold bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 rounded px-1.5 py-0.5 border border-purple-400 outline-none mb-1.5"
            />
          ) : (
            <h3
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              title="Double-click to edit title"
              className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug mb-1 cursor-text hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {item.title}
            </h3>
          )}

          {/* Description */}
          {isEditingContent ? (
            <textarea
              value={item.content || ''}
              autoFocus
              rows={2}
              onBlur={() => setIsEditingContent(false)}
              onChange={(e) => updateItem(item.id, { content: e.target.value })}
              className="w-full text-xs bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-200 rounded p-1.5 border border-purple-400 outline-none resize-none leading-relaxed"
            />
          ) : (
            <p
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditingContent(true);
              }}
              title="Double-click to edit description"
              className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed cursor-text line-clamp-3 hover:opacity-90"
            >
              {item.content || 'Click to add notes...'}
            </p>
          )}

          {/* Color Palette Swatches */}
          {item.palette && item.palette.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5">
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
                <span>Color Palette</span>
                {copiedHex && (
                  <span className="text-purple-600 dark:text-purple-400 flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5" /> Copied {copiedHex}
                  </span>
                )}
              </div>
              <div className="flex gap-1.5">
                {item.palette.map((hex) => (
                  <button
                    key={hex}
                    onClick={(e) => handleCopyColor(hex, e)}
                    title={`Click to copy ${hex}`}
                    style={{ backgroundColor: hex }}
                    className="flex-1 h-5 rounded-md border border-black/10 dark:border-white/10 shadow-xs hover:scale-110 active:scale-95 transition-transform flex items-center justify-center group/swatch"
                  >
                    <Copy className="w-2.5 h-2.5 text-white opacity-0 group-hover/swatch:opacity-80 drop-shadow" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer: Branching and Voting */}
      <div className="p-3.5 pt-0">
        <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
          {/* Branch Button */}
          <button
            onClick={handleBranch}
            title="Branch idea from this reference"
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-950/70 hover:bg-purple-200/80 dark:hover:bg-purple-900/80 rounded-xl transition-all hover:scale-105 active:scale-95 border border-purple-200 dark:border-purple-800"
          >
            <GitBranch className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>Branch</span>
          </button>

          {/* Voting Dots & Action */}
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5 overflow-hidden">
              {item.votes?.map((voterId, idx) => {
                const persona = PERSONAS[voterId];
                if (!persona) return null;
                return (
                  <span
                    key={`${voterId}-${idx}`}
                    title={`Voted by ${persona.name}`}
                    className="inline-block w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 text-[10px] leading-4 text-center bg-white dark:bg-slate-800 shadow-sm"
                  >
                    {persona.avatar}
                  </span>
                );
              })}
            </div>

            <button
              ref={voteButtonRef}
              onClick={handleVote}
              title={hasVoted ? 'Remove your vote dot' : 'Add your vote dot'}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 border ${
                hasVoted
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-300 dark:ring-purple-900'
                  : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-300/80 dark:border-slate-700 hover:border-purple-400'
              }`}
            >
              <span>{hasVoted ? '💜' : '🤍'}</span>
              <span>{voteCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
