"use client";

import { useEffect, useRef } from "react";
import { onFrame, clamp } from "@/lib/scroll";
import { PHOTOS } from "@/data/site";

// Words light up one by one as you scroll; small photo pills sit inside the sentence.
const TOKENS = [
  "I'm", "Akash", "—", "a", "photographer", "chasing", { img: PHOTOS[1].thumb }, "live", "moments.",
  "From", { img: PHOTOS[0].thumb }, "weddings", "to", "crowded", "streets,", { img: PHOTOS[8].thumb },
  "quiet", "hills", "and", "loud", "nights", { img: PHOTOS[20].thumb }, "—", "I", "wait", "for", "the",
  "second", "a", "frame", "becomes", "a", "memory.",
];

export default function Statement() {
  const ref = useRef(null);
  const words = TOKENS.filter((t) => typeof t === "string").length;
  useEffect(() => {
    const el = ref.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--p", words);
      return;
    }
    return onFrame(({ vh }) => {
      const r = el.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3));
      el.style.setProperty("--p", (p * (words + 2)).toFixed(2));
    });
  }, [words]);

  let w = 0;
  return (
    <section className="statement" id="statement">
      <div className="wrap">
        <p className="label">( About the work )</p>
        <p className="stmt" ref={ref}>
          {TOKENS.map((t, i) =>
            typeof t === "string" ? (
              <span key={i} className="w" style={{ "--i": w++ }}>{t} </span>
            ) : (
              <span key={i} className="pill" style={{ "--i": w }}>
                <img src={t.img} alt="" loading="lazy" />
              </span>
            )
          )}
        </p>
      </div>
    </section>
  );
}
