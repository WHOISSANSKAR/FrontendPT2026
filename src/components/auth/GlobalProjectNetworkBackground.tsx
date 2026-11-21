import React, { useEffect, useRef } from 'react';

export const GlobalProjectNetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    // Comprehensive global project hubs distributed across all continents
    // Latitude and longitude in radians
    const hubs = [
      // North America
      { id: 'sfo', name: 'San Francisco', lat: 0.66, lon: -2.13 },
      { id: 'sea', name: 'Seattle', lat: 0.83, lon: -2.13 },
      { id: 'lax', name: 'Los Angeles', lat: 0.59, lon: -2.06 },
      { id: 'den', name: 'Denver', lat: 0.69, lon: -1.83 },
      { id: 'chi', name: 'Chicago', lat: 0.73, lon: -1.53 },
      { id: 'det', name: 'Detroit Hub', lat: 0.74, lon: -1.45 },
      { id: 'col', name: 'Columbus Hub', lat: 0.70, lon: -1.45 },
      { id: 'nyc', name: 'New York', lat: 0.71, lon: -1.29 },
      { id: 'tor', name: 'Toronto', lat: 0.76, lon: -1.38 },
      { id: 'mia', name: 'Miami', lat: 0.45, lon: -1.40 },
      // Central & South America
      { id: 'mex', name: 'Mexico City', lat: 0.34, lon: -1.73 },
      { id: 'bog', name: 'Bogota', lat: 0.08, lon: -1.29 },
      { id: 'sao', name: 'Sao Paulo', lat: -0.41, lon: -0.81 },
      { id: 'rio', name: 'Rio de Janeiro', lat: -0.40, lon: -0.75 },
      { id: 'bue', name: 'Buenos Aires', lat: -0.60, lon: -1.02 },
      { id: 'snt', name: 'Santiago', lat: -0.58, lon: -1.23 },
      // Europe
      { id: 'lon', name: 'London', lat: 0.90, lon: -0.002 },
      { id: 'dub', name: 'Dublin', lat: 0.93, lon: -0.11 },
      { id: 'par', name: 'Paris', lat: 0.85, lon: 0.04 },
      { id: 'ams', name: 'Amsterdam', lat: 0.91, lon: 0.08 },
      { id: 'fra', name: 'Frankfurt', lat: 0.87, lon: 0.15 },
      { id: 'muc', name: 'Munich Hub', lat: 0.84, lon: 0.20 },
      { id: 'zur', name: 'Zurich', lat: 0.82, lon: 0.15 },
      { id: 'mad', name: 'Madrid', lat: 0.71, lon: -0.06 },
      { id: 'sto', name: 'Stockholm', lat: 1.03, lon: 0.31 },
      { id: 'war', name: 'Warsaw', lat: 0.91, lon: 0.37 },
      // Middle East & Africa
      { id: 'cai', name: 'Cairo', lat: 0.52, lon: 0.55 },
      { id: 'dxb', name: 'Dubai', lat: 0.44, lon: 0.96 },
      { id: 'ruh', name: 'Riyadh', lat: 0.43, lon: 0.81 },
      { id: 'tlv', name: 'Tel Aviv', lat: 0.56, lon: 0.61 },
      { id: 'nbo', name: 'Nairobi', lat: -0.02, lon: 0.64 },
      { id: 'jnb', name: 'Johannesburg', lat: -0.46, lon: 0.49 },
      // Asia & Pacific
      { id: 'mum', name: 'Mumbai', lat: 0.33, lon: 1.27 },
      { id: 'del', name: 'Delhi', lat: 0.50, lon: 1.34 },
      { id: 'blr', name: 'Bengaluru', lat: 0.23, lon: 1.35 },
      { id: 'sin', name: 'Singapore', lat: 0.02, lon: 1.81 },
      { id: 'bkk', name: 'Bangkok', lat: 0.24, lon: 1.75 },
      { id: 'hkg', name: 'Hong Kong', lat: 0.39, lon: 2.00 },
      { id: 'sha', name: 'Shanghai', lat: 0.54, lon: 2.12 },
      { id: 'tpe', name: 'Taipei', lat: 0.44, lon: 2.12 },
      { id: 'tyo', name: 'Tokyo', lat: 0.62, lon: 2.44 },
      { id: 'sel', name: 'Seoul', lat: 0.65, lon: 2.22 },
      { id: 'syd', name: 'Sydney', lat: -0.59, lon: 2.64 },
      { id: 'mel', name: 'Melbourne', lat: -0.66, lon: 2.53 },
      { id: 'akl', name: 'Auckland', lat: -0.64, lon: 3.05 },
    ];

    // Extensive transcontinental and inter-hub network connections
    const routes = [
      // Trans-Pacific & Americas
      { from: 'sfo', to: 'tyo' },
      { from: 'sea', to: 'sfo' },
      { from: 'sfo', to: 'lax' },
      { from: 'lax', to: 'den' },
      { from: 'den', to: 'chi' },
      { from: 'chi', to: 'det' },
      { from: 'det', to: 'col' },
      { from: 'col', to: 'nyc' },
      { from: 'nyc', to: 'tor' },
      { from: 'nyc', to: 'mia' },
      { from: 'sfo', to: 'col' },
      { from: 'mia', to: 'mex' },
      { from: 'mex', to: 'bog' },
      { from: 'bog', to: 'sao' },
      { from: 'sao', to: 'rio' },
      { from: 'sao', to: 'bue' },
      { from: 'bue', to: 'snt' },
      { from: 'nyc', to: 'sao' },
      // Trans-Atlantic (Americas to Europe)
      { from: 'nyc', to: 'lon' },
      { from: 'tor', to: 'dub' },
      { from: 'det', to: 'muc' },
      { from: 'col', to: 'fra' },
      { from: 'mia', to: 'mad' },
      // European Grid
      { from: 'dub', to: 'lon' },
      { from: 'lon', to: 'par' },
      { from: 'lon', to: 'ams' },
      { from: 'par', to: 'fra' },
      { from: 'ams', to: 'fra' },
      { from: 'fra', to: 'muc' },
      { from: 'muc', to: 'zur' },
      { from: 'par', to: 'mad' },
      { from: 'fra', to: 'sto' },
      { from: 'fra', to: 'war' },
      // Europe to Middle East & Africa
      { from: 'muc', to: 'dxb' },
      { from: 'lon', to: 'dxb' },
      { from: 'par', to: 'cai' },
      { from: 'mad', to: 'cai' },
      { from: 'cai', to: 'dxb' },
      { from: 'dxb', to: 'ruh' },
      { from: 'dxb', to: 'tlv' },
      { from: 'cai', to: 'nbo' },
      { from: 'nbo', to: 'jnb' },
      { from: 'sao', to: 'jnb' },
      // Middle East to Asia
      { from: 'dxb', to: 'mum' },
      { from: 'dxb', to: 'sin' },
      { from: 'mum', to: 'del' },
      { from: 'mum', to: 'blr' },
      { from: 'blr', to: 'sin' },
      { from: 'del', to: 'bkk' },
      // Asia & Pacific Network
      { from: 'sin', to: 'bkk' },
      { from: 'sin', to: 'hkg' },
      { from: 'hkg', to: 'tpe' },
      { from: 'hkg', to: 'sha' },
      { from: 'sha', to: 'sel' },
      { from: 'sel', to: 'tyo' },
      { from: 'tpe', to: 'tyo' },
      { from: 'sin', to: 'syd' },
      { from: 'hkg', to: 'syd' },
      { from: 'syd', to: 'mel' },
      { from: 'syd', to: 'akl' },
      { from: 'tyo', to: 'syd' },
    ];

    // Continental landmass clusters for silhouette realism
    interface LandPoint {
      lat: number;
      lon: number;
      size: number;
      alpha: number;
    }
    const landPoints: LandPoint[] = [];

    const continentBases = [
      // North America
      { lat: 0.78, lon: -1.75, count: 65, spreadLat: 0.28, spreadLon: 0.50 },
      // Central / Caribbean
      { lat: 0.35, lon: -1.55, count: 25, spreadLat: 0.12, spreadLon: 0.22 },
      // South America
      { lat: -0.28, lon: -1.02, count: 55, spreadLat: 0.40, spreadLon: 0.28 },
      // Europe
      { lat: 0.87, lon: 0.22, count: 60, spreadLat: 0.20, spreadLon: 0.40 },
      // Scandinavia / North Europe
      { lat: 1.05, lon: 0.30, count: 30, spreadLat: 0.12, spreadLon: 0.25 },
      // Africa
      { lat: 0.15, lon: 0.42, count: 65, spreadLat: 0.45, spreadLon: 0.35 },
      // Middle East
      { lat: 0.46, lon: 0.85, count: 35, spreadLat: 0.18, spreadLon: 0.25 },
      // Central & South Asia (India)
      { lat: 0.36, lon: 1.36, count: 45, spreadLat: 0.18, spreadLon: 0.25 },
      // East Asia (China)
      { lat: 0.62, lon: 1.95, count: 70, spreadLat: 0.28, spreadLon: 0.42 },
      // Japan / Korea
      { lat: 0.64, lon: 2.38, count: 35, spreadLat: 0.12, spreadLon: 0.18 },
      // Southeast Asia
      { lat: 0.15, lon: 1.85, count: 40, spreadLat: 0.18, spreadLon: 0.30 },
      // Australia
      { lat: -0.46, lon: 2.34, count: 40, spreadLat: 0.22, spreadLon: 0.32 },
    ];

    continentBases.forEach(c => {
      for (let i = 0; i < c.count; i++) {
        landPoints.push({
          lat: c.lat + (Math.random() - 0.5) * c.spreadLat * 2,
          lon: c.lon + (Math.random() - 0.5) * c.spreadLon * 2,
          size: Math.random() * 4.5 + 2.5,
          alpha: Math.random() * 0.22 + 0.10,
        });
      }
    });

    // Realistic clustered city lights
    interface CityLight {
      lat: number;
      lon: number;
      size: number;
      brightness: number;
      warmth: number; // 0 = cyan/white, 1 = warm amber
    }
    const cityLights: CityLight[] = [];

    const cityClusters = [
      { lat: 0.72, lon: -1.35, count: 95, spread: 0.32 }, // Eastern US
      { lat: 0.65, lon: -2.10, count: 50, spread: 0.22 }, // US West Coast
      { lat: 0.70, lon: -1.60, count: 45, spread: 0.25 }, // US Midwest
      { lat: 0.88, lon: 0.15, count: 110, spread: 0.30 }, // Western Europe
      { lat: 0.62, lon: 2.15, count: 90, spread: 0.32 },  // East China
      { lat: 0.62, lon: 2.42, count: 55, spread: 0.18 },  // Japan
      { lat: 0.38, lon: 1.34, count: 60, spread: 0.25 },  // India
      { lat: 0.44, lon: 0.92, count: 45, spread: 0.22 },  // Gulf / Middle East
      { lat: -0.40, lon: -0.80, count: 45, spread: 0.24 },// Coastal Brazil
      { lat: -0.58, lon: 2.50, count: 35, spread: 0.20 }, // SE Australia
      { lat: 0.05, lon: 1.80, count: 35, spread: 0.18 },  // Singapore / SE Asia
      { lat: -0.45, lon: 0.50, count: 25, spread: 0.18 }, // South Africa
    ];

    cityClusters.forEach(c => {
      for (let i = 0; i < c.count; i++) {
        const u = Math.random() + Math.random();
        const r = (u > 1 ? 2 - u : u) * c.spread;
        const theta = Math.random() * Math.PI * 2;
        cityLights.push({
          lat: c.lat + r * Math.sin(theta),
          lon: c.lon + r * Math.cos(theta),
          size: Math.random() * 1.6 + 0.6,
          brightness: Math.random() * 0.8 + 0.25,
          warmth: Math.random() > 0.4 ? 1 : 0,
        });
      }
    });

    // Deep space stars
    interface Star {
      xRatio: number;
      yRatio: number;
      size: number;
      baseAlpha: number;
      phase: number;
      speed: number;
    }
    const stars: Star[] = [];
    for (let i = 0; i < 220; i++) {
      stars.push({
        xRatio: Math.random(),
        yRatio: Math.random(),
        size: Math.random() * 1.4 + 0.3,
        baseAlpha: Math.random() * 0.55 + 0.15,
        phase: Math.random() * Math.PI * 2,
        speed: 0.0006 + Math.random() * 0.001,
      });
    }

    // Moving data pulses along project routes
    interface RouteParticle {
      routeIndex: number;
      progress: number;
      speed: number;
      size: number;
      color: string;
    }
    const routeParticles: RouteParticle[] = [];
    for (let i = 0; i < 48; i++) {
      routeParticles.push({
        routeIndex: i % routes.length,
        progress: Math.random(),
        speed: 0.00035 + Math.random() * 0.00045, // Slow, calm 15-25s travels
        size: Math.random() * 1.8 + 1.2,
        color: i % 2 === 0 ? '#38BDF8' : '#0072CE',
      });
    }

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement.clientWidth || window.innerWidth;
      height = canvas.parentElement.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let rotationAngle = -0.85; // Initial rotation showing Europe, Atlantic, Americas
    let time = 0;

    // Unit 3D vector helper
    const getUnitVector = (lat: number, lon: number, currentRot: number) => {
      const curLon = lon + currentRot;
      const cosLat = Math.cos(lat);
      return {
        x: cosLat * Math.sin(curLon),
        y: Math.sin(lat),
        z: cosLat * Math.cos(curLon),
      };
    };

    // Spherical linear interpolation between two unit vectors
    const slerp = (
      v1: { x: number; y: number; z: number },
      v2: { x: number; y: number; z: number },
      t: number
    ) => {
      const dot = Math.max(-1, Math.min(1, v1.x * v2.x + v1.y * v2.y + v1.z * v2.z));
      const theta = Math.acos(dot);
      if (theta < 0.001) {
        return {
          x: v1.x * (1 - t) + v2.x * t,
          y: v1.y * (1 - t) + v2.y * t,
          z: v1.z * (1 - t) + v2.z * t,
          theta,
        };
      }
      const sinTheta = Math.sin(theta);
      const w1 = Math.sin((1 - t) * theta) / sinTheta;
      const w2 = Math.sin(t * theta) / sinTheta;
      return {
        x: v1.x * w1 + v2.x * w2,
        y: v1.y * w1 + v2.y * w2,
        z: v1.z * w1 + v2.z * w2,
        theta,
      };
    };

    // Project 3D vector onto screen with tilt and radius
    const projectPoint = (
      unitVec: { x: number; y: number; z: number },
      radius: number,
      cX: number,
      cY: number,
      tilt: number
    ) => {
      const x0 = radius * unitVec.x;
      const y0 = radius * unitVec.y;
      const z0 = radius * unitVec.z;

      const cosTilt = Math.cos(tilt);
      const sinTilt = Math.sin(tilt);

      const x = x0;
      const y = y0 * cosTilt - z0 * sinTilt;
      const z = y0 * sinTilt + z0 * cosTilt;

      return {
        x: cX + x,
        y: cY - y,
        z: z,
        visible: z > -radius * 0.12,
      };
    };

    const render = () => {
      time += 1;
      // Very slow rotation: ~180 seconds per revolution
      rotationAngle += 0.00015;

      ctx.clearRect(0, 0, width, height);

      // 1. Deep Space Canvas Gradient
      const spaceGrad = ctx.createRadialGradient(
        width * 0.5, height * 0.5, 60,
        width * 0.5, height * 0.5, Math.max(width, height) * 0.95
      );
      spaceGrad.addColorStop(0, '#050D24');
      spaceGrad.addColorStop(0.45, '#030819');
      spaceGrad.addColorStop(0.8, '#02040E');
      spaceGrad.addColorStop(1, '#010207');
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Distant Twinkling Stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const alpha = star.baseAlpha + Math.sin(time * star.speed + star.phase) * 0.2;
        ctx.fillStyle = `rgba(224, 242, 254, ${Math.max(0, Math.min(1, alpha))})`;
        ctx.beginPath();
        ctx.arc(star.xRatio * width, star.yRatio * height, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // =========================================================================
      // FULL-VIEWPORT EARTH GEOMETRY
      // Large globe spanning the entire viewport: extends naturally off-screen
      // Left, right, above, and below the centered login card are all clearly
      // populated with the globe surface, city lights, and network routes.
      // =========================================================================
      const R = Math.max(width * 0.52, height * 0.65, 540);
      const cX = width * 0.5;
      const cY = height * 0.5;
      const tilt = 0.22; // Subtle 12.6-degree axial perspective tilt

      // 3. Earth Outer Atmospheric Haze & Glowing Corona
      const atmosOuterGrad = ctx.createRadialGradient(cX, cY, R * 0.92, cX, cY, R * 1.30);
      atmosOuterGrad.addColorStop(0, 'rgba(0, 114, 206, 0.45)');
      atmosOuterGrad.addColorStop(0.25, 'rgba(6, 182, 212, 0.28)');
      atmosOuterGrad.addColorStop(0.55, 'rgba(30, 58, 138, 0.14)');
      atmosOuterGrad.addColorStop(0.85, 'rgba(3, 7, 18, 0.04)');
      atmosOuterGrad.addColorStop(1, 'rgba(1, 2, 8, 0)');

      ctx.fillStyle = atmosOuterGrad;
      ctx.beginPath();
      ctx.arc(cX, cY, R * 1.30, 0, Math.PI * 2);
      ctx.fill();

      // 4. Earth Globe Body
      ctx.save();
      ctx.beginPath();
      ctx.arc(cX, cY, R, 0, Math.PI * 2);
      ctx.clip();

      // Oceanic deep gradient with realistic night hemisphere lighting
      const earthGrad = ctx.createRadialGradient(
        cX - R * 0.25, cY - R * 0.25, R * 0.08,
        cX, cY, R
      );
      earthGrad.addColorStop(0, '#0F1E48'); // Deep illuminated oceanic navy
      earthGrad.addColorStop(0.5, '#091330');
      earthGrad.addColorStop(0.82, '#040A1C');
      earthGrad.addColorStop(1, '#020510');
      ctx.fillStyle = earthGrad;
      ctx.fill();

      // Subtle high-tech latitude / longitude grid lines (graticule)
      ctx.strokeStyle = 'rgba(0, 114, 206, 0.07)';
      ctx.lineWidth = 0.8;
      // Latitude circles
      const latSteps = [-1.0, -0.5, 0, 0.5, 1.0];
      latSteps.forEach(latVal => {
        ctx.beginPath();
        let first = true;
        for (let l = 0; l <= 64; l++) {
          const lonVal = (l / 64) * Math.PI * 2;
          const uVec = getUnitVector(latVal, lonVal, rotationAngle);
          const pt = projectPoint(uVec, R, cX, cY, tilt);
          if (pt.visible) {
            if (first) {
              ctx.moveTo(pt.x, pt.y);
              first = false;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      });

      // 5. Continental Landmass Silhouettes
      for (let i = 0; i < landPoints.length; i++) {
        const lp = landPoints[i];
        const uVec = getUnitVector(lp.lat, lp.lon, rotationAngle);
        const pt = projectPoint(uVec, R, cX, cY, tilt);
        if (pt.visible) {
          const depthAlpha = Math.max(0, pt.z / R);
          ctx.fillStyle = `rgba(30, 58, 138, ${lp.alpha * depthAlpha * 0.95})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, lp.size * (0.8 + depthAlpha * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 6. Realistic City Lights Clustered on Continents
      for (let i = 0; i < cityLights.length; i++) {
        const c = cityLights[i];
        const uVec = getUnitVector(c.lat, c.lon, rotationAngle);
        const pt = projectPoint(uVec, R, cX, cY, tilt);
        if (pt.visible) {
          const depthAlpha = Math.max(0, pt.z / R);
          const flicker = 0.85 + Math.sin(time * 0.015 + i) * 0.15;
          const alpha = c.brightness * depthAlpha * flicker * 0.9;

          ctx.fillStyle = c.warmth === 1
            ? `rgba(251, 191, 36, ${alpha})` // Warm golden amber city lights
            : `rgba(186, 230, 253, ${alpha})`; // Crisp cyan-white lights

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, c.size * (0.7 + depthAlpha * 0.4), 0, Math.PI * 2);
          ctx.fill();

          // Subtle glow on dense regional hubs
          if (c.size > 1.3 && alpha > 0.45) {
            ctx.fillStyle = c.warmth === 1
              ? `rgba(245, 158, 11, ${alpha * 0.28})`
              : `rgba(6, 182, 212, ${alpha * 0.28})`;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, c.size * 3.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 7. Projected 3D Global Project Hubs
      const hubData = new Map<string, {
        uVec: { x: number; y: number; z: number };
        pt: { x: number; y: number; z: number; visible: boolean };
      }>();

      hubs.forEach(h => {
        const uVec = getUnitVector(h.lat, h.lon, rotationAngle);
        const pt = projectPoint(uVec, R, cX, cY, tilt);
        hubData.set(h.id, { uVec, pt });
      });

      // 8. 3D Curved Glowing Blue Connection Arcs Between Global Project Hubs
      routes.forEach((route) => {
        const h1 = hubData.get(route.from);
        const h2 = hubData.get(route.to);
        if (!h1 || !h2) return;

        // Draw if at least partially facing camera
        if (h1.pt.z > -R * 0.25 || h2.pt.z > -R * 0.25) {
          const numSamples = 16;
          const points: { x: number; y: number; z: number; visible: boolean }[] = [];

          for (let s = 0; s <= numSamples; s++) {
            const t = s / numSamples;
            const interp = slerp(h1.uVec, h2.uVec, t);
            // Smooth arched elevation above spherical surface (peaking mid-route)
            const elevationFactor = Math.sin(Math.PI * t) * Math.min(0.14, interp.theta * 0.09);
            const rElevated = R * (1 + elevationFactor);
            const pt = projectPoint(interp, rElevated, cX, cY, tilt);
            points.push(pt);
          }

          // Draw the connection arc
          ctx.beginPath();
          let drawing = false;
          for (let s = 0; s < points.length; s++) {
            const p = points[s];
            if (p.visible) {
              if (!drawing) {
                ctx.moveTo(p.x, p.y);
                drawing = true;
              } else {
                ctx.lineTo(p.x, p.y);
              }
            } else {
              drawing = false;
            }
          }

          const avgZ = (h1.pt.z + h2.pt.z) * 0.5;
          const lineAlpha = Math.max(0.12, Math.min(0.75, (avgZ / R) * 0.65 + 0.3));

          // Base connection line with subtle dash
          ctx.strokeStyle = `rgba(0, 114, 206, ${lineAlpha * 0.7})`;
          ctx.lineWidth = 1.3;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Cyan glow halo
          ctx.strokeStyle = `rgba(6, 182, 212, ${lineAlpha * 0.32})`;
          ctx.lineWidth = 2.8;
          ctx.stroke();
        }
      });

      // 9. Traveling Data Packets / Pulses Along Project Routes
      routeParticles.forEach(p => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const route = routes[p.routeIndex];
        const h1 = hubData.get(route.from);
        const h2 = hubData.get(route.to);
        if (!h1 || !h2) return;

        if (h1.pt.z > -R * 0.15 && h2.pt.z > -R * 0.15) {
          const t = p.progress;
          const interp = slerp(h1.uVec, h2.uVec, t);
          const elevationFactor = Math.sin(Math.PI * t) * Math.min(0.14, interp.theta * 0.09);
          const rElevated = R * (1 + elevationFactor);
          const pt = projectPoint(interp, rElevated, cX, cY, tilt);

          if (pt.visible) {
            // Glowing pulse head
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Outer pulse halo
            ctx.fillStyle = 'rgba(6, 182, 212, 0.45)';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, p.size * 2.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // 10. Bright Blue Glowing Connection Nodes / Project Hubs
      hubs.forEach((h, idx) => {
        const d = hubData.get(h.id);
        if (!d || !d.pt.visible || d.pt.z < -R * 0.08) return;

        const depthScale = Math.max(0.5, d.pt.z / R);
        const nodePulse = (Math.sin(time * 0.025 + idx) + 1) * 0.5;

        // Outer glowing pulse ring
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.55 * (1 - nodePulse)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(d.pt.x, d.pt.y, (4.5 + nodePulse * 7) * depthScale, 0, Math.PI * 2);
        ctx.stroke();

        // Core bright blue dot
        ctx.fillStyle = '#0072CE';
        ctx.beginPath();
        ctx.arc(d.pt.x, d.pt.y, 3.5 * depthScale, 0, Math.PI * 2);
        ctx.fill();

        // Center white-cyan highlight
        ctx.fillStyle = '#E0F2FE';
        ctx.beginPath();
        ctx.arc(d.pt.x, d.pt.y, 1.8 * depthScale, 0, Math.PI * 2);
        ctx.fill();
      });

      // 11. Inner Atmospheric Shimmer (Limb Fresnel glow)
      const rimGrad = ctx.createRadialGradient(cX, cY, R * 0.88, cX, cY, R);
      rimGrad.addColorStop(0, 'rgba(0, 114, 206, 0)');
      rimGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.18)');
      rimGrad.addColorStop(1, 'rgba(56, 189, 248, 0.55)');
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(cX, cY, R, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 12. Subtle Orbital Data Arcs Encircling the Globe
      ctx.save();
      for (let oIdx = 0; oIdx < 2; oIdx++) {
        const orbitRadiusX = R * (1.14 + oIdx * 0.16);
        const orbitRadiusY = R * (0.36 + oIdx * 0.1);
        const orbitTilt = oIdx === 0 ? -0.22 : 0.26;

        ctx.translate(cX, cY);
        ctx.rotate(orbitTilt);

        ctx.beginPath();
        ctx.ellipse(0, 0, orbitRadiusX, orbitRadiusY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = oIdx === 0 ? 'rgba(0, 114, 206, 0.22)' : 'rgba(6, 182, 212, 0.16)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 10]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Small satellite or telemetry packet slowly gliding along the orbital ring
        const satAngle = (time * (0.00035 - oIdx * 0.00012) + oIdx * Math.PI * 0.7) % (Math.PI * 2);
        const satX = Math.cos(satAngle) * orbitRadiusX;
        const satY = Math.sin(satAngle) * orbitRadiusY;

        ctx.fillStyle = '#67E8F9';
        ctx.beginPath();
        ctx.arc(satX, satY, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
        ctx.beginPath();
        ctx.arc(satX, satY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.rotate(-orbitTilt);
        ctx.translate(-cX, -cY);
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      id="global-project-network-bg"
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
};
