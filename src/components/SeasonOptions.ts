import { animateFrames, lerp } from '../animations/frameAnimation';
import type { EnvelopeContext } from './EnvelopeStack';
import type { Season } from '../types';

interface SeasonOptionsCallbacks {
  onBrowse: (envelopeEl: HTMLElement, shrinkBack: () => void) => void;
  onSurprise: (envelopeEl: HTMLElement, shrinkBack: () => void) => void;
}

// Focused envelope size (centered)
const FOCUS_W = 390;
const FOCUS_H = 273;

// Frames 3 & 4 are slightly larger (scale factor)
const FRAME_SCALE = 1.3;

// Per-frame size multipliers (indices 0–4)
const FRAME_5_SCALE = 1.6;
const FRAME_SIZES = [1, 1, FRAME_SCALE, FRAME_SCALE, FRAME_5_SCALE];

// Stop-motion envelope opening frames (frame 1 = season-specific closed image)
const OPEN_FRAMES = [
  '/images/envelope-frame-2.png',
  '/images/envelope-frame-3.png',
  '/images/envelope-frame-4.png',
  '/images/envelope-frame-5.png',
];
const FRAME_DELAY = 80; // ms between frames

// Season-specific closed envelope (used as frame 1)
const CLOSED_IMAGES: Record<string, string> = {
  spring: '/images/envelope-spring-closed.png',
  summer: '/images/envelope-summer-closed.png',
  autumn: '/images/envelope-autumn-closed.png',
  winter: '/images/envelope-winter-closed.png',
};

// Preload shared frames so swaps are instant
OPEN_FRAMES.forEach(src => {
  const img = new Image();
  img.src = src;
});

