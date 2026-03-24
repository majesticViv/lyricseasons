import { updateEntry } from '../lib/db';
import { renderFormOverlay } from './AddEditForm';
import type { Entry } from '../types';

interface EditViewCallbacks {
  onBack: () => void;
  onSaved: (updated: Entry) => void;
}

export function renderEditView(
  entry: Entry,
  callbacks: EditViewCallbacks
): void {
  renderFormOverlay({
    initialSeason: entry.season,
    initialLyric: entry.lyric,
    initialSong: entry.song_title || '',
    initialArtist: entry.artist || '',
    onBack: callbacks.onBack,
    async onSave({ lyric, song, artist, season }) {
      const updated = await updateEntry(entry.id, {
        lyric,
        song_title: song || null,
        artist: artist || null,
        season,
      });
      return () => callbacks.onSaved(updated);
    },
  });
}
