/**
 * Shared singleton repository instances.
 *
 * IMPORTANT: Always import repositories from here — never `new XyzRepository()`
 * directly inside a controller or service. This ensures all modules share the
 * same in-memory state and makes the swap to Firestore (Sprint 3) a one-line
 * change per export.
 *
 * Currently using InMemory repos for all data — works without Firebase Admin credentials.
 * Switch to Firestore repos once service account credentials are configured in server/.env
 */
import { FirestoreUserRepository } from "./FirestoreUserRepository.js";
import { FirestoreOrganizationRepository } from "./FirestoreOrganizationRepository.js";
import { FirestoreAuditLogRepository } from "./FirestoreAuditLogRepository.js";
import { FirestoreProgramRepository } from "./FirestoreProgramRepository.js";
import { FirestoreReportRepository } from "./FirestoreReportRepository.js";
import { FirestoreNotificationRepository } from "./FirestoreNotificationRepository.js";
import { FirestoreInviteRepository } from "./FirestoreInviteRepository.js";

export const programRepo = new FirestoreProgramRepository();
export const reportRepo = new FirestoreReportRepository();
export const userRepo = new FirestoreUserRepository();
export const orgRepo = new FirestoreOrganizationRepository();
export const auditLogRepo = new FirestoreAuditLogRepository();
export const notificationRepo = new FirestoreNotificationRepository();
export const inviteRepo = new FirestoreInviteRepository();
