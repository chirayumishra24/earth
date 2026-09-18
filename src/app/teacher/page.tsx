'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import TeacherPanel from '../../components/teacher/TeacherPanel';
import { useGameQuestions } from '../../hooks/useGameQuestions';

export default function TeacherPage() {
  const {
    activeGameCode,
    setGameCode,
    questions: activeQuestions,
    updateQuestions,
  } = useGameQuestions();

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-sky-100 via-blue-50 to-amber-50 text-slate-800 flex flex-col items-center justify-start p-3 sm:p-6 md:p-8 font-game select-none relative overflow-x-hidden">
      {/* Background Illustrated World Map Landscape */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/images/map_background.jpg"
          alt="Globe Racers Background"
          fill
          priority
          className="object-cover object-center brightness-105 opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sky-100/90 via-blue-50/80 to-transparent" />
      </div>

      <div className="relative z-10 w-full flex justify-center">
        <TeacherPanel
          isOpen={true}
          isStandalonePage={true}
          activeQuestions={activeQuestions}
          onQuestionsUpdated={updateQuestions}
          activeGameCode={activeGameCode}
          onApplyGameCode={setGameCode}
        />
      </div>
    </main>
  );
}
