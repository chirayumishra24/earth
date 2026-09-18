'use client';

import React, { useState, useEffect } from 'react';
import { GEOGRAPHY_FACTS } from '../data/facts';
import { Lightbulb, Compass, Award, CheckCircle2 } from 'lucide-react';

export default function FactFooter() {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % GEOGRAPHY_FACTS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const fact = GEOGRAPHY_FACTS[currentFactIndex];

  return (
    <div className="w-full mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 select-none">
      {/* Left Wooden / Adventure Signboard */}
      <div className="clay-card p-3 flex items-center justify-center text-center bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 flex items-center justify-center gap-1">
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            CLASSROOM ADVENTURE
          </span>
          <p className="text-xs sm:text-sm font-black text-amber-900 tracking-wide mt-0.5">
            GEOGRAPHY TAKES YOU FURTHER!
          </p>
        </div>
      </div>

      {/* Center Did You Know Fact Card */}
      <div className="clay-card p-3 flex items-center gap-3 bg-white/95 border-sky-100">
        <div className="w-10 h-10 rounded-2xl clay-amber flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
              DID YOU KNOW? • {fact.topic}
            </span>
            <span className="text-[10px] text-slate-400 font-bold font-mono">
              {currentFactIndex + 1}/{GEOGRAPHY_FACTS.length}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-700 font-bold line-clamp-2 mt-0.5">
            {fact.fact}
          </p>
        </div>
      </div>

      {/* Right Motivation Card */}
      <div className="clay-card p-3 flex flex-col justify-center text-xs font-bold space-y-1.5 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-extrabold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Same Planet • Brighter Minds</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-extrabold">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Greater Explorers • Stronger Together!</span>
        </div>
      </div>
    </div>
  );
}
