import React, { useEffect, useRef, useState } from 'react';
import portrait from '../assets/pip_portrait.webp';
import '../styles/pip3d.css';

/**
 * Pip3D — a small interactable WebGL diorama (Three.js, lazy-loaded).
 *
 * Pip sits on a billboard inside a real 3D starfield; dragging orbits the
 * camera around him, arrow keys nudge the view, and idle time lets the
 * scene drift on its own. The static portrait is shown until the WebGL
 * chunk arrives, so the card never flashes empty.
 */
export default function Pip3D() {
  const hostRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let teardown = null;
    let started = false;

    const boot = async () => {
      if (started) return;
      started = true;

      let THREE;
      try {
        THREE = await import('three');
      } catch {
        if (!disposed) setFailed(true);
        return;
      }
      if (disposed || !host.isConnected) return;

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const width = host.clientWidth || 320;
      const height = host.clientHeight || 480;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      } catch {
        setFailed(true);
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.className = 'pip3d__canvas';
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 60);

      // ── Pip billboard ────────────────────────────────
      const texture = new THREE.TextureLoader().load(portrait);
      texture.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      });
      const pip = new THREE.Sprite(material);
      const planeH = 3.6;
      const planeW = planeH * (682 / 1024);
      pip.scale.set(planeW, planeH, 1);
      pip.position.y = -0.25;
      scene.add(pip);

      // ── Cloud shadow ─────────────────────────────────
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = 128;
      shadowCanvas.height = 128;
      const ctx2d = shadowCanvas.getContext('2d');
      const gradient = ctx2d.createRadialGradient(64, 64, 4, 64, 64, 62);
      gradient.addColorStop(0, 'rgba(92, 64, 51, 0.30)');
      gradient.addColorStop(1, 'rgba(92, 64, 51, 0)');
      ctx2d.fillStyle = gradient;
      ctx2d.fillRect(0, 0, 128, 128);
      const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(3.4, 3.4),
        new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -2.15;
      scene.add(shadow);

      // ── Stars ────────────────────────────────────────
      const starCount = 260;
      const positions = new Float32Array(starCount * 3);
      let seed = 41;
      const rnd = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
      for (let i = 0; i < starCount; i += 1) {
        const theta = rnd() * Math.PI * 2;
        const phi = Math.acos(2 * rnd() - 1);
        const radius = 5.2 + rnd() * 4.5;
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.cos(phi) * 0.7;
        positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      }
      const starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const starMaterial = new THREE.PointsMaterial({
        color: 0xffe6b0,
        size: 0.055,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        sizeAttenuation: true,
      });
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      // A few larger storybook sparkles
      const sparkleGeometry = new THREE.BufferGeometry();
      const sparklePositions = new Float32Array([
        -2.6, 1.7, -1.4, 2.5, 1.2, -1.8, 2.9, -0.4, -1.2, -3.0, -1.0, -1.6,
      ]);
      sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
      const sparkles = new THREE.Points(
        sparkleGeometry,
        new THREE.PointsMaterial({ color: 0xffffff, size: 0.16, transparent: true, opacity: 0.9 })
      );
      scene.add(sparkles);

      // ── Orbit camera ─────────────────────────────────
      let yaw = 0;
      let yawTarget = 0;
      let pitch = 0.04;
      let pitchTarget = 0.04;
      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      let lastInput = performance.now();

      const placeCamera = () => {
        const radius = 6.6;
        camera.position.set(
          Math.sin(yaw) * radius * Math.cos(pitch),
          Math.sin(pitch) * radius + 0.1,
          Math.cos(yaw) * radius * Math.cos(pitch)
        );
        camera.lookAt(0, 0, 0);
      };

      const onPointerDown = (e) => {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        lastInput = performance.now();
        renderer.domElement.setPointerCapture?.(e.pointerId);
      };
      const onPointerMove = (e) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        yawTarget = Math.max(-0.75, Math.min(0.75, yawTarget - dx * 0.006));
        pitchTarget = Math.max(-0.24, Math.min(0.34, pitchTarget + dy * 0.004));
        lastInput = performance.now();
      };
      const onPointerUp = () => {
        dragging = false;
      };
      const onKeyDown = (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          yawTarget = Math.max(-0.75, Math.min(0.75, yawTarget + (e.key === 'ArrowRight' ? 0.16 : -0.16)));
          lastInput = performance.now();
        }
      };
      const canvas = renderer.domElement;
      canvas.tabIndex = 0;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', 'Interactive 3D portrait of Pip. Drag or use the left and right arrow keys to orbit.');
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);
      canvas.addEventListener('keydown', onKeyDown);

      // ── Resize ───────────────────────────────────────
      const resize = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);

      // ── Visibility-gated loop ────────────────────────
      let visible = true;
      const visibilityObserver = new IntersectionObserver(
        ([entry]) => { visible = entry.isIntersecting; },
        { rootMargin: '120px' }
      );
      visibilityObserver.observe(host);

      let raf = null;
      const startedAt = performance.now();

      const render = () => {
        raf = requestAnimationFrame(render);
        if (!visible) return;

        const elapsed = (performance.now() - startedAt) / 1000;
        const idle = performance.now() - lastInput;

        if (!reduceMotion && !dragging && idle > 2400) {
          yawTarget = Math.sin(elapsed * 0.22) * 0.34;
          pitchTarget = 0.05 + Math.sin(elapsed * 0.15) * 0.05;
        }

        yaw += (yawTarget - yaw) * 0.08;
        pitch += (pitchTarget - pitch) * 0.08;
        placeCamera();

        stars.rotation.y = elapsed * 0.012;
        sparkles.rotation.y = -elapsed * 0.03;
        shadow.material.opacity = 0.9;

        renderer.render(scene, camera);
      };

      placeCamera();
      render();
      setReady(true);

      teardown = () => {
        if (raf) cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerUp);
        canvas.removeEventListener('keydown', onKeyDown);
        texture.dispose();
        shadowTexture.dispose();
        starGeometry.dispose();
        starMaterial.dispose();
        sparkleGeometry.dispose();
        material.dispose();
        renderer.dispose();
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      };
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          io.disconnect();
          boot();
        }
      },
      { rootMargin: '320px' }
    );
    io.observe(host);

    return () => {
      disposed = true;
      io.disconnect();
      if (teardown) teardown();
    };
  }, []);

  return (
    <div className={`pip3d ${ready ? 'is-ready' : ''} ${failed ? 'has-failed' : ''}`}>
      <div className="pip3d__stage" ref={hostRef}>
        <img
          className="pip3d__fallback"
          src={portrait}
          alt="Pip, the Junior Dream Engineer, in his staff portrait"
          width="682"
          height="1024"
        />
        {!ready && !failed && <span className="pip3d__loading">warming up the little stage…</span>}
        {failed && <span className="pip3d__loading">3D needs WebGL — showing the flat portrait instead.</span>}
      </div>
      <span className="pip3d__hint" aria-hidden="true">drag to orbit · ← → to turn</span>
    </div>
  );
}
