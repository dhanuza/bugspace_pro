/**
 * Add test users to see in admin dashboard
 */

import admin from "firebase-admin";
import * as dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, ".env") });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Missing Firebase credentials");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
});

const db = admin.firestore();

async function addTestUsers() {
  try {
    console.log("📝 Adding test users...\n");

    // Add some regular users with roles
    const regularUsers = [
      {
        id: "test-user-1",
        name: "John Manager",
        email: "john@example.com",
        role: "manager",
        orgId: "org-1",
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: "test-user-2",
        name: "Sarah Researcher",
        email: "sarah@example.com",
        role: "researcher",
        orgId: "org-1",
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: "test-user-3",
        name: "Mike Employee",
        email: "mike@example.com",
        role: "employee",
        orgId: "org-1",
        status: "active",
        createdAt: new Date().toISOString(),
      },
    ];

    // Add some pending users (no role assigned yet)
    const pendingUsers = [
      {
        id: "pending-user-1",
        name: "Alice Pending",
        email: "alice@example.com",
        role: null, // No role assigned
        orgId: "org-1",
        status: "inactive",
        createdAt: new Date().toISOString(),
      },
      {
        id: "pending-user-2",
        name: "Bob Waiting",
        email: "bob@example.com",
        role: null, // No role assigned
        orgId: "org-1",
        status: "inactive",
        createdAt: new Date().toISOString(),
      },
    ];

    // Add regular users
    for (const user of regularUsers) {
      await db.collection("users").doc(user.id).set(user);
      console.log(`✅ Added user: ${user.name} (${user.role})`);
    }

    // Add pending users
    for (const user of pendingUsers) {
      await db.collection("users").doc(user.id).set(user);
      console.log(`⏳ Added pending user: ${user.name} (waiting approval)`);
    }

    console.log("\n🎉 Test users added successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - ${regularUsers.length} users with roles`);
    console.log(`   - ${pendingUsers.length} pending approval`);
    console.log("\n💡 Refresh your admin dashboard to see them!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

addTestUsers();
