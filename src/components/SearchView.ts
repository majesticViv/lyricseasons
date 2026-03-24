import { searchEntries, CARDS_PER_PAGE } from '../lib/db';
import { createLyricCard } from './LyricCard';
import { createStickerButton } from './StickerButton';
import { animateFrames, lerp } from '../animations/frameAnimation';
import type { Entry } from '../types';

interface SearchCallbacks {
  onCardTap: (entry: Entry) => void;
  onBack: () => void;
}

function randRotation(min: number, max: number): number {
  const angle = min + Math.random() * (max - min);
  return Math.random() < 0.5 ? -angle : angle;
}

export function renderSearchView(callbacks: SearchCallbacks): void {
  // --- Full-screen view ---
  const view = document.createElement('div');
  view.className = 'search-view';

  const bg = document.createElement('div');
  bg.className = 'search-view__background';
  view.appendChild(bg);

  const contentLayer = document.createElement('div');
  contentLayer.className = 'search-view__content-layer';

  // Back button
  const backBtn = createStickerButton('back', () => {
    closeView();
  });
  backBtn.classList.add('search-view__back');
  contentLayer.appendChild(backBtn);

  // Search button (top-right, reuse sticker style)
  const searchBtn = document.createElement('button');
  searchBtn.className = 'search-view__search-btn';
  searchBtn.setAttribute('aria-label', 'Search');
  const searchBtnImg = document.createElement('img');
  searchBtnImg.src = '/images/sticker-search.png';
  searchBtnImg.alt = '';
  searchBtnImg.draggable = false;
  searchBtnImg.className = 'sticker-btn__img';
  searchBtn.appendChild(searchBtnImg);
  contentLayer.appendChild(searchBtn);

  // Search input area
  const inputArea = document.createElement('div');
  inputArea.className = 'search-view__input-area';

  const inputBg = document.createElement('img');
  inputBg.className = 'search-view__input-bg';
  inputBg.src = '/images/search-text-field.png';
  inputBg.alt = '';
  inputBg.draggable = false;
  inputArea.appendChild(inputBg);

  const input = document.createElement('input');
  input.className = 'search-view__input';
  input.type = 'text';
  input.placeholder = 'search lyrics, songs, artists...';
  input.maxLength = 200;
  inputArea.appendChild(input);

  contentLayer.appendChild(inputArea);

  // Results area
  const resultsArea = document.createElement('div');
  resultsArea.className = 'search-view__results';
  contentLayer.appendChild(resultsArea);

  // Prev/next pagination
  const prevBtn = createStickerButton('prev-page', () => goToPage(currentPage - 1));
  prevBtn.classList.add('search-view__prev');
  prevBtn.style.display = 'none';

  const nextBtn = createStickerButton('next-page', () => goToPage(currentPage + 1));
  nextBtn.classList.add('search-view__next');
  nextBtn.style.display = 'none';

  contentLayer.appendChild(prevBtn);
  contentLayer.appendChild(nextBtn);

  view.appendChild(contentLayer);

  // Mount as fixed overlay
  view.style.position = 'fixed';
  view.style.inset = '0';
  view.style.zIndex = '40';
  document.body.appendChild(view);

  // --- Opening animation: expand from center ---
  contentLayer.style.opacity = '0';
  bg.style.transform = 'scale(0)';
  bg.style.opacity = '0';

  animateFrames({
    duration: 600,
    fps: 12,
    onFrame(p) {
      bg.style.transform = `scale(${lerp(0, 1, p)})`;
      bg.style.opacity = String(p);
    },
    onComplete() {
      bg.style.transform = '';
      bg.style.opacity = '';
      // Fade in content
      animateFrames({
        duration: 300,
        fps: 12,
        onFrame(p) { contentLayer.style.opacity = String(p); },
        onComplete() {
          contentLayer.style.opacity = '';
          input.focus();
        },
      });
    },
  });

  // --- Search state ---
  let allResults: Entry[] = [];
  let currentPage = 0;
  let totalPages = 0;
  let sliding = false;
  let searching = false;

  async function doSearch() {
    const query = input.value.trim();
    if (!query || searching) return;

    searching = true;
    resultsArea.innerHTML = '';
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';

    try {
      allResults = await searchEntries(query);
      totalPages = Math.ceil(allResults.length / CARDS_PER_PAGE);
      currentPage = 0;

      if (allResults.length === 0) {
        resultsArea.innerHTML =
          '<div class="search-view__empty"><img class="img-btn__bg" src="/images/btn-empty.png" alt="" /><span class="img-btn__label">no matches found</span></div>';
      } else {
        renderPage(0, 'none');
      }
    } catch {
      resultsArea.innerHTML =
        '<div class="search-view__error">couldn\'t search — try again</div>';
    } finally {
      searching = false;
    }
  }

  // Trigger search on button tap or enter
  searchBtn.addEventListener('click', () => doSearch());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });

  function renderPage(page: number, direction: 'none' | 'next' | 'prev') {
    currentPage = page;
    const start = page * CARDS_PER_PAGE;
    const entries = allResults.slice(start, start + CARDS_PER_PAGE);

    prevBtn.style.display = page > 0 ? '' : 'none';
    nextBtn.style.display = page < totalPages - 1 ? '' : 'none';

    if (direction === 'none') {
      populateCards(entries, page);
      return;
    }

    const SLIDE_PX = 120;
    const SLIDE_DURATION = 450;
    const exitX = direction === 'next' ? -SLIDE_PX : SLIDE_PX;
    const enterX = direction === 'next' ? SLIDE_PX : -SLIDE_PX;
    sliding = true;

    animateFrames({
      duration: SLIDE_DURATION / 2,
      fps: 12,
      onFrame(p) {
        resultsArea.style.opacity = String(1 - p);
        resultsArea.style.transform = `translateX(${lerp(0, exitX, p)}px)`;
      },
      onComplete() {
        populateCards(entries, page);
        resultsArea.style.transform = `translateX(${enterX}px)`;
        resultsArea.style.opacity = '0';

        animateFrames({
          duration: SLIDE_DURATION / 2,
          fps: 12,
          onFrame(p) {
            resultsArea.style.opacity = String(p);
            resultsArea.style.transform = `translateX(${lerp(enterX, 0, p)}px)`;
          },
          onComplete() {
            resultsArea.style.transform = '';
            resultsArea.style.opacity = '';
            sliding = false;
          },
        });
      },
    });
  }

  function populateCards(entries: Entry[], page: number) {
    resultsArea.innerHTML = '';
    const baseIndex = page * CARDS_PER_PAGE;

    entries.forEach((entry, i) => {
      const globalIndex = baseIndex + i;
      const orientation = globalIndex % 2 === 0 ? 'horizontal' : 'vertical';
      const card = createLyricCard(entry, { mode: 'browse', orientation });
      card.classList.add('search-view__card');
      card.style.transform = `rotate(${randRotation(1, 3)}deg)`;
      card.classList.add(i === 0 ? 'search-view__card--upper' : 'search-view__card--lower');
      card.addEventListener('click', () => callbacks.onCardTap(entry));
      resultsArea.appendChild(card);
    });
  }

  function goToPage(page: number) {
    if (page < 0 || page >= totalPages || page === currentPage || sliding) return;
    sliding = true;
    const direction = page > currentPage ? 'next' : 'prev';
    renderPage(page, direction);
  }

  // --- Close animation: fade content, shrink bg ---
  function closeView() {
    animateFrames({
      duration: 300,
      fps: 12,
      onFrame(p) { contentLayer.style.opacity = String(1 - p); },
      onComplete() {
        contentLayer.style.opacity = '0';
        animateFrames({
          duration: 600,
          fps: 12,
          onFrame(p) {
            bg.style.transform = `scale(${lerp(1, 0, p)})`;
            bg.style.opacity = String(1 - p);
          },
          onComplete() {
            view.remove();
            callbacks.onBack();
          },
        });
      },
    });
  }
}
