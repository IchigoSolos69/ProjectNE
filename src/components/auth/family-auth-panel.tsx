"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FamilyAuthNavProvider,
  useFamilyAuthNav,
} from "@/components/auth/use-family-auth-nav";
import {
  AuthEmailSignInView,
  AuthEmailSignUpView,
  AuthHomeView,
  AuthSuccessView,
} from "@/components/auth/family-auth-views";
import type { CharacterMood } from "@/components/auth/auth-characters";

interface FamilyAuthPanelProps {
  onSuccess?: () => void;
  showCharacters?: boolean;
  className?: string;
}

function FamilyAuthPanelInner({
  onSuccess,
  showCharacters = true,
  className = "",
}: FamilyAuthPanelProps) {
  const { view, direction } = useFamilyAuthNav();
  const [mood, setMood] = useState<CharacterMood>("idle");

  useEffect(() => {
    if (view === "home" || view === "success") setMood("idle");
  }, [view]);

  return (
    <div className={className}>

      <div className="relative min-h-[220px] overflow-hidden sm:min-h-[260px]">
        <AnimatePresence mode="wait" custom={direction}>
          {view === "home" && (
            <AuthHomeView onSuccess={onSuccess} onMoodChange={setMood} />
          )}
          {view === "email-signin" && (
            <AuthEmailSignInView onSuccess={onSuccess} onMoodChange={setMood} />
          )}
          {view === "email-signup" && (
            <AuthEmailSignUpView onSuccess={onSuccess} onMoodChange={setMood} />
          )}
          {view === "success" && <AuthSuccessView onDone={onSuccess} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function FamilyAuthPanel(props: FamilyAuthPanelProps) {
  return (
    <FamilyAuthNavProvider>
      <FamilyAuthPanelInner {...props} />
    </FamilyAuthNavProvider>
  );
}
