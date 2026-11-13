import '@fontsource/ibm-plex-sans-arabic/arabic-400.css';
import '@fontsource/ibm-plex-sans-arabic/latin-400.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css';
import '@fontsource/ibm-plex-sans-arabic/latin-600.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-700.css';
import '@fontsource/ibm-plex-sans-arabic/latin-700.css';
import './ui/ui.css';
import gsap from 'gsap';
import { createGfx, TIERS } from './core/renderer.js';
import { Input } from './core/input.js';
import { AudioMgr } from './core/audio.js';
import { save } from './core/save.js';
import { i18n } from './core/i18n.js';
import { buildWorld, LIGHT_Z } from './world/corridor.js';
import { Player } from './game/player.js';
import { Director } from './game/director.js';
import { UI } from './ui/ui.js';

gsap.ticker.lagSmoothing(0);
const params = new URLSearchParams(location.search);
const canvas = document.getElementById('view');
let state = 'loading';
const setState = (s) => { state = s; document.body.dataset.state = s; };
const tick = () => new Promise((r) => requestAnimationFrame(() => r()));

save.load(); i18n.set(save.data.settings.lang);
const audio = new AudioMgr(); audio.volume = save.data.settings.volume;
let gfx, world, player, director, input, ui, music = null, ambStarted = false, trainT = 30;

// ---------- quality
const order = ['low', 'medium', 'high']; let autoTier = 'high', floorTier = null, fpsAcc = 0, fpsN = 0, goodWindows = 0;
function applyQuality() {
  const q = params.get('q') || save.data.settings.quality, name = q === 'auto' ? autoTier : q;
  if (gfx.tier !== name || !applyQuality.done) { const t = gfx.setTier(name); world?.setShadows(t.shadows); applyQuality.done = true; }
}
function watchFps(dt) {
  if ((params.get('q') || save.data.settings.quality) !== 'auto' || (state !== 'playing' && state !== 'menu')) return;
  fpsAcc += dt; fpsN++;
  if (fpsAcc < 3) return;
  const fps = fpsN / fpsAcc, i = order.indexOf(autoTier); fpsAcc = fpsN = 0;
  if (fps < 43 && i > 0) { floorTier = autoTier; autoTier = order[i - 1]; goodWindows = 0; applyQuality(); }
  else if (fps > 57.5 && i < 2 && order[i + 1] !== floorTier) { if (++goodWindows >= 5) { autoTier = order[i + 1]; goodWindows = 0; applyQuality(); } }
  else goodWindows = 0;
}

// ---------- audio beds
function startAmbience() {
  if (ambStarted) return; ambStarted = true;
  for (const i of [1, 4, 6]) audio.play('amb_hum', { loop: true, group: 'amb', vol: 0.2, pos: { x: 0, y: 2.9, z: LIGHT_Z[i] }, ref: 2.2 });
  audio.play('amb_hum', { loop: true, group: 'amb', vol: 0.16, rate: 0.5, pos: { x: 1.5, y: 1, z: -13.5 }, ref: 1.4 });
  audio.play('amb_vent', { loop: true, group: 'amb', vol: 0.55, pos: world.props.ventPos, ref: 3 });
  audio.play('amb_room', { loop: true, group: 'amb', vol: 0.5 });
  world.events.flick = (l) => audio.play('flick', { pos: { x: 0, y: 2.8, z: l.z }, vol: 0.8, ref: 3.5 });
  world.events.drip = (p) => audio.play('drip', { pos: { x: p.x, y: 0.05, z: p.z }, vol: 0.7, ref: 2.6, rate: 0.9 + Math.random() * 0.25 });
}
function setMusic(on) {
  if (on && !music) { audio.fadeGroup('music', 1, 0.6); music = audio.play('music_menu', { loop: true, group: 'music', vol: 0.55 }); }
  else if (!on && music) { music.stop(2.2); music = null; }
}

