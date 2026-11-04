import React, { useState, useRef } from 'react';
import type { CanvasItem, NoteShape, CardColor } from '../../types';
import { NOTE_SHAPES } from '../../constants/shapes';
import { CARD_COLORS, COLOR_OPTIONS } from '../../constants/colors';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Trash2, GitBranch, Bold, Shapes, Palette } from 'lucide-react';

interface CanvasTextProps {
  item: CanvasItem;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent, item: CanvasItem) => void;
}

export const CanvasText: React.FC<CanvasTextProps> = ({
  item,
  isSelected,
  onSelect,
  onDragStart,
}) => {
  const { updateItem, removeItem, branchItem } = useWorkspace();
  const [isEditing, setIsEditing] = useState(false);
  const [showShapePicker, setShowShapePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const fontSizeClass =
    item.fontSize === 'sm'
      ? 'text-xs'
      : item.fontSize === 'base'
      ? 'text-sm'
      : item.fontSize === 'lg'
      ? 'text-lg'
      : item.fontSize === 'xl'
      ? 'text-2xl'
      : item.fontSize === '3xl'
      ? 'text-4xl'
      : 'text-xl';

  const shapeDef = item.shape ? NOTE_SHAPES.find((s) => s.id === item.shape) : null;
  const rotation = item.rotation || 0;

  // Solid sticky note style if shape is enabled
  const isPink = item.color === 'pink';
  const isBlue = item.color === 'blue';
  const isYellow = item.color === 'yellow';
  const isGreen = item.color === 'green';
  const isPurple = item.color === 'purple';
  const isPeach = item.color === 'peach';

  const solidColorClass = item.shape
    ? isPink
      ? 'bg-[#fbcfe8] border border-[#f472b6] text-slate-900 shadow-md'
      : isBlue
      ? 'bg-[#bae6fd] border border-[#38bdf8] text-slate-900 shadow-md'
      : isYellow
      ? 'bg-[#fef08a] border border-[#facc15] text-slate-900 shadow-md'
      : isGreen
      ? 'bg-[#bbf7d0] border border-[#4ade80] text-slate-900 shadow-md'
      : isPurple
      ? 'bg-[#e9d5ff] border border-[#c084fc] text-slate-900 shadow-md'
      : 'bg-[#fed7aa] border border-[#fb923c] text-slate-900 shadow-md'
    : '';

  const handleBranch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const branchLabel = window.prompt('Enter branch theme or label:', 'Thought');
    if (branchLabel !== null) {
      branchItem(item.id, branchLabel.trim() || 'Thought');
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={(e) => {
        if (isEditing) return;
        onDragStart(e, item);
      }}
      style={{
        transform: `translate3d(${item.x}px, ${item.y}px, 0) rotate(${rotation}deg)`,
        width: item.width ? `${item.width}px` : 'auto',
        minWidth: '140px',
      }}
      className={`absolute top-0 left-0 p-3 transition-all cursor-grab active:cursor-grabbing select-none group ${
        shapeDef ? `${shapeDef.containerClass} ${solidColorClass}` : 'rounded-xl'
      } ${
        isSelected
          ? 'ring-2 ring-purple-500 shadow-lg'
          : shapeDef
          ? 'hover:shadow-xl'
          : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
      }`}
    >
      {/* Floating Mini Toolbar when Selected */}
      {isSelected && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute -top-11 left-0 flex items-center gap-1 p-1 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-30 animate-pop-in"
        >
          {/* Font Sizes */}
          {(['sm', 'base', 'lg', 'xl', '2xl'] as const).map((sz) => (
            <button
              key={sz}
              onClick={() => updateItem(item.id, { fontSize: sz })}
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded-lg transition-colors ${
                (item.fontSize || 'xl') === sz
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {sz.toUpperCase()}
            </button>
          ))}

          {/* Bold Toggle */}
          <button
            onClick={() => updateItem(item.id, { isBold: !item.isBold })}
            className={`p-1 rounded-lg transition-colors ${
              item.isBold
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Toggle bold"
          >
            <Bold className="w-3.5 h-3.5" strokeWidth={2} />
          </button>

          {/* 10 Shape Preset Picker */}
          <div className="relative">
            <button
              onClick={() => {
                setShowShapePicker(!showShapePicker);
                setShowColorPicker(false);
              }}
              className={`p-1 rounded-lg transition-colors ${
                item.shape ? 'bg-purple-100 text-purple-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Transform into Sticky Note Shape (10 Shapes)"
            >
              <Shapes className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>

            {showShapePicker && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full mt-1.5 p-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 animate-pop-in w-48 grid grid-cols-2 gap-1 text-left"
              >
                <div className="col-span-2 px-1 pb-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                  10 Note Shapes
                </div>
                <button
                  onClick={() => {
                    updateItem(item.id, { shape: undefined });
                    setShowShapePicker(false);
                  }}
                  className="col-span-2 px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg text-left"
                >
                  Clear Shape (Plain Text)
                </button>
                {NOTE_SHAPES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      updateItem(item.id, { 
                        shape: s.id, 
                        color: item.color || 'yellow',
                        rotation: Math.round((Math.random() * 3 - 1.5) * 10) / 10 
                      });
                      setShowShapePicker(false);
                    }}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                      item.shape === s.id
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

          {/* Color Picker (for sticky text) */}
          {item.shape && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowColorPicker(!showColorPicker);
                  setShowShapePicker(false);
                }}
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                title="Change note color"
              >
                <Palette className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>

              {showColorPicker && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 top-full mt-1.5 p-1.5 bg-white rounded-xl shadow-xl border border-slate-200 flex gap-1 z-50 animate-pop-in"
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
                      className={`w-4 h-4 rounded-full border border-black/20 ${
                        item.color === c.id ? 'ring-2 ring-purple-600 scale-110' : ''
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Branch Handle */}
          <button
            onClick={handleBranch}
            className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Branch from text"
          >
            <GitBranch className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>

          {/* Delete */}
          <button
            onClick={() => removeItem(item.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Delete text"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>
      )}

      {/* Text Content */}
      {isEditing ? (
        <textarea
          ref={textRef}
          value={item.content ?? item.title}
          autoFocus
          rows={2}
          onBlur={() => setIsEditing(false)}
          onChange={(e) => {
            updateItem(item.id, {
              title: e.target.value.slice(0, 30),
              content: e.target.value,
            });
          }}
          className={`w-full bg-transparent outline-none resize-none leading-snug ${fontSizeClass} ${
            item.isBold ? 'font-bold' : 'font-medium'
          } ${item.shape ? 'text-slate-900' : 'text-slate-900 dark:text-slate-100'}`}
        />
      ) : (
        <div
          onDoubleClick={() => setIsEditing(true)}
          className={`whitespace-pre-wrap leading-snug cursor-text ${fontSizeClass} ${
            item.isBold ? 'font-bold' : 'font-medium'
          } ${item.shape ? 'text-slate-900' : 'text-slate-900 dark:text-slate-100'}`}
        >
          {item.content || item.title || 'Type something here...'}
        </div>
      )}
    </div>
  );
};
