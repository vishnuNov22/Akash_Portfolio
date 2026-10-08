import { SITE } from "@/data/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="ft-row">
          <span>{SITE.name} — {SITE.role}</span>
          <span>Founder, {SITE.studio} · {SITE.education}</span>
          <a href="#home">Back to top ↑</a>
        </div>
        <div className="ft-big" aria-hidden="true">
          {SITE.name.toUpperCase().split("").map((c, i) => <span key={i}>{c}</span>)}
        </div>
        <div className="ft-row small">
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <span>{SITE.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
