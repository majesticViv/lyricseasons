/** Trigger a short haptic vibration if the device supports it. */
export function vibrate(ms: number = 10): void {
  if (navigator.vibrate) navigator.vibrate(ms);
}
