"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftIcon, CheckCircleIcon, CircleIcon } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

type PermissionOrNested = Permission | { permission: Permission };

// Helper function to extract permission from potentially nested structure
const extractPermission = (item: PermissionOrNested): Permission => {
  return 'permission' in item ? item.permission : item;
};

export default function RolePermissionsPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const roleId = params.id as string;

  const [role, setRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [attachedPermissions, setAttachedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token || !roleId) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch role
      const roleResponse = await fetch(`/api/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!roleResponse.ok) throw new Error("Failed to fetch role");
      const roleResponseData = await roleResponse.json();
      const roleData = roleResponseData.data || roleResponseData;
      
      // Extract flat permissions from nested structure
      const permissionsArray = roleData.permissions || [];
      const flatPermissions: Permission[] = permissionsArray.map(extractPermission);
      setRole({ ...roleData, permissions: flatPermissions });
      setAttachedPermissions(flatPermissions.map((p: Permission) => p.id));

      // Fetch all permissions
      const permResponse = await fetch("/api/permissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!permResponse.ok) throw new Error("Failed to fetch permissions");
      const permData = await permResponse.json();
      setAllPermissions(permData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading data");
      console.error("fetchData error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, roleId]);

  useEffect(() => {
    if (!token) {
      router.push("/auth");
      return;
    }
    fetchData();
  }, [token, router, fetchData]);

  const handleTogglePermission = (permissionId: string) => {
    setAttachedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = async () => {
    if (!token || !roleId) return;
    setSaving(true);
    setError(null);
    try {
      // Get permissions to add and remove
      const currentPermissions = new Set(
        role?.permissions.map((p) => p.id) || []
      );
      const newPermissions = new Set(attachedPermissions);

      const toAdd = attachedPermissions.filter((id) => !currentPermissions.has(id));
      const toRemove = Array.from(currentPermissions).filter(
        (id) => !newPermissions.has(id)
      );

      // Add new permissions
      for (const permissionId of toAdd) {
        const response = await fetch(`/api/roles/${roleId}/permissions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ permissionId }),
        });
        if (!response.ok) throw new Error("Failed to add permission");
      }

      // Remove permissions
      for (const permissionId of toRemove) {
        const response = await fetch(`/api/roles/${roleId}/permissions`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ permissionId }),
        });
        if (!response.ok) throw new Error("Failed to remove permission");
      }

      router.push(`/dashboard/roles/${roleId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving permissions");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-slate-600 border-t-blue-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading permissions...</p>
        </div>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="space-y-4">
        <Button
          onClick={() => router.push(`/dashboard/roles/${roleId}`)}
          variant="outline"
          className="text-blue-300 border-slate-700 hover:bg-slate-800/50"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card className="border-red-900/50 bg-red-950/30">
          <CardContent className="pt-6">
            <p className="text-red-300">{error || "Failed to load"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button
          onClick={() => router.push(`/dashboard/roles/${roleId}`)}
          variant="outline"
          className="mb-4 text-blue-300 border-slate-700 hover:bg-slate-800/50"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Role
        </Button>
        <h1 className="text-3xl font-extrabold text-slate-50 mb-2">
          {role.name} &ndash; Manage Permissions
        </h1>
        <p className="text-slate-400 text-sm">
          Select which permissions this role should have
        </p>
      </div>

      {error && (
        <Card className="border-red-900/50 bg-red-950/30">
          <CardContent className="pt-6">
            <p className="text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Attached Permissions Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">
          Attached Permissions ({attachedPermissions.length})
        </h2>
        {attachedPermissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {allPermissions
              .filter((p) => attachedPermissions.includes(p.id))
              .map((permission) => (
                <Card
                  key={permission.id}
                  className="border-blue-500/50 bg-blue-950/30 cursor-pointer hover:bg-blue-950/50 transition-colors"
                  onClick={() => handleTogglePermission(permission.id)}
                >
                  <CardContent className="pt-6 flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-blue-400 mt-1 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-50">
                        {permission.name}
                      </p>
                      {permission.description && (
                        <p className="text-xs text-slate-400 mt-1">
                          {permission.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <Card className="border-dashed border-slate-700 bg-slate-900/30 mb-8">
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-slate-400">No permissions attached yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Available Permissions Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">
          Available Permissions (
          {allPermissions.length - attachedPermissions.length})
        </h2>
        {allPermissions.filter((p) => !attachedPermissions.includes(p.id))
          .length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {allPermissions
              .filter((p) => !attachedPermissions.includes(p.id))
              .map((permission) => (
                <Card
                  key={permission.id}
                  className="border-slate-800 bg-slate-900/60 cursor-pointer hover:bg-slate-900 hover:border-slate-600 transition-all"
                  onClick={() => handleTogglePermission(permission.id)}
                >
                  <CardContent className="pt-6 flex items-start gap-3">
                    <CircleIcon className="w-5 h-5 text-slate-500 mt-1 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-50">
                        {permission.name}
                      </p>
                      {permission.description && (
                        <p className="text-xs text-slate-400 mt-1">
                          {permission.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <Card className="border-dashed border-slate-700 bg-slate-900/30 mb-8">
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-slate-400">All permissions attached</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-800">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          onClick={() => router.push(`/dashboard/roles/${roleId}`)}
          variant="outline"
          className="text-slate-300 border-slate-700 hover:bg-slate-800/50"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
