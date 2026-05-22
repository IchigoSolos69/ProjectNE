"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2, Mail, Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useFamilyAuthNav } from "@/components/auth/use-family-auth-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRAND_NAME } from "@/lib/constants";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { AuthErrorBanner } from "@/components/auth/auth-error-banner";
import type { CharacterMood } from "@/components/auth/auth-characters";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 48 : -48,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -48 : 48,
    opacity: 0,
  }),
};

interface ViewProps {
  onSuccess?: () => void;
  onMoodChange?: (mood: CharacterMood) => void;
}

export function AuthHomeView({ onSuccess, onMoodChange }: ViewProps) {
  const { setView, direction } = useFamilyAuthNav();
  const { loginWithGoogle } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      // OAuth redirects away; success view runs after /auth/callback
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="home"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="space-y-5"
    >
      <AuthErrorBanner message={error} onDismiss={() => setError(null)} />
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <h2 className="font-serif text-2xl text-foreground">Welcome back</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to {BRAND_NAME} for orders, wishlists, and faster checkout.
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={loading}
        onClick={handleGoogle}
        className="flex h-12 w-full items-center justify-center gap-3 border-border bg-card hover:bg-muted"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        <span>{loading ? "Connecting…" : "Continue with Google"}</span>
      </Button>

      <div className="relative flex items-center py-1">
        <div className="grow border-t border-border" />
        <span className="mx-3 text-xs uppercase tracking-wider text-muted-foreground/80">
          or
        </span>
        <div className="grow border-t border-border" />
      </div>

      <Button
        type="button"
        className="h-12 w-full bg-primary text-white hover:bg-primary/90"
        onClick={() => {
          onMoodChange?.("idle");
          setView("email-signin");
        }}
      >
        <Mail className="mr-2 h-4 w-4" />
        Continue with email
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <button
          type="button"
          className="font-medium text-primary underline-offset-4 hover:underline"
          onClick={() => setView("email-signup")}
        >
          Create an account
        </button>
      </p>
    </motion.div>
  );
}

export function AuthEmailSignInView({ onSuccess, onMoodChange }: ViewProps) {
  const { goBack, setView, direction } = useFamilyAuthNav();
  const { loginWithEmail } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <motion.div
      key="email-signin"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="space-y-4"
    >
      <AuthErrorBanner message={error} onDismiss={() => setError(null)} />
      <button
        type="button"
        onClick={goBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div>
        <h2 className="font-serif text-xl text-foreground">Sign in with email</h2>
        <p className="text-sm text-muted-foreground">We&apos;ll remember you on this device.</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="signin-email">Email</Label>
          <Input
            id="signin-email"
            type="email"
            autoComplete="email"
            value={email}
            onFocus={() => onMoodChange?.("email")}
            onBlur={() => onMoodChange?.("idle")}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="signin-password">Password</Label>
          <div className="relative">
            <Input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onFocus={() =>
                onMoodChange?.(showPassword ? "password-visible" : "password-hidden")
              }
              onBlur={() => onMoodChange?.("idle")}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80"
              onClick={() => {
                setShowPassword((v) => !v);
                onMoodChange?.(!showPassword ? "password-visible" : "password-hidden");
              }}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <Button
        className="h-12 w-full bg-primary hover:bg-primary/90"
        disabled={!email || !password || loading}
        onClick={async () => {
          setLoading(true);
          setError(null);
          try {
            const result = await loginWithEmail(email, password);
            if (result === "signed_in") {
              setView("success");
              onSuccess?.();
            }
          } catch (err) {
            setError(getAuthErrorMessage(err));
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
      </Button>
    </motion.div>
  );
}

export function AuthEmailSignUpView({ onSuccess, onMoodChange }: ViewProps) {
  const { goBack, setView, direction } = useFamilyAuthNav();
  const { loginWithEmail } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  return (
    <motion.div
      key="email-signup"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="space-y-4"
    >
      <AuthErrorBanner message={error} onDismiss={() => setError(null)} />
      {info && (
        <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground">
          {info}
        </p>
      )}
      <button
        type="button"
        onClick={goBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div>
        <h2 className="font-serif text-xl text-foreground">Create your account</h2>
        <p className="text-sm text-muted-foreground">Join for curated home essentials.</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="signup-name">Full name</Label>
          <Input
            id="signup-name"
            value={name}
            onFocus={() => onMoodChange?.("email")}
            onBlur={() => onMoodChange?.("idle")}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aditi Sharma"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            value={email}
            onFocus={() => onMoodChange?.("email")}
            onBlur={() => onMoodChange?.("idle")}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="signup-password">Password</Label>
          <div className="relative">
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onFocus={() =>
                onMoodChange?.(showPassword ? "password-visible" : "password-hidden")
              }
              onBlur={() => onMoodChange?.("idle")}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80"
              onClick={() => {
                setShowPassword((v) => !v);
                onMoodChange?.(!showPassword ? "password-visible" : "password-hidden");
              }}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <Button
        className="h-12 w-full bg-primary hover:bg-primary/90"
        disabled={!name || !email || !password || loading}
        onClick={async () => {
          setLoading(true);
          setError(null);
          setInfo(null);
          try {
            const result = await loginWithEmail(email, password, name);
            if (result === "confirm_email") {
              setInfo(
                `We sent a confirmation link to ${email}. Open it, then sign in here.`,
              );
              return;
            }
            setView("success");
            onSuccess?.();
          } catch (err) {
            setError(getAuthErrorMessage(err));
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
      </Button>
    </motion.div>
  );
}

export function AuthSuccessView({ onDone }: { onDone?: () => void }) {
  return (
    <motion.div
      key="success"
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center py-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.05 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15"
      >
        <motion.svg
          viewBox="0 0 24 24"
          className="h-8 w-8 text-primary"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <motion.path
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          />
        </motion.svg>
      </motion.div>
      <h2 className="mt-4 font-serif text-xl text-foreground">You&apos;re in</h2>
      <p className="mt-1 text-sm text-muted-foreground">Welcome to the nest.</p>
      {onDone && (
        <Button className="mt-6 bg-primary" onClick={onDone}>
          Continue shopping
        </Button>
      )}
    </motion.div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}
