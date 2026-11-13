// Anomaly: Vending machine is dark
export default {
  id: 'vending-dark',
  tier: 'easy',
  name: { ar: 'آلة البيع مطفأة', en: 'Vending machine is dark' },
  enable({ world }) { world.props.vending.setOn(false); },
  disable({ world }) { world.props.vending.setOn(true); },
};
