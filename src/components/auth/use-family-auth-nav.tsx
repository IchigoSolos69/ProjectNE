"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AuthView = "home" | "email-signin" | "email-signup" | "success";

type FamilyAuthNavContextValue = {
  view: AuthView;
  direction: number;
  setView: (view: AuthView) => void;
  goBack: () => void;
};

const FamilyAuthNavContext = createContext<FamilyAuthNavContextValue | null>(
  null,
);

const VIEW_ORDER: AuthView[] = ["home", "email-signin", "email-signup", "success"];

export function FamilyAuthNavProvider({
  children,
  initialView = "home",
}: {
  children: ReactNode;
  initialView?: AuthView;
}) {
  const [view, setViewState] = useState<AuthView>(initialView);
  const [direction, setDirection] = useState(1);

  const setView = useCallback((next: AuthView) => {
    setDirection(VIEW_ORDER.indexOf(next) >= VIEW_ORDER.indexOf(view) ? 1 : -1);
    setViewState(next);
  }, [view]);

  const goBack = useCallback(() => {
    if (view === "email-signin" || view === "email-signup") {
      setView("home");
    }
  }, [view, setView]);

  const value = useMemo(
    () => ({ view, direction, setView, goBack }),
    [view, direction, setView, goBack],
  );

  return (
    <FamilyAuthNavContext.Provider value={value}>
      {children}
    </FamilyAuthNavContext.Provider>
  );
}

export function useFamilyAuthNav() {
  const ctx = useContext(FamilyAuthNavContext);
  if (!ctx) {
    throw new Error("useFamilyAuthNav must be used within FamilyAuthNavProvider");
  }
  return ctx;
}
