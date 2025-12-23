"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckIcon, TrashIcon } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  permissions: Array<{ permission: Permission }>;
}

export default function RolePermissionsPage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;
  const { token } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [attachingPerm, setAttachingPerm] = useState<string | null>(null);

  const fetchRole = useCallback(async () => {
    if (!token || !roleId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setRole(data);
    } catch (error) {
      console.error("Failed to fetch role:", error);
    } finally {
      setLoading(false);
    }
  }, [token, roleId]);

  const fetchAllPermissions = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/permissions?take=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setAllPermissions(data.data || []);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      router.push("/auth");
      return;
    }
    fetchRole();
    fetchAllPermissions();
  }, [token, router, fetchRole, fetchAllPermissions]);

  const handleAddPermission = async (permissionId: string) => {
    setAttachingPerm(permissionId);
    try {
      const response = await fetch(`/api/roles/${roleId}/permissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permissionId }),
      });

      if (response.ok) {
        fetchRole();
      }
    } catch (error) {
      console.error("Failed to add permission:", error);
    } finally {
      setAttachingPerm(null);
    }
  };

  const handleRemovePermission = async (permissionId: string) => {
    try {
      const response = await fetch(`/api/roles/${roleId}/permissions`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permissionId }),
      });

      if (response.ok) {
        fetchRole();
      }
    } catch (error) {
      console.error("Failed to remove permission:", error);
    }
  };

  const attachedPermissionIds = new Set(
    role?.permissions.map((p) => p.permission.id) || []
  );

  if (loading) return <p>Loading...</p>;
  if (!role) return <p>Role not found</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">{role.name}</h2>
        <p className="text-slate-600">Manage permissions for this role</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attached Permissions ({role.permissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {role.permissions.length === 0 ? (
            <p className="text-slate-500">No permissions attached yet</p>
          ) : (
            <div className="space-y-2">
              {role.permissions.map(({ permission }) => (
                <div
                  key={permission.id}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {permission.name}
                    </p>
                    {permission.description && (
                      <p className="text-sm text-slate-600">
                        {permission.description}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemovePermission(permission.id)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {allPermissions.map((permission) => (
              <div
                key={permission.id}
                className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {permission.name}
                  </p>
                  {permission.description && (
                    <p className="text-sm text-slate-600">
                      {permission.description}
                    </p>
                  )}
                </div>
                {attachedPermissionIds.has(permission.id) ? (
                  <div className="flex items-center text-green-600">
                    <CheckIcon className="w-5 h-5" />
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleAddPermission(permission.id)}
                    disabled={attachingPerm === permission.id}
                  >
                    {attachingPerm === permission.id ? "..." : "Add"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
