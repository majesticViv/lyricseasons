import { togglePlaylist } from '../lib/spotify';
import { vibrate } from '../lib/haptics';

export function renderGramophone(container: HTMLElement): void {
  const btn = document.createElement('button');
  btn.className = 'gramophone__icon';
  btn.setAttribute('aria-label', 'Toggle Spotify playlist');

  const img = document.createElement('img');
  img.src = '/images/gramophone.png';
  img.alt = '';
  img.draggable = false;
  img.className = 'gramophone__img';
  btn.appendChild(img);

  btn.addEventListener('click', () => {
    vibrate(20);
    togglePlaylist();
  });

  container.appendChild(btn);
}
