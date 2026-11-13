// Anomaly: Your reflection lags behind
export default {
  id: 'late-reflection',
  tier: 'hard',
  name: { ar: 'انعكاسك متأخر', en: 'Your reflection lags behind' },
  enable({ world }) { world.props.reflection.delay = 0.5; },
  disable({ world }) { world.props.reflection.delay = 0; },
};
