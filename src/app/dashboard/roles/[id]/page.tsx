"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon, Trash2Icon } from "lucide-react";

interface Role {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[] | Array<{ permission: Permission }>;
  users: User[] | Array<{ user: User }>;
}

interface Permission {
  id: string;
  name: string;
  description?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}

type PermissionOrNested = Permission | { permission: Permission };
type UserOrNested = User | { user: User };

// Helper functions to extract values from potentially nested structures
const extractPermission = (item: PermissionOrNested): Permission => {
  return 'permission' in item ? item.permission : item;
};

const extractUser = (item: UserOrNested): User => {
  return 'user' in item ? item.user : item;
};

export default function RoleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const roleId = params.id as string;

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fetchRole = useCallback(async () => {
    if (!token || !roleId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch role");
      const data = await response.json();
      
      // Flatten nested structures if needed
      const roleData = data.data || data;
      const permissions: Permission[] = (roleData.permissions || []).map(extractPermission);
      const users: User[] = (roleData.users || []).map(extractUser);
      
      setRole({
        ...roleData,
        permissions,
        users,
      });
      setEditName(roleData.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading role");
    } finally {
      setLoading(false);
    }
  }, [token, roleId]);

  useEffect(() => {
    if (!token) {
      router.push("/auth");
      return;
    }
    fetchRole();
  }, [token, router, fetchRole]);

  const handleUpdate = async () => {
    if (!token || !roleId || !editName.trim()) return;
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName }),
      });
      if (!response.ok) throw new Error("Failed to update role");
      await fetchRole();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating role");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    if (!token || !roleId) return;
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete role");
      router.push("/dashboard/roles");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting role");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-slate-600 border-t-blue-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading role...</p>
        </div>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/dashboard/roles")}
            variant="outline"
            className="text-blue-300 border-slate-700 hover:bg-slate-800/50"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Roles
          </Button>
        </div>
        <Card className="border-red-900/50 bg-red-950/30">
          <CardContent className="pt-6">
            <p className="text-red-300">{error || "Role not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Button
            onClick={() => router.push("/dashboard/roles")}
            variant="outline"
            className="mb-4 text-blue-300 border-slate-700 hover:bg-slate-800/50"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Roles
          </Button>
          <h1 className="text-4xl font-extrabold text-slate-50 mb-2">
            {role.name}
          </h1>
          <p className="text-slate-400 text-sm">
            Created on {new Date(role.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-500 text-white font-semibold shadow-lg"
        >
          <Trash2Icon className="w-4 h-4 mr-2" />
          Delete Role
        </Button>
      </div>

      {/* Role Details */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-slate-50">Role Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Role name"
                className="bg-slate-800 border-slate-700 text-slate-50"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdate}
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(role.name);
                  }}
                  variant="outline"
                  className="text-slate-300 border-slate-700 hover:bg-slate-800/50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Name</p>
                <p className="text-lg font-semibold text-slate-50">
                  {role.name}
                </p>
              </div>
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Edit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-50">Permissions</h2>
            <p className="text-slate-400 text-sm mt-1">
              Permissions assigned to this role
            </p>
          </div>
          <Button
            onClick={() => router.push(`/dashboard/roles/${roleId}/permissions`)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
          >
            Manage Permissions
          </Button>
        </div>

        {role.permissions && role.permissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(role.permissions as Permission[]).map((permission) => (
              <Card
                key={permission.id}
                className="border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-blue-500/50 transition-all"
              >
                <CardContent className="pt-6">
                  <p className="font-semibold text-slate-50">
                    {permission.name}
                  </p>
                  {permission.description && (
                    <p className="text-xs text-slate-400 mt-2">
                      {permission.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-slate-700 bg-slate-900/30">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-slate-400 mb-4">No permissions assigned</p>
              <Button
                onClick={() =>
                  router.push(`/dashboard/roles/${roleId}/permissions`)
                }
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                Add Permissions
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Users with this role */}
      {role.users && role.users.length > 0 && (
        <div>
          <div>
            <h2 className="text-2xl font-bold text-slate-50 mb-1">
              Users with this Role
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              {role.users.length} {role.users.length === 1 ? "user" : "users"} assigned to this role
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(role.users as User[]).map((user) => (
              <Card
                key={user.id}
                className="border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-colors"
              >
                <CardContent className="pt-6">
                  <p className="font-semibold text-slate-50">{user.username}</p>
                  <p className="text-xs text-slate-400 mt-1">{user.email}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
