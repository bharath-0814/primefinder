// Three.js 3D Cosmic Prime Universe & Background Engine

import * as THREE from 'three';

export class ThreeUniverse {
  constructor() {
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.helixMesh = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.is3DActive = true;
    this.animationId = null;
  }

  init(containerId = 'webgl-3d-bg') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030712, 0.0012);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    this.camera.position.z = 450;
    this.camera.position.y = 80;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);

    // Build 3D Objects
    this.createPrimeStarfield();
    this.create3DPrimeHelix();

    // Event Listeners
    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));

    // Animation Loop
    this.animate();
  }

  createPrimeStarfield() {
    const particleCount = 3500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const cyan = new THREE.Color(0x06b6d4);
    const gold = new THREE.Color(0xfbbf24);
    const purple = new THREE.Color(0x818cf8);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Galaxy spiral distribution
      const r = Math.pow(Math.random(), 2) * 800 + 50;
      const theta = Math.random() * Math.PI * 2 * 3;
      const spiralOffset = (r / 800) * 8;

      positions[i3] = Math.cos(theta + spiralOffset) * r + (Math.random() - 0.5) * 60;
      positions[i3 + 1] = (Math.random() - 0.5) * 300 * Math.exp(-r / 500);
      positions[i3 + 2] = Math.sin(theta + spiralOffset) * r + (Math.random() - 0.5) * 60;

      // Color nodes (Prime vs Composite stars)
      const isSpecial = i % 7 === 0 || i % 13 === 0;
      const color = isSpecial ? (i % 2 === 0 ? gold : purple) : cyan;

      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = isSpecial ? Math.random() * 4 + 3 : Math.random() * 2 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom Shaded Point Material
    const material = new THREE.PointsMaterial({
      size: 2.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  create3DPrimeHelix() {
    // 3D Helical Prime Tube winding through space
    const points = [];
    const count = 1200;
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 24;
      const radius = 90 + Math.sin(i * 0.05) * 20;
      const x = Math.cos(t) * radius;
      const y = (i - count / 2) * 0.8;
      const z = Math.sin(t) * radius;
      points.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 300, 1.2, 8, false);
    const material = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });

    this.helixMesh = new THREE.Mesh(geometry, material);
    this.helixMesh.position.set(0, 0, -50);
    this.scene.add(this.helixMesh);
  }

  onMouseMove(e) {
    this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 120;
    this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 80;
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  pulse() {
    // Trigger dynamic cosmic shockwave pulse when prime found
    if (!this.particles) return;
    const initialOpacity = this.particles.material.opacity;
    this.particles.material.opacity = 1.0;
    setTimeout(() => {
      if (this.particles) this.particles.material.opacity = initialOpacity;
    }, 400);
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    if (!this.is3DActive) return;

    // Smooth mouse parallax
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    this.camera.position.x = this.mouseX;
    this.camera.position.y = 80 - this.mouseY;
    this.camera.lookAt(0, 0, 0);

    // Continuous 3D galaxy rotation
    if (this.particles) {
      this.particles.rotation.y += 0.0008;
      this.particles.rotation.x += 0.0003;
    }
    if (this.helixMesh) {
      this.helixMesh.rotation.y -= 0.0012;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

export const threeUniverse = new ThreeUniverse();
