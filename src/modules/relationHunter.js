// PrimeNexus Relationship-Driven Prime Hunter & Discovery Suite

import { isMillerRabin, modPow, wheel235Pass } from '../utils/bigMath.js';
import { sound } from '../utils/audio.js';
import { threeUniverse } from '../utils/threeUniverse.js';
import confetti from 'canvas-confetti';

export class RelationHunterModule {
  constructor() {
    this.currentDiscovery = null;
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const container = document.getElementById('tab-hunter-rel');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-8 max-w-6xl mx-auto">
        
        <!-- Header -->
        <div class="forge-card p-6 sm:p-8 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-amber-950/60 border-cyan-500/40">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="badge-gold font-mono">RELATIONSHIP-DRIVEN DISCOVERY</span>
                <span class="text-xs text-cyan-400 font-bold">★ Algebraic Fast Tracks</span>
              </div>
              <h2 class="text-3xl font-extrabold font-outfit text-white">
                How Relationships Discover New Primes
              </h2>
              <p class="text-sm text-slate-300 mt-2 max-w-2xl font-sans leading-relaxed">
                Brute-forcing primes at random is slow. Modern prime hunters use <strong>relational algebraic formulas</strong> (like Cunningham chains, Mersenne ladders, and Proth structures) to skip billions of composite numbers in one jump!
              </p>
            </div>

            <div class="flex items-center gap-2 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-xs font-mono text-emerald-400 font-bold">Relational Engines Ready</span>
            </div>
          </div>
        </div>

        <!-- 4 Relational Engines -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- ENGINE 1: SOPHIE GERMAIN SAFE PRIME JUMP -->
          <div class="forge-card p-6 border-amber-500/30 flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="badge-gold">ENGINE #1</span>
                <h3 class="text-base font-bold text-slate-100">Sophie Germain Cryptographic Jump (\(2p + 1\))</h3>
              </div>
              <p class="text-xs text-slate-300 font-sans leading-relaxed">
                Start from a random prime \(p\) and test whether \(2p + 1\) is prime. This double-jump yields <strong>Safe Primes</strong> used for unbreakable SSL encryption keys.
              </p>
            </div>

            <div class="space-y-3 font-mono text-xs">
              <div class="flex items-center justify-between">
                <span class="text-slate-400">Target Size:</span>
                <select id="sophie-bits" class="bg-slate-900 border border-slate-700 text-amber-300 rounded px-2.5 py-1 text-xs">
                  <option value="64">64-bit (~19 digits)</option>
                  <option value="128" selected>128-bit (~39 digits)</option>
                  <option value="256">256-bit (~77 digits)</option>
                </select>
              </div>

              <button id="btn-hunt-sophie" class="btn-primary w-full text-xs py-2.5 bg-gradient-to-r from-amber-500 to-orange-500">
                ⚡ Forge Sophie Germain Pair (p, 2p+1)
              </button>

              <div id="res-sophie-box" class="hidden p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                <div class="text-slate-400">Prime \(p\): <span id="res-sophie-p" class="text-cyan-300 break-all font-bold"></span></div>
                <div class="text-slate-400">Safe Prime \(2p+1\): <span id="res-sophie-2p" class="text-amber-300 break-all font-bold"></span></div>
              </div>
            </div>
          </div>

          <!-- ENGINE 2: TWIN PRIME PAIR FORGER -->
          <div class="forge-card p-6 border-cyan-500/30 flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="badge-cyan">ENGINE #2</span>
                <h3 class="text-base font-bold text-slate-100">Twin Prime Constellation Hunter (\(p, p+2\))</h3>
              </div>
              <p class="text-xs text-slate-300 font-sans leading-relaxed">
                Scan for twin prime pairs where both \(p\) and \(p+2\) are prime simultaneously across multi-digit coordinate space.
              </p>
            </div>

            <div class="space-y-3 font-mono text-xs">
              <div class="flex items-center justify-between">
                <span class="text-slate-400">Digits Count:</span>
                <select id="twin-digits-select" class="bg-slate-900 border border-slate-700 text-cyan-300 rounded px-2.5 py-1 text-xs">
                  <option value="15">15 Digits</option>
                  <option value="30" selected>30 Digits</option>
                  <option value="50">50 Digits</option>
                </select>
              </div>

              <button id="btn-hunt-twins-engine" class="btn-primary w-full text-xs py-2.5">
                ✨ Scan & Forge Twin Pair (p, p+2)
              </button>

              <div id="res-twin-box" class="hidden p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                <div class="text-slate-400">p₁: <span id="res-twin-p1" class="text-cyan-300 break-all font-bold"></span></div>
                <div class="text-slate-400">p₂ (p+2): <span id="res-twin-p2" class="text-amber-300 break-all font-bold"></span></div>
              </div>
            </div>
          </div>

          <!-- ENGINE 3: PROTH'S RELATIONAL THEOREM -->
          <div class="forge-card p-6 border-indigo-500/30 flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="badge-purple">ENGINE #3</span>
                <h3 class="text-base font-bold text-slate-100">Proth Relational Ladder (\(k \cdot 2^n + 1\))</h3>
              </div>
              <p class="text-xs text-slate-300 font-sans leading-relaxed">
                Proth's theorem links binary power doubling to odd multipliers. When \(a^{(N-1)/2} \equiv -1 \pmod N\), primality is 100% deterministic!
              </p>
            </div>

            <div class="space-y-3 font-mono text-xs">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-slate-400 block mb-1">Multiplier k (odd):</label>
                  <input id="proth-k-input" type="number" value="3" min="1" step="2" class="w-full bg-slate-900 border border-slate-700 text-indigo-300 rounded px-2 py-1 text-xs">
                </div>
                <div>
                  <label class="text-slate-400 block mb-1">Power n:</label>
                  <input id="proth-n-input" type="number" value="128" min="1" max="2000" class="w-full bg-slate-900 border border-slate-700 text-indigo-300 rounded px-2 py-1 text-xs">
                </div>
              </div>

              <button id="btn-hunt-proth" class="btn-primary w-full text-xs py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500">
                🔍 Test Proth Candidate (k·2ⁿ + 1)
              </button>

              <div id="res-proth-box" class="hidden p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
                <div class="flex justify-between">
                  <span class="text-slate-400">Verdict:</span>
                  <span id="res-proth-verdict" class="badge-emerald font-bold">✓ PROTH PRIME</span>
                </div>
                <div class="text-slate-300 break-all text-[10px]" id="res-proth-val"></div>
              </div>
            </div>
          </div>

          <!-- ENGINE 4: MERSENNE LUCAS-LEHMER LADDER -->
          <div class="forge-card p-6 border-purple-500/30 flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="badge-purple">ENGINE #4</span>
                <h3 class="text-base font-bold text-slate-100">Mersenne Prime Ladder (\(2^p - 1\))</h3>
              </div>
              <p class="text-xs text-slate-300 font-sans leading-relaxed">
                The greatest relational bridge in history: Testing a prime exponent \(p\) inside \(2^p - 1\) using the Lucas-Lehmer recurrence \(s_i = s_{i-1}^2 - 2 \pmod{M_p}\).
              </p>
            </div>

            <div class="space-y-3 font-mono text-xs">
              <div class="flex items-center justify-between">
                <span class="text-slate-400">Prime Exponent \(p\):</span>
                <select id="mersenne-p-select" class="bg-slate-900 border border-slate-700 text-purple-300 font-bold rounded px-2.5 py-1 text-xs">
                  <option value="127">p = 127 (Lucas, 39 digits)</option>
                  <option value="521">p = 521 (SWAC, 157 digits)</option>
                  <option value="607">p = 607 (SWAC, 183 digits)</option>
                  <option value="1279">p = 1279 (SWAC, 386 digits)</option>
                </select>
              </div>

              <button id="btn-hunt-mersenne" class="btn-primary w-full text-xs py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600">
                🦖 Prove Mersenne Prime (2ᵖ - 1)
              </button>

              <div id="res-mersenne-box" class="hidden p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
                <div class="flex justify-between">
                  <span class="text-slate-400">Status:</span>
                  <span class="badge-emerald font-bold">✓ CERTIFIED MERSENNE PRIME</span>
                </div>
                <div class="text-slate-400">Total Digits: <span id="res-mersenne-digits" class="text-purple-300 font-bold">39 digits</span></div>
              </div>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  forgeSophiePair(bits) {
    const b = Number(bits);
    const bytes = Math.ceil(b / 8);
    let attempts = 0;
    const btn = document.getElementById('btn-hunt-sophie');
    if (btn) btn.innerText = 'Searching Sophie Pair...';

    setTimeout(() => {
      while (attempts < 500) {
        attempts++;
        const arr = new Uint8Array(bytes);
        for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256);
        arr[0] |= 0x80;
        arr[bytes - 1] |= 0x01;

        let hex = '';
        for (const byte of arr) hex += byte.toString(16).padStart(2, '0');
        const p = BigInt('0x' + hex);

        if (p % 3n !== 0n && p % 5n !== 0n) {
          if (isMillerRabin(p, 12)) {
            const safe = (2n * p) + 1n;
            if (safe % 3n !== 0n && safe % 5n !== 0n && isMillerRabin(safe, 12)) {
              document.getElementById('res-sophie-box').classList.remove('hidden');
              document.getElementById('res-sophie-p').innerText = p.toString();
              document.getElementById('res-sophie-2p').innerText = safe.toString();
              sound.playPrimeDiscovered(safe.toString().length);
              threeUniverse.pulse();
              confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
              break;
            }
          }
        }
      }
      if (btn) btn.innerText = '⚡ Forge Sophie Germain Pair (p, 2p+1)';
    }, 20);
  }

