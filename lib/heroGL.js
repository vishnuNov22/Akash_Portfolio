// WebGL hero slideshow: liquid displacement transitions, mouse ripple + RGB split, film grain.
// createHeroGL(THREE, container, urls, { onReady, onChange }) -> { goTo(i), next(), destroy() }

const vert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const frag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex1;
uniform sampler2D uTex2;
uniform vec2 uRes;
uniform vec2 uImg1;
uniform vec2 uImg2;
uniform float uProgress;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform float uVel;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec2 cover(vec2 uv, vec2 img) {
  float rs = uRes.x / uRes.y;
  float ri = img.x / max(img.y, 1.0);
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}

vec3 sampleRGB(sampler2D t, vec2 uv, vec2 img, vec2 shift) {
  vec2 c = cover(uv, img);
  float r = texture2D(t, c + shift).r;
  float g = texture2D(t, c).g;
  float b = texture2D(t, c - shift).b;
  return vec3(r, g, b);
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;

  // slow breathing zoom
  uv = (uv - 0.5) * (1.0 - 0.025 * sin(uTime * 0.25)) + 0.5;

  // mouse ripple lens
  vec2 m = uMouse;
  vec2 dv = (uv - m) * vec2(aspect, 1.0);
  float d = length(dv);
  float lens = smoothstep(0.38, 0.0, d) * uHover;
  uv -= normalize(dv + 1e-5) * lens * 0.018 * sin(d * 34.0 - uTime * 3.2);
  uv += (m - uv) * lens * 0.06;

  // cinematic liquid wipe: new frame rises from the bottom with an organic edge
  float p = uProgress;
  float n = snoise(vec2(uv.x * 3.0, uTime * 0.15)) * 0.5 + snoise(uv * 6.0) * 0.12;
  float front = p * 1.35 - 0.18 - uv.y - n * 0.22;
  float mixv = smoothstep(-0.05, 0.05, front);
  float edgeGlow = 1.0 - smoothstep(0.0, 0.12, abs(front));
  vec2 uv1 = uv + vec2(0.0, edgeGlow * 0.035 + p * 0.06);
  vec2 uv2 = (uv - 0.5) * (1.12 - 0.12 * p) + 0.5 - vec2(0.0, edgeGlow * 0.035);

  float shiftAmt = 0.004 * lens + abs(uVel) * 0.0006 + edgeGlow * 0.006;
  vec2 shift = vec2(shiftAmt, 0.0);
  vec3 c1 = sampleRGB(uTex1, uv1, uImg1, shift);
  vec3 c2 = sampleRGB(uTex2, uv2, uImg2, shift);
  vec3 col = mix(c1, c2, mixv);
  col += vec3(0.85, 0.48, 0.29) * edgeGlow * 0.18 * step(0.001, p) * step(p, 0.999); // warm light leak on the edge

  // forest grade: lift shadows toward deep green, warm highlights
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, col * vec3(0.92, 1.0, 0.95), 0.25);
  col = mix(vec3(0.063, 0.125, 0.102), col, 0.88 + 0.12 * l);

  // vignette
  vec2 q = vUv - 0.5;
  col *= 1.0 - dot(q, q) * 1.1;

  // grain
  float gr = fract(sin(dot(vUv * uRes + uTime * 60.0, vec2(12.9898, 78.233))) * 43758.5453);
  col += (gr - 0.5) * 0.045;

  gl_FragColor = vec4(col, 1.0);
}`;

export function createHeroGL(THREE, container, urls, opts = {}) {
  const { onReady = () => {}, onChange = () => {}, interval = 5200 } = opts;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  const canvas = renderer.domElement;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const blank = new THREE.DataTexture(new Uint8Array([16, 32, 26, 255]), 1, 1);
  blank.needsUpdate = true;

  const uniforms = {
    uTex1: { value: blank },
    uTex2: { value: blank },
    uRes: { value: new THREE.Vector2(1, 1) },
    uImg1: { value: new THREE.Vector2(1, 1) },
    uImg2: { value: new THREE.Vector2(1, 1) },
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uHover: { value: 0 },
    uVel: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  scene.add(quad);

  // textures
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  const texs = new Array(urls.length).fill(null);
  let loadedCount = 0;
  urls.forEach((u, i) =>
    loader.load(
      u,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.minFilter = THREE.LinearFilter;
        t.generateMipmaps = false;
        texs[i] = t;
        loadedCount++;
        if (i === 0) {
          uniforms.uTex1.value = t;
          uniforms.uImg1.value.set(t.image.width, t.image.height);
          onReady();
        }
      },
      undefined,
      () => {
        loadedCount++;
        if (i === 0) onReady();
      }
    )
  );

  function resize() {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w, h);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // state
  let current = 0;
  let target = 0;
  let animating = false;
  let animStart = 0;
  const DUR = 1500;
  let timer = 0;

  function setTex(slot, i) {
    const t = texs[i] || blank;
    uniforms["uTex" + slot].value = t;
    uniforms["uImg" + slot].value.set(t.image ? t.image.width : 1, t.image ? t.image.height : 1);
  }
  function goTo(i) {
    i = ((i % urls.length) + urls.length) % urls.length;
    if (i === current || animating) return;
    target = i;
    setTex(1, current);
    setTex(2, target);
    uniforms.uProgress.value = 0;
    animating = true;
    animStart = performance.now();
    onChange(target);
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (!reduced) timer = setTimeout(() => goTo(current + 1 === target && animating ? target + 1 : (animating ? target : current) + 1), interval);
  }
  const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  // pointer
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, h: 0, th: 0 };
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) / r.width;
    mouse.ty = 1 - (e.clientY - r.top) / r.height;
    mouse.th = 1;
  };
  const onLeave = () => (mouse.th = 0);
  container.addEventListener("pointermove", onMove);
  container.addEventListener("pointerleave", onLeave);

  // scroll velocity → chroma shift
  let lastY = window.scrollY;
  let vel = 0;

  let raf = 0;
  let visible = true;
  const io = new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(loop);
  });
  io.observe(container);

  function loop(now) {
    raf = 0;
    if (!visible) return;
    uniforms.uTime.value = now / 1000;
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;
    mouse.h += (mouse.th - mouse.h) * 0.06;
    uniforms.uMouse.value.set(mouse.x, mouse.y);
    uniforms.uHover.value = reduced ? 0 : mouse.h;
    const y = window.scrollY;
    vel += (y - lastY - vel) * 0.2;
    lastY = y;
    uniforms.uVel.value = vel;

    if (animating) {
      const k = Math.min(1, (now - animStart) / DUR);
      uniforms.uProgress.value = easeInOut(k);
      if (k >= 1) {
        animating = false;
        current = target;
        setTex(1, current);
        uniforms.uProgress.value = 0;
      }
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
  schedule();

  return {
    goTo: (i) => goTo(i),
    next: () => goTo((animating ? target : current) + 1),
    prev: () => goTo((animating ? target : current) - 1),
    loaded: () => loadedCount,
    destroy() {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      io.disconnect();
      ro.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      texs.forEach((t) => t && t.dispose());
      blank.dispose();
      mat.dispose();
      quad.geometry.dispose();
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    },
  };
}
