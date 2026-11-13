// Anomaly (audio only): footsteps follow a few metres behind and stop a beat after you do.
export default {
  id: 'footsteps-behind', tier: 'medium', name: { ar: 'خطوات خلفك', en: 'Footsteps behind you' },
  enable(ctx) { ctx.data = { acc: 0, moving: false, extra: 0 }; },
  update({ player, audio, data }, dt) {
    const step = () => { const d = 2.7, x = player.pos.x + Math.sin(player.yaw) * d, z = player.pos.z + Math.cos(player.yaw) * d; audio.play('step' + (1 + ((Math.random() * 4) | 0)), { pos: { x, y: 0.1, z }, vol: 0.85, rate: 0.86, ref: 2.2 }); };
    if (player.speed > 0.6) { data.moving = true; data.acc += player.speed * dt; if (data.acc > 0.8) { data.acc = 0; step(); } }
    else if (data.moving) { data.moving = false; data.extra = 0.38; }
    if (data.extra > 0) { data.extra -= dt; if (data.extra <= 0) step(); }
  },
  disable() {},
};
