import { Variants } from "framer-motion";

/** Совпадает с `var(--ease-smooth)` в `styles/globals.css` */
const smooth = [0.22, 1, 0.36, 1] as const;

export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: smooth },
  },
};

export const fadeInVariant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.45, ease: smooth },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.04 },
  },
};

export const scaleInVariant: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.48, ease: smooth },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -48 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: smooth },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: smooth },
  },
};

export const scaleOnHover = {
  whileHover: { scale: 1.03, transition: { duration: 0.2 } },
};

export const drawerVariants: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { type: "spring", damping: 32, stiffness: 320 },
  },
  exit: {
    x: "100%",
    transition: { type: "tween", duration: 0.28, ease: smooth },
  },
};

export const bottomSheetVariants: Variants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: { type: "spring", damping: 32, stiffness: 320 },
  },
  exit: {
    y: "100%",
    transition: { type: "tween", duration: 0.28, ease: smooth },
  },
};

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22, ease: smooth } },
  exit: { opacity: 0, transition: { duration: 0.22, ease: smooth } },
};
