// Research world: one scroll-driven three.js scene. Every project is a place on a single
// thread (the question "how does intelligence develop?"). Scrolling travels the thread;
// selecting a place flies there and opens its story. No build step; three.js r160 is vendored.
import * as THREE from 'three';

const root = document.documentElement;
const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
let reduce = reduceMQ.matches;
reduceMQ.addEventListener?.('change', e => { reduce = e.matches; });

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const sections = $$('.station');
const navLinks = $$('#stations ol a');
const N = sections.length; // 6 places

/* ------------------------------------------------------------------ */
/* DOM behaviour that works with or without WebGL                     */
/* ------------------------------------------------------------------ */
const panel = $('#panel'), panelBody = $('.panel-body', panel), panelTitle = $('#panel-title');
let opener = null;
const NAMES = ['Question', 'Ember', 'The Search', 'WEB-CAD', 'In progress', 'Method'];

function anchorFor(i) {
  const s = sections[i];
  if (!s) return 0;
  if (i === 0) return 0;
  const top = s.offsetTop, h = s.offsetHeight, vh = innerHeight;
  return Math.max(0, top + h * 0.5 - vh * 0.5);
}
function go(i, { open = null } = {}) {
  closeMenu();
  const top = anchorFor(i);
  const id = sections[i].id;
  history.replaceState(null, '', '#' + id);
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  if (open) {
    const wait = reduce ? 0 : Math.min(1400, 300 + Math.abs(scrollY - top) * 0.25);
    setTimeout(() => openStory(open), wait);
  }
}
function openStory(id, from = document.activeElement) {
  const art = document.getElementById('story-' + id);
  if (!art || root.classList.contains('no-webgl')) return;
  opener = from;
  const clone = art.cloneNode(true);
  clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
  panelBody.innerHTML = clone.innerHTML;
  const idx = sections.findIndex(s => s.id === id);
  panelTitle.textContent = String(idx).padStart(2, '0') + ' · ' + NAMES[idx];
  panel.hidden = false;
  requestAnimationFrame(() => { panel.classList.add('is-open'); root.classList.add('panel-open'); });
  panelBody.scrollTop = 0;
  panelBody.focus({ preventScroll: true });
  state.panel = 1;
}
function closeStory() {
  if (panel.hidden) return;
  panel.classList.remove('is-open'); root.classList.remove('panel-open');
  state.panel = 0;
  setTimeout(() => { if (!panel.classList.contains('is-open')) panel.hidden = true; }, reduce ? 0 : 700);
  if (opener && opener.focus) opener.focus({ preventScroll: true });
}
$('.panel-close').addEventListener('click', closeStory);
addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeStory(); closeMenu(); }
});

