import { vibrate } from '../lib/haptics';

export function renderPen(
  container: HTMLElement,
  onTap: () => void
): void {
  const btn = document.createElement('button');
  btn.className = 'pen';
  btn.setAttribute('aria-label', 'Add new lyric');

  const img = document.createElement('img');
  img.src = '/images/pen.png';
  img.alt = '';
  img.draggable = false;
  img.className = 'pen__img';
  btn.appendChild(img);

  btn.addEventListener('click', () => {
    vibrate(20);
    onTap();
  });

  container.appendChild(btn);
}
