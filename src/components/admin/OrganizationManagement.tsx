import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationRepository } from "../../repositories/ApiOrganizationRepository";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Plus, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";
import { api } from "../../services/api";
import type { Organization, User } from "../../types";

export function OrganizationManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    managerId: "",
    researcherId: "",
    employeeId: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const queryClient = useQueryClient();

  const { data: organizations, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => organizationRepository.list(),
  });

  const { data: allUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get<User[]>("/users");
      return data;
    },
  });

  const { data: allPrograms } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const { data } = await api.get<any[]>("/programs");
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Organization>) => organizationRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsCreateOpen(false);
      setFormData({ 
        name: "", 
        domain: "", 
        managerId: "",
        researcherId: "",
        employeeId: "",
      });
      toast.success("Organization created successfully");
    },
    onError: () => {
      toast.error("Failed to create organization");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "inactive" }) =>
      organizationRepository.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast.success("Organization status updated");
    },
    onError: () => {
      toast.error("Failed to update organization status");
    },
  });

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error("Organization name is required");
      return;
    }
    createMutation.mutate({
      ...formData,
      status: "active",
      createdAt: new Date().toISOString(),
      createdBy: "admin",
    });
  };

  const toggleStatus = (org: Organization) => {
    const newStatus = org.status === "active" ? "inactive" : "active";
    updateStatusMutation.mutate({ id: org.id, status: newStatus });
  };

  const totalPages = Math.ceil((organizations?.length || 0) / ITEMS_PER_PAGE);
  const paginatedOrgs = (organizations || []).slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, organizations?.length || 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Organization Management</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage organizations
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Add a new organization to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  placeholder="Acme Corporation"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  placeholder="acme.com"
                  value={formData.domain}
                  onChange={(e) =>
                    setFormData({ ...formData, domain: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-4">
                <div className="space-y-2">
                  <Label>Assign Manager</Label>
                  <select
                    className="w-full text-xs rounded border border-border bg-background px-3 py-2"
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  >
                    <option value="">None</option>
                    {allUsers?.filter(u => u.role === "manager").map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Assign Researcher</Label>
                  <select
                    className="w-full text-xs rounded border border-border bg-background px-3 py-2"
                    value={formData.researcherId}
                    onChange={(e) => setFormData({ ...formData, researcherId: e.target.value })}
                  >
                    <option value="">None</option>
                    {allUsers?.filter(u => u.role === "researcher").map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Assign Employee</Label>
                  <select
                    className="w-full text-xs rounded border border-border bg-background px-3 py-2"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  >
                    <option value="">None</option>
                    {allUsers?.filter(u => u.role === "employee").map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead className="text-center">Managers</TableHead>
              <TableHead className="text-center">Researchers</TableHead>
              <TableHead className="text-center">Employees</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8 mx-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8 mx-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8 mx-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedOrgs && paginatedOrgs.length > 0 ? (
              paginatedOrgs.map((org) => (
                <TableRow 
                  key={org.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setSelectedOrg(org);
                    setIsDetailsOpen(true);
                  }}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{org.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {org.domain || "—"}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {org.counts?.manager ?? 0}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {org.counts?.researcher ?? 0}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {org.counts?.employee ?? 0}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        org.status === "active" ? "default" : "secondary"
                      }
                    >
                      {org.status || "active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(org);
                        }}
                        disabled={updateStatusMutation.isPending}
                      >
                        {org.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-muted-foreground">
                    No organizations found. Create one to get started.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && organizations && organizations.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{startIdx}</span> to{" "}
            <span className="font-medium text-foreground">{endIdx}</span> of{" "}
            <span className="font-medium text-foreground">{organizations?.length}</span> organizations
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
      {/* Organization Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Building2 className="h-6 w-6 text-primary" />
              {selectedOrg?.name || "Organization Details"}
            </DialogTitle>
            <DialogDescription>
              Organization ID: <span className="font-mono text-xs">{selectedOrg?.id}</span>
              {selectedOrg?.domain && <span className="ml-4">Domain: {selectedOrg.domain}</span>}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                <div className="text-sm text-muted-foreground mb-1">Total Users</div>
                <div className="text-2xl font-bold">{selectedOrg?.counts?.total ?? 0}</div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                <div className="text-sm text-muted-foreground mb-1">Active Programs</div>
                <div className="text-2xl font-bold">
                  {allPrograms?.filter(p => p.orgId === selectedOrg?.id && p.active).length ?? 0}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Plus className="h-4 w-4 rotate-45" /> Team Members
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-secondary/20">
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers?.filter(u => u.orgId === selectedOrg?.id).map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                          <TableCell className="capitalize">{user.role}</TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status || 'invited'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!allUsers || allUsers.filter(u => u.orgId === selectedOrg?.id).length === 0) && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                            No team members assigned yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Programs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allPrograms?.filter(p => p.orgId === selectedOrg?.id).map(program => (
                    <div key={program.id} className="p-4 border rounded-lg hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">{program.name}</div>
                        <Badge variant={program.active ? "default" : "secondary"}>
                          {program.active ? "Active" : "Paused"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {program.scope}
                      </div>
                    </div>
                  ))}
                  {(!allPrograms || allPrograms.filter(p => p.orgId === selectedOrg?.id).length === 0) && (
                    <div className="col-span-full text-center py-6 border rounded-lg border-dashed text-muted-foreground">
                      No vulnerability programs found for this organization.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
