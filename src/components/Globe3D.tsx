'use client';

import React, { useRef, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { X, RotateCcw, Info, Map, Globe, Sparkles } from 'lucide-react';

// Dynamic import of Leaflet Map with SSR disabled
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-950 text-white gap-3 rounded-2xl">
      <div className="w-9 h-9 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-black tracking-wider uppercase text-sky-300">
        Loading Realistic Satellite Earth (Leaflet)...
      </span>
    </div>
  ),
});

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
      const theta = (i / segments) * Math.PI * 2;
      const x = radius * Math.sin(theta) * Math.cos(rad);
      const y = radius * Math.cos(theta);
      const z = radius * Math.sin(theta) * Math.sin(rad);
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

// Main Interactive 3D Globe with Photorealistic NASA Satellite Daymap
function EarthMesh({ autoRotate }: { autoRotate: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const texture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/images/earth_nasa_texture.jpg');
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
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
        {/* Photorealistic 3D Earth Sphere */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[2, 64, 64]} />
          {texture ? (
            <meshStandardMaterial map={texture} roughness={0.65} metalness={0.05} />
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

        {/* Prime Meridian */}
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
          <div className="bg-blue-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-full shadow-lg border border-white">
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
  const [viewMode, setViewMode] = useState<'leaflet' | '3d'>('leaflet');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  const content = (
    <div className="relative w-full h-full flex flex-col rounded-3xl overflow-hidden shadow-2xl border-4 border-sky-300 clay-card bg-slate-950">
      {/* Top Controls Header */}
      <div className="px-4 py-3 bg-white/95 border-b border-sky-200 flex flex-wrap items-center justify-between gap-3 shadow-md z-20">
        <div className="flex items-center gap-2">
          {/* Mode Switcher Buttons */}
          <div className="clay-card bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('leaflet')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                viewMode === 'leaflet'
                  ? 'clay-blue text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>🛰️ Satellite Map (Leaflet)</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                viewMode === '3d'
                  ? 'clay-blue text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>🌐 3D Orbital Earth</span>
            </button>
          </div>

          <span className="text-slate-500 text-xs hidden md:inline font-bold">
            {viewMode === 'leaflet' ? '(Pan, Zoom & Inspect Continents)' : '(Drag to rotate • Scroll to zoom)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === '3d' && (
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className="px-3 py-1.5 clay-blue clay-btn text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition-all"
              title="Toggle rotation"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
              {autoRotate ? 'Pause Spin' : 'Auto Spin'}
            </button>
          )}

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow transition-all clay-btn"
              title="Close Explorer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full h-full flex-1 relative overflow-hidden bg-slate-950">
        {viewMode === 'leaflet' ? (
          <LeafletMap />
        ) : (
          <div className="w-full h-full flex-1">
            <Canvas camera={{ position: [0, 1.5, 5], fov: 45 }}>
              <ambientLight intensity={1.5} />
              <directionalLight position={[10, 10, 5]} intensity={2.2} />
              <directionalLight position={[-10, -10, -5]} intensity={0.6} />
              <EarthMesh autoRotate={autoRotate} />
              <OrbitControls enablePan={false} minDistance={3} maxDistance={8} />
            </Canvas>

            {/* 3D Bottom Legend Bar */}
            <div className="absolute bottom-0 left-0 right-0 clay-card bg-white/95 px-4 py-2 border-t border-sky-200 flex flex-wrap items-center justify-center gap-4 text-xs font-black z-10 shadow-lg">
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
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
        <div className="w-full max-w-5xl h-[88vh] max-h-[750px] relative">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
