# 准时宝语录 — Backend Document

## Tech Stack

| Layer | Choice |
|-------|--------|
| Front-end | Vanilla TypeScript + Vite |
| Styling | Vanilla CSS |
| Database | Supabase (PostgreSQL) |
| Auth | sessionStorage only (no real auth) |
| Realtime | Supabase Realtime |
| Hosting | Vercel |

---

## Database Schema

### Table: `entries`

```sql
CREATE TABLE entries (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lyric         TEXT NOT NULL CHECK (char_length(lyric) BETWEEN 1 AND 2000),
  song_title    TEXT CHECK (char_length(song_title) <= 200),
  artist        TEXT CHECK (char_length(artist) <= 200),
  season        TEXT NOT NULL CHECK (season IN ('spring', 'summer', 'autumn', 'winter')),
  author        TEXT NOT NULL CHECK (author IN ('Viv', 'Bili')),
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_entries_season ON entries(season);
CREATE INDEX idx_entries_season_created ON entries(season, created_at DESC);

ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all reads" ON entries FOR SELECT USING (true);
CREATE POLICY "Allow all inserts" ON entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates" ON entries FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes" ON entries FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE entries;
```

**Note:** No `song_link`, `card_bg`, or `stickers` fields. Those are not needed.

---

## TypeScript Types

```typescript
// src/types/index.ts

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Author = 'Viv' | 'Bili';

export interface Entry {
  id: string;
  lyric: string;
  song_title: string | null;
  artist: string | null;
  season: Season;
  author: Author;
  created_at: string;
}

export interface NewEntry {
  lyric: string;
  song_title?: string;
  artist?: string;
  season: Season;
  author: Author;
}

export interface UpdateEntry {
  lyric?: string;
  song_title?: string | null;
  artist?: string | null;
  season?: Season;
}
```

---

## API Functions

```typescript
// src/lib/db.ts

// Get entries for a season, newest first
getEntriesBySeason(season: Season): Promise<Entry[]>

// Get random entry from a season
getRandomEntry(season: Season): Promise<Entry | null>

// Create new entry
addEntry(entry: NewEntry): Promise<Entry>

// Update existing entry
updateEntry(id: string, updates: UpdateEntry): Promise<Entry>

// Get entry count for a season (for pagination)
getEntryCount(season: Season): Promise<number>

// Get entries for a page (3 per page)
getEntriesPage(season: Season, page: number): Promise<Entry[]>
```

---

## Environment Variables

```
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[anon key]
VITE_SPOTIFY_PLAYLIST_ID=4QXnUNne50rf8xbuADrP50
```

---

## File Structure

```
/
├── index.html
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
│
├── public/
│   └── images/           ← Image assets go here
│
└── src/
    ├── main.ts
    ├── types/
    │   └── index.ts
    │
    ├── lib/
    │   ├── supabase.ts
    │   ├── db.ts
    │   ├── realtime.ts
    │   ├── spotify.ts
    │   └── validation.ts
    │
    ├── state/
    │   └── store.ts
    │
    ├── animations/
    │   └── frameAnimation.ts   ← 12fps animation utility
    │
    ├── components/
    │   ├── IdentityScreen.ts
    │   ├── Landing.ts
    │   ├── EnvelopeStack.ts
    │   ├── Pen.ts
    │   ├── Gramophone.ts
    │   ├── SeasonOptions.ts
    │   ├── BrowseView.ts
    │   ├── SingleCardView.ts
    │   ├── AddView.ts
    │   ├── EditView.ts
    │   ├── LyricCard.ts
    │   └── StickerButton.ts
    │
    └── styles/
        ├── reset.css
        ├── variables.css
        ├── typography.css
        ├── components.css
        └── views.css
```

---

## Realtime Subscription

```typescript
// Subscribe to entry changes for live updates
subscribeToEntries(callback: (payload) => void): () => void
```

When an entry is added/updated/deleted by either user, the other user's view updates automatically.

---

## Pagination Logic

Browse view shows 3 cards per page.

```typescript
const CARDS_PER_PAGE = 3;

function getTotalPages(entryCount: number): number {
  return Math.ceil(entryCount / CARDS_PER_PAGE);
}

function getEntriesForPage(entries: Entry[], page: number): Entry[] {
  const start = page * CARDS_PER_PAGE;
  return entries.slice(start, start + CARDS_PER_PAGE);
}
```
