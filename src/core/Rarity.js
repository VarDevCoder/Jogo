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

// La suerte (meta-progresión y cofres) desplaza peso desde lo común
// hacia las rarezas altas.
export function weightsFor(luck = 0) {
  return {
    comun: Math.max(8, Rarities.comun.weight - luck * 5),
    pocoComun: Rarities.pocoComun.weight,
    raro: Rarities.raro.weight + luck * 2,
    ultraRaro: Rarities.ultraRaro.weight + luck * 1.6,
    jackpot: Rarities.jackpot.weight + luck * 0.8,
  };
}

export function rollRarity(luck = 0, rng = Math.random) {
  const weights = weightsFor(luck);
  const total = Object.values(weights).reduce((s, w) => s + w, 0);
  let roll = rng() * total;
  for (const [id, w] of Object.entries(weights)) {
    roll -= w;
    if (roll < 0) return Rarities[id];
  }
  return Rarities.comun;
}
