"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface CloseModalProps {
  playerName: string;
  onDismiss: () => void;
}

// Pulse animation component
function PulseRing({ delay }: { delay: number }) {
  return (
    <div
      className="absolute inset-0 rounded-full border-2 border-orange-400/50"
      style={{
        animation: `pulse-ring 2s ease-out ${delay}s infinite`,
      }}
    />
  );
}

export function CloseModal({ playerName, onDismiss }: CloseModalProps) {
  const [showPulse, setShowPulse] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-orange-950/80 backdrop-blur-sm cursor-pointer"
      onClick={onDismiss}
    >
      {/* Modal content */}
      <div
        className="relative text-center p-8 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning icon with pulse */}
        <div className="mb-6">
          <div className="relative inline-flex items-center justify-center w-28 h-28">
            {showPulse && (
              <>
                <PulseRing delay={0} />
                <PulseRing delay={0.5} />
                <PulseRing delay={1} />
              </>
            )}
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-orange-500/30 animate-trophy-bounce">
              <AlertTriangle className="w-14 h-14 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Warning emoji decoration */}
        <div className="flex justify-center gap-3 mb-4 text-3xl">
          <span>⚠️</span>
          <span>🔥</span>
          <span>⚠️</span>
        </div>

        {/* Main text */}
        <h1 className="text-4xl font-bold font-heading mb-2 text-orange-400">
          CLOSE CALL!
        </h1>
        <p className="text-2xl font-heading text-white mb-2">{playerName}</p>
        <p className="text-orange-200/80 mb-8">
          is just ONE square away from winning! 🎯
        </p>

        {/* Dismiss button */}
        <Button
          size="lg"
          onClick={onDismiss}
          className="text-white bg-orange-500 hover:bg-orange-600"
        >
          ⚡ Got It!
        </Button>

        <p className="text-orange-200/50 text-sm mt-4">Tap anywhere to dismiss</p>
      </div>
    </div>
  );
}
