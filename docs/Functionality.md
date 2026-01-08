# Functionality Specification

## User Flows

### Flow 1: Host Creates a Game

```
1. User opens app (/)
2. User taps "Create Game"
3. User enters their name
4. User taps "Create"
5. System generates:
   - 6-character game code (e.g., "ABC123")
   - Player record (isHost: true)
   - Game record (status: "lobby")
   - Session stored in localStorage
6. User redirected to /game/ABC123
7. Lobby screen shows:
   - Game code prominently displayed
   - Player list with host's name (1/4)
   - "Share this code" with copy button
   - "Start Game" button (disabled until 4 players)
```

### Flow 2: Player Joins a Game

```
1. User opens app (/)
2. User enters game code in "Join with Code" field
3. User taps "Join"
4. System validates code exists and game is in "lobby" status
5. User enters their name
6. User taps "Join Game"
7. System creates:
   - Player record (isHost: false)
   - Session stored in localStorage
8. User redirected to /game/ABC123
9. All players in lobby see updated player list in real-time
```

### Flow 3: Starting the Game

```
1. Host sees "Start Game" button (enabled when 4 players joined)
2. Host taps "Start Game"
3. System:
   - Changes game status to "playing"
   - Generates 4 unique bingo boards
   - Creates board records for each player
4. All players automatically transition to board view
5. Each player sees their own unique board
```

### Flow 4: Playing the Game

```
1. Player sees their 5x5 bingo board
2. During Scrabble, a challenge happens (e.g., someone uses a Q)
3. Player taps the corresponding square
4. Square toggles: unmarked → marked (or marked → unmarked)
5. System:
   - Updates board in database
   - Checks for win condition
6. All players see their own boards (but can see others' progress count)
7. If player made a mistake, they tap again to unmark
```

### Flow 5: Winning the Game

```
1. Player marks their 5th square in a row/column/diagonal
2. System detects win condition
3. System:
   - Sets game status to "finished"
   - Sets winnerId to winning player
4. All players see winner modal:
   - Winner sees: "YOU WON! 🏆"
   - Others see: "[Player Name] WINS!"
5. Confetti animation plays
6. "Play Again" button (host only) or "Back to Home" for all
```

### Flow 6: Reconnection

```
1. Player accidentally closes browser/locks phone
2. Player reopens browser (may still have tab open or navigate directly)
3. System checks localStorage for session
4. If valid session found:
   a. Query Convex for player by sessionId
   b. If player exists and game still active:
      - Auto-rejoin, show current game state
   c. If player not found or game ended:
      - Clear localStorage
      - Show join form
5. If no session found:
   - Show join form (may be too late if game started)
```

## Game State Machine

```
                    ┌─────────────┐
                    │   (start)   │
                    └──────┬──────┘
                           │
                           ▼
     ┌──────────────────────────────────────┐
     │              LOBBY                    │
     │  - Players can join (up to 4)        │
     │  - Host can kick players             │
     │  - Host can start when 4 joined      │
     └──────────────────┬───────────────────┘
                        │
                        │ host clicks "Start Game"
                        │ (requires 4 players)
                        ▼
     ┌──────────────────────────────────────┐
     │             PLAYING                   │
     │  - Boards are generated              │
     │  - Players can mark/unmark squares   │
     │  - Win detection on each mark        │
     └──────────────────┬───────────────────┘
                        │
                        │ player gets 5 in a row
                        ▼
     ┌──────────────────────────────────────┐
     │             FINISHED                  │
     │  - Winner announced                  │
     │  - Boards locked (no more marking)   │
     │  - "Play Again" option (host)        │
     └──────────────────────────────────────┘
```

## Win Detection Algorithm

### Board Index Layout

```
 0  1  2  3  4
 5  6  7  8  9
10 11 12 13 14
15 16 17 18 19
20 21 22 23 24
```

### Winning Lines

```typescript
const WINNING_LINES = [
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
```

### Algorithm

```typescript
function checkWin(squares: Array<{ marked: boolean }>): boolean {
  return WINNING_LINES.some(line => 
    line.every(index => squares[index].marked)
  );
}
```

### When to Check

- After every `markSquare` mutation
- Only check the board that was just modified
- If win detected, update game status immediately

## Challenge Distribution Logic

### Challenge Pool Requirements

For 4 players × 25 squares = 100 total squares needed.
Each board should have unique challenges.

