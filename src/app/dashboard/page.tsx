"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

interface Permission {
  id: string;
  name: string;
  description?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  const fetchRoles = useCallback(async () => {
    if (!token) return;
    setRolesLoading(true);
    try {
      const response = await fetch("/api/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setRoles(data.data || []);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setRolesLoading(false);
    }
  }, [token]);

  const fetchPermissions = useCallback(async () => {
    if (!token) return;
    setPermissionsLoading(true);
    try {
      const response = await fetch("/api/permissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPermissions(data.data || []);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
    } finally {
      setPermissionsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      router.push("/auth");
      return;
    }
    fetchRoles();
    fetchPermissions();
  }, [token, router, fetchRoles, fetchPermissions]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{roles.length}</div>
                <p className="text-slate-600 mt-2">Total Roles</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">{permissions.length}</div>
                <p className="text-slate-600 mt-2">Total Permissions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">
                  {roles.reduce((acc, role) => acc + role.permissions.length, 0)}
                </div>
                <p className="text-slate-600 mt-2">Assignments</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">Roles</h3>
            <Button
              onClick={() => router.push("/dashboard/roles")}
              size="sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Manage Roles
            </Button>
          </div>
          {rolesLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-2">
              {roles.slice(0, 5).map((role) => (
                <Card key={role.id} className="cursor-pointer hover:bg-slate-50">
                  <CardContent className="pt-6">
                    <p className="font-medium text-slate-900">{role.name}</p>
                    <p className="text-sm text-slate-500">
                      {role.permissions.length} permissions
                    </p>
                  </CardContent>
                </Card>
              ))}
              {roles.length === 0 && (
                <p className="text-slate-500">No roles created yet</p>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">Permissions</h3>
            <Button
              onClick={() => router.push("/dashboard/permissions")}
              size="sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Manage Permissions
            </Button>
          </div>
          {permissionsLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-2">
              {permissions.slice(0, 5).map((permission) => (
                <Card key={permission.id} className="cursor-pointer hover:bg-slate-50">
                  <CardContent className="pt-6">
                    <p className="font-medium text-slate-900">{permission.name}</p>
                    {permission.description && (
                      <p className="text-sm text-slate-500">
                        {permission.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {permissions.length === 0 && (
                <p className="text-slate-500">No permissions created yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Natural Language Command</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 mb-4">
            Try commands like: &ldquo;Create a new role called manager&rdquo; or &ldquo;Give admin the edit articles permission&rdquo;
          </p>
          <Button
            onClick={() => router.push("/dashboard/ai-command")}
            variant="outline"
          >
            Try AI Commands
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
