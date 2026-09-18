'use client';

import React, { useEffect } from 'react';
import { sounds } from '../utils/audio';

interface TimerProps {
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  roundType: 'standard' | 'double_checkpoint' | 'lightning';
}

export default function Timer({ secondsLeft, totalSeconds, isRunning, roundType }: TimerProps) {
  useEffect(() => {
    if (isRunning && secondsLeft <= 5 && secondsLeft > 0) {
      sounds.playTick();
    }
  }, [secondsLeft, isRunning]);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, secondsLeft / totalSeconds);
  const strokeDashoffset = circumference - progress * circumference;

  const isUrgent = secondsLeft <= 4 && secondsLeft > 0;
  const isTimesUp = secondsLeft === 0;

  let strokeColor = '#0284c7'; // sky-600
  if (roundType === 'lightning') {
    strokeColor = '#f59e0b'; // amber-500
  }
  if (isUrgent) {
    strokeColor = '#e11d48'; // rose-600
  }

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-3xl clay-card border-3 border-white shadow-xl min-w-[130px]">
      {/* Mini Round Type Tag */}
      {roundType === 'lightning' && (
        <span className="clay-amber text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full mb-1.5 animate-pulse uppercase tracking-wider">
          ⚡ 10s Lightning!
        </span>
      )}
      {roundType === 'double_checkpoint' && (
        <span className="clay-green text-white font-black text-[10px] px-2.5 py-0.5 rounded-full mb-1.5 animate-pulse uppercase tracking-wider">
          ✨ Double Checkpoint!
        </span>
      )}

      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Circular SVG Timer with Soft Clay Inset Track */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-slate-200"
            strokeWidth="9"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={strokeColor}
            strokeWidth="9"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-linear drop-shadow-sm"
          />
        </svg>

        {/* Center Countdown Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-black text-2xl tracking-tighter transition-all ${
              isTimesUp
                ? 'text-rose-600 text-sm font-extrabold animate-pulse'
                : isUrgent
                ? 'text-rose-600 scale-110 font-black'
                : 'text-slate-900'
            }`}
          >
            {isTimesUp ? "TIME'S UP" : secondsLeft}
          </span>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest -mt-0.5">
            {isTimesUp ? '' : 'SECONDS'}
          </span>
        </div>
      </div>

      {/* Motivational Slogan */}
      <div className="mt-1.5 text-center">
        <span className="text-[10px] font-black text-amber-700 tracking-wide uppercase">
          Think • Locate • Race!
        </span>
      </div>
    </div>
  );
}
