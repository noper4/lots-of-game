export class Particle {
  constructor(x, y, radius, color, options = {}) {
    this.x = x; this.y = y; this.oldX = x; this.oldY = y;
    this.radius = radius; this.color = color; this.mass = options.mass ?? 1;
    this.friction = options.friction ?? 0.995; this.pinned = false;
  }
  get vx() { return this.x - this.oldX; }
  get vy() { return this.y - this.oldY; }
  impulse(x, y) { this.oldX -= x; this.oldY -= y; }
}

export class Link {
  constructor(a, b, stiffness = 0.8) {
    this.a = a; this.b = b; this.length = Math.hypot(b.x - a.x, b.y - a.y); this.stiffness = stiffness;
  }
  solve() {
    const dx = this.b.x - this.a.x, dy = this.b.y - this.a.y;
    const distance = Math.hypot(dx, dy) || 0.001;
    const correction = ((distance - this.length) / distance) * this.stiffness;
    const wa = this.a.pinned ? 0 : 1 / this.a.mass, wb = this.b.pinned ? 0 : 1 / this.b.mass;
    const total = wa + wb || 1;
    this.a.x += dx * correction * wa / total; this.a.y += dy * correction * wa / total;
    this.b.x -= dx * correction * wb / total; this.b.y -= dy * correction * wb / total;
  }
}

export function integrate(particles, bounds, gravity, dragged) {
  for (const p of particles) {
    if (p.pinned || p === dragged) continue;
    const vx = (p.x - p.oldX) * p.friction, vy = (p.y - p.oldY) * p.friction;
    p.oldX = p.x; p.oldY = p.y;
    p.x += vx; p.y += vy + gravity;
    const floor = bounds.height - p.radius - 3;
    if (p.y > floor) { p.y = floor; p.oldY = p.y + Math.abs(vy) * 0.34; p.oldX = p.x - vx * 0.82; }
    if (p.x < p.radius + 3) { p.x = p.radius + 3; p.oldX = p.x + Math.abs(vx) * 0.7; }
    if (p.x > bounds.width - p.radius - 3) { p.x = bounds.width - p.radius - 3; p.oldX = p.x - Math.abs(vx) * 0.7; }
    if (p.y < p.radius + 3) { p.y = p.radius + 3; p.oldY = p.y + Math.abs(vy) * 0.4; }
  }
}

export function solveCollisions(particles) {
  for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) {
    const a = particles[i], b = particles[j];
    const minDistance = a.radius + b.radius;
    let dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy);
    if (distance >= minDistance) continue;
    if (!distance) { dx = 0.01; dy = 0; distance = 0.01; }
    const overlap = (minDistance - distance) / distance;
    const wa = a.pinned ? 0 : 1 / a.mass, wb = b.pinned ? 0 : 1 / b.mass, total = wa + wb || 1;
    a.x -= dx * overlap * wa / total; a.y -= dy * overlap * wa / total;
    b.x += dx * overlap * wb / total; b.y += dy * overlap * wb / total;
  }
}
