// Anomaly: Stretched wall tiles
export default {
  id: 'long-tiles',
  tier: 'medium',
  name: { ar: 'البلاط صار أطول', en: 'Stretched wall tiles' },
  enable({ world }) { world.bays.east[4].userData.tile.material = world.mats.tileLong; },
  disable({ world }) { world.bays.east[4].userData.tile.material = world.mats.tile; },
};
