// PrimeForge Mathematical Engine & BigInt Primality Utilities

/**
 * Fast Modular Exponentiation: (base^exp) mod mod using BigInt
 */
export function modPow(base, exp, mod) {
  let b = BigInt(base);
  let e = BigInt(exp);
  let m = BigInt(mod);
  
  if (m === 1n) return 0n;
  let result = 1n;
  b = b % m;
  
  while (e > 0n) {
    if (e & 1n) {
      result = (result * b) % m;
    }
    e = e >> 1n;
    b = (b * b) % m;
  }
  return result;
}

/**
 * Lucas-Lehmer Primality Test for Mersenne number M_p = 2^p - 1
 * Returns { isPrime, steps, durationMs, finalResidue }
 */
export function lucasLehmerTest(p, maxRecordSteps = 50) {
  const startTime = performance.now();
  const pInt = Number(p);
  
  if (pInt === 2) {
    return { isPrime: true, p: 2, digits: 1, durationMs: performance.now() - startTime, steps: [{ i: 0, s: 4n }] };
  }
  
  const Mp = (1n << BigInt(pInt)) - 1n;
  let s = 4n;
  const recordedSteps = [{ i: 0, s: 4n }];
  
  for (let i = 1; i <= pInt - 2; i++) {
    s = ((s * s) - 2n) % Mp;
    if (i <= maxRecordSteps || i === pInt - 2) {
      recordedSteps.push({ i, s: s > 1000000000000n ? `${s.toString().slice(0, 16)}...` : s });
    }
  }
  
  const isPrime = s === 0n;
  const digits = Math.floor((pInt * Math.log10(2))) + 1;
  const durationMs = performance.now() - startTime;
  
  return {
    isPrime,
    p: pInt,
    MpStr: Mp.toString().length > 80 ? `${Mp.toString().slice(0, 30)}... [${digits} digits] ...${Mp.toString().slice(-20)}` : Mp.toString(),
    digits,
    durationMs,
    steps: recordedSteps,
    finalResidue: s
  };
}

/**
 * Small Primes for initial trial division filtering
 */
export const SMALL_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

/**
 * Wheel Factorization Filter (Wheel 2, 3, 5)
 * Returns false if candidate is divisible by 2, 3, or 5
 */
export function wheel235Pass(n) {
  const nBig = BigInt(n);
  if (nBig <= 5n) return nBig === 2n || nBig === 3n || nBig === 5n;
  if (nBig % 2n === 0n || nBig % 3n === 0n || nBig % 5n === 0n) return false;
  return true;
}

/**
 * Small Prime Divisor Quick Check
 */
export function smallPrimeCheck(nBig) {
  for (const p of SMALL_PRIMES) {
    const pBig = BigInt(p);
    if (nBig === pBig) return { isPrime: true };
    if (nBig % pBig === 0n) return { isPrime: false, factor: p };
  }
  return { passed: true };
}

/**
 * Miller-Rabin Probabilistic Primality Test for BigInt
 */
export function isMillerRabin(n, rounds = 15) {
  let nBig = BigInt(n);
  if (nBig < 2n) return false;
  if (nBig === 2n || nBig === 3n || nBig === 5n) return true;
  if (nBig % 2n === 0n) return false;

  // Factor n - 1 as 2^s * d
  let d = nBig - 1n;
  let s = 0n;
  while ((d & 1n) === 0n) {
    d >>= 1n;
    s += 1n;
  }

  const bases = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
  const testCount = Math.min(rounds, bases.length);

  for (let i = 0; i < testCount; i++) {
    const a = bases[i];
    if (a >= nBig) break;
    let x = modPow(a, d, nBig);

    if (x === 1n || x === nBig - 1n) continue;

    let composite = true;
    for (let r = 1n; r < s; r++) {
      x = (x * x) % nBig;
      if (x === nBig - 1n) {
        composite = false;
        break;
      }
    }
    if (composite) return false;
  }
  return true;
}

/**
 * Proth's Theorem Primality Test
 * For N = k * 2^n + 1 where k is odd and 2^n > k:
 * If there exists an integer 'a' such that a^((N-1)/2) = -1 (mod N), then N is prime!
 */
export function testProthPrime(k, n) {
  const kBig = BigInt(k);
  const nBig = BigInt(n);
  const N = (kBig * (1n << nBig)) + 1n;
  const exp = (N - 1n) / 2n;

  // Test candidate bases a = 3, 5, 7, 10
  const candidateBases = [3n, 5n, 7n, 10n];
  for (const a of candidateBases) {
    const res = modPow(a, exp, N);
    if (res === N - 1n) {
      return { isPrime: true, N, baseFound: a, digits: N.toString().length };
    }
  }
  return { isPrime: false, N, digits: N.toString().length };
}

/**
 * Euler Polynomial Value: n^2 + n + 41
 */
export function eulerPolynomial(n) {
  const nBig = BigInt(n);
  const val = (nBig * nBig) + nBig + 41n;
  return {
    n,
    val,
    isPrime: isMillerRabin(val, 10)
  };
}

/**
 * Calculate FFT vs Schoolbook Multiplication Complexity Benchmark
 */
export function calculateMultiplicationComplexity(digitCount) {
  const N = Number(digitCount);
  // Schoolbook O(N^2)
  const schoolbookOps = N <= 100000 ? Math.pow(N, 2) : Infinity;
  // Karatsuba O(N^1.585)
  const karatsubaOps = Math.pow(N, 1.585);
  // Schönhage-Strassen / FFT O(N log N log log N)
  const fftOps = N * Math.log2(N) * Math.log2(Math.log2(Math.max(N, 4)));

  return {
    digits: N,
    schoolbookOps: schoolbookOps === Infinity ? "Trillions+ (Uncomputable in lifetime)" : Math.round(schoolbookOps).toLocaleString(),
    karatsubaOps: Math.round(karatsubaOps).toLocaleString(),
    fftOps: Math.round(fftOps).toLocaleString(),
    speedupRatio: (Math.pow(N, 2) / fftOps).toFixed(1)
  };
}
