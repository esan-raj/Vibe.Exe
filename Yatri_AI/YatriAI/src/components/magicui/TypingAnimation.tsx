import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface TypingAnimationProps {
  text: string;
  duration?: number;
  className?: string;
}

export function TypingAnimation({
  text,
  duration = 100,
  className,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [i, setI] = useState(0);

  useEffect(() => {
    const typingEffect = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        setI(i + 1);
      } else {
        clearInterval(typingEffect);
      }
    }, duration);

    return () => {
      clearInterval(typingEffect);
    };
  }, [duration, i, text]);

  return (
    <span
      className={cn(
        "font-display text-center tracking-[-0.02em] drop-shadow-sm",
        className
      )}
    >
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

export default TypingAnimation;

