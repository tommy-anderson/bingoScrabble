# Architecture

## System Overview

Scrabble Bingo is a real-time multiplayer web application that allows friends playing Scrabble to have a side bingo game with challenges. The architecture prioritizes:

- **Real-time synchronization** - All players see updates instantly via Convex subscriptions
- **Mobile-first design** - Optimized for phone browsers during Scrabble games
- **Session persistence** - Players can rejoin after accidental disconnects using localStorage
- **Serverless deployment** - Free hosting on Vercel + Convex

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Next.js 15 App Router)                     │
│                                                                              │
│  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────────────┐ │
│  │    Home Page     │   │   Game Page      │   │     localStorage         │ │
│  │    (page.tsx)    │   │  (/game/[code])  │   │  ┌──────────────────┐   │ │
│  │                  │   │                  │   │  │ sessionId: UUID  │   │ │
│  │  - Create Game   │   │  - GameLobby     │   │  │ playerId: Id     │   │ │
│  │  - Join Game     │   │  - BingoBoard    │   │  │ gameCode: string │   │ │
│  │                  │   │  - WinnerModal   │   │  │ playerName: str  │   │ │
│  └────────┬─────────┘   └────────┬─────────┘   │  └──────────────────┘   │ │
│           │                      │             └──────────────────────────┘ │
│           │   ConvexReactClient  │                                          │
│           └──────────┬───────────┘                                          │
└──────────────────────┼──────────────────────────────────────────────────────┘
                       │
                       │  WebSocket Connection (Persistent)
                       │  ┌─────────────────────────────┐
                       │  │ useQuery()  → Subscriptions │  ← Auto-updating live queries
                       │  │ useMutation() → RPC calls   │  ← Optimistic updates
                       │  └─────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────────────────────────────┐
│                      ▼        CONVEX BACKEND                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Functions Layer                              │    │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐    │    │
│  │  │    games.ts     │ │   players.ts    │ │     boards.ts       │    │    │
│  │  │  - create       │ │  - join         │ │  - markSquare       │    │    │
│  │  │  - start        │ │  - getBySession │ │  - getByPlayer      │    │    │
│  │  │  - getByCode    │ │  - getInGame    │ │  - getByGame        │    │    │
│  │  │  - setWinner    │ │  - get          │ │  - getProgress      │    │    │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────────┘    │    │
│  │                                                                      │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │  lib/challenges.ts - Challenge pools, board generation,     │    │    │
│  │  │                      win detection, difficulty distribution │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Database (Document Store)                    │    │
│  │    ┌─────────┐         ┌──────────┐         ┌─────────┐             │    │
│  │    │  games  │────────▶│  players │────────▶│  boards │             │    │
│  │    │  (1)    │  1:N    │  (1-4)   │   1:1   │  (1-4)  │             │    │
│  │    └─────────┘         └──────────┘         └─────────┘             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Understanding Convex

### What is Convex?

Convex is a Backend-as-a-Service (BaaS) that provides:
1. **Real-time Database** - Document store with automatic synchronization
2. **Server Functions** - TypeScript functions that run on Convex servers
3. **WebSocket Subscriptions** - Live queries that update automatically

### Key Concepts

#### Queries vs Mutations

```typescript
// QUERY - Read-only, creates a live subscription
// When data changes, all subscribed clients update automatically
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("games")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
  },
});

// MUTATION - Write operation, can modify database
// Triggers re-evaluation of affected queries
export const markSquare = mutation({
  args: { boardId: v.id("boards"), squareIndex: v.number() },
  handler: async (ctx, args) => {
    // ... modify data ...
    await ctx.db.patch(args.boardId, { squares });
  },
});
```

#### How Real-time Updates Work

