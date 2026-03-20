# 准时宝语录 — Design Document

## ⚠️ Critical Animation Rule

**All major animations use JavaScript frameAnimation.ts at 12fps (83ms per frame).**

Do NOT use CSS transitions or animations for:
- Envelope distribute/collapse
- Pen movement
- Envelope opening
- Paper slip sliding
- Card transitions
- Any element movement

CSS `steps()` is ONLY for minor effects like hover states.

---

## Design Philosophy

1. **Image-first design** — Most visual elements will be swapped for images. Code must structure elements with clear class names and proper layering for easy image replacement.

2. **Stickers are buttons** — Every sticker is a functional button. No decorative stickers.

3. **No stickers on cards** — Cards display content only.

4. **Handmade feel** — Stop-motion animations at 12fps, paper textures, physical metaphors.

---

## Color Palette (Placeholder)

These are placeholder colors until real images are provided:

```css
:root {
  /* Backgrounds (will be images) */
  --color-bg: #EDE8DE;              /* App background */
  --color-spring-bg: #E8F0E8;       /* Spring collage placeholder */
  --color-summer-bg: #F0E8E8;       /* Summer collage placeholder */
  --color-autumn-bg: #F0EBE4;       /* Autumn collage placeholder */
  --color-winter-bg: #E8ECF0;       /* Winter collage placeholder */
  
  /* Elements */
  --color-surface: #F5F0E8;         /* Card/paper surface */
  --color-primary: #8B2020;         /* Deep red - envelope, accents */
  --color-accent: #C9A84C;          /* Gold - pen, decorations */
  --color-text: #1A1A1A;            /* Primary text */
  --color-text-secondary: #6B4C3B;  /* Metadata, dates */
}
```

---

## Typography

```css
:root {
  /* Fonts */
  --font-display: 'Playfair Display', Georgia, serif;   /* App name, headers */
  --font-handwriting: 'Patrick Hand', cursive;          /* Lyric text - legible handwritten */
  --font-ui: 'Courier Prime', monospace;                /* UI elements, metadata */
}
```

**Font usage:**
- App name (准时宝语录): `--font-display`
- Lyric text on cards: `--font-handwriting`
- Song title, artist, date: `--font-ui`
- UI labels (BROWSE, SURPRISE ME): `--font-ui`
- Add/Edit form fields: `--font-handwriting`

---

## Element Structure (for image replacement)

### Envelope (Closed)
```html
<div class="envelope envelope--closed">
  <!-- Will be replaced with single image -->
</div>
```

### Envelope (Opened - Season Options)
```html
<div class="envelope-opened">
  <div class="envelope-opened__back"><!-- Image: back of envelope --></div>
  <div class="envelope-opened__paper-slip">
    <!-- Options content here -->
  </div>
  <div class="envelope-opened__front"><!-- Image: front edge of envelope --></div>
</div>
```
Z-index order: back (1) → paper-slip (2) → front (3)

### Card (Browse/Single)
```html
<div class="lyric-card">
  <div class="lyric-card__background"><!-- Image: card with paperclip --></div>
  <div class="lyric-card__content">
    <div class="lyric-card__lyric">Lyric text here</div>
    <div class="lyric-card__song">Song Title</div>
    <div class="lyric-card__artist">Artist Name</div>
    <div class="lyric-card__meta">
      <span class="lyric-card__date">Mar 19, 2026</span>
      <span class="lyric-card__author">Viv</span>
    </div>
  </div>
</div>
```

### Sticker Button
```html
<button class="sticker-btn sticker-btn--back">
  <img src="sticker-back.png" alt="Back" />
  <!-- OR placeholder: -->
  <div class="sticker-btn__placeholder">←</div>
</button>
```

### Typewriter (Add/Edit View)
```html
<div class="typewriter-view">
  <div class="typewriter-view__background"><!-- Image: background --></div>
  
  <div class="typewriter-view__nav">
    <span class="typewriter-view__back">back</span>
    <span class="typewriter-view__enter">enter</span>
  </div>
  
  <div class="typewriter-view__paper">
    <!-- Image: paper slip background -->
    <textarea class="typewriter-view__lyric" placeholder="lyric..."></textarea>
    <input class="typewriter-view__song" placeholder="song title" />
    <input class="typewriter-view__artist" placeholder="artist" />
  </div>
  
  <div class="typewriter-view__machine">
    <!-- Image: typewriter -->
    <div class="typewriter-view__seasons">
      <button class="season-btn season-btn--spring" data-season="spring">
        <!-- Image: pressed/unpressed -->
      </button>
      <button class="season-btn season-btn--summer" data-season="summer"></button>
      <button class="season-btn season-btn--autumn" data-season="autumn"></button>
      <button class="season-btn season-btn--winter" data-season="winter"></button>
    </div>
  </div>
</div>
```

