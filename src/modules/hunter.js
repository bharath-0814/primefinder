// PrimeForge Live Background Hunter Module

import { sound } from '../utils/audio.js';
import confetti from 'canvas-confetti';
import Chart from 'chart.js/auto';

export class HunterModule {
  constructor() {
    this.worker = null;
    this.isRunning = true;
    this.currentMode = 'MERSENNE_SEARCH';
    this.mrBits = 128;
    this.discoveredPrimes = [];
    this.rateHistory = [];
    this.chart = null;
    this.maxLogLines = 80;
  }

  init() {
    this.renderContainer();
    this.initChart();
    this.initWorker();
    this.bindEvents();
  }

  renderContainer() {
    const container = document.getElementById('tab-hunter');
    container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Top Control & Status Row -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <!-- Speedometer Card -->
          <div class="forge-card p-5 flex flex-col justify-between border-cyan-500/30">
            <div class="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>SCAN THROUGHPUT</span>
              <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            </div>
            <div class="my-3">
              <div class="text-3xl font-black font-mono text-cyan-300" id="hunter-rate">0</div>
              <div class="text-xs text-slate-400">candidates tested / sec</div>
            </div>
            <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div id="rate-bar" class="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-300" style="width: 10%"></div>
            </div>
          </div>

          <!-- Total Tested Card -->
          <div class="forge-card p-5 flex flex-col justify-between">
            <div class="text-xs text-slate-400 font-mono">TOTAL CANDIDATES PROCESSED</div>
            <div class="my-3">
              <div class="text-3xl font-black font-mono text-slate-100" id="hunter-tested">0</div>
              <div class="text-xs text-slate-400">Lucas-Lehmer & Probabilistic tests</div>
            </div>
            <div class="text-[11px] font-mono text-slate-500 truncate" id="hunter-current-candidate">
              Testing: Initializing...
            </div>
          </div>

          <!-- Primes Discovered Card -->
          <div class="forge-card p-5 flex flex-col justify-between border-amber-500/20">
            <div class="text-xs text-slate-400 font-mono">CONFIRMED PRIMES FOUND</div>
            <div class="my-3 flex items-baseline gap-2">
              <div class="text-3xl font-black font-mono text-amber-300" id="hunter-found-count">0</div>
              <span class="text-xs text-amber-400/80 font-mono">verified</span>
            </div>
            <div class="flex items-center gap-2">
              <button id="btn-export-primes" class="text-[11px] font-mono text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition">
                📥 Export JSON
              </button>
              <button id="btn-clear-primes" class="text-[11px] font-mono text-slate-400 hover:text-rose-400 px-2 py-1 transition">
                Clear List
              </button>
            </div>
          </div>

          <!-- Engine Controls Card -->
          <div class="forge-card p-5 flex flex-col justify-between bg-slate-900/90">
            <div class="text-xs text-slate-400 font-mono">WORKER ENGINE STATUS</div>
            <div class="my-2 flex items-center gap-2">
              <button id="btn-toggle-hunter" class="btn-primary w-full text-xs py-2">
                <span id="hunter-btn-icon">⏸</span>
                <span id="hunter-btn-text">Pause Engine</span>
              </button>
            </div>
            <div class="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Mode:</span>
              <span id="hunter-mode-badge" class="badge-cyan">Mersenne Search</span>
            </div>
          </div>

        </div>

        <!-- Algorithm Mode Selector Bar -->
        <div class="forge-card p-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono uppercase tracking-wider text-slate-400">Search Strategy:</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 max-w-3xl">
              <button data-mode="MERSENNE_SEARCH" class="mode-btn active">
                <div class="font-bold text-xs">Mersenne Exponents</div>
                <div class="text-[10px] text-slate-400 font-mono">Lucas-Lehmer (2^p - 1)</div>
              </button>
              <button data-mode="PROTH_SEARCH" class="mode-btn">
                <div class="font-bold text-xs">Proth Numbers</div>
                <div class="text-[10px] text-slate-400 font-mono">k · 2^n + 1</div>
              </button>
              <button data-mode="MILLER_RABIN_SCAN" class="mode-btn">
                <div class="font-bold text-xs">Random Multi-Digit</div>
                <div class="text-[10px] text-slate-400 font-mono">Miller-Rabin Fast Scan</div>
              </button>
              <button data-mode="SEGMENTED_SIEVE" class="mode-btn">
                <div class="font-bold text-xs">Streaming Sieve</div>
                <div class="text-[10px] text-slate-400 font-mono">Continuous Stream</div>
              </button>
            </div>

            <!-- Bit Selector for Miller-Rabin -->
            <div id="mr-bit-selector" class="hidden flex items-center gap-2 text-xs font-mono">
              <span class="text-slate-400">Bits:</span>
              <select id="mr-bits" class="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1">
                <option value="64">64-bit (~19 digits)</option>
                <option value="128" selected>128-bit (~39 digits)</option>
                <option value="256">256-bit (~77 digits)</option>
                <option value="512">512-bit (~154 digits)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Middle Row: Discovered Primes Table & Live Throughput Chart -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Live Discovered Primes Table (7 cols) -->
          <div class="lg:col-span-7 forge-card flex flex-col">
            <div class="forge-card-header">
              <div class="flex items-center gap-2">
                <span class="text-amber-400 text-base">★</span>
                <h2 class="text-sm font-semibold text-slate-200">Live Discovered Primes Feed</h2>
              </div>
              <span class="text-xs font-mono text-slate-400">Click any prime for details</span>
            </div>
            
            <div class="forge-card-body p-0 flex-1 flex flex-col">
              <div class="overflow-x-auto max-h-[380px] overflow-y-auto">
                <table class="w-full text-left text-xs font-mono">
                  <thead class="bg-slate-900/80 text-slate-400 border-b border-slate-800 sticky top-0">
                    <tr>
                      <th class="p-3">Time</th>
                      <th class="p-3">Formula / Value</th>
                      <th class="p-3">Digits</th>
                      <th class="p-3">Method</th>
                      <th class="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody id="primes-table-body" class="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td colspan="5" class="p-6 text-center text-slate-500 font-sans">
                        Engine is active. Primes discovered will populate here in real-time...
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Live Chart & Telemetry (5 cols) -->
          <div class="lg:col-span-5 forge-card flex flex-col">
            <div class="forge-card-header">
              <h2 class="text-sm font-semibold text-slate-200">Throughput Dynamics (ops/sec)</h2>
              <span class="text-[11px] font-mono text-cyan-400">Live 60s Window</span>
            </div>
            <div class="forge-card-body flex-1 flex flex-col justify-between">
              <div class="h-44 w-full relative">
                <canvas id="rateChart"></canvas>
              </div>
              <div class="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                <div>
                  <span class="text-slate-500">Peak Rate:</span>
                  <span id="stat-peak-rate" class="text-slate-200 font-bold ml-1">0</span> ops/s
                </div>
                <div>
                  <span class="text-slate-500">Thread Count:</span>
                  <span class="text-cyan-400 font-bold ml-1">Dedicated Worker</span>
                </div>
                <div>
                  <span class="text-slate-500">Avg Test Time:</span>
                  <span id="stat-avg-time" class="text-slate-200 font-bold ml-1">< 1 ms</span>
                </div>
                <div>
                  <span class="text-slate-500">Background State:</span>
                  <span class="text-emerald-400 font-bold ml-1">Non-blocking UI</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Bottom Row: Terminal Raw Activity Log -->
        <div class="terminal-window">
          <div class="terminal-header">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block"></span>
              <span class="ml-2 font-mono text-[11px] text-slate-300">PRIMEFORGE_ENGINE_LOGS_v2.0</span>
            </div>
            <button id="btn-clear-log" class="hover:text-slate-200 transition text-[11px]">Clear Console</button>
          </div>
          <div id="terminal-stream" class="terminal-body">
            <div class="text-cyan-400">[SYSTEM] Worker thread spawned. BigInt modular engine online.</div>
            <div class="text-slate-400">[SYSTEM] Initializing background Mersenne search using Lucas-Lehmer test...</div>
          </div>
        </div>

      </div>

      <!-- Prime Detail Modal -->
      <div id="prime-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="forge-card max-w-2xl w-full bg-slate-900 border-cyan-500/40 shadow-2xl">
          <div class="forge-card-header">
            <h3 id="modal-prime-title" class="font-bold text-base text-cyan-300">Prime Details</h3>
            <button id="btn-close-modal" class="text-slate-400 hover:text-white text-lg">✕</button>
          </div>
          <div class="forge-card-body space-y-4 text-xs font-mono">
            <div>
              <span class="text-slate-400 block mb-1">Mathematical Formula:</span>
              <div id="modal-prime-formula" class="text-base text-slate-100 font-bold bg-slate-950 p-2.5 rounded border border-slate-800"></div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-slate-400">Total Digits:</span>
                <div id="modal-prime-digits" class="text-slate-200 font-bold text-sm"></div>
              </div>
              <div>
                <span class="text-slate-400">Proof Method:</span>
                <div id="modal-prime-method" class="text-cyan-400 font-bold text-sm"></div>
              </div>
            </div>
            <div>
              <span class="text-slate-400 block mb-1">Full Value (Decimal):</span>
              <textarea id="modal-prime-value" readonly class="w-full h-32 bg-slate-950 border border-slate-800 text-slate-300 p-2.5 rounded font-mono text-xs focus:outline-none select-all"></textarea>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button id="btn-copy-modal-prime" class="btn-primary text-xs">
                📋 Copy Value
              </button>
              <button id="btn-close-modal-2" class="btn-secondary text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.applyModeBtnStyles();
  }

