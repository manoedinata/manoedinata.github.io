# DESIGN.md — "Quiet Engineer" persona

Design persona derived from analysis of https://kdrag0n.dev (Astro + Tailwind, analyzed 2026-11-11).
This persona describes the *pattern*, not the content. Our implementation uses its own content.

---

## 1. Persona

**Who it feels like:** a systems engineer who builds things and doesn't need to shout about it.
Confident, playful in small doses, allergic to decoration that doesn't do work.

| Trait | Expression in UI |
|---|---|
| Understated | No nav bar, no hero image, no CTA buttons. Name + two sentences. |
| Precise | Square corners everywhere. 2px strokes. Tabular numbers for years. |
| Curious / playful | A faint self-playing maze-chase game loops behind the page. A tiny "what's this?" link explains it. (The reference site uses Conway's Game of Life; we swapped in an original maze chase.) |
| Organized | Two-column index: sticky section labels on the left, content cards on the right. |
| Warm | Pastel tinted cards, one hue per category, colour emoji (Noto) as icons. |

Voice: first-person, short, lowercase-casual where it's a joke ("what's this?"), otherwise sentence case.
Taglines are one line. Descriptions are one line. Never paragraphs.

---

## 2. Layout

```
┌───────────────────────────────────────────────────────────── what's this? ┐
│  [Maze-chase canvas: fixed, full viewport, 6% opacity, behind all]        │
│                                                                           │
│  Name (huge, tight)                                                       │
│  Hi! I make things.                                                       │
│  One more sentence.                                                       │
│                                                                           │
│  What I do  (sticky) │ ┌ Card: tinted, emoji + title · role ─────────┐    │
│                      │ └ one-line description ───────────────────────┘    │
│                      │ ┌ Card ┐ ┌ Card ┐                                   │
│                                                                           │
│  Say hi!   (sticky)  │ [tile][tile][tile][tile]  ← square contact tiles   │
│                                                                           │
│  Other doings        │ ┌ Group card: emoji + category ───────────────┐    │
│            (sticky)  │ │ Item title ·· role                    2022  │    │
│                      │ │ one-line description                        │    │
│                      │ └─────────────────────────────────────────────┘    │
│                                                                           │
│              ┌──── footer band (webring/nav, zinc-100) ────┐              │
│                         Terms · Privacy   © year                          │
└───────────────────────────────────────────────────────────────────────────┘
```

- **Container:** `w-full max-w-screen-xl`, centered. Padding `px-4 py-8` → `sm:px-16 sm:py-20`.
- **Vertical rhythm:** top-level sections separated by `gap-16 sm:gap-24`.
- **Index grid:** `grid grid-cols-1 sm:grid-cols-[2fr_3fr] gap-x-8 gap-y-4`. Left column = label, right = content. Mobile collapses to one column, label above content.
- **Sticky labels:** `h2.sticky.top-6` — label follows the reader while the right column scrolls. Each content block has `mb-8 sm:mb-20` so labels "hand off".
- **Content stacks:** `flex flex-col gap-4`.
- **Contact row:** `grid grid-flow-col-dense auto-cols-fr` — N equal **square** tiles (`aspect-square`), `gap-2 sm:gap-4`.
- **Footer:** centered, `max-w-2xl`, band `h-24` with prev / center / next.
- No header, no nav, no hamburger. Single page.

---

## 3. Colour

### Base
| Token | Light | Dark |
|---|---|---|
| page bg | `#fefefe` | `#151515` |
| body text | `neutral-800` | `neutral-100` |
| headings | `neutral-950` | `neutral-50` |
| muted (footer, meta) | `neutral-500` | `neutral-400`/`500` |
| footer band | `zinc-100` | `zinc-800` |

Theme follows `prefers-color-scheme` only (no toggle). `<meta name="theme-color">` set per scheme.

### Category tints (the signature)
Every card/tile owns **one hue**, used three ways:

| Role | Light | Dark |
|---|---|---|
| Card fill (primary cards) | `{hue}-100` | `{hue}-900` |
| Card fill (group cards) | `{hue}-50` | `{hue}-950` |
| Corner-bracket accent | `{hue}-700` | `{hue}-300` |
| Icon colour (tiles) | `{hue}-900` | `{hue}-200` |

Hues in use: purple, red, orange, yellow, indigo, green, fuchsia, blue, neutral, plus custom OKLCH
(warm `oklch(87% 0.045 60)` latte, cool `oklch(92.9% 0.025 280)` slate-violet). Keep chroma low — pastel, never saturated fills.

---

## 4. Typography

- **Display face:** *TASA Orbiter* (variable 400–800), class `font-heading`. Used for the name and section labels only.
- **Body:** system sans (`ui-sans-serif, system-ui`), `text-base`, `antialiased`.
- **Scale**
  - Name: `text-6xl sm:text-7xl font-bold tracking-tighter` — with a tiny optical kern tweak (`ml-[0.035em]`) on a letter pair.
  - Section label: `text-2xl sm:text-3xl font-semibold tracking-tight`.
  - Card title: `text-2xl font-semibold tracking-tight`, emoji inline at 32px, `gap-2`.
  - Item title: `text-lg font-medium leading-snug`.
  - Meta (role/year): `opacity-60`/`opacity-70`, years `tabular-nums`.
  - Description: `opacity-90`.
- Hierarchy is done with **weight + opacity**, not colour.

---

## 5. Components

### 5.1 BracketLink (signature interaction)
Every link is wrapped in a component that draws **two L-shaped corner brackets** (top-left, bottom-right) via `::before`/`::after`:
- 2px stroke, made with `clip-path` polygons on a filled box, offset `-2px` outside the element.
- Colour from CSS vars `--link-border-color-light` / `--link-border-color-dark` (set per link to its category's 700/300 shade).
- Rest: `width/height: 0`. Hover/focus-visible: grows to `min(40%, 200px) + 4px`, `transition .2s ease-out`.
- **On page load**, every bracket plays `onLinkLoad` (1.2s): grows → holds → fades. A "hello, these are clickable" moment.
- `focus-visible` replaces the outline with the brackets (accessible).
- Can be re-triggered (used after smooth-scrolling to the contact section).

### 5.2 FeatureCard
`flex flex-col p-4 gap-1 bg-{hue}-100 dark:bg-{hue}-900`, whole card is the link. Title row: emoji + name + `· role` at 70% opacity. One-line description.

### 5.3 ContactTile
Square, centered, emoji/brand icon (32–36px, tinted `{hue}-900/200`) above a label. `bg-{hue}-100 dark:bg-{hue}-900`, `p-2`, `gap-1 md:gap-2`, `leading-tight`.

### 5.4 GroupCard
Non-link container `p-4 gap-3 bg-{hue}-50 dark:bg-{hue}-950`. Emoji + category title, then list of BracketLink rows:
`title` left, `year` right (`justify-between items-start gap-4`), description beneath.

### 5.5 Maze-chase background (`MazeChase.vue`)
- Canvas `fixed inset-0 w-screen h-screen`, `opacity-[0.06] dark:opacity-[0.09] dark:invert`, `pointer-events-none`, behind everything.
- **Cursor spotlight**: a second canvas mirrors the maze at `opacity-90`, masked to a soft 140px radial circle that trails the pointer (eased). Fades in on first mouse move and out when the pointer leaves the window. Mouse/trackpad only. Off on post pages so it doesn't distract while reading.
- Same pixel language as the reference: walls are drawn as 8px cells with a 1px inset (little squares with gaps), at 20% alpha inside the canvas (fainter than pellets and actors).
- Maze: 24px tiles, generated by a depth-first backtracker, then *braided* (most dead ends opened) so there are loops. A new maze is generated for every level and on resize.
- Cast (original 6×6 pixel sprites, monochrome):
  - **Chomper**: a box with one eye and a slot mouth that opens and closes. It turns to face its direction of travel.
  - **Glitches** (4): small critters with two-frame legs. When frightened they become hollow, blinking boxes. Once eaten, only their eyes remain as they run home.
- AI (fully automatic, no input):
  - Chomper: BFS to the nearest pellet and avoids tiles within 2 of a hunter. During power mode it chases glitches instead.
  - Glitches: BFS toward the chomper, each with a different aggression (55–85%) and otherwise random turns. They flee while frightened and are released from the centre at staggered times.
- Loop: when every pellet is eaten, the walls blink and a new maze appears. When the chomper is caught, it shrinks away and everyone respawns. It never ends.
- 4 power pellets near the corners give 6s of frightened mode.
- Runs on `requestAnimationFrame` with a clamped dt, pauses when the tab is hidden, and shows a single static frame when `prefers-reduced-motion` is set.
- Fades in (`opacity 0→1`, 1.2s, 0.25s delay) together with the "what's this?" link (points to *Maze game* on Wikipedia).
- Do **not** copy any existing game's characters, maze or colours. Keep it monochrome and original.

### 5.6 Footer band
`bg-zinc-100 dark:bg-zinc-800`, `h-24`, prev ◂ / center label + small links / ▸ next, links tinted fuchsia-700/300. Below: tiny legal links and ©.

### 5.7 Writings (blog)
- Posts: `src/posts/<slug>.md` with YAML frontmatter (`title`, `date` required; `description`, `emoji`, `hue`, `tags`, `draft`). Rendered at build time by `plugins/posts.js` (marked). URL = `/writings/<slug>/`.
- Routing: `vue-router` history mode. The build also writes `writings/index.html`, one `index.html` per post and `404.html`, so GitHub Pages returns 200 with the right `<title>` on deep links.
- **Index** (`/writings/`): same index grid. Sticky **year** labels left, one FeatureCard per post right (emoji + title, date right in `tabular-nums`, description, `N min read · tags` at 60%).
- **Post**: emoji + title (`text-5xl sm:text-6xl`) + description. Grid left = sticky meta (date, read time, tag chips in `{hue}-100`) and an "On this page" box (`{hue}-50`, h2/h3 BracketLinks, hidden on phones). Right = `.prose`.
- `.prose` (style.css): neutral text; the post hue appears only in link underlines, list markers and `hr`. Code, blockquotes and table stripes use the footer band's `zinc-100/800`. No borders, square corners.
- Footer band (§5.6) becomes older ‹ · all writings · › newer.
- A small "‹ home" / "‹ writings" link sits top-left, mirroring "what's this?".
- Drafts render in `npm run dev` only; the build drops their content and metadata.

---

## 6. Motion

| What | How |
|---|---|
| Brackets on load | 1.2s grow-hold-fade, ease-out |
| Brackets on hover | 0.2s ease-out grow |
| Background | continuous rAF maze chase (chomper 7, glitches 6 tiles/s); fade-in 1.2s |
| In-page CTA ("Work with me?") | custom critically-damped spring scroll `(1+ωt)e^{-ωt}`, ω=√180, ~1s, cancels on any user input; then re-fires brackets on the target tiles |

Nothing else moves. No parallax, no scroll-reveal, no hover-lift, no shadows.

---

## 7. Rules (do / don't)

**Do**
- Square corners (`rounded-none`) everywhere.
- One hue per card; bracket colour = darker shade of the card's hue.
- Emoji as iconography for categories; mono-colour brand glyphs only for contact tiles.
- Keep every description to one line.
- Support `print:` — hide canvas/footer, collapse grid to one column, show handles under contact tiles.

**Don't**
- No borders, shadows, gradients, rounded corners, or hover-scale.
- No nav bar, no hero image, no buttons.
- No saturated fills. No more than ~6 hues on one screen.
- No body text colour other than neutral.

---

## 8. Tailwind cheat-sheet

```html
<body class="bg-[#fefefe] dark:bg-[#151515] text-neutral-800 dark:text-neutral-100 antialiased">
<h1 class="font-heading text-6xl sm:text-7xl font-bold tracking-tighter text-neutral-950 dark:text-neutral-50">
<h2 class="font-heading sticky top-6 text-2xl sm:text-3xl font-semibold tracking-tight">
<div class="grid grid-cols-1 sm:grid-cols-[2fr_3fr] gap-x-8 gap-y-4">
<div class="flex flex-col p-4 gap-1 bg-purple-100 dark:bg-purple-900">
```
