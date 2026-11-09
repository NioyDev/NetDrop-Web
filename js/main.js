/**
 * NetDrop-Web - Motor Principal de Interacciones y SEO
 * Sistema de Temas, Detección de SO, Navegación de Anclas y Terminal
 */

const THEMES = [
  { id: 'midnight', name: 'Medianoche (Oscuro)', color: '#e2693d' },
  { id: 'warm', name: 'Cálido Terracota', color: '#c85a32' },
  { id: 'dark-slate', name: 'Oscuro Minimal', color: '#6366f1' },
  { id: 'forest', name: 'Bosque Verde', color: '#2d6a4f' },
  { id: 'midnight-amber', name: 'Noche Ámbar', color: '#d97706' },
  { id: 'nordic', name: 'Nórdico Frío', color: '#2563eb' }
];

// 1. Detección Inteligente de Sistema Operativo
export function detectUserOS() {
  const ua = navigator.userAgent || '';
  if (/Windows/i.test(ua)) return 'windows';
  if (/Linux|X11/i.test(ua)) return 'linux';
  return 'other';
}

export function setupOSDownloadButton() {
  const heroCta = document.getElementById('hero-download-cta');
  const heroCtaLabel = document.getElementById('hero-download-label');
  if (!heroCta || !heroCtaLabel) return;

  const os = detectUserOS();
  if (os === 'windows') {
    heroCtaLabel.textContent = 'Descargar para Windows (.exe)';
  } else if (os === 'linux') {
    heroCtaLabel.textContent = 'Descargar para Linux (.zip / .deb)';
  } else {
    heroCtaLabel.textContent = 'Ver descargas disponibles';
  }
}

// 2. Gestión de Temas
export function initThemeEngine() {
  const savedTheme = localStorage.getItem('netdrop_theme') || 'midnight';
  applyTheme(savedTheme, false);

  const themeBtn = document.getElementById('theme-menu-btn');
  const themeDropdown = document.getElementById('theme-dropdown');

  if (themeBtn && themeDropdown) {
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
  if (themeId === 'midnight') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', themeId);
  }

  if (save) {
    localStorage.setItem('netdrop_theme', themeId);
  }

  const current = THEMES.find(t => t.id === themeId) || THEMES[0];
  const preview = document.querySelector('.theme-color-preview');
  if (preview) preview.style.background = current.color;

  document.querySelectorAll('.theme-option').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-theme-id') === themeId);
  });

  window.dispatchEvent(new CustomEvent('netdrop-theme-change', { detail: { themeId, theme: current } }));
}

// 3. ScrollSpy y Resaltado de Anclas
export function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"], .mobile-nav-link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
        if (history.replaceState) {
          history.replaceState(null, '', `#${id}`);
        }
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  sections.forEach(s => observer.observe(s));
}

// 4. Terminal de Comandos Interactiva Hero
export function initTerminal() {
  const terminal = document.querySelector('.terminal-card');
  if (!terminal) return;

  const tabBtns = terminal.querySelectorAll('.terminal-tab-btn');
  const bodyEl = terminal.querySelector('.terminal-code-text');
  const copyBtn = terminal.querySelector('.terminal-copy-btn');

  const COMMANDS = {
    python: 'git clone https://github.com/NioyDev/NetDrop.git\ncd NetDrop && pip install -r requirements.txt\npython app.py',
    rust: 'git clone https://github.com/NioyDev/NetDrop-Rust.git\ncd NetDrop-Rust\ncargo run --release --features desktop'
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const lang = btn.getAttribute('data-lang');
      if (bodyEl && COMMANDS[lang]) {
        bodyEl.textContent = COMMANDS[lang];
      }
    });
  });

  if (copyBtn && bodyEl) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(bodyEl.textContent.trim());
        const origText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span>Copiado ✓</span>';
        setTimeout(() => { copyBtn.innerHTML = origText; }, 2000);
      } catch (err) {
        console.warn('No se pudo copiar el texto', err);
      }
    });
  }
}

// 5. Pestañas de Descargas y Paneles
export function initDownloadTabs() {
  const tabBtns = document.querySelectorAll('.dl-tab-btn');
  const contents = document.querySelectorAll('.dl-tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      tabBtns.forEach(b => b.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
}

// 6. Acordeón FAQ
export function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!questionBtn || !answer) return;

    questionBtn.addEventListener('click', () => {
      const isExpanded = questionBtn.getAttribute('aria-expanded') === 'true';
      questionBtn.setAttribute('aria-expanded', !isExpanded);
      answer.style.display = isExpanded ? 'none' : 'block';
    });
  });
}

// 7. Navegación Móvil
export function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-nav-drawer');
  if (!toggleBtn || !drawer) return;

  function closeMenu() {
    toggleBtn.classList.remove('is-active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('is-open');
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = drawer.classList.contains('is-open');
    if (isOpen) {
      closeMenu();
    } else {
      toggleBtn.classList.add('is-active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      drawer.classList.add('is-open');
    }
  });

  const links = drawer.querySelectorAll('.mobile-nav-link, a');
  links.forEach(l => {
    l.addEventListener('click', () => {
      closeMenu();
    });
  });

  document.addEventListener('click', (e) => {
    if (!drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1040) {
      closeMenu();
    }
  });
}

// Inicialización consolidada
document.addEventListener('DOMContentLoaded', () => {
  initThemeEngine();
  setupOSDownloadButton();
  initScrollSpy();
  initTerminal();
  initDownloadTabs();
  initFaqAccordion();
  initMobileNav();
});
