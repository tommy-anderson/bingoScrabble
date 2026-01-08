"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { BingoSquare } from "./BingoSquare";
import { cn } from "@/lib/utils";

// All possible winning lines (same as server-side)
const WINNING_LINES = [
  // Rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  // Columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  // Diagonals
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

// Calculate the best progress towards any bingo line
function getBestLineProgress(squares: { marked: boolean }[]): number {
  let maxMarked = 0;
  for (const line of WINNING_LINES) {
    const markedInLine = line.filter((idx) => squares[idx]?.marked).length;
    maxMarked = Math.max(maxMarked, markedInLine);
  }
  return maxMarked;
}

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

  const handleSquareClick = async (index: number) => {
    if (!board || gameStatus !== "playing") return;

    try {
      await markSquare({
        boardId: board._id,
        squareIndex: index,
      });

      // Haptic feedback if supported
      if ("vibrate" in navigator) {
        navigator.vibrate(10);
      }
    } catch (err) {
      console.error("Failed to mark square:", err);
    }
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
      return {
        name: p.name,
        progress,
      };
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
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-lg font-bold font-heading text-primary">
            {player?.name}&apos;s Board
          </h1>
          <p className="text-xs text-muted-foreground">
            {markedCount}/25 marked
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Best line: {bestProgress}/5</p>
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full",
                  i < bestProgress
                    ? "bg-primary"
                    : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bingo Grid */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-5 gap-1 sm:gap-2 w-full max-w-md aspect-square">
          {board.squares.map((square, index) => (
            <BingoSquare
              key={index}
              challenge={square.challenge}
              difficulty={square.difficulty}
              marked={square.marked}
              onClick={() => handleSquareClick(index)}
              disabled={gameStatus !== "playing"}
            />
          ))}
        </div>
      </div>

      {/* Other players' progress */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Other players:</p>
        <div className="flex flex-wrap gap-3">
          {otherPlayersProgress.map((p) => (
            <div key={p.name} className="flex items-center gap-2">
              <span className="text-sm">{p.name}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      i < p.progress
                        ? "bg-accent"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Easy</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span>Hard</span>
        </div>
      </div>
    </main>
  );
}
