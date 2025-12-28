import React, { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface AnimatedGradientTextProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedGradientText({
  children,
  className,
}: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "inline-flex text-kolkata-terracotta dark:text-kolkata-yellow font-semibold",
        className
      )}
    >
      {children}
    </span>
  );
}

export default AnimatedGradientText;