const menuBtn = $('.hud-menu');
function closeMenu() { root.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false'); }
menuBtn.addEventListener('click', () => {
  const open = !root.classList.contains('menu-open');
  root.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
});

document.addEventListener('click', e => {
  const a = e.target.closest('[data-go],[data-open]');
  if (!a || root.classList.contains('no-webgl')) return;
  const openId = a.dataset.open;
  if (a.dataset.go !== undefined) {
    e.preventDefault();
    go(+a.dataset.go, { open: openId || null });
  } else if (openId) {
    e.preventDefault();
    openStory(openId, a);
  }
});

// the one authorship note lives in the footer; old text pages link to #authorship
function openAuthorship() { const d = $('#authorship'); if (d) { d.open = true; d.scrollIntoView({ block: 'end' }); } }
if (location.hash === '#authorship') addEventListener('load', () => setTimeout(openAuthorship, 50));
addEventListener('hashchange', () => { if (location.hash === '#authorship') openAuthorship(); });

// rail ticks
const ticks = $('.rail-ticks');
for (let i = 0; i < N; i++) { const t = document.createElement('i'); t.style.top = (i / (N - 1) * 100) + '%'; ticks.appendChild(t); }
const railFill = $('.rail-fill');

/* ------------------------------------------------------------------ */
/* WebGL                                                              */
/* ------------------------------------------------------------------ */
const state = { p: 0, target: 0, panel: 0, panelEase: 0, hover: -1 };
let renderer;
const canvas = $('#world');
try {
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) throw new Error('no webgl');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (err) {
  root.classList.add('no-webgl');
}

if (renderer) build();

function build() {
  const isSmall = () => innerWidth <= 760;
  let dpr = Math.min(devicePixelRatio || 1, isSmall() ? 2 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.021);
  const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.1, 400);

  /* ---- shared glow sprite ---- */
  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.18, 'rgba(255,255,255,.55)');
    r.addColorStop(0.5, 'rgba(255,255,255,.08)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const WHITE = new THREE.Color(0xffffff), ACCENT = new THREE.Color(0x8ea9ff), GREY = new THREE.Color(0x6a6a72);

  /* ---- the thread ---- */
  const S = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(15, -26, -9),
    new THREE.Vector3(-14, -52, 5),
    new THREE.Vector3(13, -78, 3),
    new THREE.Vector3(-10, -102, -7),
    new THREE.Vector3(0, -128, 0),
  ];
  const spine = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 22, -2), S[0],
    new THREE.Vector3(9, -13, -6), S[1],
    new THREE.Vector3(1, -40, -2), S[2],
    new THREE.Vector3(1, -65, 6), S[3],
    new THREE.Vector3(2, -90, -2), S[4],
    new THREE.Vector3(-4, -116, -4), S[5],
    new THREE.Vector3(0, -150, 0),
  ], false, 'centripetal');
  const uniforms = { uTime: { value: 0 }, uScale: { value: 450 } };
  const threadMat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uTime; varying vec2 vUv;
      void main(){
        float x=vUv.x;
        float pulse=pow(1.-fract(x*9.-uTime*.045),18.);
        float slow=pow(1.-fract(x*2.-uTime*.012),40.);
        float a=.20+pulse*.85+slow*.6;
        a*=smoothstep(0.,.03,x)*(1.-smoothstep(.95,1.,x));
        gl_FragColor=vec4(vec3(.92,.94,1.)*a,a);
      }`,
  });
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(spine, 900, 0.032, 5, false), threadMat));
  const haloMat = new THREE.MeshBasicMaterial({ color: 0x8ea9ff, transparent: true, opacity: 0.035, depthWrite: false, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(spine, 450, 0.22, 6, false), haloMat));

  /* ---- dust ---- */
  {
    const n = isSmall() ? 900 : 1700, pos = new Float32Array(n * 3), ph = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const r = 6 + Math.pow(Math.random(), 0.7) * 46, a = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = 26 - Math.random() * 186; pos[i * 3 + 2] = Math.sin(a) * r - 6;
      ph[i] = Math.random() * 100;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aPh', new THREE.BufferAttribute(ph, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: uniforms.uTime, uScale: uniforms.uScale, uTex: { value: glowTex } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `uniform float uTime; uniform float uScale; attribute float aPh; varying float vA;
        void main(){ vec3 p=position; p.y+=sin(uTime*.05+aPh)*.6; p.x+=cos(uTime*.04+aPh*1.3)*.5;
          vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
          gl_PointSize=uScale*(.2/-mv.z)*(1.+.5*sin(aPh)); vA=.35+.25*sin(uTime*.3+aPh*7.);
          vA*=smoothstep(110.,20.,-mv.z); }`,
      fragmentShader: `uniform sampler2D uTex; varying float vA; void main(){ vec4 t=texture2D(uTex,gl_PointCoord); gl_FragColor=vec4(t.rgb,1.)*t.a*vA; }`,
    });
    scene.add(new THREE.Points(g, m));
  }

  /* ---- helpers ---- */
  const labelLayer = $('#labels');
  const labels = [];
  function tag(text, obj, station, opts = {}) {
    const el = document.createElement('div');
    el.className = 'tag' + (opts.cls ? ' ' + opts.cls : '');
    el.textContent = text;
    labelLayer.appendChild(el);
    labels.push({ el, obj, station, min: opts.min ?? 0.45, maxY: opts.maxY ?? 1, phone: opts.phone ?? true, center: opts.center || null, offset: opts.offset || new THREE.Vector3(), left: (opts.cls || '').includes('left') });
    return el;
  }
  const lineMat = (o = 0.4, c = 0xffffff) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false });
  function sprite(size, color = WHITE, opacity = 1) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(size); return s;
  }
  const anchors = []; // invisible pick targets
  function pickTarget(group, radius, station) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 8), new THREE.MeshBasicMaterial({ visible: false }));
    m.userData.station = station; group.add(m); anchors.push(m);
  }
  const places = [];

  /* ==== 00 the question: a seed with four direction orbits ==== */
  {
    const g = new THREE.Group(); g.position.copy(S[0]); scene.add(g);
    const fitPhone = () => g.scale.setScalar(innerWidth <= 760 ? 0.62 : 1); fitPhone(); addEventListener('resize', fitPhone);
    const seed = sprite(3.4, WHITE, 0.95); g.add(seed);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    g.add(core);
    const names = ['Credit assignment', 'Learning from verified experience', 'Developmental environment', 'Adaptive compute'];
    const rings = [];
    names.forEach((nm, k) => {
      const R = 2.4 + k * 1.35, pts = [];
      for (let i = 0; i <= 160; i++) { const a = i / 160 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R)); }
      const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat(0.22 - k * 0.025));
      const holder = new THREE.Group(); holder.rotation.set(0.35 + k * 0.32, k * 0.9, 0.15 * k); holder.add(ring);
      const bead = sprite(0.9, k === 1 ? ACCENT : WHITE, 0.9); bead.position.set(R, 0, 0);
      const pivot = new THREE.Group(); pivot.add(bead); holder.add(pivot);
      g.add(holder);
      rings.push({ pivot, speed: 0.07 + 0.03 * (3 - k), bead });
      // on phones these repeat the Directions list just below, so they are hidden there; on desktop they stay above the text columns
      tag(String(k + 1).padStart(2, '0') + '  ' + nm, bead, 0, { min: 0.6, cls: k === 1 ? 'accent' : 'dim', maxY: 0.46, phone: false, center: g });
    });
    pickTarget(g, 3, 0);
    places.push({ group: g, update(t, f) { rings.forEach((r, k) => { r.pivot.rotation.y = t * r.speed + k * 1.7; }); seed.material.opacity = 0.55 + 0.4 * f; g.rotation.y = t * 0.01; } });
  }

  /* ==== 01 Ember: a chain of 33 kept hourly checkpoints and one refused candidate ==== */
  {
    const g = new THREE.Group(); g.position.copy(S[1]); scene.add(g);
    const K = 33, pts = [];
    for (let k = 0; k < K; k++) {
      const a = k * 0.52, r = 2.6 + k * 0.035;
      pts.push(new THREE.Vector3(Math.cos(a) * r, -6.2 + k * 0.40, Math.sin(a) * r));
    }
    const chain = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat(0.35));
    g.add(chain);
    const nodeGeo = new THREE.OctahedronGeometry(0.085, 0);
    const nodes = new THREE.InstancedMesh(nodeGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), K);
    const m4 = new THREE.Matrix4();
    pts.forEach((p, k) => { m4.makeTranslation(p.x, p.y, p.z); nodes.setMatrixAt(k, m4); nodes.setColorAt(k, WHITE); });
    g.add(nodes);
    // glow points for each node
    const gp = new Float32Array(K * 3); pts.forEach((p, k) => p.toArray(gp, k * 3));
    const ga = new Float32Array(K);
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(gp, 3)); gg.setAttribute('aA', new THREE.BufferAttribute(ga, 1));
    const gm = new THREE.ShaderMaterial({
      uniforms: { uTex: { value: glowTex }, uScale: uniforms.uScale }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aA; uniform float uScale; varying float vA; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; gl_PointSize=uScale*(1.1/-mv.z)*(.5+aA); vA=aA; }`,
      fragmentShader: `uniform sampler2D uTex; varying float vA; void main(){ vec4 t=texture2D(uTex,gl_PointCoord); gl_FragColor=vec4(t.rgb,1.)*t.a*(.25+vA); }`,
    });
    g.add(new THREE.Points(gg, gm));
    // refused candidate, drawn hollow and detached
    const last = pts[K - 1];
    const a = K * 0.52, cand = new THREE.Vector3(Math.cos(a) * 4.4, last.y + 0.7, Math.sin(a) * 4.4);
    const candMesh = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.34, 0)), lineMat(0.6, 0x9a9aa4));
    candMesh.position.copy(cand); g.add(candMesh);
    const dash = new THREE.Line(new THREE.BufferGeometry().setFromPoints([last, cand]), new THREE.LineDashedMaterial({ color: 0x9a9aa4, dashSize: 0.12, gapSize: 0.12, transparent: true, opacity: 0.6 }));
    dash.computeLineDistances(); g.add(dash);
    // axis
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -7.5, 0), new THREE.Vector3(0, 8.5, 0)]), lineMat(0.12)));
    const base = new THREE.Object3D(); base.position.copy(pts[0]); g.add(base);
    const top = new THREE.Object3D(); top.position.copy(cand); g.add(top);
    tag('33 hourly checkpoints kept · ≈6.06 B token positions', base, 1, { min: 0.5 });
    tag('Next checkpoint rejected · not kept', top, 1, { min: 0.5, cls: 'dim' });
    pickTarget(g, 7.5, 1);
    places.push({ group: g, update(t, f) {
      const head = (t * 5.2) % (K + 12);
      for (let k = 0; k < K; k++) { const d = head - k; ga[k] = 0.15 + (d >= 0 && d < 6 ? Math.exp(-d * 0.55) * 0.9 : 0) + f * 0.12; }
      gg.attributes.aA.needsUpdate = true;
      candMesh.rotation.y = t * 0.4; candMesh.rotation.x = t * 0.23;
      candMesh.material.opacity = 0.35 + 0.25 * (0.5 + 0.5 * Math.sin(t * 1.7));
      g.rotation.y = t * 0.035;
    } });
  }

  /* ==== 02 The Search: a random-action plane nothing rises through (schematic) ==== */
  {
    const g = new THREE.Group(); g.position.copy(S[2]); scene.add(g);
    const PLANE = 1.6, size = 15, div = 30;
    const grid = new THREE.GridHelper(size, div, 0xffffff, 0xffffff);
    grid.material.transparent = true; grid.material.opacity = 0.13; grid.material.depthWrite = false; grid.position.y = PLANE; g.add(grid);
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(size, size).rotateX(-Math.PI / 2)), lineMat(0.4));
    edge.position.y = PLANE; g.add(edge);
    const families = 14, per = 72, n = families * per;
    const pos = new Float32Array(n * 3), base = new Float32Array(n), ph = new Float32Array(n), fam = new Float32Array(n);
    let i = 0;
    for (let f = 0; f < families; f++) {
      const a = f / families * Math.PI * 2 + 0.2, r = 3.2 + (f % 3) * 1.25;
      const cx = Math.cos(a) * r, cz = Math.sin(a) * r, depth = -2.8 - Math.random() * 2.4;
      for (let k = 0; k < per; k++, i++) {
        const u = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * 0.85;
        pos[i * 3] = cx + Math.cos(u) * rr; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = cz + Math.sin(u) * rr;
        base[i] = depth - Math.random() * 1.6; ph[i] = Math.random() * 6.283; fam[i] = f;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aBase', new THREE.BufferAttribute(base, 1));
    geo.setAttribute('aPh', new THREE.BufferAttribute(ph, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: uniforms.uTime, uScale: uniforms.uScale, uTex: { value: glowTex }, uPlane: { value: PLANE }, uF: { value: 0 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `uniform float uTime; uniform float uScale; uniform float uPlane; uniform float uF; attribute float aBase; attribute float aPh; varying float vA;
        void main(){ vec3 p=position; float s=.5+.5*sin(uTime*(.35+fract(aPh)*.4)+aPh);
          float lift=pow(s,3.)*(uPlane-.14-aBase); p.y=aBase+lift;
          float near=1.-clamp((uPlane-p.y)/4.,0.,1.);
          vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
          gl_PointSize=uScale*(.62/-mv.z)*(.7+near*.8); vA=(.42+near*.9)*(.6+.4*uF); }`,
      fragmentShader: `uniform sampler2D uTex; varying float vA; void main(){ vec4 t=texture2D(uTex,gl_PointCoord); gl_FragColor=vec4(t.rgb,1.)*t.a*vA; }`,
    });
    g.add(new THREE.Points(geo, mat));
    const corner = new THREE.Object3D(); corner.position.set(size / 2, PLANE, size / 2); g.add(corner);
    const under = new THREE.Object3D(); under.position.set(-size / 2 + 0.5, -4.6, -1); g.add(under);
    tag('Random-action baseline', corner, 2, { min: 0.5 });
    tag('Schematic · 14 families · 1,000+ experiments', under, 2, { min: 0.5, cls: 'dim' });
    pickTarget(g, 8, 2);
    places.push({ group: g, update(t, f) { mat.uniforms.uF.value = f; g.rotation.y = t * 0.03 + 0.4; } });
  }

  /* ==== 03 WEB-CAD: a box/box boolean, the only kind of case the kernel was checked on ==== */
  {
    const g = new THREE.Group(); g.position.copy(S[3]); scene.add(g);
    const inner = new THREE.Group(); g.add(inner);
    const A = { c: new THREE.Vector3(-0.9, 0, 0), s: new THREE.Vector3(4, 4, 4) };
    const B = { c: new THREE.Vector3(1.2, 1.0, 0.7), s: new THREE.Vector3(3.4, 3.4, 3.4) };
    const boxEdges = (b, o) => { const m = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(b.s.x, b.s.y, b.s.z)), lineMat(o)); m.position.copy(b.c); return m; };
    inner.add(boxEdges(A, 0.55), boxEdges(B, 0.55));
    const min = new THREE.Vector3().copy(A.c).addScaledVector(A.s, -0.5).max(new THREE.Vector3().copy(B.c).addScaledVector(B.s, -0.5));
    const max = new THREE.Vector3().copy(A.c).addScaledVector(A.s, 0.5).min(new THREE.Vector3().copy(B.c).addScaledVector(B.s, 0.5));
    const I = { c: min.clone().add(max).multiplyScalar(0.5), s: max.clone().sub(min) };
    const fill = new THREE.Mesh(new THREE.BoxGeometry(I.s.x, I.s.y, I.s.z), new THREE.MeshBasicMaterial({ color: 0x8ea9ff, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending }));
    fill.position.copy(I.c); inner.add(fill);
    const iEdges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(I.s.x, I.s.y, I.s.z)), lineMat(0.95, 0x8ea9ff));
    iEdges.position.copy(I.c); inner.add(iEdges);
    // a NURBS-like surface beside it, dashed: its check was skipped
    const surf = new THREE.Group(); surf.position.set(6.2, -1.4, -1.5); g.add(surf);
    const dmat = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.1, gapSize: 0.14, transparent: true, opacity: 0.28 });
    const F = (u, v) => new THREE.Vector3(u * 4.2 - 2.1, Math.sin(u * 3.1) * 0.7 + Math.cos(v * 2.6) * 0.6, v * 4.2 - 2.1);
    for (let k = 0; k <= 10; k++) {
      const a = [], b = [];
      for (let j = 0; j <= 30; j++) { a.push(F(k / 10, j / 30)); b.push(F(j / 30, k / 10)); }
      for (const arr of [a, b]) { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(arr), dmat); l.computeLineDistances(); surf.add(l); }
    }
    const iTag = new THREE.Object3D(); iTag.position.copy(max); inner.add(iTag);
    const sTag = new THREE.Object3D(); sTag.position.set(2.1, 1.2, 2.1); surf.add(sTag);
    tag('Box ∩ box · 7 of 7 matched OpenCASCADE', iTag, 3, { min: 0.5, cls: 'accent' });
    tag('NURBS · check skipped', sTag, 3, { min: 0.5, cls: 'dim' });
    pickTarget(g, 6.5, 3);
    places.push({ group: g, update(t, f) { inner.rotation.y = t * 0.12; inner.rotation.x = 0.35 + Math.sin(t * 0.2) * 0.08; fill.material.opacity = 0.08 + 0.12 * f + 0.05 * Math.sin(t * 1.3); surf.rotation.y = -0.5 + Math.sin(t * 0.15) * 0.15; } });
  }

  /* ==== 04 In progress: a grid of heads scanned, none marked yet (schematic) ==== */
  {
    const g = new THREE.Group(); g.position.copy(S[4]); scene.add(g);
    const R = 12, C = 12, gap = 0.62;
    const cells = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.46, 0.46), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), R * C);
    const m4 = new THREE.Matrix4(), col = new THREE.Color();
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      m4.makeTranslation((c - (C - 1) / 2) * gap, (r - (R - 1) / 2) * gap, 0); cells.setMatrixAt(r * C + c, m4); cells.setColorAt(r * C + c, col.setScalar(0.06));
    }
    const holder = new THREE.Group(); holder.rotation.y = 0.55; holder.add(cells); g.add(holder);
    const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(C * gap + 0.4, R * gap + 0.4)), lineMat(0.3)); holder.add(frame);
    const scan = new THREE.Mesh(new THREE.PlaneGeometry(0.05, R * gap + 0.8), new THREE.MeshBasicMaterial({ color: 0x8ea9ff, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
    scan.position.z = 0.02; holder.add(scan);
    const tl = new THREE.Object3D(); tl.position.set(-(C * gap) / 2 - 0.2, (R * gap) / 2 + 0.6, 0); holder.add(tl);
    const br = new THREE.Object3D(); br.position.set((C * gap) / 2 + 0.2, -(R * gap) / 2 - 0.5, 0); holder.add(br);
    tag('Schematic · attention heads, read from weights', tl, 4, { min: 0.5, cls: 'dim' });
    tag('Prediction not yet committed · no result', br, 4, { min: 0.5 });
    pickTarget(g, 5.5, 4);
    places.push({ group: g, update(t, f) {
      const x = ((t * 0.18) % 1.4 - 0.2) * C; // column position
      scan.position.x = (x - (C - 1) / 2) * gap;
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        const d = c - x, v = 0.05 + 0.04 * f + 0.42 * Math.exp(-d * d * 0.8) * (0.6 + 0.4 * Math.sin(r * 2.1 + c * 1.3));
        cells.setColorAt(r * C + c, col.setScalar(v));
      }
      cells.instanceColor.needsUpdate = true;
      holder.rotation.y = 0.55 + Math.sin(t * 0.12) * 0.12;
    } });
  }

  /* ==== 05 Method: the record, a stack of plates the thread ends in ==== */
  {
    const g = new THREE.Group(); g.position.copy(S[5]); scene.add(g);
    const plates = [];
    for (let k = 0; k < 15; k++) {
      const p = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(6, 0.02, 4)), lineMat(0.42 - k * 0.024));
      p.position.y = 3.4 - k * 0.5; g.add(p); plates.push(p);
    }
    const topTag = new THREE.Object3D(); topTag.position.set(3, 3.8, 2); g.add(topTag);
    tag('Every number traces to a run', topTag, 5, { min: 0.5, phone: false });
    pickTarget(g, 5, 5);
    places.push({ group: g, update(t, f) { plates.forEach((p, k) => { p.rotation.y = Math.sin(t * 0.12 + k * 0.09) * 0.5 + k * 0.035; }); } });
  }

  /* ---- camera path ---- */
  const camPts = [], tgtPts = [];
  const OFF = [
    { d: 30, a: 0.0, h: 1.5, ty: -0.4 },
    { d: 31, a: 0.55, h: 4.0, ty: 0.6 },
    { d: 26, a: -0.65, h: 3.4, ty: -1.2 },
    { d: 23, a: 0.6, h: 3.0, ty: 0.4 },
    { d: 21, a: -0.35, h: 1.2, ty: 0.0 },
    { d: 25, a: 0.25, h: 7.5, ty: -0.6 },
  ];
  S.forEach((s, i) => {
    const o = OFF[i];
    camPts.push(new THREE.Vector3(s.x + Math.sin(o.a) * o.d, s.y + o.h, s.z + Math.cos(o.a) * o.d));
    tgtPts.push(new THREE.Vector3(s.x, s.y + o.ty, s.z));
  });
  const camCurve = new THREE.CatmullRomCurve3(camPts, false, 'centripetal');
  const tgtCurve = new THREE.CatmullRomCurve3(tgtPts, false, 'centripetal');
  const camPos = new THREE.Vector3(), camTgt = new THREE.Vector3();

  /* ---- scroll → progress ---- */
  let anchors_ = [];
  function measure() { anchors_ = sections.map((_, i) => anchorFor(i)); }
  function progressFromScroll() {
    const y = scrollY;
    if (y <= anchors_[0]) return 0;
    for (let i = 0; i < N - 1; i++) {
      const a = anchors_[i], b = anchors_[i + 1];
      if (y < b) { const u = (y - a) / Math.max(1, b - a); return i + smooth(u); }
    }
    return N - 1;
  }
  // dwell: hold near each station, travel between
  const smooth = u => { const k = Math.min(1, Math.max(0, (u - 0.18) / 0.64)); return k * k * (3 - 2 * k); };

  /* ---- resize & view offset ---- */
  const view = { x: 0, y: 0, tx: 0, ty: 0 };
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.fov = w <= 760 ? 50 : 36;
    uniforms.uScale.value = renderer.domElement.height * 0.5 / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * 0.36;
    camera.updateProjectionMatrix();
    measure();
  }
  function viewTarget() {
    const w = innerWidth, h = innerHeight;
    if (w <= 760) { view.tx = 0; view.ty = state.p < 0.6 ? h * 0.35 : h * 0.2; return; }
    view.ty = 0;
    const base = -w * 0.17, withPanel = w > 1100 ? w * 0.12 : 0;
    // the first screen keeps the seed high and right, above the two text columns
    view.tx = state.panelEase > 0.5 ? withPanel : base;
    if (state.p < 0.5 && !state.panel) view.ty = h * 0.12 * (1 - state.p * 2);
  }
  addEventListener('resize', resize);
  resize();

  /* ---- picking ---- */
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let ptrDirty = false, ptrEvt = null;
  canvas.addEventListener('pointermove', e => { ptrEvt = e; ptrDirty = true; });
  canvas.addEventListener('pointerleave', () => { state.hover = -1; canvas.style.cursor = ''; });
  function pick(e) {
    const r = canvas.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObjects(anchors, false)[0];
    return hit ? hit.object.userData.station : -1;
  }
  const STORY = [null, 'ember', 'the-search', 'web-cad', null, null];
  canvas.addEventListener('click', e => {
    const s = pick(e);
    if (s < 0) { if (innerWidth > 760) closeStory(); return; }
    if (state.panel && innerWidth <= 760) return;
    go(s, { open: STORY[s] });
  });

  /* ---- loop ---- */
  let last = performance.now(), t = 0, frames = 0, slow = 0, running = true, scheduled = false;
  // idle: after 5 s with no input and nothing settling, drop to about 4 fps (battery)
  let lastActive = performance.now();
  const wake = () => { lastActive = performance.now(); };
  ['scroll', 'pointermove', 'pointerdown', 'wheel', 'touchstart', 'keydown', 'resize'].forEach(ev => addEventListener(ev, wake, { passive: true }));
  function schedule() {
    if (scheduled || !running) return;
    scheduled = true;
    const idle = performance.now() - lastActive > 5000 && Math.abs(state.target - state.p) < 1e-3 && Math.abs(state.panel - state.panelEase) < 1e-3;
    if (idle) setTimeout(() => requestAnimationFrame(f), 250); else requestAnimationFrame(f);
    function f(now) { scheduled = false; frame(now); }
  }
  const v = new THREE.Vector3(), cv = new THREE.Vector3();
  state.p = state.target = progressFromScroll();
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!reduce) t += dt;
    uniforms.uTime.value = t;

    state.target = progressFromScroll();
    if (!Number.isFinite(state.target)) state.target = 0;
    if (!Number.isFinite(state.p)) state.p = state.target;
    state.p = reduce ? state.target : state.p + (state.target - state.p) * (1 - Math.exp(-dt * 3.0));
    state.panelEase += (state.panel - state.panelEase) * (reduce ? 1 : 1 - Math.exp(-dt * 4));
    const u = Math.min(1, Math.max(0, state.p / (N - 1)));
    camCurve.getPoint(u, camPos); tgtCurve.getPoint(u, camTgt);
    if (!reduce) { camPos.x += Math.sin(t * 0.21) * 0.35; camPos.y += Math.sin(t * 0.17) * 0.25; }
    camera.position.copy(camPos); camera.lookAt(camTgt);

    viewTarget();
    const k = reduce ? 1 : 1 - Math.exp(-dt * 3.5);
    view.x += (view.tx - view.x) * k; view.y += (view.ty - view.y) * k;
    camera.setViewOffset(innerWidth, innerHeight, view.x, view.y, innerWidth, innerHeight);

    const focus = i => Math.max(0, 1 - Math.abs(state.p - i) * 1.35);
    places.forEach((pl, i) => pl.update(t, Math.min(1, focus(i) + (state.hover === i ? 0.4 : 0))));

    if (ptrDirty && ptrEvt) {
      ptrDirty = false; const s = pick(ptrEvt); state.hover = s;
      canvas.style.cursor = s >= 0 ? 'pointer' : '';
      canvas.title = s >= 0 ? (STORY[s] ? 'Open ' + NAMES[s] : NAMES[s]) : '';
    }

    renderer.render(scene, camera);

    // labels after render so matrices are current
    const w = innerWidth, h = innerHeight;
    for (const L of labels) {
      const f = focus(L.station);
      const phoneHide = !L.phone && w <= 760;
      const o = (f < L.min || phoneHide) ? 0 : Math.min(1, (f - L.min) / 0.25) * (state.panelEase > 0.5 && w <= 1100 ? 0 : 1);
      if (o <= 0.001) { if (L.el.style.opacity !== '0') L.el.style.opacity = '0'; continue; }
      L.obj.getWorldPosition(v); v.project(camera);
      if (v.z > 1) { L.el.style.opacity = '0'; continue; }
      const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
      const lw = L.w || (L.w = L.el.offsetWidth || 200);
      let flip = x + 10 + lw > w - (w > 760 ? 70 : 12);
      if (L.center) { L.center.getWorldPosition(cv); cv.project(camera); if (x < (cv.x * 0.5 + 0.5) * w) flip = true; }
      const edge = Math.min(1, Math.max(0, (y - 96) / 40), Math.max(0, (h - 24 - y) / 40));
      L.el.classList.toggle('left', flip);
      L.el.style.opacity = (o * edge).toFixed(3);
      const tx = flip ? x - 10 - lw : x + 10;
      // never let a label land on the text column
      if (tx < 8 || y > h * L.maxY || (L.center && w > 760 && tx < w * 0.42)) { L.el.style.opacity = '0'; continue; }
      L.el.style.transform = `translate3d(${tx.toFixed(1)}px,${(y - 7).toFixed(1)}px,0)`;
    }

    // nav state + rail
    const near = Math.round(state.target);
    navLinks.forEach((a, i) => a.setAttribute('aria-current', i === near ? 'true' : 'false'));
    if (root.dataset.at !== String(near)) root.dataset.at = near;
    railFill.style.height = (state.p / (N - 1) * 100).toFixed(2) + '%';

    // adaptive resolution for weak GPUs
    if (++frames < 150 && frames > 30) { if (dt > 0.024) slow++; if (frames === 149 && slow > 60 && dpr > 1) { dpr = 1; renderer.setPixelRatio(1); resize(); } }

    if (frames === 2) root.classList.add('ready');
    schedule();
  }
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { last = performance.now(); wake(); schedule(); }
  });
  addEventListener('load', measure);
  document.fonts?.ready.then(measure);

  // deep link: #ember etc.
  const startIdx = sections.findIndex(s => '#' + s.id === location.hash);
  if (startIdx > 0) { measure(); scrollTo(0, anchorFor(startIdx)); state.p = startIdx; }
  schedule();
}
