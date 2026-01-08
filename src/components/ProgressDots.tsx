"use client";

import { cn } from "@/lib/utils";

interface ProgressDotsProps {
  /** Current progress (number of filled dots) */
  progress: number;
  /** Total number of dots to display (default: 5) */
  total?: number;
  /** CSS class for filled dots (default: "bg-primary") */
  filledClass?: string;
  /** CSS class for empty dots (default: "bg-muted") */
  emptyClass?: string;
  /** Size variant */
  size?: "sm" | "md";
}

export function ProgressDots({
  progress,
  total = 5,
  filledClass = "bg-primary",
  emptyClass = "bg-muted",
  size = "sm",
}: ProgressDotsProps) {
  const sizeClass = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5";
  const gapClass = size === "sm" ? "gap-0.5" : "gap-1";

  return (
    <div className={cn("flex", gapClass)}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            sizeClass,
            "rounded-full transition-colors",
            i < progress ? filledClass : emptyClass
          )}
        />
      ))}
    </div>
  );
}
