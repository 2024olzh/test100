import { motion } from 'motion/react';
import { MoleState } from '../types';

interface MoleHoleProps {
  key?: any;
  mole: MoleState;
  onWhack: (moleId: number) => void;
}

export default function MoleHole({ mole, onWhack }: MoleHoleProps) {
  const { isActive, word, isHit, hitStatus } = mole;

  // 두더지 색 및 말판 스타일링
  // 맞았을 때의 두더지 표정 결정
  return (
    <div 
      id={`mole-hole-${mole.id}`}
      className="relative w-full aspect-square flex flex-col items-center justify-end overflow-visible select-none"
    >
      {/* 1. 뒷배경 흙더미 입체감 표시 */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[85%] h-6 bg-amber-950/40 rounded-[100%] blur-[2px]" />

      {/* 2. 두더지와 단어판이 튀어나오는 마스크 컨테이너 */}
      <div className="relative w-full h-[85%] overflow-hidden flex items-end justify-center rounded-t-3xl">
        <div className="absolute w-[85%] h-[80%] bottom-0 overflow-visible flex items-end justify-center">
          
          {/* 두더지 캐릭터의 동작 & 애니메이션 */}
          <motion.div
            className="relative w-full h-full flex flex-col items-center justify-end cursor-pointer"
            initial={{ y: '100%' }}
            animate={{ y: isActive ? '5%' : '100%' }}
            transition={{ 
              type: 'spring', 
              stiffness: isActive ? 380 : 420, 
              damping: isActive ? 18 : 28 
            }}
            onClick={() => {
              if (isActive && !isHit) {
                onWhack(mole.id);
              }
            }}
          >
            {/* 단어 표지판 (두더지 머리 위에 떠오르는 말풍선 형태) */}
            <motion.div 
              className={`absolute -top-1 z-20 px-3 py-1.5 rounded-xl border shadow-md font-sans text-xs md:text-sm font-bold text-center select-none whitespace-nowrap whitespace-normal max-w-[95%] transition-colors duration-200 ${
                isHit 
                  ? hitStatus === 'correct'
                    ? 'bg-emerald-500 border-emerald-600 text-white animate-bounce'
                    : 'bg-rose-500 border-rose-600 text-white animate-shake'
                  : 'bg-white border-amber-200 text-amber-950'
              }`}
              style={{ filter: 'drop-shadow(0px 3px 4px rgba(0,0,0,0.15))' }}
            >
              {word}
              {/* 말풍선 꼬리 */}
              <div className={`absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] transition-colors duration-200 ${
                isHit 
                  ? hitStatus === 'correct' 
                    ? 'border-t-emerald-500' 
                    : 'border-t-rose-500'
                  : 'border-t-white'
              }`} />
            </motion.div>

            {/* 귀여운 SVG 두더지 몸체 */}
            <svg 
              viewBox="0 0 100 90" 
              className="w-[85%] h-[75%] overflow-visible filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]"
            >
              {/* 두더지 몸통 */}
              <path 
                d="M 12,90 C 12,35 25,12 50,12 C 75,12 88,35 88,90 Z" 
                fill={isHit ? '#A16207' : '#B45309'} // 평소엔 밝은 황토/갈색, 타격 시에는 어지러운 어두운 갈색
                className="transition-colors duration-200"
              />
              
              {/* 볼 터치 */}
              {!isHit && (
                <>
                  <circle cx="28" cy="54" r="6" fill="#F87171" opacity="0.6" />
                  <circle cx="72" cy="54" r="6" fill="#F87171" opacity="0.6" />
                </>
              )}

              {/* 귀여운 배색 배 (털) */}
              <path d="M 28,90 C 28,68 38,58 50,58 C 62,58 72,68 72,90 Z" fill="#FEF3C7" opacity="0.6" />

              {/* 눈 */}
              {isHit ? (
                // 타격 성공/실패 시의 어지러운 소용돌이 혹은 감긴 눈 (X_X 또는 @__@)
                hitStatus === 'correct' ? (
                  // 성공적으로 타격: 기절 표시 (X X)
                  <>
                    {/* 왼쪽 눈 X */}
                    <line x1="26" y1="40" x2="36" y2="48" stroke="#374151" strokeWidth="4" strokeLinecap="round" />
                    <line x1="36" y1="40" x2="26" y2="48" stroke="#374151" strokeWidth="4" strokeLinecap="round" />
                    {/* 오른쪽 눈 X */}
                    <line x1="64" y1="40" x2="74" y2="48" stroke="#374151" strokeWidth="4" strokeLinecap="round" />
                    <line x1="74" y1="40" x2="64" y2="48" stroke="#374151" strokeWidth="4" strokeLinecap="round" />
                  </>
                ) : (
                  // 잘못 때려서 우는 눈 (ㅠ ㅠ)
                  <>
                    <path d="M 25,40 Q 30,35 35,40" fill="none" stroke="#374151" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 65,40 Q 70,35 75,40" fill="none" stroke="#374151" strokeWidth="4" strokeLinecap="round" />
                    {/* 눈물방울 */}
                    <path d="M 28,49 L 32,49 L 30,55 Z" fill="#3B82F6" />
                    <path d="M 68,49 L 72,49 L 70,55 Z" fill="#3B82F6" />
                  </>
                )
              ) : (
                // 기본 눈 (호기심 가득 똘망똘망)
                <>
                  <circle cx="31" cy="42" r="6" fill="#1F2937" />
                  <circle cx="33" cy="40" r="2" fill="#FFFFFF" /> {/* 반짝임 */}
                  <circle cx="69" cy="42" r="6" fill="#1F2937" />
                  <circle cx="71" cy="40" r="2" fill="#FFFFFF" /> {/* 반짝임 */}
                </>
              )}

              {/* 귀여운 코 */}
              <ellipse 
                cx="50" 
                cy="49" 
                rx="7" 
                ry="5" 
                fill={isHit ? '#EF4444' : '#1F2937'} 
              />
              
              {/* 입 */}
              {isHit ? (
                // 맞았을 때 비명을 지르는 찌그러진 오목 입
                <path d="M 44,60 Q 50,54 56,60" fill="none" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
              ) : (
                // 평상시 앞니가 툭 튀어나온 미소
                <>
                  <path d="M 44,53 Q 50,59 56,53" fill="none" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
                  <rect x="47" y="55" width="6" height="5" fill="#FFFFFF" stroke="#1F2937" strokeWidth="1" rx="1" />
                </>
              )}

              {/* 짧고 귀여운 수염 */}
              {!isHit && (
                <>
                  <line x1="22" y1="52" x2="10" y2="50" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="22" y1="55" x2="12" y2="57" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="78" y1="52" x2="90" y2="50" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="78" y1="55" x2="88" y2="57" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
            </svg>

            {/* 타격 시의 별/구름 이펙트 폭발 애니메이션 */}
            {isHit && (
              <motion.div
                className="absolute top-1/3 z-20 pointer-events-none"
                initial={{ scale: 0.3, opacity: 1 }}
                animate={{ scale: [0.5, 1.2, 0.9], opacity: [1, 1, 0] }}
                transition={{ duration: 0.4 }}
              >
                {hitStatus === 'correct' ? (
                  // 노란 별 폭발 (O)
                  <svg viewBox="0 0 40 40" className="w-12 h-12 text-yellow-400 fill-current filter drop-shadow">
                    <path d="M20 0l6 12 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2z" />
                  </svg>
                ) : (
                  // 빨간 연기/충격 기호 (X)
                  <div className="w-10 h-10 rounded-full border-4 border-rose-500 bg-white/90 flex items-center justify-center font-bold text-rose-500 text-lg">
                    X
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

        </div>
      </div>

      {/* 3. 앞배경 흙더미 & 구멍 테두리 (가장 위로 덮어씌워서 완벽한 3D 하강 효과) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-12 z-10 pointer-events-none">
        {/* 구멍 안쪽 어둠 */}
        <div className="absolute top-0 left-0 w-full h-8 bg-amber-950 rounded-[100%] border-2 border-amber-900 overflow-hidden shadow-inner flex items-center justify-center">
          <div className="w-[96%] h-[90%] bg-black/60 rounded-[100%]" />
        </div>
        
        {/* 구멍 앞쪽 굴곡 튀어나온 흙 표현 */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-[94%] h-8 bg-amber-800 rounded-[100%] opacity-90 border-t border-amber-700/50 flex justify-center items-center">
          {/* 자잘한 돌덩이, 잔디, 흙 디테일 */}
          <div className="flex gap-4 opacity-75">
            <div className="w-1.5 h-1.5 bg-amber-950 rounded-full rotate-12" />
            <div className="w-2.5 h-1.5 bg-amber-900 rounded-sm" />
            <div className="w-1 h-1 bg-amber-950 rounded-full -rotate-45" />
          </div>
        </div>

        {/* 잔디 조각을 추가하여 전원 농장 자연주의 느낌 디테일 */}
        <div className="absolute -top-1 left-2 w-3 h-4 bg-emerald-500 rounded-t-full origin-bottom -rotate-12" />
        <div className="absolute -top-0.5 left-5 w-2.5 h-3 bg-emerald-600 rounded-t-full origin-bottom rotate-6" />
        <div className="absolute -top-1 right-3 w-3 h-4 bg-emerald-500 rounded-t-full origin-bottom rotate-12" />
      </div>
    </div>
  );
}
