import { Particle, Link } from './physics.js';

const COLORS = ['#c8f36a', '#8eb8ff', '#ff996d', '#d2a4ff', '#69dfc0'];

export class Ragdoll {
  constructor(x, y, id = 0) {
    this.color = COLORS[id % COLORS.length];
    this.particles = {};
    const add = (name, px, py, radius, mass = 1) => this.particles[name] = new Particle(px, py, radius, this.color, { mass });
    add('head', x, y, 15, 1.2); add('neck', x, y + 20, 6);
    add('chest', x, y + 39, 12, 1.5); add('hip', x, y + 68, 10, 1.3);
    add('leftShoulder', x - 13, y + 30, 7); add('leftElbow', x - 29, y + 48, 6);
    add('leftHand', x - 40, y + 64, 5); add('rightShoulder', x + 13, y + 30, 7);
    add('rightElbow', x + 29, y + 48, 6); add('rightHand', x + 40, y + 64, 5);
    add('leftKnee', x - 11, y + 94, 7); add('leftFoot', x - 15, y + 120, 6);
    add('rightKnee', x + 11, y + 94, 7); add('rightFoot', x + 15, y + 120, 6);
    const p = this.particles;
    const pairs = [
      ['head','neck',.9],['neck','chest',.9],['chest','hip',.9],
      ['chest','leftShoulder'],['leftShoulder','leftElbow'],['leftElbow','leftHand'],
      ['chest','rightShoulder'],['rightShoulder','rightElbow'],['rightElbow','rightHand'],
      ['hip','leftKnee'],['leftKnee','leftFoot'],['hip','rightKnee'],['rightKnee','rightFoot'],
      ['leftShoulder','rightShoulder'],['leftKnee','rightKnee'],
      ['leftShoulder','hip',.18],['rightShoulder','hip',.18],
      ['leftElbow','chest',.12],['rightElbow','chest',.12],
      ['leftKnee','chest',.1],['rightKnee','chest',.1],
      ['leftHand','hip',.08],['rightHand','hip',.08]
    ];
    this.links = pairs.map(([a,b,s]) => new Link(p[a],p[b],s ?? .78));
  }
  get all() { return Object.values(this.particles); }
  solve() { for (let i=0;i<5;i++) for (const link of this.links) link.solve(); }
  draw(ctx) {
    ctx.lineCap='round';ctx.lineJoin='round';
    for (const link of this.links) {
      const a=link.a,b=link.b;
      ctx.strokeStyle=this.color;ctx.globalAlpha=.88;ctx.lineWidth=(a.radius+b.radius)*.48;
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      ctx.strokeStyle='#ffffff';ctx.globalAlpha=.24;ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(a.x,a.y-1);ctx.lineTo(b.x,b.y-1);ctx.stroke();
    }
    ctx.globalAlpha=1;
    for (const [name,p] of Object.entries(this.particles)) {
      ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#ffffff';ctx.globalAlpha=.42;ctx.lineWidth=1.5;ctx.stroke();ctx.globalAlpha=1;
      if(name==='head'){
        ctx.fillStyle='#192334';ctx.beginPath();ctx.arc(p.x+5,p.y-2,1.7,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(p.x-3,p.y-2,1.7,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#192334';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x+1,p.y+2,3,0.15,Math.PI-.15);ctx.stroke();
      }
    }
  }
}
