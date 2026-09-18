'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  TeamId,
  TeamInfo,
  Question,
  GameStatus,
  TeamProgress,
  MissedQuestionRecord,
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
import MapPeekModal from '../components/MapPeekModal';
import { useGameQuestions } from '../hooks/useGameQuestions';

const TEAM_NORTH_STAR: TeamInfo = {
  id: 'northStar',
  name: 'Team North Star',
  tagline: 'Explore • Locate • Discover',
  badge: '🔵',
  color: 'blue',
  characterName: 'Explorer Leo',
  characterImage: '/images/north_star_explorer.jpg',
  vehicleImage: '/images/airplane_blue.png',
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
  vehicleImage: '/images/airplane_orange.png',
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
  maxStreak: 0,
  isSupersonic: false,
  streakBonusLaps: 0,
  mapPeeksRemaining: 2,
  hasUsedFiftyFifty: false,
  eliminatedOptions: [],
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
  const [globeStyle, setGlobeStyle] = useState<'stylized' | 'nasa'>('stylized');
  const [activePeekQuestion, setActivePeekQuestion] = useState<Question | null>(null);

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
    activeGameCode,
    setGameCode,
    teamAQuestions,
    teamBQuestions,
    activeQuestionSet,
    questions: activeQuestions,
    updateQuestions,
    getNextQuestionTeamA,
    getNextQuestionTeamB,
    resetSessionTracking,
  } = useGameQuestions();

  const [northStar, setNorthStar] = useState<TeamProgress>({ ...initialProgress });
  const [earthExplorers, setEarthExplorers] = useState<TeamProgress>({ ...initialProgress });
  const [missedQuestions, setMissedQuestions] = useState<MissedQuestionRecord[]>([]);

  const [currentNorthQ, setCurrentNorthQ] = useState<Question | null>(null);
  const [currentEarthQ, setCurrentEarthQ] = useState<Question | null>(null);

  // Start 5-Minute Race
  const startRace = useCallback(() => {
    resetSessionTracking();
    setNorthStar({ ...initialProgress });
    setEarthExplorers({ ...initialProgress });
    setMissedQuestions([]);
    setWinner(null);
    setActivePeekQuestion(null);
    setTimerSeconds(MATCH_DURATION);
    setIsTimerRunning(true);
    setStatus('racing');

    // Draw independent initial questions for each team from their respective pools
    const q1 = getNextQuestionTeamA();
    const q2 = getNextQuestionTeamB(q1 ? [q1.id] : []);
    setCurrentNorthQ(q1);
    setCurrentEarthQ(q2);
  }, [getNextQuestionTeamA, getNextQuestionTeamB, resetSessionTracking]);

  // Restart complete game
  const handleRestart = () => {
    resetSessionTracking();
    setNorthStar({ ...initialProgress });
    setEarthExplorers({ ...initialProgress });
    setMissedQuestions([]);
    setWinner(null);
    setActivePeekQuestion(null);
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

  // Power-Up: 50/50 Jet Stream for North Star
  const handleNorthFiftyFifty = () => {
    if (northStar.hasUsedFiftyFifty || northStar.hasSubmitted || !currentNorthQ) return;
    sounds.playPowerup();
    const correctIdx = currentNorthQ.correctAnswer ?? currentNorthQ.correctIndex ?? 0;
    const incorrectIndices = currentNorthQ.options
      .map((_, idx) => idx)
      .filter((idx) => idx !== correctIdx);
    const eliminated = incorrectIndices.sort(() => Math.random() - 0.5).slice(0, 2);
    setNorthStar((prev) => ({
      ...prev,
      hasUsedFiftyFifty: true,
      eliminatedOptions: eliminated,
      selectedOption: eliminated.includes(prev.selectedOption ?? -1) ? null : prev.selectedOption,
    }));
  };

  // Power-Up: 50/50 Jet Stream for Earth Explorers
  const handleEarthFiftyFifty = () => {
    if (earthExplorers.hasUsedFiftyFifty || earthExplorers.hasSubmitted || !currentEarthQ) return;
    sounds.playPowerup();
    const correctIdx = currentEarthQ.correctAnswer ?? currentEarthQ.correctIndex ?? 0;
    const incorrectIndices = currentEarthQ.options
      .map((_, idx) => idx)
      .filter((idx) => idx !== correctIdx);
    const eliminated = incorrectIndices.sort(() => Math.random() - 0.5).slice(0, 2);
    setEarthExplorers((prev) => ({
      ...prev,
      hasUsedFiftyFifty: true,
      eliminatedOptions: eliminated,
      selectedOption: eliminated.includes(prev.selectedOption ?? -1) ? null : prev.selectedOption,
    }));
  };

  // Power-Up: Peek Map Geography Hint for North Star
  const handleNorthPeekMap = () => {
    if (!currentNorthQ || (northStar.mapPeeksRemaining ?? 0) <= 0 || northStar.hasSubmitted) return;
    sounds.playPowerup();
    setNorthStar((prev) => ({
      ...prev,
      mapPeeksRemaining: Math.max(0, (prev.mapPeeksRemaining ?? 2) - 1),
    }));
    setActivePeekQuestion(currentNorthQ);
  };

  // Power-Up: Peek Map Geography Hint for Earth Explorers
  const handleEarthPeekMap = () => {
    if (!currentEarthQ || (earthExplorers.mapPeeksRemaining ?? 0) <= 0 || earthExplorers.hasSubmitted) return;
    sounds.playPowerup();
    setEarthExplorers((prev) => ({
      ...prev,
      mapPeeksRemaining: Math.max(0, (prev.mapPeeksRemaining ?? 2) - 1),
    }));
    setActivePeekQuestion(currentEarthQ);
  };

  // Submit Answer for Team North Star (Quick-Answer: moves immediately on correct, loads next Q independently)
  const handleNorthSubmit = () => {
    if (northStar.hasSubmitted || northStar.selectedOption === null || !currentNorthQ) return;
    sounds.playClick();
    const correctIdx = currentNorthQ.correctAnswer ?? currentNorthQ.correctIndex ?? 0;
    const isCorrect = northStar.selectedOption === correctIdx;
    const isFinalMinute = timerSeconds <= 60 && timerSeconds > 0;
    const quarterStep = isFinalMinute ? 2 : 1; // Double Checkpoints (+½ Lap) during final minute!

    if (isCorrect) {
      const nextQuarters = northStar.quarterLaps + quarterStep;
      const nextStreak = northStar.streak + 1;
      const maxStreak = Math.max(northStar.maxStreak || 0, nextStreak);
      const isSupersonic = nextStreak >= 3;

      if (isSupersonic) {
        sounds.playStreakBoost();
        sounds.playSupersonicBoom();
      } else {
        sounds.playCorrect();
        sounds.playMove();
      }

      const scoreGain = (isSupersonic ? 150 : 100) + (isFinalMinute ? 100 : 0);

      setNorthStar((prev) => ({
        ...prev,
        hasSubmitted: true,
        isCorrect: true,
        isBoosting: true,
        isWobbling: false,
        quarterLaps: nextQuarters,
        laps: nextQuarters / 4,
        score: prev.score + scoreGain,
        correctAnswersCount: prev.correctAnswersCount + 1,
        totalAnswersCount: prev.totalAnswersCount + 1,
        streak: nextStreak,
        maxStreak,
        isSupersonic,
      }));
    } else {
      sounds.playIncorrect();
      setMissedQuestions((prev) => [
        ...prev,
        {
          team: 'northStar',
          question: currentNorthQ,
          selectedOption: northStar.selectedOption!,
          correctAnswer: correctIdx,
          timestamp: Date.now(),
        },
      ]);

      setNorthStar((prev) => ({
        ...prev,
        hasSubmitted: true,
        isCorrect: false,
        isBoosting: false,
        isWobbling: true,
        totalAnswersCount: prev.totalAnswersCount + 1,
        streak: 0,
        isSupersonic: false,
      }));
    }

    // Auto-advance to next question independently (excluding question currently shown on Earth screen)
    setTimeout(() => {
      setNorthStar((prev) => ({
        ...prev,
        selectedOption: null,
        hasSubmitted: false,
        isCorrect: null,
        isBoosting: false,
        isWobbling: false,
        eliminatedOptions: [],
      }));
      setCurrentNorthQ(getNextQuestionTeamA(currentEarthQ ? [currentEarthQ.id] : []));
    }, 650);
  };

  // Submit Answer for Team Earth Explorers (Quick-Answer: moves immediately on correct, loads next Q independently)
  const handleEarthSubmit = () => {
    if (earthExplorers.hasSubmitted || earthExplorers.selectedOption === null || !currentEarthQ) return;
    sounds.playClick();
    const correctIdx = currentEarthQ.correctAnswer ?? currentEarthQ.correctIndex ?? 0;
    const isCorrect = earthExplorers.selectedOption === correctIdx;
    const isFinalMinute = timerSeconds <= 60 && timerSeconds > 0;
    const quarterStep = isFinalMinute ? 2 : 1; // Double Checkpoints (+½ Lap) during final minute!

    if (isCorrect) {
      const nextQuarters = earthExplorers.quarterLaps + quarterStep;
      const nextStreak = earthExplorers.streak + 1;
      const maxStreak = Math.max(earthExplorers.maxStreak || 0, nextStreak);
      const isSupersonic = nextStreak >= 3;

      if (isSupersonic) {
        sounds.playStreakBoost();
        sounds.playSupersonicBoom();
      } else {
        sounds.playCorrect();
        sounds.playMove();
      }

      const scoreGain = (isSupersonic ? 150 : 100) + (isFinalMinute ? 100 : 0);

      setEarthExplorers((prev) => ({
        ...prev,
        hasSubmitted: true,
        isCorrect: true,
        isBoosting: true,
        isWobbling: false,
        quarterLaps: nextQuarters,
        laps: nextQuarters / 4,
        score: prev.score + scoreGain,
        correctAnswersCount: prev.correctAnswersCount + 1,
        totalAnswersCount: prev.totalAnswersCount + 1,
        streak: nextStreak,
        maxStreak,
        isSupersonic,
      }));
    } else {
      sounds.playIncorrect();
      setMissedQuestions((prev) => [
        ...prev,
        {
          team: 'earthExplorers',
          question: currentEarthQ,
          selectedOption: earthExplorers.selectedOption!,
          correctAnswer: correctIdx,
          timestamp: Date.now(),
        },
      ]);

      setEarthExplorers((prev) => ({
        ...prev,
        hasSubmitted: true,
        isCorrect: false,
        isBoosting: false,
        isWobbling: true,
        totalAnswersCount: prev.totalAnswersCount + 1,
        streak: 0,
        isSupersonic: false,
      }));
    }

    // Auto-advance to next question independently from Team B's pool
    setTimeout(() => {
      setEarthExplorers((prev) => ({
        ...prev,
        selectedOption: null,
        hasSubmitted: false,
        isCorrect: null,
        isBoosting: false,
        isWobbling: false,
        eliminatedOptions: [],
      }));
      setCurrentEarthQ(getNextQuestionTeamB(currentNorthQ ? [currentNorthQ.id] : []));
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
        if (prev === 61) {
          sounds.playBlitzWarning();
        } else if (prev <= 11 && prev > 1) {
          sounds.playUrgentTick();
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

      {/* 4-Second Satellite Map Peek Geography Hint Modal */}
      {activePeekQuestion && (
        <MapPeekModal
          question={activePeekQuestion}
          onClose={() => setActivePeekQuestion(null)}
        />
      )}

      {/* Teacher Question Management Panel */}
      <TeacherPanel
        isOpen={showTeacherPanel}
        onClose={() => setShowTeacherPanel(false)}
        activeQuestions={activeQuestions}
        onQuestionsUpdated={updateQuestions}
        activeGameCode={activeGameCode}
        onApplyGameCode={setGameCode}
      />

      {/* Screen 1: START SCREEN */}
      {status === 'start' && (
        <StartScreen
          onStart={() => setStatus('how_to_play')}
          onOpenTeacherPanel={() => setShowTeacherPanel(true)}
          activeGameCode={activeGameCode}
          onApplyGameCode={setGameCode}
          activeQuestionSet={activeQuestionSet}
          teamACount={teamAQuestions.length}
          teamBCount={teamBQuestions.length}
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
            gameCode={activeGameCode}
            globeStyle={globeStyle}
            onToggleGlobeStyle={() => setGlobeStyle((s) => (s === 'nasa' ? 'stylized' : 'nasa'))}
          />

          {/* Dual Earth Rocket Orbit Race Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <EarthOrbitStage
              team={TEAM_NORTH_STAR}
              progress={northStar}
              isLeading={northStar.quarterLaps > earthExplorers.quarterLaps}
              globeStyle={globeStyle}
            />
            <EarthOrbitStage
              team={TEAM_EARTH_EXPLORERS}
              progress={earthExplorers}
              isLeading={earthExplorers.quarterLaps > northStar.quarterLaps}
              globeStyle={globeStyle}
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
              onPeekMap={handleNorthPeekMap}
              onUseFiftyFifty={handleNorthFiftyFifty}
              isFinalMinute={timerSeconds <= 60 && timerSeconds > 0}
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
              onPeekMap={handleEarthPeekMap}
              onUseFiftyFifty={handleEarthFiftyFifty}
              isFinalMinute={timerSeconds <= 60 && timerSeconds > 0}
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
          missedQuestions={missedQuestions}
          gameCode={activeGameCode}
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
