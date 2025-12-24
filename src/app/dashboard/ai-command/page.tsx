"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeftIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react";

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
        // Still show parsed command even on error
        if (data.parsed) {
          setResult({
            parsed: data.parsed,
            result: { error: data.error || "Command execution failed" },
          });
        } else {
          setResult({
            parsed: { debug: "Check browser console for details", raw_error: data.error },
            result: { error: "Failed to parse command" },
          });
        }
        return;
      }

      setResult(data);
      setCommand("");
    } catch (err) {
      console.error("Command execution error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-50 mb-2">
            Natural Language Commands
          </h2>
          <p className="text-slate-400">
            Use plain English to configure your RBAC settings
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard")}
          variant="outline"
          className="text-blue-300 border-slate-700 hover:bg-slate-800/50"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>&ldquo;Create a new role called manager&rdquo;</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>&ldquo;Create a permission to edit articles&rdquo;</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>&ldquo;Give the content editor role the permission to edit articles&rdquo;</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>&ldquo;Create a user role with no special permissions&rdquo;</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-slate-50">Enter Command</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Type your command here..."
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              disabled={loading}
              className="bg-slate-800 border-slate-700 text-slate-50 placeholder:text-slate-500"
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold"
            >
              {loading ? "Processing..." : "Execute Command"}
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-950/50 border border-red-900 text-red-300 rounded-lg flex items-start gap-3">
              <AlertCircleIcon className="w-5 h-5 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              {/* Parsed Command */}
              <div className="border-t border-slate-700 pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircleIcon className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-slate-50">Parsed Command</h3>
                </div>
                <Card className="border-blue-500/30 bg-blue-950/20">
                  <CardContent className="pt-6">
                    <pre className="bg-slate-900 p-4 rounded text-sm overflow-auto text-slate-300 border border-slate-800">
                      {JSON.stringify(result.parsed, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              {/* Result */}
              <div className="border-t border-slate-700 pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-slate-50">Result</h3>
                </div>
                <Card className="border-emerald-500/30 bg-emerald-950/20">
                  <CardContent className="pt-6">
                    <pre className="bg-slate-900 p-4 rounded text-sm overflow-auto text-slate-300 border border-slate-800">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
