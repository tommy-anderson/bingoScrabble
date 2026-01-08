import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    code: v.string(),
    hostPlayerId: v.optional(v.id("players")),
    status: v.union(
      v.literal("lobby"),
      v.literal("playing"),
      v.literal("finished")
    ),
    winnerId: v.optional(v.id("players")),
    createdAt: v.number(),
  }).index("by_code", ["code"]),

  players: defineTable({
    gameId: v.id("games"),
    name: v.string(),
    sessionId: v.string(),
    isHost: v.boolean(),
    joinedAt: v.number(),
  })
    .index("by_game", ["gameId"])
    .index("by_session_and_game", ["sessionId", "gameId"]),

  boards: defineTable({
    playerId: v.id("players"),
    gameId: v.id("games"),
    squares: v.array(
      v.object({
        challenge: v.string(),
        difficulty: v.union(
          v.literal("easy"),
          v.literal("medium"),
          v.literal("hard")
        ),
        actor: v.union(
          v.literal("you"),
          v.literal("anyone"),
          v.literal("anyOpponent"),
          v.literal("opponent1"),
          v.literal("opponent2"),
          v.literal("opponent3")
        ),
        marked: v.boolean(),
      })
    ),
  })
    .index("by_player", ["playerId"])
    .index("by_game", ["gameId"]),
});
