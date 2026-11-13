// Anomaly: Handprints on the glass
export default {
  id: 'handprints',
  tier: 'medium',
  name: { ar: 'آثار أيدٍ على الزجاج', en: 'Handprints on the glass' },
  enable({ world }) { world.props.hands.visible = true; },
  disable({ world }) { world.props.hands.visible = false; },
};
