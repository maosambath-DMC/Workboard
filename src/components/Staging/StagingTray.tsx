import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CardColor } from '../../types';
import { COLOR_OPTIONS } from '../../constants/colors';
import { fireBigCelebration } from '../../utils/confetti';
import { 
  Sparkles, 
  X, 
  Plus, 
  Trash2, 
  Eye, 
  Lock, 
  Image as ImageIcon, 
  StickyNote, 
  ArrowUpRight 
} from 'lucide-react';

export const StagingTray: React.FC = () => {
  const {
    isStagingOpen,
    setIsStagingOpen,
    stagedItems,
    addStagedItem,
    removeStagedItem,
    revealStagedItems,
    activePersona,
  } = useWorkspace();

  const [itemType, setItemType] = useState<'sticky' | 'reference'>('sticky');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<CardColor>('yellow');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  if (!isStagingOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addStagedItem({
      type: itemType,
      title: title.trim(),
      content: content.trim(),
      color,
      imageUrl: itemType === 'reference' ? imageUrl.trim() : undefined,
      tags: tags.length ? tags : ['Staged'],
    });

    setTitle('');
    setContent('');
    setImageUrl('');
    setTagsInput('');
  };

  const handleRevealAll = () => {
    fireBigCelebration();
    revealStagedItems();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl transition-all duration-300 max-h-[85vh] flex flex-col animate-pop-in">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-md">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Independent Staging Tray (Silent Ideation)
              </h3>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {activePersona.avatar} {activePersona.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Draft references and thoughts privately without peer influence. When the team is ready, reveal together!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stagedItems.length > 0 && (
            <button
              onClick={handleRevealAll}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Reveal All to Canvas ({stagedItems.length}) 🚀</span>
            </button>
          )}

          <button
            onClick={() => setIsStagingOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area: Form on Left, Staged Cards Grid on Right */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto max-h-[calc(85vh-70px)]">
        {/* Creation Form */}
        <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setItemType('sticky')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                itemType === 'sticky'
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span>Sticky Note</span>
            </button>
            <button
              type="button"
              onClick={() => setItemType('reference')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                itemType === 'reference'
                  ? 'bg-sky-400 text-sky-950 shadow-sm'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Reference</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Idea Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tactile Menu Design..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {itemType === 'reference' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Notes & Rationale
              </label>
              <textarea
                rows={3}
                placeholder="Why is this a great fit for our direction?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Color Tag
              </label>
              <div className="flex gap-1.5">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                    className={`w-6 h-6 rounded-full border border-black/10 transition-transform ${
                      color === c.id ? 'ring-2 ring-purple-600 ring-offset-2 scale-110' : 'hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="Inspiration, Vibe, Concept..."
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Save to Private Stash</span>
            </button>
          </form>
        </div>

        {/* Staged Cards List */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Private Items Ready to Reveal ({stagedItems.length})
            </h4>
            <span className="text-xs text-slate-400">
              Hidden from team whiteboard
            </span>
          </div>

          {stagedItems.length === 0 ? (
            <div className="h-64 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Sparkles className="w-8 h-8 text-pink-400 mb-2 opacity-60" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Your private stash is empty
              </p>
              <p className="text-xs max-w-sm mt-1 text-slate-400">
                Add references and ideas above. They will stay secret until you hit "Reveal All to Canvas".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stagedItems.map((staged) => (
                <div
                  key={staged.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/kitsune-staged-id', staged.id);
                    e.dataTransfer.setData('text/plain', `staged:${staged.id}`);
                    e.dataTransfer.effectAllowed = 'move';
                    if (typeof window !== 'undefined') {
                      (window as any).__kitsune_active_drag_tool = staged.type;
                    }
                  }}
                  onDragEnd={() => {
                    if (typeof window !== 'undefined') {
                      (window as any).__kitsune_active_drag_tool = null;
                    }
                  }}
                  className="rounded-2xl p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing hover:border-purple-400 transition-colors group select-none"
                  title="Drag card directly onto the whiteboard"
                >
                  <div>
                    {staged.imageUrl && (
                      <div className="w-full h-28 rounded-xl overflow-hidden mb-2.5 bg-slate-100 dark:bg-slate-900">
                        <img
                          src={staged.imageUrl}
                          alt={staged.title}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          {staged.type === 'reference' ? 'Picture' : 'Note'}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {staged.title}
                        </h5>
                      </div>
                      <span className="text-xs">{staged.authorAvatar}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-3">
                      {staged.content || 'Drag onto whiteboard to place...'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <div className="flex flex-wrap gap-1">
                      {staged.tags.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 text-[9px] rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => removeStagedItem(staged.id)}
                      className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Discard item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
