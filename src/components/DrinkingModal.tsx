"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Wine, Beer } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrinkingModalProps {
  playerName: string;
  drinkType: "shot" | "doubleShot";
  onDismiss: () => void;
}

// Bubble animation component
function Bubble({ delay, left }: { delay: number; left: number }) {
  const size = Math.random() * 12 + 6;

  return (
    <div
      className="absolute bottom-0 rounded-full bg-amber-400/40"
      style={{
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        animation: `bubble-rise 2s ease-out ${delay}s infinite`,
      }}
    />
  );
}

export function DrinkingModal({
  playerName,
  drinkType,
  onDismiss,
}: DrinkingModalProps) {
  const [showBubbles, setShowBubbles] = useState(true);
  const isDoubleShot = drinkType === "doubleShot";

  useEffect(() => {
    // Keep bubbles going
    const timer = setTimeout(() => setShowBubbles(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  // Generate bubble pieces
  const bubbles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    left: Math.random() * 100,
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-amber-950/80 backdrop-blur-sm cursor-pointer"
      onClick={onDismiss}
    >
      {/* Bubbles */}
      {showBubbles && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {bubbles.map((bubble) => (
            <Bubble key={bubble.id} delay={bubble.delay} left={bubble.left} />
          ))}
        </div>
      )}

      {/* Modal content */}
      <div className="relative text-center p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Shot glass icon */}
        <div className="mb-6">
          <div
            className={cn(
              "inline-flex items-center justify-center w-28 h-28 rounded-full animate-trophy-bounce",
              isDoubleShot ? "bg-red-500/30" : "bg-amber-500/30"
            )}
          >
            {isDoubleShot ? (
              <div className="flex gap-1">
                <Wine className="w-10 h-10 text-red-400" />
                <Wine className="w-10 h-10 text-red-400" />
              </div>
            ) : (
              <Beer className="w-14 h-14 text-amber-400" />
            )}
          </div>
        </div>

        {/* Drink emoji decoration */}
        <div className="flex justify-center gap-3 mb-4 text-3xl">
          {isDoubleShot ? (
            <>
              <span>🥃</span>
              <span>🥃</span>
            </>
          ) : (
            <>
              <span>🍺</span>
              <span>🍻</span>
              <span>🍺</span>
            </>
          )}
        </div>

        {/* Main text */}
        <h1
          className={cn(
            "text-4xl font-bold font-heading mb-2",
            isDoubleShot ? "text-red-400" : "text-amber-400"
          )}
        >
          {isDoubleShot ? "DOUBLE SHOT!" : "DRINK UP!"}
        </h1>
        <p className="text-2xl font-heading text-white mb-2">{playerName}</p>
        <p className="text-amber-200/80 mb-8">
          {isDoubleShot
            ? "Hit a double-shot square! Take TWO shots! 🔥"
            : "Hit a drinking square! Take a shot! 🎯"}
        </p>

        {/* Dismiss button */}
        <Button
          size="lg"
          onClick={onDismiss}
          className={cn(
            "text-white",
            isDoubleShot
              ? "bg-red-500 hover:bg-red-600"
              : "bg-amber-500 hover:bg-amber-600"
          )}
        >
          {isDoubleShot ? "🥃🥃 Bottoms Up!" : "🍺 Cheers!"}
        </Button>

        <p className="text-amber-200/50 text-sm mt-4">Tap anywhere to dismiss</p>
      </div>
    </div>
  );
}
