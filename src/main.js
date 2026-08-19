// PrimeNexus Main Application Orchestrator

import { sound } from './utils/audio.js';
import { threeUniverse } from './utils/threeUniverse.js';
import { RelationNexus3DModule } from './modules/relationNexus3D.js';
import { RelationsExplorerModule } from './modules/relationsExplorer.js';
import { RelationHunterModule } from './modules/relationHunter.js';
import { HunterModule } from './modules/hunter.js';
import { StoryRelationsModule } from './modules/storyRelations.js';

class App {
  constructor() {
    this.nexus3D = new RelationNexus3DModule();
    this.explorer = new RelationsExplorerModule();
    this.relationHunter = new RelationHunterModule();
    this.hunter = new HunterModule();
    this.story = new StoryRelationsModule();
    this.currentTab = 'tab-nexus';
  }

  init() {
    // 1. Initialize 3D Cosmic Background
    threeUniverse.init('webgl-3d-bg');

    // 2. Initialize modules
    this.nexus3D.init();
    this.explorer.init();
    this.relationHunter.init();
    this.hunter.init();
    this.story.init();

    // 3. Navigation and audio controls
    this.bindNavigation();
    this.bindAudioToggle();

    console.log('%c🌐 PrimeNexus 3D Engine Initialized', 'color: #06b6d4; font-weight: bold; font-size: 16px;');
    console.log('%cBridging Prime Relationships to Discovery.', 'color: #fbbf24;');
  }

  bindNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTabId = tab.getAttribute('data-tab');
        if (targetTabId === this.currentTab) return;

        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Switch panels
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
