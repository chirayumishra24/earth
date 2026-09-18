'use client';

import React from 'react';
import { sounds } from '../utils/audio';
import { Play } from 'lucide-react';

interface HowToPlayProps {
  onLetsRace: () => void;
}

export default function HowToPlay({ onLetsRace }: HowToPlayProps) {
  const steps = [
    {
      num: '1',
      title: '5-Minute Match Timer',
      desc: 'One continuous 5-minute clock! Answer as many questions as you can.',
      icon: '⏱️',
      clayBg: 'clay-blue',
    },
    {
      num: '2',
      title: 'Quick Answer Mode',
      desc: 'Never wait for your rival! As soon as you submit, your next question appears.',
      icon: '⚡',
      clayBg: 'clay-amber',
    },
    {
      num: '3',
      title: '¼ Lap Orbit Boost',
      desc: 'Right answer = rocket speeds ¼ lap (90°) around your Earth! Wrong = 0 move.',
      icon: '🚀',
      clayBg: 'clay-green',
    },
    {
      num: '4',
      title: 'Most Laps Wins',
      desc: 'When the 5 minutes expire, the rocket with the most total laps wins!',
      icon: '🏆',
      clayBg: 'clay-orange',
    },
  ];

  return (
    <div className="w-full min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-8 select-none">
      {/* Title */}
      <div className="text-center mb-8">
        <span className="bg-emerald-100 text-emerald-800 border-2 border-emerald-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
          Fast & Simple Rules
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-2 tracking-tight">
          HOW TO PLAY
        </h2>
        <p className="text-slate-600 text-sm sm:text-base font-bold mt-1">
          Answer correctly, explore the globe, and race to victory!
        </p>
      </div>

      {/* 4 Numbered Clay Step Cards */}
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {steps.map((step) => (
          <div
            key={step.num}
            className="clay-card p-6 flex flex-col justify-between hover:scale-[1.03] transition-transform duration-200"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`w-10 h-10 rounded-2xl ${step.clayBg} text-white font-black text-lg flex items-center justify-center`}
                >
                  {step.num}
                </span>
                <span className="text-3xl filter drop-shadow-sm">{step.icon}</span>
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1.5">{step.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
                {step.desc}
              </p>
            </div>
            <div className="mt-5 pt-3 border-t-2 border-slate-100 text-[11px] font-black text-amber-600 uppercase tracking-wider">
              Step 0{step.num}
            </div>
          </div>
        ))}
      </div>

      {/* Large CTA Button: LET'S RACE! (Puffy Green Clay Button) */}
      <button
        onClick={() => {
          sounds.playClick();
          onLetsRace();
        }}
        className="clay-green clay-btn px-10 sm:px-14 py-4 text-white font-black text-xl sm:text-2xl rounded-2xl flex items-center gap-3 border-3 border-emerald-200 shadow-[0_14px_28px_rgba(16,185,129,0.4),inset_0_-6px_12px_rgba(5,150,105,0.4),inset_0_6px_12px_rgba(255,255,255,0.6)]"
      >
        <Play className="w-6 h-6 fill-white text-white" />
        <span>LET’S RACE! →</span>
      </button>
    </div>
  );
}
