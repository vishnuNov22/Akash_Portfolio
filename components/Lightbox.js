"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const LightboxCtx = createContext({ open: () => {} });

export function useLightbox() {
  return useContext(LightboxCtx);
}

export default function LightboxProvider({ children }) {
  const [state, setState] = useState({ list: [], i: -1 });
  const isOpen = state.i >= 0;

  const open = useCallback((list, i) => setState({ list, i }), []);
  const close = useCallback(() => setState((s) => ({ ...s, i: -1 })), []);
  const step = useCallback(
    (d) => setState((s) => ({ ...s, i: (s.i + d + s.list.length) % s.list.length })),
    []
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close, step]);

  const p = isOpen ? state.list[state.i] : null;

  return (
    <LightboxCtx.Provider value={{ open }}>
      {children}
      <div
        className={`lb ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Photo viewer"
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        {p && (
          <figure key={p.full}>
            <img src={p.full} alt={`${p.title} — ${p.cat}`} />
            <figcaption>
              <small>{p.cat}</small>
              {p.title}
            </figcaption>
          </figure>
        )}
        <button className="lb-x" onClick={close} aria-label="Close">×</button>
        <button className="lb-nav prev" onClick={() => step(-1)} aria-label="Previous">‹</button>
        <button className="lb-nav next" onClick={() => step(1)} aria-label="Next">›</button>
      </div>
    </LightboxCtx.Provider>
  );
}
