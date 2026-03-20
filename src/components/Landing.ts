import { renderEnvelopeStack, type EnvelopeContext } from './EnvelopeStack';
import { renderPen } from './Pen';
import { renderGramophone } from './Gramophone';
import { animateFrames, lerp } from '../animations/frameAnimation';
import type { Season } from '../types';

export function renderLanding(
  container: HTMLElement,
  callbacks: {
    onSeasonTap: (season: Season, envelopeEl: HTMLElement, ctx: EnvelopeContext) => void;
    onPenTap: () => void;
  }
): void {
  container.innerHTML = '';

  const screen = document.createElement('div');
  screen.className = 'landing';

  // Pen — positioned absolutely, JS-driven position
  const penArea = document.createElement('div');
  penArea.className = 'landing__pen';
  renderPen(penArea, callbacks.onPenTap);
  screen.appendChild(penArea);

  // Gramophone — fixed bottom-left
  const gramArea = document.createElement('div');
  gramArea.className = 'landing__gramophone';
  renderGramophone(gramArea);
  screen.appendChild(gramArea);

  // Envelopes — centered, this is the main element
  const envelopeArea = document.createElement('div');
  envelopeArea.className = 'landing__envelopes';

  // --- Pen position helpers ---
  // "Stacked" position: right of center, vertically centered
  function getPenStackPos() {
    const sw = screen.offsetWidth;
    const sh = screen.offsetHeight;
    return {
      left: sw / 2 + 120,
      top: sh / 2 - penArea.offsetHeight / 2,
    };
  }

  // "Distributed" position: bottom-right, mirroring gramophone's padding (--space-7 = 28px)
  function getPenCornerPos() {
    const sw = screen.offsetWidth;
    const sh = screen.offsetHeight;
    const pad = 28; // matches gramophone's --space-7
    return {
      left: sw - penArea.offsetWidth - pad,
      top: sh - penArea.offsetHeight - pad,
    };
  }

  function setPenPos(left: number, top: number) {
    penArea.style.left = left + 'px';
    penArea.style.top = top + 'px';
  }

  renderEnvelopeStack(
    envelopeArea,
    callbacks.onSeasonTap,
    () => {
      // On distribute: animate pen from stack-side to bottom-right corner
      const from = getPenStackPos();
      const to = getPenCornerPos();
      animateFrames({
        duration: 800,
        fps: 12,
        onFrame(p) {
          setPenPos(lerp(from.left, to.left, p), lerp(from.top, to.top, p));
        },
      });
    },
    () => {
      // On collapse: animate pen from corner back to stack-side
      const from = getPenCornerPos();
      const to = getPenStackPos();
      animateFrames({
        duration: 800,
        fps: 12,
        onFrame(p) {
          setPenPos(lerp(from.left, to.left, p), lerp(from.top, to.top, p));
        },
      });
    }
  );
  screen.appendChild(envelopeArea);

  container.appendChild(screen);

  // Set initial pen position after layout
  requestAnimationFrame(() => {
    const pos = getPenStackPos();
    setPenPos(pos.left, pos.top);
  });
}