**Pool Size Requirements:**
- Easy: 40+ challenges (10 per board)
- Medium: 40+ challenges (10 per board)
- Hard: 20+ challenges (5 per board)

### Distribution Per Board

```typescript
const DISTRIBUTION = {
  easy: 10,
  medium: 10,
  hard: 5,
};
```

### Algorithm

```typescript
function generateBoards(playerIds: string[]): Board[] {
  // 1. Shuffle each challenge pool
  const easyPool = shuffle([...challenges.easy]);
  const mediumPool = shuffle([...challenges.medium]);
  const hardPool = shuffle([...challenges.hard]);
  
  return playerIds.map((playerId, boardIndex) => {
    // 2. Take unique challenges for this board
    const boardChallenges = [
      ...easyPool.splice(0, 10),
      ...mediumPool.splice(0, 10),
      ...hardPool.splice(0, 5),
    ];
    
    // 3. Shuffle the 25 challenges for random placement
    const shuffledChallenges = shuffle(boardChallenges);
    
    // 4. Create squares array
    const squares = shuffledChallenges.map(challenge => ({
      challenge,
      marked: false,
    }));
    
    return {
      playerId,
      squares,
    };
  });
}
```

## Error Handling

### User-Facing Errors

| Scenario | Error Message | Action |
|----------|--------------|--------|
| Invalid game code | "Game not found. Check the code and try again." | Stay on home, highlight input |
| Game already started | "This game has already started." | Redirect to home |
| Game is full | "This game already has 4 players." | Redirect to home |
| Name too short | "Name must be at least 2 characters." | Highlight input |
| Name already taken | "Someone in this game already has that name." | Highlight input |
| Network error | "Connection lost. Trying to reconnect..." | Show toast, auto-retry |

### Technical Errors

| Scenario | Handling |
|----------|----------|
| Convex connection lost | Automatic reconnection (built-in) |
| localStorage unavailable | Fall back to session-only (no reconnect feature) |
| Invalid session on reconnect | Clear localStorage, show join form |

## Edge Cases

### 1. Player Leaves During Lobby

- **Scenario**: Player closes tab before game starts
- **Handling**: Player stays in list but marked as "disconnected"
- **Host option**: Can remove disconnected players
- **Reconnection**: Player can rejoin if they return

### 2. Player Disconnects During Game

- **Scenario**: Player loses connection mid-game
- **Handling**: Game continues, other players can still mark
- **Reconnection**: Player can rejoin and see current board state
- **Win condition**: Disconnected player can still win if their marks complete a line

### 3. Host Leaves

- **Scenario**: Host disconnects or closes tab
- **Handling**: Game continues normally
- **Reconnection**: Host can return
- **Limitation**: Only original host can start game (in lobby) or trigger "play again"

### 4. Simultaneous Marks

- **Scenario**: Two players mark at exact same time
- **Handling**: Convex handles this (each mutation is atomic)
- **Result**: Both marks are recorded correctly

### 5. Browser Back Button

- **Scenario**: Player hits back button
- **Handling**: Warn user ("Leave game?") if game in progress
- **Implementation**: Use `beforeunload` event

### 6. Multiple Tabs

- **Scenario**: Player opens game in multiple tabs
- **Handling**: All tabs sync via Convex real-time
- **Result**: Works fine, all tabs show same state

### 7. Game Code Collision

- **Scenario**: Two games get same code
- **Prevention**: Use long enough code (6 chars = 26^6 = 308M combinations)
- **Additional**: Include timestamp or check uniqueness on creation

## API Reference

### Mutations

```typescript
// Create a new game
createGame(args: { hostName: string, sessionId: string }): {
  gameCode: string,
  playerId: string
}

// Join an existing game
joinGame(args: { gameCode: string, playerName: string, sessionId: string }): {
  playerId: string
}

// Start the game (host only)
startGame(args: { gameId: string, playerId: string }): void

// Mark or unmark a square
markSquare(args: { boardId: string, squareIndex: number }): {
  won: boolean
}
```

### Queries

```typescript
// Get game by code
getGameByCode(args: { code: string }): Game | null

// Get all players in a game
getPlayersInGame(args: { gameId: string }): Player[]

// Get player by session (for reconnection)
getPlayerBySession(args: { sessionId: string, gameCode: string }): Player | null

// Get board for a player
getBoard(args: { playerId: string }): Board | null

// Get all boards in a game (for progress display)
getBoardsInGame(args: { gameId: string }): Board[]
```
