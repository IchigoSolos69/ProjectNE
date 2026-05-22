"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { FamilyAuthPanel } from "@/components/auth/family-auth-panel";
import { BRAND_NAME } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-muted">
      <div className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-2">
        {/* Left — brand visual (desktop) */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative hidden overflow-hidden bg-gradient-to-br from-nest-brown via-nest-tan to-nest-brown-dark lg:flex lg:flex-col lg:justify-between"
        >
          <div className="absolute inset-0 opacity-30">
            <Image
              src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=1600&fit=crop"
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="relative z-10 p-12">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              {BRAND_NAME}
            </p>
            <h1 className="mt-4 max-w-md font-serif text-4xl leading-tight text-white">
              Your home, signed in.
            </h1>
            <p className="mt-4 max-w-sm text-sm text-white/80">
              Track Delhivery shipments, save addresses, and checkout in one tap.
            </p>
          </div>
          <div className="relative z-10 hidden p-12 lg:block">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
              <p className="text-sm text-white/90">
                &ldquo;The softest sheets we&apos;ve ever owned — and signing in makes
                reorders effortless.&rdquo;
              </p>
              <p className="mt-3 text-xs text-white/60">— Nestify member</p>
            </div>
          </div>
        </motion.div>

        {/* Right — Family-style auth */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16"
        >
          <Link
            href="/"
            className="mb-8 text-sm text-muted-foreground hover:text-foreground lg:hidden"
          >
            ← Back to shop
          </Link>

          <div className="mx-auto w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-xl sm:p-8">
            <FamilyAuthPanel
              showCharacters
              onSuccess={() => router.push("/account/profile")}
            />
          </div>

          <p className="mx-auto mt-6 max-w-sm text-center text-xs text-muted-foreground/80">
            By continuing, you agree to our Terms and Privacy Policy. Supabase auth
            can be wired in when your project keys are ready.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