---

## Screen Layouts

### Identity Screen
```
Center of screen:
- Two cards side by side
- Gap: 24px
- Card size: 140×180px

No other elements.
```

### Landing (Stacked)
```
Envelope stack: center of screen
Pen: 20px to the right of stack, vertically centered
Gramophone: bottom-left corner, 24px from edges
```

### Landing (Distributed)
```
4 envelopes: 2×2 grid, centered
Gap: 16px between envelopes
Each envelope: ~40vw width

Pen: bottom-right corner, 24px from edges
Gramophone: bottom-left corner, 24px from edges
Back arrow: top-left, 24px from edges
```

### Browse View
```
Full screen = season background image

Cards arranged:
- 3 cards visible
- Slight overlap or offset for depth
- Cards are tappable

Sticker buttons:
- Back: top-left area
- Prev: left side or bottom-left
- Next: right side or bottom-right
```

### Single Card View
```
Full screen = season background image

Card: centered, larger than Browse cards
- Width: ~85vw
- Maintain aspect ratio

Sticker buttons:
- Back: top-left area
- Edit: top-right area
```

### Add/Edit View
```
Full screen = background image

Paper slip: upper portion of screen
- Positioned as if coming out of typewriter
- Contains form fields

Typewriter: bottom portion of screen
- Season buttons integrated into/near typewriter

Navigation text:
- "back": top-left
- "enter": top-right
```

---

## Animation Specifications

All use `frameAnimation.ts` at 12fps:

| Animation | Duration | Frames | Description |
|-----------|----------|--------|-------------|
| Identity card tap | 500ms | 6 | Scale pop 0.8→1.15→1 |
| Envelope distribute | 800ms | 10 | Stack to grid positions |
| Envelope collapse | 800ms | 10 | Grid to stack positions |
| Pen move | 800ms | 10 | Position A to B |
| Envelope open (Season Options) | 600ms | 7 | Move to center |
| Paper slip up | 500ms | 6 | Slide up from envelope |
| Paper slip down | 400ms | 5 | Slide back into envelope |
| Card transition | 400ms | 5 | Swipe/fade between cards |
| Page transition (Browse) | 400ms | 5 | Switch between pages |

---

## Touch Targets

Minimum touch target: 44×44px for all interactive elements.

---

## Image Asset Checklist

| Asset | Size/Notes | Provided? |
|-------|-----------|-----------|
| Spring collage background | Full screen | ☐ |
| Summer collage background | Full screen | ☐ |
| Autumn collage background | Full screen | ☐ |
| Winter collage background | Full screen | ☐ |
| Closed envelope | ~200px wide | ☐ |
| Opened envelope back | ~280px wide | ☐ |
| Opened envelope front edge | ~280px wide | ☐ |
| Wax seal | ~50px | ☐ |
| Pen | ~60px tall | ☐ |
| Gramophone | ~80px | ☐ |
| Typewriter | ~full width | ☐ |
| Add/Edit background | Full screen | ☐ |
| Paper slip | ~300px wide | ☐ |
| Card with paperclip | ~280px wide | ☐ |
| Season button spring (normal) | ~50px | ☐ |
| Season button spring (pressed) | ~50px | ☐ |
| Season button summer (normal) | ~50px | ☐ |
| Season button summer (pressed) | ~50px | ☐ |
| Season button autumn (normal) | ~50px | ☐ |
| Season button autumn (pressed) | ~50px | ☐ |
| Season button winter (normal) | ~50px | ☐ |
| Season button winter (pressed) | ~50px | ☐ |
| Sticker: back button | ~44px | ☐ |
| Sticker: edit button | ~44px | ☐ |
| Sticker: next page | ~44px | ☐ |
| Sticker: prev page | ~44px | ☐ |

Until images are provided, use placeholder colors/shapes with the correct class names.
