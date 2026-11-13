// Anomaly: Red lighting
export default {
  id: 'red-lights',
  tier: 'easy',
  name: { ar: 'الإضاءة حمراء', en: 'Red lighting' },
  enable({ world }) { for (const l of world.hallLights.slice(1)) { l.color.set(0xff2414); l.mul = 0.85; } },
  disable({ world }) { world.resetLights(); },
};
