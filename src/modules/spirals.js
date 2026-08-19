// PrimeForge 2D Ulam & Sacks Prime Spirals Visualizer

import { isMillerRabin, SMALL_PRIMES } from '../utils/bigMath.js';

export class SpiralsModule {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.spiralType = 'ulam'; // 'ulam' | 'sacks'
    this.maxN = 10000;
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.highlightEuler = true;
    this.primeCache = new Map();
  }

  init() {
    this.render();
    this.initCanvas();
    this.bindEvents();
    this.draw();
  }

  render() {
    const container = document.getElementById('tab-spirals');
    container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Header & Controls -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold font-outfit text-white">2D Prime Spirals Visualizer</h2>
            <p class="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Uncovering hidden geometric order, diagonal symmetries, and quadratic curves in prime distributions.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <!-- Spiral Type Switcher -->
            <div class="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button id="btn-spiral-ulam" class="px-3 py-1.5 rounded-md active-spiral-btn font-bold">
                Ulam (Square)
              </button>
              <button id="btn-spiral-sacks" class="px-3 py-1.5 rounded-md text-slate-400 hover:text-white transition font-bold">
                Sacks (Archimedean)
              </button>
            </div>

            <!-- Euler Highlight Toggle -->
            <button id="btn-toggle-euler" class="text-xs font-mono px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition flex items-center gap-1.5">
              <span>★</span> Highlight Euler (n² + n + 41)
            </button>
          </div>
        </div>

        <!-- Canvas Container Card -->
        <div class="forge-card p-4 relative overflow-hidden flex flex-col items-center">
          
          <!-- Top Floating Canvas Controls -->
          <div class="absolute top-6 right-6 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700/80 p-1.5 rounded-xl font-mono text-xs shadow-xl">
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
              <span id="spiral-points-count" class="text-cyan-300 font-bold ml-1">10,000</span>
            </div>
            <div>
              <span class="text-slate-500">Pattern:</span>
              <span id="spiral-pattern-label" class="text-amber-300 font-bold ml-1">Ulam Spiral</span>
            </div>
          </div>

          <!-- The HTML5 Canvas -->
          <div class="w-full flex justify-center items-center overflow-hidden bg-slate-950 rounded-xl border border-slate-900 cursor-grab active:cursor-grabbing" style="height: 540px;">
            <canvas id="spiralCanvas" width="900" height="540" class="block"></canvas>
          </div>
        </div>

        <!-- Explanation Footer Card -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed font-sans">
          <div class="forge-card p-4">
            <h4 class="font-bold text-cyan-300 mb-1 font-mono">Why do diagonal lines appear in Ulam's Spiral?</h4>
            <p>
              In 1963, Stanislaw Ulam noticed that writing numbers in a spiral caused prime numbers to align in diagonals. These diagonals correspond to quadratic polynomials \(f(n) = 4n^2 + bn + c\) which have an unusually high density of primes!
            </p>
          </div>
          <div class="forge-card p-4">
            <h4 class="font-bold text-amber-300 mb-1 font-mono">What is the Sacks Spiral?</h4>
            <p>
              Invented by Robert Sacks in 1994, it places numbers along an Archimedean spiral with \(r = \sqrt{n}\) and \(\theta = 2\pi \sqrt{n}\). In this polar layout, squares form a straight ray and Euler's primes form a pristine smooth curve.
            </p>
          </div>
        </div>

      </div>
    `;

    this.applySpiralBtnStyles();
  }

  applySpiralBtnStyles() {
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
    this.canvas.height = 540;
  }

  isPrime(n) {
    if (n < 2) return false;
    if (this.primeCache.has(n)) return this.primeCache.get(n);
    const res = isMillerRabin(BigInt(n), 8);
    this.primeCache.set(n, res);
    return res;
  }

  isEulerNumber(n) {
    // Check if n can be represented as x^2 + x + 41 for integer x >= 0
    // x^2 + x + (41 - n) = 0 -> D = 1 - 4(41 - n) = 4n - 163
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
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    const centerX = w / 2 + this.panX;
    const centerY = h / 2 + this.panY;

    if (this.spiralType === 'ulam') {
      this.drawUlamSpiral(ctx, centerX, centerY);
    } else {
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
              ctx.fillStyle = '#fbbf24'; // Amber glow
              ctx.shadowColor = '#fbbf24';
              ctx.shadowBlur = 8;
              ctx.fillRect(px - 2, py - 2, 4, 4);
              ctx.shadowBlur = 0;
            } else {
              ctx.fillStyle = '#06b6d4'; // Cyan
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
            ctx.fillRect(px - 2, py - 2, 4, 4);
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

    // Spiral type toggle
    const btnUlam = document.getElementById('btn-spiral-ulam');
    const btnSacks = document.getElementById('btn-spiral-sacks');
    const patternLabel = document.getElementById('spiral-pattern-label');

    btnUlam?.addEventListener('click', () => {
      this.spiralType = 'ulam';
      btnUlam.className = 'px-3 py-1.5 rounded-md active-spiral-btn font-bold';
      btnSacks.className = 'px-3 py-1.5 rounded-md text-slate-400 hover:text-white transition font-bold';
      patternLabel.innerText = 'Ulam (Square) Spiral';
      this.draw();
    });

    btnSacks?.addEventListener('click', () => {
      this.spiralType = 'sacks';
      btnSacks.className = 'px-3 py-1.5 rounded-md active-spiral-btn font-bold';
      btnUlam.className = 'px-3 py-1.5 rounded-md text-slate-400 hover:text-white transition font-bold';
      patternLabel.innerText = 'Sacks (Archimedean) Spiral';
      this.draw();
    });

    // Euler toggle
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
        this.dragStartX = e.clientX - this.panX;
        this.dragStartY = e.clientY - this.panY;
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        this.panX = e.clientX - this.dragStartX;
        this.panY = e.clientY - this.dragStartY;
        this.draw();
      });

      window.addEventListener('mouseup', () => {
        this.isDragging = false;
      });

      this.canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.15 : 0.85;
        this.zoom = Math.min(5.0, Math.max(0.2, this.zoom * factor));
        document.getElementById('zoom-level-text').innerText = `${Math.round(this.zoom * 100)}%`;
        this.draw();
      }, { passive: false });
    }
  }
}
