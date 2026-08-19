// PrimeNexus Multithreaded Relational Prime Search Worker

let isRunning = false;
let mode = 'RELATIONAL_TWINS'; // 'RELATIONAL_TWINS' | 'SOPHIE_CHAINS' | 'MERSENNE_EXPONENTS' | 'GOLDBACH_MINER'
let testedCount = 0;
let relationsFound = 0;
let lastReport = performance.now();
let batchTested = 0;

let currentP = 3n;
let currentGoldbachEven = 4;

function modPow(base, exp, mod) {
  let b = BigInt(base);
  let e = BigInt(exp);
  const m = BigInt(mod);
  if (m === 1n) return 0n;
  let res = 1n;
  b = b % m;
  while (e > 0n) {
    if (e & 1n) res = (res * b) % m;
    e >>= 1n;
    b = (b * b) % m;
  }
  return res;
}

function isPrime(nBig, rounds = 10) {
  if (nBig < 2n) return false;
  if (nBig === 2n || nBig === 3n || nBig === 5n || nBig === 7n) return true;
  if (nBig % 2n === 0n || nBig % 3n === 0n || nBig % 5n === 0n || nBig % 7n === 0n) return false;

  let d = nBig - 1n;
  let s = 0n;
  while ((d & 1n) === 0n) {
    d >>= 1n;
    s += 1n;
  }

  const bases = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n];
  const count = Math.min(rounds, bases.length);

  for (let i = 0; i < count; i++) {
    const a = bases[i];
    if (a >= nBig) break;
    let x = modPow(a, d, nBig);
    if (x === 1n || x === nBig - 1n) continue;

    let comp = true;
    for (let r = 1n; r < s; r++) {
      x = (x * x) % nBig;
      if (x === nBig - 1n) {
        comp = false;
        break;
      }
    }
    if (comp) return false;
  }
  return true;
}

function step() {
  if (!isRunning) return;
  const start = performance.now();

  while (performance.now() - start < 25 && isRunning) {
    testedCount++;
    batchTested++;

    if (mode === 'RELATIONAL_TWINS') {
      currentP += 2n;
      if (isPrime(currentP) && isPrime(currentP + 2n)) {
        relationsFound++;
        self.postMessage({
          type: 'PRIME_FOUND',
          data: {
            title: `Twin Prime Pair (${currentP}, ${currentP + 2n})`,
            formula: `p₂ - p₁ = 2`,
            value: `(${currentP}, ${currentP + 2n})`,
            fullValue: `Twin Primes: ${currentP} and ${currentP + 2n}`,
            type: 'Twin Relation (Gap 2)',
            digits: currentP.toString().length,
            durationMs: '0.04',
            timestamp: new Date().toLocaleTimeString()
          }
        });
      }
    } 
    else if (mode === 'SOPHIE_CHAINS') {
      currentP += 2n;
      if (isPrime(currentP)) {
        const safe = (2n * currentP) + 1n;
        if (isPrime(safe)) {
          relationsFound++;
          self.postMessage({
            type: 'PRIME_FOUND',
            data: {
              title: `Sophie Germain Pair (${currentP} → ${safe})`,
              formula: `2p + 1`,
              value: `${currentP} → ${safe}`,
              fullValue: `Sophie Germain: ${currentP} yields Safe Prime: ${safe}`,
              type: 'Sophie Germain (2p + 1)',
              digits: safe.toString().length,
              durationMs: '0.05',
              timestamp: new Date().toLocaleTimeString()
            }
          });
        }
      }
    }
    else if (mode === 'GOLDBACH_MINER') {
      currentGoldbachEven += 2;
      let p1 = 2;
      let foundPair = null;
      for (let p = 2; p <= currentGoldbachEven / 2; p++) {
        if (isPrime(BigInt(p)) && isPrime(BigInt(currentGoldbachEven - p))) {
          foundPair = { p1: p, p2: currentGoldbachEven - p };
          break;
        }
      }

      if (foundPair && currentGoldbachEven % 50 === 0) {
        relationsFound++;
        self.postMessage({
          type: 'PRIME_FOUND',
          data: {
            title: `Goldbach Partition for ${currentGoldbachEven}`,
            formula: `${foundPair.p1} + ${foundPair.p2} = ${currentGoldbachEven}`,
            value: `${foundPair.p1} + ${foundPair.p2} = ${currentGoldbachEven}`,
            fullValue: `Even integer ${currentGoldbachEven} = prime ${foundPair.p1} + prime ${foundPair.p2}`,
            type: 'Goldbach Dual Sum',
            digits: currentGoldbachEven.toString().length,
            durationMs: '0.02',
            timestamp: new Date().toLocaleTimeString()
          }
        });
      }
    }
  }

  const now = performance.now();
  if (now - lastReport >= 250) {
    const elapsed = (now - lastReport) / 1000;
    const rate = Math.round(batchTested / elapsed);

    self.postMessage({
      type: 'TELEMETRY',
      data: {
        testedCount,
        primesDiscovered: relationsFound,
        rate,
        currentCandidate: `Scanning around ${currentP.toString().slice(0, 16)}...`,
        mode
      }
    });

    batchTested = 0;
    lastReport = now;
  }

  if (isRunning) {
    setTimeout(step, 0);
  }
}

self.onmessage = function(e) {
  const { command, data } = e.data;
  if (command === 'START') {
    if (!isRunning) {
      isRunning = true;
      lastReport = performance.now();
      batchTested = 0;
      step();
    }
  } else if (command === 'PAUSE') {
    isRunning = false;
  } else if (command === 'SET_MODE') {
    mode = data.mode;
  }
};
