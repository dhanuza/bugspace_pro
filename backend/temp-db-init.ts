/**
 * Firebase Firestore Database Initializer
 * 
 * This script initializes Firestore with sample data for all collections.
 * 
 * USAGE:
 *   1. Make sure firebase-admin is installed: npm install firebase-admin
 *   2. Make sure server/.env has Firebase credentials
 *   3. Run: npx ts-node temp-db-init.ts
 *   4. Check Firebase Console → Firestore Database
 * 
 * WHAT IT DOES:
 *   - Creates organizations collection
 *   - Creates users collection
 *   - Creates programs collection
 *   - Creates reports collection
 *   - Creates reports/{reportId}/comments subcollection
 *   - Creates notifications collection
 *   - Creates audit_logs collection
 */

import admin from "firebase-admin";
import * as dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: resolve(__dirname, ".env") });

// Initialize Firebase Admin SDK
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Missing Firebase credentials in server/.env");
  console.error("Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
});

const db = admin.firestore();

console.log("🔥 Firebase Admin SDK initialized");
console.log("📦 Starting database initialization...\n");

// ============================================================================
// SAMPLE DATA
// ============================================================================

const organizations = [
  {
    id: "org-1",
    name: "Acme Corporation",
    domain: "acme.com",
    description: "Leading technology company",
    status: "active",
    createdAt: new Date("2024-01-15").toISOString(),
    createdBy: "system",
  },
  {
    id: "org-2",
    name: "TechStart Inc",
    domain: "techstart.io",
    description: "Innovative startup",
    status: "active",
    createdAt: new Date("2024-02-20").toISOString(),
    createdBy: "system",
  },
  {
    id: "org-3",
    name: "SecureBank",
    domain: "securebank.com",
    description: "Financial services provider",
    status: "active",
    createdAt: new Date("2024-03-10").toISOString(),
    createdBy: "system",
  },
];

const users = [
  // Admin user - matches Firebase Authentication admin@gmail.com
  {
    id: "0ZCFRFcaQyc1EeRztCIaqbyqiPs2",
    name: "Admin User",
    email: "admin@gmail.com",
    role: "admin",
    orgId: "org-1",
    createdAt: new Date("2024-01-15").toISOString(),
  },
  // Org-1 Users
  {
    id: "u-admin-1",
    name: "Alice Admin",
    email: "alice@acme.com",
    role: "admin",
    orgId: "org-1",
    createdAt: new Date("2024-01-15").toISOString(),
  },
  {
    id: "u-manager-1",
    name: "Bob Manager",
    email: "bob@acme.com",
    role: "manager",
    orgId: "org-1",
    createdAt: new Date("2024-01-16").toISOString(),
  },
  {
    id: "u-researcher-1",
    name: "Charlie Researcher",
    email: "charlie@acme.com",
    role: "researcher",
    orgId: "org-1",
    createdAt: new Date("2024-01-17").toISOString(),
  },
  {
    id: "u-employee-1",
    name: "Diana Employee",
    email: "diana@acme.com",
    role: "employee",
    orgId: "org-1",
    createdAt: new Date("2024-01-18").toISOString(),
  },
  // Org-2 Users
  {
    id: "u-admin-2",
    name: "Eve Admin",
    email: "eve@techstart.io",
    role: "admin",
    orgId: "org-2",
    createdAt: new Date("2024-02-20").toISOString(),
  },
  {
    id: "u-manager-2",
    name: "Frank Manager",
    email: "frank@techstart.io",
    role: "manager",
    orgId: "org-2",
    createdAt: new Date("2024-02-21").toISOString(),
  },
  // Org-3 Users
  {
    id: "u-admin-3",
    name: "Grace Admin",
    email: "grace@securebank.com",
    role: "admin",
    orgId: "org-3",
    createdAt: new Date("2024-03-10").toISOString(),
  },
];

