import { addEntry } from '../lib/db';
import { store } from '../state/store';
import { renderFormOverlay } from './AddEditForm';

interface AddViewCallbacks {
  onBack: () => void;
  onSaved: () => void;
}

export function renderAddView(callbacks: AddViewCallbacks): void {
  renderFormOverlay({
    initialSeason: 'spring',
    initialLyric: '',
    initialSong: '',
    initialArtist: '',
    onBack: callbacks.onBack,
    async onSave({ lyric, song, artist, season }) {
      await addEntry({
        lyric,
        song_title: song || undefined,
        artist: artist || undefined,
        season,
        author: store.getCurrentUser()!,
      });
      return () => callbacks.onSaved();
    },
  });
}
