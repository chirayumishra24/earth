'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { TeamId, TeamProgress } from '../types/game';
import { Trophy, Award, Sparkles, RotateCcw, BookOpen, Flag } from 'lucide-react';

interface WinnerScreenProps {
  winner: TeamId | 'tie';
  northProgress: TeamProgress;
  earthProgress: TeamProgress;
  onPlayAgain: () => void;
  onViewSummary: () => void;
}

export default function WinnerScreen({
  winner,
  northProgress,
  earthProgress,
  onPlayAgain,
  onViewSummary,
}: WinnerScreenProps) {
  useEffect(() => {
    sounds.playVictory();

    // Trigger celebratory confetti cannon bursts
    const end = Date.now() + 3 * 1000;
    const colors = ['#0284c7', '#ea580c', '#eab308', '#22c55e', '#a855f7'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const isNorthWinner = winner === 'northStar';
  const isEarthWinner = winner === 'earthExplorers';
  const isTie = winner === 'tie';

  let winnerTitle = 'IT’S A TIE!';
  let winnerSubtitle = 'Both teams reached the finish together!';
  let winnerColor = 'from-amber-400 to-yellow-500';
  let winnerCharImg = '/images/north_star_explorer.jpg';
  let winnerVehicleImg = '/images/blue_vehicle.jpg';

  if (isNorthWinner) {
    winnerTitle = 'TEAM NORTH STAR WINS!';
    winnerSubtitle = 'Rocket speed & geography mastery! Most laps completed around the Earth in 5 minutes!';
    winnerColor = 'from-sky-400 to-blue-500';
    winnerCharImg = '/images/north_star_explorer.jpg';
    winnerVehicleImg = '/images/blue_vehicle.jpg';
  } else if (isEarthWinner) {
    winnerTitle = 'TEAM EARTH EXPLORERS WINS!';
    winnerSubtitle = 'Stellar speed & global navigation! Most laps completed around the Earth in 5 minutes!';
    winnerColor = 'from-orange-400 to-amber-500';
    winnerCharImg = '/images/earth_explorer.jpg';
    winnerVehicleImg = '/images/orange_vehicle.jpg';
  }

  return (
    <div className="w-full min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-8 select-none">
      {/* Light Claymorphic Trophy Plaque */}
      <div className="relative w-full max-w-3xl clay-card bg-white/95 rounded-3xl p-6 sm:p-8 border-4 border-amber-300 text-center flex flex-col items-center animate-fadeIn">
        {/* Top Trophy Icon */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full clay-amber flex items-center justify-center -mt-16 animate-bounce text-slate-900 border-4 border-white">
          <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-slate-900" />
        </div>

        <span className="mt-3 clay-amber text-slate-900 text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider">
          🏆 5-MINUTE RACE COMPLETE
        </span>

        <h2
          className={`text-3xl sm:text-5xl font-black mt-2 tracking-tight uppercase ${
            isNorthWinner
              ? 'text-sky-600'
              : isEarthWinner
              ? 'text-orange-600'
              : 'text-amber-600'
          }`}
        >
          {winnerTitle}
        </h2>

        <p className="text-slate-600 text-sm sm:text-base font-bold mt-1">
          {winnerSubtitle}
        </p>

        {/* Winner Characters & Vehicles Showcase */}
        <div className="my-6 flex items-center justify-center gap-6">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden clay-card p-1.5 border-2 border-amber-300 bg-sky-50">
            <div className="relative w-full h-full rounded-xl overflow-hidden">
              <Image
                src={winnerCharImg}
                alt="Winning Explorer"
                fill
                className="object-cover object-top"
              />
            </div>
          </div>
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden clay-card p-1.5 border-2 border-amber-300 bg-orange-50">
            <div className="relative w-full h-full rounded-xl overflow-hidden">
              <Image
                src={winnerVehicleImg}
                alt="Winning Vehicle"
                fill
                className="object-contain p-2"
              />
            </div>
          </div>
        </div>

        {/* Motivational Text */}
        <p className="text-amber-900 text-sm sm:text-base font-extrabold italic clay-inset bg-amber-50 px-6 py-2.5 rounded-2xl border border-amber-200 mb-6">
          “You orbited, located, and learned your way across the Earth!”
        </p>

        {/* Score Comparison Cards */}
        <div className="w-full grid grid-cols-2 gap-4 max-w-lg mb-6">
          {/* North Star Score */}
          <div className="clay-blue-soft rounded-2xl p-4 text-center">
            <span className="text-xs font-black text-sky-700 uppercase block">🔵 North Star</span>
            <span className="text-3xl font-black text-sky-900 my-1 block">
              {northProgress.laps.toFixed(2)} <span className="text-sm font-bold text-sky-700">Laps</span>
            </span>
            <span className="text-[11px] font-bold text-slate-600">
              {northProgress.quarterLaps} Quarters ({northProgress.correctAnswersCount} Correct)
            </span>
          </div>

          {/* Earth Explorers Score */}
          <div className="clay-orange-soft rounded-2xl p-4 text-center">
            <span className="text-xs font-black text-orange-700 uppercase block">🟠 Earth Explorers</span>
            <span className="text-3xl font-black text-orange-900 my-1 block">
              {earthProgress.laps.toFixed(2)} <span className="text-sm font-bold text-orange-700">Laps</span>
            </span>
            <span className="text-[11px] font-bold text-slate-600">
              {earthProgress.quarterLaps} Quarters ({earthProgress.correctAnswersCount} Correct)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => {
              sounds.playClick();
              onViewSummary();
            }}
            className="px-6 py-3.5 clay-blue clay-btn text-white font-black text-sm uppercase tracking-wider rounded-2xl flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>View Learning Summary</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onPlayAgain();
            }}
            className="px-6 py-3.5 clay-green clay-btn text-white font-black text-sm uppercase tracking-wider rounded-2xl flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
