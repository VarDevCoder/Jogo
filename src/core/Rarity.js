export const Rarities = {
  comun: {
    id: 'comun',
    name: 'Muy Común',
    color: '#9aa0ae',
    mult: 1.0,
    weight: 45,
  },
  pocoComun: {
    id: 'pocoComun',
    name: 'Poco Común',
    color: '#5fffaf',
    mult: 1.5,
    weight: 30,
  },
  raro: {
    id: 'raro',
    name: 'Raro',
    color: '#4da6ff',
    mult: 2.2,
    weight: 15,
  },
  ultraRaro: {
    id: 'ultraRaro',
    name: 'Ultra Raro',
    color: '#c77dff',
    mult: 3.2,
    weight: 8,
  },
  jackpot: {
    id: 'jackpot',
    name: 'JACKPOT',
    color: '#ffd86b',
    mult: 1,
    weight: 2,
  },
};

const TOTAL_WEIGHT = Object.values(Rarities).reduce((s, r) => s + r.weight, 0);

export function rollRarity(rng = Math.random) {
  let roll = rng() * TOTAL_WEIGHT;
  for (const r of Object.values(Rarities)) {
    roll -= r.weight;
    if (roll < 0) return r;
  }
  return Rarities.comun;
}
