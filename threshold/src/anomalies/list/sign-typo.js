// Anomaly: A wrong letter on the board
export default {
  id: 'sign-typo',
  tier: 'medium',
  name: { ar: 'حرف خاطئ في اللوحة', en: 'A wrong letter on the board' },
  enable({ world }) { world.props.board.setTypo(true); },
  disable({ world }) { world.props.board.setTypo(false); },
};
