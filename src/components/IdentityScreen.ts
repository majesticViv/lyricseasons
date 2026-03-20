import { store } from '../state/store';
import { animateFrames } from '../animations/frameAnimation';
import { vibrate } from '../lib/haptics';
import type { Author } from '../types';

const SEAL_IMAGES: Record<Author, string> = {
  Viv: '/images/seal-viv.png',
  Bili: '/images/seal-bili.png',
};

export function renderIdentityScreen(
  container: HTMLElement,
  onComplete: () => void
): void {
  container.innerHTML = '';

  const screen = document.createElement('div');
  screen.className = 'identity-screen';

  // Polaroid — decorative, tap to reveal photo
  const polaroid = document.createElement('button');
  polaroid.className = 'identity-polaroid';
  polaroid.setAttribute('aria-label', 'Reveal photo');
  // Random slight rotation
  const rot = (Math.random() * 10 - 5).toFixed(1);
  polaroid.style.transform = `rotate(${rot}deg)`;

  const blankImg = document.createElement('img');
  blankImg.className = 'identity-polaroid__img';
  blankImg.src = '/images/polaroid-blank.png';
  blankImg.alt = '';
  blankImg.draggable = false;
  polaroid.appendChild(blankImg);

  const photoImg = document.createElement('img');
  photoImg.className = 'identity-polaroid__img identity-polaroid__photo';
  photoImg.src = '/images/polaroid-photo.png';
  photoImg.alt = '';
  photoImg.draggable = false;
  photoImg.style.opacity = '0';
  polaroid.appendChild(photoImg);

  let revealed = false;
  polaroid.addEventListener('click', () => {
    if (revealed) return;
    revealed = true;
    vibrate();
    // Cross-fade: blank out, photo in — stop-motion discrete steps
    animateFrames({
      duration: 800,
      fps: 10,
      onFrame(p) {
        blankImg.style.opacity = String(1 - p);
        photoImg.style.opacity = String(p);
      },
    });
  });

  screen.appendChild(polaroid);

  // Wax seals row
  const sealsRow = document.createElement('div');
  sealsRow.className = 'identity-seals';

  const names: Author[] = ['Viv', 'Bili'];
  names.forEach(name => {
    const btn = document.createElement('button');
    btn.className = 'identity-seal';
    btn.setAttribute('aria-label', `Enter as ${name}`);

    const img = document.createElement('img');
    img.className = `identity-seal__img${name === 'Bili' ? ' identity-seal__img--bili' : ''}`;
    img.src = SEAL_IMAGES[name];
    img.alt = name;
    img.draggable = false;
    btn.appendChild(img);

    btn.addEventListener('click', () => handleSelect(name, btn, onComplete));
    sealsRow.appendChild(btn);
  });

  screen.appendChild(sealsRow);
  container.appendChild(screen);
}

function handleSelect(
  name: Author,
  btn: HTMLElement,
  onComplete: () => void
): void {
  if (btn.classList.contains('identity-seal--selected')) return;

  btn.classList.add('identity-seal--selected');
  const sibling = btn.parentElement?.querySelector(
    '.identity-seal:not(.identity-seal--selected)'
  ) as HTMLElement | null;
  if (sibling) {
    sibling.classList.add('identity-seal--disabled');
    sibling.setAttribute('aria-disabled', 'true');
  }

  vibrate();
  store.setCurrentUser(name);

  setTimeout(() => onComplete(), 500);
}
