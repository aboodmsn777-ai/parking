// Registry: every file in ./list is picked up automatically. See ADDING_ANOMALIES.md.
const mods = import.meta.glob('./list/*.js', { eager: true });
const ORDER = { easy: 0, medium: 1, hard: 2, horror: 3 };
export const ANOMALIES = Object.values(mods).map((m) => m.default).sort((a, b) => ORDER[a.tier] - ORDER[b.tier] || a.id.localeCompare(b.id));
export const byId = (id) => ANOMALIES.find((a) => a.id === id);
