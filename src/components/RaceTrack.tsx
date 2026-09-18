'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Trophy, Flag, Compass, Sparkles } from 'lucide-react';

interface CheckpointCoord {
  id: number;
  name: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export const CHECKPOINTS: CheckpointCoord[] = [
  { id: 0, name: 'START', x: 4.5, y: 55 },
  { id: 1, name: '1', x: 10.5, y: 46 },
  { id: 2, name: '2', x: 17, y: 36 },
  { id: 3, name: '3', x: 23.5, y: 52 },
  { id: 4, name: '4', x: 29.5, y: 72 },
  { id: 5, name: '5', x: 36, y: 84 },
  { id: 6, name: '6', x: 42.5, y: 64 },
  { id: 7, name: '7', x: 49, y: 45 },
  { id: 8, name: '8', x: 55.5, y: 28 },
  { id: 9, name: '9', x: 62.5, y: 42 },
  { id: 10, name: '10', x: 69, y: 66 },
  { id: 11, name: '11', x: 75.5, y: 78 },
  { id: 12, name: '12', x: 82, y: 58 },
  { id: 13, name: '13', x: 87.5, y: 38 },
  { id: 14, name: '14', x: 92.5, y: 28 },
  { id: 15, name: 'FINISH', x: 96.5, y: 46 },
];

interface RaceTrackProps {
  northPosition: number; // 0 to 15
  earthPosition: number; // 0 to 15
  currentRound: number;
  maxRounds: number;
  onOpenGlobe?: () => void;
}

export default function RaceTrack({
  northPosition,
  earthPosition,
  currentRound,
  maxRounds,
  onOpenGlobe,
}: RaceTrackProps) {
  // Build SVG path string from checkpoints
  const svgPath = CHECKPOINTS.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Current checkpoint positions
  const northPt = CHECKPOINTS[Math.min(northPosition, CHECKPOINTS.length - 1)];
  const earthPt = CHECKPOINTS[Math.min(earthPosition, CHECKPOINTS.length - 1)];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden clay-card border-4 border-white select-none">
      {/* Background Illustrated World Map */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] md:aspect-[28/9] min-h-[220px] max-h-[380px]">
        <Image
          src="/images/map_background.jpg"
          alt="World Geography Race Adventure Map"
          fill
          priority
          className="object-cover object-center brightness-105 contrast-100 opacity-90"
        />

        {/* Subtle light overlay for classroom readability */}
        <div className="absolute inset-0 bg-sky-100/10 backdrop-blur-[0.2px]" />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          {/* Round Indicator Ribbon */}
          <div className="clay-amber text-slate-950 font-black px-4 py-1.5 rounded-full text-xs sm:text-sm flex items-center gap-1.5 pointer-events-auto shadow-md">
            <Sparkles className="w-4 h-4 text-amber-900" />
            <span>ROUND {currentRound} / {maxRounds}</span>
          </div>

          {/* Central Title Plaque */}
          <div className="hidden md:flex bg-white/95 px-4 py-1.5 rounded-2xl border-2 border-white text-sky-900 font-black text-xs uppercase tracking-wider items-center gap-2 shadow-[0_6px_14px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(255,255,255,0.9)]">
            <Compass className="w-4 h-4 text-sky-500 animate-spin" style={{ animationDuration: '15s' }} />
            <span>Race Across The Earth • 15 Checkpoints</span>
          </div>

          {/* 3D Globe Button */}
          {onOpenGlobe && (
            <button
              onClick={onOpenGlobe}
              className="clay-blue clay-btn text-white font-bold text-xs px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 pointer-events-auto shadow-md"
            >
              <span className="text-base">🌍</span>
              <span>View 3D Globe</span>
            </button>
          )}
        </div>

        {/* SVG Route Track */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Background route glow */}
          <path
            d={svgPath}
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1.5 2"
            className="opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
          />
          {/* Team North Star trail */}
          <path
            d={CHECKPOINTS.slice(0, Math.min(northPosition + 1, CHECKPOINTS.length)).reduce(
              (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
              ''
            )}
            fill="none"
            stroke="#0284c7"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          />
          {/* Team Earth Explorers trail */}
          <path
            d={CHECKPOINTS.slice(0, Math.min(earthPosition + 1, CHECKPOINTS.length)).reduce(
              (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
              ''
            )}
            fill="none"
            stroke="#ea580c"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          />
        </svg>

        {/* Checkpoint Nodes along the route */}
        {CHECKPOINTS.map((pt) => {
          const isStart = pt.id === 0;
          const isFinish = pt.id === 15;
          const isNorthPast = northPosition >= pt.id;
          const isEarthPast = earthPosition >= pt.id;

          let ringStyle =
            'bg-white text-slate-700 shadow-[0_6px_12px_rgba(0,0,0,0.1),inset_0_-3px_6px_rgba(0,0,0,0.06),inset_0_3px_6px_rgba(255,255,255,0.95)] border-2 border-white';
          if (isNorthPast && isEarthPast) {
            ringStyle =
              'bg-purple-600 text-white shadow-[0_8px_16px_rgba(147,51,234,0.35),inset_0_-4px_8px_rgba(88,28,135,0.4),inset_0_4px_8px_rgba(255,255,255,0.4)] border-2 border-purple-200';
          } else if (isNorthPast) {
            ringStyle = 'clay-blue text-white';
          } else if (isEarthPast) {
            ringStyle = 'clay-orange text-white';
          }

          return (
            <div
              key={pt.id}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 hover:scale-125"
              style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
            >
              {isStart ? (
                <div className="clay-green text-white font-black text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-xl shadow-md flex items-center gap-1">
                  <Flag className="w-3 h-3 text-emerald-100" />
                  <span>START</span>
                </div>
              ) : isFinish ? (
                <div className="clay-amber text-slate-900 font-black text-[10px] sm:text-xs px-2.5 sm:px-3.5 py-1 rounded-2xl shadow-lg flex items-center gap-1 animate-bounce">
                  <Trophy className="w-3.5 h-3.5 text-amber-950" />
                  <span>FINISH</span>
                </div>
              ) : (
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-black text-[10px] sm:text-xs transition-all ${ringStyle}`}
                >
                  {pt.name}
                </div>
              )}
            </div>
          );
        })}

        {/* TEAM NORTH STAR VEHICLE (Blue Buggy) */}
        <motion.div
          className="absolute z-20 pointer-events-none"
          initial={false}
          animate={{
            left: `${northPt.x}%`,
            top: `${northPt.y}%`,
          }}
          transition={{
            type: 'spring',
            stiffness: 90,
            damping: 15,
          }}
          style={{
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="relative -mb-1 flex flex-col items-center">
            {/* Team label banner */}
            <span className="bg-sky-600 text-white font-extrabold text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-md border border-white shadow-md mb-0.5 whitespace-nowrap">
              🔵 North Star #{northPosition}
            </span>
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 drop-shadow-xl">
              <Image
                src="/images/blue_vehicle.jpg"
                alt="North Star Racer"
                fill
                className="object-contain rounded-lg"
              />
            </div>
          </div>
        </motion.div>

        {/* TEAM EARTH EXPLORERS VEHICLE (Orange Buggy) */}
        <motion.div
          className="absolute z-20 pointer-events-none"
          initial={false}
          animate={{
            left: `${earthPt.x}%`,
            top: `${earthPt.y}%`,
          }}
          transition={{
            type: 'spring',
            stiffness: 90,
            damping: 15,
          }}
          style={{
            transform: 'translate(-50%, 0%)', // slightly lower offset so vehicles don't completely overlap
          }}
        >
          <div className="relative mt-0.5 flex flex-col items-center">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 drop-shadow-xl">
              <Image
                src="/images/orange_vehicle.jpg"
                alt="Earth Explorers Racer"
                fill
                className="object-contain rounded-lg"
              />
            </div>
            {/* Team label banner */}
            <span className="bg-orange-600 text-white font-extrabold text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-md border border-white shadow-md mt-0.5 whitespace-nowrap">
              🟠 Explorers #{earthPosition}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
