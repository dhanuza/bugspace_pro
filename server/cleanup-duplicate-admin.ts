/**
 * Cleanup script to remove duplicate admin users
 * Keeps only the user with admin role
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

async function cleanupDuplicates() {
  try {
    console.log("🔍 Looking for admin@gmail.com users...");
    
    const usersSnapshot = await db.collection("users").get();
    
    const adminUsers: any[] = [];
    usersSnapshot.forEach((doc) => {
      const user = doc.data();
      if (user.email === "admin@gmail.com") {
        adminUsers.push({ docId: doc.id, ...user });
      }
    });

    console.log(`\n📊 Found ${adminUsers.length} user(s) with email admin@gmail.com:\n`);
    
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. Document ID: ${user.docId}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   OrgId: ${user.orgId}\n`);
    });

    if (adminUsers.length === 0) {
      console.log("❌ No admin@gmail.com users found!");
      process.exit(1);
    }

    if (adminUsers.length === 1) {
      console.log("✅ Only one user found. Checking role...");
      if (adminUsers[0].role === "admin") {
        console.log("✅ User already has admin role!");
      } else {
        console.log(`⚠️  User has role: ${adminUsers[0].role}`);
        console.log("🔧 Updating to admin...");
        await db.collection("users").doc(adminUsers[0].docId).update({ role: "admin" });
        console.log("✅ Updated to admin role!");
      }
      process.exit(0);
    }

    // Multiple users found - keep the one with admin role
    const adminUser = adminUsers.find(u => u.role === "admin");
    const employeeUsers = adminUsers.filter(u => u.role !== "admin");

    if (!adminUser) {
      console.log("❌ No user with admin role found!");
      console.log("💡 Please run temp-db-init.ts first");
      process.exit(1);
    }

    console.log(`🗑️  Deleting ${employeeUsers.length} duplicate user(s)...\n`);
    
    for (const user of employeeUsers) {
      console.log(`   Deleting: ${user.docId} (role: ${user.role})`);
      await db.collection("users").doc(user.docId).delete();
    }

    console.log("\n✅ Cleanup complete!");
    console.log(`✅ Kept user: ${adminUser.docId} with role: admin`);
    console.log("\n🎉 You can now login and access the admin dashboard");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

cleanupDuplicates();
