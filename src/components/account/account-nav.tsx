"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account/profile", label: "Profile" },
  { href: "/account/settings", label: "Settings" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border overscroll-x-contain">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex min-h-11 flex-1 items-center justify-center border-b-2 px-4 py-3 text-center text-sm font-medium transition-colors -mb-px sm:flex-none",
            pathname === link.href
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
