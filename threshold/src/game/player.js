// First-person walker: smoothed velocity, circle-vs-AABB collision, human head motion.
import * as THREE from 'three';
const EYE = 1.64, RADIUS = 0.34, WALK = 3.3, SLOW = 1.45;

export class Player {
  constructor(camera) {
    this.camera = camera; this.pos = new THREE.Vector3(); this.vel = new THREE.Vector2(); this.yaw = 0; this.pitch = 0;
    this.bobPhase = 0; this.speed = 0; this.bobAmp = 0; this.roll = 0; this.ground = 0; this.sens = 1; this.onStep = null; this.kick = 0; this.lookOffset = { yaw: 0, pitch: 0, roll: 0, y: 0 };
  }
  place(x, z, yaw) { this.pos.set(x, EYE, z); this.vel.set(0, 0); this.yaw = yaw; this.pitch = 0; this.ground = 0; }
  rotateAbout(cx, cz) { this.pos.x = 2 * cx - this.pos.x; this.pos.z = 2 * cz - this.pos.z; this.yaw += Math.PI; this.vel.multiplyScalar(-1); }
  translate(dx, dz) { this.pos.x += dx; this.pos.z += dz; }
  update(dt, input, look, world) {
    const s = 0.0021 * this.sens; this.yaw -= look.dx * s; this.pitch = THREE.MathUtils.clamp(this.pitch - look.dy * s, -1.35, 1.35);
    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw), mx = input.move.x, my = input.move.y;
    const max = input.slow ? SLOW : WALK, tx = (mx * cos - my * sin) * max, tz = (-mx * sin - my * cos) * max;
    const moving = mx !== 0 || my !== 0, k = 1 - Math.exp(-dt * (moving ? 9 : 11));
    this.vel.x += (tx - this.vel.x) * k; this.vel.y += (tz - this.vel.y) * k;
    let x = this.pos.x + this.vel.x * dt, z = this.pos.z + this.vel.y * dt;
    for (let it = 0; it < 3; it++) for (const c of world.colliders) {
      if (!c.on) continue;
      const nx = Math.max(c.minX, Math.min(x, c.maxX)), nz = Math.max(c.minZ, Math.min(z, c.maxZ)), dx = x - nx, dz = z - nz, d2 = dx * dx + dz * dz;
      if (d2 >= RADIUS * RADIUS) continue;
      if (d2 > 1e-9) { const d = Math.sqrt(d2), p = (RADIUS - d) / d; x += dx * p; z += dz * p; }
      else { const l = x - c.minX, r = c.maxX - x, n = z - c.minZ, f = c.maxZ - z, m = Math.min(l, r, n, f); if (m === l) x = c.minX - RADIUS; else if (m === r) x = c.maxX + RADIUS; else if (m === n) z = c.minZ - RADIUS; else z = c.maxZ + RADIUS; }
    }
    const moved = Math.hypot(x - this.pos.x, z - this.pos.z); this.speed = dt > 0 ? moved / dt : 0;
    this.pos.x = x; this.pos.z = z;
    this.ground += (world.groundHeight(x, z) - this.ground) * Math.min(1, dt * 12);
    // head motion
    const sp = Math.min(1, this.speed / WALK); this.bobAmp += (sp - this.bobAmp) * Math.min(1, dt * 8);
    const prev = this.bobPhase; this.bobPhase += moved * 2.05;
    if (Math.floor(prev / Math.PI) !== Math.floor(this.bobPhase / Math.PI) && this.speed > 0.5) this.onStep?.(this.speed / WALK);
    const strafe = this.vel.x * cos - this.vel.y * sin; this.roll += (-strafe * 0.006 - this.roll) * Math.min(1, dt * 6);
    const t = performance.now() / 1000, o = this.lookOffset;
    const by = Math.sin(this.bobPhase * 2) * 0.034 * this.bobAmp + Math.sin(t * 1.25) * 0.004, bx = Math.cos(this.bobPhase) * 0.02 * this.bobAmp;
    this.pos.y = EYE + this.ground;
    this.camera.position.set(this.pos.x + bx * cos, this.pos.y + by + o.y, this.pos.z - bx * sin);
    this.camera.rotation.set(this.pitch + o.pitch + Math.sin(this.bobPhase * 2 + 0.6) * 0.0035 * this.bobAmp, this.yaw + o.yaw, this.roll + o.roll + Math.cos(this.bobPhase) * 0.004 * this.bobAmp);
  }
}
