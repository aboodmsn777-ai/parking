// Anomaly: The sun became an eye
export default {
  id: 'poster-changed',
  tier: 'hard',
  name: { ar: 'الشمس صارت عينًا', en: 'The sun became an eye' },
  enable({ world }) { world.props.coast.setEye(true); },
  disable({ world }) { world.props.coast.setEye(false); },
};