```
┌──────────────────────────────────────────────────────────────────┐
│                    CONVEX SUBSCRIPTION MODEL                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Player A                   Convex                   Player B     │
│  ┌────────┐                ┌────────┐               ┌────────┐   │
│  │useQuery│◄──────────────▶│Database│◄─────────────▶│useQuery│   │
│  │(boards)│   WebSocket    │        │   WebSocket   │(boards)│   │
│  └────────┘   Subscribe    └────────┘   Subscribe   └────────┘   │
│      │                         │                         │        │
│      │ 1. Mark square          │                         │        │
│      ├────────────────────────▶│                         │        │
│      │    useMutation()        │                         │        │
│      │                         │                         │        │
│      │                         │ 2. Update DB            │        │
│      │                         │    atomically           │        │
│      │                         │                         │        │
│      │                         │ 3. Detect affected      │        │
│      │                         │    subscriptions        │        │
│      │                         │                         │        │
│      │◄────────────────────────┤────────────────────────▶│        │
│      │ 4. PUSH new data        │ 4. PUSH new data        │        │
│      │    to all subscribers   │    to all subscribers   │        │
│      │                         │                         │        │
│  5. React                      │                   5. React       │
│     re-renders                 │                      re-renders  │
│     automatically              │                      automatically│
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

KEY INSIGHT: No polling! Convex PUSHES updates to clients.
This is why all players see changes instantly.
```

#### Client-Side Usage

```typescript
// In React components:
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

function MyComponent() {
  // LIVE SUBSCRIPTION - auto-updates when data changes
  const game = useQuery(api.games.getByCode, { code: "ABC123" });
  
  // Can skip query if args not ready
  const players = useQuery(
    api.players.getInGame,
    game ? { gameId: game._id } : "skip"  // "skip" prevents query execution
  );
  
  // Mutation function
  const markSquare = useMutation(api.boards.markSquare);
  
  const handleMark = async () => {
    await markSquare({ boardId, squareIndex: 5 });
    // No need to refetch - subscription auto-updates!
  };
}
```

---

## Data Models

### Schema Definition (convex/schema.ts)

```typescript
// Games - One per session
games: defineTable({
  code: v.string(),                    // "ABC123" - shareable code
  hostPlayerId: v.optional(v.id("players")),
  status: v.union(
    v.literal("lobby"),                // Waiting for players
    v.literal("playing"),              // Game in progress
    v.literal("finished")              // Winner declared
  ),
  winnerId: v.optional(v.id("players")),
  createdAt: v.number(),
}).index("by_code", ["code"]),          // Fast lookup by game code

// Players - 1-4 per game
players: defineTable({
  gameId: v.id("games"),
  name: v.string(),
  sessionId: v.string(),               // UUID for reconnection
  isHost: v.boolean(),
  joinedAt: v.number(),
})
  .index("by_game", ["gameId"])                    // Get all players in game
  .index("by_session_and_game", ["sessionId", "gameId"]), // Reconnection lookup

// Boards - One per player, created when game starts
boards: defineTable({
  playerId: v.id("players"),
  gameId: v.id("games"),
  squares: v.array(v.object({
    challenge: v.string(),             // "Score > 20 points"
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    marked: v.boolean(),               // Has player completed this?
  })),
})
  .index("by_player", ["playerId"])    // Get player's board
  .index("by_game", ["gameId"]),       // Get all boards for progress
```

