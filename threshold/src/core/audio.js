// Web Audio manager: groups, positional emitters (HRTF), gesture unlock, file-or-synth loading.
import { SYNTH } from './synth.js';

export class AudioMgr {
  constructor() { this.ctx = null; this.buffers = {}; this.groups = {}; this.volume = 0.8; this.loops = new Set(); }
  // Buffers are built on an offline context so nothing touches a live AudioContext before a gesture.
  async init(onProgress) {
    const OC = window.OfflineAudioContext || window.webkitOfflineAudioContext, c = new OC(2, 2, 44100);
    let files = []; try { files = (await (await fetch('./audio/manifest.json')).json()).files || []; } catch { /* synth only */ }
    const ids = Object.keys(SYNTH); let done = 0;
    for (const id of ids) {
      const f = files.find((x) => x.replace(/\.\w+$/, '') === id);
      if (f) { try { this.buffers[id] = await c.decodeAudioData(await (await fetch(`./audio/${f}`)).arrayBuffer()); } catch { /* fall through */ } }
      if (!this.buffers[id]) this.buffers[id] = SYNTH[id](c);
      onProgress?.(++done / ids.length);
      if (done % 3 === 0) await new Promise((r) => setTimeout(r));
    }
  }
  start() {
    if (this.ctx) { this.unlock(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; this.ctx = new AC({ latencyHint: 'interactive' });
    const c = this.ctx; this.master = c.createGain(); this.master.gain.value = this.volume;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; this.master.connect(comp).connect(c.destination);
    for (const g of ['sfx', 'amb', 'music', 'ui']) { this.groups[g] = c.createGain(); this.groups[g].connect(this.master); }
  }
  unlock() { if (this.ctx?.state === 'suspended') this.ctx.resume(); }
  suspend(v) { if (!this.ctx) return; v ? this.ctx.suspend() : this.ctx.resume(); }
  setVolume(v) { this.volume = v; if (this.master) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05); }
  fadeGroup(g, v, tc = 0.4) { if (this.ctx) this.groups[g]?.gain.setTargetAtTime(v, this.ctx.currentTime, tc); }
  setListener(cam) {
    if (!this.ctx) return;
    const l = this.ctx.listener, p = cam.position, e = cam.matrixWorld.elements;
    if (l.positionX) { const t = this.ctx.currentTime; l.positionX.setValueAtTime(p.x, t); l.positionY.setValueAtTime(p.y, t); l.positionZ.setValueAtTime(p.z, t); l.forwardX.setValueAtTime(-e[8], t); l.forwardY.setValueAtTime(-e[9], t); l.forwardZ.setValueAtTime(-e[10], t); l.upX.setValueAtTime(e[4], t); l.upY.setValueAtTime(e[5], t); l.upZ.setValueAtTime(e[6], t); }
    else { l.setPosition(p.x, p.y, p.z); l.setOrientation(-e[8], -e[9], -e[10], e[4], e[5], e[6]); }
  }
  // opts: pos {x,y,z}, vol, rate, loop, group, ref, lowpass
  play(id, o = {}) {
    const c = this.ctx, b = this.buffers[id]; if (!c || !b) return null;
    const src = c.createBufferSource(); src.buffer = b; src.loop = !!o.loop; src.playbackRate.value = o.rate || 1;
    if (o.loop && b.duration > 1) { src.loopStart = 0.03; src.loopEnd = b.duration - 0.06; }   // skip mp3 encoder padding so loops stay seamless
    const gain = c.createGain(); gain.gain.value = o.vol ?? 1; let node = src;
    if (o.lowpass) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lowpass; node.connect(f); node = f; }
    node.connect(gain); let pan = null;
    if (o.pos) {
      pan = c.createPanner(); pan.panningModel = 'HRTF'; pan.distanceModel = 'inverse'; pan.refDistance = o.ref ?? 1.6; pan.rolloffFactor = o.rolloff ?? 1.5; pan.maxDistance = 60;
      pan.positionX.value = o.pos.x; pan.positionY.value = o.pos.y ?? 1.4; pan.positionZ.value = o.pos.z; gain.connect(pan); pan.connect(this.groups[o.group || 'sfx']);
    } else gain.connect(this.groups[o.group || 'sfx']);
    src.start(c.currentTime + (o.delay || 0), o.loop ? Math.random() * b.duration : 0);
    const h = {
      src, gain, pan,
      stop: (fade = 0.15) => { try { gain.gain.setTargetAtTime(0, c.currentTime, fade / 3); src.stop(c.currentTime + fade + 0.05); } catch { /* already stopped */ } this.loops.delete(h); },
      setPos: (x, y, z) => { if (pan) { pan.positionX.value = x; pan.positionY.value = y; pan.positionZ.value = z; } },
      setVol: (v, tc = 0.1) => gain.gain.setTargetAtTime(v, c.currentTime, tc),
    };
    if (o.loop) this.loops.add(h);
    return h;
  }
}
