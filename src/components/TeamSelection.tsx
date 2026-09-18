'use client';

import React from 'react';
import Image from 'next/image';
import { TeamId } from '../types/game';
import { sounds } from '../utils/audio';
import { Users, Sparkles, Check, ArrowRight } from 'lucide-react';

interface TeamSelectionProps {
  onSelectTeam: (team: TeamId | 'spectator') => void;
}

export default function TeamSelection({ onSelectTeam }: TeamSelectionProps) {
  return (
    <div className="w-full min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-8 select-none">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="clay-card px-4 py-1.5 text-amber-700 border-amber-200 text-xs font-black uppercase tracking-wider inline-block">
          Classroom Race Setup
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-800 mt-2 tracking-tight">
          CHOOSE YOUR TEAM
        </h2>
        <p className="text-slate-600 text-sm sm:text-base font-bold mt-1">
          Pick your explorer crew or race side-by-side with your classroom partner!
        </p>
      </div>

      {/* Team Cards with VS Divider */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-6 relative">
        {/* BLUE TEAM: NORTH STAR */}
        <div className="flex-1 w-full clay-blue-soft rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center transition-transform hover:scale-[1.02]">
          <span className="clay-blue text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest shadow mb-3">
            Team 01
          </span>
          <div className="text-2xl mb-1">🔵</div>
          <h3 className="text-2xl sm:text-3xl font-black text-sky-900 uppercase tracking-wide">
            TEAM NORTH STAR
          </h3>
          <p className="text-sky-700 text-xs sm:text-sm font-black tracking-wider mt-1">
            Explore • Locate • Discover
          </p>

          {/* Character & Buggy illustration showcase */}
          <div className="my-5 relative w-44 h-44 rounded-2xl overflow-hidden clay-card p-1.5 border-2 border-sky-300 bg-white shadow-xl">
            <div className="relative w-full h-full rounded-xl overflow-hidden">
              <Image
                src="/images/north_star_explorer.jpg"
                alt="Team North Star Explorer"
                fill
                priority
                className="object-cover object-top"
              />
            </div>
          </div>

          <div className="w-full clay-card bg-white/90 rounded-2xl p-3 border border-sky-200 text-xs text-slate-700 mb-5 flex items-center justify-between">
            <span className="font-bold">Explorer Vehicle:</span>
            <span className="font-black text-sky-900">Blue Dune Buggy</span>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onSelectTeam('northStar');
            }}
            className="w-full py-3.5 clay-blue clay-btn text-white font-black text-base uppercase tracking-wider rounded-2xl"
          >
            JOIN TEAM NORTH STAR
          </button>
        </div>

        {/* VS Badge in Center */}
        <div className="relative z-10 my-2 md:my-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full clay-amber text-slate-950 font-black text-xl sm:text-2xl flex items-center justify-center border-4 border-white shadow-xl animate-pulse">
            VS
          </div>
        </div>

        {/* ORANGE TEAM: EARTH EXPLORERS */}
        <div className="flex-1 w-full clay-orange-soft rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center transition-transform hover:scale-[1.02]">
          <span className="clay-orange text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest shadow mb-3">
            Team 02
          </span>
          <div className="text-2xl mb-1">🟠</div>
          <h3 className="text-2xl sm:text-3xl font-black text-orange-900 uppercase tracking-wide">
            TEAM EARTH EXPLORERS
          </h3>
          <p className="text-orange-700 text-xs sm:text-sm font-black tracking-wider mt-1">
            Find • Answer • Race
          </p>

          {/* Character & Buggy illustration showcase */}
          <div className="my-5 relative w-44 h-44 rounded-2xl overflow-hidden clay-card p-1.5 border-2 border-orange-300 bg-white shadow-xl">
            <div className="relative w-full h-full rounded-xl overflow-hidden">
              <Image
                src="/images/earth_explorer.jpg"
                alt="Team Earth Explorers"
                fill
                priority
                className="object-cover object-top"
              />
            </div>
          </div>

          <div className="w-full clay-card bg-white/90 rounded-2xl p-3 border border-orange-200 text-xs text-slate-700 mb-5 flex items-center justify-between">
            <span className="font-bold">Explorer Vehicle:</span>
            <span className="font-black text-orange-900">Orange Safari Buggy</span>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onSelectTeam('earthExplorers');
            }}
            className="w-full py-3.5 clay-orange clay-btn text-white font-black text-base uppercase tracking-wider rounded-2xl"
          >
            JOIN EARTH EXPLORERS
          </button>
        </div>
      </div>

      {/* Classroom Dual-Team Mode Option */}
      <div className="mt-8">
        <button
          onClick={() => {
            sounds.playClick();
            onSelectTeam('spectator');
          }}
          className="clay-card clay-btn bg-white/90 hover:bg-white text-slate-700 px-6 py-3 rounded-2xl border-2 border-sky-200 text-xs sm:text-sm font-black flex items-center gap-2 shadow"
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>CLASSROOM DUEL (Both Teams Competing on One Projector) →</span>
        </button>
      </div>
    </div>
  );
}
