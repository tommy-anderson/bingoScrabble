"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Difficulty, Actor, difficultyPanelStyles, actorEmojis } from "@/lib/gameUtils";
import { Check, X } from "lucide-react";

interface ChallengeDetailPanelProps {
  /** The challenge text (null if no square selected) */
  challenge: string | null;
  /** Difficulty level */
  difficulty: Difficulty | null;
  /** Actor type */
  actor: Actor | null;
  /** Whether the challenge is marked as complete */
  marked: boolean;
  /** Callback when mark/unmark button is clicked */
  onToggleMark: () => void;
  /** Whether the game is in playing state */
  disabled?: boolean;
}

export function ChallengeDetailPanel({
  challenge,
  difficulty,
  actor,
  marked,
  onToggleMark,
  disabled = false,
}: ChallengeDetailPanelProps) {
  // Empty state - no square selected
  if (!challenge || !difficulty || !actor) {
    return (
      <div className="mt-2 p-4 rounded-xl border border-dashed border-muted text-center">
        <p className="text-sm text-muted-foreground">
          Tap a square to see the full challenge
        </p>
      </div>
    );
  }

  // Selected state - show challenge details
  return (
    <div
      className={cn(
        "mt-2 p-4 rounded-xl border-2 animate-fade-in",
        difficultyPanelStyles[difficulty]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1 capitalize">
            {difficulty} Challenge
          </p>
          <p className="text-base font-medium">
            <span className="mr-1.5">{actorEmojis[actor]}</span>
            {challenge}
          </p>
        </div>
        <Button
          size="sm"
          variant={marked ? "outline" : "default"}
          onClick={onToggleMark}
          disabled={disabled}
          className="shrink-0"
        >
          {marked ? (
            <>
              <X className="w-4 h-4 mr-1" />
              Unmark
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-1" />
              Mark Done
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
