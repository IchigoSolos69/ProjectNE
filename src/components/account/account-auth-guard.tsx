"use client";

import { useAuthStore } from "@/stores/auth-store";
import { FamilyAuthPanel } from "@/components/auth/family-auth-panel";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

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
      <div className="mx-auto max-w-lg">
        <FamilyAuthPanel showCharacters />
        <p className="mt-6 text-center text-sm text-stone-500">
          Prefer full screen?{" "}
          <Link href="/login" className="font-medium text-[#007A78] hover:underline">
            Open login page
          </Link>
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
