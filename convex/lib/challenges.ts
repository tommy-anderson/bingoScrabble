// Challenge Generation System
// Each challenge = Actor + Action

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
    youForm: "play a consonant ending word ",
    theyForm: "plays a consonant ending word ",
  },
  {
    youForm: "play a consonant starting word",
    theyForm: "plays a consonant starting word",
  },
  {
    youForm: "play a vowel ending word",
    theyForm: "plays a vowel ending word",
  },
  {
    youForm: "play a vowel starting word",
    theyForm: "plays a vowel starting word",
  },
  {
    youForm: "use a DoubleLetter square",
    theyForm: "uses a DoubleLetter square",
  },
  { youForm: "use a 1-point tile", theyForm: "uses a 1-point tile" },
  {
    youForm: "connect a word to an existing tile",
    theyForm: "connects a word to an existing tile",
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
    youForm: "add a prefix to an existing word",
    theyForm: "adds a prefix to an existing word",
  },
  {
    youForm: "add a suffix to an existing word",
    theyForm: "adds a suffix to an existing word",
  },
  {
    youForm: "use a TripleLetter square",
    theyForm: "uses a TripleLetter square",
  },
  {
    youForm: "use a DoubleWord square",
    theyForm: "uses a DoubleWord square",
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

// Hard actors: "You" or specific other player's name
const HARD_ACTORS = ["You", "Opponent"];

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
export type Actor =
  | "you"
  | "anyone"
  | "anyOpponent"
  | "opponent1"
  | "opponent2"
  | "opponent3";
export type DrinkingType = "none" | "shot" | "doubleShot";

export interface Square {
  challenge: string;
  difficulty: Difficulty;
  actor: Actor;
  marked: boolean;
  drinkingType?: DrinkingType;
}

// Distribution per board, must total 25
const DISTRIBUTION: Record<Difficulty, number> = {
  easy: 13,
  medium: 8,
  hard: 4,
};

interface ChallengeResult {
  challenge: string;
  actor: Actor;
}

/**
 * Generate a single challenge with action text (no actor prefix) and actor type
 */
function generateChallenge(
  difficulty: Difficulty,
  otherPlayerNames: string[]
): ChallengeResult {
  let actor: Actor;
  let action: Action;
  let isYou: boolean;

  switch (difficulty) {
    case "easy":
      actor = randomPick(EASY_ACTORS) === "You" ? "you" : "anyone";
      action = randomPick(EASY_ACTIONS);
      isYou = actor === "you";
      break;
    case "medium":
      actor = randomPick(MEDIUM_ACTORS) === "You" ? "you" : "anyOpponent";
      action = randomPick(MEDIUM_ACTIONS);
      isYou = actor === "you";
      break;
    case "hard":
      // Hard challenges can be "you" or a specific other player
      if (randomPick(HARD_ACTORS) === "You") {
        actor = "you";
        isYou = true;
      } else if (otherPlayerNames.length > 0) {
        const opponentIndex = Math.floor(
          Math.random() * Math.min(otherPlayerNames.length, 3)
        );
        actor = `opponent${opponentIndex + 1}` as Actor;
        isYou = false;
      } else {
        // Fallback if somehow no other players
        actor = "anyOpponent";
        isYou = false;
      }
      action = randomPick(HARD_ACTIONS);
      break;
  }

  // Use correct verb form based on actor - capitalize first letter
  const actionText = isYou ? action.youForm : action.theyForm;
  const capitalizedAction =
    actionText.charAt(0).toUpperCase() + actionText.slice(1);

  return {
    challenge: capitalizedAction,
    actor,
  };
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
      const result = generateChallenge(difficulty, otherPlayerNames);
      // Include actor in uniqueness check to allow same action with different actors
      const uniqueKey = `${result.actor}:${result.challenge}`;
      if (!usedChallenges.has(uniqueKey)) {
        usedChallenges.add(uniqueKey);
        challenges.push({
          challenge: result.challenge,
          difficulty,
          actor: result.actor,
          marked: false,
        });
        return;
      }
      attempts++;
    }

    // If we can't find a unique one after max attempts, use it anyway
    // (very unlikely with our action pool sizes)
    const result = generateChallenge(difficulty, otherPlayerNames);
    challenges.push({
      challenge: result.challenge,
      difficulty,
      actor: result.actor,
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
 * Assign drinking squares to a board
 * 1 double-shot and 2 shots, randomly distributed
 */
function assignDrinkingSquares(squares: Square[]): Square[] {
  // Get random indices for 3 drinking squares
  const indices = shuffle([...Array(25).keys()]).slice(0, 3);

  return squares.map((square, index) => {
    if (index === indices[0]) {
      return { ...square, drinkingType: "doubleShot" as DrinkingType };
    } else if (index === indices[1] || index === indices[2]) {
      return { ...square, drinkingType: "shot" as DrinkingType };
    }
    return { ...square, drinkingType: "none" as DrinkingType };
  });
}

/**
 * Generate boards for all players
 * @param playerNames - Array of all player names in order
 * @param drinkingMode - Whether to assign drinking squares
 * @returns Array of boards, one per player (in same order as playerNames)
 */
export function generateBoardsForPlayers(
  playerNames: string[],
  drinkingMode: boolean = false
): Square[][] {
  const boards: Square[][] = [];

  for (let i = 0; i < playerNames.length; i++) {
    const currentPlayerName = playerNames[i];
    // Other players = everyone except current player
    const otherPlayerNames = playerNames.filter(
      (name) => name !== currentPlayerName
    );

    // Generate challenges for this player's board
    let boardChallenges = generateBoardChallenges(otherPlayerNames);

    // Shuffle the board so challenges are in random positions
    boardChallenges = shuffle(boardChallenges);

    // Assign drinking squares if drinking mode is enabled
    if (drinkingMode) {
      boardChallenges = assignDrinkingSquares(boardChallenges);
    } else {
      // Add drinkingType: "none" to all squares for consistency
      boardChallenges = boardChallenges.map((square) => ({
        ...square,
        drinkingType: "none" as DrinkingType,
      }));
    }

    boards.push(boardChallenges);
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
