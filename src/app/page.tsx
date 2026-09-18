'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  TeamId,
  TeamInfo,
  Question,
  GameStatus,
  TeamProgress,
} from '../types/game';
import { sounds } from '../utils/audio';
import { Maximize, Minimize } from 'lucide-react';

// Components
import StartScreen from '../components/StartScreen';
import HowToPlay from '../components/HowToPlay';
import EarthOrbitStage from '../components/EarthOrbitStage';
import QuestionCard from '../components/QuestionCard';
import Scoreboard from '../components/Scoreboard';
import FactFooter from '../components/FactFooter';
import WinnerScreen from '../components/WinnerScreen';
import LearningSummary from '../components/LearningSummary';
import Globe3D from '../components/Globe3D';
import TeacherPanel from '../components/teacher/TeacherPanel';
import { useGameQuestions } from '../hooks/useGameQuestions';

const TEAM_NORTH_STAR: TeamInfo = {
  id: 'northStar',
  name: 'Team North Star',
  tagline: 'Explore • Locate • Discover',
  badge: '🔵',
  color: 'blue',
  characterName: 'Explorer Leo',
  characterImage: '/images/north_star_explorer.jpg',
  vehicleImage: '/images/blue_vehicle.jpg',
  accentHex: '#0284c7',
  bgHex: '#0369a1',
};

const TEAM_EARTH_EXPLORERS: TeamInfo = {
  id: 'earthExplorers',
  name: 'Team Earth Explorers',
  tagline: 'Find • Answer • Race',
  badge: '🟠',
  color: 'orange',
  characterName: 'Explorer Maya',
  characterImage: '/images/earth_explorer.jpg',
  vehicleImage: '/images/orange_vehicle.jpg',
  accentHex: '#ea580c',
  bgHex: '#c2410c',
};

const MATCH_DURATION = 300; // 5 minutes in seconds

const initialProgress: TeamProgress = {
  score: 0,
  position: 0,
  quarterLaps: 0,
  laps: 0,
  correctAnswersCount: 0,
  totalAnswersCount: 0,
  selectedOption: null,
  hasSubmitted: false,
  isCorrect: null,
  isBoosting: false,
  isWobbling: false,
  streak: 0,
};

