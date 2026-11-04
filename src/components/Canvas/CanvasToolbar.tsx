import React, { useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  StickyNote, 
  Type, 
  Image as ImageIcon, 
  Vote, 
  Layers, 
  Square, 
  EyeOff, 
  Grid3X3, 
  ZoomIn, 
  ZoomOut,
  GripVertical
} from 'lucide-react';

export const CanvasToolbar: React.FC = () => {
  const {
    zoom,
    setZoom,
    setPanOffset,
    canvasBackground,
    setCanvasBackground,
    isStagingOpen,
    setIsStagingOpen,
    stagedItems,
    addItem,
    activePersonaId,
    activePersona,
    panOffset,
  } = useWorkspace();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick Add Sticky Note
  const handleQuickAddSticky = () => {
    const centerX = (-panOffset.x + window.innerWidth / 2) / zoom - 110;
    const centerY = (-panOffset.y + window.innerHeight / 2) / zoom - 70;

    addItem({
      id: `sticky-${Date.now()}`,
      type: 'sticky',
      x: Math.round(centerX + (Math.random() * 30 - 15)),
      y: Math.round(centerY + (Math.random() * 30 - 15)),
      width: 220,
      height: 140,
      title: 'New Idea',
      content: 'Add your quick thought here...',
      color: 'yellow',
      authorId: activePersonaId,
      authorName: activePersona.name,
      authorAvatar: activePersona.avatar,
      createdAt: Date.now(),
      tags: ['Idea'],
      votes: [],
    });
  };

  // Quick Add Text Alone
  const handleQuickAddText = () => {
    const centerX = (-panOffset.x + window.innerWidth / 2) / zoom - 80;
    const centerY = (-panOffset.y + window.innerHeight / 2) / zoom - 30;

    addItem({
      id: `text-${Date.now()}`,
      type: 'text',
      x: Math.round(centerX),
      y: Math.round(centerY),
      width: 260,
      height: 60,
      title: 'Text Label',
      content: 'Double click to edit text',
      color: 'yellow',
      authorId: activePersonaId,
      authorName: activePersona.name,
      authorAvatar: activePersona.avatar,
      createdAt: Date.now(),
      tags: [],
      votes: [],
      fontSize: 'xl',
      isBold: true,
    });
  };

  // Quick Add Image via OS File Picker
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl) return;

      const centerX = (-panOffset.x + window.innerWidth / 2) / zoom - 150;
      const centerY = (-panOffset.y + window.innerHeight / 2) / zoom - 150;

      addItem({
        id: `img-${Date.now()}`,
        type: 'image',
        x: Math.round(centerX),
        y: Math.round(centerY),
        width: 300,
        height: 220,
        title: file.name.replace(/\.[^/.]+$/, ''),
        color: 'yellow',
        authorId: activePersonaId,
        authorName: activePersona.name,
        authorAvatar: activePersona.avatar,
        createdAt: Date.now(),
        tags: ['Picture'],
        votes: [],
        imageUrl: dataUrl,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Quick Add Poll Element
  const handleQuickAddPoll = () => {
    const centerX = (-panOffset.x + window.innerWidth / 2) / zoom - 160;
    const centerY = (-panOffset.y + window.innerHeight / 2) / zoom - 100;

    addItem({
      id: `poll-${Date.now()}`,
      type: 'poll',
      x: Math.round(centerX),
      y: Math.round(centerY),
      width: 320,
      height: 250,
      title: 'Which direction should we prioritize?',
      color: 'purple',
      authorId: activePersonaId,
      authorName: activePersona.name,
      authorAvatar: activePersona.avatar,
      createdAt: Date.now(),
      tags: ['Poll', 'Voting'],
      votes: [],
      pollOptions: [
        { id: 'opt-1', text: 'Option A: Biophilic Atmosphere', votes: ['simon'] },
        { id: 'opt-2', text: 'Option B: Minimalist Concrete Architecture', votes: ['david', 'andrea'] },
        { id: 'opt-3', text: 'Option C: Retro Espresso Bar', votes: [] },
      ],
    });
  };

  // Quick Add Miniboard Element (Teleporting sub-whiteboard)
  const handleQuickAddMiniboard = () => {
    const centerX = (-panOffset.x + window.innerWidth / 2) / zoom - 140;
    const centerY = (-panOffset.y + window.innerHeight / 2) / zoom - 100;

    addItem({
      id: `miniboard-${Date.now()}`,
      type: 'miniboard',
      x: Math.round(centerX),
      y: Math.round(centerY),
      width: 280,
      height: 210,
      title: 'Sub-board: Packaging & Identity',
      color: 'purple',
      authorId: activePersonaId,
      authorName: activePersona.name,
      authorAvatar: activePersona.avatar,
      createdAt: Date.now(),
      tags: ['Miniboard'],
      votes: [],
      targetProjectId: 'project-bloom',
      targetBoardTitle: 'Project Bloom: Botanical Cafe',
      subBoardItemsCount: 6,
    });
  };

  // Quick Add Frame
  const handleAddFrame = () => {
    const centerX = (-panOffset.x + window.innerWidth / 2) / zoom - 280;
    const centerY = (-panOffset.y + window.innerHeight / 2) / zoom - 180;

    addItem({
      id: `frame-${Date.now()}`,
      type: 'frame',
      x: Math.round(centerX),
      y: Math.round(centerY),
      width: 580,
      height: 380,
      title: 'Group Area',
      color: 'purple',
      authorId: activePersonaId,
      authorName: activePersona.name,
      authorAvatar: activePersona.avatar,
      createdAt: Date.now(),
      tags: ['Group'],
      votes: [],
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 80, y: 80 });
  };

  // Drag & drop element handlers from toolbar to whiteboard
  const handleToolbarDragStart = (
    e: React.DragEvent,
    toolType: 'sticky' | 'text' | 'image' | 'poll' | 'miniboard' | 'frame'
  ) => {
    e.dataTransfer.setData('application/kitsune-toolbar-element', toolType);
    e.dataTransfer.setData('text/plain', `tool:${toolType}`);
    e.dataTransfer.effectAllowed = 'copy';

    if (typeof window !== 'undefined') {
      (window as any).__kitsune_active_drag_tool = toolType;
    }
  };

  const handleToolbarDragEnd = () => {
    if (typeof window !== 'undefined') {
      (window as any).__kitsune_active_drag_tool = null;
    }
  };

  return (
    <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 max-w-[calc(100vw-16px)] overflow-x-auto no-scrollbar flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 shadow-2xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-lg select-none pointer-events-auto pb-[calc(env(safe-area-inset-bottom,0px)+4px)]">
      {/* Hidden File Picker for Instant 1-Click Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileSelect}
        className="hidden"
      />

      {/* Creation Tools with Drag to Canvas capability */}
      <div className="flex items-center gap-0.5 sm:gap-1 pr-1 border-r border-slate-200 dark:border-slate-800">
        <div 
          className="hidden sm:flex items-center pl-1 pr-0.5 text-slate-400 dark:text-slate-500 cursor-help"
          title="Drag any tool onto the canvas or click to add"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* 1. Sticky Note */}
        <button
          draggable
          onDragStart={(e) => handleToolbarDragStart(e, 'sticky')}
          onDragEnd={handleToolbarDragEnd}
          onClick={handleQuickAddSticky}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 cursor-grab active:cursor-grabbing"
          title="Sticky Note • Click or drag onto whiteboard"
        >
          <StickyNote className="w-4 h-4 text-amber-500" strokeWidth={1.75} />
          <span className="hidden sm:inline">Note</span>
        </button>

        {/* 2. Text Alone */}
        <button
          draggable
          onDragStart={(e) => handleToolbarDragStart(e, 'text')}
          onDragEnd={handleToolbarDragEnd}
          onClick={handleQuickAddText}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 cursor-grab active:cursor-grabbing"
          title="Text Label • Click or drag onto whiteboard"
        >
          <Type className="w-4 h-4 text-purple-600 dark:text-purple-400" strokeWidth={1.75} />
          <span className="hidden sm:inline">Text</span>
        </button>

        {/* 3. Image Alone */}
        <button
          draggable
          onDragStart={(e) => handleToolbarDragStart(e, 'image')}
          onDragEnd={handleToolbarDragEnd}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 cursor-grab active:cursor-grabbing"
          title="Picture • Click to upload, or drag onto whiteboard"
        >
          <ImageIcon className="w-4 h-4 text-sky-500" strokeWidth={1.75} />
          <span className="hidden sm:inline">Picture</span>
        </button>

        {/* 4. Poll Element */}
        <button
          draggable
          onDragStart={(e) => handleToolbarDragStart(e, 'poll')}
          onDragEnd={handleToolbarDragEnd}
          onClick={handleQuickAddPoll}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 cursor-grab active:cursor-grabbing"
          title="Voting Poll • Click or drag onto whiteboard"
        >
          <Vote className="w-4 h-4 text-indigo-500" strokeWidth={1.75} />
          <span className="hidden sm:inline">Poll</span>
        </button>

        {/* 5. Miniboard Element */}
        <button
          draggable
          onDragStart={(e) => handleToolbarDragStart(e, 'miniboard')}
          onDragEnd={handleToolbarDragEnd}
          onClick={handleQuickAddMiniboard}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 cursor-grab active:cursor-grabbing"
          title="Miniboard Portal • Click or drag onto whiteboard"
        >
          <Layers className="w-4 h-4 text-pink-500" strokeWidth={1.75} />
          <span className="hidden sm:inline">Miniboard</span>
        </button>

        {/* 6. Frame */}
        <button
          draggable
          onDragStart={(e) => handleToolbarDragStart(e, 'frame')}
          onDragEnd={handleToolbarDragEnd}
          onClick={handleAddFrame}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 cursor-grab active:cursor-grabbing"
          title="Frame / Section • Click or drag onto whiteboard"
        >
          <Square className="w-4 h-4 text-emerald-500" strokeWidth={1.75} />
          <span className="hidden sm:inline">Frame</span>
        </button>
      </div>

      {/* Independent Ideation / Silent Stash */}
      <div className="pr-1 border-r border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setIsStagingOpen(!isStagingOpen)}
          className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
            isStagingOpen
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Silent Brainstorming / Private Stash Tray"
        >
          <EyeOff className="w-4 h-4" strokeWidth={1.75} />
          <span className="hidden sm:inline">Silent Stash</span>
          {stagedItems.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-pink-500 text-white shadow-xs">
              {stagedItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Grid Pattern Toggle */}
      <div className="flex items-center pr-1 border-r border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            const next = canvasBackground === 'dots' ? 'lines' : canvasBackground === 'lines' ? 'clean' : 'dots';
            setCanvasBackground(next);
          }}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Canvas Grid: ${canvasBackground}`}
        >
          <Grid3X3 className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" strokeWidth={1.75} />
        </button>

        <button
          onClick={handleResetZoom}
          className="px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          title="Reset Zoom"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          onClick={() => setZoom(Math.min(2.5, zoom + 0.1))}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
};
