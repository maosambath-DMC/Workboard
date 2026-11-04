import LZString from 'lz-string';
import type { Project } from '../types';
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Generate a shareable URL containing the compressed whiteboard state.
 * This works universally across any device without backend setup.
 */
export function generateShareUrl(project: Project): string {
  try {
    const compactProject = {
      id: project.id,
      title: project.title,
      description: project.description,
      canvasHeading: project.canvasHeading,
      emoji: project.emoji,
      accentColor: project.accentColor,
      category: project.category,
      status: project.status,
      statusLabel: project.statusLabel,
      updatedAt: new Date().toISOString(),
      members: project.members,
      items: project.items,
      stagedItems: project.stagedItems || [],
      votingSession: project.votingSession,
    };

    const json = JSON.stringify(compactProject);
    const compressed = LZString.compressToEncodedURIComponent(json);
    const url = new URL(window.location.origin);
    url.searchParams.set('share', compressed);
    return url.toString();
  } catch (err) {
    console.error('Failed to generate share URL:', err);
    return window.location.href;
  }
}

/**
 * Parses shared project data from the current URL if present.
 */
export function parseShareUrl(): Project | null {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const shareData = urlParams.get('share');
    if (!shareData) return null;

    const decompressed = LZString.decompressFromEncodedURIComponent(shareData);
    if (!decompressed) return null;

    const parsed = JSON.parse(decompressed) as Project;
    if (parsed && parsed.title && Array.isArray(parsed.items)) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse share URL:', err);
  }
  return null;
}

/**
 * Save board to Cloud Firestore if available
 */
export async function saveBoardToCloud(project: Project): Promise<boolean> {
  if (!db) return false;
  try {
    const boardRef = doc(db, 'shared_boards', project.id);
    await setDoc(boardRef, {
      ...project,
      savedAt: Date.now(),
    });
    return true;
  } catch (err) {
    console.warn('Firestore cloud save skipped/unavailable:', err);
    return false;
  }
}

/**
 * Load board from Cloud Firestore by ID if available
 */
export async function loadBoardFromCloud(boardId: string): Promise<Project | null> {
  if (!db) return null;
  try {
    const boardRef = doc(db, 'shared_boards', boardId);
    const snap = await getDoc(boardRef);
    if (snap.exists()) {
      return snap.data() as Project;
    }
  } catch (err) {
    console.warn('Firestore cloud load skipped:', err);
  }
  return null;
}

/**
 * Export project as a downloadable JSON file
 */
export function exportProjectAsJson(project: Project): void {
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-workboard.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import project from a JSON file
 */
export function importProjectFromJson(file: File): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const project = JSON.parse(text) as Project;
        if (!project.title || !Array.isArray(project.items)) {
          throw new Error('Invalid project file structure');
        }
        resolve(project);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
