// src/app/(admin)/admin/users/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, Search, RefreshCcw, Trash2, Save, MoreHorizontal } from "lucide-react";

type UserRole = "doctor" | "assistant" | "admin";

interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  bmdc_reg: string | null;
  specialty: string | null;
  role: UserRole;
  doctor_id: number | null;
  doctor_name: string | null;
  created_at: string;
}

interface UserStats {
  totalUsers: number;
  totalDoctors: number;
  totalAssistants: number;
  totalAdmins: number;
}

interface DoctorOption {
  id: number;
  name: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    totalDoctors: 0,
    totalAssistants: 0,
    totalAdmins: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [pendingRole, setPendingRole] = useState<Record<number, UserRole>>({});
  const [pendingDoctor, setPendingDoctor] = useState<Record<number, number | null>>({});
  const [savingUserId, setSavingUserId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState<AdminUser | null>(null);

  const currentAdminId = useMemo(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      const parsed = JSON.parse(userStr) as { id?: string | number };
      return parsed.id ? Number(parsed.id) : null;
    } catch {
      return null;
    }
  }, []);

  const fetchUsers = async (page = 1, silent = false) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Missing authentication token");
      }

      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (roleFilter !== "all") {
        params.set("role", roleFilter);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(Array.isArray(data.users) ? data.users : []);
      setDoctors(Array.isArray(data.doctors) ? data.doctors : []);
      setStats(
        data.stats || {
          totalUsers: 0,
          totalDoctors: 0,
          totalAssistants: 0,
          totalAdmins: 0,
        }
      );
      setPagination(
        data.pagination || {
          page: 1,
          limit: pagination.limit,
          total: 0,
          totalPages: 1,
        }
      );
    } catch (error) {
      console.error("Admin users fetch error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load users");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers(1, true);
    }, 350);

    return () => clearTimeout(timeout);
  }, [search, roleFilter]);

  const getRoleBadge = (role: UserRole) => {
    if (role === "admin") {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">admin</Badge>;
    }
    if (role === "assistant") {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">assistant</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">doctor</Badge>;
  };

  const handleSaveUser = async (user: AdminUser) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Missing authentication token");
      return;
    }

    const selectedRole = pendingRole[user.id] ?? user.role;
    const selectedDoctor = pendingDoctor[user.id] ?? user.doctor_id;

    if (selectedRole === "assistant" && !selectedDoctor) {
      toast.error("Please assign a doctor for assistant role");
      return;
    }

    setSavingUserId(user.id);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: selectedRole,
          doctorId: selectedRole === "assistant" ? selectedDoctor : null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      toast.success("User updated successfully");
      await fetchUsers(pagination.page, true);
    } catch (error) {
      console.error("User update error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    } finally {
      setSavingUserId(null);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Missing authentication token");
      return;
    }

    setDeletingUserId(user.id);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      setDeleteTargetUser(null);

      const nextPage =
        users.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      await fetchUsers(nextPage, true);
    } catch (error) {
      console.error("User delete error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">View and manage system users</p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchUsers(pagination.page, true)}
          disabled={isRefreshing}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Doctors</p>
              <p className="text-2xl font-bold">{stats.totalDoctors}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Assistants</p>
              <p className="text-2xl font-bold">{stats.totalAssistants}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold">{stats.totalAdmins}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value as "all" | UserRole)}
            >
              <SelectTrigger className="w-full md:w-45">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-muted-foreground py-12 text-center">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm mt-2">Try changing your search or role filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const selectedRole = pendingRole[user.id] ?? user.role;
                const selectedDoctor = pendingDoctor[user.id] ?? user.doctor_id;
                const isCurrentAdmin = currentAdminId === user.id;
                const isLockedAdmin = user.role === "admin";

                return (
                  <div
                    key={user.id}
                    className="rounded-lg border p-4 flex flex-col gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-base">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {getRoleBadge(user.role)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Role</p>
                        <Select
                          value={selectedRole}
                          onValueChange={(value) =>
                            setPendingRole((prev) => ({
                              ...prev,
                              [user.id]: value as UserRole,
                            }))
                          }
                          disabled={isCurrentAdmin || isLockedAdmin || savingUserId === user.id}
                        >
                          <SelectTrigger className="w-full h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="doctor">Doctor</SelectItem>
                            <SelectItem value="assistant">Assistant</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Assigned Doctor</p>
                        <Select
                          value={String(selectedDoctor ?? "")}
                          onValueChange={(value) =>
                            setPendingDoctor((prev) => ({
                              ...prev,
                              [user.id]: value ? Number(value) : null,
                            }))
                          }
                          disabled={selectedRole !== "assistant" || savingUserId === user.id}
                        >
                          <SelectTrigger className="w-full h-9">
                            <SelectValue placeholder="Select doctor" />
                          </SelectTrigger>
                          <SelectContent>
                            {doctors.map((doc) => (
                              <SelectItem key={doc.id} value={String(doc.id)}>
                                {doc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          Current: {user.doctor_name || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">BMDC</p>
                        <p className="text-sm font-medium">{user.bmdc_reg || "-"}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Specialty</p>
                        <p className="text-sm font-medium">{user.specialty || "-"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveUser(user)}
                          disabled={savingUserId === user.id || isCurrentAdmin}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {savingUserId === user.id ? "Saving..." : "Save Changes"}
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setDeleteTargetUser(user)}
                              disabled={deletingUserId === user.id || isCurrentAdmin || isLockedAdmin}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {deletingUserId === user.id ? "Deleting..." : "Delete User"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1 || isLoading}
                onClick={() => fetchUsers(pagination.page - 1, true)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages || isLoading}
                onClick={() => fetchUsers(pagination.page + 1, true)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(deleteTargetUser)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTargetUser(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove
              {" "}
              <span className="font-medium">
                {deleteTargetUser ? `${deleteTargetUser.first_name} ${deleteTargetUser.last_name}` : "this user"}
              </span>
              {" "}
              from the system if no protected dependencies exist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(deleteTargetUser && deletingUserId === deleteTargetUser.id)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (deleteTargetUser) {
                  handleDeleteUser(deleteTargetUser);
                }
              }}
              disabled={Boolean(deleteTargetUser && deletingUserId === deleteTargetUser.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTargetUser && deletingUserId === deleteTargetUser.id ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
