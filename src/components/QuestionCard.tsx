'use client';

import React from 'react';
import Image from 'next/image';
import { Question, TeamInfo, TeamProgress } from '../types/game';
import VisualQuestion from './VisualQuestion';
import { CheckCircle2, XCircle, ArrowRight, Sparkles } from 'lucide-react';

interface QuestionCardProps {
  team: TeamInfo;
  progress: TeamProgress;
  question: Question | null;
  onSelectOption: (optionIndex: number) => void;
  onSubmitAnswer: () => void;
  onPeekMap?: () => void;
  onUseFiftyFifty?: () => void;
  isFinalMinute?: boolean;
}

export default function QuestionCard({
  team,
  progress,
  question,
  onSelectOption,
  onSubmitAnswer,
  onPeekMap,
  onUseFiftyFifty,
  isFinalMinute = false,
}: QuestionCardProps) {
  if (!question) {
    return (
      <div className="flex-1 min-h-[360px] clay-card p-6 flex items-center justify-center">
        <span className="text-slate-500 font-bold">Preparing question...</span>
      </div>
    );
  }

  const isBlue = team.id === 'northStar';
  const themeCardBorder = isBlue ? 'border-sky-200' : 'border-orange-200';
  const themeHeaderClay = isBlue ? 'clay-blue' : 'clay-orange';

  const speechBubble = isBlue
    ? '“Navigate fast! Each right answer = ¼ lap boost!”'
    : '“Race ahead! Full throttle around the Earth!”';

  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div
      className={`flex-1 min-w-[300px] clay-card ${themeCardBorder} overflow-hidden flex flex-col justify-between transition-all`}
    >
      {/* Team Header Bar */}
      <div className={`px-5 py-3 flex items-center justify-between ${themeHeaderClay} rounded-t-[1.6rem] border-b-0`}>
        <div className="flex items-center gap-2.5">
          <span className="text-2xl filter drop-shadow-sm">{team.badge}</span>
          <div>
            <h3 className="font-black text-sm sm:text-base tracking-wide uppercase text-white drop-shadow-sm">
              {team.name}
            </h3>
            <p className="text-[11px] font-bold text-white/90">Quick-Answer Sector</p>
          </div>
        </div>

        {/* Live Lap Score Pill */}
        <div className="bg-white/20 backdrop-blur-sm px-3.5 py-1 rounded-2xl border border-white/40 flex items-center gap-1.5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]">
          <span className="text-xs font-bold uppercase tracking-wider text-white/90">Laps</span>
          <span className="font-black text-sm sm:text-base text-amber-200 drop-shadow-sm">
            {progress.laps.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Quarter Lap Progress Indicator Bar under header */}
      <div className="w-full bg-slate-100 h-2.5 overflow-hidden flex">
        {[0, 1, 2, 3].map((quarter) => {
          const isFilled = (progress.quarterLaps % 4) > quarter || (progress.quarterLaps > 0 && progress.quarterLaps % 4 === 0);
          return (
            <div
              key={quarter}
              className={`flex-1 border-r border-white/40 transition-all duration-300 ${
                (progress.quarterLaps % 4) > quarter
                  ? isBlue
                    ? 'bg-sky-500 shadow-[0_0_8px_#0ea5e9]'
                    : 'bg-orange-500 shadow-[0_0_8px_#f97316]'
                  : 'bg-slate-200'
              }`}
            />
          );
        })}
      </div>

      {/* Question Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Question Topic & Lap value */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span
              className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border-2 ${
                isBlue
                  ? 'bg-sky-100 text-sky-800 border-sky-300'
                  : 'bg-orange-100 text-orange-800 border-orange-300'
              }`}
            >
              📍 {question.topic || question.category}
            </span>

            {isFinalMinute ? (
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-500 text-white border-2 border-rose-300 flex items-center gap-1 animate-pulse shadow-md">
                <Sparkles className="w-3 h-3 text-yellow-300" /> ⚡ +½ Lap (BLITZ DOUBLE!)
              </span>
            ) : (
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" /> +¼ Lap / 90°
              </span>
            )}
          </div>

          {/* Question Text */}
          <h4 className="text-slate-900 font-extrabold text-base sm:text-lg leading-snug mb-3">
            {question.question}
          </h4>

          {/* Visual Diagram if present */}
          <VisualQuestion type={question.visualType} gridTarget={question.gridTarget} />
        </div>

        {/* Power-Up Toolbar: 50/50 Jet Stream & Peek Map */}
        <div className="flex items-center gap-2 my-2">
          {/* 50/50 Jet Stream */}
          <button
            type="button"
            disabled={progress.hasUsedFiftyFifty || progress.hasSubmitted}
            onClick={onUseFiftyFifty}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border ${
              progress.hasUsedFiftyFifty
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                : progress.hasSubmitted
                ? 'opacity-50 cursor-not-allowed bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 hover:shadow-sm active:scale-95'
            }`}
            title="Eliminate 2 incorrect options (1 use per match)"
          >
            <span>⚡ 50/50 Jet Stream</span>
            {progress.hasUsedFiftyFifty ? (
              <span className="text-[9px] opacity-75 font-normal">(Used)</span>
            ) : (
              <span className="text-[9px] bg-amber-300/80 px-1 py-0.2 rounded font-black text-amber-950">1x</span>
            )}
          </button>

          {/* Peek Map Geography Hint */}
          <button
            type="button"
            disabled={!progress.mapPeeksRemaining || progress.mapPeeksRemaining <= 0 || progress.hasSubmitted}
            onClick={onPeekMap}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border ${
              !progress.mapPeeksRemaining || progress.mapPeeksRemaining <= 0
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : progress.hasSubmitted
                ? 'opacity-50 cursor-not-allowed bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-sky-100 hover:bg-sky-200 text-sky-900 border-sky-300 hover:shadow-sm active:scale-95'
            }`}
            title="Open 4-second satellite map hint centered on this region"
          >
            <span>🗺️ Peek Map</span>
            <span className="text-[9px] bg-sky-300/80 px-1 py-0.2 rounded font-black text-sky-950">
              {progress.mapPeeksRemaining ?? 2} left
            </span>
          </button>
        </div>

        {/* 4 Answer Options (Clay Buttons in 2x2 Grid) */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 my-2">
          {question.options.map((option, idx) => {
            const isEliminated = progress.eliminatedOptions?.includes(idx);
            const isSelected = progress.selectedOption === idx;
            const isCorrectAnswer = idx === (question.correctAnswer ?? question.correctIndex);

            let buttonStyle =
              'bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 shadow-[0_6px_14px_rgba(0,0,0,0.05),inset_0_-3px_6px_rgba(0,0,0,0.03),inset_0_3px_6px_rgba(255,255,255,0.95)]';

            if (isEliminated) {
              buttonStyle = 'bg-slate-100/60 text-slate-300 border-slate-200 line-through cursor-not-allowed opacity-40 shadow-none';
            } else if (isSelected && !progress.hasSubmitted) {
              buttonStyle = isBlue ? 'clay-blue text-white font-bold' : 'clay-orange text-white font-bold';
            }

            // Post-submission feedback styling
            if (progress.hasSubmitted) {
              if (isCorrectAnswer) {
                buttonStyle = 'clay-green text-white font-black';
              } else if (isSelected && !isCorrectAnswer) {
                buttonStyle = 'bg-rose-100 text-rose-800 border-2 border-rose-300 line-through opacity-85';
              } else {
                buttonStyle = 'bg-slate-100/70 text-slate-400 border-slate-200';
              }
            }

            return (
              <button
                key={idx}
                disabled={progress.hasSubmitted || isEliminated}
                onClick={() => onSelectOption(idx)}
                className={`w-full text-left p-3 rounded-2xl transition-all flex items-center gap-2.5 clay-btn active:scale-[0.99] min-h-[56px] ${buttonStyle}`}
              >
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${
                    isSelected ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {letters[idx]}
                </span>
                <span className="text-xs sm:text-sm font-bold flex-1 leading-snug">{option}</span>
                {progress.hasSubmitted && isCorrectAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0 animate-bounce" />
                )}
                {progress.hasSubmitted && isSelected && !isCorrectAnswer && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Banner or Submit Button */}
        {progress.hasSubmitted ? (
          <div
            className={`p-3.5 rounded-2xl border-2 flex items-center justify-between animate-fadeIn shadow-sm ${
              progress.isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {progress.isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-amber-600 shrink-0" />
              )}
              <div>
                <span className="font-black text-sm uppercase tracking-wide">
                  {progress.isCorrect ? '✓ CORRECT! +¼ LAP BOOST' : '✕ WRONG! 0 MOVEMENT'}
                </span>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{question.explanation}</p>
              </div>
            </div>
          </div>
        ) : (
          <button
            disabled={progress.selectedOption === null}
            onClick={onSubmitAnswer}
            className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 clay-btn ${
              progress.selectedOption !== null
                ? isBlue
                  ? 'clay-blue text-white shadow-lg'
                  : 'clay-orange text-white shadow-lg'
                : 'bg-slate-200 text-slate-400 border-2 border-slate-300 cursor-not-allowed'
            }`}
          >
            <span>Lock & Submit Answer →</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Explorer Character & Classroom Quote Footer */}
      <div className="px-5 py-3 bg-white/70 border-t-2 border-slate-100 flex items-center gap-3 rounded-b-[1.6rem]">
        <div className="relative w-11 h-11 rounded-2xl overflow-hidden border-2 border-white shrink-0 shadow-md">
          <Image
            src={team.characterImage}
            alt={team.characterName}
            fill
            className="object-cover object-top"
          />
        </div>
        <div className="flex-1">
          <span className="text-[11px] font-black uppercase tracking-wide text-slate-800 block">
            {team.characterName}
          </span>
          <p className="text-xs font-semibold italic text-slate-600 line-clamp-1">{speechBubble}</p>
        </div>
      </div>
    </div>
  );
}
