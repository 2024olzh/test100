import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameConfig, MoleState, HitLog } from '../types';
import { sfx } from '../utils/audio';
import MoleHole from './MoleHole';
import { Timer, Star, AlertCircle, RefreshCw, Volume2, VolumeX, Pause, Play } from 'lucide-react';

interface PlayScreenProps {
  config: GameConfig;
  onFinishGame: (finalScore: number, logs: HitLog[]) => void;
  onGoToSetup: () => void;
}

export default function PlayScreen({ config, onFinishGame, onGoToSetup }: PlayScreenProps) {
  const { targetWords, avoidWords, difficulty, gameDuration } = config;

  // 1. 점수 및 시간 세팅
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(gameDuration);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hitLogs, setHitLogs] = useState<HitLog[]>([]);
  const [isMuted, setIsMuted] = useState(sfx.getMuteStatus());

  // 2. 두더지 상태 배열 (난이도에 맞춰 구멍 수 설정)
  // 쉬움: 3개, 보통: 6개, 어려움: 9개
  const numHoles = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 6 : 9;
  const [moles, setMoles] = useState<MoleState[]>(() => 
    Array.from({ length: numHoles }, (_, i) => ({
      id: i,
      isActive: false,
      word: '',
      isTarget: false,
      isHit: false,
      hitStatus: null
    }))
  );

  // 3. 점수 변동 알림 보드 (화면에 일시적으로 피어오르게 할 플로팅 텍스트 이펙트)
  const [floatScores, setFloatScores] = useState<{ id: number; text: string; x: number; y: number; isPlus: boolean }[]>([]);
  const floatIdCounter = useRef(0);

  // 4. 귀여운 토이 해머(망치) 커서 관리용 좌표
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHammerSwinging, setIsHammerSwinging] = useState(false);
  const [isMouseInStage, setIsMouseInStage] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  // 레퍼런스 타이머 관리용들
  const gameLoopTimer = useRef<NodeJS.Timeout | null>(null);
  const clockTimer = useRef<NodeJS.Timeout | null>(null);
  const moleRetireTimers = useRef<Record<number, NodeJS.Timeout>>({});

  // 5. 음소거 제어
  const handleToggleMute = () => {
    const muted = sfx.toggleMute();
    setIsMuted(muted);
    if (!muted) sfx.playCorrect();
  };

  // 6. 마우스 트래킹 (뿅망치 표시 장치)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseDown = () => {
    setIsHammerSwinging(true);
    setTimeout(() => setIsHammerSwinging(false), 120);
  };

  // 7. 게임 오버 트리거
  const triggerGameOver = () => {
    // 모든 타이머 정지
    if (gameLoopTimer.current) clearInterval(gameLoopTimer.current);
    if (clockTimer.current) clearInterval(clockTimer.current);
    Object.values(moleRetireTimers.current).forEach(t => clearTimeout(t as any));
    
    sfx.playGameComplete();
    onFinishGame(score, hitLogs);
  };

  // 8. 1초 간격으로 흘러가는 타이머
  useEffect(() => {
    if (isPaused) return;

    if (timeLeft <= 0) {
      triggerGameOver();
      return;
    }

    clockTimer.current = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => {
      if (clockTimer.current) clearTimeout(clockTimer.current);
    };
  }, [timeLeft, isPaused]);

  // 9. 두더지 출사 로직 수립 (지정 난이도 주기별로 튀어나옴)
  useEffect(() => {
    if (isPaused) return;

    // 난이도별 출사 주기 (초 단위 최적 밸런스)
    // 쉬움: 2.2초 마다 새 두더지, 보통: 1.5초 마다, 어려움: 0.9초 마다
    const spawnInterval = difficulty === 'easy' ? 2200 : difficulty === 'medium' ? 1500 : 900;
    
    gameLoopTimer.current = setInterval(() => {
      spawnMole();
    }, spawnInterval);

    // 최초 1마리 즉시 소환
    spawnMole();

    return () => {
      if (gameLoopTimer.current) clearInterval(gameLoopTimer.current);
    };
  }, [difficulty, isPaused, targetWords, avoidWords]);

  // 10. 두더지 개별 소환 가동 엔진
  const spawnMole = () => {
    setMoles(currentMoles => {
      // 1. 현재 숨어 있는(비활성) 구멍의 인덱스 검색
      const hiddenIndices = currentMoles
        .map((m, idx) => (!m.isActive ? idx : -1))
        .filter(idx => idx !== -1);

      if (hiddenIndices.length === 0) return currentMoles; // 빈자리 없으면 소환 패스

      // 2. 무작위 구멍 하나 선택
      const randomHoleIdx = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];

      // 3. 타겟 단어 VS 회피 단어 비중 선택 (약 55:45 수준으로 배분)
      const isTarget = Math.random() < 0.55;
      const wordPool = isTarget ? targetWords : avoidWords;
      const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)] || '공백';

      // 4. 두더지 노출 제한 시간 산정 (시간 지나면 알아서 숨음)
      // 쉬움: 3.2초 대기, 보통: 2.4초 대기, 어려움: 1.6초 대기
      const moleLifetime = difficulty === 'easy' ? 3200 : difficulty === 'medium' ? 2400 : 1600;

      // 이미 존재하던 자진 타이머가 있다면 제거
      if (moleRetireTimers.current[randomHoleIdx]) {
        clearTimeout(moleRetireTimers.current[randomHoleIdx]);
      }

      // 두더지 자진 하강 예약
      moleRetireTimers.current[randomHoleIdx] = setTimeout(() => {
        descendMole(randomHoleIdx);
      }, moleLifetime);

      // 효과음 작게 출력
      sfx.playPop();

      // 두더지 활성화 묘사
      return currentMoles.map((m, idx) => {
        if (idx === randomHoleIdx) {
          return {
            ...m,
            isActive: true,
            word: randomWord,
            isTarget,
            isHit: false,
            hitStatus: null
          };
        }
        return m;
      });
    });
  };

  // 11. 두더지 자진 하강 프로세스 (맞지 않고 자연 리턴)
  const descendMole = (holeIdx: number) => {
    setMoles(currentMoles => 
      currentMoles.map((m, idx) => {
        if (idx === holeIdx) {
          return { ...m, isActive: false };
        }
        return m;
      })
    );
  };

  // 12. 두더지 타격(클릭) 판정 매니저
  const handleWhack = (moleId: number) => {
    if (isPaused) return;

    setMoles(currentMoles => {
      const targetMole = currentMoles.find(m => m.id === moleId);
      if (!targetMole || !targetMole.isActive || targetMole.isHit) return currentMoles;

      const isCorrect = targetMole.isTarget; // 꼽힌 단어가 타겟이면 정확함

      // 즉시 감점/가점 반영 및 로그 적립
      if (isCorrect) {
        setScore(prev => prev + 10);
        sfx.playCorrect();
        addFloatingEffect('+10', true);
      } else {
        setScore(prev => prev - 10);
        sfx.playIncorrect();
        addFloatingEffect('-10', false);
      }

      // 타격 로그 저장
      const newLog: HitLog = {
        id: Math.random().toString(36).substr(2, 9),
        word: targetMole.word,
        isCorrect,
        timestamp: Date.now()
      };
      setHitLogs(prev => [...prev, newLog]);

      // 예약되어 있던 자연 하강 타이머 취소
      if (moleRetireTimers.current[moleId]) {
        clearTimeout(moleRetireTimers.current[moleId]);
      }

      // 맞았을 때 리액션을 보여준 뒤 0.4초 후 아래로 숨겨줌
      moleRetireTimers.current[moleId] = setTimeout(() => {
        descendMole(moleId);
      }, 450);

      // 두더지 표정 변환 및 이펙트 오버레이
      return currentMoles.map(m => {
        if (m.id === moleId) {
          return {
            ...m,
            isHit: true,
            hitStatus: isCorrect ? 'correct' : 'incorrect'
          };
        }
        return m;
      });
    });
  };

  // 13. 타격 점수 증가/감소 플로팅 문자 추가
  const addFloatingEffect = (text: string, isPlus: boolean) => {
    const id = floatIdCounter.current++;
    // 커서 위치 기준으로 띄우거나, 만약 커서가 없으면 화면 정가운데 띄움
    const xRange = mousePos.x > 0 ? mousePos.x : window.innerWidth / 2 - 100;
    const yRange = mousePos.y > 0 ? mousePos.y : window.innerHeight / 2 - 100;
    
    const newFloat = { id, text, x: xRange, y: yRange, isPlus };
    setFloatScores(prev => [...prev, newFloat]);

    setTimeout(() => {
      setFloatScores(prev => prev.filter(f => f.id !== id));
    }, 800);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 font-sans select-none text-stone-800">
      
      {/* 1. 상단 바 (헤더 계기판) */}
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 bg-white border border-stone-200/80 rounded-2xl p-4 shadow-md mb-6">
        
        {/* 타이머 */}
        <div className="flex items-center gap-3 justify-center md:justify-start">
          <div className={`p-2.5 rounded-xl flex items-center justify-center border transition-colors ${
            timeLeft <= 5 
              ? 'bg-rose-50 border-rose-200 text-rose-500 animate-pulse' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-600'
          }`}>
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold block uppercase">남은 시간</span>
            <span className={`text-2xl font-black tabular-nums leading-none ${timeLeft <= 5 ? 'text-rose-600 font-extrabold' : 'text-stone-800'}`}>
              {timeLeft}초
            </span>
          </div>
        </div>

        {/* 현재 점수판 (모션 이펙트 포함) */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wide">누적 점수</span>
          <motion.div 
            key={score}
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.2 }}
            className={`text-3xl font-black tracking-tight leading-none ${score >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}
          >
            {score >= 0 ? `+${score}` : score}
          </motion.div>
        </div>

        {/* 재생/정지 및 볼륨 퀵패널 */}
        <div className="flex items-center gap-2 justify-center md:justify-end">
          {/* 일시 정지 버튼 */}
          <button
            onClick={() => {
              setIsPaused(!isPaused);
              sfx.playPop();
            }}
            className={`p-2 rounded-xl border transition-all ${
              isPaused 
                ? 'bg-yellow-500 border-yellow-600 text-white hover:bg-yellow-600' 
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
            title="게임 일시 중지"
          >
            {isPaused ? <Play className="w-5 h-5 fill-white" /> : <Pause className="w-5 h-5 fill-stone-600" />}
          </button>

          {/* 소리 조화 */}
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border transition-all ${
              isMuted 
                ? 'bg-stone-100 border-stone-200 text-stone-400 hover:bg-stone-200' 
                : 'bg-emerald-5 border-emerald-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          
          {/* 하차 나가기 */}
          <button
            onClick={() => {
              if (confirm('게임을 포기하고 단어 수정 메인으로 가시겠습니까? 현재 점수는 날아갑니다.')) {
                onGoToSetup();
              }
            }}
            className="px-3 py-2 text-xs font-bold text-rose-500 hover:text-rose-700 border border-rose-200 hover:bg-rose-50 rounded-xl transition-all"
          >
            포기하기
          </button>
        </div>

      </div>

      {/* 2. 남은 시간 프로그레스바 */}
      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200/50 mb-6">
        <motion.div 
          className={`h-full transition-all duration-300 ${
            timeLeft <= 5 ? 'bg-gradient-to-r from-rose-500 to-red-650' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
          }`}
          style={{ width: `${(timeLeft / gameDuration) * 100}%` }}
        />
      </div>

      {/* 3. 단어 규칙 참고 도판 (Legend Board) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* 먹이 단어 안내선 */}
        <div className="bg-emerald-50/50 border border-emerald-100 px-4 py-3 rounded-2xl flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-extrabold flex items-center justify-center text-xs shadow-sm">O</div>
          <div className="flex-1 overflow-hidden">
            <span className="text-[10px] font-black text-emerald-700 block uppercase leading-tight">클릭해야 할 공부 단어 (+10점)</span>
            <span className="text-xs text-stone-600 font-extrabold line-clamp-1 truncate">
              {targetWords.join(', ')}
            </span>
          </div>
        </div>

        {/* 피할 단어 안내선 */}
        <div className="bg-rose-50/50 border border-rose-100 px-4 py-3 rounded-2xl flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-rose-500 text-white font-extrabold flex items-center justify-center text-xs shadow-sm">X</div>
          <div className="flex-1 overflow-hidden">
            <span className="text-[10px] font-black text-rose-700 block uppercase leading-tight">클릭하면 안 되 감점 단어 (-10점)</span>
            <span className="text-xs text-stone-600 font-extrabold line-clamp-1 truncate">
              {avoidWords.join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* 4. 일시 중지일 때 흐림 효과 오버레이 */}
      <div className="relative">
        <AnimatePresence>
          {isPaused && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/45 backdrop-blur-sm z-30 rounded-3xl flex flex-col items-center justify-center text-center text-white"
            >
              <div className="bg-stone-900/80 p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl max-w-sm mx-auto">
                <Pause className="w-12 h-12 text-yellow-400 mx-auto mb-3 animate-bounce" />
                <h3 className="text-xl font-extrabold mb-1.5">게임 일시 정지상태</h3>
                <p className="text-stone-300 text-xs leading-relaxed mb-4">
                  일시 정지 중에는 단어 두더지가 나오지 않습니다. 재개하려면 아래 버튼을 누르세요.
                </p>
                <button
                  onClick={() => setIsPaused(false)}
                  className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-black rounded-xl shadow transition-colors"
                >
                  게임 계속 진행하기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. 실제 게임 흙밭 스테이지 (이곳 위에서 커스텀 뿅망치가 따라다님) */}
        <div
          id="whack-game-stage"
          ref={stageRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setIsMouseInStage(true)}
          onMouseLeave={() => setIsMouseInStage(false)}
          className={`relative bg-gradient-to-b from-stone-800 to-stone-950 border-4 border-stone-700 rounded-3xl p-6 md:p-8 shadow-2xl grid gap-4 md:gap-6 ${
            isMouseInStage ? 'cursor-none' : 'cursor-default'
          } ${
            difficulty === 'easy' 
              ? 'grid-cols-3' 
              : difficulty === 'medium'
                ? 'grid-cols-3 grid-rows-2'
                : 'grid-cols-3 grid-rows-3'
          }`}
          style={{ 
            minHeight: difficulty === 'easy' ? '200px' : difficulty === 'medium' ? '360px' : '480px',
            backgroundImage: 'radial-gradient(ellipse at center, #78350f 0%, #1c1917 100%)' // 흙밭 테마 입체그라데이션
          }}
        >
          {/* 뒤뜰 장식 라인들 */}
          <div className="absolute inset-0 pointer-events-none opacity-5 border-2 border-dashed border-amber-500 rounded-2xl m-3" />
          
          {/* 격자별 두더지 구멍들 렌더링 */}
          {moles.map((mole) => (
            <MoleHole
              key={mole.id}
              mole={mole}
              onWhack={handleWhack}
            />
          ))}

          {/* 6. 격자 안에서 마우스를 따라가는 초감각 망치 (Toy Hammer Cursor) */}
          <AnimatePresence>
            {isMouseInStage && !isPaused && (
              <motion.div
                className="absolute pointer-events-none z-50 overflow-visible"
                style={{
                  left: mousePos.x,
                  top: mousePos.y,
                  transform: 'translate(-30%, -60%)' // 구심점 최적 조정 (망치 머리가 마우스 끝에 오도록)
                }}
                animate={{
                  rotate: isHammerSwinging ? 35 : -25,
                  scale: isHammerSwinging ? 0.9 : 1
                }}
                transition={{
                  type: 'spring',
                  stiffness: 800,
                  damping: 18
                }}
              >
                {/* 뿅망치 모양의 SVG */}
                <svg viewBox="0 0 100 100" className="w-[70px] h-[70px] filter drop-shadow-[2px_6px_4px_rgba(0,0,0,0.4)]">
                  {/* 손잡이 (노란 갈색 봉) */}
                  <rect x="15" y="45" width="45" height="10" rx="3" fill="#D35400" transform="rotate(-40, 20, 50)" />
                  <rect x="18" y="47" width="10" height="6" rx="1" fill="#F39C12" transform="rotate(-40, 20, 50)" /> {/* 단주장식 */}
                  
                  {/* 망치 몸체 (강력한 붉은 뿅망치 뽕뽓) */}
                  <rect x="52" y="15" width="28" height="46" rx="6" fill="#E74C3C" />
                  <rect x="57" y="17" width="18" height="42" rx="3" fill="#F1948A" opacity="0.3" /> {/* 위 하이라이트 */}
                  
                  {/* 망치 고무 패킹 (하양 노랑 스프라이트 고무링 머리 부분) */}
                  <rect x="49" y="10" width="34" height="6" rx="2" fill="#F1C40F" />
                  <rect x="49" y="60" width="34" height="6" rx="2" fill="#F1C40F" />
                  
                  {/* 망치 뒤 장식 벨브 */}
                  <circle cx="66" cy="38" r="4" fill="#F1C40F" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 7. 타격 점수 변동 플로팅 팝파 (+10 / -10 둥실둥실 상승 효과) */}
          <AnimatePresence>
            {floatScores.map((f) => (
              <motion.div
                key={f.id}
                className={`absolute pointer-events-none z-50 font-black text-2xl filter drop-shadow`}
                style={{ left: f.x - 15, top: f.y - 35 }}
                initial={{ opacity: 1, scale: 0.6, y: 0 }}
                animate={{ opacity: [1, 1, 0], scale: 1.3, y: -65 }}
                transition={{ duration: 0.7 }}
              >
                <span className={f.isPlus ? 'text-yellow-400' : 'text-rose-500'}>
                  {f.text}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

        </div>
      </div>

      {/* 8. 안전 안내판 */}
      <div className="mt-6 flex items-start gap-1.5 bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs text-stone-500 leading-relaxed">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
        <div>
          <span className="font-bold text-stone-700">신개념 눈과 손의 협응 발달:</span> 두더지가 번개처럼 튀어나옵니다. 단어를 읽지 않고 눈앞의 색감이나 형태만 보고 다짜고짜 아무거나 클릭하면 오히려 감점이 누적될 수 있습니다! 정확히 식별(선택적 주의집중 장치)해서 잡는 것이 고득점 비법입니다.
        </div>
      </div>

    </div>
  );
}
