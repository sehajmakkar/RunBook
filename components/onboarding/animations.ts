import { Variants, Easing } from "framer-motion";

// Custom easing for smooth, natural motion
const smoothEase: Easing = [0.16, 1, 0.3, 1];

// Backdrop animation
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, delay: 0.1 },
  },
};

// Modal container animation
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: smoothEase,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 },
  },
};

// Step content animation (slide between steps)
export const stepVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: smoothEase,
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: smoothEase,
    },
  }),
};

// Staggered children animation
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: smoothEase,
    },
  },
};

// Button hover animation
export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.2 },
};

export const buttonTap = {
  scale: 0.98,
};

// Input focus animation
export const inputFocusVariants: Variants = {
  idle: {
    scale: 1,
    boxShadow: "0 0 0 0 rgba(21, 109, 149, 0)",
  },
  focused: {
    scale: 1,
    boxShadow: "0 0 0 3px rgba(21, 109, 149, 0.15)",
    transition: { duration: 0.2 },
  },
};

// Card selection animation
export const cardSelectVariants: Variants = {
  idle: {
    scale: 1,
    y: 0,
  },
  selected: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.3,
      ease: smoothEase,
    },
  },
};

// Fade in animation for list items
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: smoothEase,
    },
  },
  exit: {
    opacity: 0,
    y: -15,
    transition: {
      duration: 0.2,
    },
  },
};

// Scale in animation
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: smoothEase,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
    },
  },
};

// Time picker scroll animation
export const scrollSnapVariants: Variants = {
  inactive: {
    opacity: 0.3,
    scale: 0.9,
  },
  active: {
    opacity: 1,
    scale: 1.1,
    transition: {
      duration: 0.2,
      ease: smoothEase,
    },
  },
};
