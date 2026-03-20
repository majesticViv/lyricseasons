/**
 * Stop-motion frame animation utility.
 *
 * Drives animations at a fixed FPS (default 12) using setInterval.
 * Each tick calls `onFrame(progress)` where progress goes from 0 → 1
 * in discrete, evenly-spaced steps. This guarantees choppy flipbook
 * motion — no interpolation, no easing.
 *
 * Usage:
 *   animateFrames({
 *     duration: 800,
 *     fps: 12,
 *     onFrame(p) { el.style.left = lerp(startX, endX, p) + 'px'; },
 *     onComplete() { el.style.left = endX + 'px'; }
 *   });
 */

export interface FrameAnimationOptions {
  /** Total duration in ms */
  duration: number;
  /** Frames per second (default 12) */
  fps?: number;
  /** Called each frame with progress 0→1 */
  onFrame: (progress: number) => void;
  /** Called once after the final frame */
  onComplete?: () => void;
}

export interface FrameAnimationHandle {
  /** Stop the animation immediately. onComplete is NOT called. */
  cancel: () => void;
}

export function animateFrames(opts: FrameAnimationOptions): FrameAnimationHandle {
  const fps = opts.fps ?? 12;
  const interval = 1000 / fps;                    // ms between frames
  const totalFrames = Math.max(1, Math.round(opts.duration / interval));

  let frame = 0;
  let cancelled = false;

  // Fire frame 0 immediately
  opts.onFrame(0);
  frame = 1;

  const id = setInterval(() => {
    if (cancelled) return;

    if (frame >= totalFrames) {
      clearInterval(id);
      opts.onFrame(1);
      opts.onComplete?.();
      return;
    }

    const progress = frame / totalFrames;
    opts.onFrame(progress);
    frame++;
  }, interval);

  return {
    cancel() {
      cancelled = true;
      clearInterval(id);
    },
  };
}

// --- Interpolation helpers ---

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Ease-out bounce curve (for pop effects).  Feed the result into lerp. */
export function bounceOut(t: number): number {
  // Overshoots then settles: matches the stopPop feel
  if (t < 0.3)  return lerp(0, 1.15, t / 0.3);
  if (t < 0.6)  return lerp(1.15, 0.95, (t - 0.3) / 0.3);
  if (t < 0.8)  return lerp(0.95, 1.05, (t - 0.6) / 0.2);
  return lerp(1.05, 1, (t - 0.8) / 0.2);
}

/**
 * Animate multiple elements in parallel, each with its own start/end
 * positions. All share the same timing.
 */
export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
  rotate?: number;
}

export interface MultiElementTarget {
  el: HTMLElement;
  from: Rect;
  to:   Rect;
}

export function animateMultipleElements(
  targets: MultiElementTarget[],
  opts: { duration: number; fps?: number; onComplete?: () => void }
): FrameAnimationHandle {
  return animateFrames({
    duration: opts.duration,
    fps: opts.fps,
    onFrame(progress) {
      for (const t of targets) {
        t.el.style.left   = lerp(t.from.left,   t.to.left,   progress) + 'px';
        t.el.style.top    = lerp(t.from.top,    t.to.top,    progress) + 'px';
        t.el.style.width  = lerp(t.from.width,  t.to.width,  progress) + 'px';
        t.el.style.height = lerp(t.from.height, t.to.height, progress) + 'px';
        const fromR = t.from.rotate ?? 0;
        const toR = t.to.rotate ?? 0;
        if (fromR !== 0 || toR !== 0) {
          t.el.style.transform = `rotate(${lerp(fromR, toR, progress)}deg)`;
        }
      }
    },
    onComplete: opts.onComplete,
  });
}
