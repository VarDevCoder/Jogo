const KEY = 'arcana_save_v1';

const DEFAULTS = {
  gold: 0,
  meta: {},
  unlocks: {},
  best: { time: 0, level: 0, kills: 0 },
  totals: { runs: 0, kills: 0, gold: 0 },
  settings: { music: 0.6, sfx: 0.8 },
};

function deepMerge(base, extra) {
  const out = { ...base };
  for (const k of Object.keys(extra || {})) {
    if (extra[k] && typeof extra[k] === 'object' && !Array.isArray(extra[k])) {
      out[k] = deepMerge(base[k] || {}, extra[k]);
    } else {
      out[k] = extra[k];
    }
  }
  return out;
}

export class SaveData {
  constructor() {
    this.data = structuredClone ? structuredClone(DEFAULTS) : JSON.parse(JSON.stringify(DEFAULTS));
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) this.data = deepMerge(DEFAULTS, JSON.parse(raw));
    } catch { /* sin localStorage (modo privado, etc.) */ }
  }

  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.data));
    } catch { /* ignorar */ }
  }

  addGold(n) {
    this.data.gold += n;
    this.save();
  }

  spendGold(n) {
    if (this.data.gold < n) return false;
    this.data.gold -= n;
    this.save();
    return true;
  }

  metaLevel(id) {
    return this.data.meta[id] || 0;
  }

  buyMeta(id, cost) {
    if (!this.spendGold(cost)) return false;
    this.data.meta[id] = this.metaLevel(id) + 1;
    this.save();
    return true;
  }

  // Registra una partida terminada; devuelve qué récords se batieron.
  recordRun({ time, level, kills, gold }) {
    const b = this.data.best;
    const records = {
      time: time > b.time,
      level: level > b.level,
      kills: kills > b.kills,
    };
    if (records.time) b.time = time;
    if (records.level) b.level = level;
    if (records.kills) b.kills = kills;
    this.data.totals.runs += 1;
    this.data.totals.kills += kills;
    this.data.totals.gold += gold;
    this.data.gold += gold;
    this.save();
    return records;
  }

  reset() {
    this.data = structuredClone ? structuredClone(DEFAULTS) : JSON.parse(JSON.stringify(DEFAULTS));
    this.save();
  }
}
