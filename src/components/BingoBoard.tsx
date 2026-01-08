"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { BingoSquare } from "./BingoSquare";
import { ProgressDots } from "./ProgressDots";
import { ChallengeDetailPanel } from "./ChallengeDetailPanel";
import {
  getBestLineProgress,
  Difficulty,
  Actor,
  actorEmojis,
  inferActorFromChallenge,
  stripActorFromChallenge
} from "@/lib/gameUtils";

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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSquareClick = (index: number) => {
    if (!board || gameStatus !== "playing") return;
    // Toggle selection - tap same square to deselect
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  const handleMarkSquare = async () => {
    if (!board || selectedIndex === null || gameStatus !== "playing") return;

    try {
      await markSquare({
        boardId: board._id,
        squareIndex: selectedIndex,
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
      return { name: p.name, progress };
    });

  // Get selected square data
  const selectedSquare = selectedIndex !== null ? board?.squares[selectedIndex] : null;

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
      <div className="flex items-center justify-between mb-2">
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
          <ProgressDots progress={bestProgress} size="md" />
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
              selected={selectedIndex === index}
              onClick={() => handleSquareClick(index)}
              disabled={gameStatus !== "playing"}
            />
          ))}
        </div>
      </div>

      {/* Detail Panel - shows when a square is selected */}
      <ChallengeDetailPanel
        challenge={selectedSquare?.challenge ?? null}
        difficulty={(selectedSquare?.difficulty as Difficulty) ?? null}
        actor={(selectedSquare?.actor as Actor) ?? null}
        marked={selectedSquare?.marked ?? false}
        onToggleMark={handleMarkSquare}
        disabled={gameStatus !== "playing"}
      />

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
