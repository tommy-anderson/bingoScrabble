"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { BingoSquare } from "./BingoSquare";
import { ProgressDots } from "./ProgressDots";
import {
  getBestLineProgress,
  Actor,
  actorEmojis,
} from "@/lib/gameUtils";
import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

interface BingoBoardProps {
  board: Doc<"boards"> | null | undefined;
  player: Doc<"players"> | undefined;
  allBoards: Doc<"boards">[];
  players: Doc<"players">[];
  gameStatus: "lobby" | "playing" | "finished";
  currentPlayerId: Id<"players">;
}

export function BingoBoard({
  board,
  player,
  allBoards,
  players,
  gameStatus,
  currentPlayerId,
}: BingoBoardProps) {
  const markSquare = useMutation(api.boards.markSquare);
  const [showLegend, setShowLegend] = useState(false);

  const handleSquareClick = async (index: number) => {
    if (!board || gameStatus !== "playing") return;
    // Mark/unmark the square
    await markSquare({ boardId: board._id, squareIndex: index });
  };

  // Calculate progress for current player
  const markedCount = board?.squares.filter((s) => s.marked).length ?? 0;
  const bestProgress = board ? getBestLineProgress(board.squares) : 0;

  // Get other players' progress (best line progress, not total marked)
  const otherPlayersProgress = players
    .filter((p) => p._id !== currentPlayerId)
    .map((p) => {
      const playerBoard = allBoards.find((b) => b.playerId === p._id);
      const progress = playerBoard ? getBestLineProgress(playerBoard.squares) : 0;
      return { name: p.name, progress };
    });

  if (!board) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <p className="text-muted-foreground">Loading board...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col p-2 sm:p-4 safe-area-top safe-area-bottom">
      {/* Legend Modal */}
      {showLegend && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-4 max-w-xs w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold text-primary">Legend</h3>
              <button
                onClick={() => setShowLegend(false)}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Who performs the challenge */}
            <div className="mb-3">
              <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                Who performs
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-6 text-center">{actorEmojis.you}</span>
                  <span>You must do it</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-6 text-center">{actorEmojis.anyone}</span>
                  <span>Anyone can do it</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-6 text-center">{actorEmojis.anyOpponent}</span>
                  <span>Any opponent does it</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-6 text-center">1️⃣2️⃣3️⃣</span>
                  <span>Specific opponent does it</span>
                </div>
              </div>
            </div>

            {/* Difficulty colors */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                Difficulty
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 rounded bg-emerald-600 border border-emerald-400"></span>
                  <span>Easy</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 rounded bg-amber-600 border border-amber-400"></span>
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 rounded bg-red-600 border border-red-400"></span>
                  <span>Hard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-lg font-bold font-heading text-primary">
            {player?.name}&apos;s Board
          </h1>
          <p className="text-xs text-muted-foreground">
            {markedCount}/25 marked
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLegend(true)}
            className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
            title="Show legend"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Best line: {bestProgress}/5</p>
            <ProgressDots progress={bestProgress} size="md" />
          </div>
        </div>
      </div>

      {/* Bingo Grid - taller rectangles */}
      <div className="flex-1 flex items-start justify-center">
        <div
          className="grid grid-cols-5 gap-1 sm:gap-1.5 w-full max-w-md"
          style={{ gridAutoRows: "minmax(115px, auto)" }}
        >
          {board.squares.map((square, index) => (
            <BingoSquare
              key={index}
              challenge={square.challenge}
              difficulty={square.difficulty}
              actor={square.actor as Actor}
              marked={square.marked}
              onClick={() => handleSquareClick(index)}
              disabled={gameStatus !== "playing"}
            />
          ))}
        </div>
      </div>

      {/* Other players' progress */}
      <div className="mt-auto pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground mb-1">Other players:</p>
        <div className="flex flex-wrap gap-3">
          {otherPlayersProgress.map((p, index) => (
            <div key={p.name} className="flex items-center gap-2">
              <span className="text-sm">
                {actorEmojis[`opponent${index + 1}` as Actor]} {p.name}
              </span>
              <ProgressDots progress={p.progress} filledClass="bg-accent" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
