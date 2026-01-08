# Functionality Specification

## Game Overview

Scrabble Bingo is a companion game played alongside a real Scrabble game. Each player gets a unique 5×5 bingo board filled with Scrabble-related challenges. When something happens in the real Scrabble game that matches a challenge on your board, you mark it. First to get 5 in a row wins!

---

## User Flows

### Flow 1: Host Creates a Game

```
┌────────────────────────────────────────────────────────────────┐
│                     CREATE GAME FLOW                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User opens app at bingo-scrabble.vercel.app                │
│                         │                                       │
│                         ▼                                       │
│  2. User taps "Create Game"                                     │
│                         │                                       │
│                         ▼                                       │
│  3. User enters their name                                      │
│                         │                                       │
│                         ▼                                       │
│  4. User taps "Create"                                          │
│                         │                                       │
│                         ▼                                       │
│  5. System generates:                                           │
│     • 6-character game code (e.g., "ABC123")                   │
│     • Player record (isHost: true)                              │
│     • Game record (status: "lobby")                             │
│     • Session stored in localStorage                            │
│                         │                                       │
│                         ▼                                       │
│  6. User redirected to /game/ABC123                             │
│                         │                                       │
│                         ▼                                       │
│  7. Lobby screen shows:                                         │
│     • Game code prominently displayed                           │
│     • Player list with host's name (👑 icon)                   │
│     • "Share this code" with copy button                        │
│     • "Start Game" button (disabled until 2+ players)           │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Flow 2: Player Joins a Game

```
┌────────────────────────────────────────────────────────────────┐
│                      JOIN GAME FLOW                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Option A: Direct Link                                          │
│  1. User receives link: bingo-scrabble.vercel.app/game/ABC123  │
│                         │                                       │
│                         ▼                                       │
│  2. User opens link on their phone                              │
│                         │                                       │
│                         ▼                                       │
│  3. Join form appears (name input)                              │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Option B: Enter Code                                           │
│  1. User opens app at home page                                 │
│                         │                                       │
│                         ▼                                       │
│  2. User enters game code "ABC123"                              │
│                         │                                       │
│                         ▼                                       │
│  3. User taps "Join Game"                                       │
│                         │                                       │
│                         ▼                                       │
│  4. Redirected to /game/ABC123                                  │
│                         │                                       │
│                         ▼                                       │
│  5. Join form appears (name input)                              │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Common continuation:                                           │
│  6. User enters their name                                      │
│                         │                                       │
│                         ▼                                       │
│  7. User taps "Join"                                            │
│                         │                                       │
│                         ▼                                       │
│  8. System validates:                                           │
│     ✓ Game exists and is in "lobby" status                     │
│     ✓ Game not full (< 4 players)                              │
│     ✓ Name not already taken                                    │
│                         │                                       │
│                         ▼                                       │
│  9. Player record created, session saved                        │
│                         │                                       │
│                         ▼                                       │
│  10. ALL players see updated lobby in real-time                 │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Flow 3: Starting the Game

```
┌────────────────────────────────────────────────────────────────┐
│                     START GAME FLOW                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Prerequisites:                                                 │
│  • 2-4 players have joined                                      │
│  • Current user is the host                                     │
│                         │                                       │
│                         ▼                                       │
│  1. Host sees enabled "Start Game" button                       │
│                         │                                       │
│                         ▼                                       │
│  2. Host taps "Start Game"                                      │
│                         │                                       │
│                         ▼                                       │
│  3. Server-side processing:                                     │
│     a. Game status → "playing"                                  │
│     b. Generate unique board for each player:                   │
│        • 18 Easy challenges (green)                             │
│        • 5 Medium challenges (amber)                            │
│        • 2 Hard challenges (red)                                │
│     c. Boards personalized with other player names              │
│     d. Challenges shuffled into random positions                │
│                         │                                       │
│                         ▼                                       │
│  4. All players automatically see their boards                  │
│     (real-time subscription triggers re-render)                 │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Flow 4: Playing the Game

```
┌────────────────────────────────────────────────────────────────┐
│                      GAMEPLAY FLOW                              │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  During real Scrabble game:                                     │
│                                                                 │
│  1. Something happens (e.g., Sarah scores 15 points)            │
│                         │                                       │
│                         ▼                                       │
│  2. Player checks their bingo board                             │
│                         │                                       │
│                         ▼                                       │
│  3. Player taps matching challenge square                       │
│     (e.g., "Anyone scores > 12 points in a turn")              │
│                         │                                       │
│                         ▼                                       │
│  4. Detail panel slides up showing:                             │
│     • Full challenge text                                       │
│     • Difficulty indicator                                      │
│     • "Mark Done" button                                        │
│                         │                                       │
│                         ▼                                       │
│  5. Player taps "Mark Done"                                     │
│                         │                                       │
│                         ▼                                       │
│  6. Square marked with checkmark ✓                              │
│     • Bounce animation plays                                    │
│     • Haptic feedback (on supported devices)                    │
│                         │                                       │
│                         ▼                                       │
│  7. Progress updates:                                           │
│     • "X/25 marked" counter increments                          │
│     • "Best line" progress dots update                          │
│     • Other players see your progress change                    │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Unmarking (made a mistake):                                    │
│  • Tap marked square                                            │
│  • Tap "Unmark" in detail panel                                 │
│  • Square returns to unmarked state                             │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Flow 5: Winning the Game

