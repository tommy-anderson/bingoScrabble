"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id, Doc } from "../../../../convex/_generated/dataModel";
import { useSession } from "@/hooks/useSession";
import { GameLobby } from "@/components/GameLobby";
import { BingoBoard } from "@/components/BingoBoard";
import { WinnerModal } from "@/components/WinnerModal";
import { JoinGameForm } from "@/components/JoinGameForm";
import { Loader2 } from "lucide-react";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();

  const { session, isLoading: sessionLoading, saveSession, getSessionId } = useSession();
  const [currentPlayerId, setCurrentPlayerId] = useState<Id<"players"> | null>(null);

  // Queries
  const game = useQuery(api.games.getByCode, { code });
  const players = useQuery(
    api.players.getInGame,
    game ? { gameId: game._id } : "skip"
  );
  const board = useQuery(
    api.boards.getByPlayer,
    currentPlayerId ? { playerId: currentPlayerId } : "skip"
  );
  const allBoards = useQuery(
    api.boards.getByGame,
    game?._id ? { gameId: game._id } : "skip"
  );

  // Check if user has a valid session for this game
  useEffect(() => {
    if (sessionLoading || !game) return;

    if (session?.gameCode?.toUpperCase() === code && session?.playerId) {
      // Verify the player still exists in this game
      const playerExists = players?.some(
        (p: Doc<"players">) => p._id === session.playerId
      );
      if (playerExists) {
        setCurrentPlayerId(session.playerId as Id<"players">);
      }
    }
  }, [session, code, players, sessionLoading, game]);

  // Handle successful join
  const handleJoined = (playerId: string, playerName: string) => {
    const sessionId = getSessionId();
    saveSession({
      sessionId,
      playerId,
      gameCode: code,
      playerName,
    });
    setCurrentPlayerId(playerId as Id<"players">);
  };

  // Loading state
  if (sessionLoading || game === undefined) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  // Game not found
  if (game === null) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-heading mb-2">Game Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The game code &quot;{code}&quot; doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-primary hover:underline"
          >
            Go back home
          </button>
        </div>
      </main>
    );
  }

  // Need to join the game
  if (!currentPlayerId) {
    // Check if game already started
    if (game.status !== "lobby") {
      return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold font-heading mb-2">Game Already Started</h1>
            <p className="text-muted-foreground mb-4">
              This game has already started and you weren&apos;t part of it.
            </p>
            <button
              onClick={() => router.push("/")}
              className="text-primary hover:underline"
            >
              Go back home
            </button>
          </div>
        </main>
      );
    }

    // Check if game is full
    if (players && players.length >= 4) {
      return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold font-heading mb-2">Game is Full</h1>
            <p className="text-muted-foreground mb-4">
              This game already has 4 players.
            </p>
            <button
              onClick={() => router.push("/")}
              className="text-primary hover:underline"
            >
              Go back home
            </button>
          </div>
        </main>
      );
    }

    return (
      <JoinGameForm
        gameCode={code}
        gameId={game._id}
        onJoined={handleJoined}
        existingNames={players?.map((p: Doc<"players">) => p.name) ?? []}
      />
    );
  }

  // Get current player data
  const currentPlayer = players?.find((p: Doc<"players">) => p._id === currentPlayerId);
  const winner = game.winnerId
    ? players?.find((p: Doc<"players">) => p._id === game.winnerId)
    : null;

  // Game finished - show winner
  if (game.status === "finished" && winner) {
    const isWinner = winner._id === currentPlayerId;
    return (
      <>
        <BingoBoard
          board={board}
          player={currentPlayer}
          allBoards={allBoards ?? []}
          players={players ?? []}
          gameStatus={game.status}
          currentPlayerId={currentPlayerId}
        />
        <WinnerModal
          winnerName={winner.name}
          isCurrentPlayer={isWinner}
          onGoHome={() => router.push("/")}
        />
      </>
    );
  }

  // Game in progress - show board
  if (game.status === "playing") {
    return (
      <BingoBoard
        board={board}
        player={currentPlayer}
        allBoards={allBoards ?? []}
        players={players ?? []}
        gameStatus={game.status}
        currentPlayerId={currentPlayerId}
      />
    );
  }

  // Game in lobby
  return (
    <GameLobby
      game={game}
      players={players ?? []}
      currentPlayerId={currentPlayerId}
    />
  );
}
