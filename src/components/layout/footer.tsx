import Link from "next/link";
import { BRAND_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <p className="font-serif text-lg text-foreground">{BRAND_NAME}</p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Premium bedding, bath linens, and pillow covers — crafted for
              restful living.
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <Link href="/faq" className="hover:text-foreground">
              FAQ
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Sign in
            </Link>
            <Link href="/account/profile" className="hover:text-foreground">
              Account
            </Link>
            <Link href="/checkout" className="hover:text-foreground">
              Checkout
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-muted-foreground/80">
          © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
