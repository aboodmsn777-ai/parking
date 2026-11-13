// Anomaly: The corridor is one metre longer
export default {
  id: 'corridor-longer',
  tier: 'hard',
  name: { ar: 'الممر أطول بمتر', en: 'The corridor is one metre longer' },
  enable({ world }) { world.setHallExtra(1); },
  disable({ world }) { world.setHallExtra(0); },
};
