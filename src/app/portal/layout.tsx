"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Loader2 } from "lucide-react";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not logged in, redirect to login
        router.push("/auth/login");
        return;
      }

      // Check if profile exists
      try {
        const res = await fetch("/api/portal/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.uid, action: "get" }),
        });
        const data = await res.json();

        if (data.success && data.data) {
          // Profile exists. If they are on onboarding, redirect to dashboard.
          if (pathname === "/portal/onboarding") {
            router.push("/portal");
          }
        } else {
          // Profile doesn't exist. Redirect to onboarding.
          if (pathname !== "/portal/onboarding") {
            router.push("/portal/onboarding");
          }
        }
      } catch (err) {
        console.error("Failed to check profile", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {children}
    </div>
  );
}
