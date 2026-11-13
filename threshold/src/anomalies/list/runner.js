// Horror: something at the far end notices you and runs. Turn back and get out before it reaches you.
import { makeFigure, poseWalk } from '../../world/figure.js';
let fig = null;
export default {
  id: 'runner', tier: 'horror', name: { ar: 'كائن يركض نحوك', en: 'Something runs at you' },
  enable(ctx) {
    if (!fig) { fig = makeFigure({ color: 0x050505 }); fig.userData.armL.scale.y = fig.userData.armR.scale.y = 1.35; fig.userData.head.material = fig.userData.head.material.clone(); fig.userData.head.material.color.set(0x8f8a80); ctx.world.root.add(fig); }
    fig.visible = false; ctx.data = { phase: 0, t: 0, ph: 0, loop: null };
  },
  update({ world, player, audio, data, caught }, dt) {
    const p = player.pos;
    if (data.phase === 0) {
      if (Math.abs(p.x) < 2.1 && p.z < -14) { data.phase = 1; fig.position.set(0, 0, -50.5); fig.rotation.set(0, 0, 0); fig.visible = true; world.dynamicShadows = true; audio.play('screech', { pos: { x: 0, y: 1.6, z: -50 }, vol: 1.3, ref: 9 }); }
      return;
    }
    data.t += dt;
    if (data.phase === 1) { fig.userData.head.rotation.z = Math.sin(data.t * 31) * 0.25; if (data.t > 1.15) { data.phase = 2; data.loop = audio.play('run', { loop: true, pos: fig.position, vol: 1.3, ref: 4 }); } return; }
    let tx = p.x, tz = p.z; if (p.x < -2 && fig.position.z < -0.5) { tx = 0; tz = 2; }   // take the bend
    const dx = tx - fig.position.x, dz = tz - fig.position.z, d = Math.hypot(dx, dz) || 1, v = 6.3;
    fig.position.x += (dx / d) * v * dt; fig.position.z += (dz / d) * v * dt; fig.rotation.y = Math.atan2(dx, dz); fig.rotation.x = 0.28;
    data.ph += dt * 15; poseWalk(fig, data.ph, 1.25); data.loop?.setPos(fig.position.x, 0.3, fig.position.z);
    if (Math.hypot(p.x - fig.position.x, p.z - fig.position.z) < 0.95) caught('runner');
  },
  disable({ world, data }) { if (fig) fig.visible = false; data?.loop?.stop(0.1); world.dynamicShadows = false; },
};
