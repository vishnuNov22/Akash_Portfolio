// ============================================================
// EDIT HERE — all text, contact details and photos live in this file
// ============================================================

export const SITE = {
  name: "Akash",
  studio: "AdsWeddings",
  role: "Photographer",
  tagline: "Live moments, never staged.",
  education: "Diploma — Kaapa Institute",
  whatsapp: "", // digits with country code, e.g. "919876543210"  (needed for the contact form)
  phone: "", // e.g. "+919876543210"
  instagram: "", // handle without @
  email: "",
};

// SAMPLE PHOTOS — free Unsplash stock used as stand-ins until Akash's own work is added.
// To use his photos: put files in /public/images/work/ and replace an entry with
//   { src: "/images/work/portrait-01.jpg", title: "…" }
// then set SAMPLE_PHOTOS to false.
export const SAMPLE_PHOTOS = true;

const u = (id, w) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format`;

const RAW = {
  Weddings: [
    { id: "1727430256509-0f897d6f4765", title: "The Promise" },
    { id: "1715285977649-4a83c0820399", title: "A Stolen Glance" },
    { id: "1727430228383-aa1fb59db8bf", title: "Golden Hour Bride" },
    { id: "1715285977818-7bf580da7eeb", title: "Carried Away" },
  ],
  Portraits: [
    { id: "1493106819501-66d381c466f1", title: "The Elder" },
    { id: "1544124094-8aea0374da93", title: "Quiet Strength" },
    { id: "1535270732370-dd3188bab1da", title: "Silver Lines" },
    { id: "1596604820148-da737958af16", title: "Weathered" },
  ],
  Street: [
    { id: "1664263615931-6e48857ed338", title: "Morning Run" },
    { id: "1693845609327-8f64e686e338", title: "Dust & Light" },
    { id: "1693845609171-dc73c1132cf9", title: "The Cart" },
    { id: "1677462719028-91ba8fabb8a7", title: "Lanes of Colour" },
  ],
  Travel: [
    { id: "1477587458883-47145ed94245", title: "Pink City" },
    { id: "1561359313-0639aad49ca6", title: "Ghats at Dawn" },
    { id: "1524230507669-5ff97982bb5e", title: "Hawa Mahal" },
    { id: "1517330357046-3ab5a5dd42a1", title: "Yellow Ride" },
  ],
  Nature: [
    { id: "1627370778723-4d26700cd972", title: "Tea Country" },
    { id: "1704365159747-1f7b8913044f", title: "Backwater Lines" },
    { id: "1625721838087-c46e51c89558", title: "Palm Shore" },
    { id: "1629813538702-64c925934e19", title: "Amber Hills" },
  ],
  Events: [
    { id: "1470229722913-7c0e2dbbafd3", title: "Lights Up" },
    { id: "1459749411175-04bf5292ceea", title: "The Drop" },
    { id: "1501386761578-eac5c94b800a", title: "Front Row" },
    { id: "1429962714451-bb934ecdc4ec", title: "Hearts Up" },
  ],
  Fashion: [
    { id: "1713296008556-29c7fae52234", title: "Heirloom" },
    { id: "1724433530860-f094e39b64e7", title: "Three Sisters" },
    { id: "1660193696710-874e80d74f41", title: "Crowned" },
    { id: "1550568849-11004c5e82e3", title: "Street Blue" },
  ],
};

export const CATEGORY_TEXT = {
  Weddings: "Vows, glances and the chaos in between.",
  Portraits: "Faces that carry a whole story.",
  Street: "Life as it passes — unposed, unrepeatable.",
  Travel: "Places, light and the people who live there.",
  Nature: "Hills, water and the quiet hours.",
  Events: "Energy, crowds and the moment the lights hit.",
  Fashion: "Styled frames with a candid heartbeat.",
};

export const CATEGORIES = Object.keys(RAW);

export const PHOTOS = CATEGORIES.flatMap((cat) =>
  RAW[cat].map((p) => ({
    ...p,
    cat,
    src: p.src || u(p.id, 1400),
    thumb: p.src || u(p.id, 720),
    full: p.src || u(p.id, 2200),
  }))
).map((p, i) => ({ ...p, index: i }));

// Hero WebGL slides — the first photo of each category
export const HERO_SLIDES = CATEGORIES.map((c) => PHOTOS.find((p) => p.cat === c));

// Horizontal "Selected works" reel
export const REEL = [0, 4, 8, 12, 16, 20, 24, 1, 13, 21].map((i) => PHOTOS[i]);

export const ABOUT = {
  hello: "Hello, I'm Akash.",
  lines: [
    "I'm a photographer who believes the best frames are never staged. Weddings are where I started — and where I founded AdsWeddings — but the same instinct follows me everywhere: into crowded streets, quiet hills, loud concerts and faces that carry a whole story.",
    "I trained in photography with a Diploma from Kaapa Institute. What I look for hasn't changed since: real people, real light, and the second before a moment disappears.",
  ],
  facts: [
    { k: "Founder", v: "AdsWeddings" },
    { k: "Education", v: "Diploma, Kaapa Institute" },
    { k: "Shoots", v: "Weddings · Portraits · Street · Travel · Nature · Events · Fashion" },
  ],
};
