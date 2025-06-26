/* --- constants --- */
const ISO = 35.264;                               // ≈ atan(sin 45°)
const cube = document.getElementById('cube');
const mood = document.getElementById('moodboard');

/* --- colour palette (6 faces × 9 shades) --- */
const SCHEMES = [
  {h:210,s:70,l:50},  // blue
  {h:  0,s:70,l:50},  // red
  {h: 55,s:80,l:50},  // yellow
  {h:120,s:60,l:40},  // green
  {h:285,s:50,l:55},  // purple
  {h:  0,s: 0,l:85}   // white/grey
];

const COLORS = [];
SCHEMES.forEach(b => {
  for (let i = 0; i < 9; i++) {
    const l = Math.max(15, Math.min(90, b.l - 20 + i * 5));
    COLORS.push(`hsl(${b.h}deg,${b.s}%,${l}%)`);
  }
});

/* --- build mood-board grid --- */
COLORS.forEach((c, i) => {
  const d = document.createElement('div');
  d.className = 'board-tile';
  d.style.background = c;
  d.dataset.idx = i;
  mood.appendChild(d);
});

/* --- build cube faces --- */
const FACE_NAMES = ['front', 'right', 'back', 'left', 'top', 'bottom'];
let idx = 0;

FACE_NAMES.forEach(name => {
  const face = document.createElement('div');
  face.className = `face ${name}`;

  for (let t = 0; t < 9; t++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.idx = idx;
    tile.style.background = COLORS[idx];
    face.appendChild(tile);
    idx++;
  }
  cube.appendChild(face);
});

/* --- orientation presets (keeps selected tile visible) --- */
const ORIENT = {
  front : {x:-ISO        , y:   0},
  right : {x:-ISO        , y:  90},
  back  : {x:-ISO        , y: 180},
  left  : {x:-ISO        , y: -90},
  top   : {x:-90 + ISO   , y:   0},
  bottom: {x: 90 - ISO   , y:   0}
};

function setOrientation(face) {
  const o = ORIENT[face];
  cube.style.transform = `rotateX(${o.x}deg) rotateY(${o.y}deg)`;
}

function faceByIdx(i) {
  return FACE_NAMES[Math.floor(i / 9)];
}

/* --- activate helpers --- */
function clearActive() {
  document.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
}

let scale = 3, offsetX = 0, offsetY = 0;

function updateMood() {
  mood.style.transform = `translate(${offsetX}px,${offsetY}px) scale(${scale})`;
}

function zoomTo(i) {
  const vw = innerWidth, vh = innerHeight;
  const tw = vw / 9,     th = vh / 6;
  scale   = 0.9 * Math.min(vw, vh) / Math.min(tw, th);

  const col =  i % 9;
  const row = (i / 9) | 0;
  const cx  = (col + 0.5) * tw;
  const cy  = (row + 0.5) * th;
  offsetX   = vw / 2 - cx;
  offsetY   = vh / 2 - cy;

  mood.classList.add('zoomed');
  updateMood();
}

function activate(i) {
  clearActive();
  document.querySelector(`.tile[data-idx="${i}"]`) ?.classList.add('active');
  document.querySelector(`.board-tile[data-idx="${i}"]`) ?.classList.add('active');
  zoomTo(i);
  setOrientation(faceByIdx(i));
}

/* --- shift + right-drag pan (board drives cube) --- */
let panning = false, sx = 0, sy = 0, bx = 0, by = 0;

window.addEventListener('contextmenu', e => {
  if (e.shiftKey) e.preventDefault();             // disable default menu
});

window.addEventListener('pointerdown', e => {
  if (e.shiftKey && e.button === 2) {             // right-click + shift
    panning = true;
    sx = e.clientX; sy = e.clientY; bx = offsetX; by = offsetY;
    document.body.classList.add('grabbing');
  }
});

window.addEventListener('pointermove', e => {
  if (!panning) return;
  offsetX = bx + (e.clientX - sx);
  offsetY = by + (e.clientY - sy);
  updateMood();

  const col = ((innerWidth  / 2 - offsetX) / (innerWidth  / 9)) | 0;
  const row = ((innerHeight / 2 - offsetY) / (innerHeight / 6)) | 0;

  if (col >= 0 && col < 9 && row >= 0 && row < 6) {
    const id = row * 9 + col;
    clearActive();
    document.querySelector(`.board-tile[data-idx="${id}"]`)?.classList.add('active');
    setOrientation(faceByIdx(id));
  }
});

window.addEventListener('pointerup', () => {
  if (panning) {
    panning = false;
    document.body.classList.remove('grabbing');
  }
});

/* --- click handlers --- */
cube.addEventListener('click', e => {
  const t = e.target.closest('.tile');
  if (t) activate(+t.dataset.idx);
  e.stopPropagation();
});

mood.addEventListener('click', e => {
  const t = e.target.closest('.board-tile');
  if (t) activate(+t.dataset.idx);
});

/* --- initial state --- */
setOrientation('front');