const programs = [
  // Org-1 Programs
  {
    id: "prog-1",
    name: "Web Application Security",
    scope: "All web applications and APIs",
    active: true,
    orgId: "org-1",
  },
  {
    id: "prog-2",
    name: "Mobile App Security",
    scope: "iOS and Android applications",
    active: true,
    orgId: "org-1",
  },
  {
    id: "prog-3",
    name: "Infrastructure Security",
    scope: "Cloud infrastructure and network security",
    active: false,
    orgId: "org-1",
  },
  // Org-2 Programs
  {
    id: "prog-4",
    name: "API Security Program",
    scope: "REST and GraphQL APIs",
    active: true,
    orgId: "org-2",
  },
  // Org-3 Programs
  {
    id: "prog-5",
    name: "Banking Platform Security",
    scope: "Core banking systems",
    active: true,
    orgId: "org-3",
  },
];

const reports = [
  // Org-1 Reports
  {
    id: "report-1",
    title: "SQL Injection in Login Form",
    programId: "prog-1",
    programName: "Web Application Security",
    severity: "critical",
    status: "Triaged",
    reporterId: "u-researcher-1",
    reporterName: "Charlie Researcher",
    description: "Found SQL injection vulnerability in the login form that allows authentication bypass.",
    createdAt: new Date("2024-04-01").toISOString(),
    orgId: "org-1",
  },
  {
    id: "report-2",
    title: "XSS in User Profile Page",
    programId: "prog-1",
    programName: "Web Application Security",
    severity: "high",
    status: "Valid",
    reporterId: "u-researcher-1",
    reporterName: "Charlie Researcher",
    description: "Stored XSS vulnerability in user profile bio field.",
    createdAt: new Date("2024-04-05").toISOString(),
    orgId: "org-1",
  },
  {
    id: "report-3",
    title: "Insecure Direct Object Reference",
    programId: "prog-1",
    programName: "Web Application Security",
    severity: "medium",
    status: "Needs Info",
    reporterId: "u-researcher-1",
    reporterName: "Charlie Researcher",
    description: "Users can access other users' documents by changing the document ID in the URL.",
    createdAt: new Date("2024-04-10").toISOString(),
    orgId: "org-1",
  },
  {
    id: "report-4",
    title: "Weak Password Policy",
    programId: "prog-1",
    programName: "Web Application Security",
    severity: "low",
    status: "New",
    reporterId: "u-researcher-1",
    reporterName: "Charlie Researcher",
    description: "Password policy allows weak passwords with only 6 characters.",
    createdAt: new Date("2024-04-15").toISOString(),
    orgId: "org-1",
  },
  {
    id: "report-5",
    title: "Insecure Data Storage in Mobile App",
    programId: "prog-2",
    programName: "Mobile App Security",
    severity: "high",
    status: "Triaged",
    reporterId: "u-researcher-1",
    reporterName: "Charlie Researcher",
    description: "Sensitive data stored in plain text in local storage.",
    createdAt: new Date("2024-04-20").toISOString(),
    orgId: "org-1",
  },
  // Org-2 Reports
  {
    id: "report-6",
    title: "API Rate Limiting Bypass",
    programId: "prog-4",
    programName: "API Security Program",
    severity: "medium",
    status: "Valid",
    reporterId: "u-manager-2",
    reporterName: "Frank Manager",
    description: "Rate limiting can be bypassed by changing the User-Agent header.",
    createdAt: new Date("2024-04-25").toISOString(),
    orgId: "org-2",
  },
  // Org-3 Reports
  {
    id: "report-7",
    title: "Authentication Token Exposure",
    programId: "prog-5",
    programName: "Banking Platform Security",
    severity: "critical",
    status: "Triaged",
    reporterId: "u-admin-3",
    reporterName: "Grace Admin",
    description: "Authentication tokens exposed in browser console logs.",
    createdAt: new Date("2024-04-28").toISOString(),
    orgId: "org-3",
  },
];

