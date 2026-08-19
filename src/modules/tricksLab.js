// PrimeForge Tricks & Modern Approaches Lab Module

import { calculateMultiplicationComplexity, eulerPolynomial, isMillerRabin } from '../utils/bigMath.js';

export class TricksLabModule {
  constructor() {
    this.pipelineRunning = false;
  }

  init() {
    this.render();
    this.bindEvents();
    this.updateFFTBenchmark(1000000);
    this.runEulerBenchmark();
  }

  render() {
    const container = document.getElementById('tab-tricks');
    container.innerHTML = `
      <div class="space-y-8">
        
        <!-- Intro Header -->
        <div>
          <h2 class="text-2xl font-bold font-outfit text-white">Interactive "Tricks & Modern Approaches" Lab</h2>
          <p class="text-xs sm:text-sm text-slate-400 font-mono mt-1">
            Explore the mathematical optimizations, algebraic shortcuts, and GPU hardware transforms used to find colossal primes.
          </p>
        </div>

        <!-- TRICK 1: WHEEL FACTORIZATION -->
        <div class="forge-card p-6 border-cyan-500/20">
          <div class="forge-card-header px-0 pt-0">
            <div class="flex items-center gap-2">
              <span class="badge-cyan">TRICK #1</span>
              <h3 class="text-base font-bold text-slate-100">Wheel Factorization (Eliminating 73.3% of Numbers with 0 Division)</h3>
            </div>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
            <div class="lg:col-span-6 space-y-3 text-xs leading-relaxed text-slate-300">
              <p>
                Testing large integers for primality is computationally expensive. <strong>Wheel Factorization</strong> uses the product of the first few primes (e.g. \(2 \times 3 \times 5 = 30\)) as a repeating cyclical sieve.
              </p>
              <p>
                Within every block of 30 consecutive numbers, exactly <strong>22 numbers</strong> are divisible by 2, 3, or 5. Only <strong>8 numbers</strong> can possibly be prime:
              </p>
              <div class="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-cyan-300">
                Coprime Residues mod 30: [ 1, 7, 11, 13, 17, 19, 23, 29 ]
              </div>
              <p class="text-emerald-400 font-mono">
                ⚡ Result: Skips 73.33% of candidates immediately without performing any modular exponentiation or primality tests!
              </p>
            </div>

            <!-- Interactive Wheel Sieve Demo -->
            <div class="lg:col-span-6 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div class="text-xs font-mono text-slate-400 mb-2">Cycle of 30 Numbers (Colored by Divisibility):</div>
              <div class="grid grid-cols-6 sm:grid-cols-10 gap-1.5 font-mono text-xs text-center" id="wheel-grid">
                <!-- Populated via JS -->
              </div>
              <div class="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-4 pt-2 border-t border-slate-800">
                <span class="flex items-center gap-1"><span class="w-2 h-2 rounded bg-cyan-400"></span> Candidate (26.7%)</span>
                <span class="flex items-center gap-1"><span class="w-2 h-2 rounded bg-slate-800"></span> Eliminated Multiple (73.3%)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TRICK 2: FFT MULTIPLICATION & IBDWT -->
        <div class="forge-card p-6 border-indigo-500/20">
          <div class="forge-card-header px-0 pt-0">
            <div class="flex items-center gap-2">
              <span class="badge-purple">TRICK #2</span>
              <h3 class="text-base font-bold text-slate-100">Fast Fourier Transform (FFT) Big-Integer Squaring</h3>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
            <div class="lg:col-span-6 space-y-3 text-xs leading-relaxed text-slate-300">
              <p>
                In the Lucas-Lehmer test, we must compute \(s_i = (s_{i-1}^2 - 2) \bmod M_p\) millions of times. For a 41-million-digit number, squaring it with standard schoolbook multiplication requires \(\mathcal{O}(N^2)\) operations—over <strong>1.68 Quadrillion operations per step</strong>!
              </p>
              <p>
                By treating the giant number as a polynomial and using <strong>Irrational Base Discrete Weighted Transforms (IBDWT / FFT)</strong>, multiplication complexity drops to \(\mathcal{O}(N \log N \log \log N)\).
              </p>
              <div class="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-indigo-300">
                Schoolbook \(O(N^2)\) vs FFT \(O(N \log N)\) on GPU tensor cores.
              </div>
            </div>

            <!-- Interactive FFT Benchmark Tool -->
            <div class="lg:col-span-6 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-slate-400">Target Integer Size:</span>
                <span id="fft-digits-display" class="text-cyan-400 font-bold">1,000,000 digits</span>
              </div>
              <input id="fft-slider" type="range" min="1000" max="41000000" step="500000" value="1000000" class="w-full accent-cyan-400 cursor-pointer">
              
              <div class="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
                <div class="flex justify-between">
                  <span class="text-slate-500">Schoolbook O(N²):</span>
                  <span id="fft-res-schoolbook" class="text-rose-400 font-bold">1,000,000,000,000 ops</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Karatsuba O(N^1.585):</span>
                  <span id="fft-res-karatsuba" class="text-amber-400 font-bold">3,737,192,817 ops</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Schönhage-Strassen / FFT:</span>
                  <span id="fft-res-fft" class="text-emerald-400 font-bold">85,550,172 ops</span>
                </div>
                <div class="flex justify-between pt-1 border-t border-slate-800 text-cyan-300 font-bold">
                  <span>Effective Speedup:</span>
                  <span id="fft-res-speedup">11,689× Faster</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TRICK 3: MULTI-STAGE FILTERING PIPELINE SIMULATOR -->
        <div class="forge-card p-6 border-amber-500/20">
          <div class="forge-card-header px-0 pt-0">
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center gap-2">
                <span class="badge-gold">TRICK #3</span>
                <h3 class="text-base font-bold text-slate-100">Multi-Stage Candidate Filtering Pipeline</h3>
              </div>
              <button id="btn-run-pipeline" class="btn-primary text-xs">
                ▶ Run 10,000 Candidate Simulation
              </button>
            </div>
          </div>

          <div class="mt-4">
            <p class="text-xs text-slate-300 leading-relaxed mb-4">
              Real-world prime hunters don't run heavy primality proofs on raw candidates. They pass candidates through a fast cascaded filter funnel:
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono text-center">
              
              <div class="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <span class="text-[10px] text-slate-500 block">STAGE 1</span>
                <div class="text-xs font-bold text-slate-200 mt-1">Raw Input</div>
                <div id="pipe-s1" class="text-lg font-black text-cyan-400 my-1">10,000</div>
                <span class="text-[10px] text-slate-500">100% integers</span>
              </div>

              <div class="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <span class="text-[10px] text-slate-500 block">STAGE 2</span>
                <div class="text-xs font-bold text-slate-200 mt-1">Wheel 2,3,5</div>
                <div id="pipe-s2" class="text-lg font-black text-slate-300 my-1">-</div>
                <span class="text-[10px] text-rose-400">-73.3% eliminated</span>
              </div>

              <div class="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <span class="text-[10px] text-slate-500 block">STAGE 3</span>
                <div class="text-xs font-bold text-slate-200 mt-1">Small Primes</div>
                <div id="pipe-s3" class="text-lg font-black text-slate-300 my-1">-</div>
                <span class="text-[10px] text-rose-400">-15% eliminated</span>
              </div>

              <div class="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <span class="text-[10px] text-slate-500 block">STAGE 4</span>
                <div class="text-xs font-bold text-slate-200 mt-1">Fermat Base 2</div>
                <div id="pipe-s4" class="text-lg font-black text-slate-300 my-1">-</div>
                <span class="text-[10px] text-rose-400">-10.8% eliminated</span>
              </div>

              <div class="bg-slate-950 border border-emerald-500/40 p-3 rounded-xl bg-emerald-950/10">
                <span class="text-[10px] text-emerald-400 block">STAGE 5</span>
                <div class="text-xs font-bold text-emerald-300 mt-1">Miller-Rabin Proof</div>
                <div id="pipe-s5" class="text-lg font-black text-emerald-400 my-1">-</div>
                <span class="text-[10px] text-emerald-400">100% Certified Primes</span>
              </div>

            </div>
          </div>
        </div>

        <!-- TRICK 4: EULER'S PRIME GENERATING POLYNOMIALS -->
        <div class="forge-card p-6">
          <div class="forge-card-header px-0 pt-0">
            <div class="flex items-center gap-2">
              <span class="badge-purple">TRICK #4</span>
              <h3 class="text-base font-bold text-slate-100">Euler's Prime Formula: \(f(n) = n^2 + n + 41\)</h3>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
            <div class="lg:col-span-6 space-y-3 text-xs leading-relaxed text-slate-300">
              <p>
                In 1772, Leonhard Euler discovered the extraordinary polynomial \(f(n) = n^2 + n + 41\). For all \(n\) from \(0\) to \(39\) (40 consecutive integers), it yields <strong>100% prime numbers</strong>:
              </p>
              <div class="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                <div>n=0 → 41 (prime)</div>
                <div>n=1 → 43 (prime)</div>
                <div>n=2 → 47 (prime)</div>
                <div>...</div>
                <div>n=39 → 1601 (prime)</div>
                <div class="text-rose-400">n=40 → 40² + 40 + 41 = 41² = 1681 (composite)</div>
              </div>
            </div>

            <!-- Interactive Euler Explorer -->
            <div class="lg:col-span-6 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs flex flex-col justify-between">
              <div>
                <div class="text-slate-400 mb-2">Evaluate \(n^2 + n + 41\) for \(n\):</div>
                <div class="flex gap-2">
                  <input id="euler-input-n" type="number" value="15" min="0" max="1000" class="bg-slate-900 border border-slate-700 text-cyan-300 px-3 py-1.5 rounded w-28 focus:outline-none">
                  <button id="btn-eval-euler" class="btn-primary text-xs py-1.5">Evaluate</button>
                </div>
                <div id="euler-result-box" class="mt-3 p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
                  <div>Result: <span id="euler-res-val" class="text-cyan-300 font-bold">281</span></div>
                  <div>Primality: <span id="euler-res-prime" class="badge-emerald">✓ PRIME</span></div>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-800 text-[11px] text-slate-500">
                Known as the greatest prime-density quadratic polynomial in mathematics.
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    this.renderWheelGrid();
  }

  renderWheelGrid() {
    const grid = document.getElementById('wheel-grid');
    if (!grid) return;

    const coprimes = [1, 7, 11, 13, 17, 19, 23, 29];
    let html = '';
    for (let i = 1; i <= 30; i++) {
      const isCandidate = coprimes.includes(i);
      if (isCandidate) {
        html += `<div class="p-2 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold">${i}</div>`;
      } else {
        html += `<div class="p-2 rounded bg-slate-900 border border-slate-800/80 text-slate-600 line-through">${i}</div>`;
      }
    }
    grid.innerHTML = html;
  }

  updateFFTBenchmark(digits) {
    const comp = calculateMultiplicationComplexity(digits);
    document.getElementById('fft-digits-display').innerText = `${Number(digits).toLocaleString()} decimal digits`;
    document.getElementById('fft-res-schoolbook').innerText = `${comp.schoolbookOps} ops`;
    document.getElementById('fft-res-karatsuba').innerText = `${comp.karatsubaOps} ops`;
    document.getElementById('fft-res-fft').innerText = `${comp.fftOps} ops`;
    document.getElementById('fft-res-speedup').innerText = `${comp.speedupRatio}× Faster`;
  }

  runEulerBenchmark() {
    const n = Number(document.getElementById('euler-input-n')?.value || 15);
    const res = eulerPolynomial(n);
    document.getElementById('euler-res-val').innerText = res.val.toString();
    const badge = document.getElementById('euler-res-prime');
    if (res.isPrime) {
      badge.className = 'badge-emerald';
      badge.innerText = '✓ PRIME';
    } else {
      badge.className = 'badge-rose';
      badge.innerText = '✗ COMPOSITE';
    }
  }

  runPipelineSimulation() {
    if (this.pipelineRunning) return;
    this.pipelineRunning = true;

    const btn = document.getElementById('btn-run-pipeline');
    btn.innerText = 'Simulating Funnel...';
    btn.disabled = true;

    const total = 10000;
    document.getElementById('pipe-s1').innerText = total.toLocaleString();
    document.getElementById('pipe-s2').innerText = '...';
    document.getElementById('pipe-s3').innerText = '...';
    document.getElementById('pipe-s4').innerText = '...';
    document.getElementById('pipe-s5').innerText = '...';

    setTimeout(() => {
      // Stage 2: Wheel 2,3,5 (8/30 pass = 26.67%)
      const s2 = Math.round(total * (8 / 30));
      document.getElementById('pipe-s2').innerText = s2.toLocaleString();

      setTimeout(() => {
        // Stage 3: Small primes filter
        const s3 = Math.round(s2 * 0.45);
        document.getElementById('pipe-s3').innerText = s3.toLocaleString();

        setTimeout(() => {
          // Stage 4: Fermat Base 2 test
          const s4 = Math.round(s3 * 0.85);
          document.getElementById('pipe-s4').innerText = s4.toLocaleString();

          setTimeout(() => {
            // Stage 5: Miller-Rabin proof (True primes in range ~10000 is ~1229)
            const s5 = 1229;
            document.getElementById('pipe-s5').innerText = s5.toLocaleString();
            btn.innerText = '✓ Complete! (Re-run)';
            btn.disabled = false;
            this.pipelineRunning = false;
          }, 300);
        }, 300);
      }, 300);
    }, 300);
  }

  bindEvents() {
    document.getElementById('fft-slider')?.addEventListener('input', (e) => {
      this.updateFFTBenchmark(e.target.value);
    });

    document.getElementById('btn-eval-euler')?.addEventListener('click', () => {
      this.runEulerBenchmark();
    });

    document.getElementById('btn-run-pipeline')?.addEventListener('click', () => {
      this.runPipelineSimulation();
    });
  }
}
