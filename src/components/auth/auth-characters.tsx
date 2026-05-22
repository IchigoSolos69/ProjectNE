"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";

export type CharacterMood = "idle" | "email" | "password-hidden" | "password-visible";

interface AuthCharactersProps {
  mood?: CharacterMood;
  className?: string;
}

function Character({
  side,
  mood,
  pupilX,
  pupilY,
}: {
  side: "left" | "right";
  mood: CharacterMood;
  pupilX: number;
  pupilY: number;
}) {
  const hideEyes = mood === "password-hidden";
  const peek = mood === "password-visible";
  const attentive = mood === "email";

  return (
    <motion.div
      className="relative"
      animate={{
        y: attentive ? -4 : peek ? 6 : 0,
        rotate: side === "left" ? (attentive ? -4 : 0) : attentive ? 4 : 0,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
    >
      <div
        className={`h-24 w-24 rounded-[2rem] shadow-lg ${
          side === "left"
            ? "bg-gradient-to-br from-[#007A78] to-[#005a58]"
            : "bg-gradient-to-br from-amber-400 to-amber-600"
        }`}
      />
      {/* Eyes */}
      <div
        className={`absolute left-1/2 top-8 flex -translate-x-1/2 gap-4 transition-opacity ${
          hideEyes ? "opacity-0" : "opacity-100"
        }`}
      >
        {(["l", "r"] as const).map((eye) => (
          <div
            key={eye}
            className="relative h-7 w-7 rounded-full bg-white shadow-inner"
          >
            <div
              className="absolute h-3 w-3 rounded-full bg-stone-900"
              style={{
                left: `calc(50% + ${pupilX * (eye === "l" ? 0.9 : 1.1)}px)`,
                top: `calc(50% + ${pupilY}px)`,
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
        ))}
      </div>
      {/* Hands over eyes when password hidden */}
      {hideEyes && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-2 left-1/2 flex -translate-x-1/2 gap-1"
        >
          <div className="h-8 w-10 rounded-full bg-stone-200/90 shadow" />
          <div className="h-8 w-10 rounded-full bg-stone-200/90 shadow" />
        </motion.div>
      )}
      {/* Smile */}
      <div
        className={`absolute bottom-7 left-1/2 h-3 w-8 -translate-x-1/2 rounded-b-full border-b-2 border-stone-900/70 ${
          hideEyes ? "opacity-0" : "opacity-100"
        }`}
      />
    </motion.div>
  );
}

export function AuthCharacters({ mood = "idle", className = "" }: AuthCharactersProps) {
  const ref = useRef<HTMLDivElement>(null);
  const springX = useSpring(0, { stiffness: 120, damping: 20 });
  const springY = useSpring(0, { stiffness: 120, damping: 20 });
  const [pupil, setPupil] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / 40;
      const dy = (e.clientY - cy) / 40;
      springX.set(Math.max(-6, Math.min(6, dx)));
      springY.set(Math.max(-4, Math.min(4, dy)));
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [springX, springY]);

  useEffect(() => {
    const unsubX = springX.on("change", (v) => setPupil((p) => ({ ...p, x: v })));
    const unsubY = springY.on("change", (v) => setPupil((p) => ({ ...p, y: v })));
    return () => {
      unsubX();
      unsubY();
    };
  }, [springX, springY]);

  return (
    <div
      ref={ref}
      className={`flex items-end justify-center gap-6 ${className}`}
      aria-hidden
    >
      <Character side="left" mood={mood} pupilX={pupil.x} pupilY={pupil.y} />
      <Character side="right" mood={mood} pupilX={pupil.x} pupilY={pupil.y} />
    </div>
  );
}
