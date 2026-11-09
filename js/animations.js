/**
 * NetDrop-Web - Controlador Interactivo de los 7 Pasos SVG
 * Implementación basada en el comportamiento REAL de NetDrop (código y RELEASE_NOTES)
 */

export const STEPS_DATA = [
  {
    id: 1,
    title: '1. Arranque del Servidor Local',
    desc: 'NetDrop inicia en la PC anfitriona, levanta el servidor HTTP local en el puerto 5000 (Flask + Waitress) y abre la ventana nativa de escritorio.',
    svg: `
      <svg class="svg-stage" viewBox="0 0 800 400" role="img" aria-labelledby="step1-title step1-desc">
        <title id="step1-title">Paso 1: Arranque de NetDrop en PC</title>
        <desc id="step1-desc">Ilustración esquemática del servidor iniciando en el puerto 5000 con la ventana de escritorio abriéndose.</desc>
        <defs>
          <linearGradient id="grad-screen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="var(--surface)" />
            <stop offset="100%" stop-color="var(--surface-hover)" />
          </linearGradient>
        </defs>

        <!-- Monitor PC -->
        <rect x="250" y="50" width="300" height="200" rx="12" fill="url(#grad-screen)" stroke="var(--border)" stroke-width="3" />
        <rect x="270" y="70" width="260" height="150" rx="6" fill="var(--bg-base)" stroke="var(--border)" stroke-width="1.5" />
        <rect x="380" y="250" width="40" height="50" fill="var(--border)" />
        <path d="M340 300 L460 300 L440 310 L360 310 Z" fill="var(--border-hover)" />

        <!-- Barra de título de la ventana nativa de NetDrop -->
        <rect x="280" y="80" width="240" height="24" rx="4" fill="var(--surface)" stroke="var(--border)" stroke-width="1" />
        <circle cx="295" cy="92" r="4" fill="var(--danger)" />
        <circle cx="310" cy="92" r="4" fill="var(--accent)" />
        <circle cx="325" cy="92" r="4" fill="var(--border-hover)" />
        <text x="345" y="96" font-size="11" font-weight="bold" fill="var(--text-heading)" font-family="sans-serif">NetDrop Desktop v2.1.2</text>

        <!-- Contenido de la ventana -->
        <rect x="290" y="115" width="220" height="95" rx="6" fill="var(--surface)" stroke="var(--border)" />
        
        <!-- Indicador de puerto 5000 activo con pulso -->
        <g transform="translate(310, 135)">
          <circle cx="15" cy="15" r="10" fill="var(--accent-bg)" stroke="var(--accent)" stroke-width="2" />
          <circle cx="15" cy="15" r="5" fill="var(--accent)">
            <animate attributeName="r" values="3;7;3" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <text x="35" y="20" font-size="13" font-weight="bold" fill="var(--text-heading)">Servidor Activo en :5000</text>
        </g>

        <!-- Línea de terminal simulada -->
        <rect x="305" y="170" width="190" height="26" rx="4" fill="var(--bg-base)" />
        <text x="315" y="187" font-size="10" font-family="monospace" fill="var(--text-muted)">http://127.0.0.1:5000 [OK]</text>
      </svg>
    `
  },
  {
    id: 2,
    title: '2. Descubrimiento y Generación del QR',
    desc: 'NetDrop detecta automáticamente la IP asignada en la red local (ej. 192.168.1.15:5000) y genera en pantalla el código QR con el logotipo en el centro.',
    svg: `
      <svg class="svg-stage" viewBox="0 0 800 400" role="img" aria-labelledby="step2-title step2-desc">
        <title id="step2-title">Paso 2: Descubrimiento de IP y Código QR</title>
        <desc id="step2-desc">La PC detecta su IP en la red local y dibuja un código QR interactivo con el logo central.</desc>
        
        <!-- Contenedor central -->
        <rect x="260" y="40" width="280" height="310" rx="16" fill="var(--surface)" stroke="var(--border)" stroke-width="2" />
        
        <text x="400" y="80" text-anchor="middle" font-size="14" font-weight="bold" fill="var(--text-heading)">Escanea para Conectar</text>
        <text x="400" y="105" text-anchor="middle" font-size="12" font-family="monospace" fill="var(--accent)">http://192.168.1.15:5000</text>

        <!-- Simulación de Código QR -->
        <g transform="translate(320, 125)">
          <rect x="0" y="0" width="160" height="160" rx="8" fill="var(--bg-base)" stroke="var(--border)" stroke-width="2" />
          
          <!-- Patrones en las esquinas -->
          <rect x="15" y="15" width="35" height="35" fill="none" stroke="var(--text-heading)" stroke-width="4" />
          <rect x="23" y="23" width="19" height="19" fill="var(--text-heading)" />

          <rect x="110" y="15" width="35" height="35" fill="none" stroke="var(--text-heading)" stroke-width="4" />
          <rect x="118" y="23" width="19" height="19" fill="var(--text-heading)" />

          <rect x="15" y="110" width="35" height="35" fill="none" stroke="var(--text-heading)" stroke-width="4" />
          <rect x="23" y="118" width="19" height="19" fill="var(--text-heading)" />

          <!-- Módulos decorativos del QR -->
          <rect x="65" y="20" width="12" height="12" fill="var(--text-heading)" />
          <rect x="85" y="35" width="15" height="15" fill="var(--text-heading)" />
          <rect x="65" y="125" width="18" height="18" fill="var(--text-heading)" />
          <rect x="100" y="115" width="15" height="25" fill="var(--text-heading)" />
          
          <!-- Logo de NetDrop en el centro del QR -->
          <circle cx="80" cy="80" r="22" fill="var(--surface)" stroke="var(--accent)" stroke-width="2" />
          <circle cx="80" cy="80" r="14" fill="var(--accent)" />
          <polygon points="76,73 87,80 76,87" fill="#ffffff" />

          <!-- Línea láser de escaneo animada -->
          <line x1="10" y1="0" x2="150" y2="0" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" class="anim-scanline">
            <animate attributeName="y1" values="10;150;10" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="y2" values="10;150;10" dur="2.5s" repeatCount="indefinite" />
          </line>
        </g>
      </svg>
    `
  },
  {
    id: 3,
    title: '3. Conexión Móvil Instantánea',
    desc: 'El teléfono escanea el QR y abre la aplicación en el navegador. La conexión es directa entre dispositivos dentro de la misma red Wi-Fi, sin internet ni servidores externos.',
    svg: `
      <svg class="svg-stage" viewBox="0 0 800 400" role="img" aria-labelledby="step3-title step3-desc">
        <title id="step3-title">Paso 3: Conexión móvil por Wi-Fi</title>
        <desc id="step3-desc">El smartphone en la red Wi-Fi se comunica directamente con la PC anfitriona.</desc>
        
        <!-- PC Izquierda -->
        <g transform="translate(140, 100)">
          <rect x="0" y="0" width="150" height="110" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="2" />
          <rect x="10" y="10" width="130" height="75" rx="4" fill="var(--bg-base)" />
          <circle cx="75" cy="48" r="18" fill="var(--accent-bg)" />
          <text x="75" y="52" text-anchor="middle" font-size="10" font-weight="bold" fill="var(--accent)">PC Host</text>
          <rect x="65" y="110" width="20" height="25" fill="var(--border)" />
          <path d="M45 135 L105 135 L95 142 L55 142 Z" fill="var(--border-hover)" />
        </g>

        <!-- Router / Ondas Wi-Fi Centrales -->
        <g transform="translate(400, 120)">
          <circle cx="0" cy="0" r="40" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="6,4" class="anim-wifi-1" />
          <circle cx="0" cy="0" r="70" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="6,4" class="anim-wifi-2" />
          <circle cx="0" cy="0" r="14" fill="var(--accent)" />
          <text x="0" y="32" text-anchor="middle" font-size="11" font-weight="bold" fill="var(--text-heading)">Red Wi-Fi Local</text>
          <text x="0" y="48" text-anchor="middle" font-size="10" fill="var(--text-muted)">Sin Internet</text>
        </g>

        <!-- Teléfono Celular Derecha -->
        <g transform="translate(530, 80)">
          <rect x="0" y="0" width="110" height="180" rx="16" fill="var(--surface)" stroke="var(--border)" stroke-width="2.5" />
          <rect x="8" y="12" width="94" height="142" rx="8" fill="var(--bg-base)" />
          <circle cx="55" cy="168" r="5" fill="var(--border)" />
          <!-- Pantalla con NetDrop Móvil -->
          <rect x="14" y="24" width="82" height="18" rx="4" fill="var(--accent-bg)" />
          <text x="55" y="37" text-anchor="middle" font-size="9" font-weight="bold" fill="var(--accent)">NetDrop Web</text>
          <rect x="14" y="50" width="82" height="40" rx="4" fill="var(--surface)" stroke="var(--border)" />
          <text x="55" y="74" text-anchor="middle" font-size="8" fill="var(--text-muted)">Conectado LAN</text>
        </g>
      </svg>
    `
  },
  {
    id: 4,
    title: '4. Subida en Fragmentos (Chunks de 2 MB)',
    desc: 'Al subir un archivo pesado desde el móvil, el cliente en JavaScript lo divide en fragmentos de 2 MB (evitando bloqueos de memoria en el celular). Se ensambla en una carpeta temporal y se traslada de forma atómica a la carpeta final.',
    svg: `
      <svg class="svg-stage" viewBox="0 0 800 400" role="img" aria-labelledby="step4-title step4-desc">
        <title id="step4-title">Paso 4: Subida de archivos por chunks de 2MB</title>
        <desc id="step4-desc">División de archivos en fragmentos de 2 MB con barra de progreso y ensamblado atómico.</desc>
        
        <!-- Móvil Origen -->
        <g transform="translate(100, 90)">
          <rect x="0" y="0" width="130" height="190" rx="14" fill="var(--surface)" stroke="var(--border)" stroke-width="2" />
          <text x="65" y="30" text-anchor="middle" font-size="12" font-weight="bold" fill="var(--text-heading)">Smartphone</text>
          <!-- Archivo original de 8 MB -->
          <rect x="20" y="50" width="90" height="70" rx="6" fill="var(--accent-bg)" stroke="var(--accent)" stroke-width="1.5" />
          <text x="65" y="80" text-anchor="middle" font-size="11" font-weight="bold" fill="var(--accent)">video.mp4</text>
          <text x="65" y="100" text-anchor="middle" font-size="9" fill="var(--text-muted)">8 MB (4 Chunks)</text>
        </g>

        <!-- Ruta de viaje de los Chunks de 2MB -->
        <g transform="translate(250, 140)">
          <path d="M 0 30 Q 140 -20 280 30" fill="none" stroke="var(--border-hover)" stroke-width="2" stroke-dasharray="6,4" />

          <!-- Chunks en tránsito con animación CSS -->
          <g class="anim-chunk-1">
            <rect x="20" y="0" width="46" height="24" rx="4" fill="var(--accent)" />
            <text x="43" y="16" text-anchor="middle" font-size="9" font-weight="bold" fill="#ffffff">2 MB</text>
          </g>

          <g class="anim-chunk-2">
            <rect x="100" y="-10" width="46" height="24" rx="4" fill="var(--accent)" />
            <text x="123" y="6" text-anchor="middle" font-size="9" font-weight="bold" fill="#ffffff">2 MB</text>
          </g>

          <g class="anim-chunk-3">
            <rect x="180" y="5" width="46" height="24" rx="4" fill="var(--accent)" />
            <text x="203" y="21" text-anchor="middle" font-size="9" font-weight="bold" fill="#ffffff">2 MB</text>
          </g>
        </g>

        <!-- Servidor / Carpeta Destino -->
        <g transform="translate(560, 80)">
          <rect x="0" y="0" width="160" height="210" rx="14" fill="var(--surface)" stroke="var(--border)" stroke-width="2" />
          <text x="80" y="30" text-anchor="middle" font-size="12" font-weight="bold" fill="var(--text-heading)">Servidor PC</text>

          <!-- Carpeta temporal -->
          <rect x="15" y="50" width="130" height="55" rx="6" fill="var(--bg-base)" stroke="var(--border)" />
          <text x="25" y="70" font-size="10" font-weight="bold" fill="var(--text-muted)">/temp_chunks</text>
          <text x="25" y="90" font-size="9" fill="var(--accent)">Ensamblando...</text>

          <!-- Barra de progreso de subida -->
          <rect x="15" y="125" width="130" height="12" rx="6" fill="var(--border)" />
          <rect x="15" y="125" width="98" height="12" rx="6" fill="var(--accent)">
            <animate attributeName="width" values="10;50;95;130" dur="3s" repeatCount="indefinite" />
          </rect>
          <text x="80" y="152" text-anchor="middle" font-size="9" font-weight="bold" fill="var(--text-heading)">Mover atómico a /Files</text>
        </g>
      </svg>
    `
  },
  {
    id: 5,
    title: '5. Sincronización en Tiempo Real (Live Sync)',
    desc: 'Cada 2 segundos los navegadores conectados consultan automáticamente los cambios. El archivo nuevo aparece instantáneamente en todas las pantallas sin requerir recarga manual.',
    svg: `
      <svg class="svg-stage" viewBox="0 0 800 400" role="img" aria-labelledby="step5-title step5-desc">
        <title id="step5-title">Paso 5: Sincronización en vivo cada 2 segundos</title>
        <desc id="step5-desc">Sondeo de 2s actualizando las tarjetas de archivos simultáneamente en todos los clientes.</desc>
        
        <!-- Radar / Pulso central de 2 segundos -->
        <g transform="translate(400, 180)">
          <circle cx="0" cy="0" r="28" fill="var(--accent-bg)" stroke="var(--accent)" stroke-width="2" />
          <circle cx="0" cy="0" r="70" fill="none" stroke="var(--accent)" stroke-width="1.5" class="anim-sync-pulse" />
          <text x="0" y="4" text-anchor="middle" font-size="11" font-weight="bold" fill="var(--accent)">Live Sync</text>
          <text x="0" y="18" text-anchor="middle" font-size="9" fill="var(--text-muted)">cada 2s</text>
        </g>

        <!-- Dispositivo 1 (PC) -->
        <g transform="translate(130, 100)">
          <rect x="0" y="0" width="170" height="150" rx="10" fill="var(--surface)" stroke="var(--border)" stroke-width="2" />
          <text x="20" y="28" font-size="11" font-weight="bold" fill="var(--text-heading)">PC Pantalla</text>
          <!-- Tarjeta de archivo sincronizada -->
          <rect x="15" y="45" width="140" height="42" rx="6" fill="var(--bg-base)" stroke="var(--border)" />
          <text x="25" y="65" font-size="10" font-weight="bold" fill="var(--text-heading)">documento.pdf</text>
          <text x="25" y="78" font-size="9" fill="var(--text-muted)">1.4 MB • Ahora mismo</text>
          
          <rect x="15" y="95" width="140" height="42" rx="6" fill="var(--accent-bg)" stroke="var(--accent)" stroke-width="1.5" />
          <text x="25" y="115" font-size="10" font-weight="bold" fill="var(--accent)">video.mp4</text>
          <text x="25" y="128" font-size="9" fill="var(--accent)">¡Nuevo archivo!</text>
        </g>

        <!-- Dispositivo 2 (Móvil) -->
        <g transform="translate(500, 100)">
          <rect x="0" y="0" width="170" height="150" rx="10" fill="var(--surface)" stroke="var(--border)" stroke-width="2" />
          <text x="20" y="28" font-size="11" font-weight="bold" fill="var(--text-heading)">Móvil Pantalla</text>
          <!-- Tarjeta de archivo sincronizada idéntica -->
          <rect x="15" y="45" width="140" height="42" rx="6" fill="var(--bg-base)" stroke="var(--border)" />
          <text x="25" y="65" font-size="10" font-weight="bold" fill="var(--text-heading)">documento.pdf</text>
          <text x="25" y="78" font-size="9" fill="var(--text-muted)">1.4 MB • Sincronizado</text>
          
          <rect x="15" y="95" width="140" height="42" rx="6" fill="var(--accent-bg)" stroke="var(--accent)" stroke-width="1.5" />
          <text x="25" y="115" font-size="10" font-weight="bold" fill="var(--accent)">video.mp4</text>
          <text x="25" y="128" font-size="9" fill="var(--accent)">¡Nuevo archivo!</text>
        </g>
      </svg>
    `
  },
  {
    id: 6,
    title: '6. Descarga y Eliminación de Archivos',
    desc: 'Cualquier usuario puede descargar el archivo con 1 clic en su dispositivo o eliminarlo del servidor cuando ya no lo necesite, con una animación de salida suave de la tarjeta.',
    svg: `
      <svg class="svg-stage" viewBox="0 0 800 400" role="img" aria-labelledby="step6-title step6-desc">
        <title id="step6-title">Paso 6: Descargar y eliminar archivo</title>
        <desc id="step6-desc">Flujo de descarga a un clic y animación de supresión de tarjeta.</desc>
        
        <!-- Tarjeta activa que se descarga -->
        <g transform="translate(180, 120)">
          <rect x="0" y="0" width="200" height="130" rx="12" fill="var(--surface)" stroke="var(--accent)" stroke-width="2" />
          <text x="20" y="35" font-size="13" font-weight="bold" fill="var(--text-heading)">foto_vacaciones.jpg</text>
          <text x="20" y="55" font-size="10" fill="var(--text-muted)">3.2 MB • Imagen JPG</text>
          
          <!-- Botón de descarga -->
          <rect x="20" y="75" width="160" height="34" rx="6" fill="var(--accent)" />
          <text x="100" y="96" text-anchor="middle" font-size="11" font-weight="bold" fill="#ffffff">Descargar a Móvil</text>
        </g>

        <!-- Tarjeta eliminada con animación de salida -->
        <g transform="translate(440, 120)">
          <rect x="0" y="0" width="200" height="130" rx="12" fill="var(--surface)" stroke="var(--danger)" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.8">
            <animate attributeName="opacity" values="0.9;0.2;0.9" dur="2s" repeatCount="indefinite" />
          </rect>
          <text x="20" y="35" font-size="13" font-weight="bold" fill="var(--danger)">archivo_temporal.zip</text>
          <text x="20" y="55" font-size="10" fill="var(--text-muted)">Eliminado del disco</text>
          
          <rect x="20" y="75" width="160" height="34" rx="6" fill="var(--danger-bg)" stroke="var(--danger)" />
          <text x="100" y="96" text-anchor="middle" font-size="11" font-weight="bold" fill="var(--danger)">Eliminado</text>
        </g>
      </svg>
    `
  },
  {
    id: 7,
    title: '7. Motor de 5 Temas Dinámicos',
    desc: 'NetDrop cuenta con un motor de personalización en vivo con 5 temas oficiales: Cálido Terracota, Oscuro Minimal, Bosque Verde, Noche Ámbar y Nórdico Frío. La paleta se adapta al instante.',
    svg: `
      <svg class="svg-stage" viewBox="0 0 800 400" role="img" aria-labelledby="step7-title step7-desc">
        <title id="step7-title">Paso 7: Los 5 Temas Dinámicos de NetDrop</title>
        <desc id="step7-desc">Demostración en bucle de las 5 paletas de color oficiales de themes.json.</desc>

        <!-- 5 Tarjetas representando los temas -->
        <!-- 1. Cálido Terracota -->
        <g transform="translate(70, 110)">
          <rect x="0" y="0" width="115" height="160" rx="10" fill="#faf8f5" stroke="#e6e2dc" stroke-width="2" />
          <rect x="10" y="15" width="95" height="24" rx="4" fill="#c85a32" />
          <text x="57" y="31" text-anchor="middle" font-size="9" font-weight="bold" fill="#ffffff">Cálido</text>
          <text x="57" y="60" text-anchor="middle" font-size="10" font-weight="bold" fill="#1a1a1a">Terracota</text>
          <circle cx="57" cy="115" r="16" fill="#c85a32" />
        </g>

        <!-- 2. Oscuro Minimal -->
        <g transform="translate(205, 110)">
          <rect x="0" y="0" width="115" height="160" rx="10" fill="#0f172a" stroke="#334155" stroke-width="2" />
          <rect x="10" y="15" width="95" height="24" rx="4" fill="#6366f1" />
          <text x="57" y="31" text-anchor="middle" font-size="9" font-weight="bold" fill="#ffffff">Oscuro</text>
          <text x="57" y="60" text-anchor="middle" font-size="10" font-weight="bold" fill="#f8fafc">Minimal</text>
          <circle cx="57" cy="115" r="16" fill="#6366f1" />
        </g>

        <!-- 3. Bosque Verde -->
        <g transform="translate(340, 110)">
          <rect x="0" y="0" width="115" height="160" rx="10" fill="#f2f7f4" stroke="#d3e3da" stroke-width="2" />
          <rect x="10" y="15" width="95" height="24" rx="4" fill="#2d6a4f" />
          <text x="57" y="31" text-anchor="middle" font-size="9" font-weight="bold" fill="#ffffff">Bosque</text>
          <text x="57" y="60" text-anchor="middle" font-size="10" font-weight="bold" fill="#0f1f16">Verde</text>
          <circle cx="57" cy="115" r="16" fill="#2d6a4f" />
        </g>

        <!-- 4. Noche Ámbar -->
        <g transform="translate(475, 110)">
          <rect x="0" y="0" width="115" height="160" rx="10" fill="#1a1918" stroke="#3a3733" stroke-width="2" />
          <rect x="10" y="15" width="95" height="24" rx="4" fill="#d97706" />
          <text x="57" y="31" text-anchor="middle" font-size="9" font-weight="bold" fill="#ffffff">Noche</text>
          <text x="57" y="60" text-anchor="middle" font-size="10" font-weight="bold" fill="#ffffff">Ámbar</text>
          <circle cx="57" cy="115" r="16" fill="#d97706" />
        </g>

        <!-- 5. Nórdico Frío -->
        <g transform="translate(610, 110)">
          <rect x="0" y="0" width="115" height="160" rx="10" fill="#f0f4f8" stroke="#cbd5e1" stroke-width="2" />
          <rect x="10" y="15" width="95" height="24" rx="4" fill="#2563eb" />
          <text x="57" y="31" text-anchor="middle" font-size="9" font-weight="bold" fill="#ffffff">Nórdico</text>
          <text x="57" y="60" text-anchor="middle" font-size="10" font-weight="bold" fill="#0f172a">Frío</text>
          <circle cx="57" cy="115" r="16" fill="#2563eb" />
        </g>
      </svg>
    `
  }
];

