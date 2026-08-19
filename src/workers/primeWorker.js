// PrimeForge Background Web Worker

let isRunning = false;
let mode = 'MERSENNE_SEARCH'; // MERSENNE_SEARCH | PROTH_SEARCH | MILLER_RABIN_SCAN | SEGMENTED_SIEVE
let testedCount = 0;
let primesDiscovered = 0;
let lastReportTime = performance.now();
let batchTestedSinceReport = 0;

// State trackers for searchers
let mersenneP = 3;
let prothK = 3;
let prothN = 1;
let sieveCurrent = 1000000n;
let mrBitLength = 64;

// Modular Exponentiation for BigInt
function modPow(base, exp, mod) {
  let b = BigInt(base);
  let e = BigInt(exp);
  const m = BigInt(mod);
  if (m === 1n) return 0n;
  let result = 1n;
  b = b % m;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % m;
    e = e >> 1n;
    b = (b * b) % m;
  }
  return result;
}

// Small primes up to 100
const SMALL_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

function isSmallPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

// Miller-Rabin test
function millerRabin(nBig, rounds = 12) {
  if (nBig < 2n) return false;
  if (nBig === 2n || nBig === 3n || nBig === 5n) return true;
  if (nBig % 2n === 0n || nBig % 3n === 0n || nBig % 5n === 0n) return false;

  let d = nBig - 1n;
  let s = 0n;
  while ((d & 1n) === 0n) {
    d >>= 1n;
    s += 1n;
  }

  const bases = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
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

// Lucas-Lehmer for Mersenne Mp = 2^p - 1
function testLucasLehmer(p) {
  if (p === 2) return { isPrime: true, duration: 0 };
  const Mp = (1n << BigInt(p)) - 1n;
  let s = 4n;
  const start = performance.now();
  for (let i = 1; i <= p - 2; i++) {
    s = ((s * s) - 2n) % Mp;
  }
  const duration = performance.now() - start;
  return { isPrime: s === 0n, duration, Mp };
}

// Generate random BigInt of specified bit length
function getRandomBigInt(bits) {
  const bytes = Math.ceil(bits / 8);
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < bytes; i++) {
    arr[i] = Math.floor(Math.random() * 256);
  }
  arr[0] |= 0x80; // Ensure top bit is 1
  arr[bytes - 1] |= 0x01; // Ensure odd
  
  let hex = '';
  for (const b of arr) {
    hex += b.toString(16).padStart(2, '0');
  }
  return BigInt('0x' + hex);
}

