'use client';

import React from 'react';
import { Question } from '../../types/game';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

interface QuestionPreviewProps {
  questions: Question[];
  errors: string[];
  warnings: string[];
}

export default function QuestionPreview({ questions, errors, warnings }: QuestionPreviewProps) {
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Errors Notification Box */}
      {errors.length > 0 && (
        <div className="clay-card p-4 bg-rose-50 border-2 border-rose-300 text-rose-800">
          <div className="flex items-center gap-2 font-black text-sm text-rose-900 mb-1">
            <XCircle className="w-5 h-5 text-rose-600" />
            <span>Parsing Errors Found ({errors.length}):</span>
          </div>
          <ul className="list-disc list-inside text-xs space-y-1 font-semibold pl-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings Notification Box */}
      {warnings.length > 0 && (
        <div className="clay-card p-3.5 bg-amber-50 border-2 border-amber-300 text-amber-800">
          <div className="flex items-center gap-2 font-bold text-xs text-amber-900 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Warnings ({warnings.length}):</span>
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
          <div className="px-4 py-2.5 bg-sky-50/90 border-b border-sky-200 flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Validated Questions Ready ({questions.length})
            </span>
            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> All Rows Formatted
            </span>
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-sky-100">
            {questions.map((q, idx) => {
              const diffColor =
                q.difficulty === 'easy'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : q.difficulty === 'hard'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300';

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
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
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
