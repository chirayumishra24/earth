'use client';

import React from 'react';
import { sounds } from '../utils/audio';
import { BookOpen, RotateCcw, Globe, Compass, MapPin, Grid, Layers } from 'lucide-react';

interface LearningSummaryProps {
  onPlayAgain: () => void;
  onOpenGlobe: () => void;
}

export default function LearningSummary({ onPlayAgain, onOpenGlobe }: LearningSummaryProps) {
  const cards = [
    {
      icon: '🌍',
      title: 'Earth & Globes',
      summary:
        'A globe is a true 3D spherical model of Earth. Earth rotates on an imaginary axis tilted at 23½°.',
      tag: 'True 3D Model',
      cardClass: 'bg-sky-50/90 border-sky-200 text-slate-800',
      tagClass: 'bg-sky-100 text-sky-800 border-sky-300',
    },
    {
      icon: '📍',
      title: 'Parallels of Latitude',
      summary:
        'Circles drawn East-West parallel to the Equator (0°). Key lines: Tropic of Cancer (23½° N), Capricorn (23½° S), Arctic (66½° N), Antarctic (66½° S).',
      tag: '0° to 90° N/S',
      cardClass: 'bg-amber-50/90 border-amber-200 text-slate-800',
      tagClass: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      icon: '🌐',
      title: 'Meridians of Longitude',
      summary:
        'Semi-circles connecting North & South Poles. Prime Meridian (0°) passes through Greenwich. Earth turns 15° every hour (1° = 4 mins).',
      tag: '0° to 180° E/W',
      cardClass: 'bg-emerald-50/90 border-emerald-200 text-slate-800',
      tagClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      icon: '🧭',
      title: 'Directions & Compass',
      summary:
        'Four cardinal directions (North, South, East, West) and four intermediate directions (NE, SE, SW, NW). Compass needle points North.',
      tag: 'Cardinals & Intermediates',
      cardClass: 'bg-cyan-50/90 border-cyan-200 text-slate-800',
      tagClass: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    },
    {
      icon: '📌',
      title: 'Coordinates & Grid',
      summary:
        'The intersection of a parallel of latitude and a meridian of longitude forms a grid (graticule) to locate any point on Earth precisely.',
      tag: 'Pinpoint Location',
      cardClass: 'bg-purple-50/90 border-purple-200 text-slate-800',
      tagClass: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    {
      icon: '🏳️',
      title: 'The Four Hemispheres',
      summary:
        'The Equator splits Earth into Northern & Southern Hemispheres. The Prime Meridian & 180° meridian split it into Eastern & Western Hemispheres.',
      tag: 'Equal Halves',
      cardClass: 'bg-rose-50/90 border-rose-200 text-slate-800',
      tagClass: 'bg-rose-100 text-rose-800 border-rose-300',
    },
  ];

  return (
    <div className="w-full min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-8 select-none">
      {/* Title */}
      <div className="text-center mb-8">
        <span className="clay-card px-4 py-1.5 text-sky-700 text-xs font-black uppercase tracking-wider border-sky-200 inline-block">
          Class 6 Geography Recap
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-800 mt-2 tracking-tight">
          WHAT WE LEARNED TODAY
        </h2>
        <p className="text-slate-600 text-sm sm:text-base font-bold mt-1">
          Master the concepts of Locating Places on the Earth!
        </p>
      </div>

      {/* 6 Visual Flashcards */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`clay-card p-5 border-2 flex flex-col justify-between transition-transform hover:-translate-y-1 ${card.cardClass}`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{card.icon}</span>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${card.tagClass}`}>
                  {card.tag}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1.5">{card.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
                {card.summary}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Key Topic 0{idx + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => {
            sounds.playClick();
            onOpenGlobe();
          }}
          className="px-6 py-3.5 clay-blue clay-btn text-white font-black text-sm uppercase tracking-wider rounded-2xl flex items-center gap-2"
        >
          <Globe className="w-4 h-4" />
          <span>Interactive 3D Globe</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onPlayAgain();
          }}
          className="px-8 py-3.5 clay-green clay-btn text-white font-black text-sm uppercase tracking-wider rounded-2xl flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start New Classroom Race</span>
        </button>
      </div>
    </div>
  );
}