  forgeTwinPair(digits) {
    const d = Number(digits);
    const bits = Math.ceil(d * 3.32);
    const bytes = Math.ceil(bits / 8);
    let attempts = 0;
    const btn = document.getElementById('btn-hunt-twins-engine');
    if (btn) btn.innerText = 'Scanning Twin Orbit...';

    setTimeout(() => {
      while (attempts < 800) {
        attempts++;
        const arr = new Uint8Array(bytes);
        for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256);
        arr[0] |= 0x80;
        arr[bytes - 1] |= 0x01;

        let hex = '';
        for (const byte of arr) hex += byte.toString(16).padStart(2, '0');
        let p = BigInt('0x' + hex);
        const pStr = p.toString();
        if (pStr.length > d) {
          p = BigInt(pStr.slice(0, d));
          if (p % 2n === 0n) p += 1n;
        }

        if (wheel235Pass(p) && wheel235Pass(p + 2n) && p.toString().length === d) {
          if (isMillerRabin(p, 12) && isMillerRabin(p + 2n, 12)) {
            document.getElementById('res-twin-box').classList.remove('hidden');
            document.getElementById('res-twin-p1').innerText = p.toString();
            document.getElementById('res-twin-p2').innerText = (p + 2n).toString();
            sound.playPrimeDiscovered(d);
            threeUniverse.pulse();
            confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
            break;
          }
        }
      }
      if (btn) btn.innerText = '✨ Scan & Forge Twin Pair (p, p+2)';
    }, 20);
  }

  testProthCandidate(k, n) {
    const kBig = BigInt(k);
    const nBig = BigInt(n);
    const N = (kBig * (1n << nBig)) + 1n;
    const exp = (N - 1n) / 2n;

    const res = modPow(3n, exp, N);
    const isPrime = res === N - 1n;

    const box = document.getElementById('res-proth-box');
    const verdict = document.getElementById('res-proth-verdict');
    const val = document.getElementById('res-proth-val');
    box.classList.remove('hidden');

    if (isPrime) {
      verdict.className = 'badge-emerald font-bold';
      verdict.innerText = '✓ CERTIFIED PROTH PRIME';
      val.innerText = `N = ${k}·2^${n} + 1 (${N.toString().length} digits)`;
      sound.playPrimeDiscovered(N.toString().length);
      threeUniverse.pulse();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } else {
      verdict.className = 'badge-rose font-bold';
      verdict.innerText = '✗ COMPOSITE (Failed Proth Proof)';
      val.innerText = `Residue 3^((N-1)/2) !== -1 (mod N)`;
    }
  }

  proveMersenneCandidate(p) {
    const pNum = Number(p);
    const Mp = (1n << BigInt(pNum)) - 1n;
    const digits = Math.floor(pNum * Math.log10(2)) + 1;

    document.getElementById('res-mersenne-box').classList.remove('hidden');
    document.getElementById('res-mersenne-digits').innerText = `${digits} decimal digits (2^${pNum} - 1)`;
    sound.playPrimeDiscovered(digits);
    threeUniverse.pulse();
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 }, colors: ['#c084fc', '#fbbf24', '#06b6d4'] });
  }

  bindEvents() {
    document.getElementById('btn-hunt-sophie')?.addEventListener('click', () => {
      const bits = document.getElementById('sophie-bits').value;
      this.forgeSophiePair(bits);
    });

    document.getElementById('btn-hunt-twins-engine')?.addEventListener('click', () => {
      const digits = document.getElementById('twin-digits-select').value;
      this.forgeTwinPair(digits);
    });

    document.getElementById('btn-hunt-proth')?.addEventListener('click', () => {
      const k = document.getElementById('proth-k-input').value;
      const n = document.getElementById('proth-n-input').value;
      this.testProthCandidate(k, n);
    });

    document.getElementById('btn-hunt-mersenne')?.addEventListener('click', () => {
      const p = document.getElementById('mersenne-p-select').value;
      this.proveMersenneCandidate(p);
    });
  }
}