// ---------- flow
const film = () => gfx.film.uniforms;
function toMenu() {
  audio.suspend(false); document.exitPointerLock?.(); input.enabled = false; input.reset();
  director.threshold = state === 'ending' ? 0 : director.threshold; director.busy = false; director.setLoop(null);
  if (state === 'ending') { save.data.inRun = false; save.data.threshold = 0; save.write(); }
  setState('menu'); audio.fadeGroup('amb', 0.3, 0.8); setMusic(true); gsap.killTweensOf([film().uFade, film().uFlash, player.lookOffset]);
  Object.assign(player.lookOffset, { yaw: 0, pitch: 0, roll: 0, y: 0 });
  gsap.to(film().uFlash, { value: 0, duration: 1.2 }); gsap.to(film().uFade, { value: 1, duration: 1.5 }); ui.show('menu');
}
function startRun(threshold) {
  if (state !== 'menu') return; setState('intro'); setMusic(false); ui.show(null);
  gsap.to(film().uFade, { value: 0, duration: 0.9, onComplete: () => {
    director.begin(threshold);
    const wake = () => {
      ui.show(null); setState('playing'); audio.fadeGroup('amb', 1, 1.5); lock();
      Object.assign(player.lookOffset, { pitch: -1.05, roll: 0.42, y: -1.0, yaw: 0.3 });
      gsap.to(player.lookOffset, { pitch: 0, roll: 0, y: 0, yaw: 0, duration: 3.6, ease: 'power2.inOut' });
      gsap.timeline().to(film().uFade, { value: 0.7, duration: 0.7 }).to(film().uFade, { value: 0.05, duration: 0.35 }).to(film().uFade, { value: 1, duration: 1.6, ease: 'power1.out' });
      gsap.delayedCall(2.2, () => { input.enabled = true; });
      if (!save.data.seenHint || threshold === 0) gsap.delayedCall(3.8, () => ui.hint(i18n.t(input.isTouch ? 'hintTouch' : 'hintDesk'), 7));
      save.data.seenHint = true; save.write();
    };
    if (threshold === 0 && !params.has('skipintro')) ui.intro([i18n.t('intro1'), i18n.t('intro2'), i18n.t('intro3')], wake); else wake();
  } });
}
function lock() { if (!input.isTouch && document.pointerLockElement !== canvas) { try { const p = canvas.requestPointerLock(); p?.catch?.(() => {}); } catch { /* not available */ } } }
function pause() { if (state !== 'playing') return; setState('paused'); input.reset(); ui.pauseInfo(director.threshold); ui.stack = []; ui.show('pause', { dur: 0.25 }); audio.suspend(true); document.exitPointerLock?.(); }
function resume() { if (state !== 'paused') return; setState('playing'); ui.show(null, { dur: 0.25 }); audio.suspend(false); lock(); }

const hooks = {
  onDecision(correct, fresh) {
    if (!correct) audio.play('thud', { vol: 0.5 });
    if (fresh) { ui.toast(fresh.name[i18n.lang]); audio.play('found', { group: 'ui', vol: 0.6 }); }
  },
  onCaught(why, done) {
    input.enabled = false; audio.play(why === 'runner' ? 'screech' : 'thud', { vol: 1.2 }); audio.play('heart', { vol: 1, delay: 0.5 });
    gsap.to(player.lookOffset, { roll: 0.5, pitch: -0.5, y: -0.7, duration: 0.5, ease: 'power3.in' });
    gsap.to(film().uFade, { value: 0, duration: 0.3, onComplete: () => gsap.delayedCall(1.9, () => {
      done(); Object.assign(player.lookOffset, { yaw: 0, pitch: 0, roll: 0, y: 0 });
      gsap.to(film().uFade, { value: 1, duration: 2.2 }); ui.hint(i18n.t('caught'), 3.5); gsap.delayedCall(1, () => { input.enabled = true; });
    }) });
  },
  onEnding(secret, stats) {
    input.enabled = false; audio.fadeGroup('amb', 0, 1.2); audio.fadeGroup('music', 1, 0.1); audio.play(secret ? 'whisper' : 'sting_end', { group: 'music', vol: 0.9 }); if (secret) audio.play('heart', { vol: 1, delay: 1 });
    film().uTint.value.set(secret ? 0x0a0000 : 0xf3efe6);
    save.data.endings[secret ? 'secret' : 'normal'] = true; save.write();
    gsap.to(film().uFlash, { value: 1, duration: 2.6, ease: 'power1.in', onComplete: () => { setState('ending'); document.exitPointerLock?.(); ui.ending(secret, stats, save.data.discovered.length); } });
  },
};

