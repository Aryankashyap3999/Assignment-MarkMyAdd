"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const { token, isHydrated, hydrate } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated) return;
    
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/auth");
    }
  }, [token, isHydrated, router]);

  return null;
}
