// Keyboard + pointer-lock mouse on desktop; virtual stick + drag-look on touch.
export class Input {
  constructor(canvas, touchLayer) {
    this.canvas = canvas; this.move = { x: 0, y: 0 }; this.slow = false; this.dx = 0; this.dy = 0; this.keys = new Set(); this.enabled = false;
    this.isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    addEventListener('keydown', (e) => { this.keys.add(e.code); });
    addEventListener('keyup', (e) => { this.keys.delete(e.code); });
    addEventListener('blur', () => this.keys.clear());
    this.lockAt = 0; const cl = (v) => Math.max(-160, Math.min(160, v));
    document.addEventListener('pointerlockchange', () => { this.lockAt = performance.now(); this.dx = this.dy = 0; });
    // browsers can report one huge delta right after the lock engages: ignore a short window and clamp spikes
    document.addEventListener('mousemove', (e) => { if (document.pointerLockElement === canvas && this.enabled && performance.now() - this.lockAt > 180) { this.dx += cl(e.movementX); this.dy += cl(e.movementY); } });
    // fallback when pointer lock is refused (e.g. sandboxed iframes): hold the mouse button and drag to look
    let drag = false; canvas.addEventListener('mousedown', () => { drag = true; }); addEventListener('mouseup', () => { drag = false; });
    document.addEventListener('mousemove', (e) => { if (drag && this.enabled && document.pointerLockElement !== canvas) { this.dx += cl(e.movementX) * 1.6; this.dy += cl(e.movementY) * 1.6; } });
    this.stick = { id: null, ox: 0, oy: 0, x: 0, y: 0 }; this.look = { id: null, x: 0, y: 0 };
    const base = touchLayer.querySelector('.stick-base'), knob = touchLayer.querySelector('.stick-knob');
    const R = 56, show = (v) => { base.style.opacity = knob.style.opacity = v ? 1 : 0; };
    const place = () => { base.style.transform = `translate(${this.stick.ox - 60}px,${this.stick.oy - 60}px)`; knob.style.transform = `translate(${this.stick.ox + this.stick.x * R - 26}px,${this.stick.oy + this.stick.y * R - 26}px)`; };
    touchLayer.addEventListener('touchstart', (e) => {
      if (!this.enabled) return; e.preventDefault();
      for (const t of e.changedTouches) {
        if (this.stick.id === null && t.clientX < innerWidth * 0.45) { Object.assign(this.stick, { id: t.identifier, ox: t.clientX, oy: t.clientY, x: 0, y: 0 }); show(true); place(); }
        else if (this.look.id === null) Object.assign(this.look, { id: t.identifier, x: t.clientX, y: t.clientY });
      }
    }, { passive: false });
    touchLayer.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === this.stick.id) { let x = (t.clientX - this.stick.ox) / R, y = (t.clientY - this.stick.oy) / R; const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } this.stick.x = x; this.stick.y = y; place(); }
        else if (t.identifier === this.look.id) { this.dx += (t.clientX - this.look.x) * 2.4; this.dy += (t.clientY - this.look.y) * 2.4; this.look.x = t.clientX; this.look.y = t.clientY; }
      }
    }, { passive: false });
    const end = (e) => { for (const t of e.changedTouches) { if (t.identifier === this.stick.id) { this.stick.id = null; this.stick.x = this.stick.y = 0; show(false); } if (t.identifier === this.look.id) this.look.id = null; } };
    touchLayer.addEventListener('touchend', end); touchLayer.addEventListener('touchcancel', end);
  }
  poll() {
    const k = this.keys; let x = 0, y = 0;
    if (k.has('KeyW') || k.has('ArrowUp')) y += 1; if (k.has('KeyS') || k.has('ArrowDown')) y -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) x += 1; if (k.has('KeyA') || k.has('ArrowLeft')) x -= 1;
    const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
    if (this.stick.id !== null) { x = this.stick.x; y = -this.stick.y; }
    if (!this.enabled) x = y = 0;
    this.move.x = x; this.move.y = y; this.slow = k.has('ShiftLeft') || k.has('ShiftRight');
    const d = { dx: this.dx, dy: this.dy }; this.dx = this.dy = 0; return d;
  }
  reset() { this.keys.clear(); this.dx = this.dy = 0; this.stick.id = this.look.id = null; this.stick.x = this.stick.y = 0; }
}
