"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trophy, PartyPopper, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface WinnerModalProps {
  winnerName: string;
  isCurrentPlayer: boolean;
  onGoHome: () => void;
}

// Confetti piece component
function ConfettiPiece({ delay, left }: { delay: number; left: number }) {
  const colors = [
    "bg-primary",
    "bg-accent",
    "bg-emerald-400",
    "bg-red-400",
    "bg-amber-400",
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const size = Math.random() * 8 + 4;
  const rotation = Math.random() * 360;

  return (
    <div
      className={cn(
        "absolute top-0 rounded-sm",
        randomColor
      )}
      style={{
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        transform: `rotate(${rotation}deg)`,
        animation: `confetti-fall 2.5s ease-out ${delay}s forwards`,
      }}
    />
  );
}

export function WinnerModal({
  winnerName,
  isCurrentPlayer,
  onGoHome,
}: WinnerModalProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Stop confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Generate confetti pieces
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.5,
    left: Math.random() * 100,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confettiPieces.map((piece) => (
            <ConfettiPiece
              key={piece.id}
              delay={piece.delay}
              left={piece.left}
            />
          ))}
        </div>
      )}

      {/* Modal content */}
      <div className="relative text-center p-8 animate-fade-in">
        {/* Trophy */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-accent/20 rounded-full animate-trophy-bounce">
            <Trophy className="w-12 h-12 text-accent" />
          </div>
        </div>

        {/* Celebration icons */}
        <div className="flex justify-center gap-2 mb-4">
          <PartyPopper className="w-6 h-6 text-primary" />
          <PartyPopper className="w-6 h-6 text-accent transform scale-x-[-1]" />
        </div>

        {/* Winner text */}
        <h1 className="text-4xl font-bold font-heading text-primary mb-2">
          {isCurrentPlayer ? "YOU WON!" : `${winnerName} WINS!`}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isCurrentPlayer
            ? "Congratulations! You got BINGO!"
            : "Better luck next time!"}
        </p>

        {/* Action button */}
        <Button size="lg" onClick={onGoHome}>
          <Home className="mr-2 h-5 w-5" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