  applyModeBtnStyles() {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      .mode-btn {
        padding: 0.625rem 0.875rem;
        border-radius: 0.5rem;
        background: #0f172a;
        border: 1px solid #1e293b;
        color: #cbd5e1;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .mode-btn:hover {
        border-color: #38bdf8;
        background: #1e293b;
      }
      .mode-btn.active {
        background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.15));
        border-color: #06b6d4;
        color: #38bdf8;
        box-shadow: 0 0 12px rgba(6, 182, 212, 0.2);
      }
    `;
    document.head.appendChild(styleEl);
  }

  initChart() {
    const ctx = document.getElementById('rateChart');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array(25).fill(''),
        datasets: [{
          label: 'Ops / Sec',
          data: Array(25).fill(0),
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.12)',
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (c) => `${c.parsed.y} ops/sec`
            }
          }
        },
        scales: {
          x: { display: false },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(51, 65, 85, 0.25)' },
            ticks: {
              color: '#64748b',
              font: { family: 'Fira Code', size: 10 }
            }
          }
        }
      }
    });
  }

  initWorker() {
    try {
      this.worker = new Worker(new URL('../workers/primeWorker.js', import.meta.url), { type: 'module' });
      
      this.worker.onmessage = (e) => {
        const { type, data } = e.data;
        if (type === 'TELEMETRY') {
          this.handleTelemetry(data);
        } else if (type === 'PRIME_FOUND') {
          this.handlePrimeFound(data);
        }
      };

      // Start worker immediately
      this.worker.postMessage({ command: 'START' });
      this.worker.postMessage({ command: 'SET_MODE', data: { mode: this.currentMode } });
    } catch (err) {
      console.error('Failed to initialize WebWorker:', err);
      this.logTerminal(`[ERROR] Worker initialization error: ${err.message}`, 'text-rose-400');
    }
  }

  handleTelemetry(data) {
    document.getElementById('hunter-rate').innerText = data.rate.toLocaleString();
    document.getElementById('hunter-tested').innerText = data.testedCount.toLocaleString();
    document.getElementById('hunter-current-candidate').innerText = `Testing: ${data.currentCandidate}`;
    document.getElementById('global-rate').innerText = data.rate.toLocaleString();

    // Update Progress bar maxing out around 10,000 ops/s
    const pct = Math.min(100, Math.max(5, (data.rate / 5000) * 100));
    const rateBar = document.getElementById('rate-bar');
    if (rateBar) rateBar.style.width = `${pct}%`;

    // Update Chart
    if (this.chart) {
      this.chart.data.datasets[0].data.shift();
      this.chart.data.datasets[0].data.push(data.rate);
      this.chart.update('none');

      const maxRate = Math.max(...this.chart.data.datasets[0].data);
      const peakEl = document.getElementById('stat-peak-rate');
      if (peakEl && maxRate > 0) peakEl.innerText = maxRate.toLocaleString();
    }
  }

  handlePrimeFound(prime) {
    this.discoveredPrimes.unshift(prime);
    
    // Update global counters
    document.getElementById('hunter-found-count').innerText = this.discoveredPrimes.length;
    document.getElementById('global-primes-found').innerText = this.discoveredPrimes.length;

    // Trigger audio & confetti for special primes
    sound.playPrimeDiscovered(prime.digits);
    if (prime.digits >= 10) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#06b6d4', '#fbbf24', '#818cf8']
      });
    }

    // Add row to table
    this.renderPrimesTable();

    // Log to terminal
    this.logTerminal(`★ [DISCOVERY] Found ${prime.title} (${prime.digits} digits) in ${prime.durationMs}ms`, 'text-amber-300 font-bold');
  }

  renderPrimesTable() {
    const tbody = document.getElementById('primes-table-body');
    if (!tbody) return;

    if (this.discoveredPrimes.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="p-6 text-center text-slate-500 font-sans">
            Engine is active. Primes discovered will populate here in real-time...
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = this.discoveredPrimes.slice(0, 30).map((p, idx) => `
      <tr class="hover:bg-slate-800/40 transition cursor-pointer" data-prime-idx="${idx}">
        <td class="p-3 text-slate-500">${p.timestamp}</td>
        <td class="p-3 text-cyan-300 font-semibold truncate max-w-xs">${p.formula || p.value}</td>
        <td class="p-3 text-amber-300 font-bold">${p.digits.toLocaleString()}</td>
        <td class="p-3 text-slate-400">${p.type}</td>
        <td class="p-3 text-right">
          <button class="text-slate-400 hover:text-cyan-300 p-1 font-mono text-[11px] bg-slate-800 rounded px-2" data-view-idx="${idx}">
            View
          </button>
        </td>
      </tr>
    `).join('');

    // Attach click listeners for modal
    tbody.querySelectorAll('tr[data-prime-idx]').forEach(row => {
      row.addEventListener('click', () => {
        const idx = Number(row.getAttribute('data-prime-idx'));
        this.openPrimeModal(this.discoveredPrimes[idx]);
      });
    });
  }

  openPrimeModal(prime) {
    if (!prime) return;
    document.getElementById('modal-prime-title').innerText = prime.title;
    document.getElementById('modal-prime-formula').innerText = prime.formula;
    document.getElementById('modal-prime-digits').innerText = `${prime.digits.toLocaleString()} decimal digits`;
    document.getElementById('modal-prime-method').innerText = prime.type;
    document.getElementById('modal-prime-value').value = prime.fullValue || prime.value;
    
    document.getElementById('prime-modal').classList.remove('hidden');
  }

  closePrimeModal() {
    document.getElementById('prime-modal').classList.add('hidden');
  }

  logTerminal(msg, className = 'text-slate-400') {
    const stream = document.getElementById('terminal-stream');
    if (!stream) return;

    const line = document.createElement('div');
    line.className = className;
    line.innerText = msg;
    stream.appendChild(line);

    while (stream.children.length > this.maxLogLines) {
      stream.removeChild(stream.firstChild);
    }
    stream.scrollTop = stream.scrollHeight;
  }

  bindEvents() {
    // Start / Pause
    const toggleBtn = document.getElementById('btn-toggle-hunter');
    toggleBtn.addEventListener('click', () => {
      this.isRunning = !this.isRunning;
      const statusBadge = document.getElementById('global-worker-status');
      const pulse = document.getElementById('worker-pulse');
      
      if (this.isRunning) {
        this.worker.postMessage({ command: 'START' });
        document.getElementById('hunter-btn-icon').innerText = '⏸';
        document.getElementById('hunter-btn-text').innerText = 'Pause Engine';
        toggleBtn.className = 'btn-primary w-full text-xs py-2';
        statusBadge.innerText = 'Active (Background)';
        statusBadge.className = 'text-emerald-400 font-semibold';
        pulse.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse';
        this.logTerminal('[SYSTEM] Worker engine resumed.');
      } else {
        this.worker.postMessage({ command: 'PAUSE' });
        document.getElementById('hunter-btn-icon').innerText = '▶';
        document.getElementById('hunter-btn-text').innerText = 'Resume Engine';
        toggleBtn.className = 'btn-secondary w-full text-xs py-2';
        statusBadge.innerText = 'Paused';
        statusBadge.className = 'text-amber-400 font-semibold';
        pulse.className = 'w-2.5 h-2.5 rounded-full bg-amber-400';
        this.logTerminal('[SYSTEM] Worker engine paused.');
      }
    });

    // Mode Selector Buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.currentMode = btn.getAttribute('data-mode');
        const modeNames = {
          'MERSENNE_SEARCH': 'Mersenne Search',
          'PROTH_SEARCH': 'Proth Search',
          'MILLER_RABIN_SCAN': 'Miller-Rabin Fast Scan',
          'SEGMENTED_SIEVE': 'Streaming Sieve'
        };
        document.getElementById('hunter-mode-badge').innerText = modeNames[this.currentMode];

        // Toggle bit selector
        const bitSelector = document.getElementById('mr-bit-selector');
        if (this.currentMode === 'MILLER_RABIN_SCAN') {
          bitSelector.classList.remove('hidden');
        } else {
          bitSelector.classList.add('hidden');
        }

        this.worker.postMessage({
          command: 'SET_MODE',
          data: { mode: this.currentMode, bitLength: this.mrBits }
        });

        this.logTerminal(`[MODE] Switched strategy to ${modeNames[this.currentMode]}`, 'text-cyan-300');
      });
    });

    // Bit length select
    document.getElementById('mr-bits')?.addEventListener('change', (e) => {
      this.mrBits = Number(e.target.value);
      this.worker.postMessage({
        command: 'SET_MODE',
        data: { mode: this.currentMode, bitLength: this.mrBits }
      });
      this.logTerminal(`[CONFIG] Candidate size set to ${this.mrBits} bits (~${Math.floor(this.mrBits * 0.30103)} digits)`, 'text-slate-300');
    });

    // Export Primes to JSON
    document.getElementById('btn-export-primes')?.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.discoveredPrimes, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `primeforge_discoveries_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });

    // Clear primes
    document.getElementById('btn-clear-primes')?.addEventListener('click', () => {
      this.discoveredPrimes = [];
      this.renderPrimesTable();
      document.getElementById('hunter-found-count').innerText = '0';
      document.getElementById('global-primes-found').innerText = '0';
    });

    // Clear log
    document.getElementById('btn-clear-log')?.addEventListener('click', () => {
      const stream = document.getElementById('terminal-stream');
      if (stream) stream.innerHTML = '<div class="text-slate-500">[CONSOLE CLEARED]</div>';
    });

    // Modal close
    document.getElementById('btn-close-modal')?.addEventListener('click', () => this.closePrimeModal());
    document.getElementById('btn-close-modal-2')?.addEventListener('click', () => this.closePrimeModal());
    document.getElementById('btn-copy-modal-prime')?.addEventListener('click', () => {
      const val = document.getElementById('modal-prime-value').value;
      navigator.clipboard.writeText(val).then(() => {
        const btn = document.getElementById('btn-copy-modal-prime');
        btn.innerText = '✓ Copied!';
        setTimeout(() => { btn.innerText = '📋 Copy Value'; }, 1500);
      });
    });
  }
}
