// Challenge Generation System
// Each challenge = Actor + Action
// Distribution per board: 18 Easy, 5 Medium, 2 Hard (25 total)

// ============ ACTION POOLS ============

const EASY_ACTIONS = [
  "scores > 4 points in a turn",
  "scores > 5 points in a turn",
  "scores > 6 points in a turn",
  "scores > 7 points in a turn",
  "scores > 8 points in a turn",
  "plays a word ending in a consonant",
  "plays a word starting with a consonant",
  "plays a word ending in a vowel",
  "plays a word starting with a vowel",
  "uses a Double Letter square",
  "uses a 1-point tile",
  "connects a word to exactly 1 existing tile",
  "plays a word containing 'I'",
  "plays a word containing 'A'",
  "plays a word containing 'E'",
  "plays a word containing 'T'",
];

const MEDIUM_ACTIONS = [
  "scores > 12 points in a turn",
  "adds a prefix or suffix to an existing word",
  "uses a Triple Letter square",
  "uses a Double Word square",
  "uses a 2-point tile",
  "plays a word touching the board edge",
  "plays a 2-letter word",
  "plays a word containing 'S'",
  "plays a word containing 'C'",
  "plays a word containing 'L'",
  "plays a word containing 'U'",
  "plays a word containing 'O'",
];

const HARD_ACTIONS = [
  "scores > 20 points in a turn",
  "uses a tile worth 4+ points",
  "connects a word to 2+ existing tiles",
  "plays a word longer than 6 letters",
  "plays a word touching a board corner",
];

// ============ ACTOR DEFINITIONS ============

// Easy actors: "You" or "Anyone"
const EASY_ACTORS = ["You", "Anyone"];

// Medium actors: "You" or "Any opponent"
const MEDIUM_ACTORS = ["You", "Any opponent"];

// Hard actors: Specific other player's name (passed in dynamically)

// ============ UTILITIES ============

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Pick a random element from an array
function randomPick<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// ============ CHALLENGE GENERATION ============

export type Difficulty = "easy" | "medium" | "hard";

export interface Square {
  challenge: string;
  difficulty: Difficulty;
  marked: boolean;
}

// Distribution per board: 18 easy, 5 medium, 2 hard = 25 total
const DISTRIBUTION: Record<Difficulty, number> = {
  easy: 18,
  medium: 5,
  hard: 2,
};

/**
 * Generate a single challenge string
 */
function generateChallenge(
  difficulty: Difficulty,
  otherPlayerNames: string[]
): string {
  let actor: string;
  let action: string;

  switch (difficulty) {
    case "easy":
      actor = randomPick(EASY_ACTORS);
      action = randomPick(EASY_ACTIONS);
      break;
    case "medium":
      actor = randomPick(MEDIUM_ACTORS);
      action = randomPick(MEDIUM_ACTIONS);
      break;
    case "hard":
      // Hard challenges target a specific other player
      if (otherPlayerNames.length > 0) {
        actor = randomPick(otherPlayerNames);
      } else {
        // Fallback if somehow no other players (shouldn't happen with 2+ players)
        actor = "An opponent";
      }
      action = randomPick(HARD_ACTIONS);
      break;
  }

  return `${actor} ${action}`;
}

/**
 * Generate a set of unique challenges for a single board
 */
function generateBoardChallenges(otherPlayerNames: string[]): Square[] {
  const challenges: Square[] = [];
  const usedChallenges = new Set<string>();

  // Helper to generate a unique challenge
  const addUniqueChallenge = (difficulty: Difficulty) => {
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      const challenge = generateChallenge(difficulty, otherPlayerNames);
      if (!usedChallenges.has(challenge)) {
        usedChallenges.add(challenge);
        challenges.push({
          challenge,
          difficulty,
          marked: false,
        });
        return;
      }
      attempts++;
    }

    // If we can't find a unique one after max attempts, use it anyway
    // (very unlikely with our action pool sizes)
    const challenge = generateChallenge(difficulty, otherPlayerNames);
    challenges.push({
      challenge,
      difficulty,
      marked: false,
    });
  };

  // Generate challenges for each difficulty
  for (let i = 0; i < DISTRIBUTION.easy; i++) {
    addUniqueChallenge("easy");
  }
  for (let i = 0; i < DISTRIBUTION.medium; i++) {
    addUniqueChallenge("medium");
  }
  for (let i = 0; i < DISTRIBUTION.hard; i++) {
    addUniqueChallenge("hard");
  }

  return challenges;
}

/**
 * Generate boards for all players
 * @param playerNames - Array of all player names in order
 * @returns Array of boards, one per player (in same order as playerNames)
 */
export function generateBoardsForPlayers(playerNames: string[]): Square[][] {
  const boards: Square[][] = [];

  for (let i = 0; i < playerNames.length; i++) {
    const currentPlayerName = playerNames[i];
    // Other players = everyone except current player
    const otherPlayerNames = playerNames.filter((name) => name !== currentPlayerName);

    // Generate challenges for this player's board
    const boardChallenges = generateBoardChallenges(otherPlayerNames);

    // Shuffle the board so challenges are in random positions
    boards.push(shuffle(boardChallenges));
  }

  return boards;
}

// ============ WIN DETECTION ============

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
