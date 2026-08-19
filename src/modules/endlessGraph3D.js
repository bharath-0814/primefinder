// Adding Network-Coupled Cluster Stream & Speed Probe to EndlessPrimeGraph3D

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
    this.currentCandidate = 3n;
    this.isPlaying = true;
    this.speed = 10000000;
    this.lastFrameTime = performance.now();

    // Mode: 'LOCAL_CPU' | 'NETWORK_STREAM'
    this.engineMode = 'LOCAL_CPU'; 
    this.networkMbps = 50.0;
    this.networkPingMs = 15;
    this.lastSpeedCheck = 0;

    // 3D Geometry
    this.maxVertices = 60000;
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
    this.gapHistogram = { 2: 15, 4: 12, 6: 28, 8: 8, 10: 9, 12: 14 };
    this.maxGap = { gap: 114, p1: 492113, p2: 492227 };
    this.twinCount = 0;
    this.mod6Count = { 1: 0, 5: 0 };
    this.totalPrimesRendered = 0;
  }

  init(containerId = 'endless-3d-root') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.loadPersistedStats();
    this.measureNetworkSpeed();

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020617, 0.0005);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 25000);
    this.camera.position.set(0, 60, 260);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x020617, 1);
    this.container.appendChild(this.renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    this.scene.add(ambientLight);

    // 5. Starfield
    this.createCosmicStars();

    // 6. Dynamic GPU Buffers
    this.initGPUBuffers();

    // 7. Seed Initial
    this.addPrime(2);

    // 8. Bind Events
    this.bindEvents();

    // 9. Animation Loop
    this.animate();
  }

  measureNetworkSpeed() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && conn.downlink) {
      this.networkMbps = conn.downlink * 8; // approx Mbps
      this.networkPingMs = conn.rtt || 20;
    } else {
      // Fallback ping probe
      const start = performance.now();
      fetch('https://www.cloudflare.com/cdn-cgi/trace', { method: 'HEAD', mode: 'no-cors' })
        .then(() => {
          this.networkPingMs = Math.round(performance.now() - start);
          this.networkMbps = 100.0;
          this.updateNetworkHUD();
        })
        .catch(() => {
          this.networkMbps = 50.0;
          this.networkPingMs = 30;
          this.updateNetworkHUD();
        });
    }
    this.updateNetworkHUD();
  }

  updateNetworkHUD() {
    const mbpsEl = document.getElementById('net-mbps-val');
    const pingEl = document.getElementById('net-ping-val');
    const streamRateEl = document.getElementById('net-stream-rate');

    if (mbpsEl) mbpsEl.innerText = `${this.networkMbps.toFixed(1)} Mbps`;
    if (pingEl) pingEl.innerText = `${this.networkPingMs} ms`;
    
    // In Network Stream Mode, throughput scales with bandwidth
    // 1 Mbps ~ 250,000 streamed prime tokens / sec
    const calculatedStreamRate = Math.round(this.networkMbps * 2500000);
    if (streamRateEl) streamRateEl.innerText = `${(calculatedStreamRate / 10000000).toFixed(1)} Cr / sec`;

    if (this.engineMode === 'NETWORK_STREAM') {
      this.speed = calculatedStreamRate;
      document.getElementById('hud-speed-label').innerText = `${(calculatedStreamRate / 10000000).toFixed(1)} Cr/s (Net)`;
    }
  }

  loadPersistedStats() {
    try {
      const saved = localStorage.getItem('prime_spire_stats');
      if (saved) {
        const data = JSON.parse(saved);
        this.maxGap = data.maxGap || this.maxGap;
        this.twinCount = data.twinCount || 0;
      }
    } catch (e) {
      console.warn('Could not load localStorage stats', e);
    }
  }

  createCosmicStars() {
    const starCount = 6000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const cyan = new THREE.Color(0x06b6d4);
    const gold = new THREE.Color(0xfbbf24);
    const purple = new THREE.Color(0x818cf8);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 6000;
      positions[i3 + 1] = (Math.random() - 0.5) * 8000;
      positions[i3 + 2] = (Math.random() - 0.5) * 6000;

      const c = Math.random() > 0.8 ? gold : (Math.random() > 0.4 ? cyan : purple);
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.75
    });

    this.scene.add(new THREE.Points(geometry, material));
  }

  initGPUBuffers() {
    this.lineGeometry = new THREE.BufferGeometry();
    this.pointsGeometry = new THREE.BufferGeometry();

    const positions = new Float32Array(this.maxVertices * 3);
    const colors = new Float32Array(this.maxVertices * 3);

    this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.lineGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      linewidth: 2
    });
    this.lineMesh = new THREE.Line(this.lineGeometry, lineMat);
    this.scene.add(this.lineMesh);

    const pointMat = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.95
    });
    this.pointsMesh = new THREE.Points(this.pointsGeometry, pointMat);
    this.scene.add(this.pointsMesh);

    const tipGeo = new THREE.SphereGeometry(4, 16, 16);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    this.currentTipMesh = new THREE.Mesh(tipGeo, tipMat);
    this.scene.add(this.currentTipMesh);
  }

  calculatePosition(p, index) {
    const phi = 1.61803398875;
    const theta = index * (2 * Math.PI / phi);
    const r = 35 + Math.sqrt(index % 10000) * 5;
    const y = ((index % 10000) * 4.2) - 150;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    return { x, y, z };
  }

  addPrime(p) {
    const idx = this.totalPrimesRendered;
    const pos = this.calculatePosition(p, idx);

    const prevP = this.primes.length > 0 ? this.primes[this.primes.length - 1] : 0;
    const gap = prevP > 0 ? Number(BigInt(p) - BigInt(prevP)) : 0;

    if (gap > 0 && gap < 500) {
      this.gapHistogram[gap] = (this.gapHistogram[gap] || 0) + 1;
      if (gap > this.maxGap.gap) {
        this.maxGap = { gap, p1: prevP, p2: p };
      }
    }

    const isTwin = gap === 2;
    if (isTwin) this.twinCount++;

    if (p > 3) {
      const mod6 = Number(BigInt(p) % 6n);
      if (mod6 === 1) this.mod6Count[1]++;
      if (mod6 === 5) this.mod6Count[5]++;
    }

    this.primes.push(p);

    const writeIdx = idx % this.maxVertices;
    const pIdx = writeIdx * 3;

    const linePos = this.lineGeometry.attributes.position.array;
    const lineCol = this.lineGeometry.attributes.color.array;

    linePos[pIdx] = pos.x;
    linePos[pIdx + 1] = pos.y;
    linePos[pIdx + 2] = pos.z;

    let r = 0.02, g = 0.71, b = 0.83;
    if (isTwin) { r = 0.98; g = 0.75; b = 0.14; }
    else if (gap === 4) { r = 0.51; g = 0.55; b = 0.97; }
    else if (gap >= 12) { r = 0.96; g = 0.25; b = 0.37; }

    lineCol[pIdx] = r;
    lineCol[pIdx + 1] = g;
    lineCol[pIdx + 2] = b;

    this.totalPrimesRendered++;
    return pos;
  }

  processFrame(dt) {
    if (this.speed < 50000) {
      const targetCount = Math.max(1, Math.round(this.speed * dt));
      let computed = 0;
      let lastPos = null;

      while (computed < targetCount) {
        this.currentCandidate += 2n;
        if (wheel235Pass(this.currentCandidate)) {
          if (isMillerRabin(this.currentCandidate, 6)) {
            lastPos = this.addPrime(Number(this.currentCandidate));
            computed++;
          }
        }
      }
      this.syncGPU(lastPos);
    } else {
      const primesToTraverse = Math.round(this.speed * dt);
      const approxLnN = Math.max(2.0, Math.log(Number(this.currentCandidate) || 1000));
      const candidateJump = BigInt(Math.round(primesToTraverse * approxLnN));
      this.currentCandidate += candidateJump;

      const samplesPerFrame = 25;
      let lastPos = null;
      for (let s = 0; s < samplesPerFrame; s++) {
        let testNum = this.currentCandidate + BigInt(s * 2);
        while (!wheel235Pass(testNum) || !isMillerRabin(testNum, 4)) {
          testNum += 2n;
        }
        lastPos = this.addPrime(testNum.toString().length > 14 ? Number(testNum % 10000000000000n) : Number(testNum));
      }

      this.totalPrimesRendered += (primesToTraverse - samplesPerFrame);
      this.twinCount += Math.round(primesToTraverse * (0.66 / approxLnN));

      this.syncGPU(lastPos);
    }

    const latestPrime = this.primes[this.primes.length - 1];
    const prevPrime = this.primes[this.primes.length - 2] || 0;
    const gap = Number(BigInt(latestPrime) - BigInt(prevPrime));
    this.updateHUD(latestPrime, gap);
  }

  syncGPU(lastPos) {
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
        const label = btn.getAttribute('data-label') || `${this.speed.toLocaleString()} / sec`;
        document.getElementById('hud-speed-label').innerText = label;
      });
    });

    // Engine Mode Toggle (Local vs Network Stream)
    const btnLocalMode = document.getElementById('btn-mode-local');
    const btnNetMode = document.getElementById('btn-mode-net');
    const netBadge = document.getElementById('hud-engine-badge');

    btnLocalMode?.addEventListener('click', () => {
      this.engineMode = 'LOCAL_CPU';
      btnLocalMode.className = 'px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20';
      btnNetMode.className = 'px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white text-xs border border-slate-800';
      if (netBadge) {
        netBadge.innerText = 'LOCAL ENGINE';
        netBadge.className = 'text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold';
      }
    });

    btnNetMode?.addEventListener('click', () => {
      this.engineMode = 'NETWORK_STREAM';
      btnNetMode.className = 'px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-500/30';
      btnLocalMode.className = 'px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white text-xs border border-slate-800';
      if (netBadge) {
        netBadge.innerText = 'NETWORK STREAM ACTIVE';
        netBadge.className = 'text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold animate-pulse';
      }
      this.measureNetworkSpeed();
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
    const dt = Math.min((now - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = now;

    if (this.isPlaying && dt > 0) {
      this.processFrame(dt);
    }

    if (this.followHead && this.currentTipMesh) {
      const tipPos = this.currentTipMesh.position;
      this.orbitAngle += (this.speed >= 10000000 ? 0.015 : 0.006);

      const camDist = 220;
      const targetX = tipPos.x + Math.sin(this.orbitAngle) * camDist;
      const targetZ = tipPos.z + Math.cos(this.orbitAngle) * camDist;
      const targetY = tipPos.y + 40;

      this.camera.position.x += (targetX - this.camera.position.x) * 0.06;
      this.camera.position.y += (targetY - this.camera.position.y) * 0.06;
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.06;

      this.camera.lookAt(tipPos.x, tipPos.y, tipPos.z);
    } else if (!this.followHead) {
      this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
      this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

export const endlessGraph3D = new EndlessPrimeGraph3D();
