# ℘ PrimeForge — Live Background Prime Engine & Discovery Lab

> An interactive web application that runs in the background using multithreaded Web Workers to search for primes, visualizes the journey to the 41-million-digit world record ($2^{136,279,841}-1$), and tests modern algorithmic shortcuts and 2D prime spirals.

![PrimeForge Preview](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)
![Web Workers](https://img.shields.io/badge/Web%20Workers-Multithreaded-06B6D4)
![License](https://img.shields.io/badge/License-MIT-emerald)

---

## 🌟 Key Features

1. **🌟 Plain English / Story Mode (ELI5):**
   * The Chocolate Box analogy (what primes really are).
   * Visualizing 41 million digits in books, speech, and cloud GPUs.
   * 1-Click **"⚡ Forge Unique Prime"** generator for your own 100-digit prime.
2. **⚡ Live Background Prime Hunter (Web Workers):**
   * Zero UI lag with dedicated Web Workers and native `BigInt` operations.
   * 4 search strategies: Mersenne ($2^p - 1$), Proth ($k \cdot 2^n + 1$), Miller-Rabin (64–512 bits), Streaming Sieve.
   * Real-time speedometer, dynamic Chart.js graph, discovery table, JSON export, and Web Audio API synthesizer.
3. **🦖 The 41-Million-Digit Titan ($2^{136,279,841}-1$):**
   * The story of the October 2024 world record discovered by Luke Durant (GIMPS).
   * Interactive **Lucas-Lehmer Sandbox** calculator.
   * Scale comparison against RSA-2048, universal atom counts, and the 1-Billion-digit goal.
4. **🧪 "4 Tricks & Modern Approaches" Interactive Lab:**
   * **Trick #1:** Wheel Factorization (discards 73.3% of candidates in 0 seconds).
   * **Trick #2:** Fast Fourier Transform (FFT) Big-Integer Squaring benchmark ($O(N^2)$ vs $O(N \log N)$).
   * **Trick #3:** Multi-Stage Filtering Funnel simulation.
   * **Trick #4:** Euler's Prime Polynomial ($n^2 + n + 41$).
5. **🌀 2D Ulam & Sacks Prime Spirals:**
   * 60 FPS Canvas rendering with interactive zoom, pan, and Euler curve highlighting.
6. **💰 The $250,000 EFF Bounty Quest:**
   * Wagstaff conjecture calculator and 1-Billion-digit roadmap.

---

## 🚀 Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/bharath-0814/primefinder.git

# Navigate into directory
cd primefinder

# Install dependencies
npm install

# Start local dev server
npm run dev
```

---

## ☁️ Deploy to Vercel

1. Push this repository to GitHub (`bharath-0814/primefinder`).
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Select the `primefinder` repository.
4. Framework Preset: **Vite**
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**! 🚀

---

## 📄 License
MIT License
