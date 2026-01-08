import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const join = mutation({
  args: {
    gameCode: v.string(),
    playerName: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the game
    const game = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", args.gameCode.toUpperCase()))
      .first();

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.status !== "lobby") {
      throw new Error("Game has already started");
    }

    // Check player count
    const existingPlayers = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameId", game._id))
      .collect();

    if (existingPlayers.length >= 4) {
      throw new Error("Game is full");
    }

    // Check if name is taken
    const nameTaken = existingPlayers.some(
      (p) => p.name.toLowerCase() === args.playerName.toLowerCase()
    );
    if (nameTaken) {
      throw new Error("Name already taken");
    }

    // Create the player
    const playerId = await ctx.db.insert("players", {
      gameId: game._id,
      name: args.playerName,
      sessionId: args.sessionId,
      isHost: false,
      joinedAt: Date.now(),
    });

    return { playerId, gameId: game._id };
  },
});

export const getBySession = query({
  args: {
    sessionId: v.string(),
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_session_and_game", (q) =>
        q.eq("sessionId", args.sessionId).eq("gameId", args.gameId)
      )
      .first();
    return player;
  },
});

export const getInGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const players = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
    return players;
  },
});

export const get = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.playerId);
  },
});
