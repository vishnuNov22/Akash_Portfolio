// One shared rAF loop that reports scroll position + smoothed velocity to subscribers.
const subs = new Set();
let running = false;
let lastY = 0;
let vel = 0;

function tick() {
  if (!subs.size) {
    running = false;
    return;
  }
  const y = window.scrollY;
  vel += (y - lastY - vel) * 0.18;
  if (Math.abs(vel) < 0.01) vel = 0;
  lastY = y;
  const state = { y, v: vel, vh: window.innerHeight, vw: window.innerWidth };
  subs.forEach((fn) => fn(state));
  requestAnimationFrame(tick);
}

export function onFrame(fn) {
  subs.add(fn);
  if (!running) {
    running = true;
    lastY = window.scrollY;
    requestAnimationFrame(tick);
  }
  return () => subs.delete(fn);
}

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
