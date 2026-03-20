import type { Entry } from '../types';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const TRUNCATE_CHARS = 35;
const TRUNCATE_LINES = 2;

/** Truncate to first 80 chars or 2 lines, whichever is shorter. Adds "..." if truncated. */
function truncateLyric(text: string): string {
  const lines = text.split('\n');
  let result = lines.length > TRUNCATE_LINES
    ? lines.slice(0, TRUNCATE_LINES).join('\n')
    : text;

  if (result.length > TRUNCATE_CHARS) {
    result = result.slice(0, TRUNCATE_CHARS).trimEnd();
  }

  if (result.length < text.length) {
    result += '...';
  }

  return result;
}

interface CardOptions {
  /** 'browse' hides date/author and truncates lyric. 'detail' shows all. Default: 'detail' */
  mode?: 'browse' | 'detail';
  /** Force horizontal or vertical orientation. If omitted, auto-detected by lyric length. */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Creates a lyric card element using card.png as background.
 */
export function createLyricCard(entry: Entry, options?: CardOptions): HTMLElement {
  const mode = options?.mode ?? 'detail';
  const horizontal = options?.orientation === 'horizontal';

  const card = document.createElement('div');
  card.className = `lyric-card ${horizontal ? 'lyric-card--horizontal' : 'lyric-card--vertical'}`;
  card.dataset.entryId = entry.id;

  // Card image background
  const img = document.createElement('img');
  img.className = 'lyric-card__img';
  img.src = '/images/card.png';
  img.alt = '';
  img.draggable = false;
  card.appendChild(img);

  // Text content — positioned inside the safe area
  const content = document.createElement('div');
  content.className = 'lyric-card__content';

  const lyricEl = document.createElement('div');
  lyricEl.className = 'lyric-card__lyric';
  lyricEl.textContent = mode === 'browse' ? truncateLyric(entry.lyric) : entry.lyric;
  content.appendChild(lyricEl);

  // Song/artist group — anchored to bottom with guaranteed spacing
  const songGroup = document.createElement('div');
  songGroup.className = 'lyric-card__song-group';

  if (entry.song_title) {
    const song = document.createElement('div');
    song.className = 'lyric-card__song';
    song.textContent = entry.song_title;
    songGroup.appendChild(song);
  }

  if (entry.artist) {
    const artist = document.createElement('div');
    artist.className = 'lyric-card__artist';
    artist.textContent = entry.artist;
    songGroup.appendChild(artist);
  }

  // Only show date/author in detail mode (Single Card View)
  if (mode === 'detail') {
    const meta = document.createElement('div');
    meta.className = 'lyric-card__meta';

    const date = document.createElement('span');
    date.className = 'lyric-card__date';
    date.textContent = formatDate(entry.created_at);
    meta.appendChild(date);

    songGroup.appendChild(meta);

    // Seal — positioned absolutely on the card, doesn't affect layout
    const sealName = entry.author.toLowerCase();
    const seal = document.createElement('img');
    seal.className = 'lyric-card__seal';
    seal.src = `/images/seal-${sealName}.png`;
    seal.alt = entry.author;
    seal.draggable = false;
    card.appendChild(seal);
  }

  content.appendChild(songGroup);

  card.appendChild(content);

  return card;
}
