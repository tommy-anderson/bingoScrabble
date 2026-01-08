// Challenge Generation System
// Each challenge = Actor + Action
// Distribution per board: 18 Easy, 5 Medium, 2 Hard (25 total)

// ============ ACTION POOLS ============
// Each action has two forms: second person (you) and third person (others)

interface Action {
  youForm: string; // "score > 4 points in a turn"
  theyForm: string; // "scores > 4 points in a turn"
}

const EASY_ACTIONS: Action[] = [
  {
    youForm: "score > 4 points in a turn",
    theyForm: "scores > 4 points in a turn",
  },
  {
    youForm: "score > 5 points in a turn",
    theyForm: "scores > 5 points in a turn",
  },
  {
    youForm: "score > 6 points in a turn",
    theyForm: "scores > 6 points in a turn",
  },
  {
    youForm: "score > 7 points in a turn",
    theyForm: "scores > 7 points in a turn",
  },
  {
    youForm: "score > 8 points in a turn",
    theyForm: "scores > 8 points in a turn",
  },
  {
    youForm: "play a word ending in a consonant",
    theyForm: "plays a word ending in a consonant",
  },
  {
    youForm: "play a word starting with a consonant",
    theyForm: "plays a word starting with a consonant",
  },
  {
    youForm: "play a word ending in a vowel",
    theyForm: "plays a word ending in a vowel",
  },
  {
    youForm: "play a word starting with a vowel",
    theyForm: "plays a word starting with a vowel",
  },
  {
    youForm: "use a Double Letter square",
    theyForm: "uses a Double Letter square",
  },
  { youForm: "use a 1-point tile", theyForm: "uses a 1-point tile" },
  {
    youForm: "connect a word to exactly 1 existing tile",
    theyForm: "connects a word to exactly 1 existing tile",
  },
  {
    youForm: "play a word containing 'I'",
    theyForm: "plays a word containing 'I'",
  },
  {
    youForm: "play a word containing 'A'",
    theyForm: "plays a word containing 'A'",
  },
  {
    youForm: "play a word containing 'E'",
    theyForm: "plays a word containing 'E'",
  },
  {
    youForm: "play a word containing 'T'",
    theyForm: "plays a word containing 'T'",
  },
];

const MEDIUM_ACTIONS: Action[] = [
  {
    youForm: "score > 12 points in a turn",
    theyForm: "scores > 12 points in a turn",
  },
  {
    youForm: "add a prefix or suffix to an existing word",
    theyForm: "adds a prefix or suffix to an existing word",
  },
  {
    youForm: "use a Triple Letter square",
    theyForm: "uses a Triple Letter square",
  },
  {
    youForm: "use a Double Word square",
    theyForm: "uses a Double Word square",
  },
  { youForm: "use a 2-point tile", theyForm: "uses a 2-point tile" },
  {
    youForm: "play a word touching the board edge",
    theyForm: "plays a word touching the board edge",
  },
  { youForm: "play a 2-letter word", theyForm: "plays a 2-letter word" },
  {
    youForm: "play a word containing 'S'",
    theyForm: "plays a word containing 'S'",
  },
  {
    youForm: "play a word containing 'C'",
    theyForm: "plays a word containing 'C'",
  },
  {
    youForm: "play a word containing 'L'",
    theyForm: "plays a word containing 'L'",
  },
  {
    youForm: "play a word containing 'U'",
    theyForm: "plays a word containing 'U'",
  },
  {
    youForm: "play a word containing 'O'",
    theyForm: "plays a word containing 'O'",
  },
];

const HARD_ACTIONS: Action[] = [
  {
    youForm: "score > 20 points in a turn",
    theyForm: "scores > 20 points in a turn",
  },
  {
    youForm: "use a tile worth 4+ points",
    theyForm: "uses a tile worth 4+ points",
  },
  {
    youForm: "connect a word to 2+ existing tiles",
    theyForm: "connects a word to 2+ existing tiles",
  },
  {
    youForm: "play a word longer than 6 letters",
    theyForm: "plays a word longer than 6 letters",
  },
  {
    youForm: "play a word touching a board corner",
    theyForm: "plays a word touching a board corner",
  },
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
 * Generate a single challenge string with proper verb conjugation
 */
function generateChallenge(
  difficulty: Difficulty,
  otherPlayerNames: string[]
): string {
  let actor: string;
  let action: Action;
  let isYou: boolean;

  switch (difficulty) {
    case "easy":
      actor = randomPick(EASY_ACTORS);
      action = randomPick(EASY_ACTIONS);
      isYou = actor === "You";
      break;
    case "medium":
      actor = randomPick(MEDIUM_ACTORS);
      action = randomPick(MEDIUM_ACTIONS);
      isYou = actor === "You";
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
      isYou = false; // Hard challenges are always about other players
      break;
  }

  // Use correct verb form based on actor
  const actionText = isYou ? action.youForm : action.theyForm;
  return `${actor} ${actionText}`;
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
    const otherPlayerNames = playerNames.filter(
      (name) => name !== currentPlayerName
    );

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
  return WINNING_LINES.some((line) =>
    line.every((index) => squares[index]?.marked)
  );
}
