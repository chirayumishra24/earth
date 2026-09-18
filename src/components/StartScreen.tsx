'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Compass,
  Play,
  Globe,
  Database,
  KeyRound,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { QuestionSet } from '../types/game';

interface StartScreenProps {
  onStart: () => void;
  onOpenGlobe?: () => void;
  onOpenTeacherPanel: () => void;
  activeGameCode?: string | null;
  onApplyGameCode?: (code: string | null) => Promise<boolean>;
  activeQuestionSet?: QuestionSet | null;
  teamACount?: number;
  teamBCount?: number;
}

export default function StartScreen({
  onStart,
  onOpenTeacherPanel,
  activeGameCode = null,
  onApplyGameCode,
  activeQuestionSet,
  teamACount = 0,
  teamBCount = 0,
}: StartScreenProps) {
  const [inputCode, setInputCode] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeGameCode) {
      setInputCode(activeGameCode);
    }
  }, [activeGameCode]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setInputCode(val);
    setErrorMessage(null);

    if (val.length === 4 && onApplyGameCode) {
      setIsValidating(true);
      sounds.playClick();
      const success = await onApplyGameCode(val);
      setIsValidating(false);
      if (success) {
        sounds.playCorrect();
      } else {
        sounds.playIncorrect();
        setErrorMessage('Code not found. Please check with your teacher.');
      }
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.length !== 4 || !onApplyGameCode) return;
    setIsValidating(true);
    sounds.playClick();
    const success = await onApplyGameCode(inputCode);
    setIsValidating(false);
    if (success) {
      sounds.playCorrect();
      setErrorMessage(null);
    } else {
      sounds.playIncorrect();
      setErrorMessage('Code not found. Please check with your teacher.');
    }
  };

  const handleClearCode = async () => {
    sounds.playClick();
    setInputCode('');
    setErrorMessage(null);
    if (onApplyGameCode) {
      await onApplyGameCode(null);
    }
  };

  const totalLoaded = teamACount + teamBCount;

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 select-none">
      {/* Background Illustrated World Map Landscape */}
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
        </div>
      </div>

      {/* Center Hero Title & Slogan */}
      <div className="relative z-10 max-w-3xl text-center flex flex-col items-center my-auto py-4">
        {/* Claymorphic 3D Title Board */}
        <div className="relative clay-card p-5 sm:p-7 mb-3 border-4 border-white/90 transform hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-center gap-2 text-amber-600 text-xs sm:text-sm font-black uppercase tracking-widest mb-1">
            <Compass className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '10s' }} />
            <span>Two-Team Educational Quiz Race</span>
            <Compass className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '10s' }} />
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-sky-600 via-blue-600 to-indigo-700 drop-shadow-[0_4px_8px_rgba(2,132,199,0.25)]">
            GLOBE RACERS
          </h1>

          <p className="mt-1.5 text-sm sm:text-lg font-black text-amber-700 tracking-wide">
            5-Minute Quick-Answer Rocket Race • Orbit the Earth!
          </p>
        </div>

        {/* Join with Game Code Box */}
        <div className="w-full max-w-md clay-card p-4 rounded-3xl bg-white/95 border-3 border-sky-200 shadow-xl mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <KeyRound className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Join with 4-Digit Game PIN
            </span>
          </div>

          {activeGameCode ? (
            /* Active Code Valid Confirmation Box */
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-inner animate-fadeIn">
              <div className="flex items-center gap-2.5 text-left">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-emerald-950 tracking-wider">
                      PIN: {activeGameCode}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase">
                      Loaded
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-bold mt-0.5">
                    ✓ Loaded {totalLoaded} questions ({teamACount} Team Red, {teamBCount} Team Blue)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearCode}
                title="Clear code & revert to default"
                className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Code Input Form */
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={inputCode}
                  onChange={handleInputChange}
                  placeholder="ENTER 4-DIGIT PIN"
                  className="w-full py-2.5 px-4 rounded-2xl clay-inset bg-slate-50 border-2 border-sky-300 font-mono text-xl sm:text-2xl font-black text-center text-slate-800 tracking-[0.35em] placeholder:tracking-normal placeholder:text-xs placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:border-sky-500 transition-all"
                />
                {isValidating && (
                  <div className="absolute right-3.5">
                    <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
                  </div>
                )}
              </div>

              {/* Error state */}
              {errorMessage && (
                <div className="flex items-center justify-center gap-1.5 text-rose-600 text-xs font-bold bg-rose-50 border border-rose-200 rounded-xl py-1.5 px-3 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Primary CTA: START RACE (Puffy Clay Button) */}
        <button
          onClick={() => {
            sounds.playClick();
            onStart();
          }}
          className="clay-green clay-btn group px-10 sm:px-14 py-3.5 text-white font-black text-xl sm:text-2xl rounded-2xl flex items-center gap-3 border-3 border-emerald-200 shadow-[0_14px_28px_rgba(16,185,129,0.4),inset_0_-6px_12px_rgba(5,150,105,0.4),inset_0_6px_12px_rgba(255,255,255,0.6)]"
        >
          <Play className="w-6 h-6 fill-white text-white group-hover:scale-110 transition-transform" />
          <span>START 5-MIN RACE →</span>
        </button>

        <p className="mt-2 text-xs sm:text-sm font-black text-slate-600 tracking-wider">
          2 Teams • 5-Minute Speed Quiz • Most Laps Wins
        </p>
      </div>

      {/* Racers & Teams Preview Card at bottom */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
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
              <span className="font-black text-sm text-sky-800 uppercase">🔵 TEAM NORTH STAR (TEAM A)</span>
              <span className="text-[10px] bg-sky-500 text-white px-2.5 py-0.5 rounded-full font-black shadow-sm">
                Racer 01
              </span>
            </div>
            <p className="text-xs text-sky-700 font-bold mt-0.5">Explore • Locate • Discover</p>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-sky-600 font-semibold">
              <span>✈️ Blue Skyfly Jet Airplane</span>
              {teamACount > 0 && <span>• {teamACount} Questions</span>}
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
              <span className="font-black text-sm text-orange-800 uppercase">🟠 TEAM EARTH EXPLORERS (TEAM B)</span>
              <span className="text-[10px] bg-orange-500 text-white px-2.5 py-0.5 rounded-full font-black shadow-sm">
                Racer 02
              </span>
            </div>
            <p className="text-xs text-orange-700 font-bold mt-0.5">Find • Answer • Race</p>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-orange-600 font-semibold">
              <span>✈️ Orange Skyfly Jet Airplane</span>
              {teamBCount > 0 && <span>• {teamBCount} Questions</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
