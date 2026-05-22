"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function AccountAuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      window.location.href = "/login";
    }
  }, [mounted, user]);

  if (!mounted || !user) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/80" />
      </div>
    );
  }

  return <>{children}</>;
}

