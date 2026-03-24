import { animateMultipleElements, type MultiElementTarget } from '../animations/frameAnimation';
import { vibrate } from '../lib/haptics';
import type { Season } from '../types';

const BASE_SEASONS: { key: Season; img: string }[] = [
  { key: 'spring', img: '/images/envelope-spring-closed.png' },
  { key: 'summer', img: '/images/envelope-summer-closed.png' },
  { key: 'autumn', img: '/images/envelope-autumn-closed.png' },
  { key: 'winter', img: '/images/envelope-winter-closed.png' },
];

// Shuffle so a different envelope is on top each time
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Envelope size in stacked state
const STACK_W = 200;
const STACK_H = 140;

// Random range helper
function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// Random rotation that avoids near-zero (always visibly tilted)
function randRot(): number {
  const angle = rand(4, 12);
  return Math.random() < 0.5 ? -angle : angle;
}

// Generate random stack offsets each load
function makeStackOffsets() {
  return Array.from({ length: 4 }, () => ({
    dx: rand(-12, 12),
    dy: rand(-8, 8),
    rot: randRot(),
  }));
}

// Generate subtle grid rotations — tilted but readable
function makeGridRotations() {
  return Array.from({ length: 4 }, () => {
    const angle = rand(1, 3);
    return Math.random() < 0.5 ? -angle : angle;
  });
}

// Grid cell size
const GRID_W = 150;
const GRID_H = 105;
const GRID_GAP = 32;

export interface EnvelopeContext {
  wrapper: HTMLElement;
  envelopeEls: HTMLElement[];
  backBtn: HTMLElement;
  searchBtn: HTMLElement;
  getGridRect: (index: number) => { left: number; top: number; width: number; height: number; rotate: number };
  setAnimating: (v: boolean) => void;
}

