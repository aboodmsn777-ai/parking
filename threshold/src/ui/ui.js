// DOM layer: screens, menus, settings, anomaly log, toast, hints. Game rules live elsewhere.
import gsap from 'gsap';
import { i18n } from '../core/i18n.js';
import { ANOMALIES } from '../anomalies/index.js';

const $ = (s) => document.querySelector(s);
export class UI {
  constructor({ save, audio, on }) {
    this.save = save; this.audio = audio; this.on = on; this.current = null; this.stack = [];
    document.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return; this.audio.play('ui_click', { group: 'ui', vol: 0.6 });
      const act = b.dataset.act; if (act) this.act(act);
    });
    document.addEventListener('pointerover', (e) => { if (e.target.closest?.('button') && e.pointerType === 'mouse') this.audio.play('ui_hover', { group: 'ui', vol: 0.5 }); });
    const seg = (id, key, cb) => $(id).addEventListener('click', (e) => { const v = e.target.closest('button')?.dataset.v; if (!v) return; this.save.data.settings[key] = v; this.save.write(); this.syncSettings(); cb(v); });
    seg('#setQuality', 'quality', (v) => this.on.quality(v)); seg('#setLang', 'lang', (v) => { i18n.set(v); this.refresh(); });
    $('#setVolume').addEventListener('input', (e) => { this.save.data.settings.volume = +e.target.value; this.save.write(); this.on.volume(+e.target.value); });
    $('#setSens').addEventListener('input', (e) => { this.save.data.settings.sens = +e.target.value; this.save.write(); this.on.sens(+e.target.value); });
    $('#press').addEventListener('click', () => this.on.press());
    $('#pauseBtn').addEventListener('click', () => this.on.pause());
    this.syncSettings(); this.refresh();
  }
  act(a) {
    if (a === 'settings' || a === 'anomalies') { this.stack.push(this.current); this.show(a); }
    else if (a === 'back') this.show(this.stack.pop() || 'menu');
    else this.on[a]?.();
  }
  show(name, { dur = 0.5 } = {}) {
    const prev = this.current && $('#' + this.current), next = name && $('#' + name);
    if (prev && prev !== next) gsap.to(prev, { opacity: 0, duration: dur * 0.6, overwrite: true, onComplete: () => prev.classList.remove('on') });
    this.current = name; if (!next) return;
    next.classList.add('on'); gsap.to(next, { opacity: 1, duration: dur, overwrite: true });
    if (name === 'menu') { this.refresh(); gsap.fromTo('#menu nav button:not([hidden])', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: 'power3.out', delay: 0.15 }); gsap.fromTo('#menu .brand', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }); }
    if (name === 'anomalies') this.refresh();
  }
  progress(p) { $('#bar').style.transform = `scaleX(${p})`; $('#pct').textContent = Math.round(p * 100) + '%'; }
  syncSettings() {
    const s = this.save.data.settings;
    for (const [id, v] of [['#setQuality', s.quality], ['#setLang', s.lang]]) document.querySelectorAll(id + ' button').forEach((b) => b.classList.toggle('sel', b.dataset.v === v));
    $('#setVolume').value = s.volume; $('#setSens').value = s.sens;
  }
  refresh() {
    const d = this.save.data, n = d.discovered.length, total = ANOMALIES.length, frac = `${i18n.num(n)} / ${i18n.num(total)}`;
    $('#foundN').textContent = frac; $('#foundN2').textContent = frac;
    const cont = document.querySelector('[data-act=continue]'); cont.hidden = !(d.inRun && d.threshold > 0); $('#contN').textContent = `${i18n.t('threshold')} ${i18n.num(d.threshold)}`;
    const tierName = { easy: 'easy', medium: 'mediumT', hard: 'hard', horror: 'horror' };
    $('#anomList').innerHTML = ANOMALIES.map((a) => { const got = d.discovered.includes(a.id); return `<li class="${got ? 'got' : ''}"><span>${got ? a.name[i18n.lang] : i18n.t('unknown')}</span><small class="${a.tier}">${i18n.t(tierName[a.tier])}</small></li>`; }).join('');
    $('#secretLine').textContent = d.endings.secret ? i18n.t('secretDone') : i18n.t('secretHint');
    $('#menuFoot').textContent = d.endings.secret ? i18n.t('secretDone') : '';
    document.querySelectorAll('#menuNav em').forEach((el, i) => { el.textContent = i18n.num(String(i).padStart(2, '0')); });
  }
  toast(name) { $('#toastName').textContent = name; gsap.timeline().fromTo('#toast', { opacity: 0, x: i18n.lang === 'ar' ? 20 : -20 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }).to('#toast', { opacity: 0, duration: 0.8, delay: 3.2 }); }
  hint(text, hold = 6) { const h = $('#hint'); h.textContent = text; gsap.timeline().to(h, { opacity: 1, duration: 0.8 }).to(h, { opacity: 0, duration: 1, delay: hold }); }
  intro(lines, done) {
    this.show('intro'); const el = $('#introLine'), tl = gsap.timeline({ onComplete: done }); this.introTl = tl;
    for (const l of lines) tl.call(() => { el.textContent = l; }).to(el, { opacity: 1, duration: 1.1, ease: 'power1.out' }).to(el, { opacity: 0, duration: 0.9, delay: 1.5 });
    const skip = () => { tl.progress(1); }; $('#intro').addEventListener('click', skip, { once: true });
  }
  pauseInfo(n) { $('#pauseInfo').textContent = `${i18n.t('threshold')} ${i18n.num(n)}`; }
  ending(secret, stats, found) {
    const mm = Math.floor(stats.time / 60), ss = Math.floor(stats.time % 60), e = $('#ending'); e.classList.toggle('dark', secret);
    $('#endTitle').textContent = i18n.t(secret ? 'secretTitle' : 'endTitle'); $('#endText').textContent = i18n.t(secret ? 'secretText' : 'endText');
    $('#endStats').innerHTML = [['statTime', `${i18n.num(mm)}:${i18n.num(String(ss).padStart(2, '0'))}`], ['statLoops', i18n.num(stats.loops)], ['statResets', i18n.num(stats.resets)], ['statFound', `${i18n.num(found)}/${i18n.num(ANOMALIES.length)}`]].map(([k, v]) => `<dt>${i18n.t(k)}</dt><dd>${v}</dd>`).join('');
    this.show('ending', { dur: 2.2 });
  }
}
