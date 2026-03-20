import type { Season, Author } from '../types';

const VALID_SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];
const VALID_AUTHORS: Author[] = ['Viv', 'Bili'];

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateEntry(data: {
  lyric: string;
  song_title?: string;
  artist?: string;
  season: string;
  author: string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  const lyric = data.lyric.trim();
  if (!lyric) {
    errors.push({ field: 'lyric', message: 'Lyric is required' });
  } else if (lyric.length > 2000) {
    errors.push({ field: 'lyric', message: 'Lyric must be under 2000 characters' });
  }

  if (data.song_title && data.song_title.length > 200) {
    errors.push({ field: 'song_title', message: 'Song title must be under 200 characters' });
  }

  if (data.artist && data.artist.length > 200) {
    errors.push({ field: 'artist', message: 'Artist must be under 200 characters' });
  }

  if (!VALID_SEASONS.includes(data.season as Season)) {
    errors.push({ field: 'season', message: 'Please select a season' });
  }

  if (!VALID_AUTHORS.includes(data.author as Author)) {
    errors.push({ field: 'author', message: 'Invalid author' });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function sanitizeText(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}
