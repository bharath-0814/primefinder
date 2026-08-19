// PrimeNexus Interactive 3D Prime Relationship Web & Graph Module

import * as THREE from 'three';
import { checkPrime } from '../utils/relationsMath.js';
import { sound } from '../utils/audio.js';

export class RelationNexus3DModule {
  constructor() {
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.nodes = [];
    this.linesGroup = null;
    this.nodesGroup = null;
    this.activeFilter = 'ALL'; // 'ALL' | 'TWINS' | 'SOPHIE' | 'MERSENNE' | 'GOLDBACH'
    this.selectedPrime = null;
    this.isDragging = false;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.orbitAngle = 0;
  }

  init() {
    this.renderContainer();
    this.init3DScene();
    this.populateRelationNetwork(120);
    this.bindEvents();
    this.animate();
  }

  renderContainer() {
    const container = document.getElementById('tab-nexus');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Header & Explanation -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="badge-cyan font-mono">INTERACTIVE 3D RELATION GRAPH</span>
              <span class="text-xs text-amber-400 font-bold">★ Web of Numbers</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-outfit text-white">
              The 3D Nexus of Prime Relationships
            </h2>
            <p class="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Primes are not lonely islands—they form a luminous, interconnected 3D crystal web of twins, algebraic chains, and additive symmetries.
            </p>
          </div>

          <!-- Relationship Filter Switchers -->
          <div class="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            <button data-rel="ALL" class="rel-filter-btn active">🌐 All Relations</button>
            <button data-rel="TWINS" class="rel-filter-btn">✨ Twin Primes (p, p+2)</button>
            <button data-rel="SOPHIE" class="rel-filter-btn">🔗 Sophie Germain (2p+1)</button>
            <button data-rel="MERSENNE" class="rel-filter-btn">🦖 Mersenne (2ᵖ−1)</button>
            <button data-rel="GOLDBACH" class="rel-filter-btn">⚡ Goldbach Pairs</button>
          </div>
        </div>

        <!-- 3D Graph Card -->
        <div class="forge-card p-4 relative overflow-hidden flex flex-col items-center">
          
          <!-- Floating Legend & Info Box -->
          <div class="absolute top-6 left-6 z-20 bg-slate-950/85 backdrop-blur border border-slate-700/80 p-3.5 rounded-xl font-mono text-xs shadow-2xl max-w-xs space-y-2 pointer-events-none">
            <div class="text-slate-300 font-bold flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Luminous Relation Keys</span>
            </div>
            <div class="space-y-1 text-[11px]">
              <div class="flex items-center gap-2"><span class="w-3 h-0.5 bg-cyan-400 inline-block"></span> <span class="text-cyan-300 font-semibold">Cyan:</span> Twin Primes (gap 2)</div>
              <div class="flex items-center gap-2"><span class="w-3 h-0.5 bg-amber-400 inline-block"></span> <span class="text-amber-300 font-semibold">Gold:</span> Sophie Germain Chains</div>
              <div class="flex items-center gap-2"><span class="w-3 h-0.5 bg-purple-400 inline-block"></span> <span class="text-purple-300 font-semibold">Purple:</span> Mersenne Exponents</div>
              <div class="flex items-center gap-2"><span class="w-3 h-0.5 bg-emerald-400 inline-block"></span> <span class="text-emerald-300 font-semibold">Emerald:</span> Goldbach Dual Sums</div>
            </div>
          </div>

          <!-- Top Right Controls -->
          <div class="absolute top-6 right-6 z-20 flex items-center gap-2 bg-slate-950/85 backdrop-blur border border-slate-700/80 p-1.5 rounded-xl font-mono text-xs shadow-xl">
            <button id="btn-nexus-reset" class="p-1.5 hover:bg-slate-800 rounded text-slate-300 text-[11px]" title="Reset Camera">Reset View</button>
            <button id="btn-nexus-spin" class="p-1.5 hover:bg-slate-800 rounded text-cyan-400 text-[11px]" title="Toggle Auto-Spin">Auto-Orbit: ON</button>
          </div>

          <!-- The Three.js WebGL Container -->
          <div id="nexus-3d-canvas" class="w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-900 cursor-grab active:cursor-grabbing" style="height: 560px;"></div>

          <!-- Bottom Selected Node Inspector -->
          <div id="nexus-node-inspector" class="w-full mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
            <div>
              <span class="text-slate-500">Selected Node:</span>
              <span id="inspect-prime-val" class="text-cyan-300 font-bold text-sm ml-2">Prime 41</span>
              <span id="inspect-prime-badge" class="badge-gold ml-2">Euler Core & Twin (41, 43)</span>
            </div>
            <div id="inspect-prime-relations" class="text-slate-400 text-[11px]">
              Relations: Twin of 43 • Sophie Germain Parent of 83 • Euler Polynomial Root
            </div>
          </div>
        </div>

        <!-- 3 Insight Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs text-slate-300 leading-relaxed">
          <div class="forge-card p-5 space-y-2 border-cyan-500/20">
            <div class="font-bold text-cyan-300 font-mono text-sm">How Relations Find New Primes</div>
            <p>
              Instead of testing numbers randomly, mathematicians use relation ladders! For example, testing \(2p + 1\) from a known prime \(p\) has a dramatically higher probability of being prime than random chance.
            </p>
          </div>
          <div class="forge-card p-5 space-y-2 border-amber-500/20">
            <div class="font-bold text-amber-300 font-mono text-sm">Twin Prime Constellations</div>
            <p>
              Pairs like \((11, 13)\) or \((1000000007, 1000000009)\) sit right across from each other. Yitang Zhang proved in 2013 that there are infinite pairs of primes separated by bounded gaps!
            </p>
          </div>
          <div class="forge-card p-5 space-y-2 border-purple-500/20">
            <div class="font-bold text-purple-300 font-mono text-sm">The Mersenne-Perfect Nexus</div>
            <p>
              Every time you find a Mersenne prime \(2^p - 1\), you instantly discover an ancient Euclidean Perfect Number \(2^{p-1}(2^p - 1)\) that equals the sum of its own divisors.
            </p>
          </div>
        </div>

      </div>
    `;

    this.applyStyles();
  }

  applyStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
      .rel-filter-btn {
        padding: 0.4rem 0.75rem;
        border-radius: 0.5rem;
        color: #94a3b8;
        background: transparent;
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .rel-filter-btn:hover {
        color: #f1f5f9;
        background: #1e293b;
      }
      .rel-filter-btn.active {
        background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(99, 102, 241, 0.2));
        border-color: #06b6d4;
        color: #38bdf8;
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);
  }

  init3DScene() {
    const container = document.getElementById('nexus-3d-canvas');
    if (!container) return;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030712, 0.0015);

    this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 3000);
    this.camera.position.set(0, 150, 420);

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(container.clientWidth, 560);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Groups
    this.linesGroup = new THREE.Group();
    this.nodesGroup = new THREE.Group();
    this.scene.add(this.linesGroup);
    this.scene.add(this.nodesGroup);

    // Ambient & Point Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambient);

    const pointLight = new THREE.PointLight(0x06b6d4, 2, 800);
    pointLight.position.set(0, 50, 200);
    this.scene.add(pointLight);
  }

  populateRelationNetwork(limit = 120) {
    // Clear previous
    while (this.nodesGroup.children.length > 0) this.nodesGroup.remove(this.nodesGroup.children[0]);
    while (this.linesGroup.children.length > 0) this.linesGroup.remove(this.linesGroup.children[0]);
    this.nodes = [];

    // Find primes up to limit
    const primes = [];
    for (let i = 2; i <= limit; i++) {
      if (checkPrime(i)) primes.push(i);
    }

    // Generate 3D positions for prime nodes on a logarithmic spherical spiral
    const nodeGeometry = new THREE.SphereGeometry(3.5, 16, 16);
    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8
    });

    primes.forEach((p, idx) => {
      const theta = idx * 0.45;
      const phi = (idx / primes.length) * Math.PI;
      const radius = 60 + Math.sqrt(p) * 20;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = (radius * Math.cos(phi)) * 0.8;
      const z = radius * Math.sin(phi) * Math.sin(theta);

      const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
      mesh.position.set(x, y, z);
      mesh.userData = { prime: p, idx };

      this.nodesGroup.add(mesh);
      this.nodes.push({ prime: p, position: new THREE.Vector3(x, y, z), mesh });
    });

    // Build Interconnecting Relation Lines
    this.buildRelationLines();
  }

  buildRelationLines() {
    while (this.linesGroup.children.length > 0) this.linesGroup.remove(this.linesGroup.children[0]);

    const cyanMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.75, linewidth: 2 });
    const goldMat = new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.85, linewidth: 2 });
    const purpleMat = new THREE.LineBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.8, linewidth: 2 });
    const emeraldMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5, linewidth: 1 });

    for (let i = 0; i < this.nodes.length; i++) {
      const n1 = this.nodes[i];
      const p1 = n1.prime;

      for (let j = i + 1; j < this.nodes.length; j++) {
        const n2 = this.nodes[j];
        const p2 = n2.prime;

        // 1. Twin Primes (p2 - p1 === 2)
        if (p2 - p1 === 2 && (this.activeFilter === 'ALL' || this.activeFilter === 'TWINS')) {
          this.createLine(n1.position, n2.position, cyanMat);
        }

        // 2. Sophie Germain (p2 === 2*p1 + 1)
        if (p2 === (2 * p1 + 1) && (this.activeFilter === 'ALL' || this.activeFilter === 'SOPHIE')) {
          this.createLine(n1.position, n2.position, goldMat);
        }

        // 3. Mersenne relation (p2 = 2^p1 - 1)
        if ((Math.pow(2, p1) - 1 === p2) && (this.activeFilter === 'ALL' || this.activeFilter === 'MERSENNE')) {
          this.createLine(n1.position, n2.position, purpleMat);
        }

        // 4. Goldbach sums to 100 or 50
        if ((p1 + p2 === 100 || p1 + p2 === 50) && (this.activeFilter === 'ALL' || this.activeFilter === 'GOLDBACH')) {
          this.createLine(n1.position, n2.position, emeraldMat);
        }
      }
    }
  }

  createLine(v1, v2, material) {
    const geom = new THREE.BufferGeometry().setFromPoints([v1, v2]);
    const line = new THREE.Line(geom, material);
    this.linesGroup.add(line);
  }

  inspectNode(prime) {
    this.selectedPrime = prime;
    document.getElementById('inspect-prime-val').innerText = `Prime ${prime}`;
    
    // Check relationships of selected prime
    const isTwin = checkPrime(prime - 2) || checkPrime(prime + 2);
    const twinPair = checkPrime(prime + 2) ? `(${prime}, ${prime + 2})` : (checkPrime(prime - 2) ? `(${prime - 2}, ${prime})` : 'None');
    const isSophieParent = checkPrime(2 * prime + 1);
    const isSophieChild = prime % 2 === 1 && checkPrime((prime - 1) / 2);

    let desc = [];
    if (isTwin) desc.push(`Twin Pair: ${twinPair}`);
    if (isSophieParent) desc.push(`Sophie Germain Parent of ${2 * prime + 1}`);
    if (isSophieChild) desc.push(`Safe Prime Child of ${(prime - 1) / 2}`);
    if ([3, 7, 31, 127].includes(prime)) desc.push(`Mersenne Prime (2ᵖ - 1)`);

    document.getElementById('inspect-prime-relations').innerText = `Relations: ${desc.join(' • ') || 'Isolated in immediate range'}`;
    sound.playPrimeDiscovered(3);
  }

  bindEvents() {
    // Relationship Filter buttons
    document.querySelectorAll('.rel-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.rel-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.activeFilter = btn.getAttribute('data-rel');
        this.buildRelationLines();
      });
    });

    // Auto-spin toggle
    let autoSpin = true;
    const spinBtn = document.getElementById('btn-nexus-spin');
    spinBtn?.addEventListener('click', () => {
      autoSpin = !autoSpin;
      spinBtn.innerText = `Auto-Orbit: ${autoSpin ? 'ON' : 'OFF'}`;
      spinBtn.className = autoSpin ? 'p-1.5 hover:bg-slate-800 rounded text-cyan-400 text-[11px]' : 'p-1.5 hover:bg-slate-800 rounded text-slate-400 text-[11px]';
    });

    // Reset camera
    document.getElementById('btn-nexus-reset')?.addEventListener('click', () => {
      this.camera.position.set(0, 150, 420);
      this.camera.lookAt(0, 0, 0);
    });

    // Resize
    window.addEventListener('resize', () => {
      const container = document.getElementById('nexus-3d-canvas');
      if (!container || !this.camera || !this.renderer) return;
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Node click raycasting
    const canvasEl = document.getElementById('nexus-3d-canvas');
    canvasEl?.addEventListener('click', (e) => {
      const rect = canvasEl.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / canvasEl.clientWidth) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / canvasEl.clientHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.nodesGroup.children);

      if (intersects.length > 0) {
        const p = intersects[0].object.userData.prime;
        this.inspectNode(p);
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.nodesGroup && this.linesGroup) {
      this.nodesGroup.rotation.y += 0.003;
      this.linesGroup.rotation.y += 0.003;
    }

    if (this.renderer && this.scene && this.camera) {
      this.camera.lookAt(0, 0, 0);
      this.renderer.render(this.scene, this.camera);
    }
  }
}
