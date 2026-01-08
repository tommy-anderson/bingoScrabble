// All possible winning lines for a 5x5 bingo board
export const WINNING_LINES = [
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
] as const;

// Calculate the best progress towards any bingo line
export function getBestLineProgress(squares: { marked: boolean }[]): number {
  let maxMarked = 0;
  for (const line of WINNING_LINES) {
    const markedInLine = line.filter((idx) => squares[idx]?.marked).length;
    maxMarked = Math.max(maxMarked, markedInLine);
  }
  return maxMarked;
}

// Difficulty types
export type Difficulty = "easy" | "medium" | "hard";

// Difficulty styling for squares (default state)
export const difficultyStyles: Record<Difficulty, string> = {
  easy: "bg-emerald-900/70 border-emerald-600 hover:border-emerald-400 hover:bg-emerald-800/80",
  medium:
    "bg-amber-900/70 border-amber-600 hover:border-amber-400 hover:bg-amber-800/80",
  hard: "bg-red-900/70 border-red-600 hover:border-red-400 hover:bg-red-800/80",
};

// Difficulty styling for marked squares
export const difficultyMarkedStyles: Record<Difficulty, string> = {
  easy: "bg-emerald-700 border-emerald-400 shadow-lg shadow-emerald-900/50",
  medium: "bg-amber-700 border-amber-400 shadow-lg shadow-amber-900/50",
  hard: "bg-red-700 border-red-400 shadow-lg shadow-red-900/50",
};

// Difficulty styling for selected squares (ring)
export const difficultySelectedStyles: Record<Difficulty, string> = {
  easy: "ring-2 ring-emerald-300 ring-offset-2 ring-offset-background scale-[1.02]",
  medium:
    "ring-2 ring-amber-300 ring-offset-2 ring-offset-background scale-[1.02]",
  hard: "ring-2 ring-red-300 ring-offset-2 ring-offset-background scale-[1.02]",
};

// Difficulty styling for detail panels
export const difficultyPanelStyles: Record<Difficulty, string> = {
  easy: "bg-emerald-900/40 border-emerald-600",
  medium: "bg-amber-900/40 border-amber-600",
  hard: "bg-red-900/40 border-red-600",
};

// Difficulty dot colors
export const difficultyDotColors: Record<Difficulty, string> = {
  easy: "bg-emerald-400",
  medium: "bg-amber-400",
  hard: "bg-red-400",
};

// Actor types
export type Actor = "you" | "anyone" | "anyOpponent" | "opponent1" | "opponent2" | "opponent3";

// Actor emoji mappings
export const actorEmojis: Record<Actor, string> = {
  you: "🫵",
  anyone: "🌎",
  anyOpponent: "⚔️",
  opponent1: "1️⃣",
  opponent2: "2️⃣",
  opponent3: "3️⃣",
};

// Check if an actor is a targeted opponent
export function isTargetedOpponent(actor: Actor): boolean {
  return actor === "opponent1" || actor === "opponent2" || actor === "opponent3";
}

// Get opponent index from actor (0-based)
export function getOpponentIndex(actor: Actor): number | null {
  if (actor === "opponent1") return 0;
  if (actor === "opponent2") return 1;
  if (actor === "opponent3") return 2;
  return null;
}

// Infer actor from old challenge text format (backward compatibility)
export function inferActorFromChallenge(challenge: string, otherPlayerNames: string[] = []): Actor {
  const lowerChallenge = challenge.toLowerCase();
  
  // Check for specific player names first (hard challenges)
  for (let i = 0; i < Math.min(otherPlayerNames.length, 3); i++) {
    if (lowerChallenge.startsWith(otherPlayerNames[i].toLowerCase() + " ")) {
      return `opponent${i + 1}` as Actor;
    }
  }
  
  if (lowerChallenge.startsWith("you ")) return "you";
  if (lowerChallenge.startsWith("anyone ")) return "anyone";
  if (lowerChallenge.startsWith("any opponent ")) return "anyOpponent";
  
  // Default fallback
  return "you";
}

// Strip actor prefix from old challenge text format (backward compatibility)
export function stripActorFromChallenge(challenge: string, otherPlayerNames: string[] = []): string {
  // Check for specific player names first
  for (const name of otherPlayerNames) {
    if (challenge.toLowerCase().startsWith(name.toLowerCase() + " ")) {
      const stripped = challenge.slice(name.length + 1);
      return stripped.charAt(0).toUpperCase() + stripped.slice(1);
    }
  }
  
  // Check for known actor prefixes
  const prefixes = ["You ", "Anyone ", "Any opponent "];
  for (const prefix of prefixes) {
    if (challenge.startsWith(prefix)) {
      const stripped = challenge.slice(prefix.length);
      return stripped.charAt(0).toUpperCase() + stripped.slice(1);
    }
  }
  
  return challenge;
}
