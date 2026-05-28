import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import { UserPlus, Upload, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Role } from "../../types";
import * as XLSX from "xlsx";
import { cn } from "../../lib/utils";

import { userRepository } from "../../repositories/ApiUserRepository";

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface UserInput {
  name: string;
  email: string;
  role: Role;
}

export function AddUserModal({ open, onOpenChange, onSuccess }: AddUserModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("single");
  
  // Single User State
  const [singleUser, setSingleUser] = useState<UserInput>({
    name: "",
    email: "",
    role: "employee",
  });

  // Bulk User State
  const [bulkUsers, setBulkUsers] = useState<UserInput[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  const singleMutation = useMutation({
    mutationFn: async (userData: UserInput) => {
      return userRepository.create(userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["pending-users"] });
      toast.success("User added successfully");
      onOpenChange(false);
      setSingleUser({ name: "", email: "", role: "employee" });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async (users: UserInput[]) => {
      return userRepository.bulkCreate(users);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["pending-users"] });
      toast.success("Users uploaded successfully");
      onOpenChange(false);
      setBulkUsers([]);
      onSuccess?.();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || "Failed to upload users";
      toast.error(message);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        const validRoles: Role[] = ["admin", "manager", "researcher", "employee"];
        const parsedUsers: UserInput[] = json
          .map((row) => ({
            name: row.Name || row.name || row.NAME,
            email: row.Email || row.email || row.EMAIL,
            role: (row.Role || row.role || row.ROLE || "employee").toLowerCase() as Role,
          }))
          .filter((u) => u.name && u.email && validRoles.includes(u.role));

        if (parsedUsers.length === 0) {
          toast.error("No valid users found in the spreadsheet. Please check the format.");
        } else {
          setBulkUsers(parsedUsers);
          toast.success(`Found ${parsedUsers.length} valid users`);
        }
      } catch (err) {
        toast.error("Failed to parse spreadsheet");
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Name: "John Doe", Email: "john@example.com", Role: "employee" },
      { Name: "Jane Smith", Email: "jane@example.com", Role: "manager" },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "user_import_template.xlsx");
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    singleMutation.mutate(singleUser);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-purple-600" />
            Add New Users
          </DialogTitle>
          <DialogDescription>
            Register users individually or upload a spreadsheet for bulk addition.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Entry</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4 pt-4">
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. John Doe"
                  value={singleUser.name}
                  onChange={(e) => setSingleUser({ ...singleUser, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. john@org.com"
                  value={singleUser.email}
                  onChange={(e) => setSingleUser({ ...singleUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Assign Role</Label>
                <Select
                  value={singleUser.role}
                  onValueChange={(val: Role) => setSingleUser({ ...singleUser, role: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="researcher">Researcher</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={singleMutation.isPending} className="w-full">
                  {singleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Register User
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4 pt-4">
            {bulkUsers.length === 0 ? (
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors",
                  "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 hover:border-purple-300"
                )}
              >
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileSpreadsheet className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Upload Spreadsheet</p>
                  <p className="text-xs text-muted-foreground mt-1">.xlsx or .xls files only</p>
                </div>
                <div className="relative">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                    disabled={isParsing}
                  />
                  <Button variant="outline" size="sm" className="pointer-events-none">
                    {isParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    Choose File
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="text-xs text-purple-600 hover:underline mt-2"
                >
                  Download Template
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">
                      {bulkUsers.length} users ready to import
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-slate-500 hover:text-red-600"
                    onClick={() => setBulkUsers([])}
                  >
                    Clear
                  </Button>
                </div>
                
                <div className="max-h-[200px] overflow-auto border rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b sticky top-0">
                      <tr>
                        <th className="px-3 py-2 font-medium">Name</th>
                        <th className="px-3 py-2 font-medium">Email</th>
                        <th className="px-3 py-2 font-medium">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {bulkUsers.slice(0, 50).map((user, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 truncate max-w-[120px]">{user.name}</td>
                          <td className="px-3 py-2 truncate max-w-[150px]">{user.email}</td>
                          <td className="px-3 py-2 capitalize">{user.role}</td>
                        </tr>
                      ))}
                      {bulkUsers.length > 50 && (
                        <tr>
                          <td colSpan={3} className="px-3 py-2 text-center text-muted-foreground italic">
                            ...and {bulkUsers.length - 50} more
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-800">
                    These users will be pre-registered. They will be automatically activated and assigned their roles when they sign in with their Google account.
                  </p>
                </div>

                <DialogFooter>
                  <Button
                    onClick={() => bulkMutation.mutate(bulkUsers)}
                    disabled={bulkMutation.isPending}
                    className="w-full"
                  >
                    {bulkMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Bulk Upload
                  </Button>
                </DialogFooter>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
