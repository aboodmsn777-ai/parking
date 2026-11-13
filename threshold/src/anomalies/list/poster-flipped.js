// Anomaly: Upside-down poster
export default {
  id: 'poster-flipped',
  tier: 'easy',
  name: { ar: 'لوحة الإعلان مقلوبة', en: 'Upside-down poster' },
  enable({ world }) { world.props.coast.panel.rotation.z = Math.PI; },
  disable({ world }) { world.props.coast.panel.rotation.z = 0; },
};
