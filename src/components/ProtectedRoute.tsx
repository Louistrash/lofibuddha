"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { Spinner } from "@/components/ui";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else {
        setReady(true);
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  if (!ready) return null;

  return <>{children}</>;
}
