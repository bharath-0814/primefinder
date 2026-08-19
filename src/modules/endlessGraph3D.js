// PrimeForge Endless 3D Prime Trajectory & Relation Observer Engine

import * as THREE from 'three';
import { isMillerRabin, wheel235Pass } from '../utils/bigMath.js';
import { sound } from '../utils/audio.js';

export class EndlessPrimeGraph3D {
  constructor() {
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Simulation State
    this.primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    this.currentCandidate = 49;
    this.primeIndex = this.primes.length;
    this.isPlaying = true;
    this.speed = 20; // primes per second target or interval
    this.lastStepTime = performance.now();

    // 3D Geometry
    this.nodePositions = [];
    this.nodeColors = [];
    this.nodeMeshes = [];
    this.lineGeometry = null;
    this.lineMesh = null;
    this.particles = null;
    this.currentTipMesh = null;

    // Camera & Interaction
    this.followHead = true;
    this.orbitAngle = 0;
    this.isUserInteracting = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetCameraPos = new THREE.Vector3(0, 50, 200);

    // Relational Pattern Metrics
    this.gapHistogram = {};
    this.twinCount = 0;
    this.sophieCount = 0;
    this.mod6Count = { 1: 0, 5: 0 };
    this.totalPrimesRendered = 0;
  }

