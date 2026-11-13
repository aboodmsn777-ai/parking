// Anomaly: a human shadow on the floor with nobody casting it.
export default {
  id: 'orphan-shadow', tier: 'medium', name: { ar: 'ظل بلا صاحب', en: 'A shadow with no owner' },
  enable({ world }) { world.props.shadow.visible = true; },
  update({ world, t }) { const s = world.props.shadow; s.material.opacity = 0.58 + Math.sin(t * 0.9) * 0.05; s.rotation.z = Math.PI / 2 + 0.25 + Math.sin(t * 0.5) * 0.03; },
  disable({ world }) { world.props.shadow.visible = false; },
};
