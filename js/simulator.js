/**
 * NetDrop-Web - Simulador Completo en Cliente (100% en Navegador)
 * Permite probar el ciclo de NetDrop: QR, subida en chunks, Live Sync 2s, vista previa y eliminación.
 */

export class NetDropSimulator {
  constructor(containerId = 'netdrop-simulator') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.phoneConnected = false;
    this.guidedMode = true;
    this.guidedStep = 1;
    this.simulatedFiles = [
      { id: 'f1', name: 'foto_playa.jpg', size: '3.2 MB', type: 'image', chunks: 2, mtime: 'Hace 5 min' },
      { id: 'f2', name: 'manual_netdrop.pdf', size: '1.4 MB', type: 'doc', chunks: 1, mtime: 'Hace 12 min' }
    ];

    this.simThemes = [
      { id: 'warm', name: 'Cálido Terracota', bg: '#faf8f5', text: '#1a1a1a', accent: '#c85a32' },
      { id: 'dark-slate', name: 'Oscuro Minimal', bg: '#0f172a', text: '#f8fafc', accent: '#6366f1' },
      { id: 'forest', name: 'Bosque Verde', bg: '#f2f7f4', text: '#0f1f16', accent: '#2d6a4f' },
      { id: 'midnight-amber', name: 'Noche Ámbar', bg: '#1a1918', text: '#ffffff', accent: '#d97706' },
      { id: 'nordic', name: 'Nórdico Frío', bg: '#f0f4f8', text: '#0f172a', accent: '#2563eb' }
    ];
    this.simThemeIdx = 1; // Default oscuro en simulador

