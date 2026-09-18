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

  // Current quarter marker (0 = Finish/0°, 1 = 1/4 Lap, 2 = 1/2 Lap, 3 = 3/4 Lap)
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

      {/* Orbit Arena (Earth + Orbit Ring + Top Rocket) */}
      <div className="relative w-[270px] h-[270px] flex items-center justify-center my-1 select-none">
        {/* Orbital SVG Track */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 270 270">
          {/* Outer Atmosphere Ring */}
          <circle
            cx="135"
            cy="135"
            r="105"
            fill="none"
            stroke={isBlue ? 'rgba(56, 189, 248, 0.35)' : 'rgba(251, 146, 60, 0.35)'}
            strokeWidth="3"
            strokeDasharray="6 6"
          />

          {/* Active Orbit Arc highlight */}
          <circle
            cx="135"
            cy="135"
            r="105"
            fill="none"
            stroke={isBlue ? '#0284c7' : '#ea580c'}
            strokeWidth="4"
            strokeDasharray={`${(progress.quarterLaps % 4) * (2 * Math.PI * 105 / 4)} 1000`}
            strokeDashoffset="0"
            transform="rotate(-90 135 135)"
            className="transition-all duration-700"
          />

          {/* 4 Quarter Checkpoint Nodes */}
          {/* Top (Start/Finish - 0 deg) */}
          <circle
            cx="135"
            cy="30"
            r={activeQuarter === 0 ? '7' : '5'}
            fill={activeQuarter === 0 ? (isBlue ? '#0284c7' : '#ea580c') : '#ffffff'}
            stroke={isBlue ? '#0284c7' : '#ea580c'}
            strokeWidth="2.5"
          />
          {/* Right (1/4 Lap - 90 deg) */}
          <circle
            cx="240"
            cy="135"
            r={activeQuarter === 1 ? '7' : '5'}
            fill={activeQuarter === 1 ? (isBlue ? '#0284c7' : '#ea580c') : '#ffffff'}
            stroke={isBlue ? '#0284c7' : '#ea580c'}
            strokeWidth="2.5"
          />
          {/* Bottom (1/2 Lap - 180 deg) */}
          <circle
            cx="135"
            cy="240"
            r={activeQuarter === 2 ? '7' : '5'}
            fill={activeQuarter === 2 ? (isBlue ? '#0284c7' : '#ea580c') : '#ffffff'}
            stroke={isBlue ? '#0284c7' : '#ea580c'}
            strokeWidth="2.5"
          />
          {/* Left (3/4 Lap - 270 deg) */}
          <circle
            cx="30"
            cy="135"
            r={activeQuarter === 3 ? '7' : '5'}
            fill={activeQuarter === 3 ? (isBlue ? '#0284c7' : '#ea580c') : '#ffffff'}
            stroke={isBlue ? '#0284c7' : '#ea580c'}
            strokeWidth="2.5"
          />
        </svg>

        {/* 4 Quarter Marker Labels */}
        <span className="absolute top-0 text-[9px] font-black uppercase text-slate-500 bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-slate-100 z-10">
          Finish / 0°
        </span>
        <span className="absolute right-1 text-[9px] font-black uppercase text-slate-500 bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-slate-100 z-10">
          ¼ Lap
        </span>
        <span className="absolute bottom-0 text-[9px] font-black uppercase text-slate-500 bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-slate-100 z-10">
          ½ Lap
        </span>
        <span className="absolute left-1 text-[9px] font-black uppercase text-slate-500 bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-slate-100 z-10">
          ¾ Lap
        </span>

        {/* Center Stylized Earth Globe (Rotates as laps advance) */}
        <div
          className={`relative w-[155px] h-[155px] rounded-full flex items-center justify-center transition-transform duration-1000 ease-out select-none ${
            isBlue
              ? 'filter drop-shadow-[0_0_24px_rgba(56,189,248,0.5)]'
              : 'filter drop-shadow-[0_0_24px_rgba(251,146,60,0.5)]'
          }`}
          style={{
            transform: `rotate(${progress.quarterLaps * 90}deg)`,
          }}
        >
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image
              src="/images/earth_globe_clean.png"
              alt="Stylized Clean Earth Globe"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>

        {/* Top Floating Rocket (Fixed at 12 o'clock, bobs up and down with animated smoke) */}
        <div className="absolute top-[8px] left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
          <div className="relative flex flex-col items-center animate-rocket-bob">
            {/* Rocket Image */}
            <div
              className={`relative w-14 h-14 sm:w-16 sm:h-16 transition-transform duration-300 ${
                progress.isBoosting ? 'scale-115 -translate-y-1' : 'scale-100'
              }`}
            >
              <Image
                src={isBlue ? '/images/rocket_clean.png' : '/images/rocket_orange.png'}
                alt={`${team.name} Rocket`}
                fill
                priority
                className="object-contain filter drop-shadow-md"
              />
            </div>

            {/* Thruster Flame & Billowing Smoke Particles */}
            <div className="relative -mt-2 flex flex-col items-center">
              {/* Flame Jet */}
              <div
                className={`transition-all duration-200 rounded-full blur-[0.5px] ${
                  progress.isBoosting
                    ? 'h-7 w-3.5 opacity-100 animate-flame-flicker scale-110'
                    : 'h-3.5 w-2 opacity-75 animate-pulse'
                } ${
                  isBlue
                    ? 'bg-gradient-to-b from-white via-cyan-300 to-blue-600 shadow-[0_0_12px_#38bdf8]'
                    : 'bg-gradient-to-b from-white via-yellow-300 to-orange-600 shadow-[0_0_12px_#fb923c]'
                }`}
              />

              {/* Animated Smoke Puffs */}
              <div className="relative w-10 h-7 -mt-1 pointer-events-none flex items-center justify-center">
                {/* Center Puff */}
                <div className="absolute w-3.5 h-3.5 rounded-full bg-slate-300/80 blur-[1px] animate-smoke-center" />
                {/* Left Puff */}
                <div className="absolute w-3 h-3 rounded-full bg-slate-300/70 blur-[1px] animate-smoke-left" />
                {/* Right Puff */}
                <div className="absolute w-3 h-3 rounded-full bg-slate-300/70 blur-[1px] animate-smoke-right" />
              </div>
            </div>
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
