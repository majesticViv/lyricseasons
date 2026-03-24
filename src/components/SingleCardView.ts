import { createLyricCard } from './LyricCard';
import { createStickerButton } from './StickerButton';
import { animateFrames } from '../animations/frameAnimation';
import { vibrate } from '../lib/haptics';
import type { Entry, Season } from '../types';

interface SingleCardCallbacks {
  onBack: () => void;
  onEdit: (entry: Entry) => void;
}

/**
 * Single card view — one card centered, larger.
 * - If `envelopeEl` is provided, content fades in on top of the fullscreen envelope.
 * - If `'overlay'` is passed, attaches to body as a fixed overlay with fade in/out
 *   (used when coming from browse — browse stays underneath).
 * - Otherwise renders directly into container.
 */
export function renderSingleCardView(
  container: HTMLElement,
  entry: Entry,
  season: Season,
  callbacks: SingleCardCallbacks,
  mode?: HTMLElement | 'overlay'
): void {
  const isEnvelope = mode instanceof HTMLElement;
  const isOverlay = mode === 'overlay';
  const isStandalone = !mode;

  if (isStandalone) {
    container.innerHTML = '';
  }

  const view = document.createElement('div');
  view.className = `single-card-view single-card-view--${season}`;

  if (isStandalone) {
    const bg = document.createElement('div');
    bg.className = 'single-card-view__background';
    view.appendChild(bg);
  }

  const contentLayer = document.createElement('div');
  contentLayer.className = 'single-card-view__content-layer';

  const backBtn = createStickerButton('back', () => {
    if (isEnvelope || isOverlay) {
      fadeOutContent(() => callbacks.onBack());
    } else {
      callbacks.onBack();
    }
  });
  backBtn.classList.add('single-card-view__back');
  contentLayer.appendChild(backBtn);

  // Pen button — bottom-right, same as homepage pen
  const penArea = document.createElement('div');
  penArea.className = 'single-card-view__pen';
  const penBtn = document.createElement('button');
  penBtn.className = 'pen';
  penBtn.setAttribute('aria-label', 'Edit lyric');
  const penImg = document.createElement('img');
  penImg.src = '/images/pen.png';
  penImg.alt = '';
  penImg.draggable = false;
  penImg.className = 'pen__img';
  penBtn.appendChild(penImg);
  penBtn.addEventListener('click', () => {
    vibrate(20);
    callbacks.onEdit(entry);
  });
  penArea.appendChild(penBtn);
  contentLayer.appendChild(penArea);

  const card = createLyricCard(entry);
  card.classList.add('single-card-view__card');
  contentLayer.appendChild(card);

  view.appendChild(contentLayer);

  if (isEnvelope || isOverlay) {
    view.style.position = 'fixed';
    view.style.inset = '0';
    view.style.zIndex = isOverlay ? '45' : '30';
    view.style.background = isOverlay ? '' : 'transparent';
    contentLayer.style.opacity = '0';
    document.body.appendChild(view);

    // Add background for overlay mode so browse is hidden behind it
    if (isOverlay) {
      const bg = document.createElement('div');
      bg.className = 'single-card-view__background';
      view.insertBefore(bg, contentLayer);
    }

    animateFrames({
      duration: 300,
      fps: 12,
      onFrame(p) { contentLayer.style.opacity = String(p); },
    });
  } else {
    container.appendChild(view);
  }

  function fadeOutContent(onDone: () => void) {
    animateFrames({
      duration: 300,
      fps: 12,
      onFrame(p) { contentLayer.style.opacity = String(1 - p); },
      onComplete() {
        view.remove();
        onDone();
      },
    });
  }
}
