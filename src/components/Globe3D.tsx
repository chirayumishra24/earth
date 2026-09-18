'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { X, RotateCcw, Info } from 'lucide-react';

// Procedural Canvas Texture for stylized continents & oceans
function createGlobeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Deep ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#0c4a6e');
  oceanGrad.addColorStop(0.5, '#0284c7');
  oceanGrad.addColorStop(1, '#075985');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle longitude & latitude grid on texture
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * canvas.width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Draw simplified landmasses (Continents in friendly vibrant green/tan)
  ctx.fillStyle = '#22c55e';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 10;

  // North America
  ctx.beginPath();
  ctx.ellipse(500, 320, 180, 120, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // South America
  ctx.beginPath();
  ctx.ellipse(650, 680, 110, 180, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Europe
  ctx.beginPath();
  ctx.ellipse(1100, 290, 120, 90, 0, 0, Math.PI * 2);
  ctx.fill();

  // Africa
  ctx.beginPath();
  ctx.ellipse(1130, 560, 150, 190, 0, 0, Math.PI * 2);
  ctx.fill();

  // Asia
  ctx.beginPath();
  ctx.ellipse(1450, 330, 240, 150, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Australia
  ctx.beginPath();
  ctx.ellipse(1650, 720, 100, 75, 0, 0, Math.PI * 2);
  ctx.fill();

  // Antarctica (polar ice)
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, canvas.height - 70, canvas.width, 70);

  // Arctic ice
  ctx.fillRect(0, 0, canvas.width, 50);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// 3D Latitude Ring
function LatitudeRing({ lat, color, label, radius = 2.02 }: { lat: number; color: string; label?: string; radius?: number }) {
  const phi = (90 - lat) * (Math.PI / 180);
  const ringRadius = radius * Math.sin(phi);
  const y = radius * Math.cos(phi);

  const points = useMemo(() => {
    const pts = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(ringRadius * Math.cos(theta), y, ringRadius * Math.sin(theta)));
    }
    return pts;
  }, [ringRadius, y]);

  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <group>
      <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color, linewidth: 2 }))} />
      {label && (
        <Html position={[ringRadius * 1.05, y, 0]} center>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow" style={{ backgroundColor: color }}>
            {label}
          </span>
        </Html>
      )}
    </group>
  );
}

// 3D Longitude Meridian Ring
function LongitudeRing({ lon, color, label, radius = 2.02 }: { lon: number; color: string; label?: string; radius?: number }) {
  const rad = lon * (Math.PI / 180);

  const points = useMemo(() => {
    const pts = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const phi = (i / segments) * Math.PI * 2;
      const x = radius * Math.cos(phi) * Math.sin(rad);
      const y = radius * Math.sin(phi);
      const z = radius * Math.cos(phi) * Math.cos(rad);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, [rad, radius]);

  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <group>
      <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color, linewidth: 2 }))} />
      {label && (
        <Html position={[0, radius * 1.05, 0]} center>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow" style={{ backgroundColor: color }}>
            {label}
          </span>
        </Html>
      )}
    </group>
  );
}

// Main Interactive Globe mesh
function EarthMesh({ autoRotate }: { autoRotate: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const texture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return createGlobeTexture();
  }, []);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    // Tilt Earth axis by 23.5 degrees!
    <group rotation={[0, 0, (23.5 * Math.PI) / 180]}>
      <group ref={groupRef}>
        {/* Earth Sphere */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[2, 64, 64]} />
          {texture ? (
            <meshStandardMaterial map={texture} roughness={0.6} metalness={0.1} />
          ) : (
            <meshStandardMaterial color="#0284c7" />
          )}
        </mesh>

        {/* Layered Atmospheric Glow Shells */}
        <mesh scale={1.035}>
          <sphereGeometry args={[2, 32, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} side={THREE.BackSide} />
        </mesh>
        <mesh scale={1.07}>
          <sphereGeometry args={[2, 32, 32]} />
          <meshBasicMaterial color="#0284c7" transparent opacity={0.12} side={THREE.BackSide} />
        </mesh>

        {/* Key Parallels of Latitude */}
        <LatitudeRing lat={0} color="#ef4444" label="Equator (0°)" />
        <LatitudeRing lat={23.5} color="#f59e0b" label="Tropic of Cancer (23½° N)" />
        <LatitudeRing lat={-23.5} color="#f59e0b" label="Tropic of Capricorn (23½° S)" />
        <LatitudeRing lat={66.5} color="#06b6d4" label="Arctic Circle (66½° N)" />
        <LatitudeRing lat={-66.5} color="#06b6d4" label="Antarctic Circle (66½° S)" />

        {/* Prime Meridian & Anti-meridian */}
        <LongitudeRing lon={0} color="#10b981" label="Prime Meridian (0°)" />

        {/* Axis of rotation line */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 5.2, 16]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>

        {/* North Pole Pin */}
        <Html position={[0, 2.65, 0]} center>
          <div className="bg-blue-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-full shadow-lg border border-white">
            📍 North Pole (90° N)
          </div>
        </Html>
        {/* South Pole Pin */}
        <Html position={[0, -2.65, 0]} center>
          <div className="bg-blue-800 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-full shadow-lg border border-white">
            📍 South Pole (90° S)
          </div>
        </Html>
      </group>
    </group>
  );
}

interface Globe3DProps {
  onClose?: () => void;
  isModal?: boolean;
}

export default function Globe3D({ onClose, isModal = false }: Globe3DProps) {
  const [autoRotate, setAutoRotate] = useState(true);

  const content = (
    <div className="relative w-full h-full min-h-[420px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-sky-300 clay-card flex flex-col">
      {/* Top Header Controls */}
      <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="clay-card bg-white/95 px-3.5 py-1.5 border border-sky-200 flex items-center gap-2 pointer-events-auto shadow-md">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-800 font-black text-sm tracking-wide">3D Interactive Earth Model</span>
          <span className="text-slate-500 text-xs hidden sm:inline font-bold">(Drag to rotate • Scroll to zoom)</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="px-3 py-1.5 clay-blue clay-btn text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition-all"
            title="Toggle rotation"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            {autoRotate ? 'Pause Spin' : 'Auto Spin'}
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow transition-all clay-btn"
              title="Close Globe"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-full flex-1 bg-slate-950">
        <Canvas camera={{ position: [0, 1.5, 5], fov: 45 }}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[10, 10, 5]} intensity={1.8} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />
          <EarthMesh autoRotate={autoRotate} />
          <OrbitControls enablePan={false} minDistance={3} maxDistance={8} />
        </Canvas>
      </div>

      {/* Bottom Legend Bar */}
      <div className="clay-card bg-white/95 px-4 py-2.5 border-t border-sky-200 flex flex-wrap items-center justify-center gap-4 text-xs font-black z-20">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow-sm" />
          <span className="text-red-700">Equator (0°)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm" />
          <span className="text-amber-700">Tropics (23½° N / S)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block shadow-sm" />
          <span className="text-cyan-700">Polar Circles (66½°)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm" />
          <span className="text-emerald-700">Prime Meridian (0°)</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 font-bold">
          <Info className="w-3.5 h-3.5 text-sky-500" />
          <span>Axis tilted at 23.5°</span>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
        <div className="w-full max-w-4xl h-[85vh] max-h-[700px] relative">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
