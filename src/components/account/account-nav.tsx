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
    <nav className="flex gap-1 border-b border-stone-200">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "border-b-2 px-4 py-3 text-sm font-medium transition-colors -mb-px",
            pathname === link.href
              ? "border-stone-900 text-stone-900"
              : "border-transparent text-stone-500 hover:text-stone-800",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
