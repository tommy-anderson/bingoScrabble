# Design System

## Design Philosophy

Scrabble Bingo is designed to be a **companion app** that enhances the Scrabble experience without being distracting. The design should be:

- **Glanceable** - Quick to check and interact with between Scrabble turns
- **Tactile** - Satisfying tap interactions for marking squares
- **Celebratory** - Fun win animations that don't overstay their welcome
- **Accessible** - Works in varying lighting conditions, readable text

## Mobile-First Approach

Since this app will primarily be used on phones sitting next to a Scrabble board:

### Viewport Considerations
- Primary target: 375px - 428px width (iPhone SE to iPhone Pro Max)
- Touch targets: Minimum 44x44px for all interactive elements
- Safe areas: Account for notches and home indicators
- Orientation: Portrait-only for simplicity

### Touch Interactions
- **Tap**: Mark/unmark squares, buttons
- **Long press**: Not used (avoid complexity)
- **Swipe**: Not used (prevent accidental navigation)
- **Haptic feedback**: Optional vibration on square mark (where supported)

## Color Palette

### Theme: "Game Night"

A warm, cozy palette that feels like a board game evening with friends.

```css
:root {
  /* Primary - Rich Amber (Scrabble tile inspired) */
  --primary: 36 100% 50%;        /* #FFA500 */
  --primary-foreground: 0 0% 100%;

  /* Secondary - Deep Teal */
  --secondary: 180 50% 25%;      /* #1F5F5F */
  --secondary-foreground: 0 0% 100%;

  /* Background - Warm Dark */
  --background: 30 15% 10%;      /* #1A1612 */
  --foreground: 40 20% 90%;      /* #EDE6DB */

  /* Card - Slightly lighter */
  --card: 30 15% 14%;            /* #252018 */
  --card-foreground: 40 20% 90%;

  /* Accent - Warm Gold */
  --accent: 45 90% 55%;          /* #E6C229 */
  --accent-foreground: 0 0% 10%;

  /* Muted - Soft brown */
  --muted: 30 10% 25%;
  --muted-foreground: 40 10% 60%;

  /* Destructive - Soft Red */
  --destructive: 0 70% 50%;
  --destructive-foreground: 0 0% 100%;

  /* Success - Warm Green */
  --success: 120 40% 40%;        /* For marked squares */
  --success-foreground: 0 0% 100%;

  /* Border */
  --border: 30 15% 20%;
  --ring: 36 100% 50%;
}
```

### Challenge Difficulty Colors

```css
.challenge-easy {
  background: hsl(120 40% 25%);    /* Muted green */
  border-color: hsl(120 40% 35%);
}

.challenge-medium {
  background: hsl(45 60% 30%);     /* Muted amber */
  border-color: hsl(45 60% 40%);
}

.challenge-hard {
  background: hsl(0 50% 30%);      /* Muted red */
  border-color: hsl(0 50% 40%);
}
```

## Typography

### Font Stack

