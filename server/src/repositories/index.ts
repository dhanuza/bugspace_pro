/**
 * Shared singleton repository instances.
 *
 * IMPORTANT: Always import repositories from here — never `new XyzRepository()`
 * directly inside a controller or service. This ensures all modules share the
 * same in-memory state and makes the swap to Firestore (Sprint 3) a one-line
 * change per export.
 */
import { InMemoryProgramRepository } from "./InMemoryProgramRepository.js";
import { InMemoryReportRepository } from "./InMemoryReportRepository.js";
import { InMemoryUserRepository } from "./InMemoryUserRepository.js";
import { InMemoryOrganizationRepository } from "./InMemoryOrganizationRepository.js";
import { InMemoryAuditLogRepository } from "./InMemoryAuditLogRepository.js";
import { FirestoreUserRepository } from "./FirestoreUserRepository.js";
import { FirestoreOrganizationRepository } from "./FirestoreOrganizationRepository.js";
import { FirestoreAuditLogRepository } from "./FirestoreAuditLogRepository.js";

export const programRepo = new InMemoryProgramRepository();
export const reportRepo = new InMemoryReportRepository();
export const userRepo = new FirestoreUserRepository(); // ✅ Using Firestore
export const orgRepo = new FirestoreOrganizationRepository(); // ✅ Using Firestore
export const auditLogRepo = new FirestoreAuditLogRepository(); // ✅ Using Firestore

