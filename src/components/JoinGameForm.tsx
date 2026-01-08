"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/hooks/useSession";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface JoinGameFormProps {
  gameCode: string;
  gameId: Id<"games">;
  existingNames: string[];
  onJoined: (playerId: string, playerName: string) => void;
}

export function JoinGameForm({
  gameCode,
  gameId,
  existingNames,
  onJoined,
}: JoinGameFormProps) {
  const router = useRouter();
  const { getSessionId } = useSession();
  const joinGame = useMutation(api.players.join);

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    if (
      existingNames.some(
        (n) => n.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      setError("This name is already taken");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const sessionId = getSessionId();
      const result = await joinGame({
        gameCode,
        playerName: trimmedName,
        sessionId,
      });

      onJoined(result.playerId, trimmedName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join game");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom">
      <div className="w-full max-w-md animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <button
                onClick={() => router.push("/")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              Join Game
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Game Code:{" "}
              <span className="font-mono text-primary font-bold">
                {gameCode}
              </span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Your Name
              </label>
              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && name.trim().length >= 2) {
                    handleJoin();
                  }
                }}
                maxLength={20}
                autoFocus
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button
              onClick={handleJoin}
              disabled={isLoading || name.trim().length < 2}
              className="w-full"
            >
              {isLoading ? "Joining..." : "Join Game"}
            </Button>
          </CardContent>
        </Card>

        {existingNames.length > 0 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Players already in game:</p>
            <p className="text-foreground">{existingNames.join(", ")}</p>
          </div>
        )}
      </div>
    </main>
  );
}
