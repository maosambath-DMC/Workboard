import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CardColor } from '../../types';
import { COLOR_OPTIONS } from '../../constants/colors';
import { X, StickyNote, Image as ImageIcon, Sparkles } from 'lucide-react';

export const NewItemModal: React.FC = () => {
  const {
    isNewItemModalOpen,
    setIsNewItemModalOpen,
    newItemParentId,
    setNewItemParentId,
    addItem,
    items,
    activePersonaId,
    activePersona,
    panOffset,
    zoom,
  } = useWorkspace();

  const [type, setType] = useState<'sticky' | 'reference'>('reference');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<CardColor>('peach');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80'
  );
  const [linkUrl, setLinkUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('Reference, Mood');

  if (!isNewItemModalOpen) return null;

  const parentItem = newItemParentId ? items.find((i) => i.id === newItemParentId) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Center spawn point
    const centerX = (-panOffset.x + window.innerWidth / 2) / zoom - 150;
    const centerY = (-panOffset.y + window.innerHeight / 2) / zoom - 150;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addItem({
      id: `${type}-${Date.now()}`,
      type,
      x: parentItem ? parentItem.x + parentItem.width + 50 : Math.round(centerX),
      y: parentItem ? parentItem.y + 20 : Math.round(centerY),
      width: type === 'reference' ? 310 : 280,
      height: type === 'reference' ? 380 : 180,
      title: title.trim(),
      content: content.trim(),
      color,
      authorId: activePersonaId,
      authorName: activePersona.name,
      authorAvatar: activePersona.avatar,
      createdAt: Date.now(),
      tags: tags.length ? tags : ['Reference'],
      votes: [],
      parentId: parentItem?.id,
      branchLabel: parentItem ? 'Visual Reference' : undefined,
      imageUrl: type === 'reference' ? imageUrl.trim() : undefined,
      linkUrl: type === 'reference' && linkUrl.trim() ? linkUrl.trim() : undefined,
      palette: type === 'reference' ? ['#2D3748', '#CBD5E0', '#ED8936', '#FAF089'] : undefined,
    });

    setIsNewItemModalOpen(false);
    setNewItemParentId(null);
    setTitle('');
    setContent('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-pop-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {parentItem ? `Add Branch from "${parentItem.title.slice(0, 15)}..."` : 'Add New Canvas Item'}
            </h3>
          </div>
          <button
            onClick={() => {
              setIsNewItemModalOpen(false);
              setNewItemParentId(null);
            }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('sticky')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                type === 'sticky'
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <StickyNote className="w-4 h-4" />
              <span>Sticky Note</span>
            </button>
            <button
              type="button"
              onClick={() => setType('reference')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                type === 'reference'
                  ? 'bg-sky-400 text-sky-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Reference Card</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Japanese Packaging Mockup..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {type === 'reference' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Image URL
              </label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Creative Rationale
            </label>
            <textarea
              rows={3}
              placeholder="What makes this idea compelling?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Color Accent
            </label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                  className={`w-7 h-7 rounded-full border border-black/10 transition-transform ${
                    color === c.id ? 'ring-2 ring-purple-600 ring-offset-2 scale-110' : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="Design, Branding, Identity..."
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsNewItemModalOpen(false);
                setNewItemParentId(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-colors"
            >
              Add to Board
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
