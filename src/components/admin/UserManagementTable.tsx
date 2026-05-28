/**
 * UserManagementTable — admin-only user management dashboard.
 *
 * Features:
 * - Fetches users from GET /api/users
 * - Role badge display
 * - Inline role update via PATCH /api/users/:id/role
 * - Delete via DELETE /api/users/:id (with confirmation modal)
 * - Search by name/email
 * - Skeleton loading state
 */
import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import type { User, Role, Organization } from "../../types";
import { RoleBadge } from "./RoleBadge";
import { ConfirmModal } from "./ConfirmModal";
import { AddUserModal } from "./AddUserModal";
import { useAuth } from "../../store/auth";
import { Button } from "../ui/button";
import { Search, RefreshCw, Trash2, ShieldCheck, Power, ChevronLeft, ChevronRight, UserPlus } from "lucide-react";

const ROLES: Role[] = ["admin", "manager", "researcher", "employee"];
const ITEMS_PER_PAGE = 5;

function SkeletonRow() {
  return (
    <tr className="border-t border-border animate-pulse">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-muted rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export function UserManagementTable() {
  const { appUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [updatingOrg, setUpdatingOrg] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: userData }, { data: orgData }] = await Promise.all([
        api.get<User[]>("/users"),
        api.get<Organization[]>("/organizations")
      ]);
      setUsers(userData);
      setOrganizations(orgData);
    } catch {
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId: string, role: Role) => {
    setUpdatingRole(userId);
    try {
      const { data } = await api.patch<User>(`/users/${userId}/role`, { role });
      setUsers((prev) => prev.map((u) => u.id === userId ? data : u));
    } catch {
      alert("Failed to update role.");
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleOrgChange = async (userId: string, orgId: string) => {
    setUpdatingOrg(userId);
    try {
      await api.patch(`/users/${userId}/org`, { orgId });
      setUsers(users.map((u) => (u.id === userId ? { ...u, orgId } : u)));
    } catch {
      setError("Failed to update organization.");
    }
    setUpdatingOrg(null);
  };

  const handleStatusToggle = async (user: User) => {
    const newStatus = user.status === "inactive" ? "active" : "inactive";
    setUpdatingStatus(user.id);
    try {
      const { data } = await api.patch<User>(`/users/${user.id}/status`, { status: newStatus });
      setUsers((prev) => prev.map((u) => u.id === user.id ? data : u));
    } catch {
      alert("Failed to update user status.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    } catch {
      alert("Failed to delete user.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return u.name.toLowerCase() === q || u.email.toLowerCase() === q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedUsers = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, filtered.length);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search exact name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchQuery(searchInput);
                }
              }}
              className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSearchQuery(searchInput)}
            className="h-9 px-3"
          >
            Search
          </Button>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
              }}
              className="h-9 px-3 text-muted-foreground"
            >
              Clear
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading} className="gap-1.5 flex-1 sm:flex-none justify-center">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setAddModalOpen(true)} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none justify-center">
            <UserPlus className="h-3.5 w-3.5" />
            Add Users
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Organisation</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && [...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
            {!loading && paginatedUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                  {searchQuery ? "No users match your search." : "No users found."}
                </td>
              </tr>
            )}
            {!loading && paginatedUsers.map((u) => (
              <tr key={u.id} className="border-t border-border hover:bg-secondary/20 transition-colors">
                {/* Name */}
                <td className="px-4 py-3 font-medium">{u.name}</td>
                {/* Email */}
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                {/* Role — inline dropdown for admins */}
                <td className="px-4 py-3">
                  {appUser?.role === "admin" && u.role !== "admin" ? (
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <select
                        value={u.role}
                        disabled={updatingRole === u.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        className="text-xs rounded border border-border bg-background px-1.5 py-1 outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      {updatingRole === u.id && (
                        <span className="text-xs text-muted-foreground animate-pulse">Saving…</span>
                      )}
                    </div>
                  ) : (
                    <RoleBadge role={u.role} />
                  )}
                </td>
                {/* Org — dropdown for admins */}
                <td className="px-4 py-3">
                  {appUser?.role === "admin" && u.role !== "admin" ? (
                    <select
                      value={u.orgId}
                      disabled={updatingOrg === u.id}
                      onChange={(e) => handleOrgChange(u.id, e.target.value)}
                      className="text-xs rounded border border-border bg-background px-1.5 py-1 outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 w-full max-w-[150px]"
                    >
                      <option value="">No Organization</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-muted-foreground font-mono text-xs">
                      {organizations.find(o => o.id === u.orgId)?.name || u.orgId || "N/A"}
                    </span>
                  )}
                  {updatingOrg === u.id && (
                    <div className="text-[10px] text-muted-foreground animate-pulse mt-1">Updating org…</div>
                  )}
                </td>
                {/* Status */}
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${u.status === "inactive" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${u.status === "inactive" ? "bg-amber-500" : "bg-emerald-500"}`} />
                    {u.status === "inactive" ? "Invited / Inactive" : "Active"}
                  </span>
                </td>
                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  {appUser?.role === "admin" && u.role !== "admin" && (
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusToggle(u)}
                        disabled={updatingStatus === u.id}
                        className={u.status === "inactive"
                          ? "text-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10 gap-1.5"
                          : "text-yellow-500 hover:text-yellow-500 hover:bg-yellow-500/10 gap-1.5"}
                        title={u.status === "inactive" ? "Activate user" : "Deactivate user"}
                      >
                        <Power className="h-3.5 w-3.5" />
                        {updatingStatus === u.id ? "..." : u.status === "inactive" ? "Enable" : "Disable"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(u)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{startIdx}</span> to{" "}
            <span className="font-medium text-foreground">{endIdx}</span> of{" "}
            <span className="font-medium text-foreground">{filtered.length}</span> users
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Only show 3 pages if there are many, or all if few
                if (
                  totalPages > 5 &&
                  page !== 1 &&
                  page !== totalPages &&
                  Math.abs(page - currentPage) > 1
                ) {
                  if (page === 2 || page === totalPages - 1) return <span key={page} className="text-muted-foreground px-1">...</span>;
                  return null;
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 text-xs p-0"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirm delete modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Remove User"
        description={`Are you sure you want to remove "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel={deleting ? "Removing…" : "Remove"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        destructive
      />

      <AddUserModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
