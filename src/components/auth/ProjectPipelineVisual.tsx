import React, { useEffect, useRef } from 'react';

interface ProjectPipelineVisualProps {
  mousePos: { x: number; y: number };
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface ProjectedPoint {
  x: number;
  y: number;
  scale: number;
  z: number;
}

interface RenderFace {
  pts: Point3D[];
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
  depth?: number;
  isShadow?: boolean;
}

interface WorkflowNode {
  xRatio: number;
  yRatio: number;
  z: number;
  type: 'platform' | 'task_slab' | 'milestone_crystal' | 'gateway' | 'culmination';
  size: number;
  rotSpeed?: number;
  rotPhase?: number;
  colorTheme?: string;
  progress?: number;
}

interface Pathway {
  nodeIndices: number[];
  curvature: number[];
  color: string;
  width: number;
  isSecondary?: boolean;
}

interface FlowParticle {
  pathIndex: number;
  t: number;
  speed: number;
  size: number;
  color: string;
  glowColor: string;
}

export const ProjectPipelineVisual: React.FC<ProjectPipelineVisualProps> = ({ mousePos }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const updateSize = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      width = canvas.width = rect.width || 700;
      height = canvas.height = rect.height || 850;
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // Camera and 3D projection parameters
    const focalLength = 1100;
    let camRotY = -0.12;
    let camRotX = 0.22;
    let targetCamRotY = -0.12;
    let targetCamRotX = 0.22;

    // 3D Projection into screen space
    const project3D = (p: Point3D, cx: number, cy: number, rx: number, ry: number): ProjectedPoint => {
      // Rotate around Y axis
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const x1 = p.x * cosY + p.z * sinY;
      const z1 = -p.x * sinY + p.z * cosY;

      // Rotate around X axis
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const y2 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;

      const distanceZ = z2 + 850;
      const scale = distanceZ > 50 ? focalLength / distanceZ : 1;

      return {
        x: cx + x1 * scale,
        y: cy + y2 * scale,
        scale,
        z: z2,
      };
    };

    // Vector math for normal vector / back-face culling
    const getFaceNormal = (p0: ProjectedPoint, p1: ProjectedPoint, p2: ProjectedPoint): number => {
      return (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x);
    };

    // Nodes distributed across the entire left half (spanning full width & height)
    // Coordinated from Planning (Left) -> Tasks/Execution (Center-Left & Center) -> Milestones (Center-Right) -> Delivery (Right)
    const workflowNodes: WorkflowNode[] = [
      // 1. INCEPTION & FOUNDATION (Far Left, Upper & Lower)
      { xRatio: 0.10, yRatio: 0.24, z: -140, type: 'platform', size: 90, colorTheme: '#2563EB', progress: 1.0 },
      { xRatio: 0.12, yRatio: 0.72, z: 120, type: 'platform', size: 85, colorTheme: '#1D4ED8', progress: 0.9 },
      { xRatio: 0.08, yRatio: 0.48, z: -20, type: 'task_slab', size: 68, progress: 0.85 },

      // 2. TASK SLABS & SPRINT TRACKS (Center-Left, Top to Bottom)
      { xRatio: 0.28, yRatio: 0.15, z: -60, type: 'task_slab', size: 64, progress: 0.95 },
      { xRatio: 0.32, yRatio: 0.38, z: 80, type: 'task_slab', size: 72, progress: 0.75 },
      { xRatio: 0.26, yRatio: 0.60, z: -90, type: 'task_slab', size: 66, progress: 0.80 },
      { xRatio: 0.30, yRatio: 0.84, z: 40, type: 'task_slab', size: 62, progress: 0.65 },

      // 3. MILESTONE CRYSTALS & GATEWAYS (Midfield & Upper/Lower Centers)
      { xRatio: 0.52, yRatio: 0.20, z: -110, type: 'milestone_crystal', size: 36, rotSpeed: 0.0035, rotPhase: 0.5 },
      { xRatio: 0.50, yRatio: 0.50, z: 20, type: 'gateway', size: 42, rotSpeed: -0.0028, rotPhase: 2.1 },
      { xRatio: 0.48, yRatio: 0.78, z: 140, type: 'milestone_crystal', size: 34, rotSpeed: 0.0038, rotPhase: 3.8 },

      // 4. PROGRESS ACCELERATION HUBS (Center-Right)
      { xRatio: 0.68, yRatio: 0.32, z: 70, type: 'task_slab', size: 68, progress: 0.88 },
      { xRatio: 0.72, yRatio: 0.66, z: -70, type: 'task_slab', size: 65, progress: 0.92 },
      { xRatio: 0.70, yRatio: 0.14, z: 130, type: 'milestone_crystal', size: 30, rotSpeed: -0.0042, rotPhase: 1.2 },

      // 5. DELIVERY CULMINATION (Right Side of Panel)
      { xRatio: 0.88, yRatio: 0.44, z: 0, type: 'culmination', size: 48, rotSpeed: 0.0045, rotPhase: 0 },
      { xRatio: 0.86, yRatio: 0.80, z: 80, type: 'milestone_crystal', size: 32, rotSpeed: 0.0032, rotPhase: 4.5 },
    ];

    // Primary and secondary interconnected workflow pipelines
    const pathways: Pathway[] = [
      // Primary Spine (Top Track): Inception -> Architecture -> Milestone A -> Acceleration -> Culmination
      {
        nodeIndices: [0, 3, 7, 10, 13],
        curvature: [18, -25, 22, -15],
        color: 'rgba(37, 99, 235, 0.40)',
        width: 2.2,
      },
      // Core Backbone (Center Track): Planning -> Sprint Execution -> Central Gateway -> Delivery
      {
        nodeIndices: [2, 4, 8, 10, 13],
        curvature: [-20, 24, -18, 16],
        color: 'rgba(2, 132, 199, 0.42)',
        width: 2.5,
      },
      // Lower Track: Infrastructure -> Task 6 -> Milestone B -> Culmination Sub-hub
      {
        nodeIndices: [1, 5, 9, 11, 14, 13],
        curvature: [22, -28, 25, -20, 18],
        color: 'rgba(14, 165, 233, 0.38)',
        width: 2.2,
      },
      // Cross-connection Feeds (Inter-track dynamic dependencies)
      {
        nodeIndices: [0, 4, 9],
        curvature: [-15, 20],
        color: 'rgba(37, 99, 235, 0.22)',
        width: 1.5,
        isSecondary: true,
      },
      {
        nodeIndices: [3, 8, 11],
        curvature: [25, -18],
        color: 'rgba(13, 148, 136, 0.25)', // Subtle teal accent
        width: 1.5,
        isSecondary: true,
      },
      {
        nodeIndices: [6, 9, 14],
        curvature: [-15, 22],
        color: 'rgba(14, 165, 233, 0.22)',
        width: 1.4,
        isSecondary: true,
      },
      {
        nodeIndices: [7, 12, 13],
        curvature: [15, -12],
        color: 'rgba(37, 99, 235, 0.26)',
        width: 1.6,
        isSecondary: true,
      }
    ];

    // Flow particles along the pathways - very slow, calm, elegant drift (10-15s cycle)
    const particles: FlowParticle[] = Array.from({ length: 50 }, (_, i) => {
      const pIdx = i % pathways.length;
      return {
        pathIndex: pIdx,
        t: Math.random(),
        speed: 0.00035 + Math.random() * 0.00045, // Slow, calm, premium motion
        size: 2.2 + Math.random() * 2.0,
        color: [
          '#2563EB', // PseudoTeam Blue
          '#0284C7', // Deep Sky Blue
          '#0EA5E9', // Cyan
          '#38BDF8', // Light Sky
          '#0D9488', // Subtle Teal
          '#1D4ED8', // Navy Blue
        ][i % 6],
        glowColor: 'rgba(56, 189, 248, 0.28)',
      };
    });

    // Ambient floating 3D micro-elements (rings, isometric cubes, orbital dots) - calm, gentle drift
    const ambientObjects = Array.from({ length: 22 }, (_, i) => ({
      xRatio: Math.random(),
      yRatio: Math.random(),
      z: (Math.random() - 0.5) * 450,
      size: 7 + Math.random() * 11,
      type: i % 3 === 0 ? 'ring' : i % 3 === 1 ? 'box' : 'dot',
      color: i % 4 === 0 
        ? 'rgba(37, 99, 235, 0.25)' 
        : i % 4 === 1 
        ? 'rgba(14, 165, 233, 0.22)' 
        : i % 4 === 2 
        ? 'rgba(13, 148, 136, 0.20)' 
        : 'rgba(30, 58, 138, 0.18)',
      speedX: 0.0006 + Math.random() * 0.0008,
      speedY: 0.0008 + Math.random() * 0.0010,
      phase: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    // Catmull-Rom spline interpolation through 3D points
    const getSplinePoint = (pts: Point3D[], t: number): Point3D => {
      const p = (pts.length - 1) * t;
      const i = Math.min(Math.floor(p), pts.length - 2);
      const weight = p - i;

      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];

      const t2 = weight * weight;
      const t3 = t2 * weight;

      const f0 = -0.5 * t3 + t2 - 0.5 * weight;
      const f1 = 1.5 * t3 - 2.5 * t2 + 1.0;
      const f2 = -1.5 * t3 + 2.0 * t2 + 0.5 * weight;
      const f3 = 0.5 * t3 - 0.5 * t2;

      return {
        x: p0.x * f0 + p1.x * f1 + p2.x * f2 + p3.x * f3,
        y: p0.y * f0 + p1.y * f1 + p2.y * f2 + p3.y * f3,
        z: p0.z * f0 + p1.z * f1 + p2.z * f2 + p3.z * f3,
      };
    };

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // Smooth camera interpolation based on cursor + very subtle continuous 12s ambient drift
      const ambientSwayY = Math.sin(time * 0.006) * 0.025;
      const ambientSwayX = Math.cos(time * 0.0045) * 0.015;
      targetCamRotY = -0.12 + mousePos.x * 0.08 + ambientSwayY;
      targetCamRotX = 0.22 - mousePos.y * 0.06 + ambientSwayX;
      camRotY += (targetCamRotY - camRotY) * 0.015;
      camRotX += (targetCamRotX - camRotX) * 0.015;

      const cx = width * 0.5;
      const cy = height * 0.5;

      // Coordinate scaling so 3D objects cover the full canvas
      const extentX = width * 0.44;
      const extentY = height * 0.42;

      // 1. Calculate world 3D positions for all workflow nodes
      const nodePositions: Point3D[] = workflowNodes.map((n, idx) => {
        // Slow organic floating oscillation (calm ~10-14s cycle)
        const floatY = Math.sin(time * 0.005 + idx * 1.2) * 3.5;
        const floatX = Math.cos(time * 0.0035 + idx * 0.8) * 2.2;

        // Map xRatio (0..1) -> (-extentX..+extentX), yRatio (0..1) -> (-extentY..+extentY)
        const wx = (n.xRatio - 0.5) * (extentX * 2) + floatX;
        const wy = (n.yRatio - 0.5) * (extentY * 2) + floatY;
        const wz = n.z;

        return { x: wx, y: wy, z: wz };
      });

      const facesToRender: RenderFace[] = [];

      // 2. Draw Perspective Grid across entire floor (Ground Depth Plane)
      const gridGroundY = extentY * 1.15;
      const gridSpacing = 48;
      const gridSpanX = extentX * 1.5;
      const gridSpanZ = 450;

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.04)';
      ctx.lineWidth = 1;

      for (let gx = -gridSpanX; gx <= gridSpanX; gx += gridSpacing) {
        const p1 = project3D({ x: gx, y: gridGroundY, z: -gridSpanZ }, cx, cy, camRotX, camRotY);
        const p2 = project3D({ x: gx, y: gridGroundY, z: gridSpanZ }, cx, cy, camRotX, camRotY);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
      for (let gz = -gridSpanZ; gz <= gridSpanZ; gz += gridSpacing) {
        const p1 = project3D({ x: -gridSpanX, y: gridGroundY, z: gz }, cx, cy, camRotX, camRotY);
        const p2 = project3D({ x: gridSpanX, y: gridGroundY, z: gz }, cx, cy, camRotX, camRotY);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
      ctx.stroke();

      // 3. Render Ground Shadows for All Nodes (Visual depth & spatial anchoring)
      nodePositions.forEach((np, idx) => {
        const n = workflowNodes[idx];
        const shadowCenter = project3D({ x: np.x, y: gridGroundY, z: np.z }, cx, cy, camRotX, camRotY);
        const shadowRadius = (n.size * 0.45) * shadowCenter.scale;
        
        ctx.beginPath();
        ctx.ellipse(shadowCenter.x, shadowCenter.y, shadowRadius * 1.4, shadowRadius * 0.55, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(30, 58, 138, 0.045)';
        ctx.fill();
      });

      // 4. Helper to construct 3D Beveled Slabs / Cards (WITHOUT any text or cards)
      const add3DBox = (
        c: Point3D, 
        w: number, 
        h: number, 
        d: number, 
        topColor: string, 
        frontColor: string, 
        sideColor: string,
        strokeColor = 'rgba(37, 99, 235, 0.22)'
      ) => {
        const hw = w * 0.5;
        const hh = h * 0.5;
        const hd = d * 0.5;

        const v: Point3D[] = [
          { x: c.x - hw, y: c.y - hh, z: c.z - hd }, // 0: Top Back Left
          { x: c.x + hw, y: c.y - hh, z: c.z - hd }, // 1: Top Back Right
          { x: c.x + hw, y: c.y - hh, z: c.z + hd }, // 2: Top Front Right
          { x: c.x - hw, y: c.y - hh, z: c.z + hd }, // 3: Top Front Left
          { x: c.x - hw, y: c.y + hh, z: c.z - hd }, // 4: Bottom Back Left
          { x: c.x + hw, y: c.y + hh, z: c.z - hd }, // 5: Bottom Back Right
          { x: c.x + hw, y: c.y + hh, z: c.z + hd }, // 6: Bottom Front Right
          { x: c.x - hw, y: c.y + hh, z: c.z + hd }, // 7: Bottom Front Left
        ];

        // Top Face
        facesToRender.push({ pts: [v[0], v[1], v[2], v[3]], color: topColor, strokeColor });
        // Front Face
        facesToRender.push({ pts: [v[3], v[2], v[6], v[7]], color: frontColor, strokeColor });
        // Right Face
        facesToRender.push({ pts: [v[2], v[1], v[5], v[6]], color: sideColor, strokeColor });
        // Left Face
        facesToRender.push({ pts: [v[0], v[3], v[7], v[4]], color: sideColor, strokeColor });
      };

      // 5. Generate 3D Geometry for all workflow nodes
      workflowNodes.forEach((n, idx) => {
        const np = nodePositions[idx];

        if (n.type === 'platform') {
          // Foundation Platform Slab: Dual Tier
          // Tier 1 (Base plinth)
          add3DBox(
            { x: np.x, y: np.y + 10, z: np.z },
            n.size * 1.15,
            12,
            n.size * 0.95,
            '#DBEAFE',
            '#BFDBFE',
            '#93C5FD',
            'rgba(37, 99, 235, 0.28)'
          );
          // Tier 2 (Top platform with PseudoTeam blue accent)
          add3DBox(
            np,
            n.size,
            14,
            n.size * 0.82,
            '#EFF6FF',
            '#60A5FA',
            '#3B82F6',
            'rgba(37, 99, 235, 0.35)'
          );
        } else if (n.type === 'task_slab') {
          // Floating Abstract Task Slab with clean geometric progress groove
          const w = n.size * 1.1;
          const h = 10;
          const d = n.size * 0.75;
          add3DBox(
            np,
            w,
            h,
            d,
            '#FFFFFF',
            '#93C5FD',
            '#60A5FA',
            'rgba(37, 99, 235, 0.25)'
          );
        } else if (n.type === 'milestone_crystal') {
          // Rotating Dual-Pyramid Octahedron Milestone Crystal
          const rot = time * (n.rotSpeed || 0.012) + (n.rotPhase || 0);
          const r = n.size * 0.75;

          const top: Point3D = { x: np.x, y: np.y - r * 1.35, z: np.z };
          const bottom: Point3D = { x: np.x, y: np.y + r * 1.35, z: np.z };

          const mid0: Point3D = { x: np.x + Math.cos(rot) * r, y: np.y, z: np.z + Math.sin(rot) * r };
          const mid1: Point3D = { x: np.x + Math.cos(rot + Math.PI / 2) * r, y: np.y, z: np.z + Math.sin(rot + Math.PI / 2) * r };
          const mid2: Point3D = { x: np.x + Math.cos(rot + Math.PI) * r, y: np.y, z: np.z + Math.sin(rot + Math.PI) * r };
          const mid3: Point3D = { x: np.x + Math.cos(rot + (3 * Math.PI) / 2) * r, y: np.y, z: np.z + Math.sin(rot + (3 * Math.PI) / 2) * r };

          // Upper facets
          facesToRender.push({ pts: [top, mid0, mid1], color: 'rgba(37, 99, 235, 0.80)', strokeColor: '#BAE6FD' });
          facesToRender.push({ pts: [top, mid1, mid2], color: 'rgba(14, 165, 233, 0.75)', strokeColor: '#BAE6FD' });
          facesToRender.push({ pts: [top, mid2, mid3], color: 'rgba(29, 78, 216, 0.85)', strokeColor: '#BAE6FD' });
          facesToRender.push({ pts: [top, mid3, mid0], color: 'rgba(56, 189, 248, 0.70)', strokeColor: '#BAE6FD' });

          // Lower facets
          facesToRender.push({ pts: [bottom, mid1, mid0], color: 'rgba(30, 58, 138, 0.88)', strokeColor: '#BAE6FD' });
          facesToRender.push({ pts: [bottom, mid2, mid1], color: 'rgba(30, 64, 175, 0.84)', strokeColor: '#BAE6FD' });
          facesToRender.push({ pts: [bottom, mid3, mid2], color: 'rgba(29, 78, 216, 0.90)', strokeColor: '#BAE6FD' });
          facesToRender.push({ pts: [bottom, mid0, mid3], color: 'rgba(37, 99, 235, 0.82)', strokeColor: '#BAE6FD' });
        } else if (n.type === 'gateway') {
          // Central Milestone Gateway: Multi-layered Torus & Gem
          const rot = time * (n.rotSpeed || 0.01) + (n.rotPhase || 0);
          const r = n.size * 0.7;

          // Polyhedral gem core
          add3DBox(
            np,
            r * 1.2,
            r * 1.2,
            r * 1.2,
            'rgba(37, 99, 235, 0.88)',
            'rgba(14, 165, 233, 0.82)',
            'rgba(29, 78, 216, 0.90)',
            '#E0F2FE'
          );
        } else if (n.type === 'culmination') {
          // Delivery Culmination: Multi-faceted Hexagonal Polyhedral Beacon
          const rot = time * (n.rotSpeed || 0.015) + (n.rotPhase || 0);
          const r = n.size * 0.8;

          const topPt: Point3D = { x: np.x, y: np.y - r * 1.35, z: np.z };
          const btmPt: Point3D = { x: np.x, y: np.y + r * 1.35, z: np.z };

          const numSides = 6;
          const ringVerts: Point3D[] = [];
          for (let s = 0; s < numSides; s++) {
            const angle = rot + (s * 2 * Math.PI) / numSides;
            ringVerts.push({
              x: np.x + Math.cos(angle) * r * 1.15,
              y: np.y,
              z: np.z + Math.sin(angle) * r * 1.15,
            });
          }

          for (let s = 0; s < numSides; s++) {
            const next = (s + 1) % numSides;
            facesToRender.push({
              pts: [topPt, ringVerts[s], ringVerts[next]],
              color: s % 2 === 0 ? 'rgba(37, 99, 235, 0.90)' : 'rgba(14, 165, 233, 0.85)',
              strokeColor: '#BAE6FD',
            });
            facesToRender.push({
              pts: [btmPt, ringVerts[next], ringVerts[s]],
              color: s % 2 === 0 ? 'rgba(29, 78, 216, 0.94)' : 'rgba(13, 148, 136, 0.88)',
              strokeColor: '#BAE6FD',
            });
          }
        }
      });

      // 6. Draw 3D Spline Pathways & Progress Tracks
      const renderedSplinePoints: Point3D[][] = pathways.map(pw => {
        return pw.nodeIndices.map(idx => nodePositions[idx]);
      });

      // Draw all pathway spline curves
      renderedSplinePoints.forEach((pts, pwIdx) => {
        const pw = pathways[pwIdx];
        ctx.beginPath();
        const steps = 70;
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const pt3D = getSplinePoint(pts, t);
          const prj = project3D(pt3D, cx, cy, camRotX, camRotY);
          if (s === 0) ctx.moveTo(prj.x, prj.y);
          else ctx.lineTo(prj.x, prj.y);
        }

        ctx.strokeStyle = pw.color;
        ctx.lineWidth = pw.width;
        if (pw.isSecondary) {
          ctx.setLineDash([4, 6]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Subtle glow aura on primary tracks
        if (!pw.isSecondary) {
          ctx.beginPath();
          for (let s = 0; s <= steps; s += 2) {
            const t = s / steps;
            const pt3D = getSplinePoint(pts, t);
            const prj = project3D(pt3D, cx, cy, camRotX, camRotY);
            if (s === 0) ctx.moveTo(prj.x, prj.y);
            else ctx.lineTo(prj.x, prj.y);
          }
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
          ctx.lineWidth = pw.width * 2.8;
          ctx.stroke();
        }
      });

      // 7. Draw Orbital Rings around Milestone & Culmination Nodes
      const draw3DOrbitalRing = (
        c: Point3D, 
        rx: number, 
        rz: number, 
        tiltX: number, 
        tiltY: number, 
        color: string, 
        lineWidth = 1.2, 
        dashes: number[] = []
      ) => {
        ctx.beginPath();
        const segments = 48;
        for (let i = 0; i <= segments; i++) {
          const theta = (i * 2 * Math.PI) / segments;
          const lx = Math.cos(theta) * rx;
          const lz = Math.sin(theta) * rz;

          const y1 = lx * Math.sin(tiltX);
          const x1 = lx * Math.cos(tiltX);

          const pt3D = { x: c.x + x1, y: c.y + y1, z: c.z + lz };
          const prj = project3D(pt3D, cx, cy, camRotX, camRotY);
          if (i === 0) ctx.moveTo(prj.x, prj.y);
          else ctx.lineTo(prj.x, prj.y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.setLineDash(dashes);
        ctx.stroke();
        ctx.setLineDash([]);
      };

      workflowNodes.forEach((n, idx) => {
        const np = nodePositions[idx];
        if (n.type === 'milestone_crystal' || n.type === 'gateway') {
          draw3DOrbitalRing(np, n.size * 1.5, n.size * 1.5, 0.4, 0, 'rgba(37, 99, 235, 0.28)', 1.2, [4, 5]);
          draw3DOrbitalRing(np, n.size * 2.0, n.size * 2.0, -0.35, 0, 'rgba(14, 165, 233, 0.22)', 1.0, [2, 4]);
        } else if (n.type === 'culmination') {
          // Expanding ripple pulse rings (calm 12s cycle)
          const pulse = (time * 0.005) % 1;
          draw3DOrbitalRing(np, n.size * (1.6 + pulse * 0.8), n.size * (1.6 + pulse * 0.8), 0.3, 0, `rgba(13, 148, 136, ${0.30 * (1 - pulse)})`, 1.4);
          draw3DOrbitalRing(np, n.size * 1.7, n.size * 1.7, 0.3, 0, 'rgba(37, 99, 235, 0.35)', 1.4);
          draw3DOrbitalRing(np, n.size * 2.4, n.size * 2.4, -0.25, 0, 'rgba(14, 165, 233, 0.25)', 1.0, [5, 6]);
        }
      });

      // 8. Depth-Sort and Render 3D Faces
      facesToRender.forEach(face => {
        let sumZ = 0;
        face.pts.forEach(p => { sumZ += p.z; });
        face.depth = sumZ / face.pts.length;
      });

      facesToRender.sort((a, b) => (b.depth || 0) - (a.depth || 0));

      facesToRender.forEach(face => {
        const prjPts = face.pts.map(p => project3D(p, cx, cy, camRotX, camRotY));
        if (prjPts.length < 3) return;

        // Back-face normal check
        const normZ = getFaceNormal(prjPts[0], prjPts[1], prjPts[2]);
        if (normZ <= 0) return;

        ctx.beginPath();
        ctx.moveTo(prjPts[0].x, prjPts[0].y);
        for (let i = 1; i < prjPts.length; i++) {
          ctx.lineTo(prjPts[i].x, prjPts[i].y);
        }
        ctx.closePath();

        ctx.fillStyle = face.color;
        ctx.fill();

        if (face.strokeColor) {
          ctx.strokeStyle = face.strokeColor;
          ctx.lineWidth = face.strokeWidth || 1;
          ctx.stroke();
        }
      });

      // 9. Render Task Slabs' Abstract Internal Geometric Grooves (WITHOUT ANY TEXT)
      workflowNodes.forEach((n, idx) => {
        if (n.type !== 'task_slab') return;
        const np = nodePositions[idx];
        const w = n.size * 1.1;
        const d = n.size * 0.75;
        const progress = n.progress || 0.75;

        // Embossed progress track groove on top face
        const topY = np.y - 6;
        const startPt = project3D({ x: np.x - w * 0.35, y: topY, z: np.z - d * 0.15 }, cx, cy, camRotX, camRotY);
        const endPt = project3D({ x: np.x + w * 0.35, y: topY, z: np.z - d * 0.15 }, cx, cy, camRotX, camRotY);
        const fillPt = project3D({ x: np.x - w * 0.35 + w * 0.7 * progress, y: topY, z: np.z - d * 0.15 }, cx, cy, camRotX, camRotY);

        // Track background
        ctx.beginPath();
        ctx.moveTo(startPt.x, startPt.y);
        ctx.lineTo(endPt.x, endPt.y);
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.15)';
        ctx.lineWidth = 3.5 * startPt.scale;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Track filled progress
        ctx.beginPath();
        ctx.moveTo(startPt.x, startPt.y);
        ctx.lineTo(fillPt.x, fillPt.y);
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = 3.5 * startPt.scale;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Status pip dot
        const pipPt = project3D({ x: np.x - w * 0.35, y: topY, z: np.z + d * 0.22 }, cx, cy, camRotX, camRotY);
        ctx.beginPath();
        ctx.arc(pipPt.x, pipPt.y, 3 * pipPt.scale, 0, Math.PI * 2);
        ctx.fillStyle = progress > 0.85 ? '#0D9488' : '#2563EB';
        ctx.fill();

        // Secondary skeleton track
        const s2Start = project3D({ x: np.x - w * 0.15, y: topY, z: np.z + d * 0.22 }, cx, cy, camRotX, camRotY);
        const s2End = project3D({ x: np.x + w * 0.35, y: topY, z: np.z + d * 0.22 }, cx, cy, camRotX, camRotY);
        ctx.beginPath();
        ctx.moveTo(s2Start.x, s2Start.y);
        ctx.lineTo(s2End.x, s2End.y);
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.20)';
        ctx.lineWidth = 2 * startPt.scale;
        ctx.stroke();
      });

      // 10. Render Ambient Floating 3D Micro-Elements (Rings, Wireframe Cubes, Dots across entire area)
      ambientObjects.forEach(obj => {
        const floatX = Math.cos(time * obj.speedX + obj.phase) * 6;
        const floatY = Math.sin(time * obj.speedY + obj.phase) * 8;

        const wx = (obj.xRatio - 0.5) * (extentX * 2.2) + floatX;
        const wy = (obj.yRatio - 0.5) * (extentY * 2.2) + floatY;

        const prj = project3D({ x: wx, y: wy, z: obj.z }, cx, cy, camRotX, camRotY);

        if (obj.type === 'ring') {
          ctx.beginPath();
          ctx.arc(prj.x, prj.y, obj.size * prj.scale, 0, Math.PI * 2);
          ctx.strokeStyle = obj.color;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else if (obj.type === 'box') {
          const s = (obj.size * 0.55) * prj.scale;
          ctx.beginPath();
          ctx.rect(prj.x - s / 2, prj.y - s / 2, s, s);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.fill();
          ctx.strokeStyle = obj.color;
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(prj.x, prj.y, (obj.size * 0.25) * prj.scale, 0, Math.PI * 2);
          ctx.fillStyle = obj.color;
          ctx.fill();
        }
      });

      // 11. Render Flowing Glowing Particles along Pathways
      particles.forEach(pt => {
        pt.t += pt.speed;
        if (pt.t > 1) {
          pt.t = 0;
          pt.pathIndex = Math.floor(Math.random() * pathways.length);
        }

        const pts = renderedSplinePoints[pt.pathIndex];
        if (!pts || pts.length < 2) return;

        const pt3D = getSplinePoint(pts, pt.t);
        const prj = project3D(pt3D, cx, cy, camRotX, camRotY);
        const curSize = pt.size * prj.scale;

        // Glowing soft halo
        ctx.beginPath();
        ctx.arc(prj.x, prj.y, curSize * 2.6, 0, Math.PI * 2);
        ctx.fillStyle = pt.glowColor;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(prj.x, prj.y, curSize, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.fill();

        // Specular highlight center
        ctx.beginPath();
        ctx.arc(prj.x, prj.y, curSize * 0.38, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      });

      // 12. Soft Ambient Halo Highlights on Major Nodes
      workflowNodes.forEach((n, idx) => {
        if (n.type === 'milestone_crystal' || n.type === 'culmination') {
          const np = nodePositions[idx];
          const prj = project3D(np, cx, cy, camRotX, camRotY);
          const pulse = (Math.sin(time * 0.007 + (n.rotPhase || 0)) + 1) / 2;
          const haloR = (n.size * 1.4 + pulse * 10) * prj.scale;

          ctx.beginPath();
          ctx.arc(prj.x, prj.y, haloR, 0, Math.PI * 2);
          ctx.strokeStyle = n.type === 'culmination' 
            ? `rgba(13, 148, 136, ${0.15 + pulse * 0.15})` 
            : `rgba(37, 99, 235, ${0.12 + pulse * 0.14})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateSize);
    };
  }, [mousePos]);

  return (
    <div 
      id="pseudoteam-visual-container"
      className="relative w-full h-full min-h-[460px] flex-1 flex items-center justify-center overflow-hidden select-none bg-gradient-to-br from-[#F4F8FF] via-[#EBF3FC] to-[#E5F1FF]"
    >
      {/* Soft atmospheric ambient light blurs across the entire canvas */}
      <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-blue-400/12 blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-28 w-[460px] h-[460px] rounded-full bg-sky-400/14 blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 left-1/5 w-[480px] h-[480px] rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-36 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/8 blur-3xl pointer-events-none" />

      {/* Abstract 3D project-management visualization canvas - FULL BLEED, NO TEXT */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0 block" 
      />
    </div>
  );
};
