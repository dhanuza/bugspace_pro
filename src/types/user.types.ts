/**
 * Extended user schema for Bugspace Pro.
 * This file holds the canonical frontend User type with all fields.
 * Import from here for user-specific features; import from "./" for shared types.
 */
import type { Role } from "./index";

export type UserStatus = "active" | "inactive" | "suspended";

export interface AppUser {
  /** Firebase UID — also used as the primary DB key. */
  uid: string;
  /** Organisation this user belongs to. */
  orgId: string;
  /** Display name (from Google profile or admin-set). */
  name: string;
  /** Email address. */
  email: string;
  /** RBAC role within the organisation. */
  role: Role;
  /** Google profile photo URL (may be null for non-Google accounts). */
  photoURL: string | null;
  /** Whether the user account is active, inactive, or suspended. */
  status: UserStatus;
  /** ISO 8601 timestamp of account creation. */
  createdAt: string;
}

/** Partial update payload for PATCH /api/users/:id/role */
export interface UpdateRolePayload {
  role: Role;
}

/** Shape returned by GET /api/users */
export type UserListResponse = AppUser[];
