"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface BingoSquareProps {
  challenge: string;
  difficulty: "easy" | "medium" | "hard";
  marked: boolean;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const difficultyStyles = {
  easy: "bg-emerald-950/50 border-emerald-800 hover:border-emerald-600",
  medium: "bg-amber-950/50 border-amber-800 hover:border-amber-600",
  hard: "bg-red-950/50 border-red-800 hover:border-red-600",
};

const difficultyMarkedStyles = {
  easy: "bg-emerald-800 border-emerald-500",
  medium: "bg-amber-800 border-amber-500",
  hard: "bg-red-800 border-red-500",
};

const difficultySelectedStyles = {
  easy: "ring-2 ring-emerald-400 ring-offset-2 ring-offset-background",
  medium: "ring-2 ring-amber-400 ring-offset-2 ring-offset-background",
  hard: "ring-2 ring-red-400 ring-offset-2 ring-offset-background",
};

export function BingoSquare({
  challenge,
  difficulty,
  marked,
  selected = false,
  onClick,
  disabled = false,
}: BingoSquareProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative min-h-[80px] w-full p-1.5 rounded-lg border-2 transition-all duration-150",
        "flex flex-col items-center justify-center text-center",
        "active:scale-95 select-none touch-manipulation",
        marked ? difficultyMarkedStyles[difficulty] : difficultyStyles[difficulty],
        marked && "animate-mark-bounce",
        selected && difficultySelectedStyles[difficulty],
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Challenge text */}
      <span
        className={cn(
          "text-[10px] xs:text-xs sm:text-sm font-medium leading-tight",
          "line-clamp-4 px-0.5",
          marked ? "text-white/80" : "text-foreground"
        )}
      >
        {challenge}
      </span>

      {/* Checkmark overlay */}
      {marked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/20 rounded-full p-1 animate-checkmark-appear">
            <Check className="w-6 h-6 sm:w-8 sm:h-8 text-white stroke-[3]" />
          </div>
        </div>
      )}

      {/* Difficulty indicator dot */}
      <div
        className={cn(
          "absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full",
          difficulty === "easy" && "bg-emerald-400",
          difficulty === "medium" && "bg-amber-400",
          difficulty === "hard" && "bg-red-400"
        )}
      />
    </button>
  );
}
