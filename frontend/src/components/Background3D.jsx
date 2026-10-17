import { useEffect, useRef } from 'react';

/**
 * Animated 3D background rendered on a canvas (no external dependencies).
 * Draws a slowly rotating DNA double-helix plus an ambient particle field,
 * with subtle mouse parallax for depth. Respects prefers-reduced-motion.
 */
export default function Background3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ---- Build the helix + rungs -------------------------------------------
    const TURNS = 3;
    const PER_STRAND = 110;
    const RADIUS = 118;
    const HELIX_H = 720;
    const helix = [];
    for (let i = 0; i < PER_STRAND; i++) {
      const t = i / (PER_STRAND - 1);
      const angle = t * TURNS * Math.PI * 2;
      const y = (t - 0.5) * HELIX_H;
      for (let s = 0; s < 2; s++) {
        const a = angle + s * Math.PI;
        helix.push({
          x: Math.cos(a) * RADIUS,
          y,
          z: Math.sin(a) * RADIUS,
          strand: s,
        });
      }
    }

    // Ambient field
    const particles = [];
    const PARTICLE_COUNT = 150;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 1400,
        y: (Math.random() - 0.5) * 1000,
        z: (Math.random() - 0.5) * 1400,
        r: Math.random() * 1.6 + 0.4,
        a: Math.random() * 0.5 + 0.15,
      });
    }

    const FOV = 1000;
    let angle = 0;
    let raf = 0;

    function rotate(p, ax, ay) {
      // rotate around Y then X
      const cosY = Math.cos(ay);
      const sinY = Math.sin(ay);
      let x = p.x * cosY + p.z * sinY;
      let z = -p.x * sinY + p.z * cosY;
      const cosX = Math.cos(ax);
      const sinX = Math.sin(ax);
      const y = p.y * cosX - z * sinX;
      z = p.y * sinX + z * cosX;
      return { x, y, z };
    }

    function project(p, cx, cy) {
      const scale = FOV / (FOV + p.z + 400);
      return {
        x: cx + p.x * scale,
        y: cy + p.y * scale,
        scale,
      };
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;

      const tilt = target.x * 0.25;
      const spin = angle + target.y * 0.4;

      // Ambient particles
      for (const q of particles) {
        const rp = rotate(q, tilt * 0.6, spin * 0.35);
        const pr = project(rp, cx, cy);
        const alpha = q.a * Math.max(0.05, pr.scale);
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, q.r * pr.scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 187, 255, ${alpha})`;
        ctx.fill();
      }

      // Helix backbone points + rungs
      for (let i = 0; i < helix.length; i++) {
        const p = helix[i];
        const rp = rotate(p, tilt, spin);
        const pr = project(rp, cx, cy);

        // rung connecting the two strands
        if (p.strand === 0) {
          const partner = helix[i + 1];
          const rpp = rotate(partner, tilt, spin);
          const prp = project(rpp, cx, cy);
          ctx.beginPath();
          ctx.moveTo(pr.x, pr.y);
          ctx.lineTo(prp.x, prp.y);
          ctx.strokeStyle = `rgba(99, 179, 237, ${0.10 * pr.scale})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        const size = 2.6 * pr.scale;
        const hue = p.strand === 0 ? '56, 189, 248' : '129, 140, 248';
        const alpha = Math.max(0.12, Math.min(0.9, pr.scale));
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${hue}, ${alpha})`;
        ctx.shadowColor = `rgba(${hue}, 0.8)`;
        ctx.shadowBlur = 12 * pr.scale;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function loop() {
      // smooth parallax easing
      pointer.x += (target.x - pointer.x) * 0.04;
      pointer.y += (target.y - pointer.y) * 0.04;
      angle += reduceMotion ? 0.0015 : 0.0045;
      draw();
      raf = requestAnimationFrame(loop);
    }

    function onPointerMove(e) {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove);
    if (reduceMotion) {
      angle = 0.6;
      draw();
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="bg-canvas" aria-hidden="true" />
      <div className="bg-overlay" aria-hidden="true" />
    </>
  );
}
