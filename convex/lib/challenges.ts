// Challenge pools - placeholder text for now
// Each board needs 25 unique challenges: 10 easy, 10 medium, 5 hard
// For 4 players, we need at least: 40 easy, 40 medium, 20 hard

export const challenges = {
  easy: [
    "EasyChallenge 1",
    "EasyChallenge 2",
    "EasyChallenge 3",
    "EasyChallenge 4",
    "EasyChallenge 5",
    "EasyChallenge 6",
    "EasyChallenge 7",
    "EasyChallenge 8",
    "EasyChallenge 9",
    "EasyChallenge 10",
    "EasyChallenge 11",
    "EasyChallenge 12",
    "EasyChallenge 13",
    "EasyChallenge 14",
    "EasyChallenge 15",
    "EasyChallenge 16",
    "EasyChallenge 17",
    "EasyChallenge 18",
    "EasyChallenge 19",
    "EasyChallenge 20",
    "EasyChallenge 21",
    "EasyChallenge 22",
    "EasyChallenge 23",
    "EasyChallenge 24",
    "EasyChallenge 25",
    "EasyChallenge 26",
    "EasyChallenge 27",
    "EasyChallenge 28",
    "EasyChallenge 29",
    "EasyChallenge 30",
    "EasyChallenge 31",
    "EasyChallenge 32",
    "EasyChallenge 33",
    "EasyChallenge 34",
    "EasyChallenge 35",
    "EasyChallenge 36",
    "EasyChallenge 37",
    "EasyChallenge 38",
    "EasyChallenge 39",
    "EasyChallenge 40",
  ],
  medium: [
    "MediumChallenge 1",
    "MediumChallenge 2",
    "MediumChallenge 3",
    "MediumChallenge 4",
    "MediumChallenge 5",
    "MediumChallenge 6",
    "MediumChallenge 7",
    "MediumChallenge 8",
    "MediumChallenge 9",
    "MediumChallenge 10",
    "MediumChallenge 11",
    "MediumChallenge 12",
    "MediumChallenge 13",
    "MediumChallenge 14",
    "MediumChallenge 15",
    "MediumChallenge 16",
    "MediumChallenge 17",
    "MediumChallenge 18",
    "MediumChallenge 19",
    "MediumChallenge 20",
    "MediumChallenge 21",
    "MediumChallenge 22",
    "MediumChallenge 23",
    "MediumChallenge 24",
    "MediumChallenge 25",
    "MediumChallenge 26",
    "MediumChallenge 27",
    "MediumChallenge 28",
    "MediumChallenge 29",
    "MediumChallenge 30",
    "MediumChallenge 31",
    "MediumChallenge 32",
    "MediumChallenge 33",
    "MediumChallenge 34",
    "MediumChallenge 35",
    "MediumChallenge 36",
    "MediumChallenge 37",
    "MediumChallenge 38",
    "MediumChallenge 39",
    "MediumChallenge 40",
  ],
  hard: [
    "HardChallenge 1",
    "HardChallenge 2",
    "HardChallenge 3",
    "HardChallenge 4",
    "HardChallenge 5",
    "HardChallenge 6",
    "HardChallenge 7",
    "HardChallenge 8",
    "HardChallenge 9",
    "HardChallenge 10",
    "HardChallenge 11",
    "HardChallenge 12",
    "HardChallenge 13",
    "HardChallenge 14",
    "HardChallenge 15",
    "HardChallenge 16",
    "HardChallenge 17",
    "HardChallenge 18",
    "HardChallenge 19",
    "HardChallenge 20",
  ],
};

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export type Difficulty = "easy" | "medium" | "hard";

export interface Square {
  challenge: string;
  difficulty: Difficulty;
  marked: boolean;
}

// Distribution per board: 10 easy, 10 medium, 5 hard
const DISTRIBUTION: Record<Difficulty, number> = {
  easy: 10,
  medium: 10,
  hard: 5,
};

export function generateBoardsForPlayers(playerCount: number): Square[][] {
  // Shuffle each pool
  const easyPool = shuffle([...challenges.easy]);
  const mediumPool = shuffle([...challenges.medium]);
  const hardPool = shuffle([...challenges.hard]);

  const boards: Square[][] = [];

  for (let i = 0; i < playerCount; i++) {
    // Take unique challenges for this board
    const boardChallenges: Square[] = [];

    // Add easy challenges
    for (let j = 0; j < DISTRIBUTION.easy; j++) {
      const challenge = easyPool.pop();
      if (challenge) {
        boardChallenges.push({
          challenge,
          difficulty: "easy",
          marked: false,
        });
      }
    }

    // Add medium challenges
    for (let j = 0; j < DISTRIBUTION.medium; j++) {
      const challenge = mediumPool.pop();
      if (challenge) {
        boardChallenges.push({
          challenge,
          difficulty: "medium",
          marked: false,
        });
      }
    }

    // Add hard challenges
    for (let j = 0; j < DISTRIBUTION.hard; j++) {
      const challenge = hardPool.pop();
      if (challenge) {
        boardChallenges.push({
          challenge,
          difficulty: "hard",
          marked: false,
        });
      }
    }

    // Shuffle the board so challenges are in random positions
    boards.push(shuffle(boardChallenges));
  }

  return boards;
}

// Win detection
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
];

export function checkWin(squares: { marked: boolean }[]): boolean {
  return WINNING_LINES.some((line) => line.every((index) => squares[index]?.marked));
}
