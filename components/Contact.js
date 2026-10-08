"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import Magnetic from "./Magnetic";
import { SITE } from "@/data/site";

const wa = (text) => `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export default function Contact() {
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const f = e.currentTarget.elements;
    const v = (n) => f[n].value.trim();
    const d = { name: v("name"), phone: v("phone").replace(/[\s-]/g, ""), type: v("type"), date: v("date"), place: v("place"), msg: v("msg") };
    const er = {};
    if (d.name.length < 2) er.name = "Please enter your name";
    if (!/^(\+?91)?[6-9]\d{9}$/.test(d.phone)) er.phone = "Enter a valid 10-digit mobile number";
    if (!d.type) er.type = "Please choose a shoot type";
    setErrors(er);
    if (Object.keys(er).length) return;
    if (!SITE.whatsapp) {
      setNotice("WhatsApp number not set yet — add it to SITE.whatsapp in data/site.js.");
      return;
    }
    const L = [`Hello ${SITE.name},`, "I'd like to book a shoot.", "", `Name: ${d.name}`, `Phone: ${d.phone}`, `Shoot: ${d.type}`];
    if (d.date) L.push(`Date: ${d.date.split("-").reverse().join("/")}`);
    if (d.place) L.push(`Location: ${d.place}`);
    if (d.msg) L.push(`Message: ${d.msg}`);
    L.push("", `(Sent from ${SITE.name}'s website)`);
    window.open(wa(L.join("\n")), "_blank", "noopener");
  };

  const ways = [];
  if (SITE.whatsapp) ways.push({ href: wa(`Hello ${SITE.name}, I'd like to book a shoot.`), k: "WhatsApp", v: "Message me", ext: true });
  if (SITE.phone) ways.push({ href: `tel:${SITE.phone}`, k: "Call", v: SITE.phone });
  if (SITE.instagram) ways.push({ href: `https://instagram.com/${SITE.instagram}`, k: "Instagram", v: `@${SITE.instagram}`, ext: true });
  if (SITE.email) ways.push({ href: `mailto:${SITE.email}`, k: "Email", v: SITE.email });

  const field = (name, label, input) => (
    <div className={`field ${errors[name] ? "err" : ""}`}>
      <label htmlFor={`f-${name}`}>{label}</label>
      {input}
      {errors[name] && <span className="msg">{errors[name]}</span>}
    </div>
  );

  return (
    <section className="contact sec" id="contact">
      <div className="wrap">
        <Reveal className="ct-head">
          <p className="label">( Contact )</p>
          <h2 className="h-mega">
            Let&apos;s create
            <br />
            something <em>real.</em>
          </h2>
          <Magnetic className="ct-mag">
            <a href="#enquiry" className="btn-round accent" data-cursor="GO">Book a<br />shoot</a>
          </Magnetic>
        </Reveal>

        <div className="contact-grid">
          <Reveal>
            <p className="muted">
              Weddings, portraits, events, travel or a fashion story — tell me what you have in mind. Your message opens in
              WhatsApp, ready to send. Nothing is stored on this website.
            </p>
            {ways.length > 0 && (
              <div className="ways">
                {ways.map((w) => (
                  <a key={w.k} href={w.href} {...(w.ext ? { target: "_blank", rel: "noopener" } : {})}>
                    <small>{w.k}</small>
                    {w.v} <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            )}
          </Reveal>

          <Reveal as="form" className="form" id="enquiry" onSubmit={submit} noValidate delay={0.1}>
            <div className="row">
              {field("name", "Your name", <input id="f-name" name="name" autoComplete="name" />)}
              {field("phone", "Phone", <input id="f-phone" name="phone" inputMode="tel" autoComplete="tel" />)}
            </div>
            <div className="row">
              {field(
                "type",
                "Shoot type",
                <select id="f-type" name="type" defaultValue="">
                  <option value="">Select…</option>
                  <option>Wedding / Engagement</option>
                  <option>Portrait session</option>
                  <option>Event / Concert</option>
                  <option>Fashion shoot</option>
                  <option>Travel / Nature</option>
                  <option>Other</option>
                </select>
              )}
              {field("date", "Date", <input id="f-date" name="date" type="date" />)}
            </div>
            {field("place", "Location", <input id="f-place" name="place" placeholder="Optional" />)}
            {field("msg", "Message", <textarea id="f-msg" name="msg" rows={3} placeholder="Optional" />)}
            <button type="submit" className="btn-solid" data-cursor="SEND">Send on WhatsApp <span aria-hidden="true">↗</span></button>
            {notice && <p className="notice">{notice}</p>}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
