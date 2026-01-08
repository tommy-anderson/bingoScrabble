# Design System

## Design Philosophy

Scrabble Bingo is designed as a **companion app** that enhances the Scrabble experience without being distracting. The design should be:

- **Glanceable** - Quick to check and interact with between Scrabble turns
- **Tactile** - Satisfying tap interactions for marking squares
- **Celebratory** - Fun win animations that don't overstay their welcome
- **Accessible** - Works in varying lighting conditions, readable text
- **Warm** - Cozy game night aesthetic that complements physical board games

---

## Mobile-First Approach

Since this app will primarily be used on phones sitting next to a Scrabble board:

### Viewport Considerations
- **Primary target**: 375px - 428px width (iPhone SE to iPhone Pro Max)
- **Touch targets**: Minimum 44×44px for all interactive elements
- **Safe areas**: Account for notches and home indicators
- **Orientation**: Portrait-only for simplicity

### Touch Interactions
| Gesture | Action |
|---------|--------|
| **Tap** | Select square, mark/unmark, buttons |
| **Long press** | Not used (avoid complexity) |
| **Swipe** | Not used (prevent accidental navigation) |
| **Haptic** | Optional vibration on square mark |

---

## Color System

### Theme: "Game Night"

A warm, cozy palette inspired by wooden Scrabble tiles and board game evenings.

### CSS Variables (globals.css)

```css
:root {
  /* Background - Warm Dark */
  --background: 30 15% 10%;      /* #1A1612 - Deep warm brown */
  --foreground: 40 20% 90%;      /* #EDE6DB - Cream text */

  /* Card - Slightly lighter */
  --card: 30 15% 14%;            /* #252018 */
  --card-foreground: 40 20% 90%;

  /* Primary - Rich Amber (Scrabble tile inspired) */
  --primary: 36 100% 50%;        /* #FFA500 - Amber/Orange */
  --primary-foreground: 0 0% 10%;

  /* Secondary - Deep Teal */
  --secondary: 180 50% 25%;      /* #1F5F5F */
  --secondary-foreground: 0 0% 100%;

  /* Accent - Warm Gold */
  --accent: 45 90% 55%;          /* #E6C229 */
  --accent-foreground: 0 0% 10%;

  /* Muted - Soft brown */
  --muted: 30 10% 25%;
  --muted-foreground: 40 10% 60%;

  /* Success - Warm Green */
  --success: 142 50% 40%;
  --success-foreground: 0 0% 100%;

  /* Destructive - Soft Red */
  --destructive: 0 70% 50%;
  --destructive-foreground: 0 0% 100%;

  /* Border & Ring */
  --border: 30 15% 20%;
  --input: 30 15% 20%;
  --ring: 36 100% 50%;

  --radius: 0.75rem;
}
```

### Difficulty Color System

Each challenge has a difficulty level indicated by distinct colors:

```
┌─────────────────────────────────────────────────────────────────┐
│                    DIFFICULTY COLORS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │  EASY    │  │  MEDIUM  │  │  HARD    │                      │
│  │  🟢      │  │  🟡      │  │  🔴      │                      │
│  │          │  │          │  │          │                      │
│  │ Emerald  │  │  Amber   │  │   Red    │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
│                                                                  │
│  Default State:                                                  │
│  ├─ bg-emerald-900/70    bg-amber-900/70    bg-red-900/70      │
│  ├─ border-emerald-600   border-amber-600   border-red-600     │
│  └─ hover brightens to -800/80 and -400 border                 │
│                                                                  │
│  Marked State:                                                   │
│  ├─ bg-emerald-700       bg-amber-700       bg-red-700         │
│  ├─ border-emerald-400   border-amber-400   border-red-400     │
│  └─ shadow-lg with colored shadow                               │
│                                                                  │
│  Selected State:                                                 │
│  ├─ ring-2 with -300 shade                                      │
│  └─ scale-[1.02] for lifted effect                              │
│                                                                  │
│  Indicator Dot:                                                  │
│  └─ bg-emerald-400       bg-amber-400       bg-red-400         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Tailwind Safelist

Because difficulty colors are applied dynamically via JavaScript strings, they must be safelisted in `tailwind.config.ts`:

```typescript
safelist: [
  // Emerald (Easy)
  "bg-emerald-900/70", "bg-emerald-800/80", "bg-emerald-700",
  "border-emerald-600", "border-emerald-400",
  "hover:border-emerald-400", "hover:bg-emerald-800/80",
  "ring-emerald-300", "shadow-emerald-900/50", "bg-emerald-400",
  
  // Amber (Medium)
  "bg-amber-900/70", "bg-amber-800/80", "bg-amber-700",
  "border-amber-600", "border-amber-400",
  "hover:border-amber-400", "hover:bg-amber-800/80",
  "ring-amber-300", "shadow-amber-900/50", "bg-amber-400",
  
  // Red (Hard)
  "bg-red-900/70", "bg-red-800/80", "bg-red-700",
  "border-red-600", "border-red-400",
  "hover:border-red-400", "hover:bg-red-800/80",
  "ring-red-300", "shadow-red-900/50", "bg-red-400",
],
```

---

## Typography

### Font Stack

```css
/* Headings - Playful but readable */
font-heading: 'Fredoka', 'Comic Neue', system-ui, sans-serif;

