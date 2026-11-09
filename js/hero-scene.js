/**
 * NetDrop-Web - Escena 3D del Hero con Three.js (Modo Oscuro Técnico & Interactividad)
 * Soporta rotación libre con el cursor, tooltips por raycasting y botón 'Simular Envío'
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
  AdditiveBlending,
  Raycaster,
  Vector2
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
let raycaster, mouseVector, tooltipEl;

function getCssVar(varName, fallback = '#e2693d') {
  const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return val ? val : fallback;
}

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
  tooltipEl = container ? container.querySelector('.hero-node-tooltip') : null;

  if (!container || !canvas) return;

  if (!checkWebGLSupport()) {
    console.info('[NetDrop-Web] WebGL no disponible en este dispositivo. Mostrando ilustración estática.');
    return;
  }

  const rect = container.getBoundingClientRect();
  const inViewportNow = rect.top < window.innerHeight && rect.bottom > 0;

  if (inViewportNow && !scene) {
    setupThree(container, canvas, skeleton);
  }

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

  document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
    if (isTabActive && isVisible) {
      startLoop();
    } else {
      stopLoop();
    }
  });

  window.addEventListener('netdrop-theme-change', updateThemeColors);

  // Botón para simular envío de paquetes en el hero
  const sendBtn = container.querySelector('.btn-send-packet');
  if (sendBtn) {
    sendBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerPacketBurst();
    });
  }
}

function setupThree(container, canvas, skeleton) {
  const width = container.clientWidth || 480;
  const height = container.clientHeight || 330;

  scene = new Scene();
  camera = new PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 1.2, 7.8);

  renderer = new WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  sceneGroup = new Group();
  scene.add(sceneGroup);

  const ambientLight = new AmbientLight(0xffffff, 1.4);
  scene.add(ambientLight);

  const dirLight = new DirectionalLight(0xffffff, 1.6);
  dirLight.position.set(6, 10, 8);
  scene.add(dirLight);

  const accentColor = new Color(getCssVar('--accent', '#e2693d'));
  const pointLight = new PointLight(accentColor, 3, 16);
  pointLight.position.set(0, 0, 2);
  sceneGroup.add(pointLight);

  const textureLoader = new TextureLoader();
  const logoTexture = textureLoader.load(logoUrl, () => {
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
  centralHostMesh.userData = { title: 'PC Host (Servidor NetDrop :5000)' };
  sceneGroup.add(centralHostMesh);

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

  const nodeConfigs = [
    { name: 'Smartphone (Cliente Web)', pos: new Vector3(-2.8, 0.75, 0.3), size: [0.36, 0.62, 0.06] },
    { name: 'Tablet (Cliente Web)', pos: new Vector3(2.6, 0.85, -0.2), size: [0.55, 0.72, 0.06] },
    { name: 'Laptop (Cliente Web)', pos: new Vector3(0.4, -2.0, 0.3), size: [0.75, 0.5, 0.08] }
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
    nodeMesh.userData = { title: cfg.name };
    sceneGroup.add(nodeMesh);
    satelliteNodes.push(nodeMesh);

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

    const tubeGeo = new TubeGeometry(curve, 32, 0.018, 8, false);
    const tubeMat = new MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.3
    });
    const tubeMesh = new Mesh(tubeGeo, tubeMat);
    sceneGroup.add(tubeMesh);
  });

  connectionCurves.forEach((curve, idx) => {
    const p1Geo = new SphereGeometry(0.08, 16, 16);
    const p1Mat = new MeshBasicMaterial({
      color: accentColor,
      blending: AdditiveBlending
    });
    const p1Mesh = new Mesh(p1Geo, p1Mat);
    p1Mesh.userData = { curve, t: (idx * 0.33) % 1, speed: 0.007, direction: 1 };
    sceneGroup.add(p1Mesh);
    packets.push(p1Mesh);

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

  // Raycaster para tooltips
  raycaster = new Raycaster();
  mouseVector = new Vector2();

  window.addEventListener('mousemove', (e) => {
    const r = container.getBoundingClientRect();
    if (e.clientY >= r.top && e.clientY <= r.bottom) {
      mouseX = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      mouseY = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      targetRotY = mouseX * 0.22;
      targetRotX = mouseY * 0.18;

      if (tooltipEl && camera) {
        mouseVector.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        mouseVector.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        raycaster.setFromCamera(mouseVector, camera);
        const allNodes = [centralHostMesh, ...satelliteNodes];
        const intersects = raycaster.intersectObjects(allNodes);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          tooltipEl.textContent = hit.userData.title || 'Nodo';
          tooltipEl.style.left = `${e.clientX - r.left}px`;
          tooltipEl.style.top = `${e.clientY - r.top}px`;
          tooltipEl.classList.add('visible');
        } else {
          tooltipEl.classList.remove('visible');
        }
      }
    } else if (tooltipEl) {
      tooltipEl.classList.remove('visible');
    }
  });

  window.addEventListener('resize', () => {
    if (!renderer || !camera || !container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  renderer.render(scene, camera);

  if (skeleton) {
    skeleton.classList.add('loaded');
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  startLoop();
}

function triggerPacketBurst() {
  if (!connectionCurves.length) return;
  const accentColor = new Color(getCssVar('--accent', '#e2693d'));

  for (let i = 0; i < 6; i++) {
    const curve = connectionCurves[i % connectionCurves.length];
    const bGeo = new SphereGeometry(0.12, 16, 16);
    const bMat = new MeshBasicMaterial({
      color: accentColor,
      blending: AdditiveBlending
    });
    const burstMesh = new Mesh(bGeo, bMat);
    burstMesh.userData = { curve, t: 0, speed: 0.02 + Math.random() * 0.01, direction: 1 };
    sceneGroup.add(burstMesh);
    packets.push(burstMesh);

    // Auto-eliminar tras completar ciclo
    setTimeout(() => {
      sceneGroup.remove(burstMesh);
      const idx = packets.indexOf(burstMesh);
      if (idx > -1) packets.splice(idx, 1);
      bGeo.dispose();
      bMat.dispose();
    }, 1800);
  }
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
