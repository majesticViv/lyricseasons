import { renderEnvelopeStack, type EnvelopeContext } from './EnvelopeStack';
import { renderPen } from './Pen';
import { renderGramophone } from './Gramophone';
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

  // Pen — fixed bottom-right via CSS
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

  renderEnvelopeStack(envelopeArea, callbacks.onSeasonTap);
  screen.appendChild(envelopeArea);

  container.appendChild(screen);
}
