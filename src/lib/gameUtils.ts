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
  easy: "bg-emerald-950/50 border-emerald-800 hover:border-emerald-600",
  medium: "bg-amber-950/50 border-amber-800 hover:border-amber-600",
  hard: "bg-red-950/50 border-red-800 hover:border-red-600",
};

// Difficulty styling for marked squares
export const difficultyMarkedStyles: Record<Difficulty, string> = {
  easy: "bg-emerald-800 border-emerald-500",
  medium: "bg-amber-800 border-amber-500",
  hard: "bg-red-800 border-red-500",
};

// Difficulty styling for selected squares (ring)
export const difficultySelectedStyles: Record<Difficulty, string> = {
  easy: "ring-2 ring-emerald-400 ring-offset-2 ring-offset-background",
  medium: "ring-2 ring-amber-400 ring-offset-2 ring-offset-background",
  hard: "ring-2 ring-red-400 ring-offset-2 ring-offset-background",
};

// Difficulty styling for detail panels
export const difficultyPanelStyles: Record<Difficulty, string> = {
  easy: "bg-emerald-950/30 border-emerald-700",
  medium: "bg-amber-950/30 border-amber-700",
  hard: "bg-red-950/30 border-red-700",
};

// Difficulty dot colors
export const difficultyDotColors: Record<Difficulty, string> = {
  easy: "bg-emerald-400",
  medium: "bg-amber-400",
  hard: "bg-red-400",
};
