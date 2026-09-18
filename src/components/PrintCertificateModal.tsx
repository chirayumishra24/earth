'use client';

import React from 'react';
import Image from 'next/image';
import { Trophy, Printer, X, Award, CheckCircle } from 'lucide-react';
import { TeamId, TeamProgress } from '../types/game';
import { sounds } from '../utils/audio';

interface PrintCertificateModalProps {
  winner: TeamId | 'tie';
  northProgress: TeamProgress;
  earthProgress: TeamProgress;
  gameCode?: string | null;
  onClose: () => void;
}

export default function PrintCertificateModal({
  winner,
  northProgress,
  earthProgress,
  gameCode = null,
  onClose,
}: PrintCertificateModalProps) {
  const isNorth = winner === 'northStar';
  const isEarth = winner === 'earthExplorers';

  const winningTeam = isNorth
    ? {
        name: 'Team North Star',
        explorer: 'Explorer Leo',
        charImg: '/images/north_star_explorer.jpg',
        color: 'text-sky-700',
        borderColor: 'border-sky-500',
        laps: northProgress.laps,
        accuracy: northProgress.totalAnswersCount > 0 ? Math.round((northProgress.correctAnswersCount / northProgress.totalAnswersCount) * 100) : 100,
        score: northProgress.score,
      }
    : isEarth
    ? {
        name: 'Team Earth Explorers',
        explorer: 'Explorer Maya',
        charImg: '/images/earth_explorer.jpg',
        color: 'text-orange-700',
        borderColor: 'border-orange-500',
        laps: earthProgress.laps,
        accuracy: earthProgress.totalAnswersCount > 0 ? Math.round((earthProgress.correctAnswersCount / earthProgress.totalAnswersCount) * 100) : 100,
        score: earthProgress.score,
      }
    : {
        name: 'Both Teams (Stellar Tie!)',
        explorer: 'Leo & Maya',
        charImg: '/images/north_star_explorer.jpg',
        color: 'text-amber-700',
        borderColor: 'border-amber-500',
        laps: northProgress.laps,
        accuracy: 95,
        score: northProgress.score,
      };

  const handlePrint = () => {
    sounds.playClick();
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-4xl clay-card bg-white border-4 border-amber-300 rounded-3xl overflow-hidden flex flex-col shadow-2xl max-h-[95vh] overflow-y-auto">
        {/* Modal Controls Header (Hidden on Print) */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-amber-100 to-yellow-50 border-b border-amber-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <span className="font-black text-slate-800 text-sm">Classroom Winner Certificate</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl clay-green text-white font-black text-xs flex items-center gap-1.5 shadow hover:scale-105 transition-transform"
            >
              <Printer className="w-4 h-4" />
              <span>Print Certificate</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Area */}
        <div className="p-6 sm:p-10 bg-gradient-to-br from-amber-50/50 via-white to-sky-50/50 print:p-0">
          <div className="border-8 border-double border-amber-400 p-8 sm:p-12 rounded-3xl bg-white shadow-xl relative text-center">
            {/* Corner Decorative Medallions */}
            <div className="absolute top-3 left-3 w-7 h-7 border-t-2 border-l-2 border-amber-500 rounded-tl" />
            <div className="absolute top-3 right-3 w-7 h-7 border-t-2 border-r-2 border-amber-500 rounded-tr" />
            <div className="absolute bottom-3 left-3 w-7 h-7 border-b-2 border-l-2 border-amber-500 rounded-bl" />
            <div className="absolute bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 border-amber-500 rounded-br" />

            {/* Certificate Header */}
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-100 border-4 border-amber-300 flex items-center justify-center text-amber-600 shadow-md">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-amber-700 block mb-1">
              Certificate of Geography Mastery
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase">
              GLOBE RACERS CHAMPIONS
            </h1>

            <p className="text-slate-600 font-serif italic text-sm sm:text-base mt-2">
              This prestigious classroom award is proudly conferred upon
            </p>

            {/* Winning Team Showcase */}
            <div className="my-5 flex flex-col items-center justify-center">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-amber-400 shadow-lg mb-2">
                <Image
                  src={winningTeam.charImg}
                  alt={winningTeam.explorer}
                  fill
                  className="object-cover"
                />
              </div>
              <h2 className={`text-2xl sm:text-4xl font-black ${winningTeam.color} uppercase tracking-tight`}>
                {winningTeam.name}
              </h2>
              <span className="text-xs font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-full mt-1 border border-slate-200">
                Captain: {winningTeam.explorer}
              </span>
            </div>

            {/* Citation Statement */}
            <p className="text-slate-700 text-xs sm:text-sm max-w-xl mx-auto font-medium leading-relaxed mb-6">
              For demonstrating stellar speed, collaboration, and unmatched accuracy in locating parallels of latitude, meridians of longitude, the Equator, continents, and oceans around planet Earth.
            </p>

            {/* Match Stats Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8 bg-amber-50/80 p-3 rounded-2xl border border-amber-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Laps Orbited</span>
                <span className="text-base sm:text-lg font-black text-slate-900">{winningTeam.laps.toFixed(2)} Laps</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Accuracy</span>
                <span className="text-base sm:text-lg font-black text-emerald-700">{winningTeam.accuracy}%</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Race Score</span>
                <span className="text-base sm:text-lg font-black text-sky-800">{winningTeam.score} Pts</span>
              </div>
            </div>

            {/* Signatures & Date Line */}
            <div className="flex items-end justify-between max-w-lg mx-auto pt-6 border-t-2 border-slate-200 text-xs text-slate-700">
              <div className="text-center">
                <span className="font-mono font-bold block">{currentDate}</span>
                <div className="w-32 border-b border-slate-400 my-1" />
                <span className="text-[10px] uppercase font-bold text-slate-500">Date Awarded</span>
              </div>

              {gameCode && (
                <div className="text-center">
                  <span className="font-mono font-black text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200">
                    PIN: {gameCode}
                  </span>
                </div>
              )}

              <div className="text-center">
                <span className="font-serif italic text-sm text-slate-800 font-bold">Classroom Teacher</span>
                <div className="w-32 border-b border-slate-400 my-1" />
                <span className="text-[10px] uppercase font-bold text-slate-500">Teacher Signature</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
