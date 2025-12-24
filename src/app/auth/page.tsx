"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Mail, User, ArrowRight } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const setAuth = useAuth((state) => state.setAuth);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isLogin ? "login" : "signup",
          ...(isLogin ? {} : { username }),
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred");
        return;
      }

      setAuth(data.token, {
        userId: data.user.id,
        email: data.user.email,
        roles: data.user.roles || [],
      });

      router.push("/dashboard");
    } catch (err) {
        console.log(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-sm border-slate-700/50 shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="mb-4 flex justify-center">
            <div className="p-3 bg-linear-to-br from-blue-500 to-purple-600 rounded-full">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <p className="text-slate-400 text-sm mt-2">
            {isLogin ? "Sign in to your account" : "Join us today"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200 items-center gap-2">
                  <User className="w-4 h-4" /> Username
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="bg-slate-800/50 border-slate-700 focus:border-blue-500 focus:bg-slate-800/80 transition-all"
                  required={!isLogin}
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-2 text-slate-200 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="bg-slate-800/50 border-slate-700 focus:border-blue-500 focus:bg-slate-800/80 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-200 items-center gap-2">
                <Lock className="w-4 h-4" /> Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-slate-800/50 border-slate-700 focus:border-blue-500 focus:bg-slate-800/80 transition-all"
                required
              />
            </div>
            {error && (
              <div className="rounded-lg bg-red-900/20 border border-red-700/50 p-4 backdrop-blur-sm">
                <p className="text-sm text-red-300 flex items-center gap-2">
                  <span className="text-lg">⚠️</span> {error}
                </p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-blue-600/30"
              disabled={loading}
            >
              {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>
          <div className="mt-6 text-center border-t border-slate-700/50 pt-6">
            <p className="text-sm text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