### Entity Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE RELATIONSHIPS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐                                                │
│   │    GAME     │                                                │
│   │─────────────│                                                │
│   │ _id         │◄─────────────────────────────────────┐        │
│   │ code        │                                       │        │
│   │ status      │         References                    │        │
│   │ hostPlayerId│────┐                                  │        │
│   │ winnerId    │────┤                                  │        │
│   │ createdAt   │    │                                  │        │
│   └─────────────┘    │                                  │        │
│                      │                                  │        │
│         ┌────────────┘                                  │        │
│         │                                               │        │
│         ▼                                               │        │
│   ┌─────────────┐                                       │        │
│   │   PLAYER    │                                       │        │
│   │─────────────│                                       │        │
│   │ _id         │◄──────────────────────────────┐      │        │
│   │ gameId      │───────────────────────────────┼──────┘        │
│   │ name        │                               │               │
│   │ sessionId   │ ← Used for reconnection       │               │
│   │ isHost      │                               │               │
│   │ joinedAt    │                               │               │
│   └─────────────┘                               │               │
│                                                 │               │
│         │                                       │               │
│         │ 1:1                                   │               │
│         ▼                                       │               │
│   ┌─────────────┐                               │               │
│   │    BOARD    │                               │               │
│   │─────────────│                               │               │
│   │ _id         │                               │               │
│   │ playerId    │───────────────────────────────┘               │
│   │ gameId      │───────────────────────────────────────────────┘
│   │ squares[25] │                                                │
│   │  ├─challenge│                                                │
│   │  ├─difficulty│                                               │
│   │  └─marked   │                                                │
│   └─────────────┘                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Session Persistence

### Why Sessions Matter

During a Scrabble game, players frequently:
- Lock their phone screen
- Switch to other apps (check scores, messages)
- Accidentally close the browser tab
- Experience network disconnects

Without session persistence, they'd lose their place in the game.

### Session Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    SESSION STORAGE STRATEGY                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      localStorage                            │ │
│  │  ┌───────────────────────────────────────────────────────┐  │ │
│  │  │  Key: "scrabble-bingo-session"                        │  │ │
│  │  │  Value: {                                             │  │ │
│  │  │    sessionId: "550e8400-e29b-41d4-a716-446655440000", │  │ │
│  │  │    playerId: "jd7a8s9df7a9s8df7",                     │  │ │
│  │  │    gameCode: "ABC123",                                │  │ │
│  │  │    playerName: "Alex"                                 │  │ │
│  │  │  }                                                    │  │ │
│  │  └───────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│                              │ Persists across:                   │
│                              │ ✓ Page refreshes                   │
│                              │ ✓ Browser closes                   │
│                              │ ✓ Phone restarts                   │
│                              │ ✗ Different browsers               │
│                              │ ✗ Incognito/Private mode          │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Session Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    SESSION LIFECYCLE                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ══════════════════════════════════════════════════════════════  │
│  PHASE 1: SESSION CREATION (Join or Create Game)                 │
│  ══════════════════════════════════════════════════════════════  │
│                                                                   │
│     User clicks "Create Game" or "Join Game"                      │
│                    │                                              │
│                    ▼                                              │
│     ┌────────────────────────────┐                                │
│     │ Generate sessionId         │                                │
│     │ crypto.randomUUID()        │                                │
│     │ "550e8400-e29b-41d4..."    │                                │
│     └─────────────┬──────────────┘                                │
│                   │                                               │
│                   ▼                                               │
│     ┌────────────────────────────┐     ┌────────────────────┐    │
│     │ Call Convex mutation       │────▶│ Convex stores      │    │
│     │ games.create() or          │     │ sessionId in       │    │
│     │ players.join()             │     │ player document    │    │
│     └─────────────┬──────────────┘     └────────────────────┘    │
│                   │                                               │
│                   ▼                                               │
│     ┌────────────────────────────┐                                │
│     │ Save to localStorage       │                                │
│     │ {sessionId, playerId,      │                                │
│     │  gameCode, playerName}     │                                │
│     └────────────────────────────┘                                │
│                                                                   │
│  ══════════════════════════════════════════════════════════════  │
│  PHASE 2: SESSION RECONNECTION (Page Reload / Return)            │
│  ══════════════════════════════════════════════════════════════  │
│                                                                   │
│     User opens /game/ABC123                                       │
│                    │                                              │
│                    ▼                                              │
│     ┌────────────────────────────┐                                │
│     │ useSession() hook loads    │                                │
│     │ from localStorage          │                                │
│     └─────────────┬──────────────┘                                │
│                   │                                               │
│         ┌─────────┴─────────┐                                     │
│         │                   │                                     │
│    Found session       No session                                 │
│         │                   │                                     │
│         ▼                   ▼                                     │
│   ┌───────────────┐   ┌───────────────┐                          │
│   │ gameCode      │   │ Show          │                          │
│   │ matches URL?  │   │ JoinGameForm  │                          │
│   └───────┬───────┘   └───────────────┘                          │
│           │                                                       │
│     ┌─────┴─────┐                                                 │
│     │           │                                                 │
│    YES          NO                                                │
│     │           │                                                 │
│     ▼           ▼                                                 │
│  ┌─────────┐ ┌─────────────┐                                     │
│  │ Check   │ │ Clear old   │                                     │
│  │ player  │ │ session,    │                                     │
│  │ exists  │ │ show form   │                                     │
│  │ in game │ └─────────────┘                                     │
│  └────┬────┘                                                      │
│       │                                                           │
│  ┌────┴────┐                                                      │
│  │         │                                                      │
│ YES        NO                                                     │
│  │         │                                                      │
│  ▼         ▼                                                      │
│ Resume   Clear session,                                           │
│ game     show form                                                │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### useSession Hook Implementation

