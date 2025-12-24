"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PlusIcon, Settings, Lock, Zap } from "lucide-react";

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
    <div className="min-h-screen space-y-12 pb-20">
      {/* Header Section */}
      <div className="border-b border-slate-800 pb-8">
        <h1 className="text-4xl font-extrabold text-slate-50 mb-2">Dashboard</h1>
        <p className="text-base text-slate-400">
          Manage roles, permissions, and user assignments in your system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Roles Card */}
        <div className="group relative overflow-hidden rounded-lg border border-slate-800 bg-linear-to-br from-slate-900 via-slate-900/80 to-slate-950 p-6 shadow-xl hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-600/20 blur-2xl group-hover:bg-blue-600/30 transition-all duration-300" />
          <div className="relative space-y-2">
            <Settings className="w-8 h-8 text-blue-400 mb-4" />
            <div className="text-4xl font-bold text-blue-400">{roles.length}</div>
            <p className="text-slate-400 text-sm uppercase tracking-widest font-semibold">Total Roles</p>
          </div>
        </div>

        {/* Permissions Card */}
        <div className="group relative overflow-hidden rounded-lg border border-slate-800 bg-linear-to-br from-slate-900 via-slate-900/80 to-slate-950 p-6 shadow-xl hover:shadow-2xl hover:shadow-emerald-900/20 transition-all duration-300">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-600/20 blur-2xl group-hover:bg-emerald-600/30 transition-all duration-300" />
          <div className="relative space-y-2">
            <Lock className="w-8 h-8 text-emerald-400 mb-4" />
            <div className="text-4xl font-bold text-emerald-400">{permissions.length}</div>
            <p className="text-slate-400 text-sm uppercase tracking-widest font-semibold">Total Permissions</p>
          </div>
        </div>

        {/* Assignments Card */}
        <div className="group relative overflow-hidden rounded-lg border border-slate-800 bg-linear-to-br from-slate-900 via-slate-900/80 to-slate-950 p-6 shadow-xl hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-purple-600/20 blur-2xl group-hover:bg-purple-600/30 transition-all duration-300" />
          <div className="relative space-y-2">
            <Zap className="w-8 h-8 text-purple-400 mb-4" />
            <div className="text-4xl font-bold text-purple-400">
              {roles.reduce((acc, role) => acc + role.permissions.length, 0)}
            </div>
            <p className="text-slate-400 text-sm uppercase tracking-widest font-semibold">Assignments</p>
          </div>
        </div>
      </div>

      {/* Roles & Permissions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Roles Panel */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-50">Roles</h2>
              <p className="text-slate-400 text-sm mt-1">
                Define access levels for your users
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/roles")}
              className="bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 shrink-0"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Role
            </Button>
          </div>

          {rolesLoading ? (
            <div className="flex items-center justify-center py-12 rounded-lg border border-slate-800 bg-slate-900/50">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 rounded-full border-2 border-slate-600 border-t-blue-400 animate-spin" />
                <p className="text-slate-400 text-sm">Loading roles...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {roles.slice(0, 6).map((role) => (
                <div
                  key={role.id}
                  onClick={() => router.push(`/dashboard/roles/${role.id}`)}
                  className="group relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/20 p-4 cursor-pointer transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-blue-600/0 via-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:via-blue-600/5 group-hover:to-blue-600/0 transition-all duration-300" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-50 group-hover:text-blue-200 transition-colors">
                        {role.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1.5">
                        {role.permissions.length} {role.permissions.length === 1 ? "permission" : "permissions"}
                      </p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold group-hover:bg-blue-500/40 transition-colors">
                      {role.permissions.length}
                    </div>
                  </div>
                </div>
              ))}
              {roles.length === 0 && (
                <div className="flex items-center justify-center py-12 rounded-lg border-2 border-dashed border-slate-700 bg-slate-900/30">
                  <div className="text-center">
                    <Settings className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No roles created yet</p>
                    <Button
                      onClick={() => router.push("/dashboard/roles")}
                      className="mt-3 bg-blue-600 hover:bg-blue-500 text-white"
                      size="sm"
                    >
                      Create First Role
                    </Button>
                  </div>
                </div>
              )}
              {roles.length > 6 && (
                <Button
                  onClick={() => router.push("/dashboard/roles")}
                  variant="outline"
                  className="w-full text-blue-300 border-slate-700 hover:bg-slate-800/50"
                >
                  View All Roles
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Permissions Panel */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-50">Permissions</h2>
              <p className="text-slate-400 text-sm mt-1">
                Define actions and capabilities
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/permissions")}
              className="bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 shrink-0"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Permission
            </Button>
          </div>

          {permissionsLoading ? (
            <div className="flex items-center justify-center py-12 rounded-lg border border-slate-800 bg-slate-900/50">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 rounded-full border-2 border-slate-600 border-t-emerald-400 animate-spin" />
                <p className="text-slate-400 text-sm">Loading permissions...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {permissions.slice(0, 6).map((permission) => (
                <div
                  key={permission.id}
                  onClick={() => router.push(`/dashboard/permissions/${permission.id}`)}
                  className="group relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-900/20 p-4 cursor-pointer transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-emerald-600/0 via-emerald-600/0 to-emerald-600/0 group-hover:from-emerald-600/10 group-hover:via-emerald-600/5 group-hover:to-emerald-600/0 transition-all duration-300" />
                  <div className="relative">
                    <p className="font-semibold text-slate-50 group-hover:text-emerald-200 transition-colors">
                      {permission.name}
                    </p>
                    {permission.description && (
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                        {permission.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {permissions.length === 0 && (
                <div className="flex items-center justify-center py-12 rounded-lg border-2 border-dashed border-slate-700 bg-slate-900/30">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No permissions created yet</p>
                    <Button
                      onClick={() => router.push("/dashboard/permissions")}
                      className="mt-3 bg-emerald-600 hover:bg-emerald-500 text-white"
                      size="sm"
                    >
                      Create First Permission
                    </Button>
                  </div>
                </div>
              )}
              {permissions.length > 6 && (
                <Button
                  onClick={() => router.push("/dashboard/permissions")}
                  variant="outline"
                  className="w-full text-emerald-300 border-slate-700 hover:bg-slate-800/50"
                >
                  View All Permissions
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Commands Section */}
      <div className="relative overflow-hidden rounded-lg border border-blue-900/50 bg-linear-to-br from-blue-950/50 via-slate-950/60 to-slate-950 p-8 shadow-2xl shadow-blue-900/20">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-blue-400" />
            <h3 className="text-2xl font-bold text-slate-50">AI-Powered Commands</h3>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Use natural language to manage your RBAC system. Try commands like:
          </p>
          <ul className="space-y-2 text-sm text-slate-300 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>&ldquo;Create a new role called manager&rdquo;</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>&ldquo;Give admin the edit articles permission&rdquo;</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>&ldquo;Assign the user role to john_doe&rdquo;</span>
            </li>
          </ul>
          <Button
            onClick={() => router.push("/dashboard/ai-command")}
            className="mt-6 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Zap className="w-4 h-4 mr-2" />
            Try AI Commands
          </Button>
        </div>
      </div>
    </div>
  );
}
