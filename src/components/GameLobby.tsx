"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Check, Clock, Copy, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface GameLobbyProps {
  game: Doc<"games">;
  players: Doc<"players">[];
  currentPlayerId: Id<"players">;
}

export function GameLobby({ game, players, currentPlayerId }: GameLobbyProps) {
  const router = useRouter();
  const startGame = useMutation(api.games.start);
  const [isStarting, setIsStarting] = useState(false);
  const [copied, setCopied] = useState(false);

  const isHost = game.hostPlayerId === currentPlayerId;
  const canStart = players.length === 4;

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await startGame({
        gameId: game._id,
        playerId: currentPlayerId,
      });
    } catch (err) {
      console.error("Failed to start game:", err);
      setIsStarting(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(game.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      console.error("Failed to copy");
    }
  };

  // Generate player slots (4 total)
  const playerSlots = Array.from({ length: 4 }, (_, i) => {
    const player = players[i];
    return player || null;
  });

  return (
    <main className="min-h-screen flex flex-col p-4 safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/")}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          ← Leave
        </button>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Game Code</p>
          <p className="font-mono text-primary font-bold">{game.code}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Status */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-heading mb-1">Waiting Room</h1>
          <p className="text-muted-foreground">
            {players.length} of 4 players joined
          </p>
        </div>

        {/* Player list */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Players</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {playerSlots.map((player, index) => (
              <div
                key={player?._id ?? `empty-${index}`}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  player
                    ? "bg-card border-border"
                    : "bg-muted/30 border-dashed border-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  {player ? (
                    <>
                      {player.isHost && (
                        <Crown className="w-4 h-4 text-accent" />
                      )}
                      <span
                        className={
                          player._id === currentPlayerId
                            ? "text-primary font-medium"
                            : ""
                        }
                      >
                        {player.name}
                        {player._id === currentPlayerId && " (you)"}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Waiting...
                    </span>
                  )}
                </div>
                {player && <Check className="w-4 h-4 text-success" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Share code */}
        <div className="mb-6">
          <p className="text-center text-sm text-muted-foreground mb-2">
            Share this code with friends:
          </p>
          <button
            onClick={copyCode}
            className="w-full flex items-center justify-center gap-2 p-4 bg-card border border-border rounded-lg hover:border-primary transition-colors"
          >
            <span className="font-mono text-2xl font-bold tracking-widest text-primary">
              {game.code}
            </span>
            {copied ? (
              <CheckCheck className="w-5 h-5 text-success" />
            ) : (
              <Copy className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Start button (host only) */}
        {isHost && (
          <Button
            size="lg"
            className="w-full"
            disabled={!canStart || isStarting}
            onClick={handleStart}
          >
            {isStarting
              ? "Starting..."
              : canStart
                ? "Start Game"
                : `Need ${4 - players.length} more player${4 - players.length !== 1 ? "s" : ""}`}
          </Button>
        )}

        {!isHost && (
          <p className="text-center text-muted-foreground text-sm">
            Waiting for the host to start the game...
          </p>
        )}
      </div>
    </main>
  );
}
