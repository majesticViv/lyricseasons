import { updateEntry } from '../lib/db';
import { validateEntry } from '../lib/validation';
import { animateFrames, lerp } from '../animations/frameAnimation';
import { store } from '../state/store';
import { SEASONS, STAMP_IMAGES } from '../lib/seasons';
import type { Entry, Season } from '../types';

interface EditViewCallbacks {
  onBack: () => void;
  onSaved: (updated: Entry) => void;
}

/**
 * Edit View — letter paper overlay, pre-filled with entry data.
 * Reuses the back button from the view underneath (hides duplicates).
 * A transparent gap zone intercepts clicks above the paper.
 */
export function renderEditView(
  entry: Entry,
  callbacks: EditViewCallbacks
): void {
  let selectedSeason: Season = entry.season;
  let saving = false;

  // Hide ALL existing buttons in the DOM so only ours are visible
  const hiddenBtns: HTMLElement[] = [];
  document.querySelectorAll<HTMLElement>(
    '.browse-view__back, .single-card-view__back, .envelopes__back, .season-options__back, .envelopes__search, .season-options__search'
  ).forEach(btn => {
    if (btn.style.visibility !== 'hidden') {
      btn.style.visibility = 'hidden';
      hiddenBtns.push(btn);
    }
  });

  // --- Overlay ---
  const overlay = document.createElement('div');
  overlay.className = 'add-view';

  // --- Back button (own back button, same style) ---
  const backBtn = document.createElement('button');
  backBtn.className = 'add-view__back';
  backBtn.setAttribute('aria-label', 'Back');
  const backImg = document.createElement('img');
  backImg.src = '/images/sticker-back.png';
  backImg.alt = '';
  backImg.draggable = false;
  backImg.className = 'add-view__back-img';
  backBtn.appendChild(backImg);
  backBtn.addEventListener('click', () => {
    if (saving) return;
    slideDown(callbacks.onBack);
  });
  overlay.appendChild(backBtn);

  // --- Save button ---
  const saveBtn = document.createElement('button');
  saveBtn.className = 'add-view__save';
  saveBtn.setAttribute('aria-label', 'Save');
  const saveImg = document.createElement('img');
  saveImg.src = '/images/sticker-save.png';
  saveImg.alt = '';
  saveImg.draggable = false;
  saveImg.className = 'add-view__save-img';
  saveBtn.appendChild(saveImg);
  overlay.appendChild(saveBtn);

  // --- Letter paper ---
  const paper = document.createElement('div');
  paper.className = 'add-view__paper';

  // Stamp
  const stamp = document.createElement('button');
  stamp.className = 'add-view__stamp';
  stamp.setAttribute('aria-label', 'Change season');
  const stampImg = document.createElement('img');
  stampImg.src = STAMP_IMAGES[selectedSeason];
  stampImg.alt = selectedSeason;
  stampImg.draggable = false;
  stampImg.className = 'add-view__stamp-img';
  stamp.appendChild(stampImg);
  stamp.addEventListener('click', () => {
    const idx = SEASONS.indexOf(selectedSeason);
    selectedSeason = SEASONS[(idx + 1) % SEASONS.length];
    stampImg.src = STAMP_IMAGES[selectedSeason];
    stampImg.alt = selectedSeason;
  });
  paper.appendChild(stamp);

  // Form fields (pre-filled)
  const fields = document.createElement('div');
  fields.className = 'add-view__fields';

  const lyricField = document.createElement('textarea');
  lyricField.className = 'add-view__lyric';
  lyricField.placeholder = 'lyric...';
  lyricField.maxLength = 2000;
  lyricField.value = entry.lyric;
  fields.appendChild(lyricField);

  const songField = document.createElement('input');
  songField.className = 'add-view__song';
  songField.type = 'text';
  songField.placeholder = 'song title';
  songField.maxLength = 200;
  songField.value = entry.song_title || '';
  fields.appendChild(songField);

  const artistField = document.createElement('input');
  artistField.className = 'add-view__artist';
  artistField.type = 'text';
  artistField.placeholder = 'artist';
  artistField.maxLength = 200;
  artistField.value = entry.artist || '';
  fields.appendChild(artistField);

  const errorEl = document.createElement('div');
  errorEl.className = 'add-view__error';
  fields.appendChild(errorEl);

  paper.appendChild(fields);
  overlay.appendChild(paper);

  // --- Save handler ---
  saveBtn.addEventListener('click', async () => {
    if (saving) return;
    errorEl.textContent = '';

    const author = store.getCurrentUser();
    if (!author) return;

    const result = validateEntry({
      lyric: lyricField.value,
      song_title: songField.value || undefined,
      artist: artistField.value || undefined,
      season: selectedSeason,
      author,
    });

    if (!result.valid) {
      errorEl.textContent = result.errors[0].message;
      return;
    }

    saving = true;
    saveBtn.style.opacity = '0.5';
    saveBtn.style.pointerEvents = 'none';

    try {
      const updated = await updateEntry(entry.id, {
        lyric: lyricField.value.trim(),
        song_title: songField.value.trim() || null,
        artist: artistField.value.trim() || null,
        season: selectedSeason,
      });
      slideDown(() => callbacks.onSaved(updated));
    } catch {
      errorEl.textContent = "couldn't save — try again";
      saving = false;
      saveBtn.style.opacity = '';
      saveBtn.style.pointerEvents = '';
    }
  });

  // --- Mount and slide up ---
  document.body.appendChild(overlay);

  paper.style.transform = 'translateY(100%)';
  backBtn.style.opacity = '0';
  saveBtn.style.opacity = '0';

  requestAnimationFrame(() => {
    animateFrames({
      duration: 500,
      fps: 12,
      onFrame(p) {
        paper.style.transform = `translateY(${lerp(100, 0, p)}%)`;
        backBtn.style.opacity = String(p);
        saveBtn.style.opacity = String(p);
      },
      onComplete() {
        paper.style.transform = '';
        backBtn.style.opacity = '';
        saveBtn.style.opacity = '';
        lyricField.focus();
      },
    });
  });

  function slideDown(onDone: () => void) {
    // Restore any back buttons we hid
    hiddenBtns.forEach(btn => {
      btn.style.visibility = '';
    });

    animateFrames({
      duration: 400,
      fps: 12,
      onFrame(p) {
        paper.style.transform = `translateY(${lerp(0, 100, p)}%)`;
        backBtn.style.opacity = String(1 - p);
        saveBtn.style.opacity = String(1 - p);
      },
      onComplete() {
        overlay.remove();
        onDone();
      },
    });
  }
}
