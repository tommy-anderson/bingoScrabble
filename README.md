# Scrabble Bingo

A fun bingo game to play alongside your Scrabble matches! Create a game, invite 3 friends, and race to complete bingo challenges.

## Features

- **Real-time multiplayer** - See when other players mark squares
- **Mobile-first design** - Perfect for playing on phones during Scrabble
- **Session persistence** - Resume your game if you accidentally close the browser
- **Win detection** - Automatic detection of 5-in-a-row (horizontal, vertical, or diagonal)

## Tech Stack

- **Next.js 15** - React framework
- **Convex** - Real-time database
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **TypeScript** - Type safety

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Convex account (free at [convex.dev](https://convex.dev))

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd bingoScrabble
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Convex:
   ```bash
   npx convex dev
   ```
   This will prompt you to log in and create a new project. Follow the instructions.

4. Copy the environment file:
   ```bash
   cp .env.example .env.local
   ```
   The `NEXT_PUBLIC_CONVEX_URL` will be automatically added by Convex.

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Both Dev Servers

For the best development experience, run both Next.js and Convex dev servers:

**Terminal 1:**
```bash
npm run dev:next
```

**Terminal 2:**
```bash
npm run dev:convex
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Add the `NEXT_PUBLIC_CONVEX_URL` environment variable from your Convex dashboard
4. Deploy!

### Convex

Your Convex backend is automatically deployed when you run `npx convex deploy`.

## How to Play

1. **Create a game** - Enter your name and get a 6-character game code
2. **Share the code** - Send the code to 3 friends
3. **Wait for players** - Everyone joins with their name
4. **Start the game** - Host clicks "Start Game" when 4 players have joined
5. **Mark squares** - Tap challenges as they happen during your Scrabble game
6. **Win!** - First player to get 5 in a row (horizontal, vertical, or diagonal) wins

## Challenge Types

- **Easy** (Green) - Common occurrences
- **Medium** (Amber) - Less frequent events
- **Hard** (Red) - Rare achievements

## Project Structure

```
├── convex/              # Convex backend
│   ├── schema.ts        # Database schema
│   ├── games.ts         # Game mutations/queries
│   ├── players.ts       # Player mutations/queries
│   ├── boards.ts        # Board mutations/queries
│   └── lib/
│       └── challenges.ts # Challenge pool and logic
├── src/
│   ├── app/             # Next.js pages
│   ├── components/      # React components
│   ├── hooks/           # Custom hooks
│   └── lib/             # Utilities
└── docs/                # Documentation
    ├── Architecture.md
    ├── Design.md
    └── Functionality.md
```

## License

MIT
