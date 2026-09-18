'use client';

import React from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, RotateCcw, Globe, Sparkles, Database } from 'lucide-react';

interface ScoreboardProps {
  secondsLeft: number;
  northLaps: number;
  northQuarters: number;
  earthLaps: number;
  earthQuarters: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRestart: () => void;
  onOpenGlobe: () => void;
  onOpenTeacherPanel?: () => void;
  gameCode?: string | null;
  globeStyle?: 'stylized' | 'nasa';
  onToggleGlobeStyle?: () => void;
}

export default function Scoreboard({
  secondsLeft,
  northLaps,
  northQuarters,
  earthLaps,
  earthQuarters,
  soundEnabled,
  onToggleSound,
  onRestart,
  onOpenGlobe,
  onOpenTeacherPanel,
  gameCode,
  globeStyle = 'stylized',
  onToggleGlobeStyle,
}: ScoreboardProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isDanger = secondsLeft <= 20;
  const isUrgent = secondsLeft <= 60 && !isDanger;

  return (
    <div className="w-full clay-card px-5 py-3 flex flex-wrap items-center justify-between gap-3 mb-4 select-none border-3 border-white">
      {/* Team North Star Score Pill */}
      <div className="flex items-center gap-3 clay-blue-soft px-4 py-2 rounded-2xl">
        <div className="text-2xl filter drop-shadow-sm">🔵</div>
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-sky-800 block">
            Team North Star
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-lg sm:text-xl font-black text-sky-950">
              {northLaps.toFixed(2)} <span className="text-xs text-sky-600 font-bold">Laps</span>
            </span>
            <span className="text-[10px] font-bold text-slate-500 font-mono">
              ({northQuarters} Q)
            </span>
          </div>
        </div>
      </div>

      {/* Center 5-Minute Match Timer Digital Countdown & Code Badge */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-2.5 px-6 py-2 rounded-2xl border-2 transition-all ${
              isDanger
                ? 'bg-rose-500 text-white border-rose-300 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                : isUrgent
                ? 'clay-amber text-slate-950 animate-pulse'
                : 'clay-card bg-white/95 text-slate-800 border-sky-200'
            }`}
          >
            <span className="text-xs font-black uppercase tracking-wider opacity-85">Match Timer:</span>
            <span className="font-mono text-2xl sm:text-3xl font-black tracking-wider drop-shadow-sm">
              {timeFormatted}
            </span>
          </div>

          {gameCode && (
            <div className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-700 text-xs font-bold font-mono flex items-center gap-1 shadow-sm">
              <span className="text-[10px] text-amber-600 uppercase">CODE:</span>
              <span>{gameCode}</span>
            </div>
          )}
        </div>

        {secondsLeft <= 60 && secondsLeft > 0 && (
          <div className="px-3 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-1 shadow-sm animate-pulse">
            <Sparkles className="w-3 h-3 text-yellow-300" />
            <span>FINAL MINUTE BLITZ: DOUBLE LAPS (+½ LAP / 180°)!</span>
          </div>
        )}
      </div>

      {/* Team Earth Explorers Score Pill */}
      <div className="flex items-center gap-3 clay-orange-soft px-4 py-2 rounded-2xl">
        <div className="text-2xl filter drop-shadow-sm">🟠</div>
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-orange-800 block">
            Earth Explorers
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-lg sm:text-xl font-black text-orange-950">
              {earthLaps.toFixed(2)} <span className="text-xs text-orange-600 font-bold">Laps</span>
            </span>
            <span className="text-[10px] font-bold text-slate-500 font-mono">
              ({earthQuarters} Q)
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls: NASA/Cartoon Toggle, Teacher Panel, Sound, 3D Globe, Restart */}
      <div className="flex items-center gap-2">
        {onToggleGlobeStyle && (
          <button
            onClick={onToggleGlobeStyle}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all clay-btn ${
              globeStyle === 'nasa'
                ? 'bg-slate-900 text-cyan-300 border-2 border-cyan-400/50 shadow-sm'
                : 'bg-white text-emerald-700 border-2 border-emerald-300 shadow-sm'
            }`}
            title="Toggle between NASA Satellite Earth and Cartoon Stylized Earth"
          >
            <span>{globeStyle === 'nasa' ? '🛰️ NASA Earth' : '🎨 Cartoon Earth'}</span>
          </button>
        )}

        <Link
          href="/teacher"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl clay-green clay-btn text-white shadow-sm flex items-center justify-center"
          title="Teacher Dashboard / Manage Questions (New Tab)"
        >
          <Database className="w-4 h-4" />
        </Link>

        <button
          onClick={onOpenGlobe}
          className="p-2.5 rounded-xl clay-blue clay-btn text-white shadow-sm"
          title="Open 3D Globe"
        >
          <Globe className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleSound}
          className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 shadow-sm border-2 border-slate-100 transition-all clay-btn"
          title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>

        <button
          onClick={onRestart}
          className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 shadow-sm border-2 border-slate-100 transition-all clay-btn"
          title="Restart Match"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
