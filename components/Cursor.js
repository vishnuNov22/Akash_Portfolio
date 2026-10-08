"use client";

import { useEffect, useRef } from "react";

// Dot + lagging ring. Elements with data-cursor="LABEL" grow the ring and show the label.
export default function Cursor() {
  const ring = useRef(null);
  const dot = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer:fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("has-cursor");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf;
    const move = (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
    };
    const over = (e) => {
      const t = e.target.closest("[data-cursor], a, button, input, select, textarea, canvas");
      const r = ring.current;
      r.classList.toggle("link", !!t && !t.dataset.cursor);
      r.classList.toggle("label", !!(t && t.dataset.cursor));
      label.current.textContent = t && t.dataset.cursor ? t.dataset.cursor : "";
    };
    const down = () => ring.current.classList.add("down");
    const up = () => ring.current.classList.remove("down");
    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      ring.current.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div className="c-ring" ref={ring} aria-hidden="true"><span ref={label} /></div>
      <div className="c-dot" ref={dot} aria-hidden="true" />
    </>
  );
}
