import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import type { CanvasItem } from '../../types';
import { ConnectorsLayer } from './ConnectorsLayer';
import { StickyNote } from './StickyNote';
import { ReferenceCard } from './ReferenceCard';
import { CanvasText } from './CanvasText';
import { CanvasImage } from './CanvasImage';
import { CanvasPoll } from './CanvasPoll';
import { CanvasMiniboard } from './CanvasMiniboard';
import { FrameCard } from './FrameCard';
import { CursorsLayer } from './CursorsLayer';
import { Minimap } from './Minimap';
import { CanvasToolbar } from './CanvasToolbar';
import { WhiteboardHeader } from './WhiteboardHeader';
import { Star, GitBranch, Trash2, X } from 'lucide-react';

export const Canvas: React.FC = () => {
  const {
    activeProject,
    items,
    addItem,
    moveItem,
    removeItem,
    branchItem,
    toggleVote,
    zoom,
    setZoom,
    panOffset,
    setPanOffset,
    canvasBackground,
    theme,
    viewFilter,
    searchQuery,
    selectedItemId,
    setSelectedItemId,
    activePersonaId,
    activePersona,
    peerCursors,
    broadcastCursor,
    revealSingleStagedItem,
  } = useWorkspace();

  const containerRef = useRef<HTMLDivElement>(null);

  // Dragging states
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
  });

  // Multi-touch pinch tracking for iPhone and iPad
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(1);

  const [draggedItem, setDraggedItem] = useState<{
    id: string;
    startX: number;
    startY: number;
    itemX: number;
    itemY: number;
  } | null>(null);

  // Prevent iOS Safari page pinch zooming
  useEffect(() => {
    const preventGestures = (e: Event) => e.preventDefault();
    document.addEventListener('gesturestart', preventGestures);
    document.addEventListener('gesturechange', preventGestures);
    return () => {
      document.removeEventListener('gesturestart', preventGestures);
      document.removeEventListener('gesturechange', preventGestures);
    };
  }, []);

  // Wheel zoom handling
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
        setZoom((prevZoom) => Math.min(2.5, Math.max(0.2, prevZoom * zoomFactor)));
      } else {
        setPanOffset((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    },
    [setZoom, setPanOffset]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Global Clipboard Paste Handler (Instant Image & Text paste with Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }

      // 1. Check for image files in clipboard
      const clipItems = e.clipboardData?.items;
      if (clipItems) {
        for (let i = 0; i < clipItems.length; i++) {
          const item = clipItems[i];
          if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            if (blob) {
              const reader = new FileReader();
              reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                if (dataUrl) {
                  const spawnX = (-panOffset.x + window.innerWidth / 2) / zoom - 150;
                  const spawnY = (-panOffset.y + window.innerHeight / 2) / zoom - 120;
                  addItem({
                    id: `img-${Date.now()}`,
                    type: 'image',
                    x: Math.round(spawnX + (Math.random() * 30 - 15)),
                    y: Math.round(spawnY + (Math.random() * 30 - 15)),
                    width: 320,
                    height: 220,
                    title: 'Pasted Picture',
                    color: 'yellow',
                    authorId: activePersonaId,
                    authorName: activePersona.name,
                    authorAvatar: activePersona.avatar,
                    createdAt: Date.now(),
                    tags: ['Pasted'],
                    votes: [],
                    imageUrl: dataUrl,
                  });
                }
              };
              reader.readAsDataURL(blob);
              e.preventDefault();
              return;
            }
          }
        }
      }

      // 2. Check for text or image URLs in clipboard
      const text = e.clipboardData?.getData('text');
      if (text && text.trim()) {
        const trimmed = text.trim();
        const isImageUrl = /\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i.test(trimmed) || 
                           trimmed.includes('images.unsplash.com');

        const spawnX = (-panOffset.x + window.innerWidth / 2) / zoom - 120;
        const spawnY = (-panOffset.y + window.innerHeight / 2) / zoom - 50;

        if (isImageUrl) {
          addItem({
            id: `img-${Date.now()}`,
            type: 'image',
            x: Math.round(spawnX),
            y: Math.round(spawnY),
            width: 320,
            height: 220,
            title: 'Pasted Picture',
            color: 'yellow',
            authorId: activePersonaId,
            authorName: activePersona.name,
            authorAvatar: activePersona.avatar,
            createdAt: Date.now(),
            tags: ['Picture'],
            votes: [],
            imageUrl: trimmed,
          });
          e.preventDefault();
        } else {
          if (trimmed.length > 70 || trimmed.includes('\n')) {
            addItem({
              id: `sticky-${Date.now()}`,
              type: 'sticky',
              x: Math.round(spawnX),
              y: Math.round(spawnY),
              width: 240,
              height: 150,
              title: 'Pasted Note',
              content: trimmed,
              color: 'pink',
              authorId: activePersonaId,
              authorName: activePersona.name,
              authorAvatar: activePersona.avatar,
              createdAt: Date.now(),
              tags: ['Pasted'],
              votes: [],
            });
          } else {
            addItem({
              id: `text-${Date.now()}`,
              type: 'text',
              x: Math.round(spawnX),
              y: Math.round(spawnY),
              width: 260,
              height: 60,
              title: trimmed,
              content: trimmed,
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
          }
          e.preventDefault();
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [panOffset, zoom, addItem, activePersonaId, activePersona]);

  // Drag & Drop Elements from Toolbar, Desktop, or Stash directly onto Whiteboard
  const [dragGhost, setDragGhost] = useState<{
    x: number;
    y: number;
    type: string;
  } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    const activeTool =
      (typeof window !== 'undefined' ? (window as any).__kitsune_active_drag_tool : null) || 'item';
    const worldX = (e.clientX - panOffset.x) / zoom;
    const worldY = (e.clientY - panOffset.y) / zoom;
    setDragGhost({ x: Math.round(worldX), y: Math.round(worldY), type: activeTool });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setDragGhost(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragGhost(null);
    if (typeof window !== 'undefined') {
      (window as any).__kitsune_active_drag_tool = null;
    }

    const dropX = (e.clientX - panOffset.x) / zoom;
    const dropY = (e.clientY - panOffset.y) / zoom;

    // 0. Check for Single Staged Item dropped from private stash
    const stagedId = e.dataTransfer.getData('application/kitsune-staged-id');
    if (stagedId && revealSingleStagedItem) {
      revealSingleStagedItem(stagedId, Math.round(dropX - 110), Math.round(dropY - 70));
      return;
    }

    // 1. Check for Toolbar Element Drag
    const toolbarType =
      e.dataTransfer.getData('application/kitsune-toolbar-element') ||
      (e.dataTransfer.getData('text/plain')?.startsWith('tool:')
        ? e.dataTransfer.getData('text/plain').replace('tool:', '')
        : null);

    if (toolbarType) {
      if (toolbarType === 'sticky' || toolbarType === 'note') {
        const newItem: CanvasItem = {
          id: `sticky-${Date.now()}`,
          type: 'sticky',
          x: Math.round(dropX - 110),
          y: Math.round(dropY - 70),
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
        };
        addItem(newItem);
        setSelectedItemId(newItem.id);
        return;
      }

      if (toolbarType === 'text') {
        const newItem: CanvasItem = {
          id: `text-${Date.now()}`,
          type: 'text',
          x: Math.round(dropX - 120),
          y: Math.round(dropY - 30),
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
        };
        addItem(newItem);
        setSelectedItemId(newItem.id);
        return;
      }

      if (toolbarType === 'image' || toolbarType === 'picture') {
        const creativeImages = [
          'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
        ];
        const randomImg = creativeImages[Math.floor(Math.random() * creativeImages.length)];
        const newItem: CanvasItem = {
          id: `img-${Date.now()}`,
          type: 'image',
          x: Math.round(dropX - 150),
          y: Math.round(dropY - 110),
          width: 300,
          height: 220,
          title: 'Visual Reference',
          color: 'yellow',
          authorId: activePersonaId,
          authorName: activePersona.name,
          authorAvatar: activePersona.avatar,
          createdAt: Date.now(),
          tags: ['Picture'],
          votes: [],
          imageUrl: randomImg,
        };
        addItem(newItem);
        setSelectedItemId(newItem.id);
        return;
      }

      if (toolbarType === 'poll') {
        const newItem: CanvasItem = {
          id: `poll-${Date.now()}`,
          type: 'poll',
          x: Math.round(dropX - 160),
          y: Math.round(dropY - 100),
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
        };
        addItem(newItem);
        setSelectedItemId(newItem.id);
        return;
      }

      if (toolbarType === 'miniboard') {
        const newItem: CanvasItem = {
          id: `miniboard-${Date.now()}`,
          type: 'miniboard',
          x: Math.round(dropX - 140),
          y: Math.round(dropY - 100),
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
        };
        addItem(newItem);
        setSelectedItemId(newItem.id);
        return;
      }

      if (toolbarType === 'frame') {
        const newItem: CanvasItem = {
          id: `frame-${Date.now()}`,
          type: 'frame',
          x: Math.round(dropX - 280),
          y: Math.round(dropY - 180),
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
        };
        addItem(newItem);
        setSelectedItemId(newItem.id);
        return;
      }
    }

    // 2. Files dropped (images from desktop / finder)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            if (dataUrl) {
              addItem({
                id: `img-${Date.now()}-${i}`,
                type: 'image',
                x: Math.round(dropX - 150 + i * 25),
                y: Math.round(dropY - 110 + i * 25),
                width: 320,
                height: 220,
                title: file.name.replace(/\.[^/.]+$/, ''),
                color: 'yellow',
                authorId: activePersonaId,
                authorName: activePersona.name,
                authorAvatar: activePersona.avatar,
                createdAt: Date.now(),
                tags: ['Dropped Image'],
                votes: [],
                imageUrl: dataUrl,
              });
            }
          };
          reader.readAsDataURL(file);
        }
      }
      return;
    }

    // 3. Text or URL dropped from browser
    const text = e.dataTransfer.getData('text');
    if (text && text.trim()) {
      const trimmed = text.trim();
      const isImageUrl = /\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i.test(trimmed) || 
                         trimmed.includes('images.unsplash.com');

      if (isImageUrl) {
        addItem({
          id: `img-${Date.now()}`,
          type: 'image',
          x: Math.round(dropX - 150),
          y: Math.round(dropY - 110),
          width: 320,
          height: 220,
          title: 'Dropped Image',
          color: 'yellow',
          authorId: activePersonaId,
          authorName: activePersona.name,
          authorAvatar: activePersona.avatar,
          createdAt: Date.now(),
          tags: ['Picture'],
          votes: [],
          imageUrl: trimmed,
        });
      } else {
        addItem({
          id: `sticky-${Date.now()}`,
          type: 'sticky',
          x: Math.round(dropX - 110),
          y: Math.round(dropY - 70),
          width: 220,
          height: 140,
          title: 'Dropped Thought',
          content: trimmed,
          color: 'yellow',
          authorId: activePersonaId,
          authorName: activePersona.name,
          authorAvatar: activePersona.avatar,
          createdAt: Date.now(),
          tags: ['Dropped'],
          votes: [],
        });
      }
    }
  };

  // Unified Pointer & Touch Pan/Zoom Handlers (supports iPhone, iPad, & Desktop)
  const handlePointerDown = (e: React.PointerEvent) => {
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Multi-touch Pinch to Zoom on iPad / iPhone
    if (activePointersRef.current.size === 2) {
      const [p1, p2] = Array.from(activePointersRef.current.values());
      pinchStartDistRef.current = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      pinchStartZoomRef.current = zoom;
      setIsPanning(false);
      setDraggedItem(null);
      return;
    }

    if (e.button === 1 || e.button === 0) {
      if ((e.target as HTMLElement).closest('.canvas-item, button, input, textarea')) return;

      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: panOffset.x,
        panY: panOffset.y,
      };
      setSelectedItemId(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const worldX = (e.clientX - panOffset.x) / zoom;
    const worldY = (e.clientY - panOffset.y) / zoom;
    broadcastCursor(Math.round(worldX), Math.round(worldY));

    // 2-Finger Pinch to Zoom (smooth scale around center)
    if (activePointersRef.current.size === 2 && pinchStartDistRef.current) {
      const [p1, p2] = Array.from(activePointersRef.current.values());
      const currentDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const scale = currentDist / pinchStartDistRef.current;
      const nextZoom = Math.min(2.5, Math.max(0.2, pinchStartZoomRef.current * scale));
      setZoom(nextZoom);
      return;
    }

    // 1-Finger or Mouse Canvas Panning
    if (isPanning && activePointersRef.current.size === 1) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPanOffset({
        x: panStartRef.current.panX + dx,
        y: panStartRef.current.panY + dy,
      });
      return;
    }

    // Item Dragging
    if (draggedItem) {
      const dx = (e.clientX - draggedItem.startX) / zoom;
      const dy = (e.clientY - draggedItem.startY) / zoom;
      moveItem(draggedItem.id, Math.round(draggedItem.itemX + dx), Math.round(draggedItem.itemY + dy));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) {
      pinchStartDistRef.current = null;
    }
    if (activePointersRef.current.size === 0) {
      setIsPanning(false);
      setDraggedItem(null);
    }
  };

  // Double click anywhere to quickly drop a text item
  const handleDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.canvas-item, button, input, textarea')) return;
    const clickX = (e.clientX - panOffset.x) / zoom;
    const clickY = (e.clientY - panOffset.y) / zoom;

    addItem({
      id: `text-${Date.now()}`,
      type: 'text',
      x: Math.round(clickX),
      y: Math.round(clickY),
      width: 240,
      height: 60,
      title: 'New Text',
      content: 'Click to write...',
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

  const handleItemDragStart = (e: React.MouseEvent | React.PointerEvent, item: CanvasItem) => {
    setDraggedItem({
      id: item.id,
      startX: e.clientX,
      startY: e.clientY,
      itemX: item.x,
      itemY: item.y,
    });
    setSelectedItemId(item.id);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchContent = item.content?.toLowerCase().includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTags) return false;
    }

    if (viewFilter === 'all') return true;
    if (viewFilter === 'top-voted') return (item.votes?.length || 0) >= 2;
    if (viewFilter === 'shortlisted') return Boolean(item.isShortlisted);
    if (viewFilter === 'decisions') return Boolean(item.isDecision);
    return item.authorId === viewFilter;
  });

  const frames = filteredItems.filter((i) => i.type === 'frame');
  const nonFrames = filteredItems.filter((i) => i.type !== 'frame');
  const selectedItem = items.find((i) => i.id === selectedItemId);

  const bgClass =
    canvasBackground === 'dots'
      ? theme === 'dark'
        ? 'canvas-grid-dots-dark'
        : 'canvas-grid-dots-light'
      : canvasBackground === 'lines'
      ? theme === 'dark'
        ? 'canvas-grid-lines-dark'
        : 'canvas-grid-lines-light'
      : theme === 'dark'
      ? 'canvas-clean-dark'
      : 'canvas-clean-light';

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full h-screen overflow-hidden cursor-default select-none touch-none ${bgClass}`}
    >
      {/* Top Floating Header */}
      <WhiteboardHeader />

      {/* World Coordinate Transform Layer */}
      <div
        style={{
          transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoom})`,
          transformOrigin: '0 0',
          willChange: 'transform',
        }}
        className="absolute top-0 left-0 w-full h-full"
      >
        {/* Canvas Section Heading */}
        {activeProject?.canvasHeading && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center pointer-events-none select-none z-0">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
              {activeProject.canvasHeading}
            </h2>
          </div>
        )}

        {/* SVG Connectors Layer */}
        <ConnectorsLayer items={items} selectedItemId={selectedItemId} />

        {/* Frames Layer */}
        {frames.map((frame) => (
          <div key={frame.id} className="canvas-item">
            <FrameCard
              item={frame}
              isSelected={selectedItemId === frame.id}
              onSelect={() => setSelectedItemId(frame.id)}
              onDragStart={handleItemDragStart}
            />
          </div>
        ))}

        {/* Interactive Canvas Items */}
        {nonFrames.map((item) => (
          <div key={item.id} className="canvas-item">
            {item.type === 'poll' ? (
              <CanvasPoll
                item={item}
                isSelected={selectedItemId === item.id}
                onSelect={() => setSelectedItemId(item.id)}
                onDragStart={handleItemDragStart}
              />
            ) : item.type === 'miniboard' ? (
              <CanvasMiniboard
                item={item}
                isSelected={selectedItemId === item.id}
                onSelect={() => setSelectedItemId(item.id)}
                onDragStart={handleItemDragStart}
              />
            ) : item.type === 'text' ? (
              <CanvasText
                item={item}
                isSelected={selectedItemId === item.id}
                onSelect={() => setSelectedItemId(item.id)}
                onDragStart={handleItemDragStart}
              />
            ) : item.type === 'image' ? (
              <CanvasImage
                item={item}
                isSelected={selectedItemId === item.id}
                onSelect={() => setSelectedItemId(item.id)}
                onDragStart={handleItemDragStart}
              />
            ) : item.type === 'reference' ? (
              <ReferenceCard
                item={item}
                isSelected={selectedItemId === item.id}
                onSelect={() => setSelectedItemId(item.id)}
                onDragStart={handleItemDragStart}
              />
            ) : (
              <StickyNote
                item={item}
                isSelected={selectedItemId === item.id}
                onSelect={() => setSelectedItemId(item.id)}
                onDragStart={handleItemDragStart}
              />
            )}
          </div>
        ))}

        {/* Drag Ghost Indicator showing exact landing position & element shape */}
        {dragGhost && (
          <div
            style={{
              transform: `translate3d(${
                dragGhost.type === 'frame'
                  ? dragGhost.x - 280
                  : dragGhost.type === 'poll'
                  ? dragGhost.x - 160
                  : dragGhost.type === 'image' || dragGhost.type === 'picture'
                  ? dragGhost.x - 150
                  : dragGhost.type === 'miniboard'
                  ? dragGhost.x - 140
                  : dragGhost.type === 'text'
                  ? dragGhost.x - 120
                  : dragGhost.x - 110
              }px, ${
                dragGhost.type === 'frame'
                  ? dragGhost.y - 180
                  : dragGhost.type === 'poll'
                  ? dragGhost.y - 100
                  : dragGhost.type === 'image' || dragGhost.type === 'picture'
                  ? dragGhost.y - 110
                  : dragGhost.type === 'miniboard'
                  ? dragGhost.y - 100
                  : dragGhost.type === 'text'
                  ? dragGhost.y - 30
                  : dragGhost.y - 70
              }px, 0)`,
              width:
                dragGhost.type === 'frame'
                  ? '580px'
                  : dragGhost.type === 'poll'
                  ? '320px'
                  : dragGhost.type === 'image' || dragGhost.type === 'picture'
                  ? '300px'
                  : dragGhost.type === 'miniboard'
                  ? '280px'
                  : dragGhost.type === 'text'
                  ? '260px'
                  : '220px',
              height:
                dragGhost.type === 'frame'
                  ? '380px'
                  : dragGhost.type === 'poll'
                  ? '250px'
                  : dragGhost.type === 'image' || dragGhost.type === 'picture'
                  ? '220px'
                  : dragGhost.type === 'miniboard'
                  ? '210px'
                  : dragGhost.type === 'text'
                  ? '60px'
                  : '140px',
            }}
            className={`absolute top-0 left-0 border-2 border-dashed pointer-events-none rounded-2xl flex flex-col items-center justify-center p-4 z-40 transition-transform duration-75 shadow-lg ${
              dragGhost.type === 'sticky' || dragGhost.type === 'note'
                ? 'border-amber-400 bg-amber-300/30 text-amber-950 dark:text-amber-100'
                : dragGhost.type === 'text'
                ? 'border-purple-400 bg-purple-300/30 text-purple-950 dark:text-purple-100'
                : dragGhost.type === 'image' || dragGhost.type === 'picture'
                ? 'border-sky-400 bg-sky-300/30 text-sky-950 dark:text-sky-100'
                : dragGhost.type === 'poll'
                ? 'border-indigo-400 bg-indigo-300/30 text-indigo-950 dark:text-indigo-100'
                : dragGhost.type === 'miniboard'
                ? 'border-pink-400 bg-pink-300/30 text-pink-950 dark:text-pink-100'
                : 'border-emerald-400 bg-emerald-300/30 text-emerald-950 dark:text-emerald-100'
            }`}
          >
            <div className="text-xs font-black tracking-wide bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 rounded-full shadow-md border border-black/10 flex items-center gap-1.5">
              <span>✨</span>
              <span>Drop to place {dragGhost.type.toUpperCase()}</span>
            </div>
          </div>
        )}

        {/* Live Peer Cursors */}
        <CursorsLayer peerCursors={peerCursors} />
      </div>

      {/* Bottom Left Watermark Badge */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-none select-none">
        <div className="px-3 py-1 rounded-full bg-black/75 dark:bg-slate-900/80 text-white text-[11px] font-bold shadow-md backdrop-blur-sm border border-white/10 tracking-wide">
          kitsune.co
        </div>
      </div>

      {/* Mobile & Touch Floating Action Bar for Selected Item */}
      {selectedItem && (
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/90 dark:bg-slate-900/95 backdrop-blur-md text-white shadow-2xl border border-white/10 animate-pop-in pointer-events-auto max-w-[90vw]">
          <span className="text-[11px] font-bold text-slate-300 px-2 truncate max-w-[100px] sm:max-w-[160px]">
            {selectedItem.title || 'Selected Item'}
          </span>
          <div className="h-4 w-px bg-white/20" />
          <button
            onClick={() => toggleVote(selectedItem.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold hover:bg-white/15 transition-colors"
            title="Vote"
          >
            <Star className={`w-3.5 h-3.5 ${selectedItem.votes?.includes(activePersonaId) ? 'fill-current text-pink-400' : ''}`} />
            <span className="text-[11px]">{selectedItem.votes?.length || 0}</span>
          </button>
          <button
            onClick={() => {
              const label = window.prompt('Enter branch theme or idea:', 'Branch Idea');
              if (label !== null) branchItem(selectedItem.id, label.trim() || 'Branch');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold hover:bg-white/15 transition-colors text-purple-300"
            title="Branch from this item"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span className="hidden xs:inline text-[11px]">Branch</span>
          </button>
          <button
            onClick={() => {
              removeItem(selectedItem.id);
              setSelectedItemId(null);
            }}
            className="p-1.5 rounded-xl text-xs font-bold hover:bg-red-500/20 text-red-400 transition-colors"
            title="Delete item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setSelectedItemId(null)}
            className="p-1 rounded-xl text-slate-400 hover:text-white"
            title="Close selection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Canvas Toolbar */}
      <CanvasToolbar />

      {/* Minimap */}
      <Minimap
        items={items}
        zoom={zoom}
        panOffset={panOffset}
        onNavigate={(newPan) => setPanOffset(newPan)}
      />
    </div>
  );
};