```typescript
// src/hooks/useSession.ts

export function useSession() {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load on mount (client-side only)
  useEffect(() => {
    const stored = localStorage.getItem("scrabble-bingo-session");
    if (stored) {
      setSession(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const saveSession = (newSession: StoredSession) => {
    localStorage.setItem("scrabble-bingo-session", JSON.stringify(newSession));
    setSession(newSession);
  };

  const clearSession = () => {
    localStorage.removeItem("scrabble-bingo-session");
    setSession(null);
  };

  const getSessionId = (): string => {
    return session?.sessionId ?? crypto.randomUUID();
  };

  return { session, isLoading, saveSession, clearSession, getSessionId };
}
```

---

## Data Flow Examples

### Creating a Game

```
┌─────────┐          ┌─────────────┐          ┌────────────────┐
│  User   │          │   Client    │          │    Convex      │
└────┬────┘          └──────┬──────┘          └───────┬────────┘
     │                      │                         │
     │ 1. Click "Create"    │                         │
     │    + Enter name      │                         │
     ├─────────────────────▶│                         │
     │                      │                         │
     │                      │ 2. Generate sessionId   │
     │                      │    (crypto.randomUUID)  │
     │                      │                         │
     │                      │ 3. useMutation:         │
     │                      │    games.create({       │
     │                      │      hostName,          │
     │                      │      sessionId          │
     │                      │    })                   │
     │                      ├────────────────────────▶│
     │                      │                         │
     │                      │                         │ 4. Generate game code
     │                      │                         │ 5. Create game document
     │                      │                         │ 6. Create player (isHost=true)
     │                      │                         │ 7. Link player to game
     │                      │                         │
     │                      │◀────────────────────────┤
     │                      │ 8. Return {gameCode,    │
     │                      │    playerId, gameId}    │
     │                      │                         │
     │                      │ 9. saveSession({        │
     │                      │    sessionId, playerId, │
     │                      │    gameCode, playerName │
     │                      │ })                      │
     │                      │                         │
     │◀─────────────────────┤ 10. router.push(        │
     │                      │     `/game/${code}`)    │
     │                      │                         │
```

### Marking a Square (with Win Detection)

