import { vibrate } from '../lib/haptics';

export type StickerType = 'back' | 'edit' | 'next-page' | 'prev-page';

const IMAGES: Partial<Record<StickerType, string>> = {
  'back': '/images/sticker-back.png',
  'prev-page': '/images/sticker-prev.png',
  'next-page': '/images/sticker-next.png',
};

const PLACEHOLDER: Record<StickerType, string> = {
  'back': '←',
  'edit': '✎',
  'next-page': '→',
  'prev-page': '←',
};

const LABELS: Record<StickerType, string> = {
  'back': 'Back',
  'edit': 'Edit',
  'next-page': 'Next page',
  'prev-page': 'Previous page',
};

export function createStickerButton(type: StickerType, onTap: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = `sticker-btn sticker-btn--${type}`;
  btn.setAttribute('aria-label', LABELS[type]);

  const imgSrc = IMAGES[type];
  if (imgSrc) {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = '';
    img.draggable = false;
    img.className = 'sticker-btn__img';
    btn.appendChild(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'sticker-btn__placeholder';
    placeholder.textContent = PLACEHOLDER[type];
    btn.appendChild(placeholder);
  }

  btn.addEventListener('click', () => {
    vibrate();
    onTap();
  });

  return btn;
}
