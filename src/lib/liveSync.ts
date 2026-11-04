import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  collection, 
  deleteDoc,
  Unsubscribe 
} from 'firebase/firestore';
import type { CanvasItem, PeerCursor, Project } from '../types';

export const CLIENT_ID = 'client_' + Math.random().toString(36).substring(2, 9);

/**
 * Subscribe to real-time whiteboard item updates from the cloud
 */
export function subscribeToLiveBoard(
  projectId: string,
  onRemoteItemsChange: (items: CanvasItem[]) => void
): Unsubscribe | null {
  if (!db || !projectId) return null;

  try {
    const roomRef = doc(db, 'live_rooms', projectId);
    const unsubscribe = onSnapshot(
      roomRef,
      (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        if (data.lastUpdatedBy === CLIENT_ID) {
          // Ignore echo of our own edits
          return;
        }
        if (Array.isArray(data.items)) {
          onRemoteItemsChange(data.items);
        }
      },
      (error) => {
        console.warn('Live board subscription error:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to live board:', err);
    return null;
  }
}

/**
 * Broadcast local whiteboard updates to everyone in the room
 */
let broadcastTimeout: any = null;
export function broadcastLiveItems(projectId: string, items: CanvasItem[]) {
  if (!db || !projectId) return;

  if (broadcastTimeout) {
    clearTimeout(broadcastTimeout);
  }

  broadcastTimeout = setTimeout(async () => {
    if (!db) return;
    try {
      const roomRef = doc(db, 'live_rooms', projectId);
      await setDoc(
        roomRef,
        {
          items,
          lastUpdatedBy: CLIENT_ID,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Failed to broadcast live items:', err);
    }
  }, 100); // 100ms debounce for ultra-responsive live sync
}

/**
 * Subscribe to real-time live cursors from other collaborators in this room
 */
export function subscribeToLivePresence(
  projectId: string,
  onPresenceChange: (peers: PeerCursor[]) => void
): Unsubscribe | null {
  if (!db || !projectId) return null;

  try {
    const presenceCol = collection(db, 'live_rooms', projectId, 'presence');
    const unsubscribe = onSnapshot(
      presenceCol,
      (snapshot) => {
        const now = Date.now();
        const peers: PeerCursor[] = [];

        snapshot.forEach((docSnap) => {
          if (docSnap.id === CLIENT_ID) return; // Skip ourselves
          const data = docSnap.data();
          // Filter out stale cursors older than 15 seconds
          if (now - (data.updatedAt || 0) < 15000) {
            peers.push({
              personaId: data.personaId || 'simon',
              personaName: data.name || 'Collaborator',
              avatar: data.avatar || '🦊',
              color: data.color || '#a855f7',
              x: data.x || 0,
              y: data.y || 0,
              lastActive: data.updatedAt || now,
            });
          }
        });

        onPresenceChange(peers);
      },
      (error) => {
        console.warn('Live presence subscription error:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to live presence:', err);
    return null;
  }
}

/**
 * Broadcast our cursor position in real-time to other users in the room
 */
let lastCursorBroadcast = 0;
export function broadcastLiveCursor(
  projectId: string,
  cursor: { x: number; y: number; name: string; avatar: string; color: string; personaId: any }
) {
  if (!db || !projectId) return;

  const now = Date.now();
  // Throttle cursor sends to max once every 80ms to keep network super smooth
  if (now - lastCursorBroadcast < 80) return;
  lastCursorBroadcast = now;

  try {
    const presenceDoc = doc(db, 'live_rooms', projectId, 'presence', CLIENT_ID);
    setDoc(presenceDoc, {
      ...cursor,
      updatedAt: now,
    }).catch(() => {});
  } catch {}
}

/**
 * Cleanup presence when leaving
 */
export function removeLivePresence(projectId: string) {
  if (!db || !projectId) return;
  try {
    const presenceDoc = doc(db, 'live_rooms', projectId, 'presence', CLIENT_ID);
    deleteDoc(presenceDoc).catch(() => {});
  } catch {}
}
