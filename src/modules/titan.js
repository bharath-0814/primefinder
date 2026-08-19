// PrimeForge Titan Module: The 41-Million Digit Record ($2^{136,279,841}-1$) & Lucas-Lehmer Sandbox

import { lucasLehmerTest } from '../utils/bigMath.js';

export class TitanModule {
  constructor() {
    this.currentP = 19;
  }

  init() {
    this.render();
    this.bindEvents();
    this.runSandboxTest(19);
  }

  render() {
    const container = document.getElementById('tab-titan');
    container.innerHTML = `
      <div class="space-y-8">
        
        <!-- Hero Banner: The World Record -->
        <div class="forge-card p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-500/30 relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="badge-gold font-mono">CURRENT WORLD RECORD</span>
                <span class="text-xs text-slate-400 font-mono">Discovered October 2024</span>
              </div>
              <h2 class="text-3xl sm:text-4xl font-extrabold font-outfit text-white tracking-tight">
                2<sup class="text-indigo-400">136,279,841</sup> − 1
              </h2>
              <p class="text-xs sm:text-sm font-mono text-cyan-300 mt-1">
                Also cataloged as: <strong class="text-white">M₁₃₆₂₇₉₈₄₁</strong> (The 52nd Known Mersenne Prime)
              </p>
              <p class="text-sm text-slate-300 mt-3 max-w-2xl leading-relaxed">
                Discovered by <strong>Luke Durant</strong> (former NVIDIA engineer) using a cloud supercomputer network spanning thousands of server GPUs across 17 countries and 24 datacenter regions within the GIMPS project.
              </p>
            </div>

            <!-- Key Stat Badges -->
            <div class="grid grid-cols-2 gap-3 min-w-[280px]">
              <div class="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
                <span class="text-[11px] font-mono text-slate-400 block">TOTAL DIGITS</span>
                <span class="text-xl font-extrabold font-mono text-cyan-400">41,024,320</span>
              </div>
              <div class="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
                <span class="text-[11px] font-mono text-slate-400 block">PREVIOUS RECORD</span>
                <span class="text-xl font-extrabold font-mono text-slate-300">+16.1M digits</span>
              </div>
              <div class="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
                <span class="text-[11px] font-mono text-slate-400 block">VERIFICATION</span>
                <span class="text-sm font-bold font-mono text-emerald-400">Lucas-Lehmer (LLT)</span>
              </div>
              <div class="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
                <span class="text-[11px] font-mono text-slate-400 block">EFF PRIZE TARGET</span>
                <span class="text-sm font-bold font-mono text-amber-400">$150k (100M Digits)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Scale Comparison Tool -->
        <div class="forge-card p-6">
          <div class="forge-card-header px-0 pt-0">
            <div>
              <h3 class="text-base font-bold text-slate-100">Mind-Bending Scale Visualizer</h3>
              <p class="text-xs text-slate-400">How 41 Million digits compares to everyday and cosmic scales</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div class="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl">
              <div class="text-xs font-mono text-slate-400 mb-1">RSA-2048 ENCRYPTION</div>
              <div class="text-lg font-bold text-slate-200">617 digits</div>
              <p class="text-xs text-slate-400 mt-2">Protects global banking and HTTPS traffic. Fits in a single tweet.</p>
              <div class="w-full bg-slate-800 h-1.5 rounded-full mt-3">
                <div class="bg-cyan-500 h-full rounded-full" style="width: 1%"></div>
              </div>
            </div>

            <div class="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl">
              <div class="text-xs font-mono text-slate-400 mb-1">ATOMS IN OBSERVABLE UNIVERSE</div>
              <div class="text-lg font-bold text-slate-200">~80 digits (10⁸⁰)</div>
              <p class="text-xs text-slate-400 mt-2">The total count of all matter particles in existence.</p>
              <div class="w-full bg-slate-800 h-1.5 rounded-full mt-3">
                <div class="bg-indigo-500 h-full rounded-full" style="width: 1%"></div>
              </div>
            </div>

            <div class="bg-slate-900/80 border border-cyan-500/40 p-4 rounded-xl bg-cyan-950/10">
              <div class="text-xs font-mono text-cyan-400 mb-1">M₁₃₆₂₇₉₈₄₁ (CURRENT TITAN)</div>
              <div class="text-lg font-bold text-cyan-300">41,024,320 digits</div>
              <p class="text-xs text-slate-300 mt-2">Would fill 14,000 paperback book pages or 41 MB text file.</p>
              <div class="w-full bg-slate-800 h-1.5 rounded-full mt-3">
                <div class="bg-cyan-400 h-full rounded-full" style="width: 41%"></div>
              </div>
            </div>

            <div class="bg-slate-900/80 border border-amber-500/40 p-4 rounded-xl bg-amber-950/10">
              <div class="text-xs font-mono text-amber-400 mb-1">1-BILLION-DIGIT TARGET</div>
              <div class="text-lg font-bold text-amber-300">1,000,000,000 digits</div>
              <p class="text-xs text-slate-300 mt-2">Unclaimed $250k EFF Prize. Needs ~330,000 book pages.</p>
              <div class="w-full bg-slate-800 h-1.5 rounded-full mt-3">
                <div class="bg-amber-400 h-full rounded-full" style="width: 100%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Interactive Lucas-Lehmer Sandbox -->
        <div class="forge-card p-6">
          <div class="forge-card-header px-0 pt-0">
            <div>
              <h3 class="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>⚡</span>
                <span>Interactive Lucas-Lehmer Sandbox (How M_p is Proven)</span>
              </h3>
              <p class="text-xs text-slate-400">
                Formula: Start at \(s_0 = 4\). Iterate \(s_i = (s_{i-1}^2 - 2) \bmod (2^p - 1)\). If \(s_{p-2} = 0\), then \(M_p\) is 100% prime!
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
            
            <!-- Controls & Presets (4 cols) -->
            <div class="lg:col-span-4 space-y-4">
              <div>
                <label class="text-xs font-mono text-slate-400 block mb-1.5">Enter Exponent \(p\) (must be prime):</label>
                <div class="flex gap-2">
                  <input id="input-sandbox-p" type="number" value="19" min="3" max="4423" class="bg-slate-950 border border-slate-800 text-cyan-300 px-3 py-2 rounded-lg font-mono text-sm w-full focus:outline-none focus:border-cyan-500">
                  <button id="btn-run-llt" class="btn-primary text-xs whitespace-nowrap">
                    Execute Test
                  </button>
                </div>
              </div>

              <div>
                <label class="text-xs font-mono text-slate-400 block mb-1.5">Famous Historic Presets:</label>
                <div class="grid grid-cols-3 gap-2">
                  <button class="btn-preset text-xs p-2 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500 font-mono text-slate-300" data-p="7">
                    p=7 (M₁₂₇)
                  </button>
                  <button class="btn-preset text-xs p-2 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500 font-mono text-slate-300" data-p="13">
                    p=13 (M₈₁₉₁)
                  </button>
                  <button class="btn-preset text-xs p-2 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500 font-mono text-slate-300" data-p="17">
                    p=17 (M₁₃₁₀₇₁)
                  </button>
                  <button class="btn-preset text-xs p-2 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500 font-mono text-slate-300" data-p="19">
                    p=19 (M₅₂₄₂₈₇)
                  </button>
                  <button class="btn-preset text-xs p-2 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500 font-mono text-slate-300" data-p="31">
                    p=31 (Euler)
                  </button>
                  <button class="btn-preset text-xs p-2 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500 font-mono text-slate-300" data-p="61">
                    p=61 (Pervushin)
                  </button>
                  <button class="btn-preset text-xs p-2 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500 font-mono text-slate-300" data-p="89">
                    p=89 (Powers)
                  </button>
                  <button class="btn-preset text-xs p-2 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500 font-mono text-slate-300" data-p="107">
                    p=107 (Powers)
                  </button>
                  <button class="btn-preset text-xs p-2 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500 font-mono text-slate-300" data-p="127">
                    p=127 (Lucas)
                  </button>
                </div>
              </div>

              <!-- Test Result Summary Box -->
              <div id="llt-result-box" class="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-500">Number Tested:</span>
                  <span id="llt-res-mp" class="text-slate-200 font-bold">2¹⁹ - 1</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Decimal Digits:</span>
                  <span id="llt-res-digits" class="text-cyan-400 font-bold">6 digits</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Compute Time:</span>
                  <span id="llt-res-time" class="text-slate-300">0.05 ms</span>
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-slate-800">
                  <span class="text-slate-400">Primality Verdict:</span>
                  <span id="llt-res-verdict" class="badge-emerald">✓ PRIME</span>
                </div>
              </div>
            </div>

            <!-- Lucas-Lehmer Sequence Step Viewer (8 cols) -->
            <div class="lg:col-span-8 flex flex-col">
              <div class="text-xs font-mono text-slate-400 mb-2 flex items-center justify-between">
                <span>Iteration Residue Sequence: \(s_i = (s_{i-1}^2 - 2) \bmod M_p\)</span>
                <span class="text-slate-500">Must end with \(s_{p-2} = 0\)</span>
              </div>
              <div class="bg-slate-950 border border-slate-800 rounded-xl p-4 flex-1 max-h-72 overflow-y-auto font-mono text-xs space-y-1.5">
                <div id="llt-steps-list" class="divide-y divide-slate-900">
                  <!-- Steps dynamically generated -->
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Historic Timeline of Record Primes -->
        <div class="forge-card p-6">
          <div class="forge-card-header px-0 pt-0">
            <h3 class="text-base font-bold text-slate-100">Evolution of Largest Known Primes Through History</h3>
          </div>
          <div class="mt-4 overflow-x-auto">
            <table class="w-full text-xs font-mono text-left">
              <thead class="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th class="p-3">Year</th>
                  <th class="p-3">Prime Formula</th>
                  <th class="p-3">Digits</th>
                  <th class="p-3">Discoverer</th>
                  <th class="p-3">Computation Method</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800 text-slate-300">
                <tr class="hover:bg-slate-800/30">
                  <td class="p-3 text-slate-400">1772</td>
                  <td class="p-3 text-cyan-300 font-bold">2³¹ - 1 (2,147,483,647)</td>
                  <td class="p-3">10</td>
                  <td class="p-3">Leonhard Euler</td>
                  <td class="p-3 text-slate-400">Trial division on paper</td>
                </tr>
                <tr class="hover:bg-slate-800/30">
                  <td class="p-3 text-slate-400">1876</td>
                  <td class="p-3 text-cyan-300 font-bold">2¹²⁷ - 1</td>
                  <td class="p-3">39</td>
                  <td class="p-3">Édouard Lucas</td>
                  <td class="p-3 text-slate-400">Lucas sequences (Manual calculation, held record for 75 years)</td>
                </tr>
                <tr class="hover:bg-slate-800/30">
                  <td class="p-3 text-slate-400">1952</td>
                  <td class="p-3 text-cyan-300 font-bold">2²²⁸¹ - 1</td>
                  <td class="p-3">687</td>
                  <td class="p-3">Raphael M. Robinson</td>
                  <td class="p-3 text-slate-400">SWAC vacuum-tube computer</td>
                </tr>
                <tr class="hover:bg-slate-800/30">
                  <td class="p-3 text-slate-400">1996</td>
                  <td class="p-3 text-cyan-300 font-bold">2¹²⁵⁷⁷⁸⁷ - 1</td>
                  <td class="p-3">378,632</td>
                  <td class="p-3">GIMPS (Slowinski & Gage)</td>
                  <td class="p-3 text-slate-400">Cray T94 Supercomputer (First GIMPS record)</td>
                </tr>
                <tr class="hover:bg-slate-800/30">
                  <td class="p-3 text-slate-400">2018</td>
                  <td class="p-3 text-cyan-300 font-bold">2⁸²⁵⁸⁹⁹³³ - 1</td>
                  <td class="p-3">24,862,048</td>
                  <td class="p-3">Patrick Laroche (GIMPS)</td>
                  <td class="p-3 text-slate-400">Intel Core i5-4590T CPU volunteer</td>
                </tr>
                <tr class="hover:bg-indigo-950/40 bg-indigo-950/20 border-l-2 border-indigo-500 font-bold">
                  <td class="p-3 text-amber-400">2024</td>
                  <td class="p-3 text-cyan-300 font-extrabold">2¹³⁶²⁷⁹⁸⁴¹ - 1</td>
                  <td class="p-3 text-amber-300">41,024,320</td>
                  <td class="p-3 text-white">Luke Durant (GIMPS)</td>
                  <td class="p-3 text-indigo-300">Global Cloud GPU Cluster (NVIDIA A100/H100)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  runSandboxTest(p) {
    const pNum = Number(p);
    const res = lucasLehmerTest(pNum, 40);
    
    document.getElementById('llt-res-mp').innerText = `2^${pNum} - 1`;
    document.getElementById('llt-res-digits').innerText = `${res.digits.toLocaleString()} digits`;
    document.getElementById('llt-res-time').innerText = `${res.durationMs.toFixed(3)} ms`;
    
    const verdictEl = document.getElementById('llt-res-verdict');
    if (res.isPrime) {
      verdictEl.className = 'badge-emerald';
      verdictEl.innerText = '✓ CONFIRMED PRIME (s = 0)';
    } else {
      verdictEl.className = 'badge-rose';
      verdictEl.innerText = `✗ COMPOSITE (s = ${res.finalResidue.toString().slice(0, 8)}...)`;
    }

    const stepsList = document.getElementById('llt-steps-list');
    stepsList.innerHTML = res.steps.map(st => `
      <div class="py-1 flex justify-between items-center">
        <span class="text-slate-500">s_${st.i}</span>
        <span class="${st.s === 0n || st.s === 0 ? 'text-emerald-400 font-bold' : 'text-slate-300'}">${st.s}</span>
      </div>
    `).join('');
  }

  bindEvents() {
    document.getElementById('btn-run-llt')?.addEventListener('click', () => {
      const p = Number(document.getElementById('input-sandbox-p').value);
      if (p > 5000) {
        alert('Please enter p <= 5000 for instant in-browser interactive testing.');
        return;
      }
      this.runSandboxTest(p);
    });

    document.querySelectorAll('.btn-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = Number(btn.getAttribute('data-p'));
        document.getElementById('input-sandbox-p').value = p;
        this.runSandboxTest(p);
      });
    });
  }
}
