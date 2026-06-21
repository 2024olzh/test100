import React from 'react';
import { motion } from 'motion/react';
import { GameConfig, HitLog } from '../types';
import { sfx } from '../utils/audio';
import { Trophy, RefreshCw, Sliders, CheckCircle, XCircle, Award, BarChart3, Star } from 'lucide-react';

interface ScoreScreenProps {
  score: number;
  hitLogs: HitLog[];
  config: GameConfig;
  onRestartSame: () => void;
  onGoToSetup: () => void;
}

export default function ScoreScreen({ score, hitLogs, config, onRestartSame, onGoToSetup }: ScoreScreenProps) {
  // 간단 통계 연산
  const correctHits = hitLogs.filter(log => log.isCorrect).length;
  const incorrectHits = hitLogs.filter(log => !log.isCorrect).length;
  const totalClicks = correctHits + incorrectHits;
  const accuracy = totalClicks > 0 ? Math.round((correctHits / totalClicks) * 100) : 0;

  // 점수에 따른 칭호/등급 산정
  let grade = '단어 견습생 🐹';
  let gradeColor = 'from-amber-400 to-amber-600';
  let feedbackText = '조금 더 공부하다 보면 두더지를 전부 잡아내실 수 있을 거예요!';

  if (score >= 200) {
    grade = '마스터 단어 수호자 🧙‍♂️';
    gradeColor = 'from-violet-500 to-fuchsia-600';
    feedbackText = '대단해요! 단어를 완벽하게 파악하고 번개 같은 피지컬로 정답만 골라잡았습니다!';
  } else if (score >= 100) {
    grade = '명예 두더지 사냥꾼 🤠';
    gradeColor = 'from-emerald-400 to-teal-600';
    feedbackText = '훌륭한 실력이에요! 함정 단어들을 영리하게 잘 피하며 뛰어난 상식을 증명했습니다.';
  } else if (score >= 50) {
    grade = '스마트 주니어 🎓';
    gradeColor = 'from-blue-400 to-indigo-600';
    feedbackText = '충분히 잘 하셨어요! 몇 차례 오답을 피하고 정답을 더 잡으면 완벽해질 수 있습니다.';
  } else if (score < 0) {
    grade = '어지러운 방랑자 🌀';
    gradeColor = 'from-rose-400 to-rose-600';
    feedbackText = '오이쿠! 함정 단어에 많이 속으셨네요. 다시 공부해서 정답 단어 위주로 노려봅시다!';
  }

  // 단어별 통계 분류
  const targetHitsCount: Record<string, number> = {};
  const avoidHitsCount: Record<string, number> = {};

  hitLogs.forEach((log) => {
    if (log.isCorrect) {
      targetHitsCount[log.word] = (targetHitsCount[log.word] || 0) + 1;
    } else {
      avoidHitsCount[log.word] = (avoidHitsCount[log.word] || 0) + 1;
    }
  });

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 select-none font-sans text-stone-850">
      
      {/* 1. 상단 축하 트로피 일러스트 */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.3, rotate: -15, opacity: 0 }}
          animate={{ scale: [0.5, 1.1, 1], rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="inline-block relative mb-4"
        >
          {/* 노란 배경링 */}
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center border-4 border-yellow-300 shadow-inner">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          
          {/* 퍼지는 영광의 별들 */}
          {score >= 50 && (
            <>
              <Star className="absolute top-0 -left-4 w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
              <Star className="absolute -bottom-1 -right-3 w-5 h-5 text-yellow-400 fill-yellow-400 animate-bounce" />
            </>
          )}
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-black text-amber-950 mb-2">
          학습 게임 결과 리포트
        </h1>
        <p className="text-stone-500 font-semibold text-sm">
          설정한 30초의 제한시간이 모두 종료되었습니다!
        </p>
      </div>

      {/* 2. 등급 및 점수 메인 카드 */}
      <div className="bg-white border-2 border-stone-200 rounded-3xl overflow-hidden shadow-lg mb-8">
        
        {/* 등급 바 */}
        <div className={`bg-gradient-to-r ${gradeColor} px-6 py-4 text-white flex justify-between items-center`}>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            <span className="font-extrabold text-sm md:text-base tracking-wide">수여 칭호</span>
          </div>
          <span className="font-black text-base md:text-lg bg-white/20 px-3.5 py-1 rounded-full border border-white/20">
            {grade}
          </span>
        </div>

        {/* 내 점수 메인 지표 그리드 */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center border-b border-stone-100">
          
          {/* 최종 점수 */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
            <span className="text-xs font-bold text-stone-500 uppercase block mb-1">최종 점수</span>
            <span className={`text-4xl font-black block tracking-tight ${score >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {score >= 0 ? `+${score}` : score}점
            </span>
          </div>

          {/* 성공 횟수 */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 flex flex-col justify-center">
            <span className="text-xs font-bold text-stone-500 block mb-1">맞춘 단어 (성공)</span>
            <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-extrabold text-2xl">
              <CheckCircle className="w-5 h-5" />
              <span>{correctHits}회</span>
            </div>
          </div>

          {/* 타격 정확도 */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 flex flex-col justify-center">
            <span className="text-xs font-bold text-stone-500 block mb-1">판독 정확도</span>
            <div className={`flex items-center justify-center gap-1.5 font-extrabold text-2xl ${accuracy >= 80 ? 'text-blue-600' : accuracy >= 50 ? 'text-amber-600' : 'text-stone-500'}`}>
              <BarChart3 className="w-5 h-5" />
              <span>{accuracy}%</span>
            </div>
          </div>

        </div>

        {/* 등급 피드백 한 줄 소평 */}
        <div className="px-6 py-4 bg-amber-50/50 text-center">
          <p className="text-stone-700 text-sm font-semibold max-w-xl mx-auto">
            {feedbackText}
          </p>
        </div>

      </div>

      {/* 3. 학습 정답 분석 로그 (매우 중요 디테일) */}
      <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 mb-10">
        
        <div className="flex items-center gap-2 mb-4 border-b border-stone-200 pb-3">
          <BarChart3 className="w-5 h-5 text-stone-500" />
          <h2 className="text-base font-extrabold text-stone-800">오답 및 정답 빈도 정밀 학습 차트</h2>
          <span className="text-xs text-stone-500 ml-auto font-medium">클릭 기록 분석</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* 성공 단어 내역 */}
          <div className="bg-white border border-stone-200 p-4 rounded-2xl">
            <h3 className="font-extrabold text-emerald-800 text-sm flex items-center gap-1.5 mb-3">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              정답을 정확히 잡은 단어 log
            </h3>
            
            {Object.keys(targetHitsCount).length === 0 ? (
              <p className="text-stone-400 text-xs py-6 text-center">정확히 클릭한 올바른 단어가 없습니다.</p>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto">
                {Object.entries(targetHitsCount).map(([word, count]) => (
                  <div key={word} className="flex justify-between items-center text-xs bg-emerald-50/40 px-3 py-2 rounded-lg border border-emerald-100">
                    <span className="font-bold text-stone-700">{word}</span>
                    <span className="font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">{count}회 잡음</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 오폭한 단어 내역 */}
          <div className="bg-white border border-stone-200 p-4 rounded-2xl">
            <h3 className="font-extrabold text-rose-800 text-sm flex items-center gap-1.5 mb-3">
              <XCircle className="w-4 h-4 text-rose-500" />
              실수로 수축한 함정 단어 log
            </h3>

            {Object.keys(avoidHitsCount).length === 0 ? (
              <p className="text-stone-500 text-xs py-6 text-center text-emerald-600 font-extrabold flex items-center justify-center gap-1">
                🎉 완벽한 선구안! 함정 단어 클릭 0회!
              </p>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto">
                {Object.entries(avoidHitsCount).map(([word, count]) => (
                  <div key={word} className="flex justify-between items-center text-xs bg-rose-50/40 px-3 py-2 rounded-lg border border-rose-100">
                    <span className="font-bold text-stone-600">{word}</span>
                    <span className="font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">{count}회 실수</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        <p className="text-[11px] text-stone-500 mt-4 leading-relaxed text-center">
          * 헷갈렸던 단어들을 한 눈에 볼 수 있습니다. 실수가 많았던 함정 단어(우측 패널)는 보건 및 우리 생활에서 더 각별히 관찰해 학습 영역으로 기억해 가세요!
        </p>

      </div>

      {/* 4. 하단 동작 컨트롤 그리드 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        
        {/* 즉시 동일 조건 재시작 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            sfx.playGameStart();
            onRestartSame();
          }}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/10 transition-all cursor-pointer border-b-4 border-emerald-800"
        >
          <RefreshCw className="w-5 h-5" />
          <span>같은 단어로 다시 도전!</span>
        </motion.button>

        {/* 설정화면으로 복귀 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            sfx.playPop();
            onGoToSetup();
          }}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-stone-100 hover:bg-stone-200 text-stone-700 border-2 border-stone-300 font-bold rounded-2xl shadow-sm transition-all cursor-pointer"
        >
          <Sliders className="w-5 h-5" />
          <span>단어 및 시간 새로 설정</span>
        </motion.button>

      </div>

    </div>
  );
}
