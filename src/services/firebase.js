// ============================================================
// Firebase Integration for CampusTraceWeb
// 100% Free Tier ($0 - Spark Plan)
// Uses Cloud Firestore for real-time items, claims, disputes, and messages
// Zero credit card required!
// ============================================================

import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  setDoc,
  deleteDoc,
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { compressAndFormatImage } from './imageCompressor';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

export const isFirebaseLive = () => {
  return !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.apiKey.length > 10;
};

let app = null;
let db = null;

if (isFirebaseLive()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
  } catch (err) {
    console.warn("Firebase initialization notice:", err);
  }
}

// Zero-cost image handler: compresses photos to lightweight Base64 stored in Firestore ($0 Cost)
export const processZeroCostPhoto = async (photoDataUrlOrFile) => {
  try {
    return await compressAndFormatImage(photoDataUrlOrFile, 800, 0.72);
  } catch (err) {
    console.error("Zero cost compression failed, using source:", err);
    return photoDataUrlOrFile;
  }
};

export { 
  app, 
  db, 
  collection, 
  addDoc, 
  updateDoc, 
  setDoc,
  deleteDoc,
  doc, 
  onSnapshot, 
  query, 
  orderBy 
};