```
┌────────────────────────────────────────────────────────────────┐
│                       WIN FLOW                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Player marks their 5th square in a line                     │
│     (row, column, or diagonal)                                  │
│                         │                                       │
│                         ▼                                       │
│  2. Server-side win detection:                                  │
│     a. Check all 12 possible winning lines                      │
│     b. If any line has 5 marked squares → WIN!                  │
│                         │                                       │
│                         ▼                                       │
│  3. Server updates:                                             │
│     • game.status → "finished"                                  │
│     • game.winnerId → winning player's ID                       │
│                         │                                       │
│                         ▼                                       │
│  4. All players see Winner Modal:                               │
│                                                                 │
│     Winner sees:                                                │
│     ┌─────────────────────────────────┐                        │
│     │    🎉 🏆 🎉                      │                        │
│     │    YOU WON!                      │                        │
│     │                                  │                        │
│     │    [Back to Home]               │                        │
│     └─────────────────────────────────┘                        │
│                                                                 │
│     Others see:                                                 │
│     ┌─────────────────────────────────┐                        │
│     │    🏆                            │                        │
│     │    Sarah Wins!                   │                        │
│     │                                  │                        │
│     │    [Back to Home]               │                        │
│     └─────────────────────────────────┘                        │
│                                                                 │
│  5. Confetti animation plays                                    │
│                                                                 │
│  6. Board is locked (no more marking)                           │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Flow 6: Session Reconnection

```
┌────────────────────────────────────────────────────────────────┐
│                   RECONNECTION FLOW                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Trigger events:                                                │
│  • Browser refresh                                              │
│  • Phone locked/unlocked                                        │
│  • App switched and returned                                    │
│  • Tab closed and reopened                                      │
│                         │                                       │
│                         ▼                                       │
│  1. User opens /game/ABC123                                     │
│                         │                                       │
│                         ▼                                       │
│  2. useSession() loads from localStorage                        │
│                         │                                       │
│                         ▼                                       │
│  3. Check: Does session.gameCode match URL?                     │
│                         │                                       │
│         ┌───────────────┴───────────────┐                      │
│         │                               │                       │
│        YES                              NO                      │
│         │                               │                       │
│         ▼                               ▼                       │
│  4a. Verify player exists         4b. Show JoinGameForm        │
│      in game's player list             (if game in lobby)      │
│         │                               │                       │
│         │                               ▼                       │
│    ┌────┴────┐                    Or show error:               │
│    │         │                    "Game already started"        │
│   YES        NO                                                 │
│    │         │                                                  │
│    ▼         ▼                                                  │
│ Resume    Clear session,                                        │
│ game      show form                                             │
│ instantly                                                       │
│                                                                 │
│  Note: Resume is instant because Convex subscriptions           │
│  immediately provide current game state.                        │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## Game State Machine

