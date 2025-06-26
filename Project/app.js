// ---------- DOM ----------
const cube=document.getElementById('cube');
const mood=document.getElementById('moodboard');

// ---------- color schemes ----------
const SCHEMES=[
  {h:210,s:70,l:50}, // blue
  {h:0,s:70,l:50},   // red
  {h:55,s:80,l:50},  // yellow
  {h:120,s:60,l:40}, // green
  {h:285,s:50,l:55}, // purple
  {h:0,s:0,l:88}     // white/grey
];
const colors=[];
SCHEMES.forEach(b=>{
  for(let i=0;i<9;i++){
    const l=Math.max(15,Math.min(90,b.l-20+i*5));
    colors.push(`hsl(${b.h}deg,${b.s}%,${l}%)`);
  }
});

// ---------- build moodboard & cube ----------
const FACE_NAMES=['front','back','right','left','top','bottom'];
let idx=0;
colors.forEach((c,i)=>{
  const div=document.createElement('div');
  div.className='board-tile';
  div.style.background=c;
  div.dataset.idx=i;
  mood.appendChild(div);
});
const cubeFaces={};
FACE_NAMES.forEach(name=>{
  const face=document.createElement('div');
  face.className=`face ${name}`;
  cubeFaces[name]=face;
  for(let i=0;i<9;i++){
    const tile=document.createElement('div');
    tile.className='tile';
    tile.style.background=colors[idx];
    tile.dataset.idx=idx;
    face.appendChild(tile);idx++;
  }
  cube.appendChild(face);
});

// ---------- helpers ----------
const ISO_ANGLE=35.264; // constant for iso projection
function yawToTransform(yawDeg,pitchDeg=ISO_ANGLE){
  return `rotateX(${-pitchDeg}deg) rotateY(${yawDeg}deg)`;
}
function faceOf(i){return Math.floor(i/9);}
function clearActive(){document.querySelectorAll('.active').forEach(el=>el.classList.remove('active'));}

let yaw=45; // starting yaw 45deg (shows front-right-top)
function orientToFace(face){
  // mapping face -> yaw
  const YAWS=[45,225,-45,135,45,45]; // rough: top & bottom keep yaw
  yaw=YAWS[face];
  cube.style.transform=yawToTransform(yaw);
}
function activate(idx){
  clearActive();
  document.querySelector(`.tile[data-idx="${idx}"]`)?.classList.add('active');
  document.querySelector(`.board-tile[data-idx="${idx}"]`)?.classList.add('active');
  zoomTo(idx);
  orientToFace(faceOf(idx));
}

// ---------- moodboard zoom/pan ----------
let scale=3, offsetX=0, offsetY=0;
function updateMoodTransform(){
  mood.style.transform=`translate(${offsetX}px,${offsetY}px) scale(${scale})`;
}
function zoomTo(idx){
  // focus centre of chosen tile
  const vw=window.innerWidth, vh=window.innerHeight;
  const tw=vw/9, th=vh/6;
  scale=0.9*Math.min(vw,vh)/Math.min(tw,th);
  const col=idx%9,row=Math.floor(idx/9);
  const cx=(col+0.5)*tw, cy=(row+0.5)*th;
  offsetX=vw/2-cx; offsetY=vh/2-cy;
  mood.classList.add('zoomed');
  updateMoodTransform();
}

// ------- Shift + Right‑drag pan -------
let panning=false,startX=0,startY=0,baseX=0,baseY=0;
window.addEventListener('contextmenu',e=>{if(e.shiftKey)e.preventDefault();});
window.addEventListener('pointerdown',e=>{
  if(e.shiftKey && e.button===2){ // right click with shift
    panning=true;startX=e.clientX;startY=e.clientY;baseX=offsetX;baseY=offsetY;
    document.body.classList.add('grabbing');
  }
});
window.addEventListener('pointermove',e=>{
  if(!panning)return;
  offsetX=baseX+(e.clientX-startX);
  offsetY=baseY+(e.clientY-startY);
  updateMoodTransform();

  // determine tile at centre after move
  const vw=window.innerWidth, vh=window.innerHeight;
  const tw=vw/9, th=vh/6;
  const col=Math.floor((vw/2-offsetX)/tw);
  const row=Math.floor((vh/2-offsetY)/th);
  if(col>=0&&col<9&&row>=0&&row<6){
    const newIdx=row*9+col;
    activate(newIdx);
  }
});
window.addEventListener('pointerup',e=>{
  if(panning){panning=false;document.body.classList.remove('grabbing');}
});

// ---------- clicks ----------
cube.addEventListener('click',e=>{
  const t=e.target.closest('.tile');if(!t)return;
  activate(+t.dataset.idx);
  e.stopPropagation();
});
mood.addEventListener('click',e=>{
  const t=e.target.closest('.board-tile');if(!t)return;
  activate(+t.dataset.idx);
});

// initial
activate(4);
