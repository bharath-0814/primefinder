// Web Audio API Synthesizer for Prime Discovery Sounds

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playPrimeDiscovered(digits = 1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') {
      this.ctx?.resume();
    }
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Create harmonic chime (Cosmic chord)
    const baseFreq = digits > 20 ? 587.33 : 440.0; // D5 or A4
    const freqs = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2.0];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + (idx * 0.04));

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + (idx * 0.04) + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (idx * 0.04) + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + (idx * 0.04));
      osc.stop(now + (idx * 0.04) + 0.7);
    });
  }

  playTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.015, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  }
}

export const sound = new SoundEngine();
