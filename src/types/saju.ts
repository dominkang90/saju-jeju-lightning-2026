export type Pillar = {
  stem: { hanja: string; name: string; element: string; color: string; tenDeity?: string; modernTerm?: string };
  branch: { hanja: string; name: string; element: string; color: string; tenDeity?: string; modernTerm?: string };
  hiddenStems?: string[]; // 지장간
  phase?: string; // 십이운성
  twelveShensha?: string; // 십이신살
  otherShensha?: string[]; // 기타 신살
  interactions?: string[]; // 형충회합
};

export type SajuChart = {
  time: Pillar;
  day: Pillar;
  month: Pillar;
  year: Pillar;
};

export type Insight = {
  id: string;
  category: string;
  iconName: string;
  hook: string;
  paragraphs: string[];
  advice?: string;
  isLocked?: boolean;
  isLoading?: boolean;
};

export type ElementScore = {
  element: string;
  score: number;
  color: string;
  label: string;
  isSecondary?: boolean;
  secondaryScore?: number;
  reason?: string;
};

export type TermExplanation = {
  term: string;
  simple_title: string;
  general_meaning: string;
  personal_connection: string;
  real_example: string;
  emoji: string;
  category: string;
};

export type SajuResultData = {
  chart: SajuChart;
  expertComment: string;
  headline: string;
  narrative: string;
  myungriBasis: string;
  prescription: {
    missingElements: string[];
    advice: string;
  };
  luckyItems: {
    number: string;
    color: string;
    direction: string;
  };
  networkInterpretation: string;
  insights: Insight[];
  elementScores: ElementScore[];
  termExplanations?: TermExplanation[];
  promptParams?: {
    userName: string;
    birthInfo: string;
    elementScores: { element: string; score: number }[];
    pillars: { year: string; month: string; day: string; time: string };
    stars: string;
    shisung: string;
    dayElement: string;
    strongestElement: string;
    gender: string;
  };
  trendyResult?: {
    title: string;
    keyword: string;
    traits: string[];
    goosebumps: string;
    redLight: {
      mind: string;
      body: string;
    };
    solution: {
      lifestyle: string;
      mindset: string;
    };
    closing: string;
  };
};

export type SajuFormPayload = {
  name: string;
  gender: 'male' | 'female';
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  calendarType: 'solar' | 'lunar' | 'lunar_leap';
  birthTime: string;
  isTimeUnknown: boolean;
  useLongitudeCorrection?: boolean;
  useSummerTime?: boolean;
  yajaMethod?: 'next_day' | 'current_day';
};

export type SavedProfile = SajuFormPayload & {
  id: string;
  createdAt: number;
};

export type MatchFormPayload = {
  myProfileId?: string; // If using saved profile
  partnerProfileId?: string; // If using saved profile
  myData: SajuFormPayload;
  partnerData: SajuFormPayload;
  relationship: '연인/부부' | '친구/동료' | '가족' | '비즈니스';
};

export type MatchResultData = {
  myChart: SajuChart;
  partnerChart: SajuChart;
  score: number;
  headline: string;
  keywords: string[];
  summary: string;
  expertComment?: string;
  insights: Insight[];
  prescription?: {
    advice: string;
    warning: string;
  };
};
