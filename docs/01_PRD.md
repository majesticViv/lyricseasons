# 准时宝语录 — Product Requirements Document (PRD)

## ⚠️ Implementation Notes for Claude Code

**This is a complete rebuild.** Delete any existing component files and rebuild according to this spec.

### Critical Rules:
1. **All major animations use JavaScript frameAnimation.ts at 12fps** — not CSS transitions
2. **Stickers are BUTTONS, not decoration** — every sticker element is functional
3. **No stickers on cards** — cards display content only
4. **Most visual elements will be images** — structure code so images can be swapped in easily
5. **4 different backgrounds** — one collage image per season (placeholder colors for now)

---

## Overview

| Field | Value |
|-------|-------|
| **App name** | 准时宝语录 |
| **Users** | Viv and Bili (exactly two users, equal permissions) |
| **Platform** | Mobile-first PWA |
| **Language** | English UI. App name stays in Chinese. |

---

## Screens & Features

### F1 — Identity Screen
**When:** Every new browser session

- Two tappable cards: "Viv" and "Bili"
- Tap → stop-motion pop animation → store in sessionStorage → go to Landing
- Simple, centered layout

---

### F2 — Landing Page (Stacked State)
**Initial state after identity selection**

Elements:
- **Envelope stack** (center): 4 envelopes stacked, top one has wax seal with 准时宝语录
- **Pen** (beside stack, right side): tappable → opens Add View
- **Gramophone** (bottom-left corner): tappable → opens Spotify playlist in new tab. NO TEXT.

Interaction:
- Tap envelope stack → animate to Distributed State

---

### F3 — Landing Page (Distributed State)
**After tapping the stack**

Elements:
- **4 season envelopes** in 2x2 grid: 春 (spring), 夏 (summer), 秋 (autumn), 冬 (winter)
- **Pen** moves to bottom-right corner
- **Gramophone** stays bottom-left
- **Back arrow** (top-left): returns to Stacked State

Interaction:
- Tap a season envelope → opens Season Options

---

### F4 — Season Options
**When a season envelope is tapped**

Animation:
1. Tapped envelope moves to center
2. Other 3 envelopes fade out
3. Envelope changes to "opened" state (different element, will be image later)
4. Paper slip slides UP from inside (correct z-index: envelope front covers paper bottom)

Paper slip shows TWO options:
- **BROWSE**
- **SURPRISE ME**
- **× close** (returns to distributed grid)

---

### F5 — Browse View (Multiple Cards)
**When BROWSE is selected**

Layout:
- **Background**: Season-specific collage image (placeholder color for now)
- **3 cards visible** per page (like index cards with paperclips)
- **Sticker buttons** around the page:
  - Previous page (if not on first page)
  - Next page (if more pages exist)
  - Back (returns to season envelope grid)

Card display (each card shows):
- Lyric text (handwritten font, legible)
- Song title
- Artist
- Author stamp (Viv or Bili) — automatic based on who created it
- Date — automatic

Interaction:
- Tap a card → opens Single Card View for that card
- Tap sticker buttons → navigate

Pagination:
- 3 cards per page
- Calculate total pages from entry count

---

### F6 — Single Card View
**When a card is tapped from Browse, or from Surprise Me**

Layout:
- **Background**: Same season collage as Browse
- **One card** centered, larger
- **Sticker buttons**:
  - Back (returns to Browse or envelope grid)
  - Edit (opens Edit View)

Card shows same info as Browse card, just bigger.

---

### F7 — Add View
**When pen is tapped from Landing**

Layout (3 layers, all will be images later):
1. **Background** (full screen image)
2. **Paper slip** (the editable area, positioned coming out of typewriter)
3. **Typewriter** (bottom of screen image)

Paper slip fields:
- Lyric (textarea)
- Song title (text input)
- Artist (text input)

Season selector:
- 4 buttons on/near the typewriter
- Each button has pressed/unpressed state (will be images)
- Visually represents: 春 夏 秋 冬

Navigation:
- Top-left: "back" text → returns to Landing (discard)
- Top-right: "enter" text → saves entry, returns to Landing

Auto-filled (not shown to user as editable):
- Author: from sessionStorage (Viv or Bili)
- Date: current date

---

### F8 — Edit View
**When Edit sticker is tapped from Single Card View**

- Same layout as Add View
- Pre-filled with existing entry data
- "enter" saves changes
- "back" discards changes

---

### F9 — Surprise Me
**When SURPRISE ME is selected from Season Options**

- Picks one random entry from that season
- Shows it in Single Card View
- Back button returns to season envelope grid (not Browse)

---

### F10 — Gramophone
- Tappable icon in bottom-left of Landing
- Opens Spotify playlist: `https://open.spotify.com/playlist/4QXnUNne50rf8xbuADrP50`
- Opens in new tab
- **No text label** — just the icon

---

## Data Model

### Entry
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Auto-generated |
| lyric | text | Required, max 2000 chars |
| song_title | text | Optional |
| artist | text | Optional |
| season | enum | 'spring', 'summer', 'autumn', 'winter' |
| author | enum | 'Viv', 'Bili' — auto from session |
| created_at | timestamp | Auto-generated |

---

## Image Assets (to be provided later)

| Element | Notes |
|---------|-------|
| Spring background | Collage image for Browse/Single Card |
| Summer background | Collage image for Browse/Single Card |
| Autumn background | Collage image for Browse/Single Card |
| Winter background | Collage image for Browse/Single Card |
| Opened envelope | For Season Options |
| Typewriter | For Add/Edit View |
| Add/Edit background | Behind typewriter |
| Paper slip | Text area background |
| Season buttons ×4 | Pressed and unpressed states |
| Sticker: next page | Button |
| Sticker: prev page | Button |
| Sticker: back | Button |
| Sticker: edit | Button |
| Card with paperclip | Card background |
| Wax seal | For envelope stack |
| Envelope (closed) | For stack and grid |
| Pen | Landing element |
| Gramophone | Landing element |

For now: use placeholder shapes/colors with clear class names for easy swap.

---

## Out of Scope for v1

- Song link field
- Delete functionality
- Stickers as decoration on cards
- Mood tags
- Search/filter
- In-browser Spotify playback