const comments = [
  // Comments for report-1
  {
    id: "comment-1",
    reportId: "report-1",
    authorId: "u-manager-1",
    authorName: "Bob Manager",
    body: "This is a critical issue. We need to fix this immediately.",
    createdAt: new Date("2024-04-02T10:30:00").toISOString(),
    orgId: "org-1",
  },
  {
    id: "comment-2",
    reportId: "report-1",
    authorId: "u-researcher-1",
    authorName: "Charlie Researcher",
    body: "I've attached a proof of concept demonstrating the vulnerability.",
    createdAt: new Date("2024-04-02T14:15:00").toISOString(),
    orgId: "org-1",
  },
  {
    id: "comment-3",
    reportId: "report-1",
    authorId: "u-admin-1",
    authorName: "Alice Admin",
    body: "Assigned to the security team. ETA for fix: 48 hours.",
    createdAt: new Date("2024-04-03T09:00:00").toISOString(),
    orgId: "org-1",
  },
  // Comments for report-2
  {
    id: "comment-4",
    reportId: "report-2",
    authorId: "u-manager-1",
    authorName: "Bob Manager",
    body: "Can you provide steps to reproduce?",
    createdAt: new Date("2024-04-06T11:20:00").toISOString(),
    orgId: "org-1",
  },
  {
    id: "comment-5",
    reportId: "report-2",
    authorId: "u-researcher-1",
    authorName: "Charlie Researcher",
    body: "Sure! 1. Go to profile page 2. Enter <script>alert('XSS')</script> in bio 3. Save and reload",
    createdAt: new Date("2024-04-06T15:45:00").toISOString(),
    orgId: "org-1",
  },
  // Comments for report-3
  {
    id: "comment-6",
    reportId: "report-3",
    authorId: "u-manager-1",
    authorName: "Bob Manager",
    body: "We need more information about which endpoints are affected.",
    createdAt: new Date("2024-04-11T10:00:00").toISOString(),
    orgId: "org-1",
  },
];

const notifications = [
  {
    id: "notif-1",
    userId: "u-manager-1",
    type: "new_report",
    title: "New Critical Report",
    message: "A new critical severity report has been submitted",
    reportId: "report-1",
    read: false,
    createdAt: new Date("2024-04-01T09:00:00").toISOString(),
    orgId: "org-1",
  },
  {
    id: "notif-2",
    userId: "u-admin-1",
    type: "status_change",
    title: "Report Status Changed",
    message: "Report #1 status changed to Triaged",
    reportId: "report-1",
    read: true,
    createdAt: new Date("2024-04-02T10:00:00").toISOString(),
    orgId: "org-1",
  },
  {
    id: "notif-3",
    userId: "u-researcher-1",
    type: "comment",
    title: "New Comment on Your Report",
    message: "Bob Manager commented on your report",
    reportId: "report-1",
    read: false,
    createdAt: new Date("2024-04-02T10:30:00").toISOString(),
    orgId: "org-1",
  },
];

const auditLogs = [
  {
    id: "audit-1",
    orgId: "org-1",
    actorId: "u-admin-1",
    actorName: "Alice Admin",
    action: "create",
    targetType: "organization",
    targetId: "org-1",
    targetName: "Acme Corporation",
    metadata: { status: "active" },
    createdAt: new Date("2024-01-15T08:00:00").toISOString(),
  },
  {
    id: "audit-2",
    orgId: "org-1",
    actorId: "u-admin-1",
    actorName: "Alice Admin",
    action: "create",
    targetType: "user",
    targetId: "u-manager-1",
    targetName: "Bob Manager",
    metadata: { role: "manager" },
    createdAt: new Date("2024-01-16T09:00:00").toISOString(),
  },
  {
    id: "audit-3",
    orgId: "org-1",
    actorId: "u-manager-1",
    actorName: "Bob Manager",
    action: "create",
    targetType: "program",
    targetId: "prog-1",
    targetName: "Web Application Security",
    metadata: { active: true },
    createdAt: new Date("2024-01-20T10:00:00").toISOString(),
  },
  {
    id: "audit-4",
    orgId: "org-1",
    actorId: "u-researcher-1",
    actorName: "Charlie Researcher",
    action: "create",
    targetType: "report",
    targetId: "report-1",
    targetName: "SQL Injection in Login Form",
    metadata: { severity: "critical" },
    createdAt: new Date("2024-04-01T09:00:00").toISOString(),
  },
  {
    id: "audit-5",
    orgId: "org-1",
    actorId: "u-manager-1",
    actorName: "Bob Manager",
    action: "update",
    targetType: "report",
    targetId: "report-1",
    targetName: "SQL Injection in Login Form",
    metadata: { status: "New → Triaged" },
    createdAt: new Date("2024-04-02T10:00:00").toISOString(),
  },
  {
    id: "audit-6",
    orgId: "org-1",
    actorId: "u-admin-1",
    actorName: "Alice Admin",
    action: "update",
    targetType: "user",
    targetId: "u-employee-1",
    targetName: "Diana Employee",
    metadata: { role: "employee → researcher" },
    createdAt: new Date("2024-04-10T11:00:00").toISOString(),
  },
];

