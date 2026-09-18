'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { TeamId, TeamProgress, MissedQuestionRecord } from '../types/game';
import { Trophy, Award, Sparkles, RotateCcw, BookOpen, Flag, FileSpreadsheet, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';
import { generateMatchReport } from '../utils/analytics';
import { exportRaceReportToExcel } from '../utils/excelParser';

interface WinnerScreenProps {
  winner: TeamId | 'tie';
  northProgress: TeamProgress;
  earthProgress: TeamProgress;
  missedQuestions?: MissedQuestionRecord[];
  gameCode?: string | null;
  onPlayAgain: () => void;
  onViewSummary: () => void;
}

export default function WinnerScreen({
  winner,
  northProgress,
  earthProgress,
  missedQuestions = [],
  gameCode = null,
  onPlayAgain,
  onViewSummary,
}: WinnerScreenProps) {
  const [showMissed, setShowMissed] = React.useState(false);
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

        {/* Score Comparison Cards with Accuracy & Streaks */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mb-5">
          {/* North Star Score */}
          <div className="clay-blue-soft rounded-2xl p-4 text-center border-2 border-sky-200">
            <span className="text-xs font-black text-sky-700 uppercase block">🔵 Team North Star (Red Ship)</span>
            <span className="text-3xl font-black text-sky-900 my-1 block">
              {northProgress.laps.toFixed(2)} <span className="text-sm font-bold text-sky-700">Laps</span>
            </span>
            <div className="flex items-center justify-center gap-3 text-[11px] font-bold text-slate-700 mt-2 bg-white/70 py-1 px-2 rounded-xl">
              <span>🎯 Accuracy: {northProgress.totalAnswersCount > 0 ? Math.round((northProgress.correctAnswersCount / northProgress.totalAnswersCount) * 100) : 0}%</span>
              <span>⚡ Max Streak: {northProgress.maxStreak || northProgress.streak}</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 block mt-1">
              {northProgress.correctAnswersCount} / {northProgress.totalAnswersCount} correct answers
            </span>
          </div>

          {/* Earth Explorers Score */}
          <div className="clay-orange-soft rounded-2xl p-4 text-center border-2 border-orange-200">
            <span className="text-xs font-black text-orange-700 uppercase block">🟠 Team Earth Explorers (Blue Ship)</span>
            <span className="text-3xl font-black text-orange-900 my-1 block">
              {earthProgress.laps.toFixed(2)} <span className="text-sm font-bold text-orange-700">Laps</span>
            </span>
            <div className="flex items-center justify-center gap-3 text-[11px] font-bold text-slate-700 mt-2 bg-white/70 py-1 px-2 rounded-xl">
              <span>🎯 Accuracy: {earthProgress.totalAnswersCount > 0 ? Math.round((earthProgress.correctAnswersCount / earthProgress.totalAnswersCount) * 100) : 0}%</span>
              <span>⚡ Max Streak: {earthProgress.maxStreak || earthProgress.streak}</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 block mt-1">
              {earthProgress.correctAnswersCount} / {earthProgress.totalAnswersCount} correct answers
            </span>
          </div>
        </div>

        {/* Missed Questions Pedagogical Review (Expandable Accordion) */}
        {missedQuestions.length > 0 && (
          <div className="w-full max-w-xl mb-5 text-left">
            <button
              onClick={() => setShowMissed(!showMissed)}
              className="w-full clay-card bg-amber-50/90 hover:bg-amber-100/90 border border-amber-300 p-3 rounded-2xl flex items-center justify-between text-xs font-black text-amber-900 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                  {missedQuestions.length}
                </span>
                <span>Review Missed Questions ({missedQuestions.length})</span>
              </div>
              {showMissed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showMissed && (
              <div className="mt-2 clay-card bg-white p-3 rounded-2xl border border-amber-200 max-h-60 overflow-y-auto space-y-3">
                {missedQuestions.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-900">{idx + 1}. {m.question.question}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 shrink-0">
                        {m.team === 'northStar' ? 'Red Ship' : 'Blue Ship'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold mt-1">
                      <span className="text-rose-600 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        Selected: {m.question.options[m.selectedOption]}
                      </span>
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Correct: {m.question.options[m.correctAnswer]}
                      </span>
                    </div>
                    {m.question.explanation && (
                      <p className="text-[10px] text-slate-500 italic mt-1 bg-white p-1.5 rounded border border-slate-100">
                        💡 {m.question.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons & Excel Export */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              const report = generateMatchReport(winner, northProgress, earthProgress, missedQuestions, gameCode);
              exportRaceReportToExcel(report);
            }}
            className="px-5 py-3 clay-amber clay-btn text-slate-900 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl flex items-center gap-2 border-2 border-amber-400 shadow-md hover:scale-105 transition-transform"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
            <span>Download Report (.xlsx)</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onViewSummary();
            }}
            className="px-5 py-3 clay-blue clay-btn text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Summary</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onPlayAgain();
            }}
            className="px-6 py-3 clay-green clay-btn text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
