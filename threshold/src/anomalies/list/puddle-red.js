// Anomaly: A red pool on the floor
export default {
  id: 'puddle-red',
  tier: 'medium',
  name: { ar: 'بقعة حمراء على الأرض', en: 'A red pool on the floor' },
  enable({ world }) { const p = world.props.puddle; p.mat.color.set(0x420606); p.mesh.scale.set(2.7, 1.8, 1); },
  disable({ world }) { const p = world.props.puddle; p.mat.color.set(0x0b0d0e); p.mesh.scale.set(1.35, 0.9, 1); },
};
