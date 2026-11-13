// Anomaly: Bench faces the wall
export default {
  id: 'bench-turned',
  tier: 'medium',
  name: { ar: 'الكرسي يواجه الجدار', en: 'Bench faces the wall' },
  enable({ world }) { world.props.bench2.rotation.y = Math.PI; },
  disable({ world }) { world.props.bench2.rotation.y = 0; },
};
