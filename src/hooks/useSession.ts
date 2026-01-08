"use client";

import { useCallback, useEffect, useState } from "react";

export interface StoredSession {
  sessionId: string;
  playerId: string;
  gameCode: string;
  playerName: string;
}

const STORAGE_KEY = "scrabble-bingo-session";

export function useSession() {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSession(parsed);
      }
    } catch {
      // Invalid JSON, clear it
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const saveSession = useCallback((newSession: StoredSession) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
      setSession(newSession);
    } catch {
      // localStorage might be full or disabled
      console.error("Failed to save session");
    }
  }, []);

  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSession(null);
    } catch {
      console.error("Failed to clear session");
    }
  }, []);

  const getSessionId = useCallback((): string => {
    // Return existing session ID or generate a new one
    if (session?.sessionId) {
      return session.sessionId;
    }
    return crypto.randomUUID();
  }, [session]);

  return {
    session,
    isLoading,
    saveSession,
    clearSession,
    getSessionId,
  };
}

// Separate hook for checking session for a specific game
export function useGameSession(gameCode: string) {
  const { session, isLoading } = useSession();

  const isValidForGame = session?.gameCode?.toUpperCase() === gameCode.toUpperCase();

  return {
    session: isValidForGame ? session : null,
    isLoading,
    hasValidSession: isValidForGame,
  };
}
