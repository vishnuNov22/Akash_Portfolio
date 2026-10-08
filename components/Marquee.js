"use client";

import { useEffect, useRef } from "react";
import { onFrame } from "@/lib/scroll";
import { CATEGORIES } from "@/data/site";

// Infinite text band whose speed and direction follow scroll velocity.
export default function Marquee() {
  const track = useRef(null);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let x = 0, dir = -1;
    return onFrame(({ v }) => {
      if (v > 0.5) dir = -1;
      else if (v < -0.5) dir = 1;
      x += dir * (0.6 + Math.min(Math.abs(v), 60) * 0.12);
      const w = track.current.scrollWidth / 2;
      if (x <= -w) x += w;
      if (x > 0) x -= w;
      track.current.style.transform = `translate3d(${x}px,0,0) skewX(${Math.max(-8, Math.min(8, -v * 0.15))}deg)`;
    });
  }, []);
  const items = [...CATEGORIES, ...CATEGORIES];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="mq-track" ref={track}>
        {[...items, ...items].map((c, i) => (
          <span key={i} className={i % 2 ? "o" : ""}>{c}<i>✺</i></span>
        ))}
      </div>
    </div>
  );
}