export default function GlobeRacersPage() {
  const [status, setStatus] = useState<GameStatus>('start');
  const [timerSeconds, setTimerSeconds] = useState<number>(MATCH_DURATION);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showGlobeModal, setShowGlobeModal] = useState<boolean>(false);
  const [showTeacherPanel, setShowTeacherPanel] = useState<boolean>(false);
  const [winner, setWinner] = useState<TeamId | 'tie' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    sounds.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch((err) => console.error(err));
    } else {
      document.exitFullscreen?.().catch((err) => console.error(err));
    }
  };

  // Dynamic Cross-Platform Question Hook (Cloud + LocalStorage + Default)
  const {
    questions: activeQuestions,
    updateQuestions,
    getNextQuestion,
    resetSessionTracking,
  } = useGameQuestions();

  const [northStar, setNorthStar] = useState<TeamProgress>({ ...initialProgress });
  const [earthExplorers, setEarthExplorers] = useState<TeamProgress>({ ...initialProgress });

  const [currentNorthQ, setCurrentNorthQ] = useState<Question | null>(null);
  const [currentEarthQ, setCurrentEarthQ] = useState<Question | null>(null);

  // Start 5-Minute Race
  const startRace = useCallback(() => {
    resetSessionTracking();
    setNorthStar({ ...initialProgress });
    setEarthExplorers({ ...initialProgress });
    setWinner(null);
    setTimerSeconds(MATCH_DURATION);
    setIsTimerRunning(true);
    setStatus('racing');

    // Draw independent initial questions for each team
    setCurrentNorthQ(getNextQuestion());
    setCurrentEarthQ(getNextQuestion());
  }, [getNextQuestion, resetSessionTracking]);

  // Restart complete game
  const handleRestart = () => {
    resetSessionTracking();
    setNorthStar({ ...initialProgress });
    setEarthExplorers({ ...initialProgress });
    setWinner(null);
    setTimerSeconds(MATCH_DURATION);
    setIsTimerRunning(false);
    setCurrentNorthQ(null);
    setCurrentEarthQ(null);
    setStatus('start');
  };

  // Sound toggle
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
  };

  // Submit Answer for Team North Star (Quick-Answer: moves immediately on correct, loads next Q independently)
  const handleNorthSubmit = () => {
    if (northStar.hasSubmitted || northStar.selectedOption === null || !currentNorthQ) return;
    sounds.playClick();
    const correctIdx = currentNorthQ.correctAnswer ?? currentNorthQ.correctIndex ?? 0;
    const isCorrect = northStar.selectedOption === correctIdx;

    if (isCorrect) {
      sounds.playCorrect();
      sounds.playMove();
      const nextQuarters = northStar.quarterLaps + 1;
      setNorthStar((prev) => ({
        ...prev,
        hasSubmitted: true,
        isCorrect: true,
        isBoosting: true,
        isWobbling: false,
        quarterLaps: nextQuarters,
        laps: nextQuarters / 4,
        score: prev.score + 100,
        correctAnswersCount: prev.correctAnswersCount + 1,
        totalAnswersCount: prev.totalAnswersCount + 1,
        streak: prev.streak + 1,
      }));
    } else {
      sounds.playIncorrect();
      setNorthStar((prev) => ({
        ...prev,
        hasSubmitted: true,
        isCorrect: false,
        isBoosting: false,
        isWobbling: true,
        totalAnswersCount: prev.totalAnswersCount + 1,
        streak: 0,
      }));
    }

    // Auto-advance to next question independently
    setTimeout(() => {
      setNorthStar((prev) => ({
        ...prev,
        selectedOption: null,
        hasSubmitted: false,
        isCorrect: null,
        isBoosting: false,
        isWobbling: false,
      }));
      setCurrentNorthQ(getNextQuestion());
    }, 650);
  };

  // Submit Answer for Team Earth Explorers (Quick-Answer: moves immediately on correct, loads next Q independently)
  const handleEarthSubmit = () => {
    if (earthExplorers.hasSubmitted || earthExplorers.selectedOption === null || !currentEarthQ) return;
    sounds.playClick();
    const correctIdx = currentEarthQ.correctAnswer ?? currentEarthQ.correctIndex ?? 0;
    const isCorrect = earthExplorers.selectedOption === correctIdx;

    if (isCorrect) {
      sounds.playCorrect();
      sounds.playMove();
      const nextQuarters = earthExplorers.quarterLaps + 1;
      setEarthExplorers((prev) => ({
        ...prev,
        hasSubmitted: true,
        isCorrect: true,
        isBoosting: true,
        isWobbling: false,
        quarterLaps: nextQuarters,
        laps: nextQuarters / 4,
        score: prev.score + 100,
        correctAnswersCount: prev.correctAnswersCount + 1,
        totalAnswersCount: prev.totalAnswersCount + 1,
        streak: prev.streak + 1,
      }));
    } else {
      sounds.playIncorrect();
      setEarthExplorers((prev) => ({
        ...prev,
        hasSubmitted: true,
        isCorrect: false,
        isBoosting: false,
        isWobbling: true,
        totalAnswersCount: prev.totalAnswersCount + 1,
        streak: 0,
      }));
    }

    // Auto-advance to next question independently
    setTimeout(() => {
      setEarthExplorers((prev) => ({
        ...prev,
        selectedOption: null,
        hasSubmitted: false,
        isCorrect: null,
        isBoosting: false,
        isWobbling: false,
      }));
      setCurrentEarthQ(getNextQuestion());
    }, 650);
  };

  // 5-Minute Match Timer Tick effect
  useEffect(() => {
    if (!isTimerRunning || status !== 'racing') return;

    if (timerSeconds <= 0) {
      setIsTimerRunning(false);
      // End game & determine winner
      setNorthStar((north) => {
        setEarthExplorers((earth) => {
          if (north.quarterLaps > earth.quarterLaps) {
            setWinner('northStar');
          } else if (earth.quarterLaps > north.quarterLaps) {
            setWinner('earthExplorers');
          } else {
            setWinner('tie');
          }
          setStatus('winner');
          return earth;
        });
        return north;
      });
      return;
    }

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, status]);

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-sky-100 via-blue-50 to-amber-50 text-slate-800 flex flex-col items-center justify-between font-game select-none overflow-x-hidden relative">
      {/* Top Right Floating Fullscreen Toggle Button */}
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 p-2.5 rounded-2xl clay-card bg-white/95 hover:bg-white text-slate-700 hover:text-sky-600 border-2 border-sky-200 shadow-lg clay-btn flex items-center justify-center transition-all"
      >
        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
      </button>

      {/* 3D Interactive Earth Modal */}
      {showGlobeModal && (
        <Globe3D isModal onClose={() => setShowGlobeModal(false)} />
      )}

      {/* Teacher Question Management Panel */}
      <TeacherPanel
        isOpen={showTeacherPanel}
        onClose={() => setShowTeacherPanel(false)}
        activeQuestions={activeQuestions}
        onQuestionsUpdated={updateQuestions}
      />

      {/* Screen 1: START SCREEN */}
      {status === 'start' && (
        <StartScreen
          onStart={() => setStatus('how_to_play')}
          onOpenGlobe={() => setShowGlobeModal(false)}
          onOpenTeacherPanel={() => setShowTeacherPanel(true)}
        />
      )}

      {/* Screen 2: HOW TO PLAY */}
      {status === 'how_to_play' && (
        <HowToPlay onLetsRace={startRace} />
      )}

      {/* Screen 3: MAIN RACE SCREEN */}
      {status === 'racing' && (
        <div className="w-full max-w-7xl flex flex-col items-center animate-fadeIn p-3 sm:p-5 md:p-6">
          {/* Top Scoreboard & 5-Min Timer */}
          <Scoreboard
            secondsLeft={timerSeconds}
            northLaps={northStar.laps}
            northQuarters={northStar.quarterLaps}
            earthLaps={earthExplorers.laps}
            earthQuarters={earthExplorers.quarterLaps}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            onRestart={handleRestart}
            onOpenGlobe={() => setShowGlobeModal(true)}
            onOpenTeacherPanel={() => setShowTeacherPanel(true)}
          />

          {/* Dual Earth Rocket Orbit Race Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <EarthOrbitStage
              team={TEAM_NORTH_STAR}
              progress={northStar}
              isLeading={northStar.quarterLaps > earthExplorers.quarterLaps}
            />
            <EarthOrbitStage
              team={TEAM_EARTH_EXPLORERS}
              progress={earthExplorers}
              isLeading={earthExplorers.quarterLaps > northStar.quarterLaps}
            />
          </div>

          {/* Side-by-Side Quick-Answer Question Cards */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <QuestionCard
              team={TEAM_NORTH_STAR}
              progress={northStar}
              question={currentNorthQ}
              onSelectOption={(idx) => {
                sounds.playClick();
                setNorthStar((p) => ({ ...p, selectedOption: idx }));
              }}
              onSubmitAnswer={handleNorthSubmit}
            />
            <QuestionCard
              team={TEAM_EARTH_EXPLORERS}
              progress={earthExplorers}
              question={currentEarthQ}
              onSelectOption={(idx) => {
                sounds.playClick();
                setEarthExplorers((p) => ({ ...p, selectedOption: idx }));
              }}
              onSubmitAnswer={handleEarthSubmit}
            />
          </div>

          {/* Bottom Facts & Classroom Information Bar */}
          <div className="w-full mt-6">
            <FactFooter />
          </div>
        </div>
      )}

      {/* Screen 5: WINNER CELEBRATION */}
      {status === 'winner' && winner && (
        <WinnerScreen
          winner={winner}
          northProgress={northStar}
          earthProgress={earthExplorers}
          onPlayAgain={handleRestart}
          onViewSummary={() => setStatus('summary')}
        />
      )}

      {/* Screen 6: LEARNING SUMMARY */}
      {status === 'summary' && (
        <LearningSummary
          onPlayAgain={handleRestart}
          onOpenGlobe={() => setShowGlobeModal(true)}
        />
      )}
    </main>
  );
}
