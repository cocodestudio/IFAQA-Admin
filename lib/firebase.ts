import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD6lY5cLdxzSnr0RXCg3n8z8fAU97PFdYY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ifaqa-herbal-remedies.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ifaqa-herbal-remedies",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ifaqa-herbal-remedies.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "307628607004",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:307628607004:web:4b8533bb0f06de973841d9",
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

export const isMockFallback = false;

export function getFirebaseApp(): FirebaseApp | null {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      console.warn('Firebase init notice:', e);
      return null;
    }
  } else {
    app = getApp();
  }
  return app;
}

export function getFirestoreDb(): Firestore | null {
  if (db) return db;
  const currentApp = getFirebaseApp();
  if (currentApp) {
    try {
      db = getFirestore(currentApp);
    } catch (e) {
      console.warn('Firestore init notice:', e);
      return null;
    }
  }
  return db;
}

export function getFirebaseAuth(): Auth | null {
  if (auth) return auth;
  const currentApp = getFirebaseApp();
  if (currentApp) {
    try {
      auth = getAuth(currentApp);
    } catch (e) {
      console.warn('Auth init notice:', e);
      return null;
    }
  }
  return auth;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  if (storage) return storage;
  const currentApp = getFirebaseApp();
  if (currentApp) {
    try {
      storage = getStorage(currentApp);
    } catch (e) {
      console.warn('Storage init notice:', e);
      return null;
    }
  }
  return storage;
}
