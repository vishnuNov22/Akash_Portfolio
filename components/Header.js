"use client";

import { useEffect, useState } from "react";
import { HERO_SLIDES, SITE } from "@/data/site";

const LINKS = [
  ["#home", "Home"],
  ["#expertise", "Expertise"],
  ["#works", "Works"],
  ["#about", "About"],
  ["#archive", "3D Archive"],
  ["#contact", "Contact"],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 60);
      setHidden(y > 300 && y > last + 2);
      if (y < last - 2) setHidden(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className={`hdr ${solid ? "solid" : ""} ${hidden && !open ? "hide" : ""}`}>
        <a href="#home" className="hdr-logo" aria-label={`${SITE.name} — home`}>
          <b>{SITE.name}</b>
          <span>{SITE.role}</span>
        </a>
        <div className="hdr-right">
          <a href="#contact" className="hdr-book">Book a shoot</a>
          <button className={`hdr-menu ${open ? "x" : ""}`} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>
            <span className="txt">{open ? "Close" : "Menu"}</span>
            <span className="lines"><i /><i /></span>
          </button>
        </div>
      </header>

      <div className={`overlay-menu ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="om-preview" aria-hidden="true">
          {HERO_SLIDES.map((p, i) => (
            <img key={p.thumb} src={p.thumb} alt="" className={i === hover % HERO_SLIDES.length ? "on" : ""} />
          ))}
        </div>
        <nav className="om-links" aria-label="Main">
          {LINKS.map(([h, l], i) => (
            <a key={h} href={h} onClick={() => setOpen(false)} onPointerEnter={() => setHover(i)} style={{ "--d": `${0.08 + i * 0.06}s` }} tabIndex={open ? 0 : -1}>
              <small>0{i + 1}</small>
              <span>{l}</span>
            </a>
          ))}
        </nav>
        <div className="om-foot">
          <span>{SITE.name} — {SITE.role}</span>
          <span>Founder, {SITE.studio}</span>
          {SITE.instagram && <a href={`https://instagram.com/${SITE.instagram}`} target="_blank" rel="noopener">Instagram</a>}
        </div>
      </div>
    </>
  );
}