  init(containerId = 'endless-3d-root') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020617, 0.0008);

    // 2. Camera Setup
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      8000
    );
    this.camera.position.set(0, 20, 180);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x020617, 1);
    this.container.appendChild(this.renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 3, 1000);
    pointLight.position.set(0, 100, 100);
    this.scene.add(pointLight);

    // 5. Starfield & Cosmic Background
    this.createCosmicStars();

    // 6. Dynamic Prime Helix Ribbon / Line
    this.initDynamicLine();

    // 7. Seed Initial Primes
    this.renderInitialPrimes();

    // 8. Event Listeners
    this.bindEvents();

    // 9. Start Rendering Loop
    this.animate();
  }

  createCosmicStars() {
    const starCount = 4500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const cyan = new THREE.Color(0x06b6d4);
    const gold = new THREE.Color(0xfbbf24);
    const deepBlue = new THREE.Color(0x3b82f6);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 3500;
      positions[i3 + 1] = (Math.random() - 0.5) * 4000;
      positions[i3 + 2] = (Math.random() - 0.5) * 3500;

      const c = Math.random() > 0.8 ? gold : (Math.random() > 0.4 ? cyan : deepBlue);
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.75
    });

    const starfield = new THREE.Points(geometry, material);
    this.scene.add(starfield);
  }

  initDynamicLine() {
    this.lineGeometry = new THREE.BufferGeometry();
    const maxPoints = 20000;
    const positions = new Float32Array(maxPoints * 3);
    const colors = new Float32Array(maxPoints * 3);

    this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.lineGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      linewidth: 2.5
    });

    this.lineMesh = new THREE.Line(this.lineGeometry, lineMaterial);
    this.scene.add(this.lineMesh);

    // Glowing head sphere at the advancing tip
    const tipGeo = new THREE.SphereGeometry(3.5, 16, 16);
    const tipMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: false
    });
    this.currentTipMesh = new THREE.Mesh(tipGeo, tipMat);
    this.scene.add(this.currentTipMesh);
  }

  calculatePosition(p, index) {
    // Unique 3D Manifold: Logarithmic Helical Angle + Polar Modular Wave
    // theta is based on the Golden Ratio angle (phi * 2pi) combined with harmonic frequency
    const phi = 1.61803398875;
    const theta = index * (2 * Math.PI / phi);
    
    // Radius pulses based on square root of index and prime gap behavior
    const r = 40 + Math.sqrt(index) * 8 + Math.sin(p * 0.1) * 6;
    
    // Height winds steadily upwards forming an endless cosmic spire
    const y = (index * 6.5) - 150;
    
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    return new THREE.Vector3(x, y, z);
  }

  addPrimeToGraph(p) {
    const idx = this.totalPrimesRendered;
    const pos = this.calculatePosition(p, idx);
    this.nodePositions.push(pos);

    // Analyze Relational Attributes for Colors
    // Is Twin prime?
    const prevP = this.primes[this.primes.length - 2];
    const gap = prevP ? p - prevP : 0;
    if (gap > 0) {
      this.gapHistogram[gap] = (this.gapHistogram[gap] || 0) + 1;
    }

    const isTwin = gap === 2;
    if (isTwin) this.twinCount++;

    // Modulo 6 relation (all primes > 3 are 6k ± 1)
    if (p > 3) {
      const mod6 = p % 6;
      if (mod6 === 1) this.mod6Count[1]++;
      if (mod6 === 5) this.mod6Count[5]++;
    }

    // Determine Color
    let color = new THREE.Color(0x06b6d4); // Default cyan
    if (isTwin) color = new THREE.Color(0xfbbf24); // Gold for twin
    else if (gap === 4) color = new THREE.Color(0x818cf8); // Purple for cousin
    else if (gap >= 10) color = new THREE.Color(0xf43f5e); // Crimson for large gap

    this.nodeColors.push(color);

    // Create 3D Node Sphere
    const sphereGeo = new THREE.SphereGeometry(isTwin ? 2.5 : 1.8, 12, 12);
    const sphereMat = new THREE.MeshBasicMaterial({ color: color });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.copy(pos);
    this.scene.add(sphere);
    this.nodeMeshes.push(sphere);

    // Update Line Buffer
    const linePos = this.lineGeometry.attributes.position.array;
    const lineCol = this.lineGeometry.attributes.color.array;

    const pIdx = idx * 3;
    linePos[pIdx] = pos.x;
    linePos[pIdx + 1] = pos.y;
    linePos[pIdx + 2] = pos.z;

    lineCol[pIdx] = color.r;
    lineCol[pIdx + 1] = color.g;
    lineCol[pIdx + 2] = color.b;

    this.lineGeometry.setDrawRange(0, idx + 1);
    this.lineGeometry.attributes.position.needsUpdate = true;
    this.lineGeometry.attributes.color.needsUpdate = true;

    // Update Tip Position
    if (this.currentTipMesh) {
      this.currentTipMesh.position.copy(pos);
    }

    this.totalPrimesRendered++;

    // Update UI HUD
    this.updateHUD(p, gap, idx + 1);

    // Sound chime
    sound.playTick();
  }

  renderInitialPrimes() {
    const seed = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
    seed.forEach(p => this.addPrimeToGraph(p));
    this.currentCandidate = 99;
  }

  stepNextPrime() {
    let found = false;
    let attempts = 0;

    while (!found && attempts < 2000) {
      attempts++;
      this.currentCandidate += 2;

      if (wheel235Pass(this.currentCandidate)) {
        if (isMillerRabin(BigInt(this.currentCandidate), 8)) {
          this.primes.push(this.currentCandidate);
          this.addPrimeToGraph(this.currentCandidate);
          found = true;
          break;
        }
      }
    }
  }

  updateHUD(p, gap, totalCount) {
    const curP = document.getElementById('hud-current-prime');
    const curGap = document.getElementById('hud-current-gap');
    const curCount = document.getElementById('hud-total-primes');
    const twinRatio = document.getElementById('hud-twin-count');
    const mod6Ratio = document.getElementById('hud-mod6-ratio');

    if (curP) curP.innerText = p.toLocaleString();
    if (curGap) curGap.innerText = gap > 0 ? `+${gap}` : 'Start';
    if (curCount) curCount.innerText = totalCount.toLocaleString();
    if (twinRatio) twinRatio.innerText = `${this.twinCount} Twins`;

    if (mod6Ratio && (this.mod6Count[1] + this.mod6Count[5] > 0)) {
      const totalMod = this.mod6Count[1] + this.mod6Count[5];
      const p1 = Math.round((this.mod6Count[1] / totalMod) * 100);
      const p5 = 100 - p1;
      mod6Ratio.innerText = `6k+1: ${p1}% | 6k-1: ${p5}%`;
    }

    // Top most frequent gaps
    const gapListEl = document.getElementById('hud-top-gaps');
    if (gapListEl) {
      const sortedGaps = Object.entries(this.gapHistogram)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

      gapListEl.innerHTML = sortedGaps.map(([g, count]) => `
        <span class="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700/60 text-[11px] font-mono">
          Gap ${g}: <strong class="text-cyan-300">${count}×</strong>
        </span>
      `).join(' ');
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      if (!this.camera || !this.renderer) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Camera follow toggle
    const followBtn = document.getElementById('btn-toggle-follow');
    followBtn?.addEventListener('click', () => {
      this.followHead = !this.followHead;
      followBtn.innerText = `Follow Camera: ${this.followHead ? 'LOCKED' : 'FREE'}`;
      followBtn.className = this.followHead ? 'btn-primary text-xs py-1.5 px-3' : 'btn-secondary text-xs py-1.5 px-3';
    });

    // Play/Pause
    const playBtn = document.getElementById('btn-toggle-play');
    playBtn?.addEventListener('click', () => {
      this.isPlaying = !this.isPlaying;
      playBtn.innerText = this.isPlaying ? '⏸ Pause Spire' : '▶ Resume Spire';
      playBtn.className = this.isPlaying ? 'btn-primary text-xs py-1.5 px-3' : 'btn-secondary text-xs py-1.5 px-3';
    });

    // Speed Slider
    const speedSlider = document.getElementById('slider-speed');
    speedSlider?.addEventListener('input', (e) => {
      this.speed = Number(e.target.value);
      document.getElementById('speed-val-label').innerText = `${this.speed} / sec`;
    });

    // Mouse Interaction for free look
    window.addEventListener('mousedown', () => { this.isUserInteracting = true; });
    window.addEventListener('mouseup', () => { this.isUserInteracting = false; });
    window.addEventListener('mousemove', (e) => {
      if (!this.followHead) {
        this.mouseX = (e.clientX / window.innerWidth - 0.5) * 300;
        this.mouseY = (e.clientY / window.innerHeight - 0.5) * 300;
      }
    });

    // Wheel Zoom
    window.addEventListener('wheel', (e) => {
      this.camera.position.z += e.deltaY * 0.2;
    }, { passive: true });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const interval = 1000 / this.speed;

    // Step the prime snake
    if (this.isPlaying && now - this.lastStepTime >= interval) {
      this.stepNextPrime();
      this.lastStepTime = now;
    }

    // Camera Movement
    if (this.followHead && this.nodePositions.length > 0) {
      const tipPos = this.nodePositions[this.nodePositions.length - 1];
      this.orbitAngle += 0.008;

      const camDist = 180;
      const targetX = tipPos.x + Math.sin(this.orbitAngle) * camDist;
      const targetZ = tipPos.z + Math.cos(this.orbitAngle) * camDist;
      const targetY = tipPos.y + 40;

      this.camera.position.x += (targetX - this.camera.position.x) * 0.05;
      this.camera.position.y += (targetY - this.camera.position.y) * 0.05;
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.05;

      this.camera.lookAt(tipPos.x, tipPos.y, tipPos.z);
    } else if (!this.followHead) {
      this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
      this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05;
      this.camera.lookAt(0, (this.totalPrimesRendered * 3) - 100, 0);
    }

    // Subtle line pulse
    if (this.currentTipMesh) {
      this.currentTipMesh.rotation.y += 0.02;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

export const endlessGraph3D = new EndlessPrimeGraph3D();
