import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkWin } from "./lib/challenges";

// Line definitions for 5x5 bingo board
const ROWS = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
];
const COLS = [
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
];
const DIAGS = [
  [0, 6, 12, 18, 24], // main diagonal
  [4, 8, 12, 16, 20], // anti diagonal
];

// Helper to detect lines with exactly 4 marked squares (close to winning)
function getCloseLines(squares: { marked: boolean }[]): string[] {
  const lines: string[] = [];

  ROWS.forEach((row, i) => {
    if (row.filter((idx) => squares[idx].marked).length === 4) {
      lines.push(`row-${i}`);
    }
  });

  COLS.forEach((col, i) => {
    if (col.filter((idx) => squares[idx].marked).length === 4) {
      lines.push(`col-${i}`);
    }
  });

  if (DIAGS[0].filter((idx) => squares[idx].marked).length === 4) {
    lines.push("diag-main");
  }
  if (DIAGS[1].filter((idx) => squares[idx].marked).length === 4) {
    lines.push("diag-anti");
  }

  return lines;
}

// Generate unique event ID
function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const getByPlayer = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const board = await ctx.db
      .query("boards")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .first();
    return board;
  },
});

export const getByGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const boards = await ctx.db
      .query("boards")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
    return boards;
  },
});

export const markSquare = mutation({
  args: {
    boardId: v.id("boards"),
    squareIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) {
      throw new Error("Board not found");
    }

    // Get the game to check status
    const game = await ctx.db.get(board.gameId);
    if (!game || game.status !== "playing") {
      throw new Error("Game is not in progress");
    }

    // Get the player name for drinking events
    const player = await ctx.db.get(board.playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    // Toggle the square
    const squares = [...board.squares];
    if (args.squareIndex < 0 || args.squareIndex >= squares.length) {
      throw new Error("Invalid square index");
    }

    const square = squares[args.squareIndex];
    const wasMarked = square.marked;
    const isNowMarked = !wasMarked;

    squares[args.squareIndex] = {
      ...square,
      marked: isNowMarked,
    };

    // Update the board
    await ctx.db.patch(args.boardId, { squares });

    // Collect new events to add
    type GameEvent =
      | {
          id: string;
          type: "drinking";
          playerName: string;
          drinkType: "shot" | "doubleShot";
          sentAt: number;
          seenBy: string[];
        }
      | {
          id: string;
          type: "close";
          playerName: string;
          lineType: string;
          sentAt: number;
          seenBy: string[];
        }
      | {
          id: string;
          type: "won";
          playerName: string;
          sentAt: number;
          seenBy: string[];
        };

    const newEvents: GameEvent[] = [];

    // Check for drinking event (only when marking, not unmarking)
    if (
      isNowMarked &&
      game.drinkingMode &&
      square.drinkingType &&
      square.drinkingType !== "none"
    ) {
      newEvents.push({
        id: generateEventId(),
        type: "drinking",
        playerName: player.name,
        drinkType: square.drinkingType as "shot" | "doubleShot",
        sentAt: Date.now(),
        seenBy: [],
      });
    }

    // Check for close events (4/5 lines) - only when marking
    if (isNowMarked) {
      const closeLines = getCloseLines(squares);
      const existingCloseEvents = (game.gameEvents ?? []).filter(
        (e) => e.type === "close" && e.playerName === player.name
      );
      const existingLineTypes = new Set(
        existingCloseEvents.map((e) => (e as { lineType: string }).lineType)
      );

      for (const lineType of closeLines) {
        if (!existingLineTypes.has(lineType)) {
          newEvents.push({
            id: generateEventId(),
            type: "close",
            playerName: player.name,
            lineType,
            sentAt: Date.now(),
            seenBy: [],
          });
        }
      }
    }

    // Check for win
    const won = checkWin(squares);

    if (won) {
      // Add won event
      newEvents.push({
        id: generateEventId(),
        type: "won",
        playerName: player.name,
        sentAt: Date.now(),
        seenBy: [],
      });

      // Set the winner and update events
      await ctx.db.patch(game._id, {
        status: "finished",
        winnerId: board.playerId,
        gameEvents: [...(game.gameEvents ?? []), ...newEvents],
      });
    } else if (newEvents.length > 0) {
      // Update events without changing game status
      await ctx.db.patch(game._id, {
        gameEvents: [...(game.gameEvents ?? []), ...newEvents],
      });
    }

    return { won, squares };
  },
});

// Get progress (count of marked squares) for all boards in a game
export const getProgress = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const boards = await ctx.db
      .query("boards")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    const progress = await Promise.all(
      boards.map(async (board) => {
        const player = await ctx.db.get(board.playerId);
        const markedCount = board.squares.filter((s) => s.marked).length;
        return {
          playerId: board.playerId,
          playerName: player?.name ?? "Unknown",
          markedCount,
        };
      })
    );

    return progress;
  },
});
