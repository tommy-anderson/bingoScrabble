"use client";

import { Doc, Id } from "../../convex/_generated/dataModel";
import { Crown, Check, Clock } from "lucide-react";

interface PlayerSlotProps {
  /** Player data (null for empty slot) */
  player: Doc<"players"> | null;
  /** Current user's player ID for highlighting */
  currentPlayerId: Id<"players">;
}

export function PlayerSlot({ player, currentPlayerId }: PlayerSlotProps) {
  const isCurrentPlayer = player?._id === currentPlayerId;

  // Empty slot
  if (!player) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 border-dashed border-muted">
        <span className="text-muted-foreground flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Waiting...
        </span>
      </div>
    );
  }

  // Filled slot
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card border-border">
      <div className="flex items-center gap-3">
        {player.isHost && <Crown className="w-4 h-4 text-accent" />}
        <span className={isCurrentPlayer ? "text-primary font-medium" : ""}>
          {player.name}
          {isCurrentPlayer && " (you)"}
        </span>
      </div>
      <Check className="w-4 h-4 text-success" />
    </div>
  );
}
