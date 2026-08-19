// PrimeForge Main Application Orchestrator

import { sound } from './utils/audio.js';
import { SimpleModeModule } from './modules/simpleMode.js';
import { HunterModule } from './modules/hunter.js';
import { TitanModule } from './modules/titan.js';
import { TricksLabModule } from './modules/tricksLab.js';
import { SpiralsModule } from './modules/spirals.js';
import { ConjecturesModule } from './modules/conjectures.js';

class App {
  constructor() {
    this.simpleMode = new SimpleModeModule();
    this.hunter = new HunterModule();
    this.titan = new TitanModule();
    this.tricks = new TricksLabModule();
    this.spirals = new SpiralsModule();
    this.conjectures = new ConjecturesModule();
    this.currentTab = 'tab-simple';
  }

  init() {
    // Initialize all modules
    this.simpleMode.init();
    this.hunter.init();
    this.titan.init();
    this.tricks.init();
    this.spirals.init();
    this.conjectures.init();

    // Bind navigation and audio controls
    this.bindNavigation();
    this.bindAudioToggle();

    console.log('%c⚡ PrimeForge Engine Initialized', 'color: #06b6d4; font-weight: bold; font-size: 14px;');
    console.log('%cBackground Web Worker running multithreaded Lucas-Lehmer & Miller-Rabin tests.', 'color: #94a3b8;');
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
