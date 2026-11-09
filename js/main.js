/**
 * NetDrop-Web - Motor Principal & Gestión de Temas
 * Compatible con la especificación de 5 temas de themes.json
 */

const THEMES = [
  { id: 'warm', name: 'Cálido Terracota', color: '#c85a32' },
  { id: 'dark-slate', name: 'Oscuro Minimal', color: '#6366f1' },
  { id: 'forest', name: 'Bosque Verde', color: '#2d6a4f' },
  { id: 'midnight-amber', name: 'Noche Ámbar', color: '#d97706' },
  { id: 'nordic', name: 'Nórdico Frío', color: '#2563eb' }
];

export function initThemeEngine() {
  const savedTheme = localStorage.getItem('netdrop_theme') || 'warm';
  applyTheme(savedTheme, false);

  const themeBtn = document.getElementById('theme-menu-btn');
  const themeDropdown = document.getElementById('theme-dropdown');

  if (themeBtn && themeDropdown) {
    // Generar opciones en el dropdown
    themeDropdown.innerHTML = THEMES.map(t => `
      <button type="button" class="theme-option ${t.id === savedTheme ? 'active' : ''}" data-theme-id="${t.id}">
        <span class="palette-dot" style="background: ${t.color}"></span>
        <span>${t.name}</span>
      </button>
    `).join('');

    themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeDropdown.classList.toggle('show');
    });

    themeDropdown.addEventListener('click', (e) => {
      const option = e.target.closest('.theme-option');
      if (!option) return;
      const themeId = option.getAttribute('data-theme-id');
      applyTheme(themeId, true);
      themeDropdown.classList.remove('show');
    });

    document.addEventListener('click', (e) => {
      if (!themeBtn.contains(e.target) && !themeDropdown.contains(e.target)) {
        themeDropdown.classList.remove('show');
      }
    });
  }
}

export function applyTheme(themeId, save = true) {
  const root = document.documentElement;
  if (themeId === 'warm') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', themeId);
  }

  if (save) {
    localStorage.setItem('netdrop_theme', themeId);
  }

  // Actualizar preview en botón
  const current = THEMES.find(t => t.id === themeId) || THEMES[0];
  const preview = document.querySelector('.theme-color-preview');
  if (preview) {
    preview.style.background = current.color;
  }
  const themeNameLabel = document.querySelector('.theme-btn-name');
  if (themeNameLabel) {
    themeNameLabel.textContent = current.name;
  }

  // Actualizar clase activa en dropdown
  document.querySelectorAll('.theme-option').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-theme-id') === themeId);
  });

  // Notificar a componentes (como three.js)
  window.dispatchEvent(new CustomEvent('netdrop-theme-change', { detail: { themeId, theme: current } }));
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
  initThemeEngine();
});
