export class UpgradeMenu {
  constructor(overlayEl) {
    this.overlay = overlayEl;
  }

  show(level, cards, onPick) {
    this.overlay.innerHTML = `
      <h2>¡Nivel ${level}!</h2>
      <p>Elige una carta</p>
      <div class="cards"></div>
    `;
    const list = this.overlay.querySelector('.cards');
    cards.forEach((card, i) => {
      const btn = document.createElement('button');
      btn.className = `card r-${card.rarity.id}`;
      btn.style.animationDelay = `${i * 0.12}s`;
      btn.innerHTML = `
        <span class="cardRarity">${card.unique ? '✦ ' + card.rarity.name + ' ✦' : card.rarity.name}</span>
        <span class="cardIcon">${card.icon}</span>
        <span class="cardName">${card.name}</span>
        <span class="cardDesc">${card.desc}</span>
      `;
      btn.onclick = () => {
        this.overlay.classList.add('hidden');
        onPick(card);
      };
      list.appendChild(btn);
    });
    this.overlay.classList.remove('hidden');
  }
}
