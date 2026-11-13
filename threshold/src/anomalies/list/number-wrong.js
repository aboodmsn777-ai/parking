// Anomaly: the threshold digit is mirrored.
export default {
  id: 'number-wrong', tier: 'medium', name: { ar: 'رقم العتبة معكوس', en: 'Mirrored threshold number' },
  enable({ world, threshold }) { world.setNumber(threshold, true); },
  disable({ world, threshold }) { world.setNumber(threshold, false); },
};
