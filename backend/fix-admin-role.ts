/**
 * Quick script to update admin@gmail.com user role to admin
 * 
 * Run this after logging in once to fix the role issue
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

async function fixAdminRole() {
  try {
    console.log("🔍 Looking for admin@gmail.com user...");
    
    // Get all users and find admin@gmail.com
    const usersSnapshot = await db.collection("users").get();
    
    let adminUser = null;
    usersSnapshot.forEach((doc) => {
      const user = doc.data();
      if (user.email === "admin@gmail.com") {
        adminUser = { id: doc.id, ...user };
      }
    });

    if (!adminUser) {
      console.log("❌ User admin@gmail.com not found in database");
      console.log("💡 Please login once first, then run this script");
      process.exit(1);
    }

    console.log(`✅ Found user: ${adminUser.email}`);
    console.log(`   Current role: ${adminUser.role}`);
    console.log(`   User ID: ${adminUser.id}`);

    if (adminUser.role === "admin") {
      console.log("✅ User already has admin role!");
      process.exit(0);
    }

    // Update role to admin
    await db.collection("users").doc(adminUser.id).update({
      role: "admin",
    });

    console.log("✅ Successfully updated role to admin!");
    console.log("🎉 You can now login and access the admin dashboard");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixAdminRole();
