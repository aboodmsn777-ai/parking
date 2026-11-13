// Anomaly: every ambient sound cuts out at once when you reach the middle of the hall.
export default {
  id: 'ambient-silence', tier: 'hard', name: { ar: 'الصمت المفاجئ', en: 'Sudden silence' },
  enable(ctx) { ctx.data = { done: false }; },
  update({ player, audio, data }) { if (!data.done && player.pos.z < -19 && Math.abs(player.pos.x) < 2) { data.done = true; audio.fadeGroup('amb', 0, 0.015); } },
  disable({ audio }) { audio.fadeGroup('amb', 1, 0.5); },
};
