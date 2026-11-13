// Anomaly: One light is out
export default {
  id: 'fixture-off',
  tier: 'medium',
  name: { ar: 'مصباح مطفأ', en: 'One light is out' },
  enable({ world }) { world.hallLights[4].mul = 0; },
  disable({ world }) { world.hallLights[4].mul = 1; },
};
