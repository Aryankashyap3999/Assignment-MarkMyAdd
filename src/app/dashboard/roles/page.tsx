"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrashIcon, LinkIcon, ArrowLeftIcon } from "lucide-react";

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

export default function RolesPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchRoles = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch("/api/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setRoles(data.data || []);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      router.push("/auth");
      return;
    }
    fetchRoles();
  }, [token, router, fetchRoles]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newRoleName }),
      });

      if (response.ok) {
        setNewRoleName("");
        fetchRoles();
      }
    } catch (error) {
      console.error("Failed to create role:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      await fetch(`/api/roles/${roleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRoles();
    } catch (error) {
      console.error("Failed to delete role:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Manage Roles</h2>
          <p className="text-slate-600 text-sm">Create and manage roles for your system</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard")}
          variant="outline"
          className="text-slate-600 border-slate-300 hover:bg-slate-100"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Role</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-2">
            <Input
              placeholder="Role name (e.g., Administrator, Editor)"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              disabled={creating}
            />
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">All Roles ({roles.length})</h3>
        {loading ? (
          <p>Loading roles...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {roles.map((role) => (
              <Card key={role.id} className="hover:bg-slate-50">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900">{role.name}</h4>
                      <p className="text-sm text-slate-600">
                        {role.permissions.length} permissions
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/dashboard/roles/${role.id}/permissions`
                          )
                        }
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Manage Permissions
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(role.id)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {roles.length === 0 && (
              <p className="text-slate-500">No roles created yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
