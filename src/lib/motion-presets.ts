import type { TargetAndTransition, Transition } from "framer-motion";

export type AnimationFrom =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "center"
  | "none";

export const dialogSpring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 24,
};

export function getContentMotion(from: AnimationFrom = "center") {
  const offset = 16;
  const map: Record<
    AnimationFrom,
    {
      initial: TargetAndTransition;
      animate: TargetAndTransition;
      exit: TargetAndTransition;
    }
  > = {
    top: {
      initial: { opacity: 0, y: -offset, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -offset, scale: 0.98 },
    },
    bottom: {
      initial: { opacity: 0, y: offset, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: offset, scale: 0.98 },
    },
    left: {
      initial: { opacity: 0, x: -offset, scale: 0.98 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: -offset, scale: 0.98 },
    },
    right: {
      initial: { opacity: 0, x: offset, scale: 0.98 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: offset, scale: 0.98 },
    },
    center: {
      initial: { opacity: 0, scale: 0.96 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.96 },
    },
    none: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
    },
  };
  return map[from];
}

export const accordionSpring: Transition = {
  type: "spring",
  stiffness: 150,
  damping: 22,
};
