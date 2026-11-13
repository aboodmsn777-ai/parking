// Anomaly: The yellow strip is broken
export default {
  id: 'strip-gone',
  tier: 'hard',
  name: { ar: 'الشريط الأصفر مقطوع', en: 'The yellow strip is broken' },
  enable({ world }) { world.strips[5].visible = false; world.strips[6].visible = false; },
  disable({ world }) { world.strips[5].visible = true; world.strips[6].visible = true; },
};
