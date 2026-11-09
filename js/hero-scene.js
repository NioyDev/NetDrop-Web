/**
 * NetDrop-Web - Escena 3D del Hero con Three.js (Modo Oscuro Técnico)
 * Detección segura de WebGL en canvas aislado, esqueleto sin texto y arranque inmediato
 */

import logoUrl from '../assets/logo.png';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Mesh,
  SphereGeometry,
  BoxGeometry,
  PlaneGeometry,
  RingGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
  AmbientLight,
  DirectionalLight,
  PointLight,
  CatmullRomCurve3,
  Vector3,
  TubeGeometry,
  TextureLoader,
  Group,
  Color,
  AdditiveBlending
} from 'three';

let scene, camera, renderer;
let centralHostMesh, qrPlaneMesh;
const satelliteNodes = [];
const connectionCurves = [];
const packets = [];
const wifiRings = [];
let animFrameId = null;
let isVisible = false;
let isTabActive = true;
let mouseX = 0, mouseY = 0;
let targetRotX = 0, targetRotY = 0;
let sceneGroup;

// Obtener color CSS actual
function getCssVar(varName, fallback = '#e2693d') {
  const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return val ? val : fallback;
}

// Prueba no destructiva de WebGL en canvas aislado
function checkWebGLSupport() {
  try {
    const testCanvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (
      testCanvas.getContext('webgl2') || 
      testCanvas.getContext('webgl') || 
      testCanvas.getContext('experimental-webgl')
    ));
  } catch (e) {
    return false;
  }
}

export function initHeroScene(containerId = 'hero-scene-container', canvasId = 'hero-canvas') {
  const container = document.getElementById(containerId);
  const canvas = document.getElementById(canvasId);
  const skeleton = container ? container.querySelector('.hero-skeleton') : null;

  if (!container || !canvas) return;

  // Comprobar soporte WebGL sin contaminar el canvas de Three.js
  if (!checkWebGLSupport()) {
    console.info('[NetDrop-Web] WebGL no disponible en este dispositivo. Mostrando ilustración vectorial estática.');
    return;
  }

  // Detección directa si ya está en viewport para arrancar de inmediato
  const rect = container.getBoundingClientRect();
  const inViewportNow = rect.top < window.innerHeight && rect.bottom > 0;

  if (inViewportNow && !scene) {
    setupThree(container, canvas, skeleton);
  }

  // IntersectionObserver para pausar cuando el usuario hace scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        if (!scene) {
          setupThree(container, canvas, skeleton);
        } else if (!animFrameId) {
          startLoop();
        }
      } else {
        stopLoop();
      }
    });
  }, { threshold: 0.05 });

  observer.observe(container);

  // Control de visibilidad de pestaña (Page Visibility API)
  document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
    if (isTabActive && isVisible) {
      startLoop();
    } else {
      stopLoop();
    }
  });

  // Reacción dinámica a cambios de tema CSS
  window.addEventListener('netdrop-theme-change', updateThemeColors);
}

