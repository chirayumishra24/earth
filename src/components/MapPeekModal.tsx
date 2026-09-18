'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Compass, X, Clock } from 'lucide-react';
import { Question } from '../types/game';
import { sounds } from '../utils/audio';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-950 text-white gap-2 rounded-2xl">
      <div className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-black text-sky-300">Opening Satellite Geography Hint...</span>
    </div>
  ),
});

interface MapPeekModalProps {
  question: Question;
  onClose: () => void;
  durationSeconds?: number;
}

export default function MapPeekModal({
  question,
  onClose,
  durationSeconds = 4,
}: MapPeekModalProps) {
  const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);

  useEffect(() => {
    sounds.playPowerup();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  const progressPercent = (timeLeft / durationSeconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-4xl h-[80vh] max-h-[600px] clay-card bg-slate-950 border-4 border-amber-300 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
        {/* Top Header & Countdown Bar */}
        <div className="px-5 py-3 bg-white/95 border-b border-amber-200 flex items-center justify-between shadow-sm z-20">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-100 text-amber-700">
              <Compass className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-slate-900 font-black text-sm uppercase tracking-wide">
                  🗺️ Geography Map Hint
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  {question.category || question.topic || 'World'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-semibold truncate max-w-md">
                {question.question}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown Badge */}
            <div className="flex items-center gap-1.5 bg-rose-100 border border-rose-300 text-rose-800 px-3 py-1 rounded-full text-xs font-black shadow-sm">
              <Clock className="w-3.5 h-3.5 animate-pulse text-rose-600" />
              <span>{timeLeft}s remaining</span>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
              title="Return to Question"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Animated Progress Timer Line */}
        <div className="w-full h-1.5 bg-slate-200 overflow-hidden z-20">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-red-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Map Explorer Body */}
        <div className="w-full flex-1 relative overflow-hidden bg-slate-950">
          <LeafletMap />
        </div>
      </div>
    </div>
  );
}
