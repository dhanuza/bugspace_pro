/**
 * Firebase Admin SDK initialization.
 *
 * Reads credentials from environment variables. Set these in server/.env:
 *
 *   FIREBASE_PROJECT_ID=bugspacepro-27bb3
 *   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@bugspacepro-27bb3.iam.gserviceaccount.com
 *   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 *
 * The SDK is initialized once (guarded against re-init in dev hot-reload).
 * Exports `adminAuth` for use in middleware and `adminApp` if needed elsewhere.
 */
import admin from "firebase-admin";

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
    console.log("[Firebase Admin] Initialized with service account credentials.");
  } else {
    // Development fallback — the SDK is initialized without credentials.
    // verifyToken will use demo mode (see middleware/verifyToken.ts).
    console.warn(
      "[Firebase Admin] Missing credentials — running in demo/stub mode. " +
      "Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in server/.env."
    );
    admin.initializeApp({ projectId: projectId ?? "bugspacepro-27bb3" });
  }
}

export const adminAuth = admin.auth();
export default admin;