export function renderEnvelopeStack(
  container: HTMLElement,
  onSeasonTap: (season: Season, envelopeEl: HTMLElement, ctx: EnvelopeContext) => void,
): { collapse: () => void } {
  const stackOffsets = makeStackOffsets();
  const gridRotations = makeGridRotations();
  let isDistributed = false;
  let isAnimating = false;

  const wrapper = document.createElement('div');
  wrapper.className = 'envelopes';

  // Shuffle season order so a different envelope is on top each load
  const seasons = shuffle(BASE_SEASONS);

  // 4 envelope elements — each is a button with an <img> inside
  const envelopeEls: HTMLButtonElement[] = [];

  seasons.forEach((s, i) => {
    const env = document.createElement('button');
    env.className = `envelope envelope--${s.key}`;
    env.setAttribute('aria-label', `${s.key} season`);
    env.dataset.season = s.key;
    env.dataset.index = String(i);

    const img = document.createElement('img');
    img.className = 'envelope__img';
    img.src = s.img;
    img.alt = s.key;
    img.draggable = false;
    env.appendChild(img);

    envelopeEls.push(env);

    env.addEventListener('click', () => {
      if (isAnimating) return;
      if (!isDistributed) {
        distribute();
      } else {
        vibrate();
        onSeasonTap(s.key, env, {
          wrapper,
          envelopeEls,
          backBtn,
          searchBtn,
          getGridRect,
          setAnimating(v: boolean) { isAnimating = v; },
        });
      }
    });

    wrapper.appendChild(env);
  });

  // Back button
  const backBtn = document.createElement('button');
  backBtn.className = 'envelopes__back';
  backBtn.setAttribute('aria-label', 'Back to stack');
  const backImg = document.createElement('img');
  backImg.src = '/images/sticker-back.png';
  backImg.alt = '';
  backImg.draggable = false;
  backImg.className = 'sticker-btn__img';
  backBtn.appendChild(backImg);
  backBtn.addEventListener('click', () => {
    if (!isAnimating) collapse();
  });
  wrapper.appendChild(backBtn);

  // Search button (mirrors back button, top-right)
  const searchBtn = document.createElement('button');
  searchBtn.className = 'envelopes__search';
  searchBtn.setAttribute('aria-label', 'Search');
  const searchImg = document.createElement('img');
  searchImg.src = '/images/sticker-search.png';
  searchImg.alt = '';
  searchImg.draggable = false;
  searchImg.className = 'sticker-btn__img';
  searchBtn.appendChild(searchImg);
  // TODO: wire up search functionality
  searchBtn.addEventListener('click', () => {
    if (!isAnimating) { /* search handler */ }
  });
  wrapper.appendChild(searchBtn);

  container.appendChild(wrapper);

  // Position envelopes in stacked formation (defer until layout is ready)
  requestAnimationFrame(() => setStackPositions());

  // --- Compute positions ---

  function getContainerCenter() {
    return {
      cx: wrapper.offsetWidth / 2,
      cy: wrapper.offsetHeight / 2,
    };
  }

  function getStackRect(index: number) {
    const { cx, cy } = getContainerCenter();
    const off = stackOffsets[index];
    return {
      left:   cx - STACK_W / 2 + off.dx,
      top:    cy - STACK_H / 2 + off.dy,
      width:  STACK_W,
      height: STACK_H,
      rotate: off.rot,
    };
  }

  // Grid layout: 2×2
  //  [0] [1]
  //  [2] [3]
  function getGridRect(index: number) {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const totalW = GRID_W * 2 + GRID_GAP;
    const totalH = GRID_H * 2 + GRID_GAP;
    const containerW = wrapper.offsetWidth;
    const containerH = wrapper.offsetHeight;
    const offsetX = (containerW - totalW) / 2;
    const offsetY = (containerH - totalH) / 2;
    return {
      left:   offsetX + col * (GRID_W + GRID_GAP),
      top:    offsetY + row * (GRID_H + GRID_GAP),
      width:  GRID_W,
      height: GRID_H,
      rotate: gridRotations[index],
    };
  }

  function applyRect(el: HTMLElement, r: { left: number; top: number; width: number; height: number; rotate: number }) {
    el.style.left   = r.left + 'px';
    el.style.top    = r.top + 'px';
    el.style.width  = r.width + 'px';
    el.style.height = r.height + 'px';
    el.style.transform = `rotate(${r.rotate}deg)`;
  }

  function setStackPositions() {
    envelopeEls.forEach((el, i) => applyRect(el, getStackRect(i)));
  }

  function setGridPositions() {
    envelopeEls.forEach((el, i) => applyRect(el, getGridRect(i)));
  }

  // --- Animate ---

  function distribute() {
    if (isDistributed || isAnimating) return;
    isAnimating = true;
    vibrate();

    // Expand container first so grid positions are correct
    wrapper.classList.add('envelopes--distributed');

    // Need a frame for the container resize to take effect
    requestAnimationFrame(() => {
      const targets: MultiElementTarget[] = envelopeEls.map((el, i) => ({
        el,
        from: getStackRect(i),
        to:   getGridRect(i),
      }));

      animateMultipleElements(targets, {
        duration: 800,
        fps: 12,
        onComplete() {
          isAnimating = false;
          isDistributed = true;
          setGridPositions();
          wrapper.classList.add('envelopes--grid-active');
        },
      });

    });
  }

  function collapse() {
    if (!isDistributed || isAnimating) return;
    isAnimating = true;

    // Hide back before animating
    wrapper.classList.remove('envelopes--grid-active');

    const targets: MultiElementTarget[] = envelopeEls.map((el, i) => ({
      el,
      from: getGridRect(i),
      to:   getStackRect(i),
    }));

    animateMultipleElements(targets, {
      duration: 800,
      fps: 12,
      onComplete() {
        isAnimating = false;
        isDistributed = false;
        wrapper.classList.remove('envelopes--distributed');
        setStackPositions();
      },
    });
  }

  return { collapse };
}