// ============================================================================
// DATABASE INITIALIZATION FUNCTIONS
// ============================================================================

async function initializeOrganizations() {
  console.log("📁 Creating organizations collection...");
  const batch = db.batch();
  
  for (const org of organizations) {
    const docRef = db.collection("organizations").doc(org.id);
    batch.set(docRef, org);
  }
  
  await batch.commit();
  console.log(`✅ Created ${organizations.length} organizations`);
}

async function initializeUsers() {
  console.log("👥 Creating users collection...");
  const batch = db.batch();
  
  for (const user of users) {
    const docRef = db.collection("users").doc(user.id);
    batch.set(docRef, user);
  }
  
  await batch.commit();
  console.log(`✅ Created ${users.length} users`);
}

async function initializePrograms() {
  console.log("🎯 Creating programs collection...");
  const batch = db.batch();
  
  for (const program of programs) {
    const docRef = db.collection("programs").doc(program.id);
    batch.set(docRef, program);
  }
  
  await batch.commit();
  console.log(`✅ Created ${programs.length} programs`);
}

async function initializeReports() {
  console.log("📝 Creating reports collection...");
  const batch = db.batch();
  
  for (const report of reports) {
    const docRef = db.collection("reports").doc(report.id);
    batch.set(docRef, report);
  }
  
  await batch.commit();
  console.log(`✅ Created ${reports.length} reports`);
}

async function initializeComments() {
  console.log("💬 Creating comments subcollections...");
  
  // Group comments by reportId
  const commentsByReport = comments.reduce((acc, comment) => {
    if (!acc[comment.reportId]) {
      acc[comment.reportId] = [];
    }
    acc[comment.reportId].push(comment);
    return acc;
  }, {} as Record<string, typeof comments>);
  
  // Create comments for each report
  for (const [reportId, reportComments] of Object.entries(commentsByReport)) {
    const batch = db.batch();
    
    for (const comment of reportComments) {
      const docRef = db
        .collection("reports")
        .doc(reportId)
        .collection("comments")
        .doc(comment.id);
      batch.set(docRef, comment);
    }
    
    await batch.commit();
    console.log(`✅ Created ${reportComments.length} comments for ${reportId}`);
  }
}

async function initializeNotifications() {
  console.log("🔔 Creating notifications collection...");
  const batch = db.batch();
  
  for (const notification of notifications) {
    const docRef = db.collection("notifications").doc(notification.id);
    batch.set(docRef, notification);
  }
  
  await batch.commit();
  console.log(`✅ Created ${notifications.length} notifications`);
}

async function initializeAuditLogs() {
  console.log("📋 Creating audit_logs collection...");
  const batch = db.batch();
  
  for (const log of auditLogs) {
    const docRef = db.collection("audit_logs").doc(log.id);
    batch.set(docRef, log);
  }
  
  await batch.commit();
  console.log(`✅ Created ${auditLogs.length} audit logs`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  try {
    await initializeOrganizations();
    await initializeUsers();
    await initializePrograms();
    await initializeReports();
    await initializeComments();
    await initializeNotifications();
    await initializeAuditLogs();
    
    console.log("\n🎉 Database initialization completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - ${organizations.length} organizations`);
    console.log(`   - ${users.length} users`);
    console.log(`   - ${programs.length} programs`);
    console.log(`   - ${reports.length} reports`);
    console.log(`   - ${comments.length} comments`);
    console.log(`   - ${notifications.length} notifications`);
    console.log(`   - ${auditLogs.length} audit logs`);
    console.log("\n🔥 Check Firebase Console → Firestore Database to see your data!");
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error during initialization:", error);
    process.exit(1);
  }
}

main();
