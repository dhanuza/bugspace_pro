/**
 * Auth store — Zustand
 *
 * Holds both the raw Firebase User (identity) and the App User (role + orgId
 * fetched from the backend). This separation is intentional:
 *
 *   firebaseUser  → who you are (Google identity, email, photo)
 *   appUser       → what you can do (role, orgId — from our backend DB)
 *
 * The `onAuthChange` listener is initialized once in `AuthProvider` and
 * drives all state transitions here.
 */
import React, { useEffect } from "react";
import { create } from "zustand";
import type { User as FirebaseUser } from "firebase/auth";
import { signInWithGoogle, signOut, onAuthChange, getIdToken } from "../lib/googleAuth";
import type { User } from "../types";
import { api } from "../services/api";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, query, where, limit, getDocs } from "firebase/firestore";


interface AuthState {
  /** Firebase identity — set immediately on sign-in. */
  firebaseUser: FirebaseUser | null;
  /** App-level user (role + orgId) — fetched from backend after sign-in. */
  appUser: User | null;
  /** True while the initial auth check is in progress (prevents flash-of-login). */
  loading: boolean;
  /** Non-null if the last auth operation failed. */
  error: string | null;

  // ── Actions ────────────────────────────────────────────────────────────
  /** Trigger Google sign-in popup, then bootstrap the app user from the backend. */
  signInWithGoogle: () => Promise<void>;
  /** Sign the user out of Firebase and clear all local state. */
  signOut: () => Promise<void>;
  /**
   * Internal: called by AuthProvider whenever Firebase fires an auth change.
   * Fetches the app user from the backend if a Firebase user is present.
   */
  _onFirebaseAuthChange: (fbUser: FirebaseUser | null) => Promise<void>;
}

export const useAuth = create<AuthState>()((set) => ({
  firebaseUser: null,
  appUser: null,
  loading: true,   // start true — wait for Firebase to resolve on mount
  error: null,

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      // Firebase popup — resolves to the signed-in Firebase user.
      // The onAuthChange listener (mounted in AuthProvider) will handle
      // the subsequent backend call automatically.
      await signInWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign-in failed";
      set({ loading: false, error: message });
    }
  },



  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await signOut();
      set({ firebaseUser: null, appUser: null, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign-out failed";
      set({ loading: false, error: message });
    }
  },

  _onFirebaseAuthChange: async (fbUser) => {
    if (!fbUser) {
      set({ firebaseUser: null, appUser: null, loading: false });
      return;
    }

    set({ firebaseUser: fbUser, loading: true });

    try {
      // Get a fresh Firebase ID token.
      const idToken = await getIdToken();

      // Call backend to get (or create) the app-level user record.
      // The backend verifies the Firebase token and returns { user } with role + orgId.
      const { data } = await api.post<{ user: User }>("/auth/login", { idToken });
      const appUser = data.user;

      // If user has no role or status is inactive, they need approval
      if (!appUser.role || appUser.status === "inactive") {
        set({ appUser: null, firebaseUser: fbUser, loading: false, error: null });
        return;
      }

      set({ appUser, loading: false, error: null });
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || "Failed to load user profile";
      console.error("[Auth] Backend sync failed:", message);



      // Fallback: read role directly from Firestore if backend is unavailable (e.g. cold start)
      try {
        // 1st attempt: look up by Firebase UID (document ID)
        let userDocData: any = null;
        const byId = await getDoc(doc(db, "users", fbUser.uid));
        if (byId.exists()) {
          userDocData = byId.data();
        } else if (fbUser.email) {
          // 2nd attempt: query by email (UID may differ from doc ID in seeded data)
          const q = query(collection(db, "users"), where("email", "==", fbUser.email), limit(1));
          const snap = await getDocs(q);
          if (!snap.empty) userDocData = snap.docs[0].data();
        }

        if (userDocData && userDocData.role && userDocData.status !== "inactive") {
          const fallbackUser: User = {
            id: fbUser.uid,
            email: fbUser.email ?? "",
            name: fbUser.displayName ?? userDocData.name ?? "",
            role: userDocData.role,
            orgId: userDocData.orgId ?? "org-1",
            status: userDocData.status ?? "active",
          };
          console.log("[Auth] Firestore fallback succeeded, role:", fallbackUser.role);
          set({ appUser: fallbackUser, loading: false, error: null });
          return;
        }
      } catch (firestoreErr) {
        console.error("[Auth] Firestore fallback also failed:", firestoreErr);
      }

      set({ appUser: null, loading: false, error: message });
    }
  },
}));

// ── AuthProvider ──────────────────────────────────────────────────────────────

/**
 * AuthProvider — mounts the Firebase auth listener once on app startup.
 *
 * Place this high in the component tree (inside RootComponent in __root.tsx).
 * It has no visible output; it just subscribes to Firebase and drives the store.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProviderInner>{children}</AuthProviderInner>;
}

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const _onFirebaseAuthChange = useAuth((s) => s._onFirebaseAuthChange);

  useEffect(() => {
    const unsubscribe = onAuthChange(_onFirebaseAuthChange);
    return unsubscribe;
  }, [_onFirebaseAuthChange]);

  return <>{children}</>;
}