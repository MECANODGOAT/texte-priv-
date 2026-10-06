"use client";

import { MotionConfig } from "motion/react";

// Les animations motion suivent le réglage système « réduire les animations ».
export default function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
