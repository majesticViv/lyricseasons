import { getEntryCount, getEntriesPage, getTotalPages } from '../lib/db';
import { createLyricCard } from './LyricCard';
import { createStickerButton } from './StickerButton';
import { animateFrames, lerp } from '../animations/frameAnimation';
import type { Season, Entry } from '../types';

interface BrowseCallbacks {
  onCardTap: (entry: Entry) => void;
  onBack: () => void;
}

/** Random rotation in range [-max, -min] or [min, max] */
function randRotation(min: number, max: number): number {
  const angle = min + Math.random() * (max - min);
  return Math.random() < 0.5 ? -angle : angle;
}

/**
 * Renders the Browse View with 2 cards per page.
 * If `envelopeEl` is provided, content fades in on top of it.
 */
export async function renderBrowseView(
  container: HTMLElement,
  season: Season,
  callbacks: BrowseCallbacks,
  envelopeEl?: HTMLElement
): Promise<void> {
  if (!envelopeEl) {
    container.innerHTML = '';
  }

  const view = document.createElement('div');
  view.className = `browse-view browse-view--${season}`;

  if (!envelopeEl) {
    const bg = document.createElement('div');
    bg.className = 'browse-view__background';
    view.appendChild(bg);
  }

  // Back button
  const backBtn = createStickerButton('back', () => {
    if (envelopeEl) {
      fadeOutContent(() => callbacks.onBack());
    } else {
      callbacks.onBack();
    }
  });
  backBtn.classList.add('browse-view__back');

  // Cards area
  const cardsArea = document.createElement('div');
  cardsArea.className = 'browse-view__cards';

  // Prev/next
  const prevBtn = createStickerButton('prev-page', () => goToPage(currentPage - 1));
  prevBtn.classList.add('browse-view__prev');

  const nextBtn = createStickerButton('next-page', () => goToPage(currentPage + 1));
  nextBtn.classList.add('browse-view__next');

  // Content layer
  const contentLayer = document.createElement('div');
  contentLayer.className = 'browse-view__content-layer';
  contentLayer.appendChild(backBtn);
  contentLayer.appendChild(cardsArea);
  contentLayer.appendChild(prevBtn);
  contentLayer.appendChild(nextBtn);
  view.appendChild(contentLayer);

  if (envelopeEl) {
    view.style.position = 'fixed';
    view.style.inset = '0';
    view.style.zIndex = '30';
    view.style.background = 'transparent';
    document.body.appendChild(view);
  } else {
    container.appendChild(view);
  }

  if (envelopeEl) {
    contentLayer.style.opacity = '0';
  }

  // Fetch entry count, then load pages on demand
  let currentPage = 0;
  let totalPages = 0;

  try {
    const count = await getEntryCount(season);
    totalPages = getTotalPages(count);
  } catch {
    cardsArea.innerHTML = '<div class="browse-view__error">couldn\'t load entries — tap to retry</div>';
    cardsArea.addEventListener('click', () => renderBrowseView(container, season, callbacks, envelopeEl), { once: true });
    if (envelopeEl) contentLayer.style.opacity = '1';
    return;
  }

  if (totalPages === 0) {
    cardsArea.innerHTML = '<div class="browse-view__empty"><img class="img-btn__bg" src="/images/btn-empty.png" alt="" /><span class="img-btn__label">empty~</span></div>';
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    if (envelopeEl) fadeInContent();
    return;
  }

  await renderPage(currentPage, 'none');

  if (envelopeEl) {
    fadeInContent();
  }

  function fadeInContent() {
    animateFrames({
      duration: 300,
      fps: 12,
      onFrame(p) { contentLayer.style.opacity = String(p); },
    });
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

  let sliding = false;
  const SLIDE_PX = 120; // how far cards slide offscreen
  const SLIDE_DURATION = 450;

  async function renderPage(page: number, direction: 'none' | 'next' | 'prev') {
    currentPage = page;
    const entries = await getEntriesPage(season, page);

    prevBtn.style.display = page > 0 ? '' : 'none';
    nextBtn.style.display = page < totalPages - 1 ? '' : 'none';

    if (direction === 'none') {
      populateCards(entries);
      return;
    }

    // Direction: next → exit left, enter from right
    //            prev → exit right, enter from left
    const exitX = direction === 'next' ? -SLIDE_PX : SLIDE_PX;
    const enterX = direction === 'next' ? SLIDE_PX : -SLIDE_PX;
    sliding = true;

    // Phase 1: slide current cards out
    animateFrames({
      duration: SLIDE_DURATION / 2,
      fps: 12,
      onFrame(p) {
        cardsArea.style.opacity = String(1 - p);
        cardsArea.style.transform = `translateX(${lerp(0, exitX, p)}px)`;
      },
      onComplete() {
        // Swap content, position at enter side
        populateCards(entries);
        cardsArea.style.transform = `translateX(${enterX}px)`;
        cardsArea.style.opacity = '0';

        // Phase 2: slide new cards in
        animateFrames({
          duration: SLIDE_DURATION / 2,
          fps: 12,
          onFrame(p) {
            cardsArea.style.opacity = String(p);
            cardsArea.style.transform = `translateX(${lerp(enterX, 0, p)}px)`;
          },
          onComplete() {
            cardsArea.style.transform = '';
            cardsArea.style.opacity = '';
            sliding = false;
          },
        });
      },
    });
  }

  function populateCards(entries: Entry[]) {
    cardsArea.innerHTML = '';
    entries.forEach((entry, i) => {
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';

      const card = createLyricCard(entry, { mode: 'browse', orientation });
      card.classList.add('browse-view__card');
      const rot = randRotation(1, 3);
      card.style.transform = `rotate(${rot}deg)`;
      card.classList.add(i === 0 ? 'browse-view__card--upper' : 'browse-view__card--lower');
      card.addEventListener('click', () => callbacks.onCardTap(entry));
      cardsArea.appendChild(card);
    });
  }

  async function goToPage(page: number) {
    if (page < 0 || page >= totalPages || page === currentPage || sliding) return;
    sliding = true; // Guard before async gap to prevent double-tap race
    const direction = page > currentPage ? 'next' : 'prev';
    await renderPage(page, direction);
  }
}