export class SvgSequencePlayer {
  constructor(containerId = 'interactive-player') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.stepper = this.container.querySelector('.player-stepper');
    this.viewport = this.container.querySelector('.player-viewport');
    this.titleEl = this.container.querySelector('.step-info-title');
    this.descEl = this.container.querySelector('.step-info-desc');
    this.playBtn = this.container.querySelector('.btn-play-pause');
    this.prevBtn = this.container.querySelector('.btn-prev');
    this.nextBtn = this.container.querySelector('.btn-next');

    this.currentIndex = 0;
    this.isPlaying = true;
    this.autoTimer = null;
    this.intervalMs = 5000;

    this.init();
  }

  init() {
    this.buildStepper();
    this.bindEvents();
    this.renderStep(0);

    // Auto reproducción solo si es visible en pantalla
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (this.isPlaying && !this.autoTimer) {
            this.startTimer();
          }
        } else {
          this.stopTimer();
        }
      });
    }, { threshold: 0.2 });

    observer.observe(this.container);
  }

  buildStepper() {
    if (!this.stepper) return;
    this.stepper.innerHTML = STEPS_DATA.map((step, idx) => `
      <button type="button" class="step-tab ${idx === 0 ? 'active' : ''}" data-step-index="${idx}">
        <span class="step-number">Paso ${step.id}</span>
        <span>${step.title.split('. ')[1] || step.title}</span>
      </button>
    `).join('');
  }

  bindEvents() {
    if (this.stepper) {
      this.stepper.addEventListener('click', (e) => {
        const tab = e.target.closest('.step-tab');
        if (!tab) return;
        const index = parseInt(tab.getAttribute('data-step-index'), 10);
        this.goToStep(index);
      });
    }

    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => {
        this.togglePlayPause();
      });
    }

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.goToStep((this.currentIndex - 1 + STEPS_DATA.length) % STEPS_DATA.length);
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.goToStep((this.currentIndex + 1) % STEPS_DATA.length);
      });
    }
  }

  renderStep(index) {
    this.currentIndex = index;
    const step = STEPS_DATA[index];

    // Actualizar tabs
    if (this.stepper) {
      const tabs = this.stepper.querySelectorAll('.step-tab');
      tabs.forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
      });
    }

    // Actualizar viewport SVG
    if (this.viewport) {
      this.viewport.innerHTML = step.svg;
    }

    // Actualizar textos
    if (this.titleEl) this.titleEl.textContent = step.title;
    if (this.descEl) this.descEl.textContent = step.desc;
  }

  goToStep(index) {
    this.renderStep(index);
    if (this.isPlaying) {
      this.resetTimer();
    }
  }

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    if (this.playBtn) {
      this.playBtn.innerHTML = this.isPlaying
        ? '<svg class="icon icon--sm" aria-hidden="true"><use href="#i-pause"/></svg>'
        : '<svg class="icon icon--sm" aria-hidden="true"><use href="#i-play"/></svg>';
      this.playBtn.setAttribute('title', this.isPlaying ? 'Pausar' : 'Reproducir');
    }

    if (this.isPlaying) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
  }

  startTimer() {
    this.stopTimer();
    this.autoTimer = setInterval(() => {
      this.goToStep((this.currentIndex + 1) % STEPS_DATA.length);
    }, this.intervalMs);
  }

  stopTimer() {
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  }

  resetTimer() {
    this.stopTimer();
    this.startTimer();
  }
}

// Iniciar automáticamente en páginas que incluyan el reproductor
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('interactive-player')) {
    new SvgSequencePlayer('interactive-player');
  }
});
