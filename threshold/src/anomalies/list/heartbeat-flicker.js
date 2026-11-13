// Anomaly: the far tube blinks in a lub-dub heartbeat rhythm instead of random flicker.
export default {
  id: 'heartbeat-flicker', tier: 'hard', name: { ar: 'إضاءة تنبض كالقلب', en: 'A light that beats like a heart' },
  enable() {},
  update({ world, t }) { const p = t % 1.08, l = world.hallLights[7]; l.mul = p < 0.1 ? 0.12 : p > 0.27 && p < 0.35 ? 0.3 : 1; },
  disable({ world }) { world.hallLights[7].mul = 1; },
};
