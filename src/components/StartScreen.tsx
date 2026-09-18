'use client';

import React from 'react';
import Image from 'next/image';
import { Compass, Play, Globe, Database, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface StartScreenProps {
  onStart: () => void;
  onOpenGlobe: () => void;
  onOpenTeacherPanel: () => void;
}

export default function StartScreen({ onStart, onOpenGlobe, onOpenTeacherPanel }: StartScreenProps) {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 select-none">
      {/* Background Illustrated World Map Landscape with Light Aesthetic */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/map_background.jpg"
          alt="Globe Racers Background"
          fill
          priority
          className="object-cover object-center brightness-105 opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-sky-50/70 to-transparent" />
      </div>

      {/* Top Floating Badge Bar */}
      <div className="relative z-10 w-full flex flex-wrap items-center justify-between gap-3 pr-14 sm:pr-16">
        <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full shadow-[0_8px_16px_rgba(2,132,199,0.12),inset_0_2px_4px_rgba(255,255,255,0.9)] border-2 border-sky-100">
          <Globe className="w-4 h-4 text-sky-500 animate-spin" style={{ animationDuration: '20s' }} />
          <span className="text-xs sm:text-sm font-extrabold tracking-wider text-sky-900">
            CLASS 6 GEOGRAPHY • LOCATING PLACES ON THE EARTH
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              sounds.playClick();
              onOpenTeacherPanel();
            }}
            className="clay-green clay-btn text-white px-4 py-2 rounded-full text-xs font-black flex items-center gap-1.5 shadow-md"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Teacher Dashboard</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenGlobe();
            }}
            className="clay-blue clay-btn text-white px-4 py-2 rounded-full text-xs font-black flex items-center gap-1.5 shadow-md"
          >
            <span>🌍 Explore 3D Globe</span>
          </button>
        </div>
      </div>

      {/* Center Hero Title & Slogan */}
      <div className="relative z-10 max-w-3xl text-center flex flex-col items-center my-auto py-6">
        {/* Claymorphic 3D Title Board */}
        <div className="relative clay-card p-6 sm:p-8 mb-4 border-4 border-white/90 transform hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-center gap-2 text-amber-600 text-xs sm:text-sm font-black uppercase tracking-widest mb-1.5">
            <Compass className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '10s' }} />
            <span>Two-Team Educational Quiz Race</span>
            <Compass className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '10s' }} />
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-sky-600 via-blue-600 to-indigo-700 drop-shadow-[0_4px_8px_rgba(2,132,199,0.25)]">
            GLOBE RACERS
          </h1>

          <p className="mt-2 text-base sm:text-xl font-black text-amber-700 tracking-wide">
            5-Minute Quick-Answer Rocket Race • Orbit the Earth!
          </p>
        </div>

        {/* Topic Badges Pill Ribbon */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-xl">
          {['⏱️ 5-Minute Timer', '🚀 ¼ Lap Per Right Answer', '⚡ Quick Answer Mode', '🌍 Dual Earth Orbit', '🏆 Most Laps Wins'].map(
            (topic) => (
              <span
                key={topic}
                className="bg-white/95 border-2 border-sky-200 text-sky-800 text-[11px] sm:text-xs font-black px-3.5 py-1.5 rounded-full shadow-[0_4px_10px_rgba(2,132,199,0.1),inset_0_2px_4px_rgba(255,255,255,0.9)]"
              >
                {topic}
              </span>
            )
          )}
        </div>

        {/* Primary CTA: START RACE (Puffy Clay Button) */}
        <button
          onClick={() => {
            sounds.playClick();
            onStart();
          }}
          className="clay-green clay-btn group px-10 sm:px-14 py-4 text-white font-black text-xl sm:text-2xl rounded-2xl flex items-center gap-3 border-3 border-emerald-200 shadow-[0_14px_28px_rgba(16,185,129,0.4),inset_0_-6px_12px_rgba(5,150,105,0.4),inset_0_6px_12px_rgba(255,255,255,0.6)]"
        >
          <Play className="w-6 h-6 fill-white text-white group-hover:scale-110 transition-transform" />
          <span>START 5-MIN RACE →</span>
        </button>

        <p className="mt-3 text-xs sm:text-sm font-black text-slate-600 tracking-wider">
          2 Teams • 5-Minute Speed Quiz • Most Laps Wins
        </p>
      </div>

      {/* Racers & Teams Preview Card at bottom */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Team North Star Preview */}
        <div className="clay-blue-soft rounded-3xl p-3.5 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-3 border-white shadow-md shrink-0 bg-sky-200">
            <Image
              src="/images/north_star_explorer.jpg"
              alt="Team North Star"
              fill
              className="object-cover object-top"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-sky-800 uppercase">🔵 TEAM NORTH STAR</span>
              <span className="text-[10px] bg-sky-500 text-white px-2.5 py-0.5 rounded-full font-black shadow-sm">
                Racer 01
              </span>
            </div>
            <p className="text-xs text-sky-700 font-bold mt-0.5">Explore • Locate • Discover</p>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-sky-600 font-semibold">
              <span>🚀 Blue Orbit Cruiser Rocket</span>
            </div>
          </div>
        </div>

        {/* Team Earth Explorers Preview */}
        <div className="clay-orange-soft rounded-3xl p-3.5 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-3 border-white shadow-md shrink-0 bg-orange-200">
            <Image
              src="/images/earth_explorer.jpg"
              alt="Team Earth Explorers"
              fill
              className="object-cover object-top"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-orange-800 uppercase">🟠 TEAM EARTH EXPLORERS</span>
              <span className="text-[10px] bg-orange-500 text-white px-2.5 py-0.5 rounded-full font-black shadow-sm">
                Racer 02
              </span>
            </div>
            <p className="text-xs text-orange-700 font-bold mt-0.5">Find • Answer • Race</p>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-orange-600 font-semibold">
              <span>🚀 Orange Solar Falcon Rocket</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
