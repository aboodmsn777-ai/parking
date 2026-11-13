// Anomaly: Clock runs backwards
export default {
  id: 'clock-reverse',
  tier: 'easy',
  name: { ar: 'الساعة تمشي بالعكس', en: 'Clock runs backwards' },
  enable({ world }) { world.props.clock.dir = -1; },
  disable({ world }) { world.props.clock.dir = 1; },
};
