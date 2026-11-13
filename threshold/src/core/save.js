const KEY = 'threshold.save.v1';
const defaults = () => ({ settings: { quality: 'auto', volume: 0.8, sens: 1, lang: (navigator.language || 'ar').startsWith('ar') ? 'ar' : 'en' }, discovered: [], threshold: 0, inRun: false, endings: { normal: false, secret: false }, seenHint: false });
export const save = {
  data: defaults(),
  load() { try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); if (d) { const b = defaults(); this.data = { ...b, ...d, settings: { ...b.settings, ...d.settings }, endings: { ...b.endings, ...d.endings } }; } } catch { /* storage unavailable */ } return this.data; },
  write() { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch { /* ignore */ } },
};
