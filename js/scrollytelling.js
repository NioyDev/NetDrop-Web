/**
 * NetDrop-Web - Scrollytelling Engine (#como-funciona)
 * Control progresivo por scroll (scrub), cero scroll-jacking y CSS-driven fallback
 */

const THEMES_PRESET = ['#faf8f5', '#0f172a', '#f2f7f4', '#1a1918', '#f0f4f8'];
const THEME_NAMES = ['Cálido Terracota', 'Oscuro Minimal', 'Bosque Verde', 'Noche Ámbar', 'Nórdico Frío'];

export class ScrollytellingController {
  constructor() {
    this.container = document.querySelector('.scrolly-container');
    if (!this.container) return;

    this.steps = document.querySelectorAll('.scrolly-step-card');
    this.stage = document.querySelector('.scrolly-stage');
    this.pcScreen = document.getElementById('scrolly-pc-screen');
    this.phoneScreen = document.getElementById('scrolly-phone-screen');
    this.flyingChunk = document.getElementById('scrolly-flying-chunk');

    this.currentStep = 1;
    this.ticking = false;

    this.init();
  }

  init() {
    // Escucha pasiva de scroll para scrub suave
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        window.requestAnimationFrame(() => {
          this.updateOnScroll();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }, { passive: true });

    this.updateOnScroll();
  }

  updateOnScroll() {
    const triggerPoint = window.innerHeight * 0.45;
    let activeIndex = 0;

    this.steps.forEach((step, idx) => {
      const rect = step.getBoundingClientRect();
      if (rect.top <= triggerPoint && rect.bottom >= triggerPoint) {
        activeIndex = idx;
      }
    });

    const stepNum = activeIndex + 1;
    if (stepNum !== this.currentStep) {
      this.currentStep = stepNum;
      this.renderStepState(stepNum);
    }

    // Actualizar clases de opacidad activa en tarjetas de texto
    this.steps.forEach((step, idx) => {
      step.classList.toggle('active-step', idx === activeIndex);
    });
  }

