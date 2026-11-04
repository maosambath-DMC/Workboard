import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserAccount, Project } from '../types';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: UserAccount | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  syncStatus: 'synced' | 'saving' | 'offline';
  setSyncStatus: (status: 'synced' | 'saving' | 'offline') => void;
  signUp: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  saveUserDataToCloud: (projects: Project[]) => Promise<boolean>;
  loadUserDataFromCloud: () => Promise<Project[] | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'kitsune_current_user';
const ACCOUNTS_DB_KEY = 'kitsune_registered_accounts';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default guest account
    return {
      uid: 'guest-' + Math.random().toString(36).substring(2, 9),
      email: 'guest@workboard.app',
      displayName: 'Guest Collaborator',
      avatar: '🦊',
      isGuest: true,
      createdAt: Date.now(),
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');

  // Listen to Firebase Auth state if available
  useEffect(() => {
    if (!auth) return;
    try {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const userAccount: UserAccount = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || 'user@workboard.app',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member',
            avatar: firebaseUser.photoURL || '✨',
            isGuest: false,
            createdAt: Date.now(),
          };
          setCurrentUser(userAccount);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userAccount));
        }
      });
      return () => unsubscribe();
    } catch {
      // Ignored if Firebase auth is not enabled
    }
  }, []);

  const saveToStorage = (user: UserAccount | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  const signUp = async (email: string, pass: string, name: string): Promise<{ success: boolean; error?: string }> => {
    setSyncStatus('saving');
    // Try Firebase Auth first
    if (auth) {
      try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        const userAccount: UserAccount = {
          uid: res.user.uid,
          email: res.user.email || email,
          displayName: name || email.split('@')[0],
          avatar: '🎨',
          isGuest: false,
          createdAt: Date.now(),
        };
        saveToStorage(userAccount);
        setSyncStatus('synced');
        return { success: true };
      } catch (err: any) {
        console.warn('Firebase Auth create error, falling back to instant local account:', err);
      }
    }

    // Built-in instant account system (works offline & multi-device without console configs)
    try {
      const accountsRaw = localStorage.getItem(ACCOUNTS_DB_KEY);
      const accounts = accountsRaw ? JSON.parse(accountsRaw) : {};
      if (accounts[email]) {
        setSyncStatus('offline');
        return { success: false, error: 'An account with this email already exists. Please Sign In.' };
      }

      const uid = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      accounts[email] = { password: pass, displayName: name, uid, createdAt: Date.now() };
      localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(accounts));

      const newAccount: UserAccount = {
        uid,
        email,
        displayName: name || email.split('@')[0],
        avatar: '🎨',
        isGuest: false,
        createdAt: Date.now(),
      };
      saveToStorage(newAccount);
      setSyncStatus('synced');
      return { success: true };
    } catch (e: any) {
      setSyncStatus('offline');
      return { success: false, error: e.message || 'Failed to create account' };
    }
  };

  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setSyncStatus('saving');
    // Try Firebase Auth first
    if (auth) {
      try {
        const res = await signInWithEmailAndPassword(auth, email, pass);
        const userAccount: UserAccount = {
          uid: res.user.uid,
          email: res.user.email || email,
          displayName: res.user.displayName || email.split('@')[0],
          avatar: '✨',
          isGuest: false,
          createdAt: Date.now(),
        };
        saveToStorage(userAccount);
        setSyncStatus('synced');
        return { success: true };
      } catch (err: any) {
        console.warn('Firebase Auth sign in error, checking local account:', err);
      }
    }

    // Built-in accounts
    try {
      const accountsRaw = localStorage.getItem(ACCOUNTS_DB_KEY);
      const accounts = accountsRaw ? JSON.parse(accountsRaw) : {};
      const acc = accounts[email];
      if (!acc) {
        setSyncStatus('offline');
        return { success: false, error: 'No account found with this email. Please Sign Up first.' };
      }
      if (acc.password !== pass) {
        setSyncStatus('offline');
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      const userAccount: UserAccount = {
        uid: acc.uid,
        email,
        displayName: acc.displayName,
        avatar: '🌟',
        isGuest: false,
        createdAt: acc.createdAt,
      };
      saveToStorage(userAccount);
      setSyncStatus('synced');
      return { success: true };
    } catch (e: any) {
      setSyncStatus('offline');
      return { success: false, error: e.message || 'Sign in failed' };
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setSyncStatus('saving');
    if (auth) {
      try {
        const provider = new GoogleAuthProvider();
        const res = await signInWithPopup(auth, provider);
        const userAccount: UserAccount = {
          uid: res.user.uid,
          email: res.user.email || 'google-user@workboard.app',
          displayName: res.user.displayName || 'Google User',
          avatar: res.user.photoURL || '🚀',
          isGuest: false,
          createdAt: Date.now(),
        };
        saveToStorage(userAccount);
        setSyncStatus('synced');
        return { success: true };
      } catch (err: any) {
        console.warn('Google sign-in popup error:', err);
        return { success: false, error: err.message || 'Google sign-in cancelled or not configured' };
      }
    }
    return { success: false, error: 'Google Sign-In requires Firebase Auth enabled in console.' };
  };

  const continueAsGuest = () => {
    const guestUser: UserAccount = {
      uid: 'guest-' + Math.random().toString(36).substring(2, 9),
      email: 'guest@workboard.app',
      displayName: 'Guest Collaborator',
      avatar: '🦊',
      isGuest: true,
      createdAt: Date.now(),
    };
    saveToStorage(guestUser);
    setSyncStatus('synced');
  };

  const signOut = async () => {
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.error(e);
      }
    }
    continueAsGuest();
  };

  // Cloud sync methods
  const saveUserDataToCloud = async (projects: Project[]): Promise<boolean> => {
    if (!currentUser || currentUser.isGuest) return false;
    setSyncStatus('saving');

    // 1. Save to Firestore if available
    if (db) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
          projects,
          updatedAt: Date.now(),
          email: currentUser.email,
        }, { merge: true });
        setSyncStatus('synced');
        return true;
      } catch (e) {
        console.warn('Firestore cloud save error:', e);
      }
    }

    // 2. Persist to account workspace backup
    try {
      localStorage.setItem(`kitsune_user_projects_${currentUser.uid}`, JSON.stringify(projects));
      setSyncStatus('synced');
      return true;
    } catch {
      setSyncStatus('offline');
      return false;
    }
  };

  const loadUserDataFromCloud = async (): Promise<Project[] | null> => {
    if (!currentUser || currentUser.isGuest) return null;

    if (db) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists() && snap.data().projects) {
          return snap.data().projects as Project[];
        }
      } catch (e) {
        console.warn('Firestore cloud load error:', e);
      }
    }

    try {
      const saved = localStorage.getItem(`kitsune_user_projects_${currentUser.uid}`);
      if (saved) return JSON.parse(saved);
    } catch {}

    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        syncStatus,
        setSyncStatus,
        signUp,
        signIn,
        signInWithGoogle,
        continueAsGuest,
        signOut,
        saveUserDataToCloud,
        loadUserDataFromCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
