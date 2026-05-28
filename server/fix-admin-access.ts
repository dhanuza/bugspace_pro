import admin from "firebase-admin";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from the .env file in the current directory
dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Missing Firebase configuration in .env");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  }),
});

const db = admin.firestore();

async function promoteUser(email: string) {
  console.log(`🔍 Searching for user with email: ${email}...`);
  
  const snapshot = await db.collection("users").where("email", "==", email).get();
  
  if (snapshot.empty) {
    console.error(`❌ No user found with email ${email}. Please login once on localhost first to create the record.`);
    process.exit(1);
  }

  console.log(`✅ Found ${snapshot.size} record(s). Updating all to Admin...`);

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, {
      role: "admin",
      status: "active",
      updatedAt: new Date().toISOString()
    });
  });

  await batch.commit();
  console.log(`🚀 Success! ${email} is now an active admin on all matching records.`);
  process.exit(0);
}

const targetEmail = process.argv[2] || "admin@gmail.com";
promoteUser(targetEmail).catch((err) => {
  console.error("💥 Error promoting user:", err);
  process.exit(1);
});
