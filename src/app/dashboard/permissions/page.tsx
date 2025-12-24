"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrashIcon, ArrowLeftIcon } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description?: string;
}

export default function PermissionsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPermName, setNewPermName] = useState("");
  const [newPermDesc, setNewPermDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchPermissions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch("/api/permissions?take=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPermissions(data.data || []);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      router.push("/auth");
      return;
    }
    fetchPermissions();
  }, [token, router, fetchPermissions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch("/api/permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newPermName,
          description: newPermDesc || undefined,
        }),
      });

      if (response.ok) {
        setNewPermName("");
        setNewPermDesc("");
        fetchPermissions();
      }
    } catch (error) {
      console.error("Failed to create permission:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (permId: string) => {
    if (!confirm("Are you sure you want to delete this permission?")) return;

    try {
      await fetch(`/api/permissions/${permId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPermissions();
    } catch (error) {
      console.error("Failed to delete permission:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Manage Permissions
          </h2>
          <p className="text-slate-600 text-sm">Create and manage permissions for your system</p>
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
          <CardTitle>Create New Permission</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Permission name (e.g., edit:posts)"
                value={newPermName}
                onChange={(e) => setNewPermName(e.target.value)}
                disabled={creating}
              />
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </Button>
            </div>
            <Input
              placeholder="Description (optional)"
              value={newPermDesc}
              onChange={(e) => setNewPermDesc(e.target.value)}
              disabled={creating}
            />
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">
          All Permissions ({permissions.length})
        </h3>
        {loading ? (
          <p>Loading permissions...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {permissions.map((permission) => (
              <Card key={permission.id} className="hover:bg-slate-50">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {permission.name}
                      </h4>
                      {permission.description && (
                        <p className="text-sm text-slate-600">
                          {permission.description}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(permission.id)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
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
  );
}
