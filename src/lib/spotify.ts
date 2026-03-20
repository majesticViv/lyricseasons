import { animateFrames, lerp } from '../animations/frameAnimation';

const PLAYLIST_ID = import.meta.env.VITE_SPOTIFY_PLAYLIST_ID || '4QXnUNne50rf8xbuADrP50';
const EMBED_URL = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`;

let activeBar: HTMLElement | null = null;
let animating = false;

/** Close the Spotify bar if open (no animation, instant removal). */
export function closePlaylist(): void {
  if (!activeBar) return;
  activeBar.remove();
  activeBar = null;
  animating = false;
}

/** Toggle the Spotify embed bar. Returns true if opened, false if closed. */
export function togglePlaylist(): boolean {
  if (animating) return !!activeBar;

  if (activeBar) {
    closeBar();
    return false;
  } else {
    openBar();
    return true;
  }
}

function openBar(): void {
  const bar = document.createElement('div');
  bar.className = 'spotify-bar';
  activeBar = bar;

  const iframe = document.createElement('iframe');
  iframe.className = 'spotify-bar__iframe';
  iframe.src = EMBED_URL;
  iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
  iframe.loading = 'lazy';
  iframe.setAttribute('frameborder', '0');
  bar.appendChild(iframe);

  document.body.appendChild(bar);

  // Slide-extend from left: start narrow (width 0, scaleX 0) → full size
  animating = true;
  bar.style.opacity = '0';
  bar.style.transformOrigin = 'left center';
  bar.style.transform = 'scaleX(0)';

  animateFrames({
    duration: 300,
    fps: 12,
    onFrame(p) {
      bar.style.opacity = String(Math.min(p * 2, 1));
      bar.style.transform = `scaleX(${lerp(0, 1, p)})`;
    },
    onComplete() {
      bar.style.transform = '';
      bar.style.opacity = '';
      animating = false;
    },
  });
}

function closeBar(): void {
  const bar = activeBar;
  if (!bar) return;
  activeBar = null;
  animating = true;

  bar.style.transformOrigin = 'left center';

  animateFrames({
    duration: 250,
    fps: 12,
    onFrame(p) {
      bar.style.opacity = String(1 - p);
      bar.style.transform = `scaleX(${lerp(1, 0, p)})`;
    },
    onComplete() {
      bar.remove();
      animating = false;
    },
  });
}
