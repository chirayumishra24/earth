'use client';

import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, FileCode, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { generateTemplateExcel, generateTemplateJson, parseQuestionsFile, ParseResult } from '../../utils/excelParser';

interface UploadZoneProps {
  onParsed: (result: ParseResult, fileName: string) => void;
  isProcessing: boolean;
}

export default function UploadZone({ onParsed, isProcessing }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const result = await parseQuestionsFile(file);
    onParsed(result, file.name);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full border-3 border-dashed rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
            : 'border-sky-300 bg-sky-50/60 hover:bg-sky-50 hover:border-sky-400 clay-inset'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.json"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="w-16 h-16 rounded-2xl clay-blue flex items-center justify-center mb-3 text-white shadow-lg">
          <Upload className={`w-8 h-8 ${isProcessing ? 'animate-bounce' : ''}`} />
        </div>

        <h4 className="text-base sm:text-lg font-black text-slate-800">
          Upload Question Spreadsheet or JSON
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1 max-w-md">
          Drag & drop your <span className="text-emerald-700 font-black">.xlsx</span>,{' '}
          <span className="text-emerald-700 font-black">.xls</span>, or{' '}
          <span className="text-amber-700 font-black">.json</span> file here, or click to browse.
        </p>

        <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500 font-bold">
          <span className="flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Excel Sheet
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <FileCode className="w-3.5 h-3.5 text-amber-600" /> JSON Array
          </span>
        </div>
      </div>

      {/* Download Templates Bar */}
      <div className="clay-card p-3.5 flex flex-wrap items-center justify-between gap-3 bg-white/95 border-sky-200">
        <div className="text-xs text-slate-700 font-bold">
          <span className="text-amber-600 font-black">Need a starting format?</span> Download a pre-formatted template:
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={generateTemplateExcel}
            className="px-3 py-1.5 clay-green clay-btn text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel Template (2-Sheet)</span>
          </button>
          <button
            type="button"
            onClick={generateTemplateJson}
            className="px-3 py-1.5 clay-amber clay-btn text-slate-900 rounded-xl text-xs font-black flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON Template (Dual-Team)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