async function boot() {
  ui = new UI({ save, audio, on: {
    press: () => { audio.start(); startAmbience(); toMenuFromTitle(); },
    start: () => startRun(0), continue: () => startRun(save.data.threshold), resume, pause, menu: toMenu,
    exit: () => { setMusic(false); setState('bye'); ui.show('bye'); gsap.to(film().uFade, { value: 0, duration: 1.2 }); },
    quality: () => applyQuality(), volume: (v) => audio.setVolume(v), sens: (v) => { player.sens = v; },
  } });
  ui.show('loading', { dur: 0 }); ui.progress(0.05);
  await Promise.all(['400', '600', '700'].map((w) => document.fonts.load(`${w} 24px "IBM Plex Sans Arabic"`, 'العتبة Threshold 7'))).catch(() => {});
  ui.progress(0.15); await tick();
  gfx = createGfx(canvas);
  input = new Input(canvas, document.getElementById('touch')); document.body.classList.toggle('touch', input.isTouch);
  autoTier = input.isTouch ? ((navigator.hardwareConcurrency || 4) <= 4 ? 'low' : 'medium') : 'high';
  world = buildWorld(gfx.scene, { shadows: true }); ui.progress(0.45); await tick();
  player = new Player(gfx.camera); player.sens = save.data.settings.sens;
  player.onStep = (k) => audio.play('step' + (1 + ((Math.random() * 4) | 0)), { vol: 0.22 + 0.2 * k, rate: 0.94 + Math.random() * 0.12 });
  director = new Director({ world, player, audio, save, hooks }); director.setLoop(null); save.data.inRun = save.data.threshold > 0; 
  applyQuality(); world.bakeEnv(gfx.renderer); ui.progress(0.6); await tick();
  gfx.camera.position.set(0, 1.5, -6); gfx.renderer.compile(gfx.scene, gfx.camera); gfx.render(0);
  await audio.init((p) => ui.progress(0.6 + p * 0.4));
  ui.progress(1); await new Promise((r) => setTimeout(r, 350));
  setState('title'); ui.show('title', { dur: 1.2 });
  if (params.has('debug')) window.__t = { gsap, gfx, world, player, director, input, ui, audio, save, startRun, get state() { return state; }, hooks,
    freeze: (v) => { frozen = v; },
    settle: () => { gsap.killTweensOf([film().uFade, film().uFlash, player.lookOffset]); film().uFade.value = 1; film().uFlash.value = 0; Object.assign(player.lookOffset, { yaw: 0, pitch: 0, roll: 0, y: 0 }); input.enabled = true; },
    // headless helper: advance the simulation without rendering
    sim: (sec, mx = 0, my = 1) => { const st = 1 / 60; for (let t = 0; t < sec; t += st) { player.update(st, { move: { x: mx, y: my }, slow: false }, { dx: 0, dy: 0 }, world); director.update(st); world.update(st, time += st, player); } return { x: +player.pos.x.toFixed(2), z: +player.pos.z.toFixed(2), th: director.threshold, an: director.current?.id || null }; } };
  requestAnimationFrame(frame);
}
function toMenuFromTitle() { setState('menu'); audio.fadeGroup('amb', 0.3, 0.1); setMusic(true); ui.show('menu'); }

let last = performance.now(), time = 0, frozen = false;
function frame(now) {
  requestAnimationFrame(frame);
  const raw = (now - last) / 1000; last = now; const dt = Math.min(raw, 0.05);
  if (state === 'paused' || state === 'bye' || frozen) return;
  time += dt; watchFps(raw);
  if (state === 'playing') {
    const look = input.poll(); player.update(dt, input, look, world); director.update(dt);
    trainT -= dt; if (trainT < 0) { trainT = 45 + Math.random() * 70; audio.play('train', { group: 'amb', vol: 0.6, lowpass: 500 }); }
  } else if (state === 'menu' || state === 'title' || state === 'loading') {
    gfx.camera.position.set(0.25 + Math.sin(time * 0.11) * 0.2, 1.5 + Math.sin(time * 0.23) * 0.02, -5.6 - (Math.sin(time * 0.05) * 0.5 + 0.5) * 2.2);
    gfx.camera.rotation.set(Math.sin(time * 0.17) * 0.012 - 0.01, Math.sin(time * 0.09) * 0.05, Math.sin(time * 0.13) * 0.006);
  } else if (state === 'intro' || state === 'ending') { player.update(dt, { move: { x: 0, y: state === 'ending' ? 0.35 : 0 }, slow: false }, { dx: 0, dy: 0 }, world); }
  world.update(dt, time, state === 'playing' || state === 'ending' ? player : null);
  gfx.camera.updateMatrixWorld(); audio.setListener(gfx.camera);
  gfx.render(time);
}

addEventListener('resize', () => gfx?.resize());
canvas.addEventListener('click', () => { if (state === 'playing') lock(); });
document.addEventListener('pointerlockchange', () => { if (document.pointerLockElement !== canvas && state === 'playing' && !input.isTouch && !director.busy) pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
addEventListener('keydown', (e) => { if (e.code === 'Escape' || e.code === 'KeyP') { if (state === 'playing') pause(); else if (state === 'paused') resume(); } });
addEventListener('contextmenu', (e) => e.preventDefault());
boot();
