// A dark world that has detail only where it has been visited.
// Entry: text on black. Scrolling carries the reader through the letters into the dark, where three
// territories wait as faint point clouds. Flying near one resolves it; landing turns it into the thing
// itself. Every point is a record: a training step, an experiment, a vertex of a real building.
// No build step; three.js r160 is vendored in world/vendor.
import * as THREE from 'three';

const root = document.documentElement;
const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
let reduce = reduceMQ.matches;
reduceMQ.addEventListener?.('change', e => { reduce = e.matches; });
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const isSmall = () => innerWidth <= 760;
const fmt = n => Math.round(n).toLocaleString('en-US');

/* ------------------------------------------------------------------ */
/* DOM: index, stories, panel (works with or without WebGL)            */
/* ------------------------------------------------------------------ */
const panel = $('#panel'), panelBody = $('.panel-body', panel), panelTitle = $('#panel-title');
const NAMES = { ember: 'Ember', 'the-search': 'The Search', 'web-cad': 'WEB-CAD', 'in-progress': 'In progress', method: 'Method', question: 'Question' };
const NUM = { question: '00', ember: '01', 'the-search': '02', 'web-cad': '03', 'in-progress': '04', method: '05' };
let opener = null;
const state = { entered: 0, p: 0, panel: 0, panelEase: 0, landed: null, mode: 'approach', hover: null };

function openStory(id, from = document.activeElement) {
  const art = document.getElementById('story-' + id) || document.getElementById('plate-' + id);
  if (!art) return;
  opener = from;
  const clone = art.cloneNode(true);
  clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
  clone.querySelectorAll('.open').forEach(n => n.remove());
  panelBody.innerHTML = clone.innerHTML;
  panelTitle.textContent = (NUM[id] || '') + ' · ' + (NAMES[id] || id);
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
window.__openStory = openStory;
document.addEventListener('click', e => {
  const f = e.target.closest('.fly-btn'); if (f) { window.__world?.goTo(f.dataset.fly, false); return; }
  const st = e.target.closest('.story-btn'); if (st) openStory(st.dataset.story, st);
});

const menuBtn = $('.hud-menu');
function closeMenu() { root.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false'); }
menuBtn.addEventListener('click', () => {
  const open = !root.classList.contains('menu-open');
  root.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
});

// the one authorship note lives in the footer; old pages link to #authorship
function openAuthorship() { const d = $('#authorship'); if (d) { d.open = true; d.scrollIntoView({ block: 'end' }); } }
if (location.hash === '#authorship') addEventListener('load', () => setTimeout(openAuthorship, 50));
addEventListener('hashchange', () => { if (location.hash === '#authorship') openAuthorship(); });

/* ------------------------------------------------------------------ */
/* WebGL                                                              */
/* ------------------------------------------------------------------ */
let renderer;
const canvas = $('#world');
try {
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) throw new Error('no webgl');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
} catch (err) {
  root.classList.add('no-webgl');
}

// without WebGL every place is a plain section and the index just scrolls to it
document.addEventListener('click', e => {
  const a = e.target.closest('[data-place]');
  if (!a) return;
  const id = a.dataset.place;
  if (root.classList.contains('no-webgl')) return; // normal anchor
  e.preventDefault(); closeMenu();
  if (window.__world) window.__world.goTo(id, a.dataset.land === 'true');
});
addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (state.landed) window.__world?.takeOff(); else { closeStory(); closeMenu(); } }
});

if (renderer) build();

