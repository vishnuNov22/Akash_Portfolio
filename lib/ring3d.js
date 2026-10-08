// Framework-agnostic WebGL "photo ring" built with three.js.
// createRing(THREE, container, photos, { onOpen, interactive }) -> cleanup()

export function createRing(THREE, container, photos, opts = {}) {
  const { onOpen = () => {}, autoSpeed = 0.0022 } = opts;
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- renderer / scene / camera ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.touchAction = "pan-y";
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x10201a, 8, 15);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.35, 10.2);

  const world = new THREE.Group();
  scene.add(world);
  const ring = new THREE.Group();
  world.add(ring);

  // ---------- curved photo cards ----------
  const N = photos.length;
  const R = Math.max(3.1, N * 0.36);
  const W = 1.7;
  const H = W / 0.75; // 3:4 portrait cards
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");

  function curvedPlane() {
    const g = new THREE.PlaneGeometry(W, H, 24, 1);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const a = x / R;
      pos.setX(i, Math.sin(a) * R);
      pos.setZ(i, Math.cos(a) * R - R);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }

  const geo = curvedPlane();
  const frameGeo = new THREE.PlaneGeometry(W + 0.08, H + 0.08, 24, 1);
  {
    const pos = frameGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const a = pos.getX(i) / R;
      pos.setX(i, Math.sin(a) * R);
      pos.setZ(i, Math.cos(a) * R - R - 0.01);
    }
    pos.needsUpdate = true;
  }

  const cards = [];
  const textures = [];
  photos.forEach((p, i) => {
    const mat = new THREE.MeshBasicMaterial({
      color: 0x222222,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const frameMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const holder = new THREE.Group();
    const mesh = new THREE.Mesh(geo, mat);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    holder.add(frame);
    holder.add(mesh);
    const theta = (i / N) * Math.PI * 2;
    holder.position.set(Math.sin(theta) * R, 0, Math.cos(theta) * R);
    holder.rotation.y = theta;
    holder.userData = { index: i, theta, hover: 0, loaded: false };
    mesh.userData.holder = holder;
    ring.add(holder);
    cards.push({ holder, mesh, mat, frameMat });

    loader.load(
      p.thumb || p.src,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        const img = tex.image;
        const ia = img.width / img.height;
        const pa = W / H;
        if (ia > pa) {
          tex.repeat.set(pa / ia, 1);
          tex.offset.set((1 - pa / ia) / 2, 0);
        } else {
          tex.repeat.set(1, ia / pa);
          tex.offset.set(0, (1 - ia / pa) / 2);
        }
        mat.map = tex;
        mat.color.set(0xffffff);
        mat.needsUpdate = true;
        holder.userData.loaded = true;
        textures.push(tex);
      },
      undefined,
      () => {
        holder.userData.loaded = true; // show the grey card if an image fails
      }
    );
  });

  // ---------- floating dust for depth ----------
  const dustCount = 260;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const r = 2 + Math.random() * 7;
    const a = Math.random() * Math.PI * 2;
    dustPos[i * 3] = Math.cos(a) * r;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 6;
    dustPos[i * 3 + 2] = Math.sin(a) * r;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xd97a4a,
    size: 0.03,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  world.add(dust);

  // soft floor reflection line
  const floorGeo = new THREE.RingGeometry(R - 0.02, R + 0.02, 128);
  const floorMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -H / 2 - 0.35;
  world.add(floor);

  // ---------- sizing ----------
  let camZ = 10;
  function resize() {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the whole ring in view on narrow screens
    const vFov = (camera.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const distW = ((R + W * 0.5) * 1.1) / Math.tan(hFov / 2);
    const distH = (H * 1.45) / Math.tan(vFov / 2) + R * 0.5;
    camZ = Math.max(distW, distH, 7.5);
    camera.position.z = camZ;
    camera.position.y = camZ * 0.17; // look at the ring slightly from above
    scene.fog.near = camZ - R * 0.4;
    scene.fog.far = camZ + R * 2.6;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // ---------- interaction ----------
  let rot = 0;
  let vel = reduced ? 0 : autoSpeed;
  let dragging = false;
  let lastX = 0;
  let downX = 0;
  let downY = 0;
  let moved = 0;
  const mouse = new THREE.Vector2(-10, -10);
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  const raycaster = new THREE.Raycaster();
  let hovered = null;

  function setMouse(e) {
    const r = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    tilt.tx = mouse.x;
    tilt.ty = mouse.y;
  }
  function pick() {
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(
      cards.map((c) => c.mesh),
      false
    );
    // only the front-facing side counts
    for (const h of hits) {
      if (h.face && h.face.normal) {
        const n = h.face.normal.clone().transformDirection(h.object.matrixWorld);
        const toCam = camera.position.clone().sub(h.point).normalize();
        if (n.dot(toCam) > 0.15) return h.object.userData.holder;
      }
    }
    return null;
  }

  const onDown = (e) => {
    dragging = true;
    moved = 0;
    lastX = downX = e.clientX;
    downY = e.clientY;
    setMouse(e);
  };
  const onMove = (e) => {
    setMouse(e);
    if (dragging) {
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved = Math.max(moved, Math.abs(e.clientX - downX), Math.abs(e.clientY - downY));
      rot += dx * 0.006;
      vel = dx * 0.006;
    }
  };
  const onUp = (e) => {
    if (!dragging) return;
    dragging = false;
    if (moved < 6) {
      setMouse(e);
      const h = pick();
      if (h) onOpen(photos[h.userData.index], h.userData.index);
    }
  };
  const onLeave = () => {
    mouse.set(-10, -10);
    tilt.tx = 0;
    tilt.ty = 0;
    dragging = false;
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointerleave", onLeave);

  // ---------- render loop (paused when off screen) ----------
  let raf = 0;
  let visible = true;
  let t0 = performance.now();
  let fadeIn = 0;
  const io = new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
    if (visible && !raf) loop();
  });
  io.observe(container);

  const tmp = new THREE.Vector3();
  function loop() {
    raf = 0;
    if (!visible || document.hidden) return;
    const now = performance.now();
    const dt = Math.min((now - t0) / 16.67, 3);
    t0 = now;
    const t = now / 1000;
    fadeIn = Math.min(1, fadeIn + 0.02 * dt);

    if (!dragging) {
      const base = reduced ? 0 : autoSpeed;
      vel += (base - vel) * 0.04 * dt;
      rot += vel * dt;
    }
    ring.rotation.y = rot;

    tilt.x += (tilt.ty * 0.12 - tilt.x) * 0.06 * dt;
    tilt.y += (tilt.tx * 0.2 - tilt.y) * 0.06 * dt;
    world.rotation.x = -tilt.x;
    world.rotation.z = tilt.y * 0.12;
    camera.position.x = tilt.y * 1.2;
    camera.lookAt(0, -0.25, 0);

    dust.rotation.y = -t * 0.03;

    hovered = !dragging && mouse.x > -2 ? pick() : null;
    canvas.style.cursor = hovered ? "pointer" : dragging ? "grabbing" : "grab";

    cards.forEach(({ holder, mat, frameMat }, i) => {
      const u = holder.userData;
      u.hover += ((hovered === holder ? 1 : 0) - u.hover) * 0.12 * dt;
      holder.position.y = Math.sin(t * 0.9 + i * 0.8) * 0.09 + u.hover * 0.12;
      const s = 1 + u.hover * 0.07;
      holder.scale.set(s, s, s);
      // dim the cards that face away from the camera
      holder.getWorldPosition(tmp);
      const facing = Math.max(0, Math.min(1, (tmp.z + R) / (2 * R)));
      const shade = 0.35 + 0.65 * facing * facing;
      if (u.loaded) {
        mat.opacity = Math.min(1, fadeIn * 1.2) * (0.35 + 0.65 * facing);
        if (mat.map) mat.color.setScalar(shade);
      }
      frameMat.opacity = (0.06 + u.hover * 0.5) * fadeIn * facing;
    });

    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }
  const onVis = () => {
    if (!document.hidden && visible && !raf) {
      t0 = performance.now();
      loop();
    }
  };
  document.addEventListener("visibilitychange", onVis);
  loop();

  // ---------- cleanup ----------
  return function cleanup() {
    cancelAnimationFrame(raf);
    raf = 0;
    visible = false;
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointerleave", onLeave);
    geo.dispose();
    frameGeo.dispose();
    dustGeo.dispose();
    floorGeo.dispose();
    dustMat.dispose();
    floorMat.dispose();
    cards.forEach(({ mat, frameMat }) => {
      mat.dispose();
      frameMat.dispose();
    });
    textures.forEach((tx) => tx.dispose());
    renderer.dispose();
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  };
}
