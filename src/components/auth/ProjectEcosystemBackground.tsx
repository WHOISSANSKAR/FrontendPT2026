import React, { useEffect, useRef, useState } from 'react';

interface ProjectEcosystemBackgroundProps {
  mousePos: { x: number; y: number };
}

interface NetworkNode {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  phase: number;
  speed: number;
  radius: number;
  alpha: number;
  color: string;
  isMilestone: boolean;
  activeDriftX: number;
  activeDriftY: number;
}

interface PathParticle {
  pathIndex: number;
  t: number;
  baseSpeed: number;
  currentSpeed: number;
  size: number;
  color: string;
  trail: boolean;
}

export const ProjectEcosystemBackground: React.FC<ProjectEcosystemBackgroundProps> = ({ mousePos }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Smooth lagging parallax for floating 3D CSS shapes
  const [smoothParallax, setSmoothParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let frameId: number;
    let currentX = 0;
    let currentY = 0;

    const loop = () => {
      // Slow, fluid lag for CSS 3D elements
      currentX += (mousePos.x - currentX) * 0.035;
      currentY += (mousePos.y - currentY) * 0.035;
      setSmoothParallax({ x: currentX, y: currentY });
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [mousePos]);

  // Parallax offsets derived from the smoothly damped coordinates
  const layerNearX = smoothParallax.x * 14;
  const layerNearY = smoothParallax.y * 14;
  const layerMidX = smoothParallax.x * 8;
  const layerMidY = smoothParallax.y * 8;
  const layerFarX = smoothParallax.x * 3.5;
  const layerFarY = smoothParallax.y * 3.5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic cursor coordinates with slow inertia interpolation
    const cursor = {
      targetX: width / 2,
      targetY: height / 2,
      smoothX: width / 2,
      smoothY: height / 2,
      isHovering: false,
      hoverEnergy: 0.15,
      speedMultiplier: 1.0,
    };

    const handleWindowMouseMove = (e: MouseEvent) => {
      cursor.targetX = e.clientX;
      cursor.targetY = e.clientY;
      cursor.isHovering = true;
    };

    const handleWindowMouseLeave = () => {
      cursor.isHovering = false;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNetwork();
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseleave', handleWindowMouseLeave);
    window.addEventListener('resize', handleResize);

    // Professional Light-Mode Palette:
    // Very light blue, White, PseudoTeam blue, Navy, Soft cyan-blue accents
    const colors = [
      '#2161F5', // PseudoTeam Blue
      '#1E3A8A', // Navy
      '#06B6D4', // Soft Cyan
      '#0284C7', // Deep Sky Blue
      '#3B82F6', // Royal Blue
      '#60A5FA', // Medium Blue
    ];

    let nodes: NetworkNode[] = [];
    let particles: PathParticle[] = [];

    // Parametric curves with slow cursor deflection
    const getCurvePoint = (
      pathIdx: number, 
      t: number, 
      w: number, 
      h: number, 
      time: number, 
      cursorX: number, 
      cursorY: number, 
      energy: number
    ) => {
      const slowTime = time * 0.00025;
      
      const influenceX = ((cursorX - w / 2) / (w / 2)) * 30 * energy;
      const influenceY = ((cursorY - h / 2) / (h / 2)) * 26 * energy;

      if (pathIdx === 0) {
        const p0 = { x: -80, y: h * 0.22 + Math.sin(slowTime) * 30 };
        const p1 = { x: w * 0.35 + influenceX * 0.7, y: h * 0.08 + Math.cos(slowTime * 0.8) * 40 + influenceY };
        const p2 = { x: w * 0.65 + influenceX, y: h * 0.84 + Math.sin(slowTime * 0.6) * 35 + influenceY * 0.8 };
        const p3 = { x: w + 80, y: h * 0.72 + Math.cos(slowTime) * 30 };
        return cubicBezier(p0, p1, p2, p3, t);
      } else if (pathIdx === 1) {
        const p0 = { x: -60, y: h * 0.82 + Math.cos(slowTime * 0.7) * 25 };
        const p1 = { x: w * 0.28 + influenceX * 0.8, y: h * 0.65 + Math.sin(slowTime) * 35 + influenceY * 0.6 };
        const p2 = { x: w * 0.72 + influenceX * 0.6, y: h * 0.25 + Math.cos(slowTime * 0.9) * 30 + influenceY };
        const p3 = { x: w + 60, y: h * 0.2 + Math.sin(slowTime * 0.7) * 25 };
        return cubicBezier(p0, p1, p2, p3, t);
      } else {
        const p0 = { x: w * 0.1, y: h * 0.45 + Math.sin(slowTime * 0.5) * 20 };
        const p1 = { x: w * 0.4 + influenceX * 0.5, y: h * 0.15 + Math.cos(slowTime) * 25 + influenceY * 0.7 };
        const p2 = { x: w * 0.65 + influenceX * 0.5, y: h * 0.18 + Math.sin(slowTime * 0.8) * 25 + influenceY * 0.7 };
        const p3 = { x: w * 0.95, y: h * 0.55 + Math.cos(slowTime * 0.6) * 20 };
        return cubicBezier(p0, p1, p2, p3, t);
      }
    };

    const cubicBezier = (
      p0: { x: number; y: number },
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      p3: { x: number; y: number },
      t: number
    ) => {
      const u = 1 - t;
      const tt = t * t;
      const uu = u * u;
      const uuu = uu * u;
      const ttt = tt * t;

      const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
      const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;
      return { x, y };
    };

    const initNetwork = () => {
      nodes = [];
      particles = [];

      const count = Math.min(Math.floor((width * height) / 30000), 45);
      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < count; i++) {
        let x = Math.random() * width;
        let y = Math.random() * height;

        // Keep center card area relatively calm
        const cdx = (x - centerX) / (width * 0.24);
        const cdy = (y - centerY) / (height * 0.28);
        if (cdx * cdx + cdy * cdy < 0.9) {
          if (Math.random() > 0.5) {
            x = Math.random() > 0.5 ? Math.random() * (width * 0.3) : width * 0.7 + Math.random() * (width * 0.3);
          } else {
            y = Math.random() > 0.5 ? Math.random() * (height * 0.26) : height * 0.74 + Math.random() * (height * 0.26);
          }
        }

        const isMilestone = i % 5 === 0;

        nodes.push({
          x,
          y,
          baseX: x,
          baseY: y,
          phase: Math.random() * Math.PI * 2,
          speed: 0.0004 + Math.random() * 0.0004,
          radius: isMilestone ? 3.5 : Math.random() * 2 + 1.2,
          alpha: isMilestone ? 0.75 : Math.random() * 0.45 + 0.25,
          color: isMilestone ? '#2161F5' : colors[Math.floor(Math.random() * colors.length)],
          isMilestone,
          activeDriftX: 0,
          activeDriftY: 0,
        });
      }

      // Small particles travelling along curved data paths
      for (let i = 0; i < 32; i++) {
        const baseSpeed = 0.0003 + Math.random() * 0.0005;
        particles.push({
          pathIndex: i % 3,
          t: Math.random(),
          baseSpeed,
          currentSpeed: baseSpeed,
          size: Math.random() * 2.2 + 1.2,
          color: i % 3 === 0 ? '#2161F5' : i % 3 === 1 ? '#06B6D4' : '#1E3A8A',
          trail: Math.random() > 0.4
        });
      }
    };

    initNetwork();

    let currentTime = 0;

    const render = () => {
      // Slow, elegant inertia for cursor following
      cursor.smoothX += (cursor.targetX - cursor.smoothX) * 0.035;
      cursor.smoothY += (cursor.targetY - cursor.smoothY) * 0.035;

      const cursorDist = Math.hypot(cursor.targetX - cursor.smoothX, cursor.targetY - cursor.smoothY);
      const targetEnergy = cursor.isHovering ? Math.min(1.0, 0.2 + cursorDist * 0.0035) : 0.15;
      cursor.hoverEnergy += (targetEnergy - cursor.hoverEnergy) * 0.025;

      const targetSpeedMul = 1.0 + cursor.hoverEnergy * 0.5;
      cursor.speedMultiplier += (targetSpeedMul - cursor.speedMultiplier) * 0.03;

      currentTime += cursor.speedMultiplier;
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      // Subtle canvas parallax
      ctx.translate((cursor.smoothX / width - 0.5) * 14, (cursor.smoothY / height - 0.5) * 14);

      // 1. Slow, ambient magnetic glow aura beneath cursor in light blue
      if (cursor.hoverEnergy > 0.2) {
        const auraRadius = 240 + cursor.hoverEnergy * 40;
        const auraGrad = ctx.createRadialGradient(
          cursor.smoothX, cursor.smoothY, 0,
          cursor.smoothX, cursor.smoothY, auraRadius
        );
        auraGrad.addColorStop(0, `rgba(33, 97, 245, ${0.08 * cursor.hoverEnergy})`);
        auraGrad.addColorStop(0.5, `rgba(6, 182, 212, ${0.04 * cursor.hoverEnergy})`);
        auraGrad.addColorStop(1, 'rgba(33, 97, 245, 0)');

        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cursor.smoothX, cursor.smoothY, auraRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw slow-moving curved paths
      for (let pIdx = 0; pIdx < 3; pIdx++) {
        ctx.beginPath();
        const steps = 60;
        for (let s = 0; s <= steps; s++) {
          const pt = getCurvePoint(
            pIdx, 
            s / steps, 
            width, 
            height, 
            currentTime, 
            cursor.smoothX, 
            cursor.smoothY, 
            cursor.hoverEnergy
          );
          if (s === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }

        const pathAlpha = (pIdx === 0 ? 0.22 : pIdx === 1 ? 0.18 : 0.16) + cursor.hoverEnergy * 0.08;
        ctx.strokeStyle = pIdx === 0 
          ? `rgba(33, 97, 245, ${pathAlpha})` 
          : pIdx === 1 
            ? `rgba(6, 182, 212, ${pathAlpha})` 
            : `rgba(30, 58, 138, ${pathAlpha})`;
        ctx.lineWidth = (pIdx === 0 ? 1.5 : 1.2) + cursor.hoverEnergy * 0.4;
        ctx.stroke();
      }

      // 3. Update and draw nodes with thin connected lines
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        const oscX = node.baseX + Math.sin(currentTime * node.speed + node.phase) * 20;
        const oscY = node.baseY + Math.cos(currentTime * (node.speed * 0.8) + node.phase) * 16;

        const dxToCursor = cursor.smoothX - oscX;
        const dyToCursor = cursor.smoothY - oscY;
        const distToCursor = Math.hypot(dxToCursor, dyToCursor);

        let targetDriftX = 0;
        let targetDriftY = 0;
        let hoverProximity = 0;

        if (distToCursor < 240 && distToCursor > 10) {
          hoverProximity = (1 - distToCursor / 240) * cursor.hoverEnergy;
          const pullAngle = Math.atan2(dyToCursor, dxToCursor);
          const swirlAngle = pullAngle + Math.PI / 2;

          targetDriftX = Math.cos(pullAngle) * (hoverProximity * 24) + Math.cos(swirlAngle) * (hoverProximity * 10);
          targetDriftY = Math.sin(pullAngle) * (hoverProximity * 24) + Math.sin(swirlAngle) * (hoverProximity * 10);
        }

        node.activeDriftX += (targetDriftX - node.activeDriftX) * 0.04;
        node.activeDriftY += (targetDriftY - node.activeDriftY) * 0.04;

        node.x = oscX + node.activeDriftX;
        node.y = oscY + node.activeDriftY;

        const dynamicAlpha = Math.min(1.0, node.alpha + hoverProximity * 0.4);

        // Thin lines connecting nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.hypot(dx, dy);

          const maxDist = 135;
          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.18 * (dynamicAlpha + other.alpha) * 0.5;
            ctx.strokeStyle = `rgba(33, 97, 245, ${lineAlpha})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = dynamicAlpha;
        ctx.fill();

        // Node subtle glow halo
        if (node.isMilestone || hoverProximity > 0.3) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(33, 97, 245, ${0.14 * dynamicAlpha})`;
          ctx.fill();
        }
      }

      // 4. Update and draw particles travelling along curves
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.t += p.currentSpeed * (1 + cursor.hoverEnergy * 0.4);
        if (p.t > 1) p.t = 0;

        const pt = getCurvePoint(
          p.pathIndex, 
          p.t, 
          width, 
          height, 
          currentTime, 
          cursor.smoothX, 
          cursor.smoothY, 
          cursor.hoverEnergy
        );

        ctx.globalAlpha = 0.75;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Soft trail
        if (p.trail) {
          const prevT = Math.max(0, p.t - 0.02);
          const prevPt = getCurvePoint(
            p.pathIndex, 
            prevT, 
            width, 
            height, 
            currentTime, 
            cursor.smoothX, 
            cursor.smoothY, 
            cursor.hoverEnergy
          );
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = 0.25;
          ctx.lineWidth = p.size * 0.8;
          ctx.beginPath();
          ctx.moveTo(prevPt.x, prevPt.y);
          ctx.lineTo(pt.x, pt.y);
          ctx.stroke();
        }
      }

      ctx.restore();
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseleave', handleWindowMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div 
      id="ecosystem-network-background" 
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* 1. Professional Light-Blue / White Background Base with Soft Subtle Tonal Depth */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: '#F4F8FD',
          backgroundImage: `
            radial-gradient(ellipse at 50% 50%, #FFFFFF 0%, rgba(240, 246, 255, 0.85) 45%, rgba(228, 239, 255, 0.75) 100%),
            radial-gradient(circle at 14% 18%, rgba(33, 97, 245, 0.09) 0%, transparent 50%),
            radial-gradient(circle at 86% 22%, rgba(6, 182, 212, 0.07) 0%, transparent 45%),
            radial-gradient(circle at 82% 82%, rgba(30, 58, 138, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 18% 78%, rgba(56, 189, 248, 0.08) 0%, transparent 45%),
            linear-gradient(to right, rgba(33, 97, 245, 0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(33, 97, 245, 0.035) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 48px 48px, 48px 48px'
        }}
      />

      {/* 2. Soft Blue Light Waves Breathing Slowly */}
      <div 
        className="absolute top-1/4 -left-36 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-blue-300/25 to-cyan-200/25 blur-3xl animate-slow-light-breathe pointer-events-none"
        style={{ transform: `translate3d(${layerFarX}px, ${layerFarY}px, 0)` }}
      />
      <div 
        className="absolute bottom-1/4 -right-36 w-[460px] h-[460px] rounded-full bg-gradient-to-bl from-sky-200/30 to-blue-200/25 blur-3xl animate-slow-light-breathe pointer-events-none"
        style={{ transform: `translate3d(${-layerFarX}px, ${-layerFarY}px, 0)`, animationDelay: '4s' }}
      />

      {/* 3. Interactive Canvas Layer: Reacts Smoothly to Cursor */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />

      {/* 4. Abstract Floating Geometric Shapes with Subtle Parallax */}

      {/* --- TOP-LEFT: Gentle Circular Ring & Floating Geometric Element --- */}
      <div 
        className="absolute top-10 left-12 xl:top-16 xl:left-24 hidden md:block"
        style={{
          transform: `translate3d(${layerNearX * 1.1}px, ${layerNearY * 1.1}px, 0)`,
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="relative w-36 h-36 animate-slow-drift">
          {/* Outer Soft Circular Ring */}
          <div className="absolute inset-0 rounded-full border border-blue-400/35 scale-y-85 -rotate-12 animate-slow-ring-spin" />
          
          {/* Inner Counter-Rotating Ring */}
          <div className="absolute inset-3 rounded-full border border-dashed border-cyan-500/30 animate-slow-ring-spin-reverse">
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
          </div>

          {/* Floating Minimalist Geometric Node */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rotate-45 rounded-lg bg-white/70 backdrop-blur-md border border-blue-200/80 shadow-[0_8px_20px_-4px_rgba(33,97,245,0.15)] flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-sm bg-gradient-to-br from-blue-500 to-cyan-500 opacity-90 shadow-2xs" />
            </div>
          </div>
        </div>
      </div>

      {/* --- MID-LEFT: Floating Geometric Network Node --- */}
      <div 
        className="absolute top-[48%] left-8 xl:left-18 -translate-y-1/2 hidden md:block"
        style={{
          transform: `translate3d(${layerMidX}px, ${layerMidY}px, 0)`,
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="relative w-32 h-32 animate-slow-drift-alt flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full border border-blue-300/35" />
          <div className="absolute w-16 h-16 rounded-full border border-cyan-400/40 rotate-45" />

          {/* Core Node */}
          <div className="w-6 h-6 rounded-full bg-white/80 backdrop-blur-xs border border-blue-400/50 shadow-[0_0_12px_rgba(33,97,245,0.25)] flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-2xs" />
          </div>

          {/* Satellite Data Orbit */}
          <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-sky-400 shadow-2xs" />
          <span className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-blue-400 opacity-90" />
        </div>
      </div>

      {/* --- BOTTOM-LEFT: Soft Circular Rings --- */}
      <div 
        className="absolute bottom-12 left-12 xl:bottom-16 xl:left-24 hidden md:block"
        style={{
          transform: `translate3d(${layerNearX * 1.2}px, ${layerNearY * 1.2}px, 0)`,
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="relative w-32 h-32 animate-slow-drift">
          <div className="absolute inset-0 rounded-full border-2 border-blue-300/30 animate-slow-ring-spin scale-y-75 rotate-45" />
          <div className="absolute inset-3 rounded-full border border-cyan-400/35 animate-slow-ring-spin-reverse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]" />
          </div>
        </div>
      </div>

      {/* --- TOP-RIGHT: Translucent Geometric Prism & Orbit --- */}
      <div 
        className="absolute top-10 right-12 xl:top-16 xl:right-24 hidden md:block"
        style={{
          transform: `translate3d(${-layerNearX * 1.1}px, ${layerNearY * 1.1}px, 0)`,
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="relative w-36 h-36 animate-slow-drift-alt">
          <div className="absolute inset-0 rounded-full border border-cyan-400/35 scale-y-80 rotate-12 animate-slow-ring-spin" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-white/75 backdrop-blur-md border border-blue-200/80 shadow-[0_10px_24px_-6px_rgba(33,97,245,0.14)] flex items-center justify-center rotate-12">
              <div className="w-5 h-5 rounded-md border-2 border-blue-500 flex items-center justify-center -rotate-12">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-2xs" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MID-RIGHT: Concentric Orbit Rings --- */}
      <div 
        className="absolute top-[48%] right-8 xl:right-18 -translate-y-1/2 hidden md:block"
        style={{
          transform: `translate3d(${-layerMidX}px, ${layerMidY}px, 0)`,
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="relative w-36 h-36 animate-slow-drift flex items-center justify-center">
          <div className="absolute w-28 h-28 rounded-full border border-blue-300/30 animate-slow-ring-spin scale-y-85" />
          <div className="absolute w-20 h-20 rounded-full border border-dashed border-cyan-400/35 animate-slow-ring-spin-reverse rotate-45" />
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
        </div>
      </div>

      {/* --- BOTTOM-RIGHT: Layered Geometric Shapes --- */}
      <div 
        className="absolute bottom-12 right-12 xl:bottom-16 xl:right-24 hidden md:block"
        style={{
          transform: `translate3d(${-layerNearX * 1.2}px, ${layerNearY * 1.2}px, 0)`,
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="relative w-32 h-32 animate-slow-drift-alt flex items-center justify-center">
          <div className="w-12 h-12 rotate-45 rounded-lg bg-white/70 backdrop-blur-xs border border-blue-200/80 shadow-[0_0_15px_rgba(33,97,245,0.12)] flex items-center justify-center">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-500/30 to-cyan-500/40 border border-blue-500" />
          </div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(33,97,245,0.5)]" />
        </div>
      </div>

    </div>
  );
};
