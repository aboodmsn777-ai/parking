// Anomaly: Mirrored exit sign
export default {
  id: 'exit-sign-wrong',
  tier: 'medium',
  name: { ar: 'لافتة المخرج معكوسة', en: 'Mirrored exit sign' },
  enable({ world }) { world.props.exitSign.setWrong(true); },
  disable({ world }) { world.props.exitSign.setWrong(false); },
};
