"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon, Trash2Icon } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
}

interface Role {
  id: string;
  name: string;
}

export default function PermissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const permissionId = params.id as string;

  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fetchPermission = useCallback(async () => {
    if (!token || !permissionId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/permissions/${permissionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch permission");
      const data = await response.json();
      setPermission(data.data);
      setEditName(data.data.name);
      setEditDescription(data.data.description || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading permission");
    } finally {
      setLoading(false);
    }
  }, [token, permissionId]);

  useEffect(() => {
    if (!token) {
      router.push("/auth");
      return;
    }
    fetchPermission();
  }, [token, router, fetchPermission]);

  const handleUpdate = async () => {
    if (!token || !permissionId || !editName.trim()) return;
    try {
      const response = await fetch(`/api/permissions/${permissionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription || null,
        }),
      });
      if (!response.ok) throw new Error("Failed to update permission");
      await fetchPermission();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating permission");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this permission?")) return;
    if (!token || !permissionId) return;
    try {
      const response = await fetch(`/api/permissions/${permissionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete permission");
      router.push("/dashboard/permissions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting permission");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-slate-600 border-t-emerald-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading permission...</p>
        </div>
      </div>
    );
  }

  if (error || !permission) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/dashboard/permissions")}
            variant="outline"
            className="text-emerald-300 border-slate-700 hover:bg-slate-800/50"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Permissions
          </Button>
        </div>
        <Card className="border-red-900/50 bg-red-950/30">
          <CardContent className="pt-6">
            <p className="text-red-300">{error || "Permission not found"}</p>
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
            onClick={() => router.push("/dashboard/permissions")}
            variant="outline"
            className="mb-4 text-emerald-300 border-slate-700 hover:bg-slate-800/50"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Permissions
          </Button>
          <h1 className="text-4xl font-extrabold text-slate-50 mb-2">
            {permission.name}
          </h1>
          <p className="text-slate-400 text-sm">
            Created on {new Date(permission.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-500 text-white font-semibold shadow-lg"
        >
          <Trash2Icon className="w-4 h-4 mr-2" />
          Delete Permission
        </Button>
      </div>

      {/* Permission Details */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-slate-50">Permission Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">
                  Name
                </label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Permission name"
                  className="bg-slate-800 border-slate-700 text-slate-50"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-2 block">
                  Description
                </label>
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Permission description (optional)"
                  className="bg-slate-800 border-slate-700 text-slate-50"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdate}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(permission.name);
                    setEditDescription(permission.description || "");
                  }}
                  variant="outline"
                  className="text-slate-300 border-slate-700 hover:bg-slate-800/50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">Name</p>
                  <p className="text-lg font-semibold text-slate-50">
                    {permission.name}
                  </p>
                </div>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Edit
                </Button>
              </div>
              {permission.description && (
                <div>
                  <p className="text-sm text-slate-400 mb-1">Description</p>
                  <p className="text-slate-300">{permission.description}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roles with this permission */}
      {permission.roles && permission.roles.length > 0 && (
        <div>
          <div>
            <h2 className="text-2xl font-bold text-slate-50 mb-1">
              Roles with this Permission
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              {permission.roles.length}{" "}
              {permission.roles.length === 1 ? "role" : "roles"} have this
              permission
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permission.roles.map((role) => (
              <Card
                key={role.id}
                onClick={() =>
                  router.push(`/dashboard/roles/${role.id}`)
                }
                className="border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-emerald-500/50 cursor-pointer transition-all"
              >
                <CardContent className="pt-6">
                  <p className="font-semibold text-slate-50 hover:text-emerald-300 transition-colors">
                    {role.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {(!permission.roles || permission.roles.length === 0) && (
        <Card className="border-dashed border-slate-700 bg-slate-900/30">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-slate-400">
              No roles currently have this permission
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
