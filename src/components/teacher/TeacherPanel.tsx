'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Question } from '../../types/game';
import { ParseResult } from '../../utils/excelParser';
import UploadZone from './UploadZone';
import QuestionPreview from './QuestionPreview';
import {
  saveDualTeamQuestions,
  loadTeacherCodes,
  removeTeacherCode,
  deleteQuestionSetByCode,
  saveActiveGameCode,
  clearActiveGameCode,
  exportQuestionsToJson,
  TeacherCodeEntry,
} from '../../utils/questionStorage';
import { isFirebaseConfigured } from '../../config/firebase';
import { QUESTION_BANK } from '../../data/questions';
import { sounds } from '../../utils/audio';
import {
  X,
  RotateCcw,
  Download,
  Save,
  Database,
  Loader2,
  Shield,
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  KeyRound,
  Sparkles,
  Users,
} from 'lucide-react';

interface TeacherPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeQuestions: Question[];
  onQuestionsUpdated: (questions: Question[]) => void;
  activeGameCode?: string | null;
  onApplyGameCode?: (code: string | null) => Promise<boolean>;
  isStandalonePage?: boolean;
}

export default function TeacherPanel({
  isOpen = true,
  onClose = () => {},
  activeQuestions,
  onQuestionsUpdated,
  activeGameCode,
  onApplyGameCode,
  isStandalonePage = false,
}: TeacherPanelProps) {
  const [parsedResult, setParsedResult] = useState<ParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Big Generated Code Banner state
  const [generatedCode, setGeneratedCode] = useState<string | null>(activeGameCode || null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Teacher Code History
  const [savedCodes, setSavedCodes] = useState<TeacherCodeEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSavedCodes(loadTeacherCodes());
      if (activeGameCode) {
        setGeneratedCode(activeGameCode);
      }
    }
  }, [isOpen, activeGameCode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleParsed = (result: ParseResult, fileName: string) => {
    setIsProcessing(true);
    sounds.playClick();
    setParsedResult(result);
    setIsProcessing(false);

    if (result.questions.length > 0) {
      const modeText = result.hasTeamSheets
        ? `Dual-Sheet Mode (${result.teamAQuestions.length} Red, ${result.teamBQuestions.length} Blue)`
        : `Single-Sheet Mode (${result.questions.length} shared)`;
      showToast(`Loaded ${result.questions.length} questions from ${fileName} • ${modeText}`);
    }
  };

  const handleCopyCode = (code: string) => {
    sounds.playClick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      showToast(`Room code ${code} copied to clipboard!`);
      setTimeout(() => setCopiedCode(null), 3000);
    }
  };

  const handleSaveAndSync = async () => {
    if (!parsedResult || parsedResult.questions.length === 0) return;
    setIsSaving(true);
    sounds.playClick();

    try {
      const teamA = parsedResult.teamAQuestions.length > 0 ? parsedResult.teamAQuestions : parsedResult.questions;
      const teamB = parsedResult.teamBQuestions.length > 0 ? parsedResult.teamBQuestions : parsedResult.questions;

      const { code } = await saveDualTeamQuestions(teamA, teamB);
      setGeneratedCode(code);
      setSavedCodes(loadTeacherCodes());

      if (onApplyGameCode) {
        await onApplyGameCode(code);
      } else {
        onQuestionsUpdated(parsedResult.questions);
      }

      sounds.playCorrect();
      showToast(`Success! Room Code ${code} created and synced to Cloud.`);
    } catch (err) {
      console.error(err);
      showToast('Error syncing to Firestore. Saved to local cache.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectSavedCode = async (code: string) => {
    sounds.playClick();
    if (onApplyGameCode) {
      const success = await onApplyGameCode(code);
      if (success) {
        setGeneratedCode(code);
        saveActiveGameCode(code);
        showToast(`Activated Room Code: ${code}`);
      } else {
        showToast(`Could not load code ${code}.`);
      }
    } else {
      setGeneratedCode(code);
      saveActiveGameCode(code);
    }
  };

  const handleDeleteSavedCode = async (code: string) => {
    sounds.playClick();
    if (confirm(`Delete Room Code "${code}" from Firestore and History?`)) {
      await deleteQuestionSetByCode(code);
      setSavedCodes(loadTeacherCodes());
      if (generatedCode === code) {
        setGeneratedCode(null);
      }
      if (activeGameCode === code && onApplyGameCode) {
        await onApplyGameCode(null);
      }
      showToast(`Room Code ${code} deleted.`);
    }
  };

  const handleResetToDefaults = async () => {
    sounds.playClick();
    if (confirm('Reset question engine and restore default Class 6 Geography question bank?')) {
      clearActiveGameCode();
      if (onApplyGameCode) {
        await onApplyGameCode(null);
      } else {
        onQuestionsUpdated([...QUESTION_BANK]);
      }
      setGeneratedCode(null);
      setParsedResult(null);
      showToast('Default Class 6 Geography question bank restored.');
    }
  };

  const handleExportJson = () => {
    sounds.playClick();
    if (parsedResult) {
      const payload = {
        teamAQuestions: parsedResult.teamAQuestions,
        teamBQuestions: parsedResult.teamBQuestions,
        totalQuestions: parsedResult.questions.length,
        exportedAt: new Date().toISOString(),
      };
      exportQuestionsToJson(payload, 'dual_team_questions.json');
    } else {
      exportQuestionsToJson({ questions: activeQuestions }, 'active_questions.json');
    }
  };

  if (!isOpen) return null;

  const panelContent = (
    <div className={`relative w-full max-w-5xl ${isStandalonePage ? 'min-h-[85vh]' : 'max-h-[94vh]'} clay-card bg-gradient-to-b from-sky-100 via-sky-50 to-blue-50 border-4 border-sky-300 rounded-3xl flex flex-col overflow-hidden shadow-2xl`}>
      {/* Header */}
      <div className="px-5 sm:px-6 py-4 bg-white/90 border-b border-sky-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {isStandalonePage ? (
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl clay-card bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-xs font-black border border-sky-200 clay-btn transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Game</span>
            </Link>
          ) : (
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl clay-card bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-xs font-black border border-sky-200 clay-btn transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Game</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl clay-blue flex items-center justify-center text-white shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-800 uppercase tracking-wide flex items-center gap-2">
                Teacher Dashboard
              </h3>
              <p className="text-[11px] text-sky-700 font-bold">
                Dual-Sheet Question Engine • 4-Digit Room Code Sync
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Cloud Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full clay-card text-xs font-black border-sky-200 bg-white">
            {isFirebaseConfigured ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700">Firebase Firestore Online</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-amber-700">Offline LocalStorage Cache</span>
              </>
            )}
          </div>

          {!isStandalonePage && (
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-2 rounded-xl clay-inset bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all clay-btn"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white px-5 py-2 text-xs sm:text-sm font-bold flex items-center justify-between shadow-lg animate-fadeIn">
            <span>✓ {toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="font-black">✕</button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Big Generated Code Banner */}
          {generatedCode && (
            <div className="clay-card p-6 rounded-3xl bg-gradient-to-r from-amber-400/20 via-sky-100 to-amber-400/20 border-3 border-amber-400 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-black text-amber-800 uppercase tracking-widest mb-1">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Active 4-Digit Game PIN / Room Code</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>

              <div className="text-5xl sm:text-6xl font-mono font-black tracking-[0.35em] text-slate-900 my-2 drop-shadow-sm pl-4">
                {generatedCode}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-3 max-w-md">
                Share this 4-digit code with your students to join on their screens or classroom devices!
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCopyCode(generatedCode)}
                  className="px-6 py-2.5 rounded-2xl clay-green clay-btn text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md"
                >
                  {copiedCode === generatedCode ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>1-Click Copy Code</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleResetToDefaults}
                  className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-black text-xs flex items-center gap-1.5 border border-slate-300 shadow clay-btn"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Revert to Default Bank</span>
                </button>
              </div>
            </div>
          )}

          {/* "My Question Sets" History Card */}
          {savedCodes.length > 0 && (
            <div className="clay-card p-4 sm:p-5 rounded-2xl bg-white/90 border border-sky-200 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-sky-600" />
                  <h4 className="font-black text-sm text-slate-800 uppercase tracking-wider">
                    My Question Sets ({savedCodes.length})
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  Previously Generated Room PINs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedCodes.map((entry) => {
                  const isActive = entry.code === generatedCode;
                  const dateStr = new Date(entry.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={entry.code}
                      className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-2.5 ${
                        isActive
                          ? 'clay-amber-soft border-amber-400 shadow-md'
                          : 'clay-card bg-slate-50/80 border-sky-100 hover:border-sky-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xl font-black text-slate-900 tracking-widest">
                            {entry.code}
                          </span>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{dateStr}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-black">
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          Team A: {entry.teamACount}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                          Team B: {entry.teamBCount}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyCode(entry.code)}
                            className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-sky-700 transition-colors"
                            title="Copy Code"
                          >
                            {copiedCode === entry.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteSavedCode(entry.code)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Code"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {!isActive && (
                          <button
                            onClick={() => handleSelectSavedCode(entry.code)}
                            className="px-2.5 py-1 rounded-lg clay-blue text-white text-[10px] font-black clay-btn"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upload Zone */}
          <UploadZone onParsed={handleParsed} isProcessing={isProcessing} />

          {/* Tabbed Question Preview */}
          <QuestionPreview
            questions={parsedResult?.questions || []}
            teamAQuestions={parsedResult?.teamAQuestions || []}
            teamBQuestions={parsedResult?.teamBQuestions || []}
            hasTeamSheets={parsedResult?.hasTeamSheets || false}
            errors={parsedResult?.errors || []}
            warnings={parsedResult?.warnings || []}
          />
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white/90 border-t border-sky-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="text-xs text-slate-600 font-bold">
            {parsedResult && parsedResult.questions.length > 0 ? (
              <span className="text-emerald-700 font-black flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>
                  Ready to Sync: {parsedResult.teamAQuestions.length} questions for Team A,{' '}
                  {parsedResult.teamBQuestions.length} questions for Team B
                </span>
              </span>
            ) : (
              <span>Upload a 2-Sheet Excel workbook or JSON above to generate a 4-digit room code.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportJson}
              className="px-4 py-2.5 clay-blue-soft text-sky-800 hover:bg-sky-100 rounded-xl text-xs font-black flex items-center gap-1.5 border border-sky-300 shadow clay-btn"
            >
              <Download className="w-4 h-4" />
              <span>Download as JSON</span>
            </button>

            <button
              type="button"
              disabled={!parsedResult || parsedResult.questions.length === 0 || isSaving}
              onClick={handleSaveAndSync}
              className={`px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all ${
                parsedResult && parsedResult.questions.length > 0 && !isSaving
                  ? 'clay-green clay-btn text-white shadow-lg'
                  : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Syncing to Cloud...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save & Sync to Cloud</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
  );

  if (isStandalonePage) {
    return panelContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-900/40 backdrop-blur-sm animate-fadeIn select-none">
      {panelContent}
    </div>
  );
}