```
┌─────────┐          ┌─────────────┐          ┌────────────────┐
│ Player  │          │   Client    │          │    Convex      │
└────┬────┘          └──────┬──────┘          └───────┬────────┘
     │                      │                         │
     │ 1. Tap square        │                         │
     ├─────────────────────▶│                         │
     │                      │ 2. setSelectedIndex()   │
     │◀─────────────────────┤    Show detail panel    │
     │                      │                         │
     │ 3. Tap "Mark Done"   │                         │
     ├─────────────────────▶│                         │
     │                      │                         │
     │                      │ 4. useMutation:         │
     │                      │    boards.markSquare({  │
     │                      │      boardId,           │
     │                      │      squareIndex        │
     │                      │    })                   │
     │                      ├────────────────────────▶│
     │                      │                         │
     │                      │                         │ 5. Toggle square.marked
     │                      │                         │ 6. Check all 12 win lines:
     │                      │                         │    - 5 rows
     │                      │                         │    - 5 columns
     │                      │                         │    - 2 diagonals
     │                      │                         │
     │                      │              ┌──────────┴──────────┐
     │                      │              │                     │
     │                      │           NO WIN                 WIN!
     │                      │              │                     │
     │                      │              ▼                     ▼
     │                      │        Return {won: false}   Update game:
     │                      │                              status="finished"
     │                      │                              winnerId=playerId
     │                      │                              Return {won: true}
     │                      │◀────────────────────────────────────┤
     │                      │                                     │
     │   ┌──────────────────┴──────────────────┐                 │
     │   │ Subscription auto-updates:           │                 │
     │   │ - Board shows marked square          │                 │
     │   │ - If won: WinnerModal appears        │                 │
     │   │ - All other players see update       │                 │
     │   └──────────────────────────────────────┘                 │
     │◀─────────────────────┤                                     │
```

---

## Technology Stack

### Frontend
| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Next.js 15** | React framework | App Router, Vercel integration, great DX |
| **Tailwind CSS** | Styling | Utility-first, responsive, fast iteration |
| **shadcn/ui** | UI components | Accessible, customizable, Tailwind-native |
| **Lucide React** | Icons | Clean design, tree-shakeable |

### Backend
| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Convex** | Database + API + Real-time | Zero config, built-in subscriptions, TypeScript |

### Deployment
| Service | Role | Free Tier |
|---------|------|-----------|
| **Vercel** | Next.js hosting | Unlimited sites, 100GB bandwidth/month |
| **Convex** | Backend hosting | 1M function calls/month, 1GB storage |

---

## Deployment Architecture

```
┌─────────────────┐          ┌─────────────────┐
│     Vercel      │          │     Convex      │
│  (Next.js App)  │◀────────▶│   (Backend)     │
│                 │ WebSocket│                 │
│  - Static pages │          │  - Database     │
│  - Client code  │          │  - Functions    │
│  - Edge runtime │          │  - Real-time    │
└────────┬────────┘          └─────────────────┘
         │
         │ HTTPS
         ▼
    ┌─────────┐
    │  Users  │
    │(Mobile) │
    └─────────┘
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Set automatically by Convex CLI during deployment
```

---

## File Structure

```
bingoScrabble/
├── convex/                    # Convex backend
│   ├── _generated/            # Auto-generated types (don't edit)
│   ├── lib/
│   │   └── challenges.ts      # Challenge pools, board generation
│   ├── schema.ts              # Database schema definition
│   ├── games.ts               # Game mutations/queries
│   ├── players.ts             # Player mutations/queries
│   └── boards.ts              # Board mutations/queries
├── src/
│   ├── app/
│   │   ├── page.tsx           # Home page (create/join)
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── globals.css        # Global styles + Tailwind
│   │   └── game/
│   │       └── [code]/
│   │           └── page.tsx   # Dynamic game page
│   ├── components/
│   │   ├── BingoBoard.tsx     # Main game board
│   │   ├── BingoSquare.tsx    # Individual square
│   │   ├── GameLobby.tsx      # Waiting room
│   │   ├── JoinGameForm.tsx   # Join form
│   │   ├── WinnerModal.tsx    # Victory screen
│   │   └── ui/                # shadcn components
│   ├── hooks/
│   │   └── useSession.ts      # Session persistence hook
│   └── lib/
│       ├── gameUtils.ts       # Win detection, difficulty styles
│       └── utils.ts           # Utility functions (cn)
├── docs/                      # Documentation
├── public/                    # Static assets
└── tailwind.config.ts         # Tailwind + custom colors safelist
```
