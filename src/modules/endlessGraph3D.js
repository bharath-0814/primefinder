// PrimeForge Endless 3D High-Speed Batching & Data Storage Engine

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
    this.primes = [];
    this.currentCandidate = 3;
    this.isPlaying = true;
    this.speed = 1000; // default 1,000 / sec
    this.lastFrameTime = performance.now();

    // 3D Geometry
    this.maxVertices = 60000;
    this.nodePositions = [];
    this.lineGeometry = null;
    this.lineMesh = null;
    this.pointsGeometry = null;
    this.pointsMesh = null;
    this.currentTipMesh = null;

    // Camera & Interaction
    this.followHead = true;
    this.orbitAngle = 0;
    this.isUserInteracting = false;
    this.mouseX = 0;
    this.mouseY = 0;

    // Relational Analytics Storage
    this.gapHistogram = {};
    this.maxGap = { gap: 0, p1: 0, p2: 0 };
    this.twinCount = 0;
    this.mod6Count = { 1: 0, 5: 0 };
    this.totalPrimesRendered = 0;
    this.discoveredTwinsList = [];
  }

  init(containerId = 'endless-3d-root') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Load persisted stats from localStorage if available
    this.loadPersistedStats();

    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020617, 0.0006);

    // 2. Camera Setup
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 15000);
    this.camera.position.set(0, 50, 250);

    // 3. High-Performance WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x020617, 1);
    this.container.appendChild(this.renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    // 5. Starfield Background
    this.createCosmicStars();

    // 6. High-Speed Dynamic GPU Buffers (Line & Points)
    this.initGPUBuffers();

    // 7. Seed Initial 2
    this.addPrime(2);

    // 8. Bind Events
    this.bindEvents();

    // 9. Animation Loop
    this.animate();
  }

  loadPersistedStats() {
    try {
      const saved = localStorage.getItem('prime_spire_stats');
      if (saved) {
        const data = JSON.parse(saved);
        this.maxGap = data.maxGap || { gap: 0, p1: 0, p2: 0 };
      }
    } catch (e) {
      console.warn('Could not load localStorage stats', e);
    }
  }

  saveStatsToStorage() {
    try {
      const payload = {
        totalPrimesRendered: this.totalPrimesRendered,
        maxGap: this.maxGap,
        twinCount: this.twinCount,
        gapHistogram: this.gapHistogram,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('prime_spire_stats', JSON.stringify(payload));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  createCosmicStars() {
    const starCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const cyan = new THREE.Color(0x06b6d4);
    const gold = new THREE.Color(0xfbbf24);
    const blue = new THREE.Color(0x3b82f6);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 5000;
      positions[i3 + 1] = (Math.random() - 0.5) * 6000;
      positions[i3 + 2] = (Math.random() - 0.5) * 5000;

      const c = Math.random() > 0.8 ? gold : (Math.random() > 0.4 ? cyan : blue);
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.7
    });

    this.scene.add(new THREE.Points(geometry, material));
  }

  initGPUBuffers() {
    // We use dynamic Float32Array GPU buffers to handle up to 60,000 points without reallocating memory!
    this.lineGeometry = new THREE.BufferGeometry();
    this.pointsGeometry = new THREE.BufferGeometry();

    const positions = new Float32Array(this.maxVertices * 3);
    const colors = new Float32Array(this.maxVertices * 3);

    this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.lineGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Glowing line
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      linewidth: 2
    });
    this.lineMesh = new THREE.Line(this.lineGeometry, lineMat);
    this.scene.add(this.lineMesh);

    // Glowing point nodes
    const pointMat = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.95
    });
    this.pointsMesh = new THREE.Points(this.pointsGeometry, pointMat);
    this.scene.add(this.pointsMesh);

    // Glowing tip sphere
    const tipGeo = new THREE.SphereGeometry(3.5, 16, 16);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    this.currentTipMesh = new THREE.Mesh(tipGeo, tipMat);
    this.scene.add(this.currentTipMesh);
  }

  calculatePosition(p, index) {
    const phi = 1.61803398875;
    const theta = index * (2 * Math.PI / phi);
    const r = 35 + Math.sqrt(index) * 6;
    const y = (index * 4.5) - 150;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    return { x, y, z };
  }

  addPrime(p) {
    const idx = this.totalPrimesRendered;
    const pos = this.calculatePosition(p, idx);

    // 1. Calculate Relations & Gaps
    const prevP = this.primes.length > 0 ? this.primes[this.primes.length - 1] : 0;
    const gap = prevP > 0 ? p - prevP : 0;

    if (gap > 0) {
      this.gapHistogram[gap] = (this.gapHistogram[gap] || 0) + 1;
      if (gap > this.maxGap.gap) {
        this.maxGap = { gap, p1: prevP, p2: p };
      }
    }

    const isTwin = gap === 2;
    if (isTwin) {
      this.twinCount++;
      if (this.discoveredTwinsList.length < 50) {
        this.discoveredTwinsList.push(`(${prevP}, ${p})`);
      }
    }

    if (p > 3) {
      const mod6 = p % 6;
      if (mod6 === 1) this.mod6Count[1]++;
      if (mod6 === 5) this.mod6Count[5]++;
    }

    this.primes.push(p);

    // 2. Buffer Cycling / Ring writing for memory safety
    const writeIdx = idx % this.maxVertices;
    const pIdx = writeIdx * 3;

    const linePos = this.lineGeometry.attributes.position.array;
    const lineCol = this.lineGeometry.attributes.color.array;

    linePos[pIdx] = pos.x;
    linePos[pIdx + 1] = pos.y;
    linePos[pIdx + 2] = pos.z;

    // Color assignments
    let r = 0.02, g = 0.71, b = 0.83; // Cyan default
    if (isTwin) { r = 0.98; g = 0.75; b = 0.14; } // Gold
    else if (gap === 4) { r = 0.51; g = 0.55; b = 0.97; } // Purple
    else if (gap >= 12) { r = 0.96; g = 0.25; b = 0.37; } // Crimson

    lineCol[pIdx] = r;
    lineCol[pIdx + 1] = g;
    lineCol[pIdx + 2] = b;

    this.totalPrimesRendered++;
    return pos;
  }

  batchComputePrimes(count) {
    let computed = 0;
    let lastPos = null;

    while (computed < count) {
      this.currentCandidate += 2;
      if (wheel235Pass(this.currentCandidate)) {
        if (isMillerRabin(BigInt(this.currentCandidate), 6)) {
          lastPos = this.addPrime(this.currentCandidate);
          computed++;
        }
      }
    }

    // Single GPU sync per frame for maximum performance
    const renderCount = Math.min(this.totalPrimesRendered, this.maxVertices);
    this.lineGeometry.setDrawRange(0, renderCount);
    this.pointsGeometry.setDrawRange(0, renderCount);
    this.lineGeometry.attributes.position.needsUpdate = true;
    this.lineGeometry.attributes.color.needsUpdate = true;
    this.pointsGeometry.attributes.position.needsUpdate = true;
    this.pointsGeometry.attributes.color.needsUpdate = true;

    if (lastPos && this.currentTipMesh) {
      this.currentTipMesh.position.set(lastPos.x, lastPos.y, lastPos.z);
    }

    const latestPrime = this.primes[this.primes.length - 1];
    const prevPrime = this.primes[this.primes.length - 2] || 0;
    this.updateHUD(latestPrime, latestPrime - prevPrime);

    // Save snapshot every 5000 primes
    if (this.totalPrimesRendered % 5000 === 0) {
      this.saveStatsToStorage();
    }
  }

  updateHUD(p, gap) {
    const curP = document.getElementById('hud-current-prime');
    const curGap = document.getElementById('hud-current-gap');
    const curCount = document.getElementById('hud-total-primes');
    const twinCountEl = document.getElementById('hud-twin-count');
    const maxGapEl = document.getElementById('hud-max-gap');
    const mod6Ratio = document.getElementById('hud-mod6-ratio');

    if (curP) curP.innerText = p ? p.toLocaleString() : '-';
    if (curGap) curGap.innerText = gap > 0 ? `+${gap}` : 'Start';
    if (curCount) curCount.innerText = this.totalPrimesRendered.toLocaleString();
    if (twinCountEl) twinCountEl.innerText = `${this.twinCount.toLocaleString()} Twins`;
    if (maxGapEl) maxGapEl.innerText = `Max Gap: ${this.maxGap.gap} (at ${this.maxGap.p1})`;

    if (mod6Ratio && (this.mod6Count[1] + this.mod6Count[5] > 0)) {
      const total = this.mod6Count[1] + this.mod6Count[5];
      const p1 = Math.round((this.mod6Count[1] / total) * 100);
      const p5 = 100 - p1;
      mod6Ratio.innerText = `6k+1: ${p1}% | 6k-1: ${p5}%`;
    }

    const gapListEl = document.getElementById('hud-top-gaps');
    if (gapListEl) {
      const sortedGaps = Object.entries(this.gapHistogram)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

      gapListEl.innerHTML = sortedGaps.map(([g, count]) => `
        <span class="bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700/60 text-[11px] font-mono">
          Gap ${g}: <strong class="text-cyan-300">${count.toLocaleString()}×</strong>
        </span>
      `).join(' ');
    }
  }

  exportAcquiredData(format = 'json') {
    const payload = {
      timestamp: new Date().toISOString(),
      totalPrimesRendered: this.totalPrimesRendered,
      latestPrime: this.primes[this.primes.length - 1],
      maxGapDiscovered: this.maxGap,
      twinPrimesCount: this.twinCount,
      sampleTwins: this.discoveredTwinsList,
      gapFrequencyDistribution: this.gapHistogram,
      modulo6Distribution: this.mod6Count,
      recentPrimesSample: this.primes.slice(-500)
    };

    let dataStr = "";
    let fileName = `primespire_data_${Date.now()}`;

    if (format === 'json') {
      dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
      fileName += ".json";
    } else {
      // CSV format
      let csv = "Gap,Frequency\n";
      Object.entries(this.gapHistogram).forEach(([k, v]) => {
        csv += `${k},${v}\n`;
      });
      dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
      fileName += "_gaps.csv";
    }

    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", fileName);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      if (!this.camera || !this.renderer) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Speed Preset Buttons
    document.querySelectorAll('.speed-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.speed-preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.speed = Number(btn.getAttribute('data-speed'));
        document.getElementById('hud-speed-label').innerText = `${this.speed.toLocaleString()} / sec`;
      });
    });

    // Camera follow toggle
    const followBtn = document.getElementById('btn-toggle-follow');
    followBtn?.addEventListener('click', () => {
      this.followHead = !this.followHead;
      followBtn.innerText = `Follow Camera: ${this.followHead ? 'LOCKED' : 'FREE'}`;
      followBtn.className = this.followHead ? 'btn-primary text-xs py-1.5 px-3' : 'btn-secondary text-xs py-1.5 px-3';
    });

    // Play / Pause
    const playBtn = document.getElementById('btn-toggle-play');
    playBtn?.addEventListener('click', () => {
      this.isPlaying = !this.isPlaying;
      playBtn.innerText = this.isPlaying ? '⏸ Pause' : '▶ Resume';
      playBtn.className = this.isPlaying ? 'btn-primary text-xs py-1.5 px-3' : 'btn-secondary text-xs py-1.5 px-3';
    });

    // Export Buttons
    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      this.exportAcquiredData('json');
    });

    document.getElementById('btn-export-csv')?.addEventListener('click', () => {
      this.exportAcquiredData('csv');
    });

    // Mouse Interaction
    window.addEventListener('mousedown', () => { this.isUserInteracting = true; });
    window.addEventListener('mouseup', () => { this.isUserInteracting = false; });
    window.addEventListener('mousemove', (e) => {
      if (!this.followHead) {
        this.mouseX = (e.clientX / window.innerWidth - 0.5) * 400;
        this.mouseY = (e.clientY / window.innerHeight - 0.5) * 400;
      }
    });

    window.addEventListener('wheel', (e) => {
      this.camera.position.z += e.deltaY * 0.25;
    }, { passive: true });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const dt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    // Batch compute based on desired speed per second
    if (this.isPlaying && dt > 0) {
      const primesThisFrame = Math.max(1, Math.round(this.speed * Math.min(dt, 0.1)));
      this.batchComputePrimes(primesThisFrame);
    }

    // Follow Camera
    if (this.followHead && this.currentTipMesh) {
      const tipPos = this.currentTipMesh.position;
      this.orbitAngle += 0.006;

      const camDist = 200;
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
    }

    this.renderer.render(this.scene, this.camera);
  }
}

export const endlessGraph3D = new EndlessPrimeGraph3D();