```css
/* Headings - Playful but readable */
--font-heading: 'Fredoka', 'Comic Neue', system-ui, sans-serif;

/* Body - Clean and readable */
--font-body: 'Inter', system-ui, -apple-system, sans-serif;

/* Monospace - For codes */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Scale

```css
--text-xs: 0.75rem;    /* 12px - Labels */
--text-sm: 0.875rem;   /* 14px - Secondary text */
--text-base: 1rem;     /* 16px - Body */
--text-lg: 1.125rem;   /* 18px - Emphasis */
--text-xl: 1.25rem;    /* 20px - Subheadings */
--text-2xl: 1.5rem;    /* 24px - Headings */
--text-3xl: 2rem;      /* 32px - Page titles */
--text-4xl: 2.5rem;    /* 40px - Hero text */
```

## Component Hierarchy

### Screen: Home

```
┌────────────────────────────────┐
│                                │
│         🎲 BINGO               │
│        SCRABBLE                │
│                                │
│   ┌────────────────────────┐   │
│   │     CREATE GAME        │   │
│   └────────────────────────┘   │
│                                │
│          ── or ──              │
│                                │
│   ┌────────────────────────┐   │
│   │  Enter Game Code       │   │
│   └────────────────────────┘   │
│   ┌────────────────────────┐   │
│   │        JOIN            │   │
│   └────────────────────────┘   │
│                                │
└────────────────────────────────┘
```

### Screen: Lobby

```
┌────────────────────────────────┐
│  ← Back           Game: ABC123 │
│                                │
│        Waiting for players     │
│            (2 / 4)             │
│                                │
│   ┌────────────────────────┐   │
│   │  👑 Alex (Host)    ✓   │   │
│   ├────────────────────────┤   │
│   │     Sarah          ✓   │   │
│   ├────────────────────────┤   │
│   │     Waiting...     ○   │   │
│   ├────────────────────────┤   │
│   │     Waiting...     ○   │   │
│   └────────────────────────┘   │
│                                │
│        Share this code:        │
│   ┌────────────────────────┐   │
│   │       ABC123       📋  │   │
│   └────────────────────────┘   │
│                                │
│   ┌────────────────────────┐   │
│   │     START GAME         │   │  (Only visible to host)
│   └────────────────────────┘   │  (Disabled until 4 players)
│                                │
└────────────────────────────────┘
```

### Screen: Board

```
┌────────────────────────────────┐
│  Alex's Board          2/5 🏆  │
│                                │
│  ┌─────┬─────┬─────┬─────┬─────┐
│  │  ✓  │     │     │  ✓  │     │
│  │Easy │Med  │Hard │Easy │Med  │
│  ├─────┼─────┼─────┼─────┼─────┤
│  │     │  ✓  │     │     │     │
│  │Med  │Easy │Med  │Hard │Easy │
│  ├─────┼─────┼─────┼─────┼─────┤
│  │     │     │FREE │     │     │
│  │Hard │Med  │ ✓   │Med  │Hard │
│  ├─────┼─────┼─────┼─────┼─────┤
│  │     │     │     │     │     │
│  │Easy │Hard │Med  │Easy │Med  │
│  ├─────┼─────┼─────┼─────┼─────┤
│  │     │     │     │     │     │
│  │Med  │Easy │Easy │Med  │Hard │
│  └─────┴─────┴─────┴─────┴─────┘
│                                │
│   Other players:               │
│   Sarah ●●○○○  Mike ●○○○○     │
│   John  ●●●○○                  │
│                                │
└────────────────────────────────┘
```

### Modal: Winner

```
┌────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░   🎉 🎊 🏆 🎊 🎉    ░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░    SARAH WINS!      ░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░   ┌──────────────┐  ░░░░ │
│ ░░░░   │  PLAY AGAIN  │  ░░░░ │
│ ░░░░   └──────────────┘  ░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└────────────────────────────────┘
```

## Animation Specifications

### Square Tap

```css
/* Tap feedback */
.bingo-square:active {
  transform: scale(0.95);
  transition: transform 50ms ease-out;
}

/* Mark animation */
.bingo-square.marked {
  animation: mark 300ms ease-out;
}

@keyframes mark {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

### Checkmark Appearance

```css
.checkmark {
  animation: checkmark 400ms ease-out;
}

@keyframes checkmark {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}
```

### Winner Celebration

```css
/* Confetti burst from center */
.confetti {
  animation: confetti 1s ease-out forwards;
}

@keyframes confetti {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(720deg);
    opacity: 0;
  }
}

/* Trophy bounce */
.trophy {
  animation: bounce 500ms ease-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
```

### Page Transitions

```css
/* Fade in on page load */
.page-enter {
  animation: fadeIn 200ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## Responsive Breakpoints

```css
/* Mobile (default) */
/* 375px - 767px */

/* Tablet */
@media (min-width: 768px) {
  /* Larger board squares */
  /* Side-by-side layout for lobby */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Max-width container */
  /* Potentially show all boards side by side */
}
```

## Accessibility Considerations

### Color Contrast
- All text meets WCAG AA (4.5:1 for body, 3:1 for large text)
- Marked squares have both color AND checkmark indicator
- Don't rely on color alone for challenge difficulty

### Touch Targets
- Minimum 44x44px for all interactive elements
- Adequate spacing between tappable items (8px minimum)

### Screen Readers
- Semantic HTML (buttons, headings, lists)
- ARIA labels for icon-only buttons
- Live regions for game updates ("Sarah marked a square")

### Motion
- Respect `prefers-reduced-motion`
- Provide non-animated alternatives

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