    this.init();
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    this.container.addEventListener('click', (e) => {
      const target = e.target.closest('[data-sim-action]');
      if (!target) return;
      const action = target.getAttribute('data-sim-action');

      if (action === 'scan-qr') this.actionScanQr();
      if (action === 'upload-sample') this.actionUploadSample(target.getAttribute('data-sample'));
      if (action === 'toggle-mode') this.toggleMode(target.getAttribute('data-mode'));
      if (action === 'cycle-theme') this.cycleTheme();
      if (action === 'reset') this.resetSimulator();
      if (action === 'preview') this.openPreview(target.getAttribute('data-file-id'));
      if (action === 'copy-link') this.copyLink(target.getAttribute('data-file-name'));
      if (action === 'download') this.downloadSim(target.getAttribute('data-file-name'));
      if (action === 'delete') this.deleteFile(target.getAttribute('data-file-id'));
      if (action === 'close-modal') this.closeModal();
    });
  }

  actionScanQr() {
    const phoneScreen = this.container.querySelector('.sim-phone-screen');
    if (!phoneScreen) return;

    phoneScreen.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 0.5rem;">
        <div style="font-size: 2rem; animation: pulse 1s infinite;">📷</div>
        <div style="font-size: 0.82rem; font-weight: 600; color: var(--accent);">Escaneando QR en monitor...</div>
        <div style="font-size: 0.72rem; color: var(--text-muted);">http://192.168.1.15:5000</div>
      </div>
    `;

    setTimeout(() => {
      this.phoneConnected = true;
      if (this.guidedMode && this.guidedStep === 1) this.guidedStep = 2;
      this.showToast('📱 Celular conectado con éxito a la red local');
      this.render();
    }, 1200);
  }

  actionUploadSample(sampleType) {
    if (!this.phoneConnected) {
      this.showToast('⚠️ Primero debes escanear el QR para conectar el celular.');
      return;
    }

    let fileData;
    if (sampleType === 'video') {
      fileData = { id: 'f_' + Date.now(), name: 'video_vacaciones.mp4', size: '8.0 MB', type: 'media', chunks: 4 };
    } else if (sampleType === 'doc') {
      fileData = { id: 'f_' + Date.now(), name: 'reporte_anual.pdf', size: '2.8 MB', type: 'doc', chunks: 2 };
    } else {
      fileData = { id: 'f_' + Date.now(), name: 'captura_pantalla.png', size: '2.0 MB', type: 'image', chunks: 1 };
    }

    const progressBar = this.container.querySelector('.sim-transfer-bar');
    const progressFill = this.container.querySelector('.sim-transfer-progress');
    const statusLabel = this.container.querySelector('.sim-upload-status');

    if (progressBar && progressFill) {
      progressBar.style.display = 'block';
      progressFill.style.width = '0%';
    }

    let currentChunk = 0;
    const chunkInterval = setInterval(() => {
      currentChunk++;
      const percent = Math.min(100, Math.round((currentChunk / fileData.chunks) * 100));
      if (progressFill) progressFill.style.width = percent + '%';
      if (statusLabel) statusLabel.textContent = `Enviando chunk ${currentChunk} de ${fileData.chunks} (2 MB por bloque)...`;

      if (currentChunk >= fileData.chunks) {
        clearInterval(chunkInterval);
        if (statusLabel) statusLabel.textContent = 'Ensamblando en disco... Live Sync en 2 segundos...';
        
        setTimeout(() => {
          fileData.mtime = 'Ahora mismo';
          this.simulatedFiles.unshift(fileData);
          if (progressBar) progressBar.style.display = 'none';
          if (statusLabel) statusLabel.textContent = '';
          if (this.guidedMode && this.guidedStep === 2) this.guidedStep = 3;
          this.showToast(`✓ Archivo '${fileData.name}' sincronizado en ambos equipos`);
          this.render();
        }, 1200);
      }
    }, 500);
  }

  deleteFile(fileId) {
    this.simulatedFiles = this.simulatedFiles.filter(f => f.id !== fileId);
    this.showToast('🗑 Archivo eliminado del disco');
    this.render();
  }

  copyLink(fileName) {
    const fakeUrl = `http://192.168.1.15:5000/descarga/${encodeURIComponent(fileName)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fakeUrl).catch(() => {});
    }
    this.showToast(`🔗 Enlace copiado: ${fakeUrl}`);
  }

  downloadSim(fileName) {
    this.showToast(`⬇️ Descargando '${fileName}' a la memoria del dispositivo`);
  }

  openPreview(fileId) {
    const file = this.simulatedFiles.find(f => f.id === fileId);
    if (!file) return;

    const modal = this.container.querySelector('.sim-preview-modal');
    const modalBody = this.container.querySelector('.sim-modal-body');
    const modalTitle = this.container.querySelector('.sim-modal-title');

    if (modal && modalBody && modalTitle) {
      modalTitle.textContent = file.name;
      if (file.type === 'image') {
        modalBody.innerHTML = `
          <div style="background: #111; padding: 2rem; border-radius: 8px; text-align: center;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <p style="margin-top: 1rem; color: #fff; font-size: 0.9rem;">Vista previa de imagen simulada (${file.size})</p>
          </div>
        `;
      } else if (file.type === 'media') {
        modalBody.innerHTML = `
          <div style="background: #111; padding: 2rem; border-radius: 8px; text-align: center;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
            <p style="margin-top: 1rem; color: #fff; font-size: 0.9rem;">Reproductor de video simulado (${file.size})</p>
          </div>
        `;
      } else {
        modalBody.innerHTML = `
          <div style="background: #111; padding: 2rem; border-radius: 8px; text-align: center;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            <p style="margin-top: 1rem; color: #fff; font-size: 0.9rem;">Visor de documento simulado (${file.size})</p>
          </div>
        `;
      }
      modal.style.display = 'flex';
    }
  }

  closeModal() {
    const modal = this.container.querySelector('.sim-preview-modal');
    if (modal) modal.style.display = 'none';
  }

  cycleTheme() {
    this.simThemeIdx = (this.simThemeIdx + 1) % this.simThemes.length;
    this.showToast(`🎨 Tema del simulador: ${this.simThemes[this.simThemeIdx].name}`);
    this.render();
  }

  toggleMode(mode) {
    this.guidedMode = (mode === 'guided');
    this.render();
  }

  resetSimulator() {
    this.phoneConnected = false;
    this.guidedStep = 1;
    this.simulatedFiles = [
      { id: 'f1', name: 'foto_playa.jpg', size: '3.2 MB', type: 'image', chunks: 2, mtime: 'Hace 5 min' },
      { id: 'f2', name: 'manual_netdrop.pdf', size: '1.4 MB', type: 'doc', chunks: 1, mtime: 'Hace 12 min' }
    ];
    this.showToast('🔄 Simulador reiniciado');
    this.render();
  }

  showToast(message) {
    const toast = this.container.querySelector('.sim-toast');
    if (toast) {
      toast.textContent = message;
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
      }, 3000);
    }
  }

  render() {
    const curTheme = this.simThemes[this.simThemeIdx];

    // Banner de modo guiado
    let guideBanner = '';
    if (this.guidedMode) {
      let msg = '';
      if (this.guidedStep === 1) msg = 'Paso 1: Pulsa el botón "Escanear QR" en el celular para conectar.';
      else if (this.guidedStep === 2) msg = 'Paso 2: Toca uno de los archivos de muestra para iniciar la subida en chunks.';
      else msg = 'Paso 3: ¡Listo! El archivo está en ambos equipos. Prueba "Ver", "Copiar Enlace" o "Eliminar".';

      guideBanner = `
        <div style="background: rgba(226, 105, 61, 0.15); border: 1px solid var(--accent); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.5rem; font-size: 0.88rem; color: var(--text-heading); display: flex; align-items: center; justify-content: space-between;">
          <span>💡 <strong>Modo Guiado:</strong> ${msg}</span>
          <button type="button" class="btn btn-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" data-sim-action="reset">Reiniciar</button>
        </div>
      `;
    }

    this.container.innerHTML = `
      <div class="simulator-topbar">
        <div>
          <span class="section-tag" style="margin-bottom: 0.2rem;">Entorno de Pruebas</span>
          <h3 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Simulador Interactivo de NetDrop</h3>
          <p style="font-size: 0.88rem; color: var(--text-muted);">Prueba cómo opera NetDrop en red local 100% en el navegador.</p>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          <div class="sim-mode-toggle">
            <button type="button" class="sim-mode-btn ${this.guidedMode ? 'active' : ''}" data-sim-action="toggle-mode" data-mode="guided">Modo Guiado</button>
            <button type="button" class="sim-mode-btn ${!this.guidedMode ? 'active' : ''}" data-sim-action="toggle-mode" data-mode="free">Modo Libre</button>
          </div>
          <button type="button" class="btn btn-secondary" style="font-size: 0.82rem; padding: 0.4rem 0.8rem;" data-sim-action="cycle-theme" title="Cambiar tema del simulador">
            🎨 Tema: ${curTheme.name}
          </button>
          <button type="button" class="btn btn-ghost" style="font-size: 0.82rem; padding: 0.4rem 0.6rem;" data-sim-action="reset" title="Reiniciar">
            ↺ Reiniciar
          </button>
        </div>
      </div>

      ${guideBanner}

      <!-- Barra de progreso de chunks -->
      <div class="sim-transfer-bar">
        <div class="sim-transfer-progress"></div>
      </div>
      <div class="sim-upload-status" style="font-size: 0.8rem; color: var(--accent); font-weight: 600; min-height: 1.2rem;"></div>

      <div class="sim-viewports-grid">
        <!-- 1. Pantalla PC -->
        <div class="sim-pane" style="background: ${curTheme.bg}; color: ${curTheme.text}; border-color: ${curTheme.accent};">
          <div class="sim-pane-header">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-weight: 700; font-size: 0.95rem;">🖥️ PC Anfitriona (Servidor)</span>
              <span class="sim-badge" style="background: rgba(226,105,61,0.15); color: ${curTheme.accent};">192.168.1.15:5000</span>
            </div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${this.simulatedFiles.length} archivos</span>
          </div>

          <div style="background: rgba(255,255,255,0.04); border: 1.5px dashed rgba(255,255,255,0.15); border-radius: 8px; padding: 1rem; text-align: center;">
            <span style="font-size: 0.82rem; font-weight: 600;">Código QR listo en monitor</span>
            <div style="margin-top: 0.5rem; display: flex; justify-content: center;">
              <div style="width: 70px; height: 70px; background: #fff; padding: 4px; border-radius: 6px;">
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                  <rect x="5" y="5" width="30" height="30" fill="#111" />
                  <rect x="65" y="5" width="30" height="30" fill="#111" />
                  <rect x="5" y="65" width="30" height="30" fill="#111" />
                  <circle cx="50" cy="50" r="10" fill="${curTheme.accent}" />
                </svg>
              </div>
            </div>
          </div>

          <div class="sim-file-list">
            ${this.simulatedFiles.map(f => `
              <div class="sim-card">
                <div>
                  <div style="font-weight: 600; font-size: 0.82rem; color: ${curTheme.text};">${f.name}</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">${f.size} • ${f.mtime}</div>
                </div>
                <div class="sim-card-actions">
                  <button type="button" class="sim-action-btn" data-sim-action="preview" data-file-id="${f.id}" title="Ver">👁</button>
                  <button type="button" class="sim-action-btn" data-sim-action="copy-link" data-file-name="${f.name}" title="Copiar enlace">🔗</button>
                  <button type="button" class="sim-action-btn btn-delete" data-sim-action="delete" data-file-id="${f.id}" title="Eliminar">🗑</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 2. Pantalla Celular -->
        <div class="sim-pane" style="background: ${curTheme.bg}; color: ${curTheme.text}; border-color: ${curTheme.accent};">
          <div class="sim-pane-header">
            <span style="font-weight: 700; font-size: 0.95rem;">📱 Celular del Usuario</span>
            <span class="sim-badge" style="background: rgba(226,105,61,0.15); color: ${curTheme.accent};">
              ${this.phoneConnected ? 'Conectado ✓' : 'Desconectado'}
            </span>
          </div>

          <div class="sim-phone-screen" style="flex: 1; display: flex; flex-direction: column;">
            ${!this.phoneConnected ? `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 1rem; padding: 2rem;">
                <p style="font-size: 0.88rem; color: var(--text-muted);">El teléfono aún no está conectado a NetDrop.</p>
                <button type="button" class="btn btn-primary" style="font-size: 0.85rem; padding: 0.5rem 1rem;" data-sim-action="scan-qr">
                  📷 Escanear QR en la PC
                </button>
              </div>
            ` : `
              <div style="border: 1.5px dashed ${curTheme.accent}; border-radius: 8px; padding: 0.75rem; text-align: center; margin-bottom: 1rem;">
                <span style="font-weight: 600; font-size: 0.82rem;">Enviar archivo desde el teléfono:</span>
                <div style="display: flex; gap: 0.4rem; justify-content: center; margin-top: 0.6rem; flex-wrap: wrap;">
                  <button type="button" class="btn btn-secondary" style="font-size: 0.72rem; padding: 0.35rem 0.6rem;" data-sim-action="upload-sample" data-sample="video">
                    🎥 video.mp4 (8 MB)
                  </button>
                  <button type="button" class="btn btn-secondary" style="font-size: 0.72rem; padding: 0.35rem 0.6rem;" data-sim-action="upload-sample" data-sample="image">
                    🖼️ foto.png (2 MB)
                  </button>
                  <button type="button" class="btn btn-secondary" style="font-size: 0.72rem; padding: 0.35rem 0.6rem;" data-sim-action="upload-sample" data-sample="doc">
                    📄 doc.pdf (2.8 MB)
                  </button>
                </div>
              </div>

              <div class="sim-file-list">
                ${this.simulatedFiles.map(f => `
                  <div class="sim-card">
                    <div>
                      <div style="font-weight: 600; font-size: 0.82rem; color: ${curTheme.text};">${f.name}</div>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">${f.size}</div>
                    </div>
                    <div class="sim-card-actions">
                      <button type="button" class="sim-action-btn" data-sim-action="download" data-file-name="${f.name}" title="Descargar al móvil">⬇️</button>
                      <button type="button" class="sim-action-btn btn-delete" data-sim-action="delete" data-file-id="${f.id}" title="Eliminar">🗑</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Toast de notificación flotante -->
      <div class="sim-toast" style="position: fixed; bottom: 2rem; right: 2rem; background: var(--surface-elevated); border: 1px solid var(--accent); color: var(--text-heading); padding: 0.75rem 1.25rem; border-radius: 8px; box-shadow: var(--shadow-lg); font-size: 0.85rem; font-weight: 600; z-index: 9999; opacity: 0; transform: translateY(10px); transition: all 0.3s ease; pointer-events: none;"></div>

      <!-- Modal de vista previa simulada -->
      <div class="sim-preview-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 10000; align-items: center; justify-content: center; padding: 1.5rem;">
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; max-width: 500px; width: 100%; padding: 1.5rem; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h4 class="sim-modal-title" style="font-size: 1.1rem; color: var(--text-heading);"></h4>
            <button type="button" class="btn btn-ghost" style="padding: 0.2rem 0.5rem;" data-sim-action="close-modal">&times;</button>
          </div>
          <div class="sim-modal-body"></div>
        </div>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new NetDropSimulator('netdrop-simulator');
});
