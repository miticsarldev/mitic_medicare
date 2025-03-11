/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface ClientAnimationWrapperProps {
  children: ReactNode;
  className?: string;
  initialAnimation: any;
  animateAnimation: any;
  transition: any;
}

export function ClientAnimationWrapper({
  children,
  className,
  initialAnimation,
  animateAnimation,
  transition,
}: ClientAnimationWrapperProps) {
  return (
    <motion.div
      className={className}
      initial={initialAnimation}
      animate={animateAnimation}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