/* Body - Clean and readable */
font-body: 'Inter', system-ui, -apple-system, sans-serif;

/* Monospace - For game codes */
font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale

| Size | Rem | Pixels | Usage |
|------|-----|--------|-------|
| `text-xs` | 0.75rem | 12px | Labels, meta info |
| `text-sm` | 0.875rem | 14px | Secondary text |
| `text-base` | 1rem | 16px | Body text |
| `text-lg` | 1.125rem | 18px | Emphasis |
| `text-xl` | 1.25rem | 20px | Subheadings |
| `text-2xl` | 1.5rem | 24px | Headings |
| `text-3xl` | 2rem | 32px | Page titles |

### Challenge Text Sizing

Bingo squares use responsive text sizing:
```css
text-[10px] xs:text-xs sm:text-sm
```

This ensures text fits within squares on all device sizes.

---

## Component Specifications

### Screen: Home Page

```
┌────────────────────────────────┐
│                                │
│         🎲 SCRABBLE            │ ← Fredoka font, primary color
│           BINGO                │
│                                │
│   ┌────────────────────────┐   │
│   │     CREATE GAME        │   │ ← Primary button, full width
│   └────────────────────────┘   │
│                                │
│          ── or ──              │ ← Muted divider
│                                │
│   ┌────────────────────────┐   │
│   │  Enter Game Code       │   │ ← Input with placeholder
│   └────────────────────────┘   │
│   ┌────────────────────────┐   │
│   │        JOIN            │   │ ← Secondary button
│   └────────────────────────┘   │
│                                │
└────────────────────────────────┘
```

### Screen: Game Lobby

```
┌────────────────────────────────┐
│  Game: ABC123              📋  │ ← Code with copy button
│                                │
│        Waiting for players     │
│            (2 / 4)             │
│                                │
│   ┌────────────────────────┐   │
│   │  👑 Alex (Host)    ✓   │   │ ← Crown for host
│   ├────────────────────────┤   │
│   │     Sarah          ✓   │   │
│   ├────────────────────────┤   │
│   │     Waiting...     ○   │   │ ← Empty slots
│   ├────────────────────────┤   │
│   │     Waiting...     ○   │   │
│   └────────────────────────┘   │
│                                │
│   ┌────────────────────────┐   │
│   │     START GAME         │   │ ← Only visible to host
│   └────────────────────────┘   │   Disabled until 2+ players
│                                │
└────────────────────────────────┘
```

### Screen: Bingo Board

```
┌────────────────────────────────┐
│ Alex's Board     Best line: 2/5│ ← Header with progress
│ 3/25 marked      ●●○○○         │
│                                │
│ ┌─────┬─────┬─────┬─────┬─────┐
│ │ You │Anyo-│ You │Sara-│ Any │ 
│ │score│ne   │use a│h sc-│oppo-│
│ │> 5  │plays│DL   │ores │nent │
│ │pts  │...  │squa-│...  │...  │
│ │  ●  │  ●  │re ● │  ●  │  ●  │ ← Difficulty dots
│ ├─────┼─────┼─────┼─────┼─────┤
│ │  ✓  │     │     │     │     │ ← Marked with checkmark
│ │     │     │     │     │     │
│ │  ●  │  ●  │  ●  │  ●  │  ●  │
│ ├─────┼─────┼─────┼─────┼─────┤
│ │     │     │     │  ✓  │     │
│ ...   ...   ...   ...   ...   │
│ └─────┴─────┴─────┴─────┴─────┘
│                                │
│ ┌────────────────────────────┐ │ ← Detail panel (when selected)
│ │ Easy Challenge             │ │
│ │ You score > 5 points       │ │
│ │                            │ │
│ │        [Mark Done]         │ │
│ └────────────────────────────┘ │
│                                │
│ Other players:                 │
│ Sarah ●●●○○  Mike ●○○○○       │ ← Progress indicators
└────────────────────────────────┘
```

### Bingo Square States

