// Anomaly: someone stands motionless at the far end of the hall.
import { makeFigure } from '../../world/figure.js';
let fig = null;
export default {
  id: 'distant-figure', tier: 'hard', name: { ar: 'شخص واقف في آخر الممر', en: 'Someone standing at the far end' },
  enable({ world }) {
    if (!fig) { fig = makeFigure(); world.root.add(fig); }
    fig.position.set(0.55, 0, -53.4); fig.visible = true;
  },
  disable() { if (fig) fig.visible = false; },
};
