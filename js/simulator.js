/**
 * NetDrop-Web - Simulador Interactivo 100% en Cliente (Modo Oscuro & Cero Emojis)
 * Permite probar escaneo de QR, subida en chunks de 2 MB, Live Sync a 2 s y temas en vivo.
 */

export class NetDropSimulator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.guidedMode = true;
    this.guidedStep = 1;
    this.phoneConnected = false;
    this.isUploading = false;
    this.simThemes = [
      { id: 'midnight', name: 'Medianoche', bg: '#0d1117', text: '#e8eaf0', accent: '#e2693d' },
      { id: 'dark-minimal', name: 'Oscuro Minimal', bg: '#161b22', text: '#f0f6fc', accent: '#58a6ff' },
      { id: 'forest', name: 'Bosque', bg: '#0f1715', text: '#e6edf3', accent: '#3fb950' },
      { id: 'night', name: 'Noche', bg: '#090d16', text: '#e6edf3', accent: '#bc8cff' },
      { id: 'warm', name: 'Cálido', bg: '#1c1917', text: '#f5f5f4', accent: '#f97316' }
    ];
    this.simThemeIdx = 0;

    this.simulatedFiles = [
      { id: 'f_1', name: 'foto_playa.jpg', size: '3.2 MB', mtime: 'Hace 5 min', type: 'image' },
      { id: 'f_2', name: 'manual_netdrop.pdf', size: '1.4 MB', mtime: 'Hace 12 min', type: 'doc' }
    ];

    this.render();
    this.attachEvents();
  }

  attachEvents() {
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
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 0.75rem;">
        <svg class="icon icon--xl" style="animation: pulse 1s infinite; color: var(--brand-terracotta);" aria-hidden="true"><use href="#i-qr-code"/></svg>
        <div style="font-size: 0.84rem; font-weight: 600; color: var(--accent);">Escaneando QR en monitor...</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">http://192.168.1.15:5000</div>
      </div>
    `;

    setTimeout(() => {
      this.phoneConnected = true;
      if (this.guidedMode && this.guidedStep === 1) this.guidedStep = 2;
      this.showToast('Celular conectado con éxito a la red local.');
      this.render();
    }, 1200);
  }

  actionUploadSample(sampleType) {
    if (!this.phoneConnected) {
      this.showToast('Primero debes escanear el QR para conectar el celular.');
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
    const statusText = this.container.querySelector('.sim-upload-status');

    if (progressBar && progressFill && statusText) {
      progressBar.style.display = 'block';
      let currentChunk = 0;
      statusText.textContent = `Fragmentando ${fileData.name} en bloques de 2 MB (0/${fileData.chunks})...`;

      const chunkInterval = setInterval(() => {
        currentChunk++;
        const pct = Math.round((currentChunk / fileData.chunks) * 100);
        progressFill.style.width = pct + '%';
        statusText.textContent = `Enviando chunk ${currentChunk}/${fileData.chunks} (2 MB liberados en RAM móvil)...`;

        if (currentChunk >= fileData.chunks) {
          clearInterval(chunkInterval);
          statusText.textContent = 'Ensamblado completo en servidor. Esperando sincronización (2 s)...';

          setTimeout(() => {
            progressBar.style.display = 'none';
            progressFill.style.width = '0%';
            statusText.textContent = '';

            this.simulatedFiles.unshift({
              id: fileData.id,
              name: fileData.name,
              size: fileData.size,
              mtime: 'Recién subido',
              type: fileData.type
            });

            if (this.guidedMode && this.guidedStep === 2) this.guidedStep = 3;
            this.showToast(`Sincronización completada: '${fileData.name}' ya está disponible.`);
            this.render();
          }, 1500);
        }
      }, 500);
    }
  }

  deleteFile(fileId) {
    this.simulatedFiles = this.simulatedFiles.filter(f => f.id !== fileId);
    this.showToast('Archivo eliminado del almacenamiento local.');
    this.render();
  }

  copyLink(fileName) {
    const fakeUrl = `http://192.168.1.15:5000/descarga/${encodeURIComponent(fileName)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fakeUrl).catch(() => {});
    }
    this.showToast(`Enlace copiado al portapapeles: ${fakeUrl}`);
  }

  downloadSim(fileName) {
    this.showToast(`Iniciando descarga directa de '${fileName}'`);
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
            <svg class="icon icon--xl" style="width: 48px; height: 48px; color: var(--brand-terracotta);" aria-hidden="true"><use href="#i-image"/></svg>
            <p style="margin-top: 1rem; color: #fff; font-size: 0.9rem;">Vista previa de imagen local (${file.size})</p>
          </div>
        `;
      } else if (file.type === 'media') {
        modalBody.innerHTML = `
          <div style="background: #111; padding: 2rem; border-radius: 8px; text-align: center;">
            <svg class="icon icon--xl" style="width: 48px; height: 48px; color: var(--brand-terracotta);" aria-hidden="true"><use href="#i-film"/></svg>
            <p style="margin-top: 1rem; color: #fff; font-size: 0.9rem;">Reproductor de video local HTML5 (${file.size})</p>
          </div>
        `;
      } else {
        modalBody.innerHTML = `
          <div style="background: #111; padding: 2rem; border-radius: 8px; text-align: center;">
            <svg class="icon icon--xl" style="width: 48px; height: 48px; color: var(--brand-terracotta);" aria-hidden="true"><use href="#i-file-text"/></svg>
            <p style="margin-top: 1rem; color: #fff; font-size: 0.9rem;">Lector de documentos integrado (${file.size})</p>
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

  toggleMode(mode) {
    this.guidedMode = (mode === 'guided');
    this.render();
  }

  cycleTheme() {
    this.simThemeIdx = (this.simThemeIdx + 1) % this.simThemes.length;
    this.showToast(`Tema del simulador: ${this.simThemes[this.simThemeIdx].name}`);
    this.render();
  }

  resetSimulator() {
    this.phoneConnected = false;
    this.guidedStep = 1;
    this.simulatedFiles = [
      { id: 'f_1', name: 'foto_playa.jpg', size: '3.2 MB', mtime: 'Hace 5 min', type: 'image' },
      { id: 'f_2', name: 'manual_netdrop.pdf', size: '1.4 MB', mtime: 'Hace 12 min', type: 'doc' }
    ];
    this.showToast('Simulador reiniciado a su estado original.');
    this.render();
  }

  showToast(msg) {
    const toast = this.container.querySelector('.sim-toast');
    if (toast) {
      toast.textContent = msg;
      toast.classList.add('visible');
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        toast.classList.remove('visible');
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
        <div style="background: rgba(200, 90, 50, 0.12); border: 1px solid var(--accent); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.5rem; font-size: 0.88rem; color: var(--text-heading); display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <svg class="icon icon--sm" style="color: var(--brand-terracotta);" aria-hidden="true"><use href="#i-info"/></svg>
            <span><strong>Modo Guiado:</strong> ${msg}</span>
          </div>
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
          <button type="button" class="btn btn-secondary" style="font-size: 0.82rem; padding: 0.4rem 0.8rem; display: inline-flex; align-items: center; gap: 0.4rem;" data-sim-action="cycle-theme" title="Cambiar tema del simulador">
            <svg class="icon icon--sm" aria-hidden="true"><use href="#i-palette"/></svg>
            <span>Tema: ${curTheme.name}</span>
          </button>
          <button type="button" class="btn btn-ghost" style="font-size: 0.82rem; padding: 0.4rem 0.6rem; display: inline-flex; align-items: center; gap: 0.4rem;" data-sim-action="reset" title="Reiniciar">
            <svg class="icon icon--sm" aria-hidden="true"><use href="#i-refresh-cw"/></svg>
            <span>Reiniciar</span>
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
              <svg class="icon icon--sm" aria-hidden="true"><use href="#i-monitor"/></svg>
              <span style="font-weight: 700; font-size: 0.95rem;">PC Anfitriona (Servidor)</span>
              <span class="sim-badge" style="background: rgba(226,105,61,0.15); color: ${curTheme.accent};">192.168.1.15:5000</span>
            </div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${this.simulatedFiles.length} archivos</span>
          </div>

          <div style="background: rgba(255,255,255,0.04); border: 1.5px dashed rgba(255,255,255,0.15); border-radius: 8px; padding: 1rem; text-align: center;">
            <span style="font-size: 0.82rem; font-weight: 600;">Código QR listo en monitor</span>
            <div style="margin-top: 0.5rem; display: flex; justify-content: center;">
              <div style="width: 70px; height: 70px; background: #fff; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                <svg class="icon icon--xl" style="width: 58px; height: 58px; color: #111;" aria-hidden="true"><use href="#i-qr"/></svg>
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
                  <button type="button" class="sim-action-btn" data-sim-action="preview" data-file-id="${f.id}" title="Ver vista previa" aria-label="Ver vista previa de ${f.name}">
                    <svg class="icon icon--sm" aria-hidden="true"><use href="#i-eye"/></svg>
                  </button>
                  <button type="button" class="sim-action-btn" data-sim-action="copy-link" data-file-name="${f.name}" title="Copiar enlace" aria-label="Copiar enlace de ${f.name}">
                    <svg class="icon icon--sm" aria-hidden="true"><use href="#i-copy"/></svg>
                  </button>
                  <button type="button" class="sim-action-btn btn-delete" data-sim-action="delete" data-file-id="${f.id}" title="Eliminar" aria-label="Eliminar ${f.name}">
                    <svg class="icon icon--sm" aria-hidden="true"><use href="#i-trash"/></svg>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 2. Pantalla Celular -->
        <div class="sim-pane" style="background: ${curTheme.bg}; color: ${curTheme.text}; border-color: ${curTheme.accent};">
          <div class="sim-pane-header">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <svg class="icon icon--sm" aria-hidden="true"><use href="#i-smartphone"/></svg>
              <span style="font-weight: 700; font-size: 0.95rem;">Celular del Usuario</span>
            </div>
            <span class="sim-badge" style="background: rgba(226,105,61,0.15); color: ${curTheme.accent};">
              ${this.phoneConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          <div class="sim-phone-screen" style="flex: 1; display: flex; flex-direction: column;">
            ${!this.phoneConnected ? `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 1rem; padding: 2rem;">
                <p style="font-size: 0.88rem; color: var(--text-muted);">El teléfono aún no está conectado a NetDrop.</p>
                <button type="button" class="btn btn-primary" style="font-size: 0.85rem; padding: 0.5rem 1rem; display: inline-flex; align-items: center; gap: 0.5rem;" data-sim-action="scan-qr">
                  <svg class="icon icon--sm" aria-hidden="true"><use href="#i-qr"/></svg>
                  <span>Escanear QR en la PC</span>
                </button>
              </div>
            ` : `
              <div style="border: 1.5px dashed ${curTheme.accent}; border-radius: 8px; padding: 0.75rem; text-align: center; margin-bottom: 1rem;">
                <span style="font-weight: 600; font-size: 0.82rem;">Enviar archivo desde el teléfono:</span>
                <div style="display: flex; gap: 0.4rem; justify-content: center; margin-top: 0.6rem; flex-wrap: wrap;">
                  <button type="button" class="btn btn-secondary" style="font-size: 0.72rem; padding: 0.35rem 0.6rem; display: inline-flex; align-items: center; gap: 0.35rem;" data-sim-action="upload-sample" data-sample="video">
                    <svg class="icon icon--sm" aria-hidden="true"><use href="#i-film"/></svg>
                    <span>video.mp4 (8 MB)</span>
                  </button>
                  <button type="button" class="btn btn-secondary" style="font-size: 0.72rem; padding: 0.35rem 0.6rem; display: inline-flex; align-items: center; gap: 0.35rem;" data-sim-action="upload-sample" data-sample="image">
                    <svg class="icon icon--sm" aria-hidden="true"><use href="#i-image"/></svg>
                    <span>foto.png (2 MB)</span>
                  </button>
                  <button type="button" class="btn btn-secondary" style="font-size: 0.72rem; padding: 0.35rem 0.6rem; display: inline-flex; align-items: center; gap: 0.35rem;" data-sim-action="upload-sample" data-sample="doc">
                    <svg class="icon icon--sm" aria-hidden="true"><use href="#i-file-text"/></svg>
                    <span>doc.pdf (2.8 MB)</span>
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
                      <button type="button" class="sim-action-btn" data-sim-action="download" data-file-name="${f.name}" title="Descargar al dispositivo" aria-label="Descargar ${f.name}">
                        <svg class="icon icon--sm" aria-hidden="true"><use href="#i-descarga"/></svg>
                      </button>
                      <button type="button" class="sim-action-btn btn-delete" data-sim-action="delete" data-file-id="${f.id}" title="Eliminar" aria-label="Eliminar ${f.name}">
                        <svg class="icon icon--sm" aria-hidden="true"><use href="#i-trash"/></svg>
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Toast de notificación flotante -->
      <div class="sim-toast"></div>

      <!-- Modal de previsualización (Lightbox) -->
      <div class="sim-preview-modal" style="display: none;">
        <div class="sim-modal-content">
          <div class="sim-modal-header">
            <h4 class="sim-modal-title" style="margin: 0; font-size: 1rem;"></h4>
            <button type="button" class="sim-action-btn" data-sim-action="close-modal" aria-label="Cerrar modal">&times;</button>
          </div>
          <div class="sim-modal-body" style="margin-top: 1rem;"></div>
        </div>
      </div>
    `;
  }
}