function setupThree(container, canvas, skeleton) {
  const width = container.clientWidth || 480;
  const height = container.clientHeight || 330;

  // 1. Escena
  scene = new Scene();

  // 2. Cámara
  camera = new PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 1.2, 7.8);

  // 3. Renderer limpio
  renderer = new WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Grupo principal para parallax
  sceneGroup = new Group();
  scene.add(sceneGroup);

  // 4. Iluminación técnica
  const ambientLight = new AmbientLight(0xffffff, 1.4);
  scene.add(ambientLight);

  const dirLight = new DirectionalLight(0xffffff, 1.6);
  dirLight.position.set(6, 10, 8);
  scene.add(dirLight);

  const accentColor = new Color(getCssVar('--accent', '#e2693d'));
  const pointLight = new PointLight(accentColor, 3, 16);
  pointLight.position.set(0, 0, 2);
  sceneGroup.add(pointLight);

  // 5. Nodo Central (PC Anfitrión con Logo Oficial)
  const textureLoader = new TextureLoader();
  const logoTexture = textureLoader.load(logoUrl, () => {
    // Si la textura se descarga, se mapea correctamente
    if (centralHostMesh) {
      centralHostMesh.material.map = logoTexture;
      centralHostMesh.material.needsUpdate = true;
    }
  });

  const hostGeo = new SphereGeometry(0.85, 32, 32);
  const hostMat = new MeshStandardMaterial({
    map: logoTexture,
    metalness: 0.35,
    roughness: 0.3,
    color: 0xffffff
  });
  centralHostMesh = new Mesh(hostGeo, hostMat);
  sceneGroup.add(centralHostMesh);

  // Anillos Wi-Fi expansivos sutiles
  for (let i = 0; i < 3; i++) {
    const ringGeo = new RingGeometry(0.95, 1.04, 48);
    const ringMat = new MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.5 - i * 0.15,
      side: 2
    });
    const ringMesh = new Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.3;
    ringMesh.userData = { scale: 1 + i * 0.5, speed: 0.007 + i * 0.002 };
    sceneGroup.add(ringMesh);
    wifiRings.push(ringMesh);
  }

  // 6. Nodos Satélite (Móvil, Tablet, Laptop)
  const nodeConfigs = [
    { name: 'Smartphone', pos: new Vector3(-2.8, 0.75, 0.3), size: [0.36, 0.62, 0.06] },
    { name: 'Tablet', pos: new Vector3(2.6, 0.85, -0.2), size: [0.55, 0.72, 0.06] },
    { name: 'Laptop', pos: new Vector3(0.4, -2.0, 0.3), size: [0.75, 0.5, 0.08] }
  ];

  nodeConfigs.forEach((cfg) => {
    const nodeGeo = new BoxGeometry(cfg.size[0], cfg.size[1], cfg.size[2]);
    const nodeMat = new MeshStandardMaterial({
      color: new Color(getCssVar('--surface-elevated', '#181c24')),
      metalness: 0.7,
      roughness: 0.35
    });
    const nodeMesh = new Mesh(nodeGeo, nodeMat);
    nodeMesh.position.copy(cfg.pos);
    sceneGroup.add(nodeMesh);
    satelliteNodes.push(nodeMesh);

    // Curva bezier de conexión tridimensional
    const midPoint = new Vector3(
      cfg.pos.x * 0.5,
      cfg.pos.y * 0.5 + 0.45,
      cfg.pos.z * 0.5 + 0.5
    );
    const curve = new CatmullRomCurve3([
      new Vector3(0, 0, 0),
      midPoint,
      cfg.pos
    ]);
    connectionCurves.push(curve);

    // Tubo de fibra luminosa para la curva
    const tubeGeo = new TubeGeometry(curve, 32, 0.018, 8, false);
    const tubeMat = new MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.3
    });
    const tubeMesh = new Mesh(tubeGeo, tubeMat);
    sceneGroup.add(tubeMesh);
  });

  // 7. Paquetes de datos luminosos (Mezcla aditiva para brillo en oscuro)
  connectionCurves.forEach((curve, idx) => {
    // Paquete de subida
    const p1Geo = new SphereGeometry(0.08, 16, 16);
    const p1Mat = new MeshBasicMaterial({
      color: accentColor,
      blending: AdditiveBlending
    });
    const p1Mesh = new Mesh(p1Geo, p1Mat);
    p1Mesh.userData = { curve, t: (idx * 0.33) % 1, speed: 0.007, direction: 1 };
    sceneGroup.add(p1Mesh);
    packets.push(p1Mesh);

    // Paquete de descarga
    const p2Geo = new BoxGeometry(0.11, 0.11, 0.11);
    const p2Mat = new MeshBasicMaterial({
      color: new Color(0xffffff),
      blending: AdditiveBlending
    });
    const p2Mesh = new Mesh(p2Geo, p2Mat);
    p2Mesh.userData = { curve, t: (idx * 0.33 + 0.5) % 1, speed: 0.006, direction: -1 };
    sceneGroup.add(p2Mesh);
    packets.push(p2Mesh);
  });

  // 8. Plano QR de enlace que rota
  const qrGeo = new PlaneGeometry(0.65, 0.65);
  const qrMat = new MeshBasicMaterial({
    color: accentColor,
    wireframe: true,
    transparent: true,
    opacity: 0.7
  });
  qrPlaneMesh = new Mesh(qrGeo, qrMat);
  qrPlaneMesh.position.set(-1.4, -1.2, 0.8);
  qrPlaneMesh.rotation.z = Math.PI / 12;
  sceneGroup.add(qrPlaneMesh);

  // Parallax con el cursor
  window.addEventListener('mousemove', (e) => {
    const r = container.getBoundingClientRect();
    if (e.clientY >= r.top && e.clientY <= r.bottom) {
      mouseX = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      mouseY = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      targetRotY = mouseX * 0.22;
      targetRotX = mouseY * 0.18;
    }
  });

  // Reajuste responsive
  window.addEventListener('resize', () => {
    if (!renderer || !camera || !container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // Render inicial
  renderer.render(scene, camera);

  // Desvanecer el esqueleto SVG inmediatamente tras renderizar el frame 1
  if (skeleton) {
    skeleton.classList.add('loaded');
  }

  // Si el usuario prefiere movimiento reducido, dejamos el cuadro estático
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  startLoop();
}

function updateThemeColors() {
  if (!scene) return;
  const newAccent = new Color(getCssVar('--accent', '#e2693d'));
  const newSurface = new Color(getCssVar('--surface-elevated', '#181c24'));

  wifiRings.forEach(r => {
    r.material.color.copy(newAccent);
  });

  packets.forEach((p, idx) => {
    if (idx % 2 === 0) p.material.color.copy(newAccent);
  });

  if (qrPlaneMesh) {
    qrPlaneMesh.material.color.copy(newAccent);
  }

  satelliteNodes.forEach(node => {
    node.material.color.copy(newSurface);
  });
}

function startLoop() {
  if (animFrameId) return;
  const loop = () => {
    renderFrame();
    animFrameId = requestAnimationFrame(loop);
  };
  animFrameId = requestAnimationFrame(loop);
}

function stopLoop() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
}

function renderFrame() {
  if (!renderer || !scene || !camera) return;

  if (centralHostMesh) {
    centralHostMesh.rotation.y += 0.005;
  }

  sceneGroup.rotation.y += (targetRotY - sceneGroup.rotation.y) * 0.05;
  sceneGroup.rotation.x += (targetRotX - sceneGroup.rotation.x) * 0.05;

  wifiRings.forEach(ring => {
    ring.userData.scale += ring.userData.speed;
    if (ring.userData.scale > 2.8) {
      ring.userData.scale = 1.0;
    }
    ring.scale.set(ring.userData.scale, ring.userData.scale, 1);
    ring.material.opacity = Math.max(0, 0.6 * (1 - (ring.userData.scale - 1) / 1.8));
  });

  packets.forEach(p => {
    p.userData.t += p.userData.speed * p.userData.direction;
    if (p.userData.t > 1) p.userData.t = 0;
    if (p.userData.t < 0) p.userData.t = 1;
    const pt = p.userData.curve.getPoint(p.userData.t);
    p.position.copy(pt);
  });

  if (qrPlaneMesh) {
    qrPlaneMesh.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}

export function disposeHeroScene() {
  stopLoop();
  if (scene) {
    scene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }
  if (renderer) {
    renderer.dispose();
  }
  window.removeEventListener('netdrop-theme-change', updateThemeColors);
}