```
                    ┌─────────────┐
                    │   (start)   │
                    └──────┬──────┘
                           │
                           │ games.create()
                           ▼
     ┌──────────────────────────────────────┐
     │              LOBBY                    │
     │                                       │
     │  • Players can join (2-4)            │
     │  • Players see real-time updates      │
     │  • Host can start when 2+ joined      │
     │  • Anyone can leave (just close tab)  │
     └──────────────────┬───────────────────┘
                        │
                        │ games.start()
                        │ (host only, requires 2+ players)
                        ▼
     ┌──────────────────────────────────────┐
     │             PLAYING                   │
     │                                       │
     │  • Unique boards generated            │
     │  • Players mark/unmark squares        │
     │  • Win detection on every mark        │
     │  • Real-time progress visible         │
     └──────────────────┬───────────────────┘
                        │
                        │ checkWin() returns true
                        │ (automatic on markSquare)
                        ▼
     ┌──────────────────────────────────────┐
     │             FINISHED                  │
     │                                       │
     │  • Winner announced to all            │
     │  • Boards locked (can't mark)         │
     │  • Players can go back to home        │
     └──────────────────────────────────────┘
```

---

## Challenge System

### Difficulty Distribution (per board)

| Difficulty | Count | Color    | Description                                |
| ---------- | ----- | -------- | ------------------------------------------ |
| Easy       | 18    | 🟢 Green | Common Scrabble occurrences                |
| Medium     | 5     | 🟡 Amber | Less frequent events                       |
| Hard       | 2     | 🔴 Red   | Rare achievements, targets specific player |

### Challenge Structure

Each challenge = **Actor** + **Action**

```
Examples:
┌─────────────────────────────────────────────────────────┐
│  EASY                                                    │
│  • "You score > 5 points in a turn"                     │
│  • "Anyone plays a word ending in a vowel"              │
│  • "You use a Double Letter square"                     │
├─────────────────────────────────────────────────────────┤
│  MEDIUM                                                  │
│  • "Any opponent scores > 12 points in a turn"          │
│  • "You use a Triple Letter square"                     │
│  • "Anyone plays a 2-letter word"                       │
├─────────────────────────────────────────────────────────┤
│  HARD                                                    │
│  • "Sarah scores > 20 points in a turn"                 │
│  • "Mike uses a tile worth 4+ points"                   │
│  • "Alex plays a word longer than 6 letters"            │
└─────────────────────────────────────────────────────────┘
```

### Actor Types by Difficulty

| Difficulty | Possible Actors              |
| ---------- | ---------------------------- |
| Easy       | "You", "Anyone"              |
| Medium     | "You", "Any opponent"        |
| Hard       | Specific other player's name |

### Board Generation Algorithm

```typescript
function generateBoardsForPlayers(playerNames: string[]): Square[][] {
  const boards = [];

  for (const currentPlayer of playerNames) {
    // 1. Get other players for "hard" challenges
    const otherPlayers = playerNames.filter((p) => p !== currentPlayer);

    // 2. Generate challenges with proper distribution
    const challenges = [
      ...generateChallenges("easy", 18, otherPlayers),
      ...generateChallenges("medium", 5, otherPlayers),
      ...generateChallenges("hard", 2, otherPlayers),
    ];

    // 3. Shuffle for random board positions
    boards.push(shuffle(challenges));
  }

  return boards;
}
```

---

## Win Detection

### Board Layout (indices 0-24)

```
┌────┬────┬────┬────┬────┐
│  0 │  1 │  2 │  3 │  4 │
├────┼────┼────┼────┼────┤
│  5 │  6 │  7 │  8 │  9 │
├────┼────┼────┼────┼────┤
│ 10 │ 11 │ 12 │ 13 │ 14 │
├────┼────┼────┼────┼────┤
│ 15 │ 16 │ 17 │ 18 │ 19 │
├────┼────┼────┼────┼────┤
│ 20 │ 21 │ 22 │ 23 │ 24 │
└────┴────┴────┴────┴────┘
```

### Winning Lines (12 total)

```typescript
const WINNING_LINES = [
  // 5 Rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],

  // 5 Columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],

  // 2 Diagonals
  [0, 6, 12, 18, 24], // Top-left to bottom-right
  [4, 8, 12, 16, 20], // Top-right to bottom-left
];
```

### Win Check Algorithm

```typescript
function checkWin(squares: { marked: boolean }[]): boolean {
  return WINNING_LINES.some((line) =>
    line.every((index) => squares[index].marked)
  );
}
```

### When Win Detection Runs

