"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface AICommandResult {
  parsed: Record<string, unknown>;
  result: Record<string, unknown>;
}

export default function AICommandPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AICommandResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/auth");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/ai/parse-command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ command }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to process command");
        return;
      }

      setResult(data);
      setCommand("");
    } catch (err) {
        console.log(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Natural Language Commands
        </h2>
        <p className="text-slate-600">
          Use plain English to configure your RBAC settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-slate-700">
            <li>• &ldquo;Create a new role called manager&rdquo;</li>
            <li>• &ldquo;Create a permission to edit articles&rdquo;</li>
            <li>
              • &ldquo;Give the content editor role the permission to edit articles&rdquo;
            </li>
            <li>• &ldquo;Create a user role with no special permissions&rdquo;</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enter Command</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Type your command here..."
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Processing..." : "Execute Command"}
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="font-medium text-blue-900 mb-2">Parsed Command:</p>
                <pre className="bg-white p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(result.parsed, null, 2)}
                </pre>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="font-medium text-green-900 mb-2">Result:</p>
                <pre className="bg-white p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
