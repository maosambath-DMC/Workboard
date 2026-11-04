import { useState, useEffect, useCallback } from 'react';
import type { 
  CanvasItem, 
  StagedItem, 
  PersonaId, 
  CanvasBackground, 
  ViewFilter, 
  VotingSession, 
  PeerCursor,
  CardColor,
  DecisionCategory,
  Project
} from '../types';
import { PERSONAS } from '../constants/personas';
import { INITIAL_PROJECTS } from '../constants/initialProjects';

const STORAGE_KEY_PROJECTS = 'kitsune_workspace_projects_v3';
const STORAGE_KEY_THEME = 'kitsune_theme_v2';

const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('kitsune_workspace_channel') 
  : null;

import { parseShareUrl } from '../lib/share';
import { 
  subscribeToLiveBoard, 
  broadcastLiveItems, 
  subscribeToLivePresence, 
  broadcastLiveCursor, 
  removeLivePresence 
} from '../lib/liveSync';

const sharedOnLoad = typeof window !== 'undefined' ? parseShareUrl() : null;

export function useWorkspaceStore() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  // Projects State
  const [projects, setProjects] = useState<Project[]>(() => {
    let list: Project[] = INITIAL_PROJECTS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
      }
    } catch {
      // ignore
    }

    if (sharedOnLoad) {
      const idx = list.findIndex((p) => p.id === sharedOnLoad.id);
      if (idx !== -1) {
        list[idx] = sharedOnLoad;
      } else {
        list = [sharedOnLoad, ...list];
      }
    }
    return list;
  });

  const safeProjects = Array.isArray(projects) ? projects : INITIAL_PROJECTS;

  // Navigation View: 'projects' = Project selection landing page, 'whiteboard' = inside a project
  const [currentView, setCurrentView] = useState<'projects' | 'whiteboard'>(
    sharedOnLoad ? 'whiteboard' : 'projects'
  );
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    sharedOnLoad ? sharedOnLoad.id : null
  );

  // Active Persona
  const [activePersonaId, setActivePersonaId] = useState<PersonaId>('simon');

  // Active Project Data
  const activeProject = safeProjects.find((p) => p.id === activeProjectId) || null;

  // Active items & staged items derived from activeProject
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [stagedItems, setStagedItems] = useState<StagedItem[]>([]);
  const [votingSession, setVotingSession] = useState<VotingSession>({
    isActive: false,
    dotsPerPerson: 5,
    endsAt: null,
    durationMinutes: 5,
  });

  // Canvas Engine State
  const [canvasBackground, setCanvasBackground] = useState<CanvasBackground>('dots');
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 40, y: 40 });
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Filters & Search
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [isStagingOpen, setIsStagingOpen] = useState<boolean>(false);
  const [isDecisionMatrixOpen, setIsDecisionMatrixOpen] = useState<boolean>(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState<boolean>(false);
  const [newItemParentId, setNewItemParentId] = useState<string | null>(null);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Multi-user simulated peers & live cursors
  const [peerCursors, setPeerCursors] = useState<PeerCursor[]>([]);
  const [simulatePeers, setSimulatePeers] = useState<boolean>(true);

  // Save projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.warn('Failed to save projects to storage', e);
    }
  }, [projects]);

  // When activeProject changes, update canvas state
  useEffect(() => {
    if (activeProject) {
      setItems(activeProject.items || []);
      setStagedItems(activeProject.stagedItems || []);
      setVotingSession(activeProject.votingSession || {
        isActive: false,
        dotsPerPerson: 5,
        endsAt: null,
        durationMinutes: 5,
      });
      // Center pan offset for a nice presentation
      setPanOffset({ x: 80, y: 70 });
      setZoom(1);
    }
  }, [activeProjectId]);

  // Synchronize items back to projects state
  const syncItemsToProject = useCallback((newItems: CanvasItem[], newStaged?: StagedItem[], newVoting?: VotingSession) => {
    if (!activeProjectId) return;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== activeProjectId) return p;
        return {
          ...p,
          items: newItems,
          stagedItems: newStaged !== undefined ? newStaged : p.stagedItems,
          votingSession: newVoting !== undefined ? newVoting : p.votingSession,
          updatedAt: 'Just now',
          status: newVoting?.isActive ? 'voting' : p.items.some((i) => i.isDecision) ? 'decisions' : 'ideation',
        };
      })
    );
  }, [activeProjectId]);

  // Open a project whiteboard
  const openProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
    setCurrentView('whiteboard');
  }, []);

  // Return to projects selection page
  const backToProjects = useCallback(() => {
    setCurrentView('projects');
  }, []);

  // Create new project
  const createProject = useCallback((projectData: {
    title: string;
    description: string;
    category: string;
    emoji: string;
    accentColor: string;
  }) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: projectData.title,
      description: projectData.description,
      canvasHeading: projectData.title,
      emoji: projectData.emoji || '💡',
      accentColor: projectData.accentColor || '#a855f7',
      category: projectData.category || 'General',
      status: 'ideation',
      statusLabel: 'Brainstorming Active',
      updatedAt: 'Just now',
      members: ['simon', 'andrea', 'david'],
      items: [
        {
          id: `seed-${Date.now()}`,
          type: 'sticky',
          x: 400,
          y: 200,
          width: 260,
          height: 160,
          title: 'Project Kickoff & Vision',
          content: 'Add your first references, inspiration stickies, and thoughts here.',
          color: 'yellow',
          authorId: activePersonaId,
          authorName: PERSONAS[activePersonaId].name,
          authorAvatar: PERSONAS[activePersonaId].avatar,
          createdAt: Date.now(),
          tags: ['Kickoff', 'Vision'],
          votes: [activePersonaId],
        },
      ],
      stagedItems: [],
      votingSession: {
        isActive: false,
        dotsPerPerson: 5,
        endsAt: null,
        durationMinutes: 5,
      },
    };

    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    setCurrentView('whiteboard');
    setIsCreateProjectModalOpen(false);
  }, [activePersonaId]);

  // Delete project
  const deleteProject = useCallback((projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (activeProjectId === projectId) {
        setCurrentView('projects');
        setActiveProjectId(null);
      }
    }
  }, [activeProjectId]);

  // Broadcast sync listener
  useEffect(() => {
    if (!channel) return;

    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || !data.type) return;

      if (data.type === 'SYNC_ITEMS' && data.projectId === activeProjectId) {
        setItems(data.payload);
      } else if (data.type === 'SYNC_CURSOR') {
        const cursor: PeerCursor = data.payload;
        if (cursor.personaId !== activePersonaId) {
          setPeerCursors((prev) => {
            const filtered = prev.filter((c) => c.personaId !== cursor.personaId);
            return [...filtered, cursor];
          });
        }
      } else if (data.type === 'SYNC_VOTING' && data.projectId === activeProjectId) {
        setVotingSession(data.payload);
      }
    };

    channel.addEventListener('message', handleMessage);
    return () => {
      channel.removeEventListener('message', handleMessage);
    };
  }, [activeProjectId, activePersonaId]);

  const [livePeersCount, setLivePeersCount] = useState<number>(1);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  // Live Room Cloud Subscription (Two-Way Real-Time Live Server Updates)
  useEffect(() => {
    if (!activeProjectId || currentView !== 'whiteboard') return;

    setIsLiveConnected(true);

    // 1. Subscribe to real-time whiteboard item updates from other collaborators
    const unsubBoard = subscribeToLiveBoard(activeProjectId, (remoteItems) => {
      setItems(remoteItems);
      setProjects((prev) =>
        prev.map((p) => (p.id === activeProjectId ? { ...p, items: remoteItems, updatedAt: 'Just now' } : p))
      );
    });

    // 2. Subscribe to real-time presence & peer cursors from other devices
    const unsubPresence = subscribeToLivePresence(activeProjectId, (peers) => {
      setLivePeersCount(peers.length + 1);
      if (peers.length > 0) {
        setPeerCursors((prev) => {
          const remoteNames = new Set(peers.map((p) => p.personaName));
          const simulated = prev.filter((c) => !remoteNames.has(c.personaName));
          return [...simulated, ...peers];
        });
      }
    });

    return () => {
      if (unsubBoard) unsubBoard();
      if (unsubPresence) unsubPresence();
      removeLivePresence(activeProjectId);
      setIsLiveConnected(false);
    };
  }, [activeProjectId, currentView]);

  const broadcastItems = useCallback((newItems: CanvasItem[]) => {
    if (activeProjectId) {
      if (channel) {
        channel.postMessage({ type: 'SYNC_ITEMS', projectId: activeProjectId, payload: newItems });
      }
      broadcastLiveItems(activeProjectId, newItems);
    }
    syncItemsToProject(newItems);
  }, [activeProjectId, syncItemsToProject]);

  const broadcastCursor = useCallback((x: number, y: number, action?: string) => {
    const persona = PERSONAS[activePersonaId];
    if (channel) {
      channel.postMessage({
        type: 'SYNC_CURSOR',
        payload: {
          personaId: activePersonaId,
          personaName: persona.name,
          avatar: persona.avatar,
          color: persona.accentHex,
          x,
          y,
          activeAction: action,
          lastActive: Date.now(),
        },
      });
    }
    if (activeProjectId) {
      broadcastLiveCursor(activeProjectId, {
        x,
        y,
        name: persona.name,
        avatar: persona.avatar,
        color: persona.accentHex,
        personaId: activePersonaId,
      });
    }
  }, [activeProjectId, activePersonaId]);

  // Simulated peer cursors (customized per project!)
  useEffect(() => {
    if (!simulatePeers || currentView !== 'whiteboard') {
      setPeerCursors([]);
      return;
    }

    if (activeProjectId === 'potential-projects') {
      // Match the exact screenshot cursors: Simon (orange), David (blue), Andrea (red with star)
      const peers: PeerCursor[] = [
        {
          personaId: 'simon',
          personaName: 'Simon',
          color: '#f97316',
          x: 480,
          y: 280,
          lastActive: Date.now(),
        },
        {
          personaId: 'david',
          personaName: 'David',
          color: '#3b82f6',
          x: 380,
          y: 470,
          lastActive: Date.now(),
        },
        {
          personaId: 'andrea',
          personaName: 'Andrea',
          color: '#ef4444',
          x: 960,
          y: 275,
          hasStar: true,
          lastActive: Date.now(),
        },
      ];
      setPeerCursors(peers);

      const interval = setInterval(() => {
        setPeerCursors((prev) =>
          prev.map((peer) => {
            const dx = (Math.random() - 0.48) * 20;
            const dy = (Math.random() - 0.48) * 20;
            return {
              ...peer,
              x: Math.max(100, Math.min(1200, peer.x + dx)),
              y: Math.max(100, Math.min(700, peer.y + dy)),
              lastActive: Date.now(),
            };
          })
        );
      }, 2500);

      return () => clearInterval(interval);
    } else {
      // Default wandering peers
      const otherPersonas = Object.values(PERSONAS).filter((p) => p.id !== activePersonaId);
      const peers: PeerCursor[] = otherPersonas.slice(0, 3).map((p, idx) => ({
        personaId: p.id,
        personaName: p.name.split(' ')[0],
        avatar: p.avatar,
        color: p.accentHex,
        x: 320 + idx * 300,
        y: 240 + idx * 100,
        activeAction: idx === 0 ? 'Reviewing ideas' : idx === 1 ? 'Voting' : 'Adding reference',
        lastActive: Date.now(),
      }));
      setPeerCursors(peers);

      const interval = setInterval(() => {
        setPeerCursors((prev) =>
          prev.map((peer) => {
            const dx = (Math.random() - 0.48) * 35;
            const dy = (Math.random() - 0.48) * 35;
            return {
              ...peer,
              x: Math.max(100, Math.min(1600, peer.x + dx)),
              y: Math.max(100, Math.min(800, peer.y + dy)),
              lastActive: Date.now(),
            };
          })
        );
      }, 2500);

      return () => clearInterval(interval);
    }
  }, [simulatePeers, currentView, activeProjectId, activePersonaId]);

  // Canvas Actions
  const addItem = useCallback((item: CanvasItem) => {
    setItems((prev) => {
      const next = [item, ...prev];
      broadcastItems(next);
      return next;
    });
  }, [broadcastItems]);

  const updateItem = useCallback((id: string, updates: Partial<CanvasItem>) => {
    setItems((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      broadcastItems(next);
      return next;
    });
  }, [broadcastItems]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev
        .filter((item) => item.id !== id)
        .map((item) => (item.parentId === id ? { ...item, parentId: undefined, branchLabel: undefined } : item));
      broadcastItems(next);
      return next;
    });
    if (selectedItemId === id) setSelectedItemId(null);
  }, [broadcastItems, selectedItemId]);

  const moveItem = useCallback((id: string, x: number, y: number) => {
    setItems((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, x, y } : item));
      broadcastItems(next);
      return next;
    });
  }, [broadcastItems]);

  const branchItem = useCallback((parentId: string, branchLabel = 'Iteration') => {
    const parent = items.find((i) => i.id === parentId);
    if (!parent) return;

    const currentPersona = PERSONAS[activePersonaId];
    const childItem: CanvasItem = {
      id: `branch-${Date.now()}`,
      type: 'sticky',
      x: parent.x + parent.width + 60,
      y: parent.y + (Math.random() * 60 - 30),
      width: parent.width,
      height: parent.height,
      title: `Branch: ${parent.title.slice(0, 18)}...`,
      content: 'Exploring an alternative or follow-up angle on this concept.',
      color: (['yellow', 'pink', 'purple', 'blue', 'green', 'peach'] as CardColor[])[
        Math.floor(Math.random() * 6)
      ],
      authorId: activePersonaId,
      authorName: currentPersona.name,
      authorAvatar: currentPersona.avatar,
      createdAt: Date.now(),
      tags: ['Branch', branchLabel],
      votes: [],
      parentId: parent.id,
      branchLabel: branchLabel,
    };

    addItem(childItem);
    setSelectedItemId(childItem.id);
  }, [items, activePersonaId, addItem]);

  // Dot Voting
  const toggleVote = useCallback((itemId: string) => {
    setItems((prev) => {
      const next = prev.map((item) => {
        if (item.id !== itemId) return item;
        const currentVotes = item.votes || [];
        const hasVoted = currentVotes.includes(activePersonaId);
        
        let updatedVotes: PersonaId[];
        if (hasVoted) {
          const idx = currentVotes.indexOf(activePersonaId);
          updatedVotes = [...currentVotes.slice(0, idx), ...currentVotes.slice(idx + 1)];
        } else {
          updatedVotes = [...currentVotes, activePersonaId];
        }

        return {
          ...item,
          votes: updatedVotes,
          isShortlisted: updatedVotes.length >= 2 ? true : item.isShortlisted,
        };
      });

      broadcastItems(next);
      return next;
    });
  }, [activePersonaId, broadcastItems]);

  const toggleShortlist = useCallback((itemId: string) => {
    setItems((prev) => {
      const next = prev.map((item) => (item.id === itemId ? { ...item, isShortlisted: !item.isShortlisted } : item));
      broadcastItems(next);
      return next;
    });
  }, [broadcastItems]);

  const setDecision = useCallback((itemId: string, category: DecisionCategory | null) => {
    setItems((prev) => {
      const next = prev.map((item) => {
        if (item.id !== itemId) return item;
        if (!category) {
          return { ...item, isDecision: false, decisionCategory: undefined };
        }
        return { ...item, isDecision: true, decisionCategory: category };
      });
      broadcastItems(next);
      return next;
    });
  }, [broadcastItems]);

  // Staged Items (Independent ideation)
  const addStagedItem = useCallback((staged: Omit<StagedItem, 'id' | 'createdAt' | 'authorId' | 'authorName' | 'authorAvatar'>) => {
    const currentPersona = PERSONAS[activePersonaId];
    const newItem: StagedItem = {
      ...staged,
      id: `staged-${Date.now()}`,
      authorId: activePersonaId,
      authorName: currentPersona.name,
      authorAvatar: currentPersona.avatar,
      createdAt: Date.now(),
    };
    setStagedItems((prev) => {
      const next = [newItem, ...prev];
      syncItemsToProject(items, next);
      return next;
    });
  }, [activePersonaId, items, syncItemsToProject]);

  const removeStagedItem = useCallback((id: string) => {
    setStagedItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      syncItemsToProject(items, next);
      return next;
    });
  }, [items, syncItemsToProject]);

  const revealStagedItems = useCallback(() => {
    if (stagedItems.length === 0) return;

    const startX = 300 + Math.floor(Math.random() * 150);
    const startY = 350 + Math.floor(Math.random() * 100);

    const converted: CanvasItem[] = stagedItems.map((staged, idx) => ({
      id: `revealed-${staged.id}`,
      type: staged.type,
      x: startX + (idx % 3) * 260,
      y: startY + Math.floor(idx / 3) * 200,
      width: staged.type === 'reference' ? 300 : 220,
      height: staged.type === 'reference' ? 360 : 140,
      title: staged.title,
      content: staged.content,
      color: staged.color,
      authorId: staged.authorId,
      authorName: staged.authorName,
      authorAvatar: staged.authorAvatar,
      createdAt: Date.now(),
      tags: [...staged.tags, 'Revealed'],
      votes: [],
      imageUrl: staged.imageUrl,
      linkUrl: staged.linkUrl,
      palette: staged.palette,
    }));

    setItems((prev) => {
      const next = [...converted, ...prev];
      broadcastItems(next);
      return next;
    });

    setStagedItems([]);
    setIsStagingOpen(false);
    syncItemsToProject([...converted, ...items], []);
  }, [stagedItems, items, broadcastItems, syncItemsToProject]);

  const revealSingleStagedItem = useCallback((stagedId: string, x: number, y: number) => {
    const staged = stagedItems.find((s) => s.id === stagedId);
    if (!staged) return;

    const newItem: CanvasItem = {
      id: `revealed-${staged.id}-${Date.now()}`,
      type: staged.type === 'reference' ? 'reference' : 'sticky',
      x,
      y,
      width: staged.type === 'reference' ? 300 : 220,
      height: staged.type === 'reference' ? 360 : 140,
      title: staged.title,
      content: staged.content,
      color: staged.color,
      authorId: staged.authorId,
      authorName: staged.authorName,
      authorAvatar: staged.authorAvatar,
      createdAt: Date.now(),
      tags: [...staged.tags, 'Revealed'],
      votes: [],
      imageUrl: staged.imageUrl,
      linkUrl: staged.linkUrl,
      palette: staged.palette,
    };

    setStagedItems((prev) => {
      const nextStaged = prev.filter((s) => s.id !== stagedId);
      setItems((currItems) => {
        const nextItems = [...currItems, newItem];
        syncItemsToProject(nextItems, nextStaged);
        broadcastItems(nextItems);
        return nextItems;
      });
      return nextStaged;
    });
    setSelectedItemId(newItem.id);
  }, [stagedItems, syncItemsToProject, broadcastItems]);

  // Reset to initial projects
  const resetAllProjects = useCallback(() => {
    if (window.confirm('Reset all projects to demo defaults?')) {
      setProjects(INITIAL_PROJECTS);
      setActiveProjectId(null);
      setCurrentView('projects');
    }
  }, []);

  return {
    // Theme & Navigation View
    theme,
    setTheme,
    toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    currentView,
    openProject,
    backToProjects,
    projects,
    activeProjectId,
    activeProject,
    createProject,
    deleteProject,
    resetAllProjects,

    // Persona
    activePersonaId,
    setActivePersonaId,
    activePersona: PERSONAS[activePersonaId],

    // Canvas Items & CRUD
    items,
    addItem,
    updateItem,
    removeItem,
    moveItem,
    branchItem,
    toggleVote,
    toggleShortlist,
    setDecision,

    // Staging / Independent Ideation
    stagedItems,
    addStagedItem,
    removeStagedItem,
    revealStagedItems,
    revealSingleStagedItem,

    // Canvas Navigation
    canvasBackground,
    setCanvasBackground,
    zoom,
    setZoom,
    panOffset,
    setPanOffset,
    selectedItemId,
    setSelectedItemId,

    // Filters & Search
    viewFilter,
    setViewFilter,
    searchQuery,
    setSearchQuery,

    // Modals
    isStagingOpen,
    setIsStagingOpen,
    isDecisionMatrixOpen,
    setIsDecisionMatrixOpen,
    isSummaryModalOpen,
    setIsSummaryModalOpen,
    isNewItemModalOpen,
    setIsNewItemModalOpen,
    newItemParentId,
    setNewItemParentId,
    isCreateProjectModalOpen,
    setIsCreateProjectModalOpen,
    isShareModalOpen,
    setIsShareModalOpen,
    importProject: (imported: Project) => {
      setProjects((prev) => {
        const exists = prev.some((p) => p.id === imported.id);
        if (exists) {
          return prev.map((p) => (p.id === imported.id ? imported : p));
        }
        return [imported, ...prev];
      });
      setActiveProjectId(imported.id);
      setCurrentView('whiteboard');
    },

    // Voting Session
    votingSession,
    setVotingSession,
    startVotingSession: (durationMinutes = 5) => {
      const session: VotingSession = {
        isActive: true,
        dotsPerPerson: 5,
        endsAt: Date.now() + durationMinutes * 60 * 1000,
        durationMinutes,
        statusText: '3 participants still voting',
        pendingVotersCount: 3,
      };
      setVotingSession(session);
      syncItemsToProject(items, stagedItems, session);
      if (channel && activeProjectId) {
        channel.postMessage({ type: 'SYNC_VOTING', projectId: activeProjectId, payload: session });
      }
    },
    endVotingSession: () => {
      const session: VotingSession = {
        isActive: false,
        dotsPerPerson: 5,
        endsAt: null,
        durationMinutes: 5,
        statusText: 'Voting completed',
        pendingVotersCount: 0,
      };
      setVotingSession(session);
      syncItemsToProject(items, stagedItems, session);
      if (channel && activeProjectId) {
        channel.postMessage({ type: 'SYNC_VOTING', projectId: activeProjectId, payload: session });
      }
    },

    // Peer Cursors & Live Cloud Server Status
    peerCursors,
    simulatePeers,
    setSimulatePeers,
    broadcastCursor,
    livePeersCount,
    isLiveConnected,
  };
}

export type WorkspaceStore = ReturnType<typeof useWorkspaceStore>;
