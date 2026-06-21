export interface Preset {
  id: string;
  category: string;
  title: string;
  description: string;
  targetWords: string[];
  avoidWords: string[];
}

export const PRESETS: Preset[] = [
  {
    id: 'korean_spelling',
    category: '국어',
    title: '올바른 맞춤법 공부',
    description: '공부하면서 햇갈리는 올바른 한글 맞춤법 단어를 잡아보세요!',
    targetWords: ['설레는', '안 돼', '어이없다', '오랫동안', '무난하다', '어떡해', '며칠', '안팎', '역할', '바람(소원)', '희한하다'],
    avoidWords: ['설레임', '안 되', '어의없다', '오래동안', '문안하다', '어떻해', '몇일', '안팍', '역활', '바램', '희한하다X']
  },
  {
    id: 'fruit_vs_veg',
    category: '과학/생물',
    title: '과일 vs 야채 구분하기',
    description: '나무에서 자라는 진짜 과일만 골라 잡고, 밭에서 자라는 채소는 피하세요!',
    targetWords: ['사과', '배', '포도', '귤', '복숭아', '감', '체리', '자두', '레몬', '오렌지'],
    avoidWords: ['당근', '오이', '감자', '고구마', '상추', '시금치', '양파', '마늘', '배추', '브로콜리']
  },
  {
    id: 'english_basic',
    category: '영어',
    title: '기초 영단어 (과일 vs 동물)',
    description: '영어 과일 단어(Fruit)만 잡고, 동물 단어(Animal)는 피해주세요!',
    targetWords: ['Apple', 'Banana', 'Grape', 'Orange', 'Strawberry', 'Peach', 'Mango', 'Cherry', 'Lemon', 'Melon'],
    avoidWords: ['Dog', 'Cat', 'Lion', 'Tiger', 'Bear', 'Elephant', 'Monkey', 'Rabbit', 'Fox', 'Wolf']
  },
  {
    id: 'healthy_habits',
    category: '생활/안전',
    title: '어린이 건강 생활 습관',
    description: '몸에 좋은 올바른 보건 및 위생 습관을 누르고, 유해한 습관은 피하세요!',
    targetWords: ['일찍 자기', '물 자주 마시기', '야채 먹기', '양치질하기', '손 씻기', '운동하기', '독서 공부', '환기 시키기'],
    avoidWords: ['늦게 자기', '탄산 많이 마시기', '라면만 먹기', '양치 안하기', '씻지 않기', '스마트폰 오래보기', '편식하기', '손톱 깨물기']
  }
];
