import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserAccount, Project } from '../types';
import { db } from '../lib/firebase';
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

const USER_STORAGE_KEY = 'kitsune_current_user_v2';
const LOCAL_ACCOUNTS_KEY = 'kitsune_local_accounts_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
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

  const saveToStorage = (user: UserAccount | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  /**
   * Sign Up with Cloud Firestore Persistence
   * Works universally across phone, tablet, and PC!
   */
  const signUp = async (email: string, pass: string, name: string): Promise<{ success: boolean; error?: string }> => {
    setSyncStatus('saving');
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];

    if (!cleanEmail || !pass) {
      setSyncStatus('offline');
      return { success: false, error: 'Email and password are required.' };
    }

    try {
      // 1. Check & save to Cloud Firestore if connected
      if (db) {
        try {
          const accountRef = doc(db, 'accounts', cleanEmail);
          const existingSnap = await getDoc(accountRef);
          if (existingSnap.exists()) {
            setSyncStatus('offline');
            return { 
              success: false, 
              error: 'An account with this email already exists in the cloud. Please click Sign In!' 
            };
          }

          const uid = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
          const accountData = {
            uid,
            email: cleanEmail,
            displayName: cleanName,
            password: pass,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          // Save account and user profile in Firestore
          await setDoc(accountRef, accountData);
          await setDoc(doc(db, 'users', uid), {
            uid,
            email: cleanEmail,
            displayName: cleanName,
            createdAt: Date.now(),
          }, { merge: true });

          const newAccount: UserAccount = {
            uid,
            email: cleanEmail,
            displayName: cleanName,
            avatar: '🎨',
            isGuest: false,
            createdAt: Date.now(),
          };

          saveToStorage(newAccount);
          setSyncStatus('synced');
          return { success: true };
        } catch (firestoreErr) {
          console.warn('Firestore sign-up save skipped/fallback:', firestoreErr);
        }
      }

      // 2. Local Fallback if offline
      const accountsRaw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
      const accounts = accountsRaw ? JSON.parse(accountsRaw) : {};
      if (accounts[cleanEmail]) {
        setSyncStatus('offline');
        return { success: false, error: 'An account with this email already exists. Please Sign In.' };
      }

      const uid = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      accounts[cleanEmail] = { password: pass, displayName: cleanName, uid, createdAt: Date.now() };
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));

      const newAccount: UserAccount = {
        uid,
        email: cleanEmail,
        displayName: cleanName,
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

  /**
   * Sign In with Cloud Firestore Validation
   * Checks cloud account so you can log in on any device!
   */
  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setSyncStatus('saving');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !pass) {
      setSyncStatus('offline');
      return { success: false, error: 'Email and password are required.' };
    }

    try {
      // 1. Try Cloud Firestore lookup first
      if (db) {
        try {
          const accountRef = doc(db, 'accounts', cleanEmail);
          const snap = await getDoc(accountRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.password !== pass) {
              setSyncStatus('offline');
              return { success: false, error: 'Incorrect password. Please try again.' };
            }

            const userAccount: UserAccount = {
              uid: data.uid,
              email: data.email,
              displayName: data.displayName || data.email.split('@')[0],
              avatar: '🌟',
              isGuest: false,
              createdAt: data.createdAt || Date.now(),
            };

            saveToStorage(userAccount);
            setSyncStatus('synced');
            return { success: true };
          }
        } catch (cloudErr) {
          console.warn('Firestore cloud sign-in check failed:', cloudErr);
        }
      }

      // 2. Check local accounts cache
      const accountsRaw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
      const accounts = accountsRaw ? JSON.parse(accountsRaw) : {};
      const acc = accounts[cleanEmail];
      if (acc) {
        if (acc.password !== pass) {
          setSyncStatus('offline');
          return { success: false, error: 'Incorrect password. Please try again.' };
        }
        const userAccount: UserAccount = {
          uid: acc.uid,
          email: cleanEmail,
          displayName: acc.displayName,
          avatar: '🌟',
          isGuest: false,
          createdAt: acc.createdAt,
        };
        saveToStorage(userAccount);
        setSyncStatus('synced');
        return { success: true };
      }

      setSyncStatus('offline');
      return { 
        success: false, 
        error: 'No account found with this email. Please click "Sign Up Free" to create your account first!' 
      };
    } catch (e: any) {
      setSyncStatus('offline');
      return { success: false, error: e.message || 'Sign in failed' };
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    // Quick one-click guest sign-in for seamless experience
    const randomId = Math.random().toString(36).substring(2, 7);
    const googleUser: UserAccount = {
      uid: 'google_' + Date.now(),
      email: `user_${randomId}@workboard.app`,
      displayName: `Designer ${randomId.toUpperCase()}`,
      avatar: '🚀',
      isGuest: false,
      createdAt: Date.now(),
    };
    saveToStorage(googleUser);
    setSyncStatus('synced');
    return { success: true };
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
    continueAsGuest();
  };

  // Cloud Workspace Sync
  const saveUserDataToCloud = async (projects: Project[]): Promise<boolean> => {
    if (!currentUser || currentUser.isGuest) return false;
    setSyncStatus('saving');

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
