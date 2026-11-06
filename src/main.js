import { integrate, solveCollisions } from './physics.js';
import { Ragdoll } from './ragdoll.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const countLabel = document.querySelector('#ragdoll-count');
const gravityButton = document.querySelector('#gravity-button');
const pauseButton = document.querySelector('#pause-button');
const statusText = document.querySelector('#status-text');
const tip = document.querySelector('#canvas-tip');
let width = 0, height = 0, dpr = 1, ragdolls = [], gravity = true, paused = false, dragged = null, pointer = null;
let lastTime = 0, accumulator = 0, idCounter = 0;
const STEP = 1 / 60;

function resize() {
  const rect = canvas.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width; height = rect.height;
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
function addRagdoll(x = width * (.35 + Math.random() * .3), y = 55) {
  ragdolls.push(new Ragdoll(x, Math.min(y, height - 155), idCounter++));
  countLabel.textContent = String(ragdolls.length).padStart(2,'0');
  tip.style.opacity = '0';
}
function update() {
  if (pointer && dragged) {
    const dx = pointer.x - dragged.x, dy = pointer.y - dragged.y;
    dragged.oldX = dragged.x - dx * .72; dragged.oldY = dragged.y - dy * .72;
    dragged.x = pointer.x; dragged.y = pointer.y;
  }
  const particles = ragdolls.flatMap(r => r.all);
  integrate(particles,{width,height},gravity ? .24 : 0,dragged);
  for (let i=0;i<4;i++) { for(const doll of ragdolls) doll.solve(); solveCollisions(particles); }
}
function drawBackground() {
  ctx.clearRect(0,0,width,height);
  const gradient=ctx.createLinearGradient(0,0,0,height);gradient.addColorStop(0,'#17263a');gradient.addColorStop(1,'#111b2b');ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);
  ctx.strokeStyle='#ffffff08';ctx.lineWidth=1;
  for(let x=24;x<width;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}
  for(let y=16;y<height;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
  const floor=height-3;ctx.fillStyle='#26344a';ctx.fillRect(0,floor,width,3);ctx.fillStyle='#c8f36a';ctx.fillRect(0,floor,width,2);
  ctx.fillStyle='#8c9bb0';ctx.globalAlpha=.5;ctx.font='9px monospace';ctx.fillText('FLOOR',width-43,height-11);ctx.globalAlpha=1;
}
function frame(time) {
  const delta=Math.min((time-lastTime)/1000 || 0, .05);lastTime=time;
  if(!paused){accumulator+=delta;while(accumulator>=STEP){update();accumulator-=STEP;}}
  drawBackground();for(const doll of ragdolls)doll.draw(ctx);
  requestAnimationFrame(frame);
}
function pointFromEvent(event){const rect=canvas.getBoundingClientRect();return{x:event.clientX-rect.left,y:event.clientY-rect.top};}
canvas.addEventListener('pointerdown',event=>{
  const point=pointFromEvent(event);let nearest=null,dist=Infinity;
  for(const doll of ragdolls)for(const p of doll.all){const d=Math.hypot(point.x-p.x,point.y-p.y);if(d<p.radius+10&&d<dist){nearest=p;dist=d;}}
  if(nearest){dragged=nearest;pointer=point;canvas.setPointerCapture(event.pointerId);tip.style.opacity='0';}
  canvas.focus();
});
canvas.addEventListener('pointermove',event=>{
  const point=pointFromEvent(event);document.querySelector('#coordinates').textContent=`X ${String(Math.round(point.x)).padStart(3,'0')} · Y ${String(Math.round(point.y)).padStart(3,'0')}`;
  if(dragged)pointer=point;
});
function release(){dragged=null;pointer=null;}
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
canvas.addEventListener('pointerleave',()=>{document.querySelector('#coordinates').textContent='X 000 · Y 000';});
document.querySelector('#spawn-button').addEventListener('click',()=>addRagdoll());
document.querySelector('#push-button').addEventListener('click',()=>{
  for(const doll of ragdolls)for(const p of doll.all){const amount=2.3+Math.random()*2.6;p.impulse((Math.random()-.5)*amount, -amount*(.4+Math.random()*.7));}
});
gravityButton.addEventListener('click',()=>{gravity=!gravity;gravityButton.querySelector('span:nth-child(2)').textContent=`Gravity: ${gravity?'on':'off'}`;gravityButton.querySelector('.button-icon').textContent=gravity?'↓':'↗';});
pauseButton.addEventListener('click',togglePause);
function togglePause(){paused=!paused;pauseButton.querySelector('span:nth-child(2)').textContent=paused?'Resume':'Pause';pauseButton.querySelector('.button-icon').textContent=paused?'▶':'Ⅱ';statusText.textContent=paused?'PAUSED':'PLAYING';statusText.previousElementSibling.style.background=paused?'#ff996d':'#c8f36a';}
document.querySelector('#reset-button').addEventListener('click',()=>{ragdolls=[];idCounter=0;addRagdoll(width*.5,55);gravity=true;paused=false;gravityButton.querySelector('span:nth-child(2)').textContent='Gravity: on';gravityButton.querySelector('.button-icon').textContent='↓';pauseButton.querySelector('span:nth-child(2)').textContent='Pause';pauseButton.querySelector('.button-icon').textContent='Ⅱ';statusText.textContent='PLAYING';statusText.previousElementSibling.style.background='#c8f36a';tip.style.opacity='1';});
document.addEventListener('keydown',event=>{
  if(event.target instanceof HTMLButtonElement)return;
  if(event.code==='Space'){event.preventDefault();document.querySelector('#push-button').click();}
  if(event.key.toLowerCase()==='r')addRagdoll();
  if(event.key.toLowerCase()==='p')togglePause();
});
const dialog=document.querySelector('#help-dialog');document.querySelector('#help-button').addEventListener('click',()=>dialog.showModal());document.querySelector('#close-help').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
new ResizeObserver(resize).observe(canvas);resize();addRagdoll(width*.5,55);requestAnimationFrame(frame);
