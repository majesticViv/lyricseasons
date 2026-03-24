import type { Season } from '../types';

export const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];

export const STAMP_IMAGES: Record<Season, string> = {
  spring: '/images/stamp-spring.png',
  summer: '/images/stamp-summer.png',
  autumn: '/images/stamp-autumn.png',
  winter: '/images/stamp-winter.png',
};

export const CLOSED_ENVELOPE_IMAGES: Record<Season, string> = {
  spring: '/images/envelope-spring-closed.png',
  summer: '/images/envelope-summer-closed.png',
  autumn: '/images/envelope-autumn-closed.png',
  winter: '/images/envelope-winter-closed.png',
};

/** Preload stamp images once. Call at app startup. */
let preloaded = false;
export function preloadStamps(): void {
  if (preloaded) return;
  preloaded = true;
  Object.values(STAMP_IMAGES).forEach(src => {
    const img = new Image();
    img.src = src;
  });
}
