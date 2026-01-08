import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkWin } from "./lib/challenges";

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

    // Toggle the square
    const squares = [...board.squares];
    if (args.squareIndex < 0 || args.squareIndex >= squares.length) {
      throw new Error("Invalid square index");
    }

    squares[args.squareIndex] = {
      ...squares[args.squareIndex],
      marked: !squares[args.squareIndex].marked,
    };

    // Update the board
    await ctx.db.patch(args.boardId, { squares });

    // Check for win
    const won = checkWin(squares);

    if (won) {
      // Set the winner
      await ctx.db.patch(game._id, {
        status: "finished",
        winnerId: board.playerId,
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
