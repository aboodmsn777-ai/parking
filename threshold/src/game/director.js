// Loop logic: which anomaly is active, the threshold counter, and the two invisible teleports.
import { ANOMALIES, byId } from '../anomalies/index.js';
import { L, ENTRY } from '../world/corridor.js';

export const GOAL = 7;
const W = { easy: 1, medium: 1, hard: 0.8, horror: 0.45 };

export class Director {
  constructor({ world, player, audio, save, hooks }) {
    Object.assign(this, { world, player, audio, save, hooks });
    this.threshold = 0; this.current = null; this.armed = false; this.first = true; this.normals = 0; this.recent = []; this.busy = false;
    this.stats = { loops: 0, resets: 0, time: 0 };
    this.ctx = { world, player, audio, threshold: 0, t: 0, data: null, caught: (why) => this.caught(why) };
  }
  get discovered() { return this.save.data.discovered; }
  get allFound() { return ANOMALIES.every((a) => this.discovered.includes(a.id)); }
  begin(threshold = 0) {
    this.threshold = threshold; this.first = false; this.normals = 1; this.recent = []; this.busy = false; this.stats = { loops: 0, resets: 0, time: 0 };
    this.setLoop(null); this.spawn();
  }
  spawn() { this.player.place(ENTRY.x + 1.2, ENTRY.z, -Math.PI / 2); this.armed = false; }
  pick() {
    if (this.threshold >= GOAL) return null;
    if (this.first) { this.first = false; this.normals = 1; return null; }
    if (this.normals < 2 && Math.random() < 0.33) { this.normals++; return null; }
    this.normals = 0;
    const pool = ANOMALIES.filter((a) => !this.recent.includes(a.id) && (a.tier !== 'horror' || this.threshold >= 4));
    const w = pool.map((a) => W[a.tier] * (this.discovered.includes(a.id) ? 1 : 2.4) * (a.tier === 'hard' && this.threshold < 2 ? 0.5 : 1));
    let r = Math.random() * w.reduce((s, x) => s + x, 0);
    for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; }
    return pool[pool.length - 1];
  }
  setLoop(anom) {
    const c = this.ctx;
    if (this.current) this.current.disable(c);
    this.world.resetLights(); this.current = anom; c.t = 0; c.data = null; c.threshold = this.threshold;
    this.world.setNumber(this.threshold, false);
    this.world.setFinal(this.threshold >= GOAL, this.threshold >= GOAL && this.allFound);
    if (anom) { anom.enable(c); this.recent.push(anom.id); if (this.recent.length > 5) this.recent.shift(); }
    this.world.refreshShadows(); this.armed = false;
    this.save.data.threshold = this.threshold; this.save.data.inRun = true; this.save.write();
  }
  decide(wentBack) {
    const had = this.current, correct = (had !== null) === wentBack; let fresh = null;
    if (correct && had && !this.discovered.includes(had.id)) { this.discovered.push(had.id); fresh = had; }
    this.stats.loops++; if (!correct) this.stats.resets++;
    this.threshold = correct ? Math.min(GOAL, this.threshold + 1) : 0;
    this.setLoop(this.pick());
    this.hooks.onDecision?.(correct, fresh, this.threshold);
  }
  force(id) { this.setLoop(id ? byId(id) : null); }
  caught(why) {
    if (this.busy) return; this.busy = true; this.stats.resets++;
    this.hooks.onCaught?.(why, () => { this.threshold = 0; this.normals = 0; this.setLoop(null); this.spawn(); this.busy = false; });
  }
  update(dt) {
    if (this.busy) return;
    const p = this.player.pos, c = this.ctx, e = this.world.exitCentre(), d = this.world.extra;
    this.stats.time += dt; c.t += dt;
    if (this.current?.update) this.current.update(c, dt);
    if (this.busy) return;
    if (Math.abs(p.x) < 2 && p.z < -6.5) this.armed = true;
    if (p.x < ENTRY.x && p.z > 0) {                          // walked back out through the entry bend
      this.player.rotateAbout(ENTRY.x, ENTRY.z);
      if (this.armed) this.decide(true);
    } else if (p.x > e.x && p.z < -L - d + 0.2) {
      if (this.world.final) { if (this.player.ground > 1.55) { this.busy = true; this.hooks.onEnding?.(this.allFound, this.stats); } }
      else { this.player.translate(-16, L + 4 + d); this.decide(false); }
    }
  }
}
