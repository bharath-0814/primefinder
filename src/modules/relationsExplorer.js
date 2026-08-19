// PrimeNexus 6 Fundamental Prime Relationships Explorer Module

import { findPrimePairs, getGoldbachPartitions, getSophieGermainChain, simulateChebyshevRace, comparePiAndLi } from '../utils/relationsMath.js';
import { sound } from '../utils/audio.js';

export class RelationsExplorerModule {
  constructor() {}

  init() {
    this.render();
    this.bindEvents();
    this.runTwinScan(1, 2);
    this.runGoldbach(100);
    this.runSophieChain(2);
    this.runChebyshev(500);
    this.runRiemann(1000);
  }

  render() {
    const container = document.getElementById('tab-relations');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-8 max-w-6xl mx-auto">
        
        <!-- Header -->
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="badge-cyan font-mono">MATHEMATICAL RELATIONSHIPS</span>
            <span class="text-xs text-amber-400 font-bold">★ The 6 Cosmic Connectors</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold font-outfit text-white">
            The 6 Fundamental Relations Between Primes
          </h2>
          <p class="text-xs sm:text-sm text-slate-400 font-mono mt-1">
            Explore the algebraic bridges, additive symmetries, and harmonic laws that link prime numbers together.
          </p>
        </div>

        <!-- RELATION 1: TWIN & CONSTELLATION PRIMES -->
        <div class="forge-card p-6 border-cyan-500/30">
          <div class="forge-card-header px-0 pt-0">
            <div class="flex items-center gap-2">
              <span class="badge-cyan">RELATION #1</span>
              <h3 class="text-base font-bold text-slate-100">Twin & Cousin Prime Constellations (p, p+k)</h3>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 font-sans text-xs">
            <div class="lg:col-span-5 space-y-3 text-slate-300">
              <p>
                <strong>Twin Primes</strong> are pairs of primes that differ by exactly 2, like \((3, 5), (11, 13), (107, 109)\). In 2013, mathematician <strong>Yitang Zhang</strong> shocked the world by proving primes continue to appear in bounded gaps forever!
              </p>
              <div class="space-y-2 font-mono text-[11px] pt-2">
                <div class="flex items-center gap-2 text-cyan-300"><span>• Twin Primes:</span> \(p_2 - p_1 = 2\)</div>
                <div class="flex items-center gap-2 text-amber-300"><span>• Cousin Primes:</span> \(p_2 - p_1 = 4\)</div>
                <div class="flex items-center gap-2 text-indigo-300"><span>• Sexy Primes:</span> \(p_2 - p_1 = 6\)</div>
              </div>
            </div>

            <!-- Interactive Twin Scanner -->
            <div class="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between font-mono">
              <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div class="flex items-center gap-2">
                  <span class="text-slate-400 text-xs">Gap:</span>
                  <select id="twin-gap-select" class="bg-slate-900 border border-slate-700 text-cyan-300 rounded px-2 py-1 text-xs">
                    <option value="2">Gap 2 (Twin Primes)</option>
                    <option value="4">Gap 4 (Cousin Primes)</option>
                    <option value="6">Gap 6 (Sexy Primes)</option>
                  </select>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-slate-400 text-xs">Start From:</span>
                  <input id="twin-start-input" type="number" value="1" min="1" class="w-20 bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 text-xs text-center">
                  <button id="btn-scan-twins" class="btn-primary text-xs py-1 px-3">Scan</button>
                </div>
              </div>

              <!-- Output pairs -->
              <div id="twin-pairs-list" class="max-h-36 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <!-- Populated via JS -->
              </div>
            </div>
          </div>
        </div>

        <!-- RELATION 2: GOLDBACH PARTITION CONJECTURE -->
        <div class="forge-card p-6 border-emerald-500/30">
          <div class="forge-card-header px-0 pt-0">
            <div class="flex items-center gap-2">
              <span class="badge-emerald">RELATION #2</span>
              <h3 class="text-base font-bold text-slate-100">The Goldbach Prime Link (Every Even \(2N = p_1 + p_2\))</h3>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 font-sans text-xs">
            <div class="lg:col-span-5 space-y-3 text-slate-300">
              <p>
                In 1742, Christian Goldbach proposed that <strong>every even number greater than 2 is the sum of two primes</strong>. This links all primes together into an unbreakable additive grid that builds every even integer in existence.
              </p>
              <p class="text-emerald-400 font-mono text-[11px]">
                Enter any even integer to discover all prime pairs \((p_1, p_2)\) whose sum equals your number!
              </p>
            </div>

            <!-- Goldbach Calculator -->
            <div class="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between font-mono">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-slate-400 text-xs">Even Integer \(2N\):</span>
                <input id="goldbach-input" type="number" value="100" min="4" step="2" class="w-28 bg-slate-900 border border-slate-700 text-emerald-300 font-bold rounded px-2.5 py-1 text-xs">
                <button id="btn-calc-goldbach" class="btn-primary text-xs py-1 px-3 bg-gradient-to-r from-emerald-500 to-cyan-500">Decompose</button>
              </div>

              <div id="goldbach-pairs-list" class="max-h-36 overflow-y-auto flex flex-wrap gap-2 text-xs">
                <!-- Populated via JS -->
              </div>
              <div id="goldbach-meta" class="text-[11px] text-slate-500 pt-2 border-t border-slate-800 mt-2">
                Found 6 distinct prime sum pairs for 100.
              </div>
            </div>
          </div>
        </div>

        <!-- RELATION 3: SOPHIE GERMAIN CHAINS -->
        <div class="forge-card p-6 border-amber-500/30">
          <div class="forge-card-header px-0 pt-0">
            <div class="flex items-center gap-2">
              <span class="badge-gold">RELATION #3</span>
              <h3 class="text-base font-bold text-slate-100">Sophie Germain Chains & Safe Primes (\(p \to 2p + 1\))</h3>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 font-sans text-xs">
            <div class="lg:col-span-5 space-y-3 text-slate-300">
              <p>
                A prime \(p\) is a <strong>Sophie Germain prime</strong> if \(2p + 1\) is also prime (known as a <strong>Safe Prime</strong>). These pairs form unbreakable cryptographic security foundations used in modern Diffie-Hellman key exchanges and HTTPS encryption!
              </p>
              <div class="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300">
                Example: 2 → 5 → 11 → 23 → 47 (Chain of length 5!)
              </div>
            </div>

            <!-- Sophie Germain Explorer -->
            <div class="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between font-mono">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-slate-400 text-xs">Seed Prime \(p\):</span>
                <input id="sophie-input" type="number" value="2" min="2" class="w-24 bg-slate-900 border border-slate-700 text-amber-300 font-bold rounded px-2.5 py-1 text-xs">
                <button id="btn-calc-sophie" class="btn-primary text-xs py-1 px-3 bg-gradient-to-r from-amber-500 to-indigo-600">Grow Chain</button>
              </div>

              <div id="sophie-chain-display" class="flex flex-wrap items-center gap-2 text-xs py-3">
                <!-- Populated via JS -->
              </div>
              <div id="sophie-meta" class="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                Chain of 5 consecutive Sophie Germain primes discovered.
              </div>
            </div>
          </div>
        </div>

        <!-- RELATION 4: CHEBYSHEV'S RACE -->
        <div class="forge-card p-6 border-indigo-500/30">
          <div class="forge-card-header px-0 pt-0">
            <div class="flex items-center gap-2">
              <span class="badge-purple">RELATION #4</span>
              <h3 class="text-base font-bold text-slate-100">Chebyshev's Prime Race (\(4k+1\) vs \(4k+3\))</h3>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 font-sans text-xs">
            <div class="lg:col-span-5 space-y-3 text-slate-300">
              <p>
                Every odd prime leaves a remainder of either 1 or 3 when divided by 4. Pafnuty Chebyshev discovered in 1853 that <strong>primes of form \(4k + 3\) consistently outrace primes of form \(4k + 1\)</strong>!
              </p>
            </div>

            <!-- Race Display -->
            <div class="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono flex flex-col justify-between">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-slate-400 text-xs">Race Limit:</span>
                <input id="chebyshev-limit" type="number" value="1000" min="50" max="10000" step="100" class="w-24 bg-slate-900 border border-slate-700 text-purple-300 font-bold rounded px-2 py-1 text-xs">
                <button id="btn-run-chebyshev" class="btn-primary text-xs py-1 px-3">Run Race</button>
              </div>

              <div class="grid grid-cols-2 gap-3 text-center my-2">
                <div class="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/40">
                  <span class="text-[10px] text-indigo-400 block">TEAM 4k + 3</span>
                  <span id="cheby-count-3" class="text-xl font-bold text-indigo-300">87</span>
                </div>
                <div class="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40">
                  <span class="text-[10px] text-amber-400 block">TEAM 4k + 1</span>
                  <span id="cheby-count-1" class="text-xl font-bold text-amber-300">80</span>
                </div>
              </div>
              <div id="cheby-verdict" class="text-[11px] text-indigo-300 font-bold pt-1 text-center">
                4k + 3 leads by +7 primes!
              </div>
            </div>
          </div>
        </div>

        <!-- RELATION 5: RIEMANN ZETA & PRIME COUNTING DENSITY -->
        <div class="forge-card p-6 border-slate-700">
          <div class="forge-card-header px-0 pt-0">
            <div class="flex items-center gap-2">
              <span class="badge-cyan">RELATION #5</span>
              <h3 class="text-base font-bold text-slate-100">Riemann Zeta Wave Harmonics & Prime Counting \(\pi(x)\)</h3>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 font-sans text-xs">
            <div class="lg:col-span-5 space-y-3 text-slate-300">
              <p>
                Bernhard Riemann proved that the exact distribution of prime numbers is dictated by the harmonic frequencies (zeros) of the <strong>Riemann Zeta Function \(\zeta(s)\)</strong>. Primes are the musical notes produced by these infinite wave zeros!
              </p>
            </div>

            <!-- Riemann Comparison Calculator -->
            <div class="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono flex flex-col justify-between">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-slate-400 text-xs">Evaluate Limit \(x\):</span>
                <input id="riemann-input-x" type="number" value="1000" min="10" max="50000" class="w-28 bg-slate-900 border border-slate-700 text-cyan-300 font-bold rounded px-2 py-1 text-xs">
                <button id="btn-calc-riemann" class="btn-primary text-xs py-1 px-3">Compute</button>
              </div>

              <div class="grid grid-cols-3 gap-2 text-center my-2 text-[11px]">
                <div class="p-2 rounded bg-slate-900 border border-slate-800">
                  <span class="text-slate-500 block">Actual \(\pi(x)\):</span>
                  <span id="riemann-actual" class="text-cyan-300 font-bold text-sm">168</span>
                </div>
                <div class="p-2 rounded bg-slate-900 border border-slate-800">
                  <span class="text-slate-500 block">Riemann \(\text{Li}(x)\):</span>
                  <span id="riemann-li" class="text-amber-300 font-bold text-sm">178</span>
                </div>
                <div class="p-2 rounded bg-slate-900 border border-slate-800">
                  <span class="text-slate-500 block">Accuracy:</span>
                  <span id="riemann-acc" class="text-emerald-400 font-bold text-sm">94.05%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  runTwinScan(start, gap) {
    const pairs = findPrimePairs(start, 16, Number(gap));
    const container = document.getElementById('twin-pairs-list');
    if (!container) return;

    container.innerHTML = pairs.map(p => `
      <div class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
        <span class="text-cyan-300 font-bold">(${p.p1}, ${p.p2})</span>
      </div>
    `).join('');
  }

  runGoldbach(evenN) {
    const partitions = getGoldbachPartitions(evenN, 20);
    const container = document.getElementById('goldbach-pairs-list');
    const meta = document.getElementById('goldbach-meta');
    if (!container || !meta) return;

    if (partitions.length === 0) {
      container.innerHTML = `<span class="text-rose-400">Please enter an even integer >= 4.</span>`;
      return;
    }

    container.innerHTML = partitions.map(p => `
      <div class="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 font-bold">
        ${p.p} + ${p.q} = ${p.sum}
      </div>
    `).join('');

    meta.innerText = `Found ${partitions.length} distinct prime sum pairs for ${evenN}.`;
  }

  runSophieChain(startP) {
    const chain = getSophieGermainChain(startP, 8);
    const container = document.getElementById('sophie-chain-display');
    const meta = document.getElementById('sophie-meta');
    if (!container || !meta) return;

    container.innerHTML = chain.map((p, idx) => `
      <div class="flex items-center gap-1.5">
        <div class="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
          ${p}
        </div>
        ${idx < chain.length - 1 ? '<span class="text-slate-500 font-bold">→ 2p+1 →</span>' : ''}
      </div>
    `).join('');

    meta.innerText = `Chain of length ${chain.length} Sophie Germain primes starting at ${startP}.`;
  }

  runChebyshev(limit) {
    const res = simulateChebyshevRace(limit);
    document.getElementById('cheby-count-3').innerText = res.count4k3;
    document.getElementById('cheby-count-1').innerText = res.count4k1;
    document.getElementById('cheby-verdict').innerText = `${res.leader} leads!`;
  }

  runRiemann(x) {
    const res = comparePiAndLi(x);
    document.getElementById('riemann-actual').innerText = res.actualPi;
    document.getElementById('riemann-li').innerText = res.liApprox;
    document.getElementById('riemann-acc').innerText = `${res.accuracy}%`;
  }

  bindEvents() {
    // Twin Scan
    document.getElementById('btn-scan-twins')?.addEventListener('click', () => {
      const start = document.getElementById('twin-start-input').value;
      const gap = document.getElementById('twin-gap-select').value;
      this.runTwinScan(start, gap);
    });

    document.getElementById('twin-gap-select')?.addEventListener('change', (e) => {
      const start = document.getElementById('twin-start-input').value;
      this.runTwinScan(start, e.target.value);
    });

    // Goldbach
    document.getElementById('btn-calc-goldbach')?.addEventListener('click', () => {
      const val = Number(document.getElementById('goldbach-input').value);
      this.runGoldbach(val);
    });

    // Sophie
    document.getElementById('btn-calc-sophie')?.addEventListener('click', () => {
      const val = Number(document.getElementById('sophie-input').value);
      this.runSophieChain(val);
    });

    // Chebyshev
    document.getElementById('btn-run-chebyshev')?.addEventListener('click', () => {
      const limit = Number(document.getElementById('chebyshev-limit').value);
      this.runChebyshev(limit);
    });

    // Riemann
    document.getElementById('btn-calc-riemann')?.addEventListener('click', () => {
      const x = Number(document.getElementById('riemann-input-x').value);
      this.runRiemann(x);
    });
  }
}
