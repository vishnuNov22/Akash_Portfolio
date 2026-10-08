"use client";

import { useEffect, useRef, useState } from "react";
import { createRing } from "@/lib/ring3d";

// WebGL photo ring. Falls back to a simple strip if WebGL is unavailable.
export default function Ring3D({ photos, onOpen, className = "" }) {
  const mount = useRef(null);
  const openRef = useRef(onOpen);
  const [failed, setFailed] = useState(false);
  openRef.current = onOpen;

  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;
    import("three")
      .then((THREE) => {
        if (cancelled || !mount.current) return;
        try {
          cleanup = createRing(THREE, mount.current, photos, {
            onOpen: (p, i) => openRef.current && openRef.current(p, i),
          });
        } catch (err) {
          console.warn("3D ring unavailable:", err);
          setFailed(true);
        }
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [photos]);

  if (failed) {
    return (
      <div className={`ring-fallback ${className}`}>
        {photos.slice(0, 4).map((p, i) => (
          <button key={p.thumb} onClick={() => onOpen && onOpen(p, i)}>
            <img src={p.thumb} alt={p.title} loading="lazy" />
          </button>
        ))}
      </div>
    );
  }
  return <div ref={mount} className={`ring3d ${className}`} aria-label="3D gallery — drag to rotate, click a photo to open" role="img" />;
}
