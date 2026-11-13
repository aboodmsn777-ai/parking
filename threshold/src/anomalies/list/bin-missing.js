// Anomaly: The bin is gone
export default {
  id: 'bin-missing',
  tier: 'easy',
  name: { ar: 'سلة المهملات اختفت', en: 'The bin is gone' },
  enable({ world }) { world.props.bin.group.visible = false; world.props.bin.collider.on = false; },
  disable({ world }) { world.props.bin.group.visible = true; world.props.bin.collider.on = true; },
};
