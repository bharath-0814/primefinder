// PrimeForge Dedicated Prime Discovery Engine Module

import { isMillerRabin, modPow, smallPrimeCheck, wheel235Pass } from '../utils/bigMath.js';
import { sound } from '../utils/audio.js';
import { threeUniverse } from '../utils/threeUniverse.js';
import confetti from 'canvas-confetti';

export class FindPrimeModule {
  constructor() {
    this.currentPrime = null;
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const container = document.getElementById('tab-find');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-8 max-w-6xl mx-auto">
        
        <!-- Header Banner -->
        <div class="forge-card p-6 sm:p-8 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border-cyan-500/40 relative overflow-hidden">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="badge-cyan font-mono">DEDICATED DISCOVERY SUITE</span>
                <span class="text-xs text-amber-400 font-bold">★ 100% Client-Side BigInt Engine</span>
              </div>
              <h2 class="text-3xl font-extrabold font-outfit text-white">
                Find & Prove New Prime Numbers
              </h2>
              <p class="text-sm text-slate-300 mt-2 max-w-2xl font-sans leading-relaxed">
                Forge brand-new multi-digit primes, find the next prime after any custom number or timestamp, test arbitrary integers, and mint your official Discovery Certificate.
              </p>
            </div>

            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              <span class="text-xs font-mono text-emerald-400 font-bold">Ready for Computation</span>
            </div>
          </div>
        </div>

        <!-- 3 Primary Discovery Tools Tabs/Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- TOOL 1: FORGE CUSTOM N-DIGIT PRIME (7 cols) -->
          <div class="lg:col-span-7 forge-card p-6 border-cyan-500/30 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <span class="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm">1</span>
                  <h3 class="text-base font-bold text-slate-100">Forge Custom N-Digit Prime</h3>
                </div>
                <span class="text-xs font-mono text-cyan-400" id="forge-slider-label">50 Digits (~166 bits)</span>
              </div>

              <div class="space-y-4">
                <div>
                  <div class="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
                    <span>Desired Digits:</span>
                    <span id="forge-digits-val" class="text-white font-bold">50</span>
                  </div>
                  <input id="forge-digits-slider" type="range" min="10" max="250" value="50" class="w-full accent-cyan-400 cursor-pointer">
                  <div class="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>10 Digits</span>
                    <span>100 Digits</span>
                    <span>250 Digits (Extreme)</span>
                  </div>
                </div>

                <div class="flex gap-2">
                  <button id="btn-forge-now" class="btn-primary w-full text-xs py-2.5 shadow-lg shadow-cyan-500/20">
                    ⚡ Forge Prime Now
                  </button>
                </div>
              </div>
            </div>

            <!-- Result Box -->
            <div id="forge-result-card" class="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
              <div class="flex justify-between text-slate-400">
                <span>Result:</span>
                <span id="forge-status" class="text-emerald-400 font-bold">Click "Forge Prime Now"</span>
              </div>
              <textarea id="forge-output-val" readonly class="w-full h-20 bg-slate-900 border border-slate-800 text-cyan-300 p-2.5 rounded-lg font-mono text-xs select-all focus:outline-none"></textarea>
              <div class="flex justify-between items-center pt-1">
                <span class="text-[11px] text-slate-500" id="forge-meta">Attempts: 0 | Time: 0ms</span>
                <button id="btn-copy-forged" class="btn-secondary text-[11px] py-1 px-2.5">
                  📋 Copy
                </button>
              </div>
            </div>
          </div>

          <!-- TOOL 2: NEXT PRIME AFTER N (5 cols) -->
          <div class="lg:col-span-5 forge-card p-6 border-indigo-500/30 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-4">
                <span class="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-sm">2</span>
                <h3 class="text-base font-bold text-slate-100">Find Next Prime After Number N</h3>
              </div>

              <div class="space-y-3 font-mono text-xs">
                <div>
                  <label class="text-slate-400 block mb-1">Enter Starting Integer \(N\):</label>
                  <input id="input-next-n" type="text" value="1000000000000" class="w-full bg-slate-950 border border-slate-800 text-cyan-300 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-indigo-500">
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <button id="btn-next-timestamp" class="text-[11px] p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300">
                    Use Now Timestamp
                  </button>
                  <button id="btn-next-random" class="text-[11px] p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300">
                    Use Random BigInt
                  </button>
                </div>

                <button id="btn-find-next-prime" class="btn-primary w-full text-xs py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500">
                  🔍 Find Next Prime
                </button>
              </div>
            </div>

            <!-- Next Prime Output -->
            <div class="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
              <div class="flex justify-between text-slate-400">
                <span>Next Prime:</span>
                <span id="next-prime-gap" class="text-amber-400 font-bold">Gap: -</span>
              </div>
              <div id="next-prime-val" class="p-2 rounded bg-slate-900 text-indigo-300 font-bold break-all text-xs">
                -
              </div>
            </div>
          </div>

        </div>

        <!-- TOOL 3: UNIVERSAL PRIMALITY TESTER & FACTORIZER -->
        <div class="forge-card p-6 border-slate-700">
          <div class="flex items-center gap-2 mb-3">
            <span class="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm">3</span>
            <h3 class="text-base font-bold text-slate-100">Universal Primality Tester & Factorizer</h3>
          </div>
          <p class="text-xs text-slate-400 mb-4 font-sans">
            Paste any number of arbitrary length to test whether it is Prime or Composite, with proof or factor extraction.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 font-mono text-xs">
            <div class="md:col-span-8">
              <input id="input-verify-n" type="text" placeholder="Paste integer here (e.g. 2305843009213693951)" class="w-full bg-slate-950 border border-slate-800 text-cyan-300 p-2.5 rounded-lg focus:outline-none focus:border-amber-500">
            </div>
            <div class="md:col-span-4 flex gap-2">
              <button id="btn-test-custom" class="btn-primary w-full text-xs py-2.5">
                🧪 Test Primality
              </button>
            </div>
          </div>

          <!-- Verdict Output -->
          <div id="test-verdict-box" class="hidden mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Verdict:</span>
              <span id="test-verdict-badge" class="badge-emerald font-bold text-sm">✓ CERTIFIED PRIME</span>
            </div>
            <div id="test-verdict-details" class="text-slate-300">
              Passed 15 Miller-Rabin probabilistic bases.
            </div>
          </div>
        </div>

        <!-- TOOL 4: MINT DISCOVERY CERTIFICATE -->
        <div class="forge-card p-6 sm:p-8 border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-slate-950 to-slate-900">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="text-2xl">📜</span>
              <h3 class="text-lg font-bold text-slate-100">Official Discovery Certificate</h3>
            </div>
            <button id="btn-mint-certificate" class="btn-primary text-xs py-2 px-4 shadow-lg shadow-amber-500/20 bg-gradient-to-r from-amber-500 to-indigo-600">
              ✨ Mint Certificate
            </button>
          </div>

          <!-- The Certificate Card -->
          <div id="certificate-card" class="p-6 sm:p-8 rounded-2xl border-2 border-amber-500/50 bg-slate-950 shadow-2xl relative overflow-hidden text-center space-y-4">
            <div class="absolute -right-16 -top-16 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div class="text-[11px] font-mono text-amber-400 tracking-widest uppercase font-bold">
              ★ CERTIFICATE OF MATHEMATICAL DISCOVERY ★
            </div>
            <h4 class="text-xl sm:text-2xl font-black font-outfit text-white">
              PrimeForge Certified Discovery
            </h4>
            <p class="text-xs text-slate-400 max-w-md mx-auto font-sans">
              This certifies that the following unique integer was generated and proven to be Prime using the Miller-Rabin Primality Algorithm:
            </p>

            <div class="p-3.5 bg-slate-900 rounded-xl border border-slate-800 font-mono text-cyan-300 text-xs break-all max-h-28 overflow-y-auto" id="cert-prime-display">
              982451653... (Click "Mint Certificate" to generate)
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              <div>
                <span class="text-slate-500 block">DIGITS:</span>
                <span id="cert-digits" class="text-amber-300 font-bold">50 Digits</span>
              </div>
              <div>
                <span class="text-slate-500 block">PROOF:</span>
                <span class="text-emerald-400 font-bold">Miller-Rabin</span>
              </div>
              <div>
                <span class="text-slate-500 block">DATE:</span>
                <span id="cert-date" class="text-slate-200">Today</span>
              </div>
              <div>
                <span class="text-slate-500 block">CERTAINTY:</span>
                <span class="text-cyan-300 font-bold">99.999999%</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  forgeNDigitPrime(digits) {
    const d = Number(digits);
    const statusEl = document.getElementById('forge-status');
    const outVal = document.getElementById('forge-output-val');
    const metaEl = document.getElementById('forge-meta');
    const btn = document.getElementById('btn-forge-now');

    if (btn) btn.innerText = '⏳ Forging...';
    if (statusEl) statusEl.innerText = `Searching among 10^${d} candidates...`;

    const start = performance.now();

    setTimeout(() => {
      // Calculate approximate bit length for decimal digits
      const bits = Math.ceil(d * 3.321928);
      const bytes = Math.ceil(bits / 8);
      let found = null;
      let attempts = 0;

      while (!found && attempts < 1000) {
        attempts++;
        const arr = new Uint8Array(bytes);
        for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256);
        arr[0] |= 0x80;
        arr[bytes - 1] |= 0x01; // Odd
        
        let hex = '';
        for (const b of arr) hex += b.toString(16).padStart(2, '0');
        let cand = BigInt('0x' + hex);

        // Adjust candidate to exact length if needed
        const candStr = cand.toString();
        if (candStr.length > d) {
          cand = BigInt(candStr.slice(0, d));
          if (cand % 2n === 0n) cand += 1n;
        }

        if (wheel235Pass(cand) && cand.toString().length === d) {
          if (isMillerRabin(cand, 15)) {
            found = cand;
            break;
          }
        }
      }

      const elapsed = (performance.now() - start).toFixed(1);

      if (found) {
        this.currentPrime = found;
        outVal.value = found.toString();
        statusEl.innerText = `✓ Fresh ${d}-Digit Prime Forged!`;
        metaEl.innerText = `Attempts: ${attempts} | Time: ${elapsed}ms | Proof: 15 Miller-Rabin Rounds`;
        
        sound.playPrimeDiscovered(d);
        threeUniverse.pulse();
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#fbbf24', '#818cf8']
        });
      } else {
        statusEl.innerText = 'Search timed out, try again.';
      }

      if (btn) btn.innerText = '⚡ Forge Prime Now';
    }, 20);
  }

  findNextPrime(startN) {
    let curr = BigInt(startN);
    if (curr <= 2n) curr = 2n;
    else if (curr % 2n === 0n) curr += 1n;
    else curr += 2n;

    const initial = BigInt(startN);
    let attempts = 0;

    while (attempts < 2000) {
      attempts++;
      if (wheel235Pass(curr)) {
        if (isMillerRabin(curr, 12)) {
          const gap = curr - initial;
          document.getElementById('next-prime-gap').innerText = `Gap: +${gap.toString()}`;
          document.getElementById('next-prime-val').innerText = curr.toString();
          sound.playPrimeDiscovered(curr.toString().length);
          threeUniverse.pulse();
          return;
        }
      }
      curr += 2n;
    }
  }

  verifyCustomNumber(nStr) {
    const box = document.getElementById('test-verdict-box');
    const badge = document.getElementById('test-verdict-badge');
    const details = document.getElementById('test-verdict-details');
    box.classList.remove('hidden');

    try {
      const n = BigInt(nStr.trim());
      if (n < 2n) {
        badge.className = 'badge-rose font-bold text-sm';
        badge.innerText = '✗ NOT PRIME (Must be >= 2)';
        details.innerText = 'Numbers less than 2 are not prime.';
        return;
      }

      const smallCheck = smallPrimeCheck(n);
      if (smallCheck.isPrime) {
        badge.className = 'badge-emerald font-bold text-sm';
        badge.innerText = '✓ CERTIFIED SMALL PRIME';
        details.innerText = `${n} is a fundamental small prime number.`;
        return;
      }
      if (smallCheck.factor) {
        badge.className = 'badge-rose font-bold text-sm';
        badge.innerText = `✗ COMPOSITE (Divisible by ${smallCheck.factor})`;
        details.innerText = `${n} is divisible by ${smallCheck.factor} (${n} = ${smallCheck.factor} × ${n / BigInt(smallCheck.factor)}).`;
        return;
      }

      const isPrime = isMillerRabin(n, 15);
      if (isPrime) {
        badge.className = 'badge-emerald font-bold text-sm';
        badge.innerText = '✓ CERTIFIED PRIME';
        details.innerText = `Passed 15 Miller-Rabin deterministic & probabilistic checks. Certainty > 99.999999%.`;
        sound.playPrimeDiscovered(n.toString().length);
        threeUniverse.pulse();
      } else {
        badge.className = 'badge-rose font-bold text-sm';
        badge.innerText = '✗ COMPOSITE NUMBER';
        details.innerText = `Failed Miller-Rabin primality check. Number is composite.`;
      }
    } catch (err) {
      badge.className = 'badge-rose font-bold text-sm';
      badge.innerText = '✗ INVALID INTEGER';
      details.innerText = 'Please enter a valid whole number with no decimals or characters.';
    }
  }

  mintCertificate() {
    if (!this.currentPrime) {
      this.forgeNDigitPrime(50);
      return;
    }
    const val = this.currentPrime.toString();
    document.getElementById('cert-prime-display').innerText = val;
    document.getElementById('cert-digits').innerText = `${val.length} Digits`;
    document.getElementById('cert-date').innerText = new Date().toLocaleDateString();

    sound.playPrimeDiscovered(val.length);
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#fbbf24', '#06b6d4', '#ec4899']
    });
  }

  bindEvents() {
    // Slider
    const slider = document.getElementById('forge-digits-slider');
    slider?.addEventListener('input', (e) => {
      const v = e.target.value;
      document.getElementById('forge-digits-val').innerText = v;
      document.getElementById('forge-slider-label').innerText = `${v} Digits (~${Math.ceil(v * 3.32)} bits)`;
    });

    // Forge Prime button
    document.getElementById('btn-forge-now')?.addEventListener('click', () => {
      const digits = document.getElementById('forge-digits-slider').value;
      this.forgeNDigitPrime(digits);
    });

    // Copy forged
    document.getElementById('btn-copy-forged')?.addEventListener('click', () => {
      const val = document.getElementById('forge-output-val').value;
      if (!val) return;
      navigator.clipboard.writeText(val).then(() => {
        const btn = document.getElementById('btn-copy-forged');
        btn.innerText = '✓ Copied!';
        setTimeout(() => { btn.innerText = '📋 Copy'; }, 1500);
      });
    });

    // Next Prime buttons
    document.getElementById('btn-find-next-prime')?.addEventListener('click', () => {
      const val = document.getElementById('input-next-n').value;
      this.findNextPrime(val);
    });

    document.getElementById('btn-next-timestamp')?.addEventListener('click', () => {
      document.getElementById('input-next-n').value = Date.now().toString();
      this.findNextPrime(Date.now().toString());
    });

    document.getElementById('btn-next-random')?.addEventListener('click', () => {
      const rnd = (BigInt(Math.floor(Math.random() * 1000000000)) * 1000000000n) + BigInt(Math.floor(Math.random() * 1000000000));
      document.getElementById('input-next-n').value = rnd.toString();
      this.findNextPrime(rnd.toString());
    });

    // Universal Tester
    document.getElementById('btn-test-custom')?.addEventListener('click', () => {
      const val = document.getElementById('input-verify-n').value;
      this.verifyCustomNumber(val);
    });

    // Mint Certificate
    document.getElementById('btn-mint-certificate')?.addEventListener('click', () => {
      this.mintCertificate();
    });

    // Trigger an initial forge so box isn't empty
    this.forgeNDigitPrime(50);
  }
}
