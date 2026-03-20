import { addEntry } from '../lib/db';
import { validateEntry } from '../lib/validation';
import { animateFrames, lerp } from '../animations/frameAnimation';
import { store } from '../state/store';
import type { Season } from '../types';

const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];

const STAMP_IMAGES: Record<Season, string> = {
  spring: '/images/stamp-spring.png',
  summer: '/images/stamp-summer.png',
  autumn: '/images/stamp-autumn.png',
  winter: '/images/stamp-winter.png',
};

// Preload stamp images
Object.values(STAMP_IMAGES).forEach(src => {
  const img = new Image();
  img.src = src;
});

interface AddViewCallbacks {
  onBack: () => void;
  onSaved: () => void;
}

/**
 * Renders the Add View as an overlay on the landing page.
 * Letter paper slides up from bottom, buttons appear above it.
 * The landing background and pen remain visible through the gap at top.
 */
export function renderAddView(
  _container: HTMLElement,
  callbacks: AddViewCallbacks
): void {
  let selectedSeason: Season = 'spring';
  let saving = false;

  // Hide any existing back buttons so they don't overlap ours
  const hiddenBackBtns: HTMLElement[] = [];
  document.querySelectorAll<HTMLElement>(
    '.browse-view__back, .single-card-view__back, .envelopes__back, .season-options__back'
  ).forEach(btn => {
    if (btn.style.visibility !== 'hidden') {
      btn.style.visibility = 'hidden';
      hiddenBackBtns.push(btn);
    }
  });

  // --- Overlay (fixed, covers screen) ---
  const overlay = document.createElement('div');
  overlay.className = 'add-view';

  // --- Back button (top-left, above paper) ---
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

  // --- Save button (top-right, above paper) ---
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

  // Stamp (top-right of paper, cycles through seasons)
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

  // Form fields
  const fields = document.createElement('div');
  fields.className = 'add-view__fields';

  const lyricField = document.createElement('textarea');
  lyricField.className = 'add-view__lyric';
  lyricField.placeholder = 'lyric...';
  lyricField.maxLength = 2000;
  fields.appendChild(lyricField);

  const songField = document.createElement('input');
  songField.className = 'add-view__song';
  songField.type = 'text';
  songField.placeholder = 'song title';
  songField.maxLength = 200;
  fields.appendChild(songField);

  const artistField = document.createElement('input');
  artistField.className = 'add-view__artist';
  artistField.type = 'text';
  artistField.placeholder = 'artist';
  artistField.maxLength = 200;
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
      await addEntry({
        lyric: lyricField.value.trim(),
        song_title: songField.value.trim() || undefined,
        artist: artistField.value.trim() || undefined,
        season: selectedSeason,
        author,
      });
      slideDown(callbacks.onSaved);
    } catch {
      errorEl.textContent = "couldn't save — try again";
      saving = false;
      saveBtn.style.opacity = '';
      saveBtn.style.pointerEvents = '';
    }
  });

  // --- Mount and slide up ---
  document.body.appendChild(overlay);

  // Start paper off-screen (below viewport)
  paper.style.transform = 'translateY(100%)';
  backBtn.style.opacity = '0';
  saveBtn.style.opacity = '0';

  // Slide up animation
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

  // --- Slide down (dismiss) ---
  function slideDown(onDone: () => void) {
    // Restore hidden back buttons
    hiddenBackBtns.forEach(btn => {
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
