// Anomaly: An extra door
export default {
  id: 'extra-door',
  tier: 'easy',
  name: { ar: 'باب إضافي', en: 'An extra door' },
  enable({ world }) { world.props.extraDoor.visible = true; },
  disable({ world }) { world.props.extraDoor.visible = false; },
};
