export const MOOD_OPTIONS = {
  CALM: { label: '차분한', emoji: '🪷' },
  LIVELY: { label: '활기찬', emoji: '🌞' },
  ACADEMIC: { label: '학구적', emoji: '📚' },
  CASUAL: { label: '캐주얼', emoji: '👕' },
  FOCUSED: { label: '집중', emoji: '🎯' },
  RELAXED: { label: '편안한', emoji: '🛋️' },
  SERIOUS: { label: '진지한', emoji: '🤔' },
  WARM: { label: '따뜻한', emoji: '🔥' },
  BRIGHT: { label: '밝은', emoji: '🌈' },
  QUIET: { label: '조용한', emoji: '🌙' },
  EXCITED: { label: '신나는', emoji: '🎉' },
  EMOTIONAL: { label: '감성적인', emoji: '🎧' },
  CHEERFUL: { label: '유쾌한', emoji: '😄' },
  OPTIMISTIC: { label: '낙관적인', emoji: '🌤️' },
  COOL: { label: '냉정한', emoji: '🧊' },
  COMPOSED: { label: '침착한', emoji: '🧘' },
  ELEGANT: { label: '우아한', emoji: '👑' },
  FRIENDLY: { label: '친근한', emoji: '🤝' },
  FORMAL: { label: '격식있는', emoji: '🎩' },
  CREATIVE: { label: '창의적인', emoji: '🎨' },
  SOPHISTICATED: { label: '세련된', emoji: '💎' },
  PEACEFUL: { label: '평화로운', emoji: '☮️' },
  THOUGHTFUL: { label: '신중한', emoji: '🧐' },
  POSITIVE: { label: '긍정적인', emoji: '🌻' },
  COOL_HEADED: { label: '차가운', emoji: '❄️' },
  DULL: { label: '따분한', emoji: '😐' },
} as const;

// ------------------------------------------------------------------------------

export const THEME_OPTIONS = {
  POLITICS: {
    category: '시사·뉴스',
    label: '정치',
    emoji: '🏛️',
  },
  ECONOMY: {
    category: '시사·뉴스',
    label: '경제',
    emoji: '💰',
  },
  SOCIETY: {
    category: '시사·뉴스',
    label: '사회',
    emoji: '👥',
  },
  WORLD: {
    category: '시사·뉴스',
    label: '국제',
    emoji: '🌍',
  },
  TECHNOLOGY: {
    category: '시사·뉴스',
    label: '테크',
    emoji: '🚀',
  },

  TRAVEL: {
    category: '라이프스타일',
    label: '여행',
    emoji: '✈️',
  },
  FOOD: {
    category: '라이프스타일',
    label: '음식',
    emoji: '🍴',
  },
  HEALTH: {
    category: '라이프스타일',
    label: '건강',
    emoji: '💪',
  },
  SELF_IMPROVEMENT: {
    category: '라이프스타일',
    label: '자기계발',
    emoji: '📈',
  },
  FINANCE: {
    category: '라이프스타일',
    label: '재테크',
    emoji: '💵',
  },

  MOVIES_TV: {
    category: '문화·엔터테인먼트',
    label: '영화/드라마',
    emoji: '🎬',
  },
  MUSIC: {
    category: '문화·엔터테인먼트',
    label: '음악',
    emoji: '🎵',
  },
  SPORTS: {
    category: '문화·엔터테인먼트',
    label: '스포츠',
    emoji: '⚽',
  },
  GAMES: {
    category: '문화·엔터테인먼트',
    label: '게임',
    emoji: '🎮',
  },
  ART: {
    category: '문화·엔터테인먼트',
    label: '예술',
    emoji: '🎨',
  },

  SCIENCE: {
    category: '지식·교육',
    label: '과학',
    emoji: '🔬',
  },
  HISTORY: {
    category: '지식·교육',
    label: '역사',
    emoji: '📜',
  },
  PHILOSOPHY: {
    category: '지식·교육',
    label: '철학',
    emoji: '💭',
  },
  PSYCHOLOGY: {
    category: '지식·교육',
    label: '심리학',
    emoji: '🧠',
  },
  IT_AI: {
    category: '지식·교육',
    label: 'IT/AI',
    emoji: '🤖',
  },
  LANGUAGE: {
    category: '지식·교육',
    label: '언어 학습',
    emoji: '📚',
  },

  ESSAY: {
    category: '개인 경험·스토리',
    label: '에세이',
    emoji: '✍️',
  },
  INTERVIEW: {
    category: '개인 경험·스토리',
    label: '인터뷰',
    emoji: '🎤',
  },
  DAILY_LIFE: {
    category: '개인 경험·스토리',
    label: '일상',
    emoji: '💬',
  },
} as const;
