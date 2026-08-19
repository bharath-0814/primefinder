// PrimeNexus Plain-English Relations Story Mode Module

export class StoryRelationsModule {
  constructor() {}

  init() {
    this.render();
  }

  render() {
    const container = document.getElementById('tab-story');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-8 max-w-5xl mx-auto">
        
        <!-- Hero Header -->
        <div class="forge-card p-6 sm:p-8 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-cyan-950/60 border-cyan-500/30">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">📖</span>
            <span class="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Story Mode • Human Guide</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold font-outfit text-white">
            The Hidden Music: Why Relations Between Primes Are the Secret to Finding Them
          </h2>
          <p class="text-sm text-slate-300 mt-2 leading-relaxed font-sans">
            For thousands of years, people thought prime numbers were scattered randomly like spilled sand on the floor. Modern mathematics proved the opposite: primes are nodes in a harmonious musical web.
          </p>
        </div>

        <!-- 4 Big Story Cards -->
        <div class="space-y-6">
          
          <!-- Chapter 1 -->
          <div class="forge-card p-6 border-slate-700">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-xl">🌌</span>
              <h3 class="text-lg font-bold text-slate-100">1. Why We Don't Search For Primes Randomly</h3>
            </div>
            <div class="text-xs text-slate-300 space-y-2.5 font-sans leading-relaxed">
              <p>
                Imagine trying to find a needle hidden somewhere in the Sahara Desert. If you dig random holes in the sand, you will search for trillions of years and find nothing.
              </p>
              <p>
                That is what finding a 40-million-digit prime by brute-force is like. But <strong>relationships act like a metal detector</strong>: they tell you exactly which dunes have the gold!
              </p>
            </div>
          </div>

          <!-- Chapter 2 -->
          <div class="forge-card p-6 border-indigo-500/30">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-xl">🦖</span>
              <h3 class="text-lg font-bold text-slate-100">2. The Mersenne Relation: Why $2^p - 1$ Holds Every World Record</h3>
            </div>
            <div class="text-xs text-slate-300 space-y-2.5 font-sans leading-relaxed">
              <p>
                Every world-record prime in modern history is a <strong>Mersenne prime</strong> ($2^p - 1$). Why? Because of a unique algebraic relationship discovered by Édouard Lucas:
              </p>
              <div class="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-cyan-300">
                If p is prime, 2ᵖ - 1 has a special recurring symmetry where s_i = (s_{i-1}² - 2) mod M_p proves primality in seconds!
              </div>
              <p>
                This relationship lets computers verify 41-million-digit numbers that would otherwise take billions of years.
              </p>
            </div>
          </div>

          <!-- Chapter 3 -->
          <div class="forge-card p-6 border-amber-500/30">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-xl">🔐</span>
              <h3 class="text-lg font-bold text-slate-100">3. The Sophie Germain Chain: Protecting Global Banking</h3>
            </div>
            <div class="text-xs text-slate-300 space-y-2.5 font-sans leading-relaxed">
              <p>
                In 1825, French mathematician <strong>Sophie Germain</strong> studied pairs where both \(p\) and \(2p + 1\) are prime.
              </p>
              <p>
                Today, every time you buy something online or open a banking app, the encryption algorithms rely on Sophie Germain primes because their mathematical relation makes eavesdroppers unable to factor the security keys!
              </p>
            </div>
          </div>

          <!-- Chapter 4 -->
          <div class="forge-card p-6 border-emerald-500/30">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-xl">🎵</span>
              <h3 class="text-lg font-bold text-slate-100">4. The Music of Primes (Riemann Hypothesis)</h3>
            </div>
            <div class="text-xs text-slate-300 space-y-2.5 font-sans leading-relaxed">
              <p>
                Bernhard Riemann discovered that if you graph the infinite zeros of the Zeta function, they sound like a cosmic orchestra. The harmonics of these waves dictate precisely where every prime in the universe must appear.
              </p>
            </div>
          </div>

        </div>

      </div>
    `;
  }
}
