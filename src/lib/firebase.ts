import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase project configuration for workboard-cc7e9
const firebaseConfig = {
  apiKey: "AIzaSyDPxK61RqCSn1MBJhm7QKv_CRIhwfoptXc",
  authDomain: "workboard-cc7e9.firebaseapp.com",
  projectId: "workboard-cc7e9",
  storageBucket: "workboard-cc7e9.firebasestorage.app",
  messagingSenderId: "1021346871936",
  appId: "1:1021346871936:web:91309cb499aa3d4305c465",
  measurementId: "G-2EB6H8MNVW"
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let authInstance: ReturnType<typeof getAuth> | null = null;
try {
  authInstance = getAuth(app);
} catch {
  // Graceful fallback if auth isn't enabled in console yet
  authInstance = null;
}

let dbInstance: ReturnType<typeof getFirestore> | null = null;
try {
  dbInstance = getFirestore(app);
} catch {
  // Graceful fallback if firestore isn't enabled in console yet
  dbInstance = null;
}

export const auth = authInstance;
export const db = dbInstance;
export { firebaseConfig };
