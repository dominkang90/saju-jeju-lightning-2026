export type Pillar = {
  stem: { hanja: string; name: string; element: string; color: string };
  branch: { hanja: string; name: string; element: string; color: string };
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
};

export type SajuResultData = {
  chart: SajuChart;
  expertComment: string;
  insights: Insight[];
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
};
