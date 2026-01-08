import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { generateBoardsForPlayers } from "./lib/challenges";

// Generate a random 6-character game code
function generateGameCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const create = mutation({
  args: {
    hostName: v.string(),
    sessionId: v.string(),
    drinkingMode: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Generate a unique game code
    let code = generateGameCode();
    let existing = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    // Retry if code already exists (very unlikely but possible)
    while (existing) {
      code = generateGameCode();
      existing = await ctx.db
        .query("games")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
    }

    // Create the game first (without hostPlayerId since player doesn't exist yet)
    const gameId = await ctx.db.insert("games", {
      code,
      status: "lobby",
      createdAt: Date.now(),
      drinkingMode: args.drinkingMode ?? false,
    });

    // Create the host player
    const playerId = await ctx.db.insert("players", {
      gameId,
      name: args.hostName,
      sessionId: args.sessionId,
      isHost: true,
      joinedAt: Date.now(),
    });

    // Update the game with the host player ID
    await ctx.db.patch(gameId, {
      hostPlayerId: playerId,
    });

    return { gameCode: code, playerId, gameId };
  },
});

export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const game = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();
    return game;
  },
});

export const start = mutation({
  args: {
    gameId: v.id("games"),
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    // Verify the player is the host
    if (game.hostPlayerId !== args.playerId) {
      throw new Error("Only the host can start the game");
    }

    // Verify game is in lobby
    if (game.status !== "lobby") {
      throw new Error("Game has already started");
    }

    // Get all players
    const players = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    if (players.length < 2) {
      throw new Error("Need at least 2 players to start");
    }
    if (players.length > 4) {
      throw new Error("Maximum 4 players allowed");
    }

    // Generate boards for all players (pass names for personalized challenges)
    const playerNames = players.map((p) => p.name);
    const boardsData = generateBoardsForPlayers(playerNames, game.drinkingMode ?? false);

    // Create board records (boards are in same order as players)
    for (let i = 0; i < players.length; i++) {
      await ctx.db.insert("boards", {
        playerId: players[i]._id,
        gameId: args.gameId,
        squares: boardsData[i],
      });
    }

    // Update game status
    await ctx.db.patch(args.gameId, {
      status: "playing",
    });

    return { success: true };
  },
});

export const setWinner = mutation({
  args: {
    gameId: v.id("games"),
    winnerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.gameId, {
      status: "finished",
      winnerId: args.winnerId,
    });
  },
});

export const markDrinkingEventSeen = mutation({
  args: {
    gameId: v.id("games"),
    eventId: v.string(),
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || !game.drinkingEvents) return;

    const updatedEvents = game.drinkingEvents.map((event) =>
      event.id === args.eventId && !event.seenBy.includes(args.playerId)
        ? { ...event, seenBy: [...event.seenBy, args.playerId] }
        : event
    );

    await ctx.db.patch(args.gameId, { drinkingEvents: updatedEvents });
  },
});
