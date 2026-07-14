"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, Lock, User, Chrome } from "lucide-react";
import { gsap } from "gsap";
import { signIn } from "next-auth/react";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const formCardRef = useRef<HTMLDivElement>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setErrorMsg(null);
    if (!formCardRef.current) return;
    // Buttery GSAP slide-in-up on load & view toggle
    gsap.fromTo(
      formCardRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1.1, ease: "power4.out" }
    );
  }, [isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Failed to register account.");
        }

        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          throw new Error(signInResult.error);
        }

        window.location.href = "/";
      } else {
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          throw new Error("Invalid email or password.");
        }

        window.location.href = "/";
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] grid grid-cols-1 md:grid-cols-2 bg-[#F6FAFC]">
      {/* Left Panel: Royal Atmosphere Visual */}
      <div className="relative hidden md:flex flex-col justify-between p-12 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/satin-sheets.jpg"
            alt="Luxurious organic cotton bedding"
            fill
            className="object-cover object-center"
            priority
            unoptimized
          />
          {/* Soft Sky mix-blend tint overlay to cool the tone */}
          <div className="absolute inset-0 bg-[#BDE8F5]/35 mix-blend-multiply" />
          {/* Subtle gradient vignette to assist typography legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F2854] via-[#0F2854]/45 to-transparent" />
        </div>

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-block group active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <span className="font-serif text-2xl font-semibold tracking-wide text-white group-hover:text-brand-sky transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
              RareComforts
            </span>
          </Link>
        </div>

        {/* Welcoming Headline */}
        <div className="relative z-10 space-y-4 max-w-lg">
          <h1 className="font-serif text-4xl lg:text-5xl font-bold leading-tight text-white drop-shadow-sm">
            Welcome to the Royal Standard of Sleep.
          </h1>
          <p className="text-sm text-[#BDE8F5]/90 leading-relaxed font-sans">
            Crafting premium Egyptian cotton and satin linens designed for restorative rest and quiet morning luxury.
          </p>
        </div>

        {/* Faded copyright footer */}
        <div className="relative z-10 text-xs text-[#BDE8F5]/50 font-sans">
          &copy; {new Date().getFullYear()} RareComforts Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Functional Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 md:p-16 bg-white relative">
        {/* Soft Sky background highlight bubble */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#BDE8F5]/20 rounded-full blur-3xl -z-10" />

        <div ref={formCardRef} className="w-full max-w-md space-y-8 z-10">
          {/* Mobile Brand Name Header */}
          <div className="text-center md:hidden mb-4">
            <Link href="/" className="font-serif text-2xl font-semibold text-[#0F2854] active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
              RareComforts
            </Link>
          </div>

          <div className="space-y-3 text-center md:text-left">
            <h2 className="font-serif text-3xl font-bold text-[#0F2854] tracking-tight leading-tight">
              {isSignUp ? "Become a RareComforts Member" : "Welcome Back to Luxury"}
            </h2>
            <p className="text-sm text-[#1C4D8D] font-sans">
              {isSignUp
                ? "Join our sleep circle for wellness guides, product releases, and member perks."
                : "Sign in to access your curated orders, registry, and luxury details."}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs font-sans">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {isSignUp && (
                <div className="space-y-1">
                  <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-[#0F2854] font-sans">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-4 w-4 text-[#1C4D8D]/40" />
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#BDE8F5] bg-[#F6FAFC] text-sm text-[#0F2854] placeholder-[#0F2854]/45 focus:border-[#4988C4] focus:bg-white focus:outline-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] font-sans"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-[#0F2854] font-sans">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-[#1C4D8D]/40" />
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#BDE8F5] bg-[#F6FAFC] text-sm text-[#0F2854] placeholder-[#0F2854]/45 focus:border-[#4988C4] focus:bg-white focus:outline-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-[#0F2854] font-sans">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-[#1C4D8D]/40" />
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#BDE8F5] bg-[#F6FAFC] text-sm text-[#0F2854] placeholder-[#0F2854]/45 focus:border-[#4988C4] focus:bg-white focus:outline-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#0F2854] hover:bg-[#1C4D8D] text-white font-sans text-xs font-semibold uppercase tracking-wide rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? "Processing..." : isSignUp ? "Create My Account" : "Sign In to My Account"}
              {!loading && <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#BDE8F5]" />
            <span className="flex-shrink mx-4 text-xs uppercase tracking-wide text-[#1C4D8D]/60 font-sans">
              or continue with
            </span>
            <div className="flex-grow border-t border-[#BDE8F5]" />
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="flex items-center justify-center gap-2 py-3 border border-[#1C4D8D]/30 hover:border-[#1C4D8D] rounded-lg bg-white text-xs font-semibold uppercase tracking-wide text-[#0F2854] active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer hover:bg-[#F6FAFC] font-sans"
            >
              <Chrome className="h-4 w-4 text-[#1C4D8D]" />
              Google
            </button>
            <button
              onClick={() => alert("Apple Login (Mock)")}
              className="flex items-center justify-center gap-2 py-3 border border-[#1C4D8D]/30 hover:border-[#1C4D8D] rounded-lg bg-white text-xs font-semibold uppercase tracking-wide text-[#0F2854] active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer hover:bg-[#F6FAFC] font-sans"
            >
              <svg className="h-4 w-4 fill-current text-[#0F2854]" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z" />
              </svg>
              Apple
            </button>
          </div>

          {/* Toggle Member State */}
          <div className="text-center font-sans">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-semibold uppercase tracking-wide text-[#1C4D8D] hover:text-[#0F2854] active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] underline cursor-pointer"
            >
              {isSignUp ? "Already a Member? Sign In" : "New to Luxury? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
