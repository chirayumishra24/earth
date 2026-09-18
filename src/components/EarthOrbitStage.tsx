'use client';

import React from 'react';
import Image from 'next/image';
import { TeamInfo, TeamProgress } from '../types/game';
import { Sparkles, Zap, Trophy, Flame } from 'lucide-react';

interface EarthOrbitStageProps {
  team: TeamInfo;
  progress: TeamProgress;
  isLeading?: boolean;
}

export default function EarthOrbitStage({ team, progress, isLeading = false }: EarthOrbitStageProps) {
  const isBlue = team.id === 'northStar';

  // Each correct answer = 1 quarter lap = 90 degrees
  const angleDeg = progress.quarterLaps * 90;
  const radius = 105; // Orbit radius in pixels
  const center = 130; // Center offset

  // Convert to radians (0 deg = Top / 12 o'clock, clockwise)
  // angle in standard math: -90 deg is top
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const rocketX = center + radius * Math.cos(rad);
  const rocketY = center + radius * Math.sin(rad);

  // Tangent angle so rocket faces direction of clockwise orbital velocity
  const rocketRotation = angleDeg; // Facing forward clockwise

  // Current quarter marker (0, 1, 2, 3)
  const activeQuarter = progress.quarterLaps % 4;

  return (
    <div
      className={`relative clay-card p-4 sm:p-5 flex flex-col items-center justify-between w-full transition-all duration-300 ${
        isBlue ? 'border-sky-300 bg-sky-50/80' : 'border-orange-300 bg-orange-50/80'
      } ${progress.isWobbling ? 'animate-shake' : ''}`}
    >
      {/* Top Header: Team Badge & Live Lap Counter */}
      <div className="w-full flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{team.badge}</span>
          <div>
            <h3 className={`text-xs sm:text-sm font-black uppercase tracking-wider ${isBlue ? 'text-sky-900' : 'text-orange-900'}`}>
              {team.name}
            </h3>
            <span className="text-[10px] text-slate-500 font-bold block">
              {team.tagline}
            </span>
          </div>
        </div>

        {/* Big Clay Lap Badge */}
        <div
          className={`clay-card px-3.5 py-1.5 flex items-center gap-2 ${
            isBlue
              ? 'clay-blue text-white shadow-sky-400/40'
              : 'clay-orange text-white shadow-orange-400/40'
          }`}
        >
          <Trophy className="w-4 h-4 text-yellow-300 animate-bounce" />
          <div className="text-right">
            <div className="text-sm sm:text-base font-black leading-none tracking-tight">
              {progress.laps.toFixed(2)} <span className="text-[10px] font-bold opacity-90">LAPS</span>
            </div>
            <span className="text-[9px] font-bold opacity-90 block">
              {progress.quarterLaps} Quarters
            </span>
          </div>
        </div>
      </div>

      {/* Orbit Arena (Earth + Orbit Ring + Rocket) */}
      <div className="relative w-[260px] h-[260px] flex items-center justify-center my-1 select-none">
        {/* Orbital SVG Track */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 260 260">
          {/* Outer Atmosphere Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={isBlue ? 'rgba(56, 189, 248, 0.35)' : 'rgba(251, 146, 60, 0.35)'}
            strokeWidth="3"
            strokeDasharray="6 6"
          />

          {/* Active Orbit Arc highlight */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={isBlue ? '#0284c7' : '#ea580c'}
            strokeWidth="4"
            strokeDasharray={`${(progress.quarterLaps % 4) * (2 * Math.PI * radius / 4)} 1000`}
            strokeDashoffset="0"
            transform={`rotate(-90 ${center} ${center})`}
            className="transition-all duration-500"
          />

          {/* 4 Quarter Checkpoint Nodes */}
          {/* Top (Start/Finish) */}
          <circle
            cx={center}
            cy={center - radius}
            r={activeQuarter === 0 ? '7' : '5'}
            fill={activeQuarter === 0 ? (isBlue ? '#0284c7' : '#ea580c') : '#ffffff'}
            stroke={isBlue ? '#0284c7' : '#ea580c'}
            strokeWidth="2.5"
          />
          {/* Right (1/4 Lap - 90 deg) */}
          <circle
            cx={center + radius}
            cy={center}
            r={activeQuarter === 1 ? '7' : '5'}
            fill={activeQuarter === 1 ? (isBlue ? '#0284c7' : '#ea580c') : '#ffffff'}
            stroke={isBlue ? '#0284c7' : '#ea580c'}
            strokeWidth="2.5"
          />
          {/* Bottom (1/2 Lap - 180 deg) */}
          <circle
            cx={center}
            cy={center + radius}
            r={activeQuarter === 2 ? '7' : '5'}
            fill={activeQuarter === 2 ? (isBlue ? '#0284c7' : '#ea580c') : '#ffffff'}
            stroke={isBlue ? '#0284c7' : '#ea580c'}
            strokeWidth="2.5"
          />
          {/* Left (3/4 Lap - 270 deg) */}
          <circle
            cx={center - radius}
            cy={center}
            r={activeQuarter === 3 ? '7' : '5'}
            fill={activeQuarter === 3 ? (isBlue ? '#0284c7' : '#ea580c') : '#ffffff'}
            stroke={isBlue ? '#0284c7' : '#ea580c'}
            strokeWidth="2.5"
          />
        </svg>

        {/* 4 Quarter Marker Labels */}
        <span className="absolute top-1 text-[9px] font-black uppercase text-slate-500 bg-white/80 px-1.5 py-0.2 rounded shadow-sm">
          Finish / 0°
        </span>
        <span className="absolute right-0 text-[9px] font-black uppercase text-slate-500 bg-white/80 px-1.5 py-0.2 rounded shadow-sm">
          ¼ Lap
        </span>
        <span className="absolute bottom-1 text-[9px] font-black uppercase text-slate-500 bg-white/80 px-1.5 py-0.2 rounded shadow-sm">
          ½ Lap
        </span>
        <span className="absolute left-0 text-[9px] font-black uppercase text-slate-500 bg-white/80 px-1.5 py-0.2 rounded shadow-sm">
          ¾ Lap
        </span>

        {/* Center Stylized Earth Globe (Artwork provided by user) */}
        <div
          className={`relative w-[150px] h-[150px] rounded-full overflow-hidden border-4 border-white shadow-2xl transition-transform ${
            isBlue
              ? 'shadow-[0_0_35px_rgba(56,189,248,0.45)]'
              : 'shadow-[0_0_35px_rgba(251,146,60,0.45)]'
          }`}
        >
          <Image
            src="/images/stylized_earth.jpg"
            alt="Stylized Earth"
            fill
            priority
            className="object-cover object-center transform hover:rotate-6 transition-transform duration-700 scale-105"
          />
          {/* Soft atmospheric radial glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-sky-200/30 pointer-events-none" />
        </div>

        {/* Orbiting Rocket */}
        <div
          className="absolute z-20 pointer-events-none transition-all duration-700 ease-out flex items-center justify-center"
          style={{
            left: `${rocketX}px`,
            top: `${rocketY}px`,
            transform: `translate(-50%, -50%) rotate(${rocketRotation}deg)`,
          }}
        >
          {/* Rocket Ship Body */}
          <div
            className={`relative flex items-center justify-center transition-transform ${
              progress.isBoosting ? 'scale-125' : 'scale-100'
            }`}
          >
            {/* Thruster Flame Animation when Boosting */}
            {progress.isBoosting && (
              <div
                className="absolute -bottom-4 z-0 flex items-center justify-center animate-pulse"
                style={{ transform: 'rotate(180deg)' }}
              >
                <div
                  className={`w-3.5 h-6 rounded-full blur-[1px] animate-bounce ${
                    isBlue
                      ? 'bg-gradient-to-t from-cyan-300 via-sky-500 to-blue-600 shadow-[0_0_12px_#38bdf8]'
                      : 'bg-gradient-to-t from-yellow-300 via-orange-500 to-red-600 shadow-[0_0_12px_#fb923c]'
                  }`}
                />
              </div>
            )}

            {/* Custom 2D Vector Rocket Graphics */}
            <svg
              className="w-10 h-10 filter drop-shadow-md"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Rocket Nosecone & Fuselage */}
              <path
                d="M24 4 C18 14 16 26 16 36 L32 36 C32 26 30 14 24 4 Z"
                fill={isBlue ? '#0284c7' : '#ea580c'}
                stroke="#ffffff"
                strokeWidth="2"
              />
              {/* Nosecap Highlight */}
              <path d="M24 4 C21 10 20 14 20 16 L28 16 C28 14 27 10 24 4 Z" fill="#ffffff" />
              {/* Cockpit Glass Window */}
              <circle cx="24" cy="22" r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="25" cy="21" r="1.5" fill="#ffffff" />
              {/* Left Wing / Fin */}
              <path
                d="M16 26 L8 36 L16 34 Z"
                fill={isBlue ? '#0369a1' : '#c2410c'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              {/* Right Wing / Fin */}
              <path
                d="M32 26 L40 36 L32 34 Z"
                fill={isBlue ? '#0369a1' : '#c2410c'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              {/* Thruster Nozzle */}
              <rect x="20" y="36" width="8" height="4" rx="1.5" fill="#475569" stroke="#ffffff" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Live Feedback Bar */}
      <div className="w-full mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold">
          {progress.streak > 1 && (
            <span className="flex items-center gap-1 text-[11px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500 animate-bounce" />
              {progress.streak}x Streak!
            </span>
          )}
          {progress.isBoosting && (
            <span className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full animate-pulse">
              <Flame className="w-3 h-3 text-emerald-600 fill-emerald-600" />
              +¼ Lap Boost!
            </span>
          )}
          {progress.isWobbling && (
            <span className="text-[11px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
              Missed! 0 movement
            </span>
          )}
          {!progress.isBoosting && !progress.isWobbling && (
            <span className="text-slate-500 text-[11px] font-semibold">
              Answer correctly to advance ¼ lap
            </span>
          )}
        </div>

        <span className="text-[11px] font-mono font-black text-slate-700">
          {progress.correctAnswersCount} / {progress.totalAnswersCount} Correct
        </span>
      </div>
    </div>
  );
}
