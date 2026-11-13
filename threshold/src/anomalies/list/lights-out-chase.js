// Horror: the tubes die one after another, from the far end towards you. Stay in the dark and it takes you.
export default {
  id: 'lights-out-chase', tier: 'horror', name: { ar: 'الأضواء تنطفئ نحوك', en: 'The lights go out towards you' },
  enable(ctx) { ctx.data = { started: false, i: 0, timer: 0, dark: 0, front: -999 }; },
  update({ world, player, audio, data, caught }, dt) {
    const hl = world.hallLights, inHall = Math.abs(player.pos.x) < 2.1 && player.pos.z < -5;
    if (!data.started) { if (inHall && player.pos.z < -15) { data.started = true; data.i = hl.length - 1; data.timer = 0.5; audio.play('thud', { vol: 0.5 }); } return; }
    data.timer -= dt;
    if (data.timer <= 0 && data.i >= 0) {
      const l = hl[data.i]; l.mul = 0; data.front = l.z; audio.play('zap', { pos: { x: 0, y: 2.8, z: l.z }, vol: 1.2, ref: 5 });
      data.timer = Math.max(0.5, 1.2 - (hl.length - 1 - data.i) * 0.09); data.i--;
    }
    if (inHall && player.pos.z < data.front + 2.5) { data.dark += dt; if (data.dark > 2.3) caught('dark'); } else data.dark = Math.max(0, data.dark - dt);
  },
  disable({ world }) { world.resetLights(); },
};
