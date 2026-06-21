import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameConfig, Difficulty } from '../types';
import { PRESETS, Preset } from '../constants/presets';
import { sfx } from '../utils/audio';
import { Sparkles, Trophy, Settings, HelpCircle, Volume2, VolumeX, AlertCircle, Plus, X, Play } from 'lucide-react';

interface SetupScreenProps {
  onStartGame: (config: GameConfig) => void;
  bestScore: number;
}

export default function SetupScreen({ onStartGame, bestScore }: SetupScreenProps) {
  // 프리셋에서 초기값 로드 (첫 번째 맞춤법을 기본으로)
  const [targetInput, setTargetInput] = useState('');
  const [avoidInput, setAvoidInput] = useState('');
  
  const [targets, setTargets] = useState<string[]>(PRESETS[0].targetWords);
  const [avoids, setAvoids] = useState<string[]>(PRESETS[0].avoidWords);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [duration, setDuration] = useState<number>(30);
  const [isMuted, setIsMuted] = useState(sfx.getMuteStatus());

  const handleToggleMute = () => {
    const muted = sfx.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sfx.playCorrect();
    }
  };

  // 단어 추가 핸들러
  const addTargetWord = () => {
    const trimmed = targetInput.trim();
    if (trimmed && !targets.includes(trimmed)) {
      setTargets([...targets, trimmed]);
      setTargetInput('');
      sfx.playPop();
    }
  };

  const addAvoidWord = () => {
    const trimmed = avoidInput.trim();
    if (trimmed && !avoids.includes(trimmed)) {
      setAvoids([...avoids, trimmed]);
      setAvoidInput('');
      sfx.playPop();
    }
  };

  const removeTargetWord = (word: string) => {
    setTargets(targets.filter(t => t !== word));
  };

  const removeAvoidWord = (word: string) => {
    setAvoids(avoids.filter(a => a !== word));
  };

  // 프리셋 적용
  const handleApplyPreset = (preset: Preset) => {
    setTargets(preset.targetWords);
    setAvoids(preset.avoidWords);
    sfx.playCorrect();
  };

  const handleStart = () => {
    if (targets.length === 0) {
      alert('클릭할 단어(공부할 올바른 단어)를 최소 1개 이상 등록해 주세요!');
      return;
    }
    if (avoids.length === 0) {
      alert('클릭하면 안되는 단어(피해야 할 오답)를 최소 1개 이상 등록해 주세요!');
      return;
    }

    sfx.playGameStart();
    onStartGame({
      targetWords: targets,
      avoidWords: avoids,
      difficulty,
      gameDuration: duration
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 select-none font-sans text-stone-800">
      
      {/* 1. 최상단 대시보드 헤더 */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        {/* 최고 점수 */}
        <div className="flex items-center gap-2.5 bg-yellow-100 border-2 border-yellow-300 px-4 py-2 rounded-full text-yellow-800 font-bold shadow-sm">
          <Trophy className="w-5 h-5 text-yellow-600 animate-bounce" />
          <span>최고 기록: <span className="text-xl font-extrabold">{bestScore}</span>점</span>
        </div>

        {/* 볼륨 컨트롤 */}
        <button
          onClick={handleToggleMute}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all shadow-sm ${
            isMuted 
              ? 'bg-stone-100 border-stone-300 text-stone-500 hover:bg-stone-200' 
              : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
          <span className="font-semibold text-sm">{isMuted ? '음소거 됨' : '소리 켜짐'}</span>
        </button>
      </div>

      {/* 2. 메인 로고 타이틀 디자인 */}
      <div className="text-center mb-10 relative">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-20 pointer-events-none opacity-25">
          <svg viewBox="0 0 100 100" fill="#B45309">
            <path d="M10,90 C10,30 25,10 50,10 C75,10 90,30 90,90 Z" />
          </svg>
        </div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
        >
          <span className="bg-emerald-100 text-emerald-800 text-xs md:text-sm font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider mb-3.5 inline-block shadow-sm">
            🎓 즐겁고 빠른 학습 게임
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-amber-950 mb-4 drop-shadow-sm">
            두더지 <span className="text-emerald-600">단어</span> 잡기!
          </h1>
          <p className="text-stone-500 text-sm md:text-base max-w-lg mx-auto font-medium">
            내가 타자로 입력한 단어들이 두더지와 함께 나옵니다.
            공부할 <span className="text-emerald-600 font-bold underline">맞는 단어</span>만 뿅망치로 사뿐히 때려보세요!
          </p>
        </motion.div>
      </div>

      {/* 3. 추천 프리셋 모음 그리드 */}
      <div className="mb-10 bg-amber-50/50 border border-amber-100 p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-yellow-600" />
          <h2 className="text-lg font-extrabold text-amber-950">추천 학습 템플릿</h2>
          <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-md font-bold">원클릭 준비</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRESETS.map((preset) => (
            <motion.div
              key={preset.id}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.995 }}
              onClick={() => handleApplyPreset(preset)}
              className="bg-white hover:bg-emerald-50/30 border border-stone-200 hover:border-emerald-300 p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between shadow-sm hover:shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                    {preset.category}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-extrabold">
                    단어 총 {preset.targetWords.length + preset.avoidWords.length}개
                  </span>
                </div>
                <h3 className="font-extrabold text-stone-800 text-sm md:text-base mb-1">
                  {preset.title}
                </h3>
                <p className="text-stone-700 font-semibold text-xs line-clamp-1">
                  {preset.description}
                </p>
              </div>
              
              <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                <span className="text-emerald-600 font-medium">
                  ⭕ {preset.targetWords.slice(0, 3).join(', ')}...
                </span>
                <span className="text-rose-500 font-medium">
                  ❌ {preset.avoidWords.slice(0, 3).join(', ')}...
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 4. 단어 직접 입력 및 수정 패널 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        
        {/* 왼쪽: 클릭할 단어 (Target Words) */}
        <div className="bg-emerald-50/40 border border-emerald-100 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs">O</div>
              <h3 className="font-extrabold text-emerald-950 text-base md:text-lg">클릭할 올바른 단어들</h3>
              <span className="text-xs text-emerald-600 font-bold ml-auto">(+{targets.length}개)</span>
            </div>
            <p className="text-stone-700 font-semibold text-xs mb-4">
              화면에서 **클릭하면 +10점**이 되는 공부 단어들을 넣어주세요. (예: 설레는, 안 돼)
            </p>

            {/* 단어 추가 인풋 */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="공부할 단어 입력..."
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTargetWord()}
                className="flex-1 px-3 py-2 border border-stone-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
              <button
                onClick={addTargetWord}
                className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 태그 리스트 */}
          <div className="min-h-[120px] bg-white/70 border border-dashed border-stone-200 rounded-xl p-3 flex flex-wrap gap-1.5 content-start overflow-y-auto max-h-[200px]">
            {targets.length === 0 ? (
              <span className="text-stone-400 text-xs m-auto text-center">
                위 입력창을 사용하거나 추천 템플릿을 골라 단어를 채워보세요!
              </span>
            ) : (
              targets.map(w => (
                <div 
                  key={w} 
                  className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm hover:bg-emerald-100 transition-colors"
                >
                  <span>{w}</span>
                  <button 
                    onClick={() => removeTargetWord(w)}
                    className="text-emerald-500 hover:text-emerald-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 오른쪽: 클릭하면 안 되 단어 (Avoid Words) */}
        <div className="bg-rose-50/40 border border-rose-100 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-xs">X</div>
              <h3 className="font-extrabold text-rose-950 text-base md:text-lg">클릭하면 안 되는 피할 단어들</h3>
              <span className="text-xs text-rose-600 font-bold ml-auto">(+{avoids.length}개)</span>
            </div>
            <p className="text-stone-700 font-semibold text-xs mb-4">
              화면에서 **클릭하면 -10점**이 되는 함정 단어들을 넣어주세요. (예: 설레임, 안 되)
            </p>

            {/* 단어 추가 인풋 */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="함정 단어 입력..."
                value={avoidInput}
                onChange={(e) => setAvoidInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAvoidWord()}
                className="flex-1 px-3 py-2 border border-stone-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              />
              <button
                onClick={addAvoidWord}
                className="px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 태그 리스트 */}
          <div className="min-h-[120px] bg-white/70 border border-dashed border-stone-200 rounded-xl p-3 flex flex-wrap gap-1.5 content-start overflow-y-auto max-h-[200px]">
            {avoids.length === 0 ? (
              <span className="text-stone-400 text-xs m-auto text-center">
                함정 단어를 등록하여 긴장감을 불어넣어 보세요!
              </span>
            ) : (
              avoids.map(w => (
                <div 
                  key={w} 
                  className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm hover:bg-rose-100 transition-colors"
                >
                  <span>{w}</span>
                  <button 
                    onClick={() => removeAvoidWord(w)}
                    className="text-rose-400 hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 5. 시스템 및 시간 설정바 */}
      <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl mb-10 flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Settings className="w-5 h-5 text-stone-500 shrink-0" />
          <div className="flex-1">
            <span className="font-extrabold text-stone-800 text-sm block">난이도 및 제한시간</span>
            <span className="text-xs text-stone-500">두더지가 튀어나오는 개수와 속도를 제어합니다.</span>
          </div>
        </div>

        {/* 난이도 버튼 */}
        <div className="flex bg-stone-200/60 p-1 rounded-xl w-full md:w-auto">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDifficulty(d);
                sfx.playPop();
              }}
              className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                difficulty === d
                  ? d === 'easy'
                    ? 'bg-yellow-500 text-white shadow-sm'
                    : d === 'medium'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-rose-600 text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {d === 'easy' ? '쉬움 (3구멍)' : d === 'medium' ? '보통 (6구멍)' : '어려움 (9구멍)'}
            </button>
          ))}
        </div>

        {/* 시간 세팅 */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs font-extrabold text-stone-500">제한시간:</span>
          <div className="flex bg-stone-200/60 p-1 rounded-xl">
            {[15, 30, 45, 60].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setDuration(t);
                  sfx.playPop();
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  duration === t
                    ? 'bg-stone-800 text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {t}초
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6. 화려한 게임 시작 구동 버튼 */}
      <div className="text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xl rounded-2xl shadow-xl shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 transition-all cursor-pointer group border-b-4 border-emerald-700"
        >
          <Play className="w-6 h-6 fill-white text-white group-hover:rotate-12 transition-transform" />
          <span>게임 시작하기!</span>
          
          {/* 장식용 작은 반짝이 */}
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-[10px] text-yellow-950 px-2 py-0.5 rounded-full font-black animate-pulse shadow">
            START!
          </div>
        </motion.button>
      </div>

      {/* 7. 간단한 도움말 카드 */}
      <div className="mt-12 border-t border-stone-200/80 pt-6 text-stone-500 text-xs leading-relaxed max-w-xl mx-auto flex items-start gap-2">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
        <div>
          <span className="font-bold text-stone-700">안내 말씀:</span> 이 두더지 잡기 게임은 브라우저 환경에서 최적화되어 동작합니다. 직접 타이핑하여 단어를 추가하거나, '올바른 맞춤법 공부' 등 이미 준비되어 있는 재미있는 템플릿 카드를 누르면 순식간에 게임 세팅이 완성됩니다.
        </div>
      </div>

    </div>
  );
}
