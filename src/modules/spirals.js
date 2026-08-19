// PrimeForge 2D & 3D Prime Spirals Visualizer (Ulam, Sacks, and 3D Helix)

import * as THREE from 'three';
import { isMillerRabin } from '../utils/bigMath.js';

export class SpiralsModule {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.spiralType = 'ulam'; // 'ulam' | 'sacks' | '3d-helix'
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.highlightEuler = true;
    this.primeCache = new Map();

    // 3D Visualizer Objects
    this.threeScene = null;
    this.threeCamera = null;
    this.threeRenderer = null;
    this.threeParticles = null;
  }

  init() {
    this.render();
    this.initCanvas();
    this.init3DScene();
    this.bindEvents();
    this.draw();
  }

  render() {
    const container = document.getElementById('tab-spirals');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Header & Controls -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold font-outfit text-white">2D & 3D Prime Geometric Spirals</h2>
            <p class="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Prime numbers form geometric constellations, diagonal highways, and 3D double helix galaxies.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <!-- Spiral Type Switcher -->
            <div class="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button id="btn-spiral-ulam" class="px-3 py-1.5 rounded-md active-spiral-btn font-bold">
                2D Ulam (Square)
              </button>
              <button id="btn-spiral-sacks" class="px-3 py-1.5 rounded-md text-slate-400 hover:text-white transition font-bold">
                2D Sacks (Polar)
              </button>
              <button id="btn-spiral-3d" class="px-3 py-1.5 rounded-md text-slate-400 hover:text-cyan-300 transition font-bold flex items-center gap-1">
                <span>🪐</span> 3D Helix Galaxy
              </button>
            </div>

            <!-- Euler Highlight Toggle -->
            <button id="btn-toggle-euler" class="text-xs font-mono px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition flex items-center gap-1.5">
              <span>★</span> Euler Highlight (n² + n + 41)
            </button>
          </div>
        </div>

        <!-- Canvas Container Card -->
        <div class="forge-card p-4 relative overflow-hidden flex flex-col items-center">
          
          <!-- Top Floating Canvas Controls -->
          <div id="2d-controls" class="absolute top-6 right-6 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700/80 p-1.5 rounded-xl font-mono text-xs shadow-xl">
            <button id="btn-zoom-in" class="p-1.5 hover:bg-slate-800 rounded text-slate-300" title="Zoom In">🔍+</button>
            <button id="btn-zoom-out" class="p-1.5 hover:bg-slate-800 rounded text-slate-300" title="Zoom Out">🔍-</button>
            <button id="btn-zoom-reset" class="p-1.5 hover:bg-slate-800 rounded text-slate-300 text-[11px]" title="Reset View">Reset</button>
            <span class="text-slate-600">|</span>
            <span class="text-slate-400 text-[11px] px-1" id="zoom-level-text">100%</span>
          </div>

          <!-- Bottom Floating Info Indicator -->
          <div class="absolute bottom-6 left-6 z-20 bg-slate-900/90 backdrop-blur border border-slate-700/80 px-3 py-2 rounded-xl font-mono text-xs shadow-xl flex items-center gap-4">
            <div>
              <span class="text-slate-500">Points:</span>
              <span class="text-cyan-300 font-bold ml-1">15,000</span>
            </div>
            <div>
              <span class="text-slate-500">Mode:</span>
              <span id="spiral-pattern-label" class="text-amber-300 font-bold ml-1">2D Ulam Spiral</span>
            </div>
          </div>

          <!-- 2D Canvas Area -->
          <div id="2d-canvas-wrap" class="w-full flex justify-center items-center overflow-hidden bg-slate-950 rounded-xl border border-slate-900 cursor-grab active:cursor-grabbing" style="height: 520px;">
            <canvas id="spiralCanvas" width="900" height="520" class="block"></canvas>
          </div>

          <!-- 3D Three.js Canvas Container (Hidden by default) -->
          <div id="3d-canvas-wrap" class="w-full hidden overflow-hidden bg-slate-950 rounded-xl border border-slate-900 relative" style="height: 520px;">
            <div id="three-spiral-container" class="w-full h-full"></div>
            <div class="absolute top-4 left-4 text-xs font-mono text-cyan-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
              Drag mouse to rotate 3D galaxy • Scroll to zoom
            </div>
          </div>

        </div>

        <!-- Explanation Footer Card -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed font-sans">
          <div class="forge-card p-4">
            <h4 class="font-bold text-cyan-300 mb-1 font-mono">Ulam Spiral (2D Square)</h4>
            <p>
              Primes mysteriously cluster on diagonal ray lines corresponding to quadratic formulas like \(4x^2 + bx + c\).
            </p>
          </div>
          <div class="forge-card p-4">
            <h4 class="font-bold text-indigo-300 mb-1 font-mono">Sacks Spiral (2D Polar)</h4>
            <p>
              Arranged as \(r = \sqrt{n}\) and \(\theta = 2\pi\sqrt{n}\). Euler's primes form a pristine unbroken curve.
            </p>
          </div>
          <div class="forge-card p-4">
            <h4 class="font-bold text-amber-300 mb-1 font-mono">3D Helix Galaxy</h4>
            <p>
              Numbers wind upwards along a 3D cylindrical spiral. Primes form glowing vertical energy columns!
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
      .active-spiral-btn {
        background: #06b6d4 !important;
        color: #000000 !important;
      }
    `;
    document.head.appendChild(style);
  }

  initCanvas() {
    this.canvas = document.getElementById('spiralCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.clientWidth || 900;
    this.canvas.height = 520;
  }

  init3DScene() {
    const container = document.getElementById('three-spiral-container');
    if (!container) return;

    this.threeScene = new THREE.Scene();
    this.threeCamera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 3000);
    this.threeCamera.position.set(0, 0, 450);

    this.threeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.threeRenderer.setSize(container.clientWidth || 900, 520);
    container.appendChild(this.threeRenderer.domElement);

    // Build 3D Helix Primes
    const totalPoints = 4000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(totalPoints * 3);
    const colors = new Float32Array(totalPoints * 3);

    const cyan = new THREE.Color(0x06b6d4);
    const amber = new THREE.Color(0xfbbf24);
    const dark = new THREE.Color(0x1e293b);

    for (let n = 1; n <= totalPoints; n++) {
      const idx = (n - 1) * 3;
      const t = n * 0.15;
      const radius = 100 + (n * 0.03);
      const x = Math.cos(t) * radius;
      const y = (n - totalPoints / 2) * 0.22;
      const z = Math.sin(t) * radius;

      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = z;

      const isP = this.isPrime(n);
      const isEuler = isP && this.isEulerNumber(n);

      const c = isEuler ? amber : (isP ? cyan : dark);
      colors[idx] = c.r;
      colors[idx + 1] = c.g;
      colors[idx + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    this.threeParticles = new THREE.Points(geometry, material);
    this.threeScene.add(this.threeParticles);

    // 3D Animation loop
    const animate3D = () => {
      requestAnimationFrame(animate3D);
      if (this.spiralType === '3d-helix' && this.threeParticles) {
        this.threeParticles.rotation.y += 0.005;
        this.threeParticles.rotation.x += 0.001;
        this.threeRenderer.render(this.threeScene, this.threeCamera);
      }
    };
    animate3D();
  }

  isPrime(n) {
    if (n < 2) return false;
    if (this.primeCache.has(n)) return this.primeCache.get(n);
    const res = isMillerRabin(BigInt(n), 8);
    this.primeCache.set(n, res);
    return res;
  }

  isEulerNumber(n) {
    if (n < 41) return false;
    const disc = 4 * n - 163;
    if (disc < 0) return false;
    const s = Math.round(Math.sqrt(disc));
    if (s * s === disc) {
      const x = (-1 + s) / 2;
      return Number.isInteger(x) && x >= 0;
    }
    return false;
  }

  draw() {
    if (this.spiralType === '3d-helix') return;
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    const centerX = w / 2 + this.panX;
    const centerY = h / 2 + this.panY;

    if (this.spiralType === 'ulam') {
      this.drawUlamSpiral(ctx, centerX, centerY);
    } else if (this.spiralType === 'sacks') {
      this.drawSacksSpiral(ctx, centerX, centerY);
    }
  }

  drawUlamSpiral(ctx, cx, cy) {
    const spacing = 7 * this.zoom;
    let x = 0;
    let y = 0;
    let dx = 0;
    let dy = -1;
    const limit = Math.min(15000, Math.floor((this.canvas.width * this.canvas.height) / (spacing * spacing)));

    for (let i = 1; i <= limit; i++) {
      if ((-limit / 2 <= x) && (x <= limit / 2) && (-limit / 2 <= y) && (y <= limit / 2)) {
        const px = cx + x * spacing;
        const py = cy + y * spacing;

        if (px >= -20 && px <= this.canvas.width + 20 && py >= -20 && py <= this.canvas.height + 20) {
          if (this.isPrime(i)) {
            const isEuler = this.highlightEuler && this.isEulerNumber(i);
            if (isEuler) {
              ctx.fillStyle = '#fbbf24';
              ctx.shadowColor = '#fbbf24';
              ctx.shadowBlur = 8;
              ctx.fillRect(px - 2, py - 2, 4.5, 4.5);
              ctx.shadowBlur = 0;
            } else {
              ctx.fillStyle = '#06b6d4';
              ctx.fillRect(px - 1.2, py - 1.2, 2.5, 2.5);
            }
          }
        }
      }

      if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
        const temp = dx;
        dx = -dy;
        dy = temp;
      }
      x += dx;
      y += dy;
    }
  }

  drawSacksSpiral(ctx, cx, cy) {
    const scale = 3.5 * this.zoom;
    const limit = 20000;

    for (let n = 1; n <= limit; n++) {
      const r = Math.sqrt(n) * scale;
      const theta = 2 * Math.PI * Math.sqrt(n);
      const px = cx + r * Math.cos(theta);
      const py = cy + r * Math.sin(theta);

      if (px >= -20 && px <= this.canvas.width + 20 && py >= -20 && py <= this.canvas.height + 20) {
        if (this.isPrime(n)) {
          const isEuler = this.highlightEuler && this.isEulerNumber(n);
          if (isEuler) {
            ctx.fillStyle = '#fbbf24';
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 8;
            ctx.fillRect(px - 2, py - 2, 4.5, 4.5);
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(px - 1, py - 1, 2.2, 2.2);
          }
        }
      }
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.draw();
    });

    const btnUlam = document.getElementById('btn-spiral-ulam');
    const btnSacks = document.getElementById('btn-spiral-sacks');
    const btn3D = document.getElementById('btn-spiral-3d');
    const patternLabel = document.getElementById('spiral-pattern-label');
    const wrap2D = document.getElementById('2d-canvas-wrap');
    const wrap3D = document.getElementById('3d-canvas-wrap');
    const controls2D = document.getElementById('2d-controls');

    btnUlam?.addEventListener('click', () => {
      this.spiralType = 'ulam';
      wrap2D.classList.remove('hidden');
      wrap3D.classList.add('hidden');
      controls2D.classList.remove('hidden');
      btnUlam.className = 'px-3 py-1.5 rounded-md active-spiral-btn font-bold';
      btnSacks.className = 'px-3 py-1.5 rounded-md text-slate-400 hover:text-white transition font-bold';
      btn3D.className = 'px-3 py-1.5 rounded-md text-slate-400 hover:text-cyan-300 transition font-bold';
      patternLabel.innerText = '2D Ulam Spiral';
      this.draw();
    });

    btnSacks?.addEventListener('click', () => {
      this.spiralType = 'sacks';
      wrap2D.classList.remove('hidden');
      wrap3D.classList.add('hidden');
      controls2D.classList.remove('hidden');
      btnSacks.className = 'px-3 py-1.5 rounded-md active-spiral-btn font-bold';
      btnUlam.className = 'px-3 py-1.5 rounded-md text-slate-400 hover:text-white transition font-bold';
      btn3D.className = 'px-3 py-1.5 rounded-md text-slate-400 hover:text-cyan-300 transition font-bold';
      patternLabel.innerText = '2D Sacks (Polar) Spiral';
      this.draw();
    });

    btn3D?.addEventListener('click', () => {
      this.spiralType = '3d-helix';
      wrap2D.classList.add('hidden');
      wrap3D.classList.remove('hidden');
      controls2D.classList.add('hidden');
      btn3D.className = 'px-3 py-1.5 rounded-md active-spiral-btn font-bold';
      btnUlam.className = 'px-3 py-1.5 rounded-md text-slate-400 hover:text-white transition font-bold';
      btnSacks.className = 'px-3 py-1.5 rounded-md text-slate-400 hover:text-white transition font-bold';
      patternLabel.innerText = '3D Helix Galaxy';
    });

    // Euler highlight
    document.getElementById('btn-toggle-euler')?.addEventListener('click', (e) => {
      this.highlightEuler = !this.highlightEuler;
      e.currentTarget.classList.toggle('border-amber-500', this.highlightEuler);
      this.draw();
    });

    // Zoom controls
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      this.zoom = Math.min(5.0, this.zoom * 1.25);
      document.getElementById('zoom-level-text').innerText = `${Math.round(this.zoom * 100)}%`;
      this.draw();
    });

    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      this.zoom = Math.max(0.2, this.zoom / 1.25);
      document.getElementById('zoom-level-text').innerText = `${Math.round(this.zoom * 100)}%`;
      this.draw();
    });

    document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
      this.zoom = 1.0;
      this.panX = 0;
      this.panY = 0;
      document.getElementById('zoom-level-text').innerText = '100%';
      this.draw();
    });

    // Canvas Drag Pan
    if (this.canvas) {
      this.canvas.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.panXStart = e.clientX - this.panX;
        this.panYStart = e.clientY - this.panY;
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        this.panX = e.clientX - this.panXStart;
        this.panY = e.clientY - this.panYStart;
        this.draw();
      });

      window.addEventListener('mouseup', () => {
        this.isDragging = false;
      });
    }
  }
}
