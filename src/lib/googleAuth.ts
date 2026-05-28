/**
 * Firebase Auth helpers.
 *
 * These are thin wrappers around Firebase Auth so that the rest of the app
 * imports from here rather than directly from "firebase/auth". This makes it
 * easy to swap providers or add custom logic without touching every caller.
 */
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onIdTokenChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { firebaseAuth } from "./firebase";

const googleProvider = new GoogleAuthProvider();
// Request the user's profile and email scopes.
googleProvider.addScope("profile");
googleProvider.addScope("email");

/**
 * Open a Google sign-in popup and return the Firebase User on success.
 * Throws on cancellation or error.
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(firebaseAuth, googleProvider);
  return result.user;
}



/**
 * Sign the current user out of Firebase.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(firebaseAuth);
}

/**
 * Get a fresh Firebase ID token for the currently signed-in user.
 * Firebase refreshes tokens automatically; this always returns a valid token.
 * Returns null if nobody is signed in.
 */
export async function getIdToken(): Promise<string | null> {
  const user = firebaseAuth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

/**
 * Subscribe to Firebase auth state + token-refresh events.
 * `onIdTokenChanged` fires on login, logout, AND automatic token refresh
 * (every hour), making it the correct hook for keeping API tokens fresh.
 *
 * Returns the unsubscribe function.
 */
export function onAuthChange(
  callback: (user: FirebaseUser | null) => void,
): () => void {
  return onIdTokenChanged(firebaseAuth, callback);
}
