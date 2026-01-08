"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/hooks/useSession";
import { Dice5, Users, Sparkles, Wine } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { saveSession, getSessionId } = useSession();
  const createGame = useMutation(api.games.create);

  const [mode, setMode] = useState<"home" | "create" | "join">("home");
  const [name, setName] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [drinkingMode, setDrinkingMode] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const sessionId = getSessionId();
      const result = await createGame({
        hostName: name.trim(),
        sessionId,
        drinkingMode,
      });

      saveSession({
        sessionId,
        playerId: result.playerId,
        gameCode: result.gameCode,
        playerName: name.trim(),
      });

      router.push(`/game/${result.gameCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create game");
      setIsLoading(false);
    }
  };

  const handleJoin = () => {
    if (gameCode.trim().length !== 6) {
      setError("Game code must be 6 characters");
      return;
    }
    router.push(`/game/${gameCode.trim().toUpperCase()}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-2xl mb-4">
            <Dice5 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold font-heading text-primary mb-2">
            BINGO
          </h1>
          <p className="text-xl text-muted-foreground font-heading">
            Scrabble Edition
          </p>
        </div>

        {mode === "home" && (
          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full text-lg"
              onClick={() => setMode("create")}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Create Game
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or join a friend
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Enter Game Code"
                value={gameCode}
                onChange={(e) => {
                  setGameCode(e.target.value.toUpperCase());
                  setError("");
                }}
                maxLength={6}
                className="text-center font-mono text-lg tracking-widest uppercase"
              />
              <Button
                variant="secondary"
                onClick={handleJoin}
                disabled={gameCode.length !== 6}
              >
                <Users className="h-5 w-5" />
              </Button>
            </div>
            {error && <p className="text-destructive text-sm text-center">{error}</p>}
          </div>
        )}

        {mode === "create" && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Game</CardTitle>
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
                  maxLength={20}
                  autoFocus
                />
              </div>
              
              {/* Drinking Mode Toggle */}
              <button
                type="button"
                onClick={() => setDrinkingMode(!drinkingMode)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  drinkingMode
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${drinkingMode ? "bg-amber-500/20" : "bg-muted"}`}>
                    <Wine className={`w-5 h-5 ${drinkingMode ? "text-amber-500" : "text-muted-foreground"}`} />
                  </div>
                  <div className="text-left">
                    <p className={`font-medium ${drinkingMode ? "text-amber-500" : "text-foreground"}`}>
                      Drinking Mode
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Random squares trigger shots!
                    </p>
                  </div>
                </div>
                <div
                  className={`w-12 h-7 rounded-full transition-colors relative ${
                    drinkingMode ? "bg-amber-500" : "bg-muted"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      drinkingMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </div>
              </button>

              {error && <p className="text-destructive text-sm">{error}</p>}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMode("home");
                    setError("");
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={isLoading || name.trim().length < 2}
                  className="flex-1"
                >
                  {isLoading ? "Creating..." : "Create"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <p className="text-muted-foreground text-sm mt-8 text-center">
        Play bingo challenges during your Scrabble games!
      </p>
    </main>
  );
}
