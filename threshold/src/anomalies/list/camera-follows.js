// Anomaly: The camera follows you
export default {
  id: 'camera-follows',
  tier: 'medium',
  name: { ar: 'الكاميرا تلاحقك', en: 'The camera follows you' },
  enable({ world }) { world.props.cctv.track = true; },
  disable({ world }) { world.props.cctv.track = false; },
};