async function build() {
  let dpr = Math.min(devicePixelRatio || 1, isSmall() ? 2 : 1.5);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 1);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.0021);
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.2, 1200);

  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.36, 'rgba(255,255,255,.9)');
    r.addColorStop(0.7, 'rgba(255,255,255,.12)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const uniforms = { uTime: { value: 0 }, uScale: { value: 450 }, uCam: { value: new THREE.Vector3() } };

  /* ---- one shader for every cloud: brightness = ghost + seen, size by distance ---- */
  const cloudMaterial = (opts = {}) => new THREE.ShaderMaterial({
    uniforms: { uTime: uniforms.uTime, uScale: uniforms.uScale, uTex: { value: glowTex }, uCam: uniforms.uCam,
      uGhost: { value: opts.ghost ?? 0.11 }, uSize: { value: opts.size ?? 1.0 }, uFocus: { value: 0 }, uFade: { value: 1 }, uTint: { value: new THREE.Color(opts.tint ?? 0xffffff) }, uAccent: { value: new THREE.Color(0x8ea9ff) } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      uniform float uScale; uniform float uSize; uniform float uGhost; uniform float uFocus; uniform float uFade; uniform vec3 uCam;
      attribute float aSeen; attribute float aW; attribute float aK;
      varying float vA; varying float vK;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.);
        gl_Position = projectionMatrix * mv;
        float d = -mv.z;
        gl_PointSize = clamp(uScale * (uSize * (0.35 + 0.65 * aW) / d), 1.9, 9.0);
        float seen = max(aSeen, uFocus);
        vA = (uGhost + seen * (0.6 + 0.4 * aW)) * mix(0.5, 1.0, smoothstep(1200., 30., d)) * uFade;
        vK = aK;
      }`,
    fragmentShader: `
      uniform sampler2D uTex; uniform vec3 uTint; uniform vec3 uAccent;
      varying float vA; varying float vK;
      void main(){
        vec4 t = texture2D(uTex, gl_PointCoord);
        vec3 c = mix(uTint, uAccent, clamp(vK, 0., 1.));
        gl_FragColor = vec4(c, 1.) * t.a * vA;
      }`,
  });

  // reveal: a point is seen once the camera has come near it; it stays seen
  const clouds = [];
  function makeCloud(id, pos, w, k, opts) {
    const n = pos.length / 3;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aW', new THREE.BufferAttribute(w, 1));
    g.setAttribute('aK', new THREE.BufferAttribute(k, 1));
    const seen = new Float32Array(n);
    g.setAttribute('aSeen', new THREE.BufferAttribute(seen, 1));
    g.computeBoundingSphere();
    const mat = cloudMaterial(opts);
    const pts = new THREE.Points(g, mat);
    pts.frustumCulled = false;
    const c = { id, points: pts, geo: g, mat, seen, n, cursor: 0, revealed: 0, radius: opts.radius ?? 60, reach: opts.reach ?? 26, group: new THREE.Group() };
    c.group.add(pts); scene.add(c.group);
    clouds.push(c);
    return c;
  }
  const _lp = new THREE.Vector3();
  function reveal(c, camPos, dt) {
    c.group.updateMatrixWorld();
    const inv = new THREE.Matrix4().copy(c.group.matrixWorld).invert();
    _lp.copy(camPos).applyMatrix4(inv);
    const bs = c.geo.boundingSphere;
    if (_lp.distanceTo(bs.center) > bs.radius + c.reach * 1.2) return;
    const pos = c.geo.attributes.position.array, seen = c.seen;
    const budget = Math.min(c.n, isSmall() ? 12000 : 40000);
    const r2 = c.reach * c.reach;
    let changed = false, add = 0;
    for (let i = 0; i < budget; i++) {
      const j = (c.cursor + i) % c.n;
      const dx = pos[j * 3] - _lp.x, dy = pos[j * 3 + 1] - _lp.y, dz = pos[j * 3 + 2] - _lp.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < r2) {
        const v = 1 - Math.sqrt(d2) / c.reach;
        const s = Math.min(1, seen[j] + v * dt * 2.2);
        if (s > seen[j]) { if (seen[j] < 0.5 && s >= 0.5) add++; seen[j] = s; changed = true; }
      }
    }
    c.cursor = (c.cursor + budget) % c.n;
    c.revealed += add;
    if (changed) c.geo.attributes.aSeen.needsUpdate = true;
  }

  /* ---- data ---- */
  const DATA = 'world/data/';
  async function bin(name, stride) {
    const b = await (await fetch(DATA + name)).arrayBuffer();
    return new Float32Array(b);
  }
  const [emberMeta, emberBin, replay, searchJson, webcadMeta, webcadBin] = await Promise.all([
    fetch(DATA + 'ember-meta.json').then(r => r.json()),
    bin('ember-steps.bin'),
    fetch(DATA + 'ember-replay.json').then(r => r.json()),
    fetch(DATA + 'search-experiments.json').then(r => r.json()).catch(() => null),
    fetch(DATA + 'webcad-meta.json').then(r => r.json()),
    bin('webcad-points.bin'),
  ]);

  /* ---- world layout ---- */
  // the text plane is at z = 0; the reader starts at z = +60 and moves toward -z
  const SITES = {
    ember: { center: new THREE.Vector3(-70, -24, -260), label: 'Ember', line: 'every point is one training step: its loss and its speed' },
    'the-search': { center: new THREE.Vector3(85, 18, -380), label: 'The Search', line: 'every point is one experiment; the line is where the search went' },
    'web-cad': { center: new THREE.Vector3(-10, 6, -540), label: 'WEB-CAD', line: 'every point is a vertex of a real building file' },
  };

  let letters = null;
  const plate0 = $('#question .plate'), transit = $('.transit');
  /* ==== the letters: the thesis sentence sampled into points ==== */
  {
    const c = document.createElement('canvas'); c.width = 1400; c.height = 420;
    const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '400 118px "GFS Didot", Didot, Georgia, serif';
    g.fillText('How does', 700, 120); g.fillText('intelligence develop?', 700, 290);
    const img = g.getImageData(0, 0, c.width, c.height).data;
    const pos = [], w = [], k = [];
    const step = isSmall() ? 3 : 2;
    for (let y = 0; y < c.height; y += step) for (let x = 0; x < c.width; x += step) {
      if (img[(y * c.width + x) * 4] > 128 && Math.random() < 0.55) {
        pos.push((x - 700) * 0.055 + (Math.random() - .5) * .08, (210 - y) * 0.055 + (Math.random() - .5) * .08, (Math.random() - .5) * 6);
        w.push(0.4 + Math.random() * 0.6); k.push(0);
      }
    }
    const cl = makeCloud('letters', new Float32Array(pos), new Float32Array(w), new Float32Array(k), { ghost: 0.0, size: 0.75, reach: 30, radius: 40 });
    cl.points.position.set(0, 0, 0);
    // the letters are fully "seen" from the start; they are the first thing, not a territory
    cl.seen.fill(1); cl.geo.attributes.aSeen.needsUpdate = true;
    cl.isLetters = true;
    letters = cl;
  }

  /* ==== dust between the territories (not data; drawn far dimmer than any record) ==== */
  {
    const n = isSmall() ? 1500 : 3500, pos = new Float32Array(n * 3), w = new Float32Array(n), k = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - .5) * 420; pos[i * 3 + 1] = (Math.random() - .5) * 160; pos[i * 3 + 2] = -40 - Math.random() * 620;
      w[i] = Math.random() * 0.4;
    }
    const d = makeCloud('dust', pos, w, k, { ghost: 0.03, size: 0.28, reach: 0 });
    d.isDust = true;
  }

  /* ==== 01 Ember: a plane of training steps. x = time through the kept lineage, z = hour lane, y = loss ==== */
  const ember = {};
  {
    const f = emberBin, n = f.length / 5;
    const hours = emberMeta.hours, onH = hours.filter(h => h.on_lineage).length;
    const pos = new Float32Array(n * 3), w = new Float32Array(n), k = new Float32Array(n);
    // lineage hours lie along x in order; off-lineage hours sit behind, dimmer, on a parallel band
    const W = 150, D = 34;
    let lossMin = 9, lossMax = 0, pMax = 0;
    for (let i = 0; i < n; i++) { const l = f[i * 5 + 2]; if (l < lossMin) lossMin = l; if (l > lossMax) lossMax = l; pMax = Math.max(pMax, f[i * 5 + 3]); }
    lossMax = Math.min(lossMax, 6);
    for (let i = 0; i < n; i++) {
      const hi = f[i * 5], si = f[i * 5 + 1], loss = f[i * 5 + 2], pps = f[i * 5 + 3], on = f[i * 5 + 4];
      const h = hours[hi];
      const u = si / Math.max(1, h.measured_updates);
      const lane = on ? hi / Math.max(1, onH - 1) : 0.5 + (hi - onH) / Math.max(1, hours.length - onH) * 0.5;
      const x = on ? (lane * W - W / 2) + (u - 0.5) * (W / onH) : (lane * W - W / 2) + (u - 0.5) * (W / 24);
      const z = on ? (u - 0.5) * D * 0.3 : -D * 1.1 - Math.random() * 6;
      const y = (Math.min(loss, 6) - lossMin) / (lossMax - lossMin) * 14 - 2;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      w[i] = on ? Math.min(1, pps / 90000) : 0.15;
      k[i] = on ? Math.min(1, pps / 100000) * 0.35 : 0;
    }
    const c = makeCloud('ember', pos, w, k, { ghost: 0.3, size: 1.0, reach: 40, radius: 90 });
    c.group.position.copy(SITES.ember.center);
    c.group.rotation.y = 0.35;
    ember.cloud = c;
    // the hour boundaries as hairlines on the ground, and the target as one line above the plane
    const lines = [];
    for (let hi = 0; hi < onH; hi++) {
      const x = hi / Math.max(1, onH - 1) * W - W / 2 - W / onH / 2;
      lines.push(new THREE.Vector3(x, -2.4, -D * 0.2), new THREE.Vector3(x, -2.4, D * 0.2));
    }
    const lg = new THREE.BufferGeometry().setFromPoints(lines);
    c.group.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, depthWrite: false })));
    ember.site = SITES.ember;
  }

  /* ==== 02 The Search: experiments as a cloud in time; the line is the route the search took ==== */
  const search = { exps: [], stages: [] };
  if (searchJson) {
    const exps = searchJson.experiments.slice().sort((a, b) => a.step - b.step);
    const stages = searchJson.stages;
    const nE = exps.length, nS = stages.length + searchJson.headings.length;
    const n = nE + nS;
    const pos = new Float32Array(n * 3), w = new Float32Array(n), k = new Float32Array(n);
    const KILL = /KILL|FAIL|FLAT|HOLLOW|STARV|NO-GO|WALL|EXHAUST|FIRES|VACUOUS|➖/i, PASS = /PASS|LIFT|baseline|✅/i;
    const classify = s => KILL.test(s) ? 'kill' : PASS.test(s) ? 'pass' : 'open';
    // Era I: a helix climbing with step number; each turn ~ 60 steps
    const s0 = exps[0]?.step || 0, s1 = exps[nE - 1]?.step || 1;
    exps.forEach((e, i) => {
      const u = (e.step - s0) / Math.max(1, s1 - s0);
      const a = u * Math.PI * 2 * 12 + (Math.random() - .5) * .25, r = 26 - u * 10 + (Math.random() - .5) * 5;
      const x = Math.cos(a) * r, z = Math.sin(a) * r - 20, y = u * 44 - 30 + (Math.random() - .5) * 2.5;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      const cls = classify(e.title);
      w[i] = cls === 'pass' ? 1 : cls === 'kill' ? 0.55 : 0.4; k[i] = cls === 'pass' ? 0.9 : 0;
      search.exps.push({ ...e, cls, i });
    });
    // Era II: the reach ladder and four faces climb a separate column that ends in the air
    const eraII = [...stages.map(s => ({ kind: 'stage', id: s.id, text: s.variable, result: s.result, status: s.status })),
      ...searchJson.headings.map(h => ({ kind: 'heading', id: h.heading.split(' — ')[0].slice(0, 28), text: h.heading, result: h.verdict, status: h.verdict }))];
    eraII.forEach((s, j) => {
      const i = nE + j, u = j / Math.max(1, eraII.length - 1);
      const x = 30 + u * 26 + (Math.random() - .5) * 3, y = 16 + u * 22 + (Math.random() - .5) * 2, z = 10 - u * 30 + (Math.random() - .5) * 3;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      const cls = classify(s.status + ' ' + s.result);
      w[i] = cls === 'pass' ? 1 : 0.6; k[i] = cls === 'pass' ? 1 : 0;
      search.stages.push({ ...s, cls, i });
    });
    const c = makeCloud('the-search', pos, w, k, { ghost: 0.42, size: 2.6, reach: 34, radius: 70 });
    c.group.position.copy(SITES['the-search'].center);
    search.cloud = c;
    // the route: Era I spiral -> 1h -> 1i -> 1j -> 1k -> F1 -> F2 (kill) -> F3 Part A (fail), ends there
    const order = ['1h', '1i', '1j', '1k', 'F1', 'F2', 'F3'];
    const route = [];
    const last = exps[nE - 1]; if (last) route.push(new THREE.Vector3(pos[last.i * 3], pos[last.i * 3 + 1], pos[last.i * 3 + 2]));
    order.forEach(id => { const s = search.stages.find(s => s.kind === 'stage' && s.id.startsWith(id)); if (s) route.push(new THREE.Vector3(pos[s.i * 3], pos[s.i * 3 + 1], pos[s.i * 3 + 2])); });
    if (route.length > 2) {
      const curve = new THREE.CatmullRomCurve3(route, false, 'centripetal');
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 200, 0.09, 5, false), new THREE.MeshBasicMaterial({ color: 0x8ea9ff, transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending }));
      c.group.add(tube); search.route = tube;
      // the end: a hollow mark where the last gate failed
      const end = route[route.length - 1];
      const mark = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.OctahedronGeometry(1.6, 0)), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
      mark.position.copy(end); c.group.add(mark); search.endMark = mark; search.end = end;
    }
    search.site = SITES['the-search'];
  }

  /* ==== 03 WEB-CAD: the vertices of two real IFC buildings shipped with the tool ==== */
  const webcad = {};
  {
    const f = webcadBin, n = f.length / 4;
    const pos = new Float32Array(n * 3), w = new Float32Array(n), k = new Float32Array(n);
    const bb = webcadMeta.bbox; const cx = (bb[0] + bb[3]) / 2, cy = (bb[1] + bb[4]) / 2, cz = (bb[2] + bb[5]) / 2;
    const s = 0.55;
    for (let i = 0; i < n; i++) {
      // IFC is z-up; the world is y-up
      pos[i * 3] = (f[i * 4] - cx) * s; pos[i * 3 + 1] = (f[i * 4 + 2] - cz) * s; pos[i * 3 + 2] = -(f[i * 4 + 1] - cy) * s;
      w[i] = 0.5 + 0.5 * f[i * 4 + 3]; k[i] = 0;
    }
    const c = makeCloud('web-cad', pos, w, k, { ghost: 0.3, size: 1.1, reach: 30, radius: 70 });
    c.group.position.copy(SITES['web-cad'].center);
    c.group.rotation.y = -0.5;
    webcad.cloud = c; webcad.site = SITES['web-cad'];
  }

  /* ---- labels (HTML, projected) ---- */
  const labelLayer = $('#labels'), labels = [];
  function tag(text, pos, opts = {}) {
    const el = document.createElement('div');
    el.className = 'tag' + (opts.cls ? ' ' + opts.cls : '');
    el.textContent = text; labelLayer.appendChild(el);
    const L = { el, pos, near: opts.near ?? 160, far: opts.far ?? 700, cloud: opts.cloud || null, dy: opts.dy || 0 };
    labels.push(L); return L;
  }
  for (const [id, s] of Object.entries(SITES)) {
    const c = clouds.find(c => c.id === id);
    tag(s.label, s.center.clone().add(new THREE.Vector3(0, 26, 0)), { cls: 'place', near: 500, far: 900, cloud: c });
    tag(s.line, s.center.clone().add(new THREE.Vector3(0, 22, 0)), { cls: 'dim line', near: 140, far: 260, cloud: c });
  }

  /* ---- the bird ---- */
  const bird = new THREE.Group(); scene.add(bird);
  {
    // a small cloud of points in the shape of a gliding bird, drawn from a few strokes
    const pts = [];
    const stroke = (a, b, n, jitter) => { for (let i = 0; i < n; i++) { const t = i / (n - 1); pts.push(a.x + (b.x - a.x) * t + (Math.random() - .5) * jitter, a.y + (b.y - a.y) * t + (Math.random() - .5) * jitter, a.z + (b.z - a.z) * t + (Math.random() - .5) * jitter); } };
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    stroke(V(0, 0, -0.9), V(0, 0, 0.9), 40, 0.08);           // body, head toward -z (forward)
    stroke(V(0, 0, -0.1), V(2.4, 0.5, 0.4), 60, 0.1);        // wings, swept back
    stroke(V(0, 0, -0.1), V(-2.4, 0.5, 0.4), 60, 0.1);
    stroke(V(2.4, 0.5, 0.4), V(1.5, 0.3, 0.9), 20, 0.08);
    stroke(V(-2.4, 0.5, 0.4), V(-1.5, 0.3, 0.9), 20, 0.08);
    stroke(V(0, 0, 0.9), V(0.5, 0.05, 1.5), 12, 0.06); stroke(V(0, 0, 0.9), V(-0.5, 0.05, 1.5), 12, 0.06); // tail
    const birdBase = new Float32Array(pts);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    bird.userData.base = birdBase; bird.userData.geo = g;
    const m = new THREE.PointsMaterial({ map: glowTex, size: 0.13, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffffff, sizeAttenuation: true });
    bird.add(new THREE.Points(g, m));
    bird.visible = false; bird.userData.mat = m;
  }

  /* ---- flight state ---- */
  const fly = { pos: new THREE.Vector3(0, 0, 60), yaw: 0, pitch: 0, speed: 0, vyaw: 0, vpitch: 0, steerX: 0, steerY: 0, auto: true, lastInput: performance.now(), tourT: 0 };
  const dir = new THREE.Vector3(), tmpV = new THREE.Vector3(), tmpQ = new THREE.Quaternion();
  const hudHint = $('.hint'), landBtn = $('.land'), takeoffBtn = $('.takeoff'), prompt = $('.prompt');

  // approach path: through the letters, then a turn toward the three territories
  const approach = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 60), new THREE.Vector3(0, 0, 22), new THREE.Vector3(0, 0, -2), new THREE.Vector3(2, 1, -40),
    new THREE.Vector3(-6, 4, -95), new THREE.Vector3(0, 8, -150),
  ], false, 'centripetal');
  const approachLook = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -10), new THREE.Vector3(0, 0, -40), new THREE.Vector3(2, 0, -120),
    new THREE.Vector3(-10, -2, -240), new THREE.Vector3(0, -2, -330),
  ], false, 'centripetal');
  // the tour: an autopilot that visits the three territories so a reader who never touches anything sees them resolve
  const tour = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 8, -150), new THREE.Vector3(-40, 2, -215), new THREE.Vector3(-85, -6, -262), new THREE.Vector3(-60, 4, -310),
    new THREE.Vector3(20, 22, -350), new THREE.Vector3(80, 30, -372), new THREE.Vector3(110, 26, -410), new THREE.Vector3(60, 22, -460),
    new THREE.Vector3(-10, 16, -520), new THREE.Vector3(-34, 10, -548), new THREE.Vector3(-20, 14, -590), new THREE.Vector3(40, 24, -520),
    new THREE.Vector3(60, 20, -400), new THREE.Vector3(-20, 10, -300), new THREE.Vector3(0, 8, -150),
  ], true, 'centripetal');
  const TOUR_SECONDS = 75;

  /* ---- input: scroll approaches, then throttles; the pointer steers; keys too ---- */
  const spacer = $('.spacer');
  // on a phone the entry plate is taller than the screen: the approach starts only once the plate
  // (directions and the three works) is mostly scrolled through, so it is read before it fades
  const qSec = $('#question');
  function approachStart() { return isSmall() ? Math.max(0, qSec.offsetTop + qSec.offsetHeight - innerHeight * 0.3) : 0; }
  function approachProgress() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight), s = Math.min(approachStart(), max - 1);
    return Math.min(1, Math.max(0, (scrollY - s) / (max - s)));
  }
  const wake = () => { fly.lastInput = performance.now(); if (state.entered) fly.auto = false; };
  addEventListener('wheel', e => {
    if (!state.entered || state.landed || state.panel) return;
    e.preventDefault();
    fly.speed = THREE.MathUtils.clamp(fly.speed + (e.deltaY > 0 ? -6 : 6), -10, 70); wake();
  }, { passive: false });
  addEventListener('pointermove', e => {
    root.style.setProperty('--px', e.clientX + 'px'); root.style.setProperty('--py', e.clientY + 'px');
    if (!state.entered || state.landed) return;
    const r = canvas.getBoundingClientRect();
    fly.steerX = ((e.clientX - r.left) / r.width) * 2 - 1;
    fly.steerY = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (Math.abs(fly.steerX) > 0.12 || Math.abs(fly.steerY) > 0.12) wake();
  });
  const keys = {};
  addEventListener('keydown', e => {
    if (!state.entered || state.landed) return;
    keys[e.key.toLowerCase()] = true;
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) { e.preventDefault(); wake(); }
    if (e.key === 'Enter' && nearSite) land(nearSite);
  });
  addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
  // touch: drag steers, two fingers or a swipe up throttles
  let touch = null;
  canvas.addEventListener('touchstart', e => { if (!state.entered || state.landed) return; const t = e.touches[0]; touch = { x: t.clientX, y: t.clientY, n: e.touches.length }; }, { passive: true });
  canvas.addEventListener('touchmove', e => {
    if (!state.entered || state.landed || !touch) return;
    e.preventDefault();
    const t = e.touches[0];
    fly.steerX = THREE.MathUtils.clamp((t.clientX - touch.x) / 120, -1, 1);
    fly.steerY = THREE.MathUtils.clamp((t.clientY - touch.y) / 160, -1, 1);
    if (e.touches.length > 1) fly.speed = THREE.MathUtils.clamp(fly.speed + (touch.y - t.clientY) * 0.1, -10, 60);
    else fly.speed = Math.max(fly.speed, 18);
    wake();
  }, { passive: false });
  canvas.addEventListener('touchend', () => { touch = null; fly.steerX = fly.steerY = 0; });
  canvas.addEventListener('click', () => { if (state.entered && !state.landed && nearSite) land(nearSite); });

  /* ---- landing: the territory becomes the thing itself ---- */
  let nearSite = null;
  const overlays = { ember: $('#land-ember'), 'the-search': $('#land-the-search'), 'web-cad': $('#land-web-cad') };
  const sceneById = { ember, 'the-search': search, 'web-cad': webcad };
  let landAnim = null;
  function land(id) {
    if (state.landed || !SITES[id]) return;
    const s = SITES[id], c = clouds.find(c => c.id === id);
    state.landed = id; fly.auto = false; fly.speed = 0;
    root.classList.add('landed'); root.dataset.landed = id;
    // fly to a dock pose over the territory
    const dock = s.center.clone().add(id === 'ember' ? new THREE.Vector3(0, 26, 70) : id === 'the-search' ? new THREE.Vector3(18, 22, 130) : new THREE.Vector3(30, 20, 60));
    landAnim = { from: fly.pos.clone(), to: dock, look: s.center.clone(), t: 0 };
    if (c) { c.seen.fill(1); c.geo.attributes.aSeen.needsUpdate = true; c.revealed = c.n; }
    const ov = overlays[id]; if (ov) { ov.hidden = false; requestAnimationFrame(() => ov.classList.add('is-open')); }
    history.replaceState(null, '', '#' + id);
    if (id === 'ember') startReplay();
    if (id === 'the-search') searchLanded();
    if (id === 'web-cad') webcadLanded();
    announce(s.label + ': landed. Escape takes off.');
  }
  function takeOff() {
    const id = state.landed; if (!id) return;
    const ov = overlays[id]; if (ov) { ov.classList.remove('is-open'); setTimeout(() => { ov.hidden = true; }, 600); }
    root.classList.remove('landed'); delete root.dataset.landed;
    state.landed = null; landAnim = null; fly.speed = reduce ? 0 : 14; fly.lastInput = performance.now();
    if (id === 'ember') stopReplay();
    if (id === 'web-cad') { const fr = $('#land-web-cad iframe'); if (fr) fr.removeAttribute('src'); $('#land-web-cad .landing-frame')?.classList.remove('running'); }
    history.replaceState(null, '', '#world');
  }
  takeoffBtn.addEventListener('click', takeOff);
  landBtn.addEventListener('click', () => nearSite && land(nearSite));
  $$('.takeoff-inline').forEach(b => b.addEventListener('click', takeOff));
  const live = $('#live');
  function announce(msg) { if (live) { live.textContent = ''; setTimeout(() => { live.textContent = msg; }, 30); } }

  // going to a place from the index: enter the world if needed, fly there, land
  function goTo(id, doLand) {
    if (id === 'question') { if (state.landed) takeOff(); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
    if (id === 'in-progress' || id === 'method') { openStory(id); return; }
    if (!SITES[id]) return;
    // entering from the index skips the approach: put the page where a scroll-in would have left it,
    // so the entry plate is gone and the next wheel tick does not count as scrolling back out
    if (!state.entered) { scrollTo(0, document.documentElement.scrollHeight); state.p = 1; enter(); }
    if (state.landed && state.landed !== id) takeOff();
    if (doLand !== false) setTimeout(() => land(id), state.landed ? 700 : 300);
    else { fly.auto = false; fly.pos.copy(SITES[id].center).add(new THREE.Vector3(0, 30, 120)); }
  }
  window.__world = { goTo, takeOff, land };

  /* ---- ember landing: the receipts replayed as the terminal that watched them ---- */
  const term = $('#term'), termBody = $('.term-body', term), scrub = $('#scrub');
  let replayTimer = null, replayI = 0;
  function emberFacts() {
    const T = emberMeta.lineage_totals, head = emberMeta.hours.filter(h => h.on_lineage).slice(-1)[0];
    $('#f-hours').textContent = emberMeta.receipted_hours_on_lineage;
    $('#f-off').textContent = emberMeta.receipted_hours_off_lineage;
    $('#f-positions').textContent = (T.applied_positions / 1e9).toFixed(2) + ' B';
    $('#f-updates').textContent = fmt(T.measured_updates);
    $('#f-headp10').textContent = fmt(T.head_p10);
    $('#f-bestp10').textContent = fmt(T.best_p10);
    $('#f-headoverall').textContent = fmt(T.head_overall);
    $('#f-headstamp').textContent = head ? head.stamp : '';
    $('#f-points').textContent = fmt(emberMeta.points);
  }
  emberFacts();
  function startReplay() {
    stopReplay(); replayI = 0; termBody.innerHTML = '';
    const rows = replay.rows;
    scrub.max = rows.length - 1; scrub.value = 0;
    if (reduce) { // no rolling text: show the first screenful at once; play and the scrubber still work
      const end = Math.min(rows.length, 40);
      for (; replayI < end; replayI++) appendRow(rows[replayI]);
      scrub.value = replayI - 1; return;
    }
    const tick = () => {
      if (replayI >= rows.length) { replayTimer = null; return; }
      appendRow(rows[replayI]); scrub.value = replayI; replayI++;
      replayTimer = setTimeout(tick, reduce ? 60 : 140);
    };
    tick();
  }
  function appendRow(r) {
    const [step, loss, pps, wall] = r;
    const el = document.createElement('div'); el.className = 'row';
    el.innerHTML = `<span class="c0">step ${String(step).padStart(6, ' ')}</span><span class="c1">loss ${loss.toFixed(4)}</span><span class="c2">${fmt(pps).padStart(7, ' ')} pos/s</span><span class="c3">${wall.toFixed(3)} s</span>`;
    termBody.appendChild(el);
    const rowH = el.getBoundingClientRect().height || 19.5, fit = Math.max(3, Math.floor((termBody.clientHeight - 24) / rowH));
    while (termBody.children.length > fit) termBody.removeChild(termBody.firstChild);
  }
  function stopReplay() { if (replayTimer) clearTimeout(replayTimer); replayTimer = null; }
  scrub.addEventListener('input', () => {
    stopReplay(); termBody.innerHTML = '';
    const i = +scrub.value; for (let j = Math.max(0, i - 40); j <= i; j++) appendRow(replay.rows[j]); replayI = i + 1;
  });
  $('.term-play').addEventListener('click', () => { if (replayTimer) stopReplay(); else { const rows = replay.rows; const tick = () => { if (replayI >= rows.length) { replayTimer = null; return; } appendRow(rows[replayI]); scrub.value = replayI; replayI++; replayTimer = setTimeout(tick, 140); }; tick(); } });

  /* ---- search landing: the cloud becomes the viewer; pointing at a point names the experiment ---- */
  const card = $('#exp-card');
  function searchLanded() {
    if (searchJson) {
      $('#s-scripts').textContent = fmt(searchJson.era1_scripts_recovered);
      $('#s-stages').textContent = fmt(search.stages.filter(s => s.kind === 'stage').length);
      $('#s-end').textContent = searchJson.era2_end;
    }
    if (search.route) search.route.material.opacity = 0.75;
    if (search.endMark) search.endMark.material.opacity = 0.9;
  }
  const ray = new THREE.Raycaster(); ray.params.Points.threshold = 1.2;
  const ptr = new THREE.Vector2(); let ptrEvt = null;
  canvas.addEventListener('pointermove', e => { ptrEvt = e; });
  function pickExperiment() {
    if (state.landed !== 'the-search' || !ptrEvt || !search.cloud) return;
    const r = canvas.getBoundingClientRect();
    ptr.set(((ptrEvt.clientX - r.left) / r.width) * 2 - 1, -((ptrEvt.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObject(search.cloud.points, false)[0];
    if (!hit) { card.hidden = true; return; }
    const i = hit.index;
    const e = i < search.exps.length ? search.exps[i] : search.stages[i - search.exps.length];
    if (!e) { card.hidden = true; return; }
    card.hidden = false;
    card.style.transform = `translate3d(${ptrEvt.clientX + 14}px,${ptrEvt.clientY + 14}px,0)`;
    if (e.kind) {
      card.innerHTML = `<b>${esc(e.id)}</b><span class="k ${e.cls}">${esc(e.status || e.result || '')}</span><p>${esc(e.text || '')}</p>${e.result ? `<p class="r">${esc(e.result)}</p>` : ''}`;
    } else {
      card.innerHTML = `<b>${esc(e.id)}</b><span class="k ${e.cls}">${e.date || ''}</span><p>${esc(e.title || e.file.split('/').pop())}</p>`;
    }
  }
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  /* ---- web-cad landing: the tool itself ---- */
  function webcadLanded() {
    const fr = $('#land-web-cad iframe');
    const run = $('#webcad-run');
    if (run && !run.dataset.bound) { run.dataset.bound = 1; run.addEventListener('click', () => { if (fr && !fr.getAttribute('src')) fr.setAttribute('src', fr.dataset.src); $('#land-web-cad .landing-frame').classList.add('running'); }); }
    $('#w-points').textContent = fmt(webcadMeta.points);
  }

  /* ---- enter the world ---- */
  function enter() {
    if (state.entered) return;
    state.entered = 1; root.classList.add('entered');
    if (plate0) plate0.style.opacity = ''; // the inline fade would outrank the .entered rule that hides the plate
    bird.visible = true;
    // with reduced motion there is no autopilot tour: the reader moves only on input, and the index lands directly
    fly.auto = !reduce; fly.lastInput = performance.now() - 7000; fly.tourT = 0;
    const p = approach.getPoint(1), l = approachLook.getPoint(1);
    fly.pos.copy(p); dir.copy(l).sub(p).normalize(); fly.yaw = Math.atan2(-dir.x, -dir.z); fly.pitch = Math.asin(dir.y);
    fly.speed = reduce ? 0 : 14;
    announce('You are in the world. Scroll to move, move the pointer to steer, Enter to land.');
  }
  function leaveWorld() {
    if (!state.entered) return;
    if (state.landed) takeOff();
    state.entered = 0; root.classList.remove('entered'); bird.visible = false; fly.auto = true;
  }
  // scrolling back to the top leaves the world
  addEventListener('scroll', () => { if (state.entered && approachProgress() < 0.97) leaveWorld(); }, { passive: true });

  /* ---- resize ---- */
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.fov = w <= 760 ? 60 : 50;
    uniforms.uScale.value = renderer.domElement.height * 0.5 / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * 0.5;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  /* ---- loop ---- */
  let last = performance.now(), t = 0, frames = 0, slow = 0, running = true, scheduled = false;
  function schedule() { if (scheduled || !running) return; scheduled = true; requestAnimationFrame(now => { scheduled = false; frame(now); }); }
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  const vv = new THREE.Vector3();
  const pathTangent = new THREE.Vector3();
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!reduce) t += dt;
    uniforms.uTime.value = t;

    const ap = approachProgress();
    state.p += (ap - state.p) * (reduce ? 1 : 1 - Math.exp(-dt * 4));
    if (!state.entered && ap >= 0.985) enter();
    transit.classList.toggle('on', !state.entered && state.p > 0.05 && state.p < 0.97);
    if (letters) { const q = THREE.MathUtils.clamp(state.p, 0, 1); letters.mat.uniforms.uFade.value = THREE.MathUtils.smoothstep(q, 0.04, 0.13); if (plate0 && !state.entered) plate0.style.opacity = 1 - THREE.MathUtils.smoothstep(q, 0.005, 0.05); }
    { const ef = state.entered ? 1 : THREE.MathUtils.smoothstep(state.p, 0.005, 0.06); for (const c of clouds) if (!c.isLetters) c.mat.uniforms.uFade.value = ef; } // the page is the page; the world arrives as you leave it

    if (!state.entered) {
      // the approach: carried by the scroll, through the letters, into the dark
      const u = THREE.MathUtils.clamp(state.p, 0, 1);
      approach.getPoint(u, camPos); approachLook.getPoint(u, camLook);
      if (!reduce) { camPos.x += Math.sin(t * 0.3) * 0.4 * u; camPos.y += Math.sin(t * 0.23) * 0.3 * u; }
      camera.position.copy(camPos); camera.up.copy(up); camera.lookAt(camLook);
      fly.pos.copy(camPos);
    } else if (landAnim) {
      landAnim.t = Math.min(1, landAnim.t + dt * (reduce ? 4 : 0.9));
      const k = landAnim.t * landAnim.t * (3 - 2 * landAnim.t);
      fly.pos.lerpVectors(landAnim.from, landAnim.to, k);
      camera.position.copy(fly.pos); camera.up.copy(up); camera.lookAt(landAnim.look);
      if (landAnim.t >= 1) { landAnim.done = true; }
      bird.visible = false;
    } else if (state.landed) {
      // slow drift above the territory while landed
      const s = SITES[state.landed];
      camera.position.copy(fly.pos); camera.up.copy(up);
      vv.copy(s.center); if (!reduce) { vv.x += Math.sin(t * 0.1) * 3; vv.y += Math.cos(t * 0.13) * 2; }
      camera.lookAt(vv);
    } else {
      // flight
      const idle = now - fly.lastInput > 6000;
      if (idle && !fly.auto && !reduce) { fly.auto = true; fly.tourT = nearestTourT(fly.pos); }
      if (reduce) fly.auto = false;
      if (fly.auto) {
        fly.tourT = (fly.tourT + dt / TOUR_SECONDS) % 1;
        tour.getPoint(fly.tourT, vv); tour.getTangent(fly.tourT, pathTangent);
        fly.pos.lerp(vv, 1 - Math.exp(-dt * 1.4));
        const ty = Math.atan2(-pathTangent.x, -pathTangent.z), tp = Math.asin(THREE.MathUtils.clamp(pathTangent.y, -1, 1));
        fly.yaw += angleDelta(fly.yaw, ty) * (1 - Math.exp(-dt * 1.6)); fly.pitch += (tp - fly.pitch) * (1 - Math.exp(-dt * 1.6));
        fly.speed = 16;
      } else {
        let sx = fly.steerX, sy = fly.steerY;
        if (keys['a'] || keys['arrowleft']) sx = -0.9; if (keys['d'] || keys['arrowright']) sx = 0.9;
        if (keys['w'] || keys['arrowup']) fly.speed = Math.min(70, fly.speed + 40 * dt); if (keys['s'] || keys['arrowdown']) fly.speed = Math.max(-10, fly.speed - 40 * dt);
        const dead = v => Math.sign(v) * Math.max(0, Math.abs(v) - 0.12) / 0.88;
        fly.vyaw += (-dead(sx) * 1.1 - fly.vyaw) * (1 - Math.exp(-dt * 3));
        fly.vpitch += (-dead(sy) * 0.7 - fly.vpitch) * (1 - Math.exp(-dt * 3));
        fly.yaw += fly.vyaw * dt; fly.pitch = THREE.MathUtils.clamp(fly.pitch + fly.vpitch * dt, -1.1, 1.1);
        fly.speed += (Math.max(fly.speed, 0) - fly.speed) * 0; // keep
        fly.speed *= Math.exp(-dt * 0.35); // glide: speed decays slowly without throttle
        dir.set(-Math.sin(fly.yaw) * Math.cos(fly.pitch), Math.sin(fly.pitch), -Math.cos(fly.yaw) * Math.cos(fly.pitch));
        fly.pos.addScaledVector(dir, fly.speed * dt);
        // soft bounds keep the reader inside the world
        fly.pos.x = THREE.MathUtils.clamp(fly.pos.x, -260, 260); fly.pos.y = THREE.MathUtils.clamp(fly.pos.y, -90, 110); fly.pos.z = THREE.MathUtils.clamp(fly.pos.z, -700, 20);
      }
      dir.set(-Math.sin(fly.yaw) * Math.cos(fly.pitch), Math.sin(fly.pitch), -Math.cos(fly.yaw) * Math.cos(fly.pitch));
      // the camera rides behind and above the bird
      bird.visible = true;
      bird.position.copy(fly.pos);
      bird.quaternion.setFromEuler(new THREE.Euler(fly.pitch, fly.yaw, -fly.vyaw * 0.6, 'YXZ'));
      bird.userData.mat.opacity = 0.5 + 0.35 * Math.min(1, Math.abs(fly.speed) / 40);
      if (!reduce) { // wing beat: slow glide when fast, quicker beats when slow
        const base = bird.userData.base, arr = bird.userData.geo.attributes.position.array, rate = 3 + 6 * (1 - Math.min(1, Math.abs(fly.speed) / 50));
        const ph = Math.sin(t * rate);
        for (let i = 0; i < arr.length; i += 3) { const x = base[i]; const r = Math.min(1, Math.abs(x) / 2.4); arr[i + 1] = base[i + 1] + ph * r * r * 0.9; arr[i] = x * (1 - 0.08 * Math.abs(ph) * r); }
        bird.userData.geo.attributes.position.needsUpdate = true;
      }
      camPos.copy(fly.pos).addScaledVector(dir, -9).addScaledVector(up, 2.6);
      camera.position.lerp(camPos, reduce ? 1 : 1 - Math.exp(-dt * 6));
      camLook.copy(fly.pos).addScaledVector(dir, 30);
      camera.up.copy(up); camera.lookAt(camLook);
      // near a territory?
      let best = null, bd = 1e9;
      for (const [id, s] of Object.entries(SITES)) { const d = fly.pos.distanceTo(s.center); if (d < bd) { bd = d; best = id; } }
      const c = clouds.find(c => c.id === best);
      nearSite = (c && bd < c.radius) ? best : null;
      root.classList.toggle('near', !!nearSite);
      if (nearSite) { prompt.textContent = 'Land on ' + SITES[nearSite].label; }
    }
    uniforms.uCam.value.copy(camera.position);

    // reveal what the camera has come near
    if (state.landed) bird.visible = false;
    for (const c of clouds) { if (c.isLetters || c.isDust) continue; reveal(c, camera.position, dt); c.mat.uniforms.uFocus.value = state.landed === c.id ? 0.35 : 0; }
    // the search's route brightens only as the search cloud is seen
    if (search.cloud && search.route && state.landed !== 'the-search') { const f = search.cloud.revealed / search.cloud.n; search.route.material.opacity = f * 0.6; if (search.endMark) search.endMark.material.opacity = f * 0.8; }

    renderer.render(scene, camera);

    // labels
    const w = innerWidth, h = innerHeight;
    for (const L of labels) {
      let o = 0;
      if (state.entered && !state.landed) {
        const d = camera.position.distanceTo(L.pos);
        o = THREE.MathUtils.clamp((L.far - d) / (L.far - L.near), 0, 1);
        if (L.cloud) o *= 0.35 + 0.65 * Math.min(1, L.cloud.revealed / (L.cloud.n * 0.15) + (d < L.near ? 1 : 0));
      }
      if (o <= 0.01) { if (L.el.style.opacity !== '0') L.el.style.opacity = '0'; continue; }
      vv.copy(L.pos).project(camera);
      if (vv.z > 1) { L.el.style.opacity = '0'; continue; }
      let x = (vv.x * 0.5 + 0.5) * w; const y = (-vv.y * 0.5 + 0.5) * h;
      if (x < 20 || x > w - 20 || y < 80 || y > h - 40) { L.el.style.opacity = '0'; continue; }
      x = Math.min(x, w - 24 - (L.el.offsetWidth || 120)); // keep the label inside the viewport
      L.el.style.opacity = o.toFixed(3);
      L.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    }
    if (state.landed === 'the-search' && frames % 2 === 0) pickExperiment();

    // the rail shows the approach, then the share of the world that has been seen
    const seenShare = clouds.filter(c => !c.isLetters && !c.isDust).reduce((a, c) => a + c.revealed / c.n, 0) / 3;
    $('.rail-fill').style.height = ((state.entered ? 0.35 + 0.65 * seenShare : state.p * 0.35) * 100).toFixed(1) + '%';
    const seenEl = $('.seen'); if (seenEl) seenEl.textContent = state.entered ? 'records flown past: ' + Math.round(seenShare * 100) + '%' : '';

    if (++frames < 150 && frames > 30) { if (dt > 0.026) slow++; if (frames === 149 && slow > 60 && dpr > 1) { dpr = 1; renderer.setPixelRatio(1); resize(); } }
    if (frames === 2) root.classList.add('ready');
    schedule();
  }
  function angleDelta(a, b) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }
  function nearestTourT(p) { let best = 0, bd = 1e9; for (let i = 0; i < 200; i++) { tour.getPoint(i / 200, vv); const d = vv.distanceTo(p); if (d < bd) { bd = d; best = i / 200; } } return best; }
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { last = performance.now(); schedule(); } });

  // deep links: #ember etc. enter and land; #world enters
  const h = location.hash.replace('#', '');
  if (SITES[h] || h === 'world') { scrollTo(0, document.documentElement.scrollHeight); state.p = 1; enter(); if (SITES[h]) setTimeout(() => land(h), 400); }
  schedule();
}
