// PrimeForge & PrimeNexus Mathematical Utilities for Prime Relations

import { modPow, isMillerRabin, SMALL_PRIMES } from './bigMath.js';

export { modPow, isMillerRabin, SMALL_PRIMES };

/**
 * Check if a number is a small prime or test with Miller-Rabin
 */
export function checkPrime(n) {
  const nBig = BigInt(n);
  if (nBig < 2n) return false;
  if (nBig === 2n || nBig === 3n || nBig === 5n || nBig === 7n) return true;
  if (nBig % 2n === 0n || nBig % 3n === 0n || nBig % 5n === 0n || nBig % 7n === 0n) return false;
  return isMillerRabin(nBig, 12);
}

/**
 * Goldbach Partitions Finder: Decomposes an even number 2N into prime pairs p1 + p2 = 2N
 */
export function getGoldbachPartitions(evenN, maxPairs = 30) {
  const n = Number(evenN);
  if (n <= 2 || n % 2 !== 0) return [];

  const partitions = [];
  // For small to medium numbers
  for (let p = 2; p <= n / 2; p++) {
    if (checkPrime(p)) {
      const q = n - p;
      if (checkPrime(q)) {
        partitions.push({ p, q, sum: n });
        if (partitions.length >= maxPairs) break;
      }
    }
  }
  return partitions;
}

/**
 * Sophie Germain Chain Generator: p -> 2p + 1 -> 2(2p+1) + 1 ...
 */
export function getSophieGermainChain(startP, maxLen = 10) {
  let curr = BigInt(startP);
  if (!checkPrime(curr)) return [];

  const chain = [curr];
  for (let i = 1; i < maxLen; i++) {
    curr = (2n * curr) + 1n;
    if (checkPrime(curr)) {
      chain.push(curr);
    } else {
      break;
    }
  }
  return chain;
}

/**
 * Twin Prime & Cousin Prime Finder in Range [start, end]
 */
export function findPrimePairs(start, count = 20, gap = 2) {
  let curr = BigInt(start);
  if (curr % 2n === 0n) curr += 1n;
  const gapBig = BigInt(gap);

  const pairs = [];
  let checked = 0;

  while (pairs.length < count && checked < 5000) {
    checked++;
    if (checkPrime(curr) && checkPrime(curr + gapBig)) {
      pairs.push({ p1: curr, p2: curr + gapBig, gap });
    }
    curr += 2n;
  }
  return pairs;
}

/**
 * Chebyshev Race Simulator (Primes of form 4k + 1 vs 4k + 3)
 */
export function simulateChebyshevRace(limit = 1000) {
  let count4k1 = 0;
  let count4k3 = 0;
  const history = [];

  for (let i = 3; i <= limit; i += 2) {
    if (checkPrime(i)) {
      if (i % 4 === 1) count4k1++;
      else if (i % 4 === 3) count4k3++;

      if (i % 25 === 1 || i === limit || i === 3) {
        history.push({
          p: i,
          count4k1,
          count4k3,
          diff: count4k3 - count4k1
        });
      }
    }
  }
  return { count4k1, count4k3, history, leader: count4k3 >= count4k1 ? '4k + 3 (Team Blue)' : '4k + 1 (Team Gold)' };
}

/**
 * Riemann Prime Counting Approximation Li(x) vs Pi(x)
 */
export function comparePiAndLi(x) {
  const xNum = Number(x);
  if (xNum < 2) return { pi: 0, li: 0 };

  // Count actual primes up to x
  let actualPi = 0;
  for (let i = 2; i <= xNum; i++) {
    if (checkPrime(i)) actualPi++;
  }

  // Li(x) ~ x / ln(x) + x / (ln(x))^2
  const lnX = Math.log(xNum);
  const estPi = xNum / lnX;
  const liApprox = estPi * (1 + 1 / lnX + 2 / Math.pow(lnX, 2));

  return {
    x: xNum,
    actualPi,
    estPi: Math.round(estPi),
    liApprox: Math.round(liApprox),
    accuracy: ((1 - Math.abs(actualPi - liApprox) / actualPi) * 100).toFixed(2)
  };
}
