// PrimeForge Main Application Orchestrator

import { sound } from './utils/audio.js';
import { threeUniverse } from './utils/threeUniverse.js';
import { FindPrimeModule } from './modules/findPrime.js';
import { SimpleModeModule } from './modules/simpleMode.js';
import { HunterModule } from './modules/hunter.js';
import { TitanModule } from './modules/titan.js';
import { TricksLabModule } from './modules/tricksLab.js';
import { SpiralsModule } from './modules/spirals.js';
import { ConjecturesModule } from './modules/conjectures.js';

class App {
  constructor() {
    this.findPrime = new FindPrimeModule();
    this.simpleMode = new SimpleModeModule();
    this.hunter = new HunterModule();
    this.titan = new TitanModule();
    this.tricks = new TricksLabModule();
    this.spirals = new SpiralsModule();
    this.conjectures = new ConjecturesModule();
    this.currentTab = 'tab-find';
  }

  init() {
    // 1. Initialize 3D Cosmic Background
    threeUniverse.init('webgl-3d-bg');

    // 2. Initialize all functional modules
    this.findPrime.init();
    this.simpleMode.init();
    this.hunter.init();
    this.titan.init();
    this.tricks.init();
    this.spirals.init();
    this.conjectures.init();

    // 3. Bind navigation and audio controls
    this.bindNavigation();
    this.bindAudioToggle();

    console.log('%c🪐 PrimeForge 3D Engine Initialized', 'color: #06b6d4; font-weight: bold; font-size: 16px;');
    console.log('%cWebGL Cosmos & Background Web Worker active.', 'color: #a855f7;');
  }

  bindNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTabId = tab.getAttribute('data-tab');
        if (targetTabId === this.currentTab) return;

        // Update active tab button
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Switch visible panel
        document.querySelectorAll('.tab-panel').forEach(panel => {
          panel.classList.add('hidden');
          panel.classList.remove('active');
        });

        const targetPanel = document.getElementById(targetTabId);
        if (targetPanel) {
          targetPanel.classList.remove('hidden');
          targetPanel.classList.add('active');
        }

        this.currentTab = targetTabId;

        // If switching to spirals, trigger resize to ensure proper canvas layout
        if (targetTabId === 'tab-spirals') {
          setTimeout(() => {
            this.spirals.resizeCanvas();
            this.spirals.draw();
          }, 50);
        }
      });
    });
  }

  bindAudioToggle() {
    const btn = document.getElementById('btn-toggle-sound');
    const iconOn = document.getElementById('icon-sound-on');
    const iconOff = document.getElementById('icon-sound-off');

    btn?.addEventListener('click', () => {
      const isEnabled = sound.toggle();
      if (isEnabled) {
        iconOn.classList.remove('hidden');
        iconOff.classList.add('hidden');
        sound.playPrimeDiscovered(5);
      } else {
        iconOn.classList.add('hidden');
        iconOff.classList.remove('hidden');
      }
    });
  }
}

// Bootstrapping
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
