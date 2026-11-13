// Procedural humanoid used for the distant figure, the runner and the glass reflection.
import * as THREE from 'three';

export function makeFigure({ color = 0x0a0b0c, mat } = {}) {
  const M = mat || new THREE.MeshStandardMaterial({ color, roughness: 0.92 });
  const g = new THREE.Group(), add = (geo, x, y, z, parent = g) => { const m = new THREE.Mesh(geo, M); m.position.set(x, y, z); m.userData.cast = true; m.castShadow = true; parent.add(m); return m; };
  const torso = add(new THREE.CapsuleGeometry(0.17, 0.4, 4, 12), 0, 1.2, 0); torso.scale.set(1.08, 1, 0.66);
  add(new THREE.SphereGeometry(0.175, 12, 8), 0, 0.93, 0).scale.set(1, 0.8, 0.7);
  add(new THREE.CylinderGeometry(0.05, 0.06, 0.12, 8), 0, 1.53, 0);
  const head = add(new THREE.SphereGeometry(0.108, 14, 10), 0, 1.67, 0); head.scale.set(0.92, 1.16, 1);
  const limb = (x, y, r, len) => {
    const p = new THREE.Group(); p.position.set(x, y, 0); g.add(p);
    add(new THREE.CapsuleGeometry(r, len, 3, 8), 0, -len / 2 - r * 0.5, 0, p); return p;
  };
  const armL = limb(-0.245, 1.44, 0.048, 0.56), armR = limb(0.245, 1.44, 0.048, 0.56);
  const legL = limb(-0.095, 0.9, 0.068, 0.76), legR = limb(0.095, 0.9, 0.068, 0.76);
  g.userData = { armL, armR, legL, legR, head, torso, mat: M };
  return g;
}
export function poseWalk(fig, phase, amp = 1) {
  const u = fig.userData, s = Math.sin(phase) * amp;
  u.legL.rotation.x = s * 0.85; u.legR.rotation.x = -s * 0.85; u.armL.rotation.x = -s; u.armR.rotation.x = s;
}