- **Trigger**: Every `markSquare` mutation
- **Location**: Server-side (Convex function)
- **Timing**: Immediately after square is marked
- **Action on Win**:
  1. Set `game.status = "finished"`
  2. Set `game.winnerId = playerId`
  3. Return `{ won: true }` to client

---

## API Reference

### Mutations (Write Operations)

#### `games.create`

Creates a new game and host player.

```typescript
// Input
{
  hostName: string,    // Host's display name
  sessionId: string    // UUID for session persistence
}

// Output
{
  gameCode: string,    // 6-character shareable code
  playerId: Id<"players">,
  gameId: Id<"games">
}
```

#### `games.start`

Starts a game (generates boards).

```typescript
// Input
{
  gameId: Id<"games">,
  playerId: Id<"players">  // Must be host
}

// Output
{ success: true }

// Errors
- "Game not found"
- "Only the host can start the game"
- "Game has already started"
- "Need at least 2 players to start"
- "Maximum 4 players allowed"
```

#### `players.join`

Joins an existing game.

```typescript
// Input
{
  gameCode: string,     // 6-character code
  playerName: string,   // Display name
  sessionId: string     // UUID for persistence
}

// Output
{
  playerId: Id<"players">,
  gameId: Id<"games">
}

// Errors
- "Game not found"
- "Game has already started"
- "Game is full"
- "Name already taken"
```

#### `boards.markSquare`

Toggles a square's marked status.

```typescript
// Input
{
  boardId: Id<"boards">,
  squareIndex: number    // 0-24
}

// Output
{
  won: boolean,
  squares: Square[]      // Updated squares array
}

// Errors
- "Board not found"
- "Game is not in progress"
- "Invalid square index"
```

### Queries (Read Operations)

#### `games.getByCode`

Fetches a game by its code.

```typescript
// Input
{
  code: string;
}

// Output
Game | null;
```

#### `players.getInGame`

Gets all players in a game.

```typescript
// Input
{ gameId: Id<"games"> }

// Output
Player[]
```

#### `players.getBySession`

Finds a player by session ID (for reconnection).

```typescript
// Input
{
  sessionId: string,
  gameId: Id<"games">
}

// Output
Player | null
```

#### `boards.getByPlayer`

Gets a player's board.

```typescript
// Input
{
  playerId: Id<"players">;
}

// Output
Board | null;
```

#### `boards.getByGame`

Gets all boards in a game (for progress display).

```typescript
// Input
{ gameId: Id<"games"> }

// Output
Board[]
```

---

## Error Handling

### User-Facing Errors

| Scenario             | Error Message                        | UI Action                       |
| -------------------- | ------------------------------------ | ------------------------------- |
| Invalid game code    | "Game not found"                     | Stay on form, show error        |
| Game already started | "Game has already started"           | Show message with home link     |
| Game is full         | "Game is full (4 players max)"       | Show message with home link     |
| Name too short       | "Name must be at least 2 characters" | Highlight input                 |
| Name taken           | "Name already taken in this game"    | Highlight input                 |
| Not the host         | "Only the host can start"            | Button disabled                 |
| Network error        | Loading spinner                      | Auto-reconnect (Convex handles) |

### Edge Cases

| Scenario                       | Handling                          |
| ------------------------------ | --------------------------------- |
| Player leaves during lobby     | Stays in player list (can rejoin) |
| Player disconnects during game | Game continues, can rejoin        |
| Host leaves                    | Game continues, host can rejoin   |
| Simultaneous marks             | Convex handles atomically         |
| Multiple tabs open             | All tabs sync via subscriptions   |
| Game code collision            | Retry generation (very rare)      |

---

## Progress Tracking

### What Players See

**On their board:**

- `X/25 marked` - Total squares completed
- `Best line: X/5` - Progress toward any win line
- Progress dots visualization

**Other players:**

- Player name + progress dots showing their best line progress
- Updates in real-time as others mark squares

### Best Line Calculation

```typescript
function getBestLineProgress(squares: { marked: boolean }[]): number {
  let maxMarked = 0;

  for (const line of WINNING_LINES) {
    const markedInLine = line.filter((idx) => squares[idx].marked).length;
    maxMarked = Math.max(maxMarked, markedInLine);
  }

  return maxMarked; // 0-5
}
```
