import React, { useState, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import PlayScreen from './components/PlayScreen';
import ScoreScreen from './components/ScoreScreen';
import { GameConfig, HitLog } from './types';
import { motion, AnimatePresence } from 'motion/react';

type GameState = 'setup' | 'playing' | 'score';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [config, setConfig] = useState<GameConfig | null>(null);
  
  // 최종 게임 결과 데이터
  const [finalScore, setFinalScore] = useState<number>(0);
  const [hitLogs, setHitLogs] = useState<HitLog[]>([]);

  // 최고 점수 (로컬스토리지 보존)
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('mole_game_best_score');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  // 최고 점수 갱신 감지
  const updateBestScore = (score: number) => {
    if (score > bestScore) {
      setBestScore(score);
      try {
        localStorage.setItem('mole_game_best_score', score.toString());
      } catch (e) {
        console.warn('LocalStorage is not accessible', e);
      }
    }
  };

  // 1. 게임 시작 제어
  const handleStartGame = (gameConfig: GameConfig) => {
    setConfig(gameConfig);
    setGameState('playing');
  };

  // 2. 게임 타임아웃 종료 제어
  const handleFinishGame = (score: number, logs: HitLog[]) => {
    setFinalScore(score);
    setHitLogs(logs);
    updateBestScore(score);
    setGameState('score');
  };

  // 3. 동일 설정 즉시 복귀
  const handleRestartSame = () => {
    if (config) {
      setGameState('playing');
    } else {
      setGameState('setup');
    }
  };

  // 4. 새 단어 입력 복귀
  const handleGoToSetup = () => {
    setGameState('setup');
  };

  return (
    <div className="min-h-screen bg-stone-100/60 flex flex-col justify-between py-6 md:py-10 text-stone-800">
      
      {/* 바깥 컨테이너 */}
      <main className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {gameState === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <SetupScreen 
                onStartGame={handleStartGame} 
                bestScore={bestScore} 
              />
            </motion.div>
          )}

          {gameState === 'playing' && config && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <PlayScreen 
                config={config} 
                onFinishGame={handleFinishGame} 
                onGoToSetup={handleGoToSetup} 
              />
            </motion.div>
          )}

          {gameState === 'score' && config && (
            <motion.div
              key="score"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <ScoreScreen 
                score={finalScore}
                hitLogs={hitLogs}
                config={config}
                onRestartSame={handleRestartSame}
                onGoToSetup={handleGoToSetup}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 심플 세트 가이드 바닥글 */}
      <footer className="mt-8 text-center text-[11px] text-stone-400 font-medium">
        <span>© {new Date().getFullYear()} 교육용 두더지 단어 잡기 • 사분사분 뚝딱뚝딱 즐거운 상식 공부</span>
      </footer>

    </div>
  );
}
