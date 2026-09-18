'use client';

import React, { useState, useEffect } from 'react';
import { Question } from '../../types/game';
import { ParseResult } from '../../utils/excelParser';
import UploadZone from './UploadZone';
import QuestionPreview from './QuestionPreview';
import {
  saveCustomQuestionsToCloud,
  clearCustomQuestionsFromCloud,
  exportQuestionsToJson,
} from '../../utils/questionStorage';
import { isFirebaseConfigured } from '../../config/firebase';
import { QUESTION_BANK } from '../../data/questions';
import { sounds } from '../../utils/audio';
import {
  X,
  Cloud,
  CheckCircle,
  RotateCcw,
  Download,
  Save,
  Database,
  Sparkles,
  Loader2,
  HardDrive,
} from 'lucide-react';

interface TeacherPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeQuestions: Question[];
  onQuestionsUpdated: (questions: Question[]) => void;
}

export default function TeacherPanel({
  isOpen,
  onClose,
  activeQuestions,
  onQuestionsUpdated,
}: TeacherPanelProps) {
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isCustomActive = activeQuestions !== QUESTION_BANK && activeQuestions.length > 0;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleParsed = (result: ParseResult, fileName: string) => {
    setIsProcessing(true);
    sounds.playClick();
    setErrors(result.errors);
    setWarnings(result.warnings);
    setParsedQuestions(result.questions);
    setIsProcessing(false);

    if (result.questions.length > 0) {
      showToast(`Loaded ${result.questions.length} questions from ${fileName}`);
    }
  };

  const handleSaveAndSync = async () => {
    if (parsedQuestions.length === 0) return;
    setIsSaving(true);
    sounds.playClick();

    try {
      await saveCustomQuestionsToCloud(parsedQuestions);
      onQuestionsUpdated(parsedQuestions);
      sounds.playCorrect();
      showToast(`Successfully saved & synced ${parsedQuestions.length} questions to Cloud & Local Cache!`);
    } catch (err) {
      console.error(err);
      showToast('Error syncing questions. Saved to local storage.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    sounds.playClick();
    if (confirm('Are you sure you want to reset and restore the default Class 6 Geography question bank?')) {
      await clearCustomQuestionsFromCloud();
      onQuestionsUpdated([...QUESTION_BANK]);
      setParsedQuestions([]);
      setErrors([]);
      setWarnings([]);
      showToast('Default Class 6 Geography question bank restored.');
    }
  };

  const handleExportActive = () => {
    sounds.playClick();
    exportQuestionsToJson(activeQuestions, 'globe_racers_active_bank.json');
  };

  const handleExportUploaded = () => {
    sounds.playClick();
    exportQuestionsToJson(parsedQuestions, 'globe_racers_uploaded_questions.json');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] clay-card bg-white border-4 border-sky-300 rounded-3xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-100 via-blue-50 to-sky-100 border-b border-sky-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl clay-blue flex items-center justify-center text-white shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl text-slate-800 uppercase tracking-wide flex items-center gap-2">
                Teacher Question Management
              </h3>
              <p className="text-xs text-sky-700 font-bold">
                Excel Spreadsheet (.xlsx) • JSON • Firebase Cloud Sync
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Cloud Status Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full clay-card text-xs font-black border-sky-200">
              {isFirebaseConfigured ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-700">Firebase Cloud Synced</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-amber-700">LocalStorage Offline Tier</span>
                </>
              )}
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-2 rounded-xl clay-inset bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all clay-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast alert */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs sm:text-sm font-bold flex items-center justify-between shadow-lg animate-fadeIn">
            <span>✓ {toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="font-black">✕</button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Active Bank Status Card */}
          <div className="p-4 rounded-2xl clay-card bg-sky-50/70 border-sky-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
                  Currently Active Question Pool:
                </span>
                <span
                  className={`text-xs font-black px-3 py-0.5 rounded-full ${
                    isCustomActive
                      ? 'clay-amber text-slate-900'
                      : 'clay-blue text-white'
                  }`}
                >
                  {isCustomActive ? 'Custom Teacher Set Active' : 'Default Geography Bank Active'}
                </span>
              </div>
              <p className="text-sm font-black text-slate-800 mt-1">
                {activeQuestions.length} Questions in current rotation
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportActive}
                className="px-3 py-2 clay-blue-soft text-sky-800 hover:bg-sky-100 rounded-xl text-xs font-black flex items-center gap-1.5 border border-sky-300 transition-all shadow clay-btn"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Active Bank (JSON)</span>
              </button>

              <button
                onClick={handleResetToDefaults}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-black flex items-center gap-1.5 border border-rose-300 transition-all shadow clay-btn"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
            </div>
          </div>

          {/* Upload Section */}
          <UploadZone onParsed={handleParsed} isProcessing={isProcessing} />

          {/* Questions Preview Table */}
          <QuestionPreview questions={parsedQuestions} errors={errors} warnings={warnings} />
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-sky-50/60 border-t border-sky-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 font-bold">
            {parsedQuestions.length > 0 ? (
              <span className="text-emerald-700 font-black">
                ✓ {parsedQuestions.length} questions parsed and ready to save.
              </span>
            ) : (
              <span>Upload a spreadsheet or JSON file above to preview and sync.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {parsedQuestions.length > 0 && (
              <button
                type="button"
                onClick={handleExportUploaded}
                className="px-4 py-2.5 clay-blue-soft text-sky-800 hover:bg-sky-100 rounded-xl text-xs font-black flex items-center gap-1.5 border border-sky-300 shadow clay-btn"
              >
                <Download className="w-4 h-4" />
                <span>Download as JSON</span>
              </button>
            )}

            <button
              type="button"
              disabled={parsedQuestions.length === 0 || isSaving}
              onClick={handleSaveAndSync}
              className={`px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all ${
                parsedQuestions.length > 0 && !isSaving
                  ? 'clay-green clay-btn text-white'
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
    </div>
  );
}
