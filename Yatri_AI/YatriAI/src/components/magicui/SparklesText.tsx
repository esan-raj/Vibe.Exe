import React, { useEffect, useState, ReactNode, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface Sparkle {
  id: string;
  x: string;
  y: string;
  color: string;
  delay: number;
  scale: number;
  lifespan: number;
}

interface SparklesTextProps {
  children: ReactNode;
  className?: string;
  sparklesCount?: number;
  colors?: {
    first: string;
    second: string;
  };
}

const generateSparkle = (colors: { first: string; second: string }): Sparkle => {
  const color = Math.random() > 0.5 ? colors.first : colors.second;
  return {
    id: Math.random().toString(36).substr(2, 9),
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    color,
    delay: Math.random() * 2,
    scale: Math.random() * 1 + 0.3,
    lifespan: Math.random() * 10 + 5,
  };
};

const SparkleIcon = ({ color, size }: { color: string; size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
      fill={color}
    />
  </svg>
);

export function SparklesText({
  children,
  className,
  sparklesCount = 10,
  colors,
}: SparklesTextProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  
  // Memoize colors to prevent infinite re-renders
  const stableColors = useMemo(() => colors || { first: "#22c55e", second: "#f97316" }, [colors?.first, colors?.second]);

  useEffect(() => {
    const initialSparkles = Array.from({ length: sparklesCount }, () =>
      generateSparkle(stableColors)
    );
    setSparkles(initialSparkles);

    const interval = setInterval(() => {
      setSparkles((currentSparkles) =>
        currentSparkles.map((sparkle) =>
          Date.now() - parseFloat(sparkle.id) > sparkle.lifespan * 1000
            ? generateSparkle(stableColors)
            : sparkle
        )
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [sparklesCount, stableColors]);

  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10">{children}</span>
      {sparkles.map((sparkle) => (
        <motion.span
          key={sparkle.id}
          className="pointer-events-none absolute z-20"
          style={{
            left: sparkle.x,
            top: sparkle.y,
          }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, sparkle.scale, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: "easeInOut",
          }}
        >
          <SparkleIcon color={sparkle.color} size={20} />
        </motion.span>
      ))}
    </span>
  );
}

export default SparklesText;