```
┌─────────────────────────────────────────────────────────────────┐
│                    SQUARE STATES                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  DEFAULT                 SELECTED                MARKED          │
│  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐  │
│  │             │        │ ░░░░░░░░░░░ │        │      ✓      │  │
│  │  Challenge  │        │  Challenge  │        │  Challenge  │  │
│  │    text     │   →    │    text     │   →    │    text     │  │
│  │             │        │ ░░░░░░░░░░░ │        │             │  │
│  │          ●  │        │ ▓▓▓▓▓▓▓▓ ●  │        │          ●  │  │
│  └─────────────┘        └─────────────┘        └─────────────┘  │
│                                                                  │
│  bg-{color}-900/70      + ring-2               bg-{color}-700   │
│  border-{color}-600     + ring-{color}-300     border-{color}-400│
│                         + scale-[1.02]         + shadow-lg      │
│                                                + checkmark icon │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Modal: Winner

```
┌────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ← Backdrop overlay
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░   🎉 🏆 🎉    ░░░░ │     │ ← Trophy with animation
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░    SARAH WINS!      ░░░░ │     │ ← Large heading
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░   ┌──────────────┐  ░░░░ │
│ ░░░░   │ Back to Home │  ░░░░ │     │ ← Action button
│ ░░░░   └──────────────┘  ░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└────────────────────────────────┘
```

---

## Animation System

### Keyframes (defined in tailwind.config.ts)

```typescript
keyframes: {
  // Square tap feedback
  "mark-bounce": {
    "0%": { transform: "scale(1)" },
    "50%": { transform: "scale(1.1)" },
    "100%": { transform: "scale(1)" },
  },
  
  // Checkmark appearance
  "checkmark-appear": {
    "0%": { transform: "scale(0) rotate(-45deg)", opacity: "0" },
    "50%": { transform: "scale(1.2) rotate(0deg)", opacity: "1" },
    "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
  },
  
  // Confetti for winner
  "confetti-fall": {
    "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
    "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: "0" },
  },
  
  // Trophy bounce
  "trophy-bounce": {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-20px)" },
  },
  
  // Page fade in
  "fade-in": {
    from: { opacity: "0", transform: "translateY(10px)" },
    to: { opacity: "1", transform: "translateY(0)" },
  },
},

animation: {
  "mark-bounce": "mark-bounce 300ms ease-out",
  "checkmark-appear": "checkmark-appear 400ms ease-out",
  "confetti-fall": "confetti-fall 1s ease-out forwards",
  "trophy-bounce": "trophy-bounce 500ms ease-out infinite",
  "fade-in": "fade-in 200ms ease-out",
},
```

### Animation Usage

| Element | Animation | Trigger |
|---------|-----------|---------|
| Bingo square | `mark-bounce` | When marked |
| Checkmark icon | `checkmark-appear` | When square marked |
| Confetti pieces | `confetti-fall` | On win |
| Trophy | `trophy-bounce` | On win modal |
| Page content | `fade-in` | On page load |

### Touch Feedback

```css
/* Active state for tap feedback */
.bingo-square {
  @apply active:scale-95 transition-all duration-150;
}
```

---

## Responsive Breakpoints

```typescript
// tailwind.config.ts
screens: {
  xs: "375px",   // iPhone SE
  sm: "640px",   // Large phones
  md: "768px",   // Tablets
  lg: "1024px",  // Desktop
  xl: "1280px",  // Large desktop
},
```

### Mobile (default: < 375px)
- Single column layout
- Full-width components
- Compact text sizes on squares

### Small (xs: 375px+)
- Slightly larger square text
- Better spacing

### Medium (sm: 640px+)
- Larger board squares
- More padding
- Larger touch targets

### Tablet+ (md: 768px+)
- Centered container
- Max-width constraints
- More breathing room

---

## Accessibility

### Color Contrast
- All text meets WCAG AA (4.5:1 for body, 3:1 for large text)
- Marked squares have both color AND checkmark indicator
- Difficulty indicated by color AND position dot

### Touch Targets
- Minimum 44×44px for all interactive elements
- Adequate spacing between tappable items (8px minimum)
- Full-width buttons on mobile

### Screen Readers
- Semantic HTML (`<button>`, `<h1>`, etc.)
- ARIA labels for icon-only buttons
- Meaningful button text

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Safe Areas (Notched Devices)

```css
/* For iPhone notch and home indicator */
@supports (padding: max(0px)) {
  .safe-area-bottom {
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }
  .safe-area-top {
    padding-top: max(1rem, env(safe-area-inset-top));
  }
}
```

Applied to main game container to prevent content from being hidden behind device chrome.

---

## Progress Visualization

### Progress Dots Component

```
Filled:   ●●●○○  (3/5 progress)
Empty:    ○○○○○  (0/5 progress)
Complete: ●●●●●  (WIN!)
```

```typescript
// ProgressDots component
<div className="flex gap-0.5">
  {[0, 1, 2, 3, 4].map((i) => (
    <div
      key={i}
      className={cn(
        "w-2 h-2 rounded-full",
        i < progress ? filledClass : "bg-muted"
      )}
    />
  ))}
</div>
```

### Size Variants
- `sm`: 6px dots (other players' progress)
- `md`: 8px dots (current player header)

---

## Icon System

Using **Lucide React** for consistent, clean icons:

| Icon | Usage |
|------|-------|
| `Crown` | Host indicator |
| `Check` | Marked square |
| `Copy` | Copy game code |
| `Loader2` | Loading spinner |
| `Trophy` | Winner display |

All icons use `stroke-[3]` for better visibility at small sizes.
