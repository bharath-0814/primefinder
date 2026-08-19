// Adding "Hunt Your Own Prime" interactive section into SimpleMode

import { isMillerRabin, modPow } from '../utils/bigMath.js';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio.js';

export class SimpleModeModule {
  constructor() {
    this.chocoCount = 7;
  }

  init() {
    this.render();
    this.bindEvents();
    this.updateChocoGrid(7);
  }

  render() {
    const container = document.getElementById('tab-simple');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-8 max-w-5xl mx-auto">
        
        <!-- Welcome Hero -->
        <div class="forge-card p-6 sm:p-8 bg-gradient-to-r from-cyan-950/50 via-slate-900 to-indigo-950/50 border-cyan-500/30">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">🌍</span>
            <span class="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Story Mode • Human Guide</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold font-outfit text-white">
            How You Can Find Your Own New Prime Number Right Now
          </h2>
          <p class="text-sm text-slate-300 mt-2 leading-relaxed font-sans">
            Prime numbers are infinite. There are countless trillions of undiscovered primes waiting to be found. Here is how you can find one right here on this page, and how scientists find world-record primes.
          </p>
        </div>

        <!-- INTERACTIVE: HUNT A UNIQUE 100-DIGIT PRIME RIGHT NOW -->
        <div class="forge-card p-6 sm:p-8 border-cyan-500/40 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div class="flex items-center gap-2">
                <span class="badge-cyan">INSTANT DISCOVERY TOOL</span>
                <span class="text-xs text-amber-400 font-bold">★ 1-Click Generator</span>
              </div>
              <h3 class="text-xl font-bold text-white mt-1">Hunt a Unique 100-Digit Prime For Yourself</h3>
              <p class="text-xs text-slate-400 font-sans">
                Because there are more 100-digit primes than atoms in the universe, clicking this button generates a prime that <strong>no human in history has likely ever seen</strong>.
              </p>
            </div>

            <button id="btn-hunt-unique" class="btn-primary text-sm py-3 px-6 whitespace-nowrap shadow-lg shadow-cyan-500/20 hover:scale-105 transition">
              ⚡ Forge Unique Prime
            </button>
          </div>

          <!-- Live Forging Result Box -->
          <div id="unique-prime-result" class="mt-6 p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2 text-slate-400">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span class="text-slate-200 font-bold">Status:</span>
                <span id="hunt-status" class="text-emerald-400">Ready to forge</span>
              </div>
              <div>
                <span class="text-slate-500">Digits:</span>
                <span id="hunt-digits" class="text-cyan-300 font-bold">100 digits</span>
              </div>
              <div>
                <span class="text-slate-500">Tests Passed:</span>
                <span id="hunt-rounds" class="text-amber-400 font-bold">15 Miller-Rabin Rounds (99.999999% certain)</span>
              </div>
            </div>

            <div>
              <label class="text-slate-500 block mb-1 text-[11px]">Your Personal Prime Number (Copy & Keep):</label>
              <textarea id="hunt-prime-val" readonly class="w-full h-24 bg-slate-900 border border-slate-800 text-cyan-300 p-3 rounded-xl font-mono text-xs focus:outline-none select-all leading-relaxed"></textarea>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <div class="text-[11px] text-slate-400 font-sans">
                💡 <strong class="text-slate-200">How it was made:</strong> Filtered out evens/fives, then passed 15 Fermat & Miller-Rabin primality checkpoints in <span id="hunt-time" class="text-cyan-300">0 ms</span>.
              </div>
              <button id="btn-copy-unique" class="btn-secondary text-xs py-1.5 px-3">
                📋 Copy Number
              </button>
            </div>
          </div>
        </div>

        <!-- 3 WAYS TO FIND PRIMES IN REAL LIFE -->
        <div class="forge-card p-6 border-slate-700">
          <div class="flex items-center gap-2 mb-4">
            <span class="text-xl">🏆</span>
            <h3 class="text-lg font-bold text-slate-100">How People Find Officially Recognized New Primes</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
            
            <!-- Method 1: GIMPS -->
            <div class="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-2xl">⚡</span>
                  <span class="badge-gold">World Records</span>
                </div>
                <h4 class="font-bold text-slate-200 text-sm">1. Join GIMPS (Mersenne.org)</h4>
                <p class="text-slate-400 mt-2 leading-relaxed">
                  Download free software (Prime95 or GpuOwl). GIMPS assigns your PC or GPU a specific exponent like \(p = 140,000,000\) that no one on Earth has tested. If it passes, <strong>you become the official world record holder</strong>.
                </p>
              </div>
              <div class="text-[11px] font-mono text-cyan-400 pt-2 border-t border-slate-800">
                Prize: $150k - $250k EFF Bounty
              </div>
            </div>

            <!-- Method 2: PrimeGrid -->
            <div class="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-2xl">🌐</span>
                  <span class="badge-cyan">Daily Discoveries</span>
                </div>
                <h4 class="font-bold text-slate-200 text-sm">2. Join PrimeGrid (BOINC)</h4>
                <p class="text-slate-400 mt-2 leading-relaxed">
                  PrimeGrid tests Proth numbers (\(k \cdot 2^n + 1\)) and Sophie Germain primes. Everyday volunteers discover recognized 1-million to 5-million digit primes almost <strong>every single month</strong> and get their names listed on the UTM Top-5000 Prime Database.
                </p>
              </div>
              <div class="text-[11px] font-mono text-cyan-400 pt-2 border-t border-slate-800">
                Prize: Official Database Credit
              </div>
            </div>

            <!-- Method 3: Cloud GPU Hunting -->
            <div class="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-2xl">🚀</span>
                  <span class="badge-purple">Luke Durant Method</span>
                </div>
                <h4 class="font-bold text-slate-200 text-sm">3. Cloud GPU Clusters</h4>
                <p class="text-slate-400 mt-2 leading-relaxed">
                  Rent spot instances of NVIDIA GPUs (like A100s or H100s) on cloud providers. Run Fast Fourier Transform squaring scripts to test hundreds of candidates per week at datacenter speeds.
                </p>
              </div>
              <div class="text-[11px] font-mono text-cyan-400 pt-2 border-t border-slate-800">
                Speed: 1000× faster than a home CPU
              </div>
            </div>

          </div>
        </div>

        <!-- CHAPTER 1: THE CHOCOLATE BOX ANALOGY -->
        <div class="forge-card p-6 border-slate-700">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xl">🍫</span>
            <h3 class="text-lg font-bold text-slate-100">Quick Reminder: What is a Prime? (The Chocolate Box Rule)</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 text-sm text-slate-300 font-sans">
            <div class="md:col-span-6 space-y-3">
              <p>
                Imagine you have some chocolates. You want to arrange them into a neat rectangular box (like 2 rows of 3, or 3 rows of 4).
              </p>
              <ul class="space-y-1.5 list-disc list-inside text-xs text-slate-300">
                <li>If you have <strong>6 chocolates</strong>: You can make a neat 2×3 box. (Not prime!)</li>
                <li>If you have <strong>8 chocolates</strong>: You can make a neat 2×4 box. (Not prime!)</li>
                <li>If you have <strong>7 chocolates</strong>: No matter what you try, you <strong>cannot</strong> make a neat rectangle without leftover loose chocolates!</li>
              </ul>
              <p class="text-cyan-300 text-xs font-bold font-mono">
                👉 Primes are numbers that cannot be split into equal groups!
              </p>
            </div>

            <!-- Interactive Chocolate Grid -->
            <div class="md:col-span-6 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs text-slate-400 font-mono">Try with any number:</span>
                <div class="flex items-center gap-2">
                  <input id="simple-choco-input" type="number" value="7" min="2" max="30" class="w-16 bg-slate-900 border border-slate-700 text-center text-cyan-300 font-bold rounded p-1 text-xs">
                  <span id="simple-choco-verdict" class="badge-emerald text-[11px]">Prime! (Only 1 Row)</span>
                </div>
              </div>

              <!-- Grid display area -->
              <div id="simple-choco-display" class="min-h-24 p-3 bg-slate-900/60 rounded-lg flex flex-wrap gap-1.5 items-center justify-center">
                <!-- Chocolates rendered here -->
              </div>
              <div class="text-[11px] text-slate-500 text-center mt-2 font-mono" id="simple-choco-note">
                7 items cannot form a 2-row, 3-row, or 4-row rectangle.
              </div>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  updateChocoGrid(n) {
    const num = Math.min(30, Math.max(2, Number(n)));
    const display = document.getElementById('simple-choco-display');
    const verdict = document.getElementById('simple-choco-verdict');
    const note = document.getElementById('simple-choco-note');
    if (!display || !verdict || !note) return;

    let isPrime = true;
    let factor = null;
    for (let i = 2; i * i <= num; i++) {
      if (num % i === 0) {
        isPrime = false;
        factor = i;
        break;
      }
    }

    if (isPrime) {
      verdict.className = 'badge-emerald text-[11px]';
      verdict.innerText = '★ Prime! (Only 1 straight line)';
      note.innerText = `${num} chocolates cannot form any equal rectangle (like 2-row, 3-row, etc.)`;
    } else {
      verdict.className = 'badge-rose text-[11px]';
      verdict.innerText = `✗ Composite (${factor} × ${num / factor} Box)`;
      note.innerText = `${num} chocolates can form a neat ${factor} by ${num / factor} rectangle!`;
    }

    let html = '';
    for (let i = 1; i <= num; i++) {
      html += `
        <div class="w-8 h-8 rounded-lg ${isPrime ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-200' : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'} flex items-center justify-center font-mono font-bold text-xs shadow">
          ${i}
        </div>
      `;
    }
    display.innerHTML = html;
  }

  forgePersonalPrime() {
    const statusEl = document.getElementById('hunt-status');
    const timeEl = document.getElementById('hunt-time');
    const txtArea = document.getElementById('hunt-prime-val');
    const btn = document.getElementById('btn-hunt-unique');

    if (btn) btn.innerText = '⏳ Searching...';
    if (statusEl) statusEl.innerText = 'Filtering candidates...';

    const start = performance.now();

    setTimeout(() => {
      // Generate random 100-digit prime
      // 100 decimal digits ~ 332 bits
      const bits = 332;
      const bytes = Math.ceil(bits / 8);
      let found = null;
      let attempts = 0;

      while (!found && attempts < 500) {
        attempts++;
        const arr = new Uint8Array(bytes);
        for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256);
        arr[0] |= 0x80;
        arr[bytes - 1] |= 0x01; // Odd
        
        let hex = '';
        for (const b of arr) hex += b.toString(16).padStart(2, '0');
        const cand = BigInt('0x' + hex);

        if (cand % 3n !== 0n && cand % 5n !== 0n && cand % 7n !== 0n && cand % 11n !== 0n) {
          if (isMillerRabin(cand, 15)) {
            found = cand;
            break;
          }
        }
      }

      const elapsed = (performance.now() - start).toFixed(1);

      if (found) {
        txtArea.value = found.toString();
        statusEl.innerText = '✓ Fresh Prime Discovered!';
        timeEl.innerText = `${elapsed} ms (${attempts} candidates tested)`;
        sound.playPrimeDiscovered(100);
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#fbbf24', '#a855f7']
        });
      }

      if (btn) btn.innerText = '⚡ Forge Another Prime';
    }, 50);
  }

  bindEvents() {
    document.getElementById('simple-choco-input')?.addEventListener('input', (e) => {
      this.updateChocoGrid(e.target.value);
    });

    document.getElementById('btn-hunt-unique')?.addEventListener('click', () => {
      this.forgePersonalPrime();
    });

    document.getElementById('btn-copy-unique')?.addEventListener('click', () => {
      const val = document.getElementById('hunt-prime-val').value;
      if (!val) return;
      navigator.clipboard.writeText(val).then(() => {
        const btn = document.getElementById('btn-copy-unique');
        btn.innerText = '✓ Copied!';
        setTimeout(() => { btn.innerText = '📋 Copy Number'; }, 1500);
      });
    });

    // Auto-generate one initial prime on load
    this.forgePersonalPrime();
  }
}
