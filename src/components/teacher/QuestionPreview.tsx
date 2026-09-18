'use client';

import React, { useState } from 'react';
import { Question } from '../../types/game';
import { CheckCircle2, AlertTriangle, XCircle, Users, Layers } from 'lucide-react';

interface QuestionPreviewProps {
  questions: Question[];
  teamAQuestions?: Question[];
  teamBQuestions?: Question[];
  hasTeamSheets?: boolean;
  errors: string[];
  warnings: string[];
}

export default function QuestionPreview({
  questions,
  teamAQuestions = [],
  teamBQuestions = [],
  hasTeamSheets = false,
  errors,
  warnings,
}: QuestionPreviewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'teamA' | 'teamB'>('all');
  const letters = ['A', 'B', 'C', 'D'];

  const displayedQuestions =
    activeTab === 'teamA'
      ? teamAQuestions.length > 0 ? teamAQuestions : questions
      : activeTab === 'teamB'
      ? teamBQuestions.length > 0 ? teamBQuestions : questions
      : questions;

  const easyCount = displayedQuestions.filter((q) => q.difficulty === 'easy').length;
  const medCount = displayedQuestions.filter((q) => q.difficulty === 'medium').length;
  const hardCount = displayedQuestions.filter((q) => q.difficulty === 'hard').length;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Errors Notification Box */}
      {errors.length > 0 && (
        <div className="clay-card p-4 bg-rose-50 border-2 border-rose-300 text-rose-800 rounded-2xl shadow-md">
          <div className="flex items-center gap-2 font-black text-sm text-rose-900 mb-1.5">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Parsing Errors Found ({errors.length}):</span>
          </div>
          <ul className="list-disc list-inside text-xs space-y-1 font-semibold pl-1">
            {errors.map((err, i) => (
              <li key={i} className="leading-snug">{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings Notification Box */}
      {warnings.length > 0 && (
        <div className="clay-card p-3.5 bg-amber-50 border-2 border-amber-300 text-amber-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 font-bold text-xs text-amber-900 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Parsing Warnings ({warnings.length}):</span>
          </div>
          <ul className="list-disc list-inside text-[11px] space-y-0.5 font-semibold pl-1">
            {warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Questions Preview Table */}
      {questions.length > 0 && (
        <div className="w-full clay-card bg-white/95 rounded-2xl border border-sky-200 overflow-hidden shadow-xl">
          {/* Header & Tabs */}
          <div className="px-4 py-3 bg-gradient-to-r from-sky-100/90 to-blue-50/90 border-b border-sky-200 flex flex-wrap items-center justify-between gap-2">
            {/* Tabs */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'all'
                    ? 'clay-blue text-white shadow'
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-sky-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Questions ({questions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('teamA')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'teamA'
                    ? 'bg-rose-500 text-white shadow-[0_4px_10px_rgba(244,63,94,0.3)]'
                    : 'bg-white/80 hover:bg-white text-rose-700 border border-rose-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Team A / Red ({teamAQuestions.length > 0 ? teamAQuestions.length : questions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('teamB')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'teamB'
                    ? 'clay-blue text-white shadow'
                    : 'bg-white/80 hover:bg-white text-sky-700 border border-sky-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Team B / Blue ({teamBQuestions.length > 0 ? teamBQuestions.length : questions.length})</span>
              </button>
            </div>

            {/* Difficulty Breakdown Badges */}
            <div className="flex items-center gap-1.5 text-[10px] font-black">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Easy: {easyCount}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Med: {medCount}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                Hard: {hardCount}
              </span>
            </div>
          </div>

          {/* Question List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-sky-100">
            {displayedQuestions.map((q, idx) => {
              const diffColor =
                q.difficulty === 'easy'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : q.difficulty === 'hard'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300';

              const isTeamA = q.id.startsWith('teamA-');
              const isTeamB = q.id.startsWith('teamB-');

              return (
                <div key={q.id || idx} className="p-3.5 hover:bg-sky-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-sky-100 text-sky-800 font-mono text-[10px] flex items-center justify-center font-black">
                        {idx + 1}
                      </span>
                      <span className="font-black text-sm text-slate-800">{q.question}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isTeamA && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300">
                          Team Red
                        </span>
                      )}
                      {isTeamB && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-300">
                          Team Blue
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                        {q.category || q.topic || 'General'}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${diffColor}`}>
                        {q.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Options Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctAnswer;
                      return (
                        <div
                          key={optIdx}
                          className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 border transition-all ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-black shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-700 font-semibold'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded text-[10px] font-black flex items-center justify-center ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {letters[optIdx]}
                          </span>
                          <span className="truncate">{opt}</span>
                          {isCorrect && (
                            <span className="ml-auto text-[10px] text-emerald-700 font-black">
                              ✓ Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="text-[11px] text-slate-500 italic mt-1.5 font-medium">
                      💡 <span className="font-bold text-slate-700">Explanation:</span> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
