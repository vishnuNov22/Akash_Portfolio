"use client";

import { useEffect, useRef } from "react";
import Reveal from "./Reveal";
import Magnetic from "./Magnetic";
import { onFrame, clamp } from "@/lib/scroll";
import { ABOUT, SITE } from "@/data/site";

// Akash's portrait opens like a camera aperture on scroll and floats as a layered 3D card.
export default function Profile() {
  const stage = useRef(null);
  const wrap = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      wrap.current.style.setProperty("--open", 1);
      return;
    }
    return onFrame(({ vh }) => {
      const r = wrap.current.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = clamp((vh - r.top) / (vh * 0.75));
      wrap.current.style.setProperty("--open", p.toFixed(3));
    });
  }, []);

  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = stage.current.getBoundingClientRect();
    stage.current.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    stage.current.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  const onLeave = () => {
    stage.current.style.setProperty("--px", 0);
    stage.current.style.setProperty("--py", 0);
  };

  return (
    <section className="about sec" id="about">
      <div className="wrap about-grid">
        <div className="pf-wrap" ref={wrap}>
          <div className="pf-stage" ref={stage} onPointerMove={onMove} onPointerLeave={onLeave}>
            <div className="pf-layer pf-back" aria-hidden="true" />
            <div className="pf-layer pf-photo">
              <img src="/images/akash.jpg" alt={`${SITE.name}, photographer`} />
            </div>
            <div className="pf-layer pf-plate">
              <b>{SITE.name}</b>
              <span>Founder · {SITE.studio}</span>
            </div>
            <div className="pf-layer pf-chip">{SITE.education}</div>
            <svg className="pf-layer pf-badge" viewBox="0 0 160 160" aria-hidden="true">
              <defs><path id="pfc" d="M80 80 m-62 0 a62 62 0 1 1 124 0 a62 62 0 1 1 -124 0" /></defs>
              <text><textPath href="#pfc">AKASH · PHOTOGRAPHER · LIVE MOMENTS · </textPath></text>
              <circle cx="80" cy="80" r="22" />
              <circle cx="80" cy="80" r="9" className="in" />
            </svg>
          </div>
        </div>

        <div className="about-copy">
          <Reveal><p className="label">( Profile )</p></Reveal>
          <Reveal><h2 className="h-xl">{ABOUT.hello.replace("Akash.", "")}<em>Akash.</em></h2></Reveal>
          {ABOUT.lines.map((l, i) => (
            <Reveal as="p" key={i} delay={0.08 * (i + 1)}>{l}</Reveal>
          ))}
          <Reveal as="dl" className="facts" delay={0.2}>
            {ABOUT.facts.map((f) => (
              <div key={f.k}>
                <dt>{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </Reveal>
          <Reveal delay={0.25}>
            <Magnetic>
              <a href="#contact" className="btn-round" data-cursor="HELLO">Work<br />with me</a>
            </Magnetic>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