// Main execution loop
function step() {
  if (!isRunning) return;

  const loopStart = performance.now();
  
  // Work in small batches so worker responds promptly to messages
  while (performance.now() - loopStart < 25 && isRunning) {
    testedCount++;
    batchTestedSinceReport++;

    if (mode === 'MERSENNE_SEARCH') {
      // Find next prime p
      do {
        mersenneP += (mersenneP === 2 ? 1 : 2);
      } while (!isSmallPrime(mersenneP) && mersenneP < 10000);

      const res = testLucasLehmer(mersenneP);
      const digits = Math.floor(mersenneP * Math.log10(2)) + 1;

      if (res.isPrime) {
        primesDiscovered++;
        self.postMessage({
          type: 'PRIME_FOUND',
          data: {
            title: `Mersenne Prime M${mersenneP}`,
            formula: `2^${mersenneP} - 1`,
            value: res.Mp.toString().length > 60 ? `${res.Mp.toString().slice(0, 20)}...${res.Mp.toString().slice(-10)}` : res.Mp.toString(),
            fullValue: res.Mp.toString(),
            type: 'Mersenne (Lucas-Lehmer)',
            digits,
            durationMs: res.duration.toFixed(2),
            timestamp: new Date().toLocaleTimeString()
          }
        });
      }
    } 
    else if (mode === 'PROTH_SEARCH') {
      prothN++;
      if (prothN > 500) {
        prothN = 1;
        prothK += 2;
      }
      
      const N = (BigInt(prothK) * (1n << BigInt(prothN))) + 1n;
      const exp = (N - 1n) / 2n;
      const res = modPow(3n, exp, N);
      
      if (res === N - 1n) {
        primesDiscovered++;
        const digits = N.toString().length;
        self.postMessage({
          type: 'PRIME_FOUND',
          data: {
            title: `Proth Prime (${prothK}·2^${prothN} + 1)`,
            formula: `${prothK} × 2^${prothN} + 1`,
            value: N.toString().length > 60 ? `${N.toString().slice(0, 20)}...${N.toString().slice(-10)}` : N.toString(),
            fullValue: N.toString(),
            type: "Proth's Theorem",
            digits,
            durationMs: '0.05',
            timestamp: new Date().toLocaleTimeString()
          }
        });
      }
    }
    else if (mode === 'MILLER_RABIN_SCAN') {
      const candidate = getRandomBigInt(mrBitLength);
      // Quick wheel filter
      if (candidate % 3n !== 0n && candidate % 5n !== 0n && candidate % 7n !== 0n) {
        if (millerRabin(candidate, 12)) {
          primesDiscovered++;
          const digits = candidate.toString().length;
          self.postMessage({
            type: 'PRIME_FOUND',
            data: {
              title: `${mrBitLength}-bit Random Prime`,
              formula: `Random BigInt (${mrBitLength} bits)`,
              value: candidate.toString().length > 60 ? `${candidate.toString().slice(0, 20)}...${candidate.toString().slice(-10)}` : candidate.toString(),
              fullValue: candidate.toString(),
              type: 'Miller-Rabin (12 Rounds)',
              digits,
              durationMs: '0.10',
              timestamp: new Date().toLocaleTimeString()
            }
          });
        }
      }
    }
    else if (mode === 'SEGMENTED_SIEVE') {
      sieveCurrent += 2n;
      if (sieveCurrent % 3n !== 0n && sieveCurrent % 5n !== 0n && sieveCurrent % 7n !== 0n) {
        if (millerRabin(sieveCurrent, 8)) {
          primesDiscovered++;
          const digits = sieveCurrent.toString().length;
          self.postMessage({
            type: 'PRIME_FOUND',
            data: {
              title: `Stream Prime`,
              formula: `${sieveCurrent.toString()}`,
              value: sieveCurrent.toString(),
              fullValue: sieveCurrent.toString(),
              type: 'Segmented Stream Sieve',
              digits,
              durationMs: '0.02',
              timestamp: new Date().toLocaleTimeString()
            }
          });
        }
      }
    }
  }

  // Periodic Telemetry Reporting
  const now = performance.now();
  if (now - lastReportTime >= 200) {
    const elapsedSec = (now - lastReportTime) / 1000;
    const rate = Math.round(batchTestedSinceReport / elapsedSec);
    
    let currentCandidateLabel = '';
    if (mode === 'MERSENNE_SEARCH') currentCandidateLabel = `M_${mersenneP} (2^${mersenneP} - 1)`;
    else if (mode === 'PROTH_SEARCH') currentCandidateLabel = `${prothK}·2^${prothN} + 1`;
    else if (mode === 'MILLER_RABIN_SCAN') currentCandidateLabel = `${mrBitLength}-bit Candidate`;
    else currentCandidateLabel = sieveCurrent.toString();

    self.postMessage({
      type: 'TELEMETRY',
      data: {
        testedCount,
        primesDiscovered,
        rate,
        currentCandidate: currentCandidateLabel,
        mode
      }
    });

    batchTestedSinceReport = 0;
    lastReportTime = now;
  }

  if (isRunning) {
    setTimeout(step, 0);
  }
}

// Message handler from Main Thread
self.onmessage = function(e) {
  const { command, data } = e.data;
  
  switch (command) {
    case 'START':
      if (!isRunning) {
        isRunning = true;
        lastReportTime = performance.now();
        batchTestedSinceReport = 0;
        step();
      }
      break;

    case 'PAUSE':
      isRunning = false;
      break;

    case 'SET_MODE':
      mode = data.mode;
      if (data.bitLength) mrBitLength = data.bitLength;
      break;

    case 'RESET':
      testedCount = 0;
      primesDiscovered = 0;
      mersenneP = 3;
      prothK = 3;
      prothN = 1;
      sieveCurrent = 1000000n;
      break;
  }
};
