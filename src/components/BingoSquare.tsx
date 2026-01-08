"use client";

import { cn } from "@/lib/utils";
import {
  Difficulty,
  difficultyStyles,
  difficultyMarkedStyles,
  difficultySelectedStyles,
  difficultyDotColors,
} from "@/lib/gameUtils";
import { Check } from "lucide-react";

interface BingoSquareProps {
  challenge: string;
  difficulty: Difficulty;
  marked: boolean;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

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
          difficultyDotColors[difficulty]
        )}
      />
    </button>
  );
}
