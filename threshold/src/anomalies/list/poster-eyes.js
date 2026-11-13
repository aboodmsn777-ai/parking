// Anomaly: The poster is watching
export default {
  id: 'poster-eyes',
  tier: 'medium',
  name: { ar: 'عيون الملصق تتحرك', en: 'The poster is watching' },
  enable({ world }) { world.props.eyes.track = true; },
  disable({ world }) { world.props.eyes.track = false; },
};
