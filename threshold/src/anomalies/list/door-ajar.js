// Anomaly: the staff door stands ajar; something whispers when you come close.
export default {
  id: 'door-ajar', tier: 'medium', name: { ar: 'باب الخدمة موارب', en: 'The staff door is ajar' },
  enable(ctx) { ctx.world.props.door.leaf.rotation.y = -0.5; ctx.data = { said: false }; },
  update({ player, audio, data }) { if (!data.said && Math.abs(player.pos.z + 33.5) < 4 && Math.abs(player.pos.x) < 2) { data.said = true; audio.play('whisper', { pos: { x: 2.3, y: 1.4, z: -33.5 }, vol: 0.9, ref: 2 }); } },
  disable({ world }) { world.props.door.leaf.rotation.y = 0; },
};