export function showSeasonOptions(
  envelopeEl: HTMLElement,
  season: Season,
  ctx: EnvelopeContext,
  callbacks: SeasonOptionsCallbacks
): void {
  const { wrapper, envelopeEls, backBtn, getGridRect, setAnimating } = ctx;

  if (wrapper.querySelector('.opened-envelope')) return;
  setAnimating(true);

  // --- Back button: capture grid position, then hide the grid one ---
  const backStartLeft = backBtn.offsetLeft;
  const backStartTop = backBtn.offsetTop;
  backBtn.style.visibility = 'hidden';
  backBtn.style.pointerEvents = 'none';

  // Create a moving back button at the grid back button's position
  const movingBack = document.createElement('button');
  movingBack.className = 'season-options__back';
  movingBack.setAttribute('aria-label', 'Back');
  const movingBackImg = document.createElement('img');
  movingBackImg.src = '/images/sticker-back.png';
  movingBackImg.alt = '';
  movingBackImg.draggable = false;
  movingBackImg.className = 'season-options__back-img';
  movingBack.appendChild(movingBackImg);
  movingBack.style.left = backStartLeft + 'px';
  movingBack.style.top = backStartTop + 'px';
  movingBack.style.pointerEvents = 'none'; // not clickable yet
  wrapper.appendChild(movingBack);

  let movingBackClickHandler: (() => void) | null = null;
  movingBack.addEventListener('click', () => {
    if (movingBackClickHandler) movingBackClickHandler();
  });

  const selectedIndex = Number(envelopeEl.dataset.index);
  const fromRect = getGridRect(selectedIndex);
  const fromRotation = fromRect.rotate ?? 0;
  const centerRect = {
    left: (wrapper.offsetWidth - FOCUS_W) / 2,
    top: (wrapper.offsetHeight - FOCUS_H) / 2,
    width: FOCUS_W,
    height: FOCUS_H,
  };

  envelopeEl.style.zIndex = '20';
  const others = envelopeEls.filter((_, i) => i !== selectedIndex);

  // Compute where the back button should end up: top-left corner with padding
  // Horizontally aligned with gramophone (var(--space-7) = 28px from left edge of wrapper)
  const wrapperRect = wrapper.getBoundingClientRect();
  const PAD = 28; // matches gramophone's --space-7
  const backTargetLeft = -wrapperRect.left + PAD;
  const backTargetTop = -wrapperRect.top + PAD;

  // --- Step 1: Animate envelope to center + move back button simultaneously ---
  animateFrames({
    duration: 600,
    fps: 12,
    onFrame(p) {
      envelopeEl.style.left      = lerp(fromRect.left,   centerRect.left,   p) + 'px';
      envelopeEl.style.top       = lerp(fromRect.top,    centerRect.top,    p) + 'px';
      envelopeEl.style.width     = lerp(fromRect.width,  centerRect.width,  p) + 'px';
      envelopeEl.style.height    = lerp(fromRect.height, centerRect.height, p) + 'px';
      envelopeEl.style.transform = `rotate(${lerp(fromRotation, 0, p)}deg)`;
      for (const el of others) el.style.opacity = String(1 - p);

      // Move back button
      movingBack.style.left = lerp(backStartLeft, backTargetLeft, p) + 'px';
      movingBack.style.top  = lerp(backStartTop,  backTargetTop,  p) + 'px';
    },
    onComplete() {
      envelopeEl.style.transform = 'rotate(0deg)';
      for (const el of others) el.style.pointerEvents = 'none';
      playOpenAnimation();
    },
  });

  // --- Step 2: Play stop-motion open frames, then show options ---
  const allFrames = [CLOSED_IMAGES[season], ...OPEN_FRAMES];

  let openedEl: HTMLElement;
  let frameImg: HTMLImageElement;
  let paperSlip: HTMLElement;

  function playOpenAnimation() {
    envelopeEl.style.visibility = 'hidden';

    openedEl = document.createElement('div');
    openedEl.className = `opened-envelope opened-envelope--${season}`;
    openedEl.style.left   = centerRect.left + 'px';
    openedEl.style.top    = centerRect.top + 'px';
    openedEl.style.width  = centerRect.width + 'px';
    openedEl.style.height = centerRect.height + 'px';

    frameImg = document.createElement('img');
    frameImg.className = 'opened-envelope__frame';
    frameImg.src = allFrames[0];
    frameImg.alt = '';
    frameImg.draggable = false;
    openedEl.appendChild(frameImg);

    wrapper.appendChild(openedEl);

    let i = 1;
    const timer = setInterval(() => {
      frameImg.src = allFrames[i];
      applyFrameSize(i);
      i++;
      if (i >= allFrames.length) {
        clearInterval(timer);
        showOptions();
      }
    }, FRAME_DELAY);
  }

  function showOptions() {
    paperSlip = buildPaperSlip(expandEnvelope);
    paperSlip.style.opacity = '0';
    openedEl.appendChild(paperSlip);

    // Enable the moving back button as the close button
    movingBackClickHandler = closeEnvelope;
    movingBack.style.pointerEvents = 'auto';

    animateFrames({
      duration: 250,
      fps: 12,
      onFrame(p) {
        paperSlip.style.opacity = String(p);
      },
      onComplete() {
        setAnimating(false);
      },
    });
  }

  // --- BROWSE / SURPRISE ME: fade out, reverse frames, enlarge ---
  function expandEnvelope(mode: 'browse' | 'surprise') {
    setAnimating(true);
    movingBack.style.pointerEvents = 'none';

    // Fade out paper slip and back button together
    animateFrames({
      duration: 250,
      fps: 12,
      onFrame(p) {
        paperSlip.style.opacity = String(1 - p);
        movingBack.style.opacity = String(1 - p);
      },
      onComplete() {
        paperSlip.remove();
        movingBack.remove();
        playCloseFrames(() => {
          openedEl.classList.add('opened-envelope--expanding');
          frameImg.style.display = 'none';
          enlargeToFullscreen(mode);
        });
      },
    });
  }

  // --- Close (back button): fade out, reverse frames, return to grid ---
  function closeEnvelope() {
    setAnimating(true);
    movingBack.style.pointerEvents = 'none';

    // Fade out paper slip
    animateFrames({
      duration: 250,
      fps: 12,
      onFrame(p) {
        paperSlip.style.opacity = String(1 - p);
      },
      onComplete() {
        paperSlip.remove();
        playCloseFrames(() => {
          openedEl.remove();
          envelopeEl.style.visibility = '';
          // Animate back button back to grid position simultaneously with envelope
          animateBackToGrid();
        });
      },
    });
  }

  // Animate back button back to grid position while envelope returns
  function animateBackToGrid() {
    const toRect = getGridRect(selectedIndex);
    const toRotation = toRect.rotate ?? 0;
    animateFrames({
      duration: 600,
      fps: 12,
      onFrame(p) {
        envelopeEl.style.left      = lerp(centerRect.left,   toRect.left,   p) + 'px';
        envelopeEl.style.top       = lerp(centerRect.top,    toRect.top,    p) + 'px';
        envelopeEl.style.width     = lerp(centerRect.width,  toRect.width,  p) + 'px';
        envelopeEl.style.height    = lerp(centerRect.height, toRect.height, p) + 'px';
        envelopeEl.style.transform = `rotate(${lerp(0, toRotation, p)}deg)`;
        for (const el of others) el.style.opacity = String(p);

        // Move back button back to grid position
        movingBack.style.left = lerp(backTargetLeft, backStartLeft, p) + 'px';
        movingBack.style.top  = lerp(backTargetTop,  backStartTop,  p) + 'px';
      },
      onComplete() {
        // Remove moving back, restore grid back button
        movingBack.remove();
        envelopeEl.style.zIndex = '';
        for (const el of others) {
          el.style.opacity = '';
          el.style.pointerEvents = '';
        }
        backBtn.style.visibility = '';
        backBtn.style.pointerEvents = '';
        setAnimating(false);
      },
    });
  }

  // Resize the opened envelope for frames that need a size bump
  function applyFrameSize(frameIndex: number) {
    const s = FRAME_SIZES[frameIndex];
    const w = FOCUS_W * s;
    const h = FOCUS_H * s;
    openedEl.style.left   = (wrapper.offsetWidth - w) / 2 + 'px';
    openedEl.style.top    = (wrapper.offsetHeight - h) / 2 + 'px';
    openedEl.style.width  = w + 'px';
    openedEl.style.height = h + 'px';
  }

  // Play frames in reverse: frame-5 → frame-4 → frame-3 → frame-2 → closed
  function playCloseFrames(onDone: () => void) {
    let i = allFrames.length - 2;
    const timer = setInterval(() => {
      frameImg.src = allFrames[i];
      applyFrameSize(i);
      i--;
      if (i < 0) {
        clearInterval(timer);
        onDone();
      }
    }, FRAME_DELAY);
  }

  // --- Enlarge envelope to fill viewport ---
  function enlargeToFullscreen(mode: 'browse' | 'surprise') {
    const wrapperRect = wrapper.getBoundingClientRect();
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const fullRect = {
      left: -wrapperRect.left,
      top: -wrapperRect.top,
      width: screenW,
      height: screenH,
    };

    const startRect = {
      left: parseFloat(openedEl.style.left),
      top: parseFloat(openedEl.style.top),
      width: parseFloat(openedEl.style.width),
      height: parseFloat(openedEl.style.height),
    };

    animateFrames({
      duration: 600,
      fps: 12,
      onFrame(p) {
        openedEl.style.left        = lerp(startRect.left,   fullRect.left,   p) + 'px';
        openedEl.style.top         = lerp(startRect.top,    fullRect.top,    p) + 'px';
        openedEl.style.width       = lerp(startRect.width,  fullRect.width,  p) + 'px';
        openedEl.style.height      = lerp(startRect.height, fullRect.height, p) + 'px';
        openedEl.style.borderRadius = lerp(4, 0, p) + 'px';
      },
      onComplete() {
        const cb = mode === 'browse' ? callbacks.onBrowse : callbacks.onSurprise;
        cb(openedEl, () => shrinkBackToGrid());
      },
    });
  }

  // --- Reverse: shrink envelope back to grid ---
  function shrinkBackToGrid() {
    setAnimating(true);

    const wrapperRect = wrapper.getBoundingClientRect();
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const fullRect = {
      left: -wrapperRect.left,
      top: -wrapperRect.top,
      width: screenW,
      height: screenH,
    };

    animateFrames({
      duration: 600,
      fps: 12,
      onFrame(p) {
        openedEl.style.left        = lerp(fullRect.left,   centerRect.left,   p) + 'px';
        openedEl.style.top         = lerp(fullRect.top,    centerRect.top,    p) + 'px';
        openedEl.style.width       = lerp(fullRect.width,  centerRect.width,  p) + 'px';
        openedEl.style.height      = lerp(fullRect.height, centerRect.height, p) + 'px';
        openedEl.style.borderRadius = lerp(0, 4, p) + 'px';
      },
      onComplete() {
        openedEl.remove();
        envelopeEl.style.visibility = '';
        returnToGrid();
      },
    });
  }

  // Return envelope from center back to grid, fade others in
  function returnToGrid() {
    const toRect = getGridRect(selectedIndex);
    const toRotation = toRect.rotate ?? 0;
    animateFrames({
      duration: 600,
      fps: 12,
      onFrame(p) {
        envelopeEl.style.left      = lerp(centerRect.left,   toRect.left,   p) + 'px';
        envelopeEl.style.top       = lerp(centerRect.top,    toRect.top,    p) + 'px';
        envelopeEl.style.width     = lerp(centerRect.width,  toRect.width,  p) + 'px';
        envelopeEl.style.height    = lerp(centerRect.height, toRect.height, p) + 'px';
        envelopeEl.style.transform = `rotate(${lerp(0, toRotation, p)}deg)`;
        for (const el of others) el.style.opacity = String(p);
      },
      onComplete() {
        envelopeEl.style.zIndex = '';
        for (const el of others) {
          el.style.opacity = '';
          el.style.pointerEvents = '';
        }
        backBtn.style.visibility = '';
        backBtn.style.pointerEvents = '';
        setAnimating(false);
      },
    });
  }
}

function buildPaperSlip(
  onExpand: (mode: 'browse' | 'surprise') => void
): HTMLElement {
  const paper = document.createElement('div');
  paper.className = 'paper-slip';
  let clicked = false;

  paper.appendChild(makeImageBtn('/images/btn-browse.png', 'BROWSE', () => {
    if (clicked) return;
    clicked = true;
    onExpand('browse');
  }));

  paper.appendChild(makeImageBtn('/images/btn-surprise.png', 'SURPRISE ME', () => {
    if (clicked) return;
    clicked = true;
    onExpand('surprise');
  }));

  return paper;
}

function makeImageBtn(src: string, label: string, onTap: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = 'img-btn';

  const img = document.createElement('img');
  img.className = 'img-btn__bg';
  img.src = src;
  img.alt = '';
  img.draggable = false;
  btn.appendChild(img);

  const text = document.createElement('span');
  text.className = 'img-btn__label';
  text.textContent = label;
  btn.appendChild(text);

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (navigator.vibrate) navigator.vibrate(10);
    onTap();
  });

  return btn;
}
