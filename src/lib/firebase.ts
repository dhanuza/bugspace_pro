/**
 * Firebase Web SDK — App, Auth & Firestore initialization.
 *
 * Firestore is used as a fallback when the backend API is unavailable
 * (e.g. cold start on free-tier hosting). All primary data access
 * should still go through the backend API.
 */
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
console.log("API KEY:", import.meta.env.VITE_FIREBASE_API_KEY);
// Guard against re-initialization in dev HMR or SSR environments.

let app;

try {
  app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];
} catch (error) {
  console.error("Firebase Init Error:", error);
}


export const firebaseAuth = getAuth(app);
export const db = getFirestore(app);
export default app;
