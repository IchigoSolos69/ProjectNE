"use client";

import { useAuthStore } from "@/stores/auth-store";
import { AuthPrompt } from "./auth-prompt";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function AccountAuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <AuthPrompt />
      </div>
    );
  }

  return <>{children}</>;
}
