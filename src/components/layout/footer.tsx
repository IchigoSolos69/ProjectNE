import Link from "next/link";
import { BRAND_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <p className="font-serif text-lg text-stone-900">{BRAND_NAME}</p>
            <p className="mt-2 max-w-md text-sm text-stone-500">
              Premium bedding, bath linens, and pillow covers — crafted for
              restful living.
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-stone-600">
            <Link href="/faq" className="hover:text-stone-900">
              FAQ
            </Link>
            <Link href="/login" className="hover:text-stone-900">
              Sign in
            </Link>
            <Link href="/account/profile" className="hover:text-stone-900">
              Account
            </Link>
            <Link href="/checkout" className="hover:text-stone-900">
              Checkout
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-stone-400">
          © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
