export class UpgradeMenu {
  constructor(overlayEl) {
    this.overlay = overlayEl;
  }

  show(level, upgrades, onPick) {
    this.overlay.innerHTML = `
      <h2>¡Nivel ${level}!</h2>
      <p>Elige una mejora</p>
      <div class="upgrades"></div>
    `;
    const list = this.overlay.querySelector('.upgrades');
    for (const u of upgrades) {
      const btn = document.createElement('button');
      btn.className = 'upgrade';
      btn.innerHTML = `<b>${u.name}</b><span>${u.desc}</span>`;
      btn.onclick = () => {
        this.overlay.classList.add('hidden');
        onPick(u);
      };
      list.appendChild(btn);
    }
    this.overlay.classList.remove('hidden');
  }
}
