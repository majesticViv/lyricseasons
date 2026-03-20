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

export interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Entry | null;
  old: Entry | null;
}

export interface AppState {
  currentUser: Author | null;
  currentSeason: Season | null;
  entries: Map<Season, Entry[]>;
  isLoading: boolean;
  error: Error | null;
}