  renderStepState(step) {
    if (!this.pcScreen || !this.phoneScreen) return;

    switch(step) {
      case 1: // Arranque
        this.pcScreen.innerHTML = `
          <div class="screen-header">
            <span class="screen-brand">NetDrop Desktop</span>
            <span class="screen-ip">Puerto :5000</span>
          </div>
          <div style="margin-top: 1rem; text-align: center; color: var(--accent);">
            <div style="font-weight: 700; font-size: 0.85rem;">Servidor Iniciado ✓</div>
            <div style="font-size: 0.65rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 0.3rem;">http://0.0.0.0:5000</div>
          </div>
        `;
        this.phoneScreen.innerHTML = `
          <div class="phone-notch"></div>
          <div style="flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; color: var(--text-muted); font-size: 0.7rem;">
            En espera de conexión Wi-Fi
          </div>
        `;
        if (this.flyingChunk) this.flyingChunk.style.opacity = '0';
        break;

      case 2: // Descubrimiento y QR
        this.pcScreen.innerHTML = `
          <div class="screen-header">
            <span class="screen-brand">NetDrop Desktop</span>
            <span class="screen-ip">192.168.1.15:5000</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 0.6rem;">
            <div style="width: 80px; height: 80px; background: #ffffff; border-radius: 6px; padding: 6px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <rect x="5" y="5" width="30" height="30" fill="#111" />
                <rect x="10" y="10" width="20" height="20" fill="#fff" />
                <rect x="15" y="15" width="10" height="10" fill="#111" />
                <rect x="65" y="5" width="30" height="30" fill="#111" />
                <rect x="70" y="10" width="20" height="20" fill="#fff" />
                <rect x="75" y="15" width="10" height="10" fill="#111" />
                <rect x="5" y="65" width="30" height="30" fill="#111" />
                <rect x="10" y="70" width="20" height="20" fill="#fff" />
                <rect x="15" y="75" width="10" height="10" fill="#111" />
                <circle cx="50" cy="50" r="12" fill="var(--accent)" />
              </svg>
            </div>
            <span style="font-size: 0.62rem; color: var(--accent); margin-top: 0.4rem; font-weight: 600;">Escanea con tu celular</span>
          </div>
        `;
        this.phoneScreen.innerHTML = `
          <div class="phone-notch"></div>
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: var(--text-muted); font-size: 0.68rem; gap: 0.4rem;">
            <div style="width: 70px; height: 70px; border: 2px dashed var(--accent); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <svg class="icon icon--lg" style="color: var(--accent);" aria-hidden="true"><use href="#i-qr"/></svg>
            </div>
            <span>Abriendo cámara...</span>
          </div>
        `;
        break;

      case 3: // Conexión móvil
        this.phoneScreen.innerHTML = `
          <div class="phone-notch"></div>
          <div class="screen-header" style="margin-top: 0.2rem;">
            <span class="screen-brand">NetDrop</span>
            <span class="screen-ip">Conectado ✓</span>
          </div>
          <div class="screen-dropzone" style="margin-top: 0.4rem;">
            <span style="font-weight: 600; font-size: 0.65rem;">Toca para enviar</span>
            <div style="font-size: 0.55rem; color: var(--text-muted);">o arrastra archivos</div>
          </div>
        `;
        break;

      case 4: // Subida en Chunks de 2 MB
        this.phoneScreen.innerHTML = `
          <div class="phone-notch"></div>
          <div class="screen-header">
            <span class="screen-brand">Subiendo...</span>
            <span class="screen-ip">8 MB total</span>
          </div>
          <div style="margin-top: 0.5rem; background: var(--surface); padding: 0.5rem; border-radius: 6px; border: 1px solid var(--accent);">
            <div style="font-weight: 600; font-size: 0.68rem; color: var(--text-heading);">video_vacaciones.mp4</div>
            <div style="font-size: 0.58rem; color: var(--accent); margin-top: 0.2rem;">Chunk 3 de 4 (2 MB)</div>
            <div style="width: 100%; height: 6px; background: var(--surface-elevated); border-radius: 3px; margin-top: 0.4rem; overflow: hidden;">
              <div style="width: 75%; height: 100%; background: var(--accent);"></div>
            </div>
          </div>
        `;
        this.pcScreen.innerHTML = `
          <div class="screen-header">
            <span class="screen-brand">NetDrop Desktop</span>
            <span class="screen-ip">Ensamblado .partials</span>
          </div>
          <div style="margin-top: 0.8rem; background: var(--surface); padding: 0.6rem; border-radius: 6px; border: 1px solid var(--border);">
            <div style="font-size: 0.65rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem;"><svg class="icon icon--sm" aria-hidden="true"><use href="#i-folder"/></svg> temp_chunks/video_vacaciones.mp4.part</div>
            <div style="font-size: 0.68rem; font-weight: 600; color: var(--accent); margin-top: 0.2rem;">Recibiendo bloques de 2 MB...</div>
          </div>
        `;
        break;

      case 5: // Live Sync (2 s)
        this.pcScreen.innerHTML = `
          <div class="screen-header">
            <span class="screen-brand">NetDrop Desktop</span>
            <span class="screen-ip">Live Sync: 2s ✓</span>
          </div>
          <div class="screen-card" style="margin-top: 0.5rem; border-color: var(--accent); box-shadow: 0 0 10px var(--accent-bg);">
            <div>
              <div class="screen-card-title" style="display: flex; align-items: center; gap: 0.3rem;"><svg class="icon icon--sm" aria-hidden="true"><use href="#i-film"/></svg> video_vacaciones.mp4</div>
              <div class="screen-card-meta">8.0 MB • Ahora mismo</div>
            </div>
            <span style="font-size: 0.6rem; color: var(--accent); font-weight: 700;">¡Nuevo!</span>
          </div>
        `;
        this.phoneScreen.innerHTML = `
          <div class="phone-notch"></div>
          <div class="screen-header">
            <span class="screen-brand">NetDrop</span>
            <span class="screen-ip">Sincronizado</span>
          </div>
          <div class="screen-card" style="margin-top: 0.5rem;">
            <div>
              <div class="screen-card-title" style="display: flex; align-items: center; gap: 0.3rem;"><svg class="icon icon--sm" aria-hidden="true"><use href="#i-film"/></svg> video_vacaciones.mp4</div>
              <div class="screen-card-meta">8.0 MB • En la PC</div>
            </div>
            <span style="font-size: 0.6rem; color: var(--accent);">✓</span>
          </div>
        `;
        break;

      case 6: // Descargar y Eliminar
        this.pcScreen.innerHTML = `
          <div class="screen-header">
            <span class="screen-brand">NetDrop Desktop</span>
            <span class="screen-ip">192.168.1.15</span>
          </div>
          <div class="screen-card" style="margin-top: 0.5rem; opacity: 0.4; transform: translateX(20px);">
            <div>
              <div class="screen-card-title" style="text-decoration: line-through;">foto_antigua.png</div>
              <div class="screen-card-meta">Eliminado del disco</div>
            </div>
            <span style="color: var(--danger); font-size: 0.62rem; display: inline-flex; align-items: center; gap: 0.2rem;"><svg class="icon icon--sm" aria-hidden="true"><use href="#i-trash"/></svg> Eliminado</span>
          </div>
        `;
        break;

      case 7: // Temas JSON
        const themeIndex = Math.floor(Date.now() / 1500) % THEMES_PRESET.length;
        const color = THEMES_PRESET[themeIndex];
        const name = THEME_NAMES[themeIndex];
        this.pcScreen.innerHTML = `
          <div class="screen-header">
            <span class="screen-brand">Motor de Temas</span>
            <span class="screen-ip">${name}</span>
          </div>
          <div style="margin-top: 0.8rem; text-align: center;">
            <div style="font-size: 0.72rem; font-weight: 600; color: var(--accent);">Paleta dinámica de themes.json</div>
            <div style="font-size: 0.62rem; color: var(--text-muted); margin-top: 0.2rem;">Persistencia en .active_theme.json</div>
          </div>
        `;
        break;
    }
  }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
  new ScrollytellingController();
});
