'use client';

import React from 'react';
import { VisualType } from '../types/game';
import { Compass as CompassIcon, MapPin } from 'lucide-react';

interface VisualQuestionProps {
  type?: VisualType;
  gridTarget?: { col: string; row: number };
}

export default function VisualQuestion({ type = 'none', gridTarget }: VisualQuestionProps) {
  if (type === 'none') return null;

  // 1. COORDINATE CHALLENGE GRID (Columns A-E, Rows 1-3)
  if (type === 'coordinate_grid') {
    const cols = ['A', 'B', 'C', 'D', 'E'];
    const rows = [1, 2, 3];
    const targetCol = gridTarget?.col || 'C';
    const targetRow = gridTarget?.row || 2;

    return (
      <div className="my-2.5 p-3 bg-sky-50/90 rounded-2xl border-2 border-sky-200/80 flex flex-col items-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
        <div className="text-[11px] text-sky-900 font-black mb-1.5 uppercase tracking-wider flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          <span>Coordinate Grid Reference</span>
        </div>
        <div className="inline-block bg-white rounded-xl p-2 border-2 border-sky-100 shadow-[0_4px_10px_rgba(0,0,0,0.05),inset_0_-2px_4px_rgba(0,0,0,0.03)]">
          {/* Header row with columns */}
          <div className="grid grid-cols-6 gap-1.5 text-center text-[11px] font-black text-amber-700 mb-1">
            <span className="text-slate-400 font-mono text-[10px]">📍</span>
            {cols.map((c) => (
              <span key={c} className="w-6 sm:w-7">{c}</span>
            ))}
          </div>
          {/* Grid rows */}
          {rows.map((r) => (
            <div key={r} className="grid grid-cols-6 gap-1.5 items-center mb-1">
              <span className="text-[11px] font-black text-amber-700 text-center w-5">{r}</span>
              {cols.map((c) => {
                const isPin = c === targetCol && r === targetRow;
                return (
                  <div
                    key={`${c}-${r}`}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                      isPin
                        ? 'clay-amber border-2 border-amber-300 animate-pulse'
                        : 'bg-slate-50 border border-slate-200 text-slate-400'
                    }`}
                  >
                    {isPin ? (
                      <span className="text-sm drop-shadow-md animate-bounce">📍</span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">•</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. COMPASS ROSE
  if (type === 'compass') {
    return (
      <div className="my-2 p-3 bg-sky-50/90 rounded-2xl border-2 border-sky-200/80 flex items-center justify-center gap-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400 animate-spin" style={{ animationDuration: '40s' }} />
          <div className="absolute inset-1 rounded-full bg-white border-2 border-sky-200 shadow-md flex items-center justify-center">
            {/* North-South Needle */}
            <div className="absolute top-1 text-[11px] font-black text-rose-600">N</div>
            <div className="absolute bottom-1 text-[11px] font-black text-slate-600">S</div>
            <div className="absolute left-1.5 text-[11px] font-black text-slate-600">W</div>
            <div className="absolute right-1.5 text-[11px] font-black text-slate-600">E</div>
            <CompassIcon className="w-7 h-7 text-amber-500 animate-pulse" />
          </div>
        </div>
        <div className="text-xs text-slate-700 font-semibold space-y-0.5">
          <div className="text-amber-800 font-black">Directions Legend:</div>
          <div>• N = North (Top)</div>
          <div>• S = South (Bottom)</div>
          <div>• E = East (Right), W = West (Left)</div>
        </div>
      </div>
    );
  }

  // 3. EQUATOR & HEMISPHERES GLOBE
  if (type === 'equator_globe') {
    return (
      <div className="my-2 p-3 bg-sky-50/90 rounded-2xl border-2 border-sky-200/80 flex items-center justify-center gap-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
        <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-sm">
          <circle cx="50" cy="50" r="44" fill="#0284c7" stroke="#38bdf8" strokeWidth="2.5" />
          <ellipse cx="45" cy="32" rx="20" ry="12" fill="#22c55e" opacity="0.9" />
          <ellipse cx="58" cy="68" rx="18" ry="14" fill="#22c55e" opacity="0.9" />
          <line x1="6" y1="50" x2="94" y2="50" stroke="#ef4444" strokeWidth="3" strokeDasharray="4 2" />
          <text x="50" y="24" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">Northern Hem.</text>
          <text x="50" y="54" fill="#ffedd5" fontSize="6.5" fontWeight="black" textAnchor="middle">Equator (0°)</text>
          <text x="50" y="84" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">Southern Hem.</text>
        </svg>
        <div className="text-xs text-slate-800">
          <div className="text-rose-600 font-black">Equator (0° Latitude)</div>
          <div className="text-xs text-slate-600 font-medium mt-0.5">
            Splits the Earth into Northern & Southern Hemispheres
          </div>
        </div>
      </div>
    );
  }

  // 4. PRIME MERIDIAN (0° Longitude)
  if (type === 'prime_meridian' || type === 'hemisphere_split') {
    return (
      <div className="my-2 p-3 bg-sky-50/90 rounded-2xl border-2 border-sky-200/80 flex items-center justify-center gap-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
        <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-sm">
          <circle cx="50" cy="50" r="44" fill="#0284c7" stroke="#38bdf8" strokeWidth="2.5" />
          <path d="M 50 6 A 44 44 0 0 0 50 94 Z" fill="#0369a1" />
          <line x1="50" y1="6" x2="50" y2="94" stroke="#10b981" strokeWidth="3" strokeDasharray="4 2" />
          <text x="28" y="52" fill="#bae6fd" fontSize="6" fontWeight="bold" textAnchor="middle">Western</text>
          <text x="72" y="52" fill="#bae6fd" fontSize="6" fontWeight="bold" textAnchor="middle">Eastern</text>
          <text x="50" y="98" fill="#10b981" fontSize="6" fontWeight="black" textAnchor="middle">0° Meridian</text>
        </svg>
        <div className="text-xs text-slate-800">
          <div className="text-emerald-700 font-black">Prime Meridian (0° Longitude)</div>
          <div className="text-xs text-slate-600 font-medium mt-0.5">
            Passes through Greenwich, splitting East and West
          </div>
        </div>
      </div>
    );
  }

  // 5. TROPICS & THERMAL ZONES DIAGRAM
  if (type === 'tropics_diagram') {
    return (
      <div className="my-2 p-3 bg-sky-50/90 rounded-2xl border-2 border-sky-200/80 flex items-center justify-center gap-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
        <svg viewBox="0 0 120 80" className="w-28 h-20 drop-shadow-sm">
          <rect x="10" y="5" width="100" height="70" rx="8" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
          <line x1="15" y1="18" x2="105" y2="18" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="60" y="16" fill="#0891b2" fontSize="5" fontWeight="bold" textAnchor="middle">66½° N Arctic Circle</text>
          <line x1="15" y1="30" x2="105" y2="30" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="60" y="28" fill="#d97706" fontSize="5" fontWeight="bold" textAnchor="middle">23½° N Tropic of Cancer</text>
          <line x1="15" y1="42" x2="105" y2="42" stroke="#ef4444" strokeWidth="2" />
          <text x="60" y="40" fill="#dc2626" fontSize="5.5" fontWeight="bold" textAnchor="middle">0° Equator</text>
          <line x1="15" y1="54" x2="105" y2="54" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="60" y="52" fill="#d97706" fontSize="5" fontWeight="bold" textAnchor="middle">23½° S Tropic of Capricorn</text>
          <line x1="15" y1="66" x2="105" y2="66" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="60" y="64" fill="#0891b2" fontSize="5" fontWeight="bold" textAnchor="middle">66½° S Antarctic Circle</text>
        </svg>
        <div className="text-xs text-slate-800">
          <div className="text-amber-800 font-black">Important Parallels</div>
          <div className="text-slate-600 font-medium mt-0.5">
            Cancer (23½° N) & Capricorn (23½° S) bound the warm Torrid Zone.
          </div>
        </div>
      </div>
    );
  }

  return null;
}
