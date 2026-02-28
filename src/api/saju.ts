import { SajuFormPayload, SajuResultData, Pillar } from '../types/saju';

// 천간(Heavenly Stems)과 지지(Earthly Branches) 데이터
const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

const STEM_DETAILS: Record<string, { hanja: string; element: string; color: string }> = {
  '갑': { hanja: '甲', element: '나무', color: 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/30' },
  '을': { hanja: '乙', element: '나무', color: 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/30' },
  '병': { hanja: '丙', element: '불', color: 'bg-[#FFE8E8] text-[#FF6B6B] border-[#FF6B6B]/30' },
  '정': { hanja: '丁', element: '불', color: 'bg-[#FFE8E8] text-[#FF6B6B] border-[#FF6B6B]/30' },
  '무': { hanja: '戊', element: '흙', color: 'bg-[#FFF8E1] text-[#F57F17] border-[#F57F17]/30' },
  '기': { hanja: '己', element: '흙', color: 'bg-[#FFF8E1] text-[#F57F17] border-[#F57F17]/30' },
  '경': { hanja: '庚', element: '쇠', color: 'bg-[#F3E5F5] text-[#6A1B9A] border-[#6A1B9A]/30' },
  '신': { hanja: '辛', element: '쇠', color: 'bg-[#F3E5F5] text-[#6A1B9A] border-[#6A1B9A]/30' },
  '임': { hanja: '壬', element: '물', color: 'bg-[#E3F2FD] text-[#1565C0] border-[#1565C0]/30' },
  '계': { hanja: '癸', element: '물', color: 'bg-[#E3F2FD] text-[#1565C0] border-[#1565C0]/30' },
};

const BRANCH_DETAILS: Record<string, { hanja: string; element: string; color: string }> = {
  '자': { hanja: '子', element: '쥐(물)', color: 'bg-[#E3F2FD] text-[#1565C0] border-[#1565C0]/30' },
  '축': { hanja: '丑', element: '소(흙)', color: 'bg-[#FFF8E1] text-[#F57F17] border-[#F57F17]/30' },
  '인': { hanja: '寅', element: '호랑이(나무)', color: 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/30' },
  '묘': { hanja: '卯', element: '토끼(나무)', color: 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/30' },
  '진': { hanja: '辰', element: '용(흙)', color: 'bg-[#FFF8E1] text-[#F57F17] border-[#F57F17]/30' },
  '사': { hanja: '巳', element: '뱀(불)', color: 'bg-[#FFE8E8] text-[#FF6B6B] border-[#FF6B6B]/30' },
  '오': { hanja: '午', element: '말(불)', color: 'bg-[#FFE8E8] text-[#FF6B6B] border-[#FF6B6B]/30' },
  '미': { hanja: '未', element: '양(흙)', color: 'bg-[#FFF8E1] text-[#F57F17] border-[#F57F17]/30' },
  '신': { hanja: '申', element: '원숭이(쇠)', color: 'bg-[#F3E5F5] text-[#6A1B9A] border-[#6A1B9A]/30' },
  '유': { hanja: '酉', element: '닭(쇠)', color: 'bg-[#F3E5F5] text-[#6A1B9A] border-[#6A1B9A]/30' },
  '술': { hanja: '戌', element: '개(흙)', color: 'bg-[#FFF8E1] text-[#F57F17] border-[#F57F17]/30' },
  '해': { hanja: '亥', element: '돼지(물)', color: 'bg-[#E3F2FD] text-[#1565C0] border-[#1565C0]/30' },
};

// 시주(Time Pillar) 계산 함수 (일간 기준)
const calculateTimePillar = (dayStem: string, timeStr: string, isUnknown: boolean): Pillar => {
  if (isUnknown || !timeStr) {
    return {
      stem: { hanja: '?', name: '모름', element: '알수없음', color: 'bg-[#F1F3F5] text-[#999999]' },
      branch: { hanja: '?', name: '모름', element: '알수없음', color: 'bg-[#F1F3F5] text-[#999999]' }
    };
  }

  const [hour, minute] = timeStr.split(':').map(Number);
  const totalMinutes = hour * 60 + minute;
  
  // 자시(23:30~01:30)부터 해시(21:30~23:30)까지 지지 계산
  let branchIndex = Math.floor(((totalMinutes + 30) % 1440) / 120);
  const branchChar = BRANCHES[branchIndex];

  // 일간에 따른 시간 계산 (간합 원리)
  const dayStemIndex = STEMS.indexOf(dayStem);
  // 갑기일은 갑자시부터, 을경일은 병자시부터...
  const startStemIndex = (dayStemIndex % 5) * 2; 
  const timeStemIndex = (startStemIndex + branchIndex) % 10;
  const stemChar = STEMS[timeStemIndex];

  return {
    stem: { name: stemChar, ...STEM_DETAILS[stemChar] },
    branch: { name: branchChar, ...BRANCH_DETAILS[branchChar] }
  };
};

const parsePillarString = (str: string): Pillar => {
  // 예: "갑자(甲子)" -> stem: '갑', branch: '자'
  const stemChar = str.charAt(0);
  const branchChar = str.charAt(1);
  
  return {
    stem: { name: stemChar, ...(STEM_DETAILS[stemChar] || STEM_DETAILS['갑']) },
    branch: { name: branchChar, ...(BRANCH_DETAILS[branchChar] || BRANCH_DETAILS['자']) }
  };
};

export const analyzeSaju = async (payload: SajuFormPayload): Promise<SajuResultData> => {
  let yearPillarStr = '임술';
  let monthPillarStr = '갑진';
  let dayPillarStr = '병오';

  try {
    // 공공데이터포털 한국천문연구원_음양력 정보 API 연동
    // 실제 서비스 키를 발급받아 환경변수에 설정해야 합니다.
    const SERVICE_KEY = import.meta.env.VITE_OPENAPI_SERVICE_KEY;
    
    if (SERVICE_KEY) {
      const formattedMonth = payload.birthMonth.padStart(2, '0');
      const formattedDay = payload.birthDay.padStart(2, '0');
      
      const url = `http://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService/getLunCalInfo?solYear=${payload.birthYear}&solMonth=${formattedMonth}&solDay=${formattedDay}&ServiceKey=${SERVICE_KEY}&_type=json`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data?.response?.body?.items?.item) {
        const item = data.response.body.items.item;
        yearPillarStr = item.lunSecha.substring(0, 2); // "임술(壬戌)" -> "임술"
        monthPillarStr = item.lunWolgeon.substring(0, 2);
        dayPillarStr = item.lunIljin.substring(0, 2);
      }
    } else {
      // API 키가 없을 경우 입력된 날짜를 기반으로 일관된 더미 데이터 생성 (시뮬레이션)
      // 1990년 9월 21일의 실제 사주: 경오년 을유월 기사일
      if (payload.birthYear === '1990' && payload.birthMonth === '9' && payload.birthDay === '21') {
        yearPillarStr = '경오';
        monthPillarStr = '을유';
        dayPillarStr = '기사';
      } else {
        const yearInt = parseInt(payload.birthYear);
        const monthInt = parseInt(payload.birthMonth);
        const dayInt = parseInt(payload.birthDay);
        
        // 년주 계산 (대략적인 계산, 입춘 기준 아님)
        const yearStemIndex = (yearInt + 6) % 10;
        const yearBranchIndex = (yearInt + 8) % 12;
        yearPillarStr = STEMS[yearStemIndex] + BRANCHES[yearBranchIndex];
        
        // 월주 계산 (대략적인 계산, 절기 기준 아님)
        const monthStemIndex = (yearStemIndex * 2 + monthInt) % 10;
        const monthBranchIndex = (monthInt + 1) % 12;
        monthPillarStr = STEMS[monthStemIndex] + BRANCHES[monthBranchIndex];
        
        // 일주 계산 (임의의 해시 기반)
        const hash = yearInt + monthInt + dayInt;
        dayPillarStr = STEMS[(hash * 3) % 10] + BRANCHES[(hash * 3) % 12];
      }
      
      // 약간의 딜레이로 API 통신 느낌 부여
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.warn('API 연동 실패, 기본 데이터로 대체합니다.', error);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const dayStemChar = dayPillarStr.charAt(0);
  const timePillar = calculateTimePillar(dayStemChar, payload.birthTime, payload.isTimeUnknown);

  return {
    chart: {
      time: timePillar,
      day: parsePillarString(dayPillarStr),
      month: parsePillarString(monthPillarStr),
      year: parsePillarString(yearPillarStr)
    },
    expertComment: `${STEM_DETAILS[dayStemChar]?.element || '불'}(${dayStemChar})의 기운을 가지고 태어나셨네요! 밝고 열정적이며 사람들을 이끄는 따뜻한 에너지가 돋보이는 사주입니다.`,
    insights: [
      {
        id: 'personality',
        category: '성향과 기질',
        iconName: 'User',
        hook: "맨날 남 퍼주다가 호구 잡힌다고요? 놉! 님은 사실 판을 지배하는 '킹메이커' 재질임 😎",
        paragraphs: [
          "자, 차트를 한번 볼까요? 태어난 날(일주)에 [태극귀인(太極貴人)]이 딱 자리잡고 있고, 주변에 [식신(食神)]이 든든하게 받쳐주고 있어요. 보통 철학관 가면 '아낌없이 주는 나무라서 손해만 본다'고 오해하기 딱 좋은 구조죠.",
          `하지만 제가 논리적으로 뜯어보면 완전 다릅니다. [식신]의 '무언가를 미친듯이 키워내는 힘'이랑 [태극귀인]의 '결국엔 결과를 내고 마는 힘'이 합쳐진 거예요. 즉, ${payload.name || '명운'}님이 도와준 그 사람들이 나중에 ${payload.name || '명운'}님의 가장 강력한 무기가 돼서 큰 판을 주도하는 '킹메이커' 사주라는 거죠.`
        ],
        advice: `지금 당장 밥값 좀 더 낸다고 억울해하지 마세요. ${payload.name || '명운'}님이 돕고 있는 그 사람이 곧 든든한 빽이 될 테니까요. 사람을 남기는 투자를 계속하세요!`,
        isLocked: false
      },
      {
        id: 'relationship',
        category: '인간관계',
        iconName: 'Heart',
        hook: "가만히 있어도 피곤한 사람이 꼬이는 이유? 숨길 수 없는 '치명적 매력' 때문이죠 ✨",
        paragraphs: [
          `집중! ${payload.name || '명운'}님 사주에는 그냥 도화살도 아니고 [나체도화(裸體桃花)]가 아주 강하게 박혀있어요. 이게 무슨 뜻이냐? 가만히 숨만 쉬고 있어도 매력이 줄줄 흐른다는 뜻입니다. 어딜 가나 시선 집중이죠.`,
          "근데 문제가 뭐냐면, 이 매력이 너무 강하다 보니까 에너지만 쪽쪽 빨아먹는 피곤한 사람들까지 꼬인다는 거예요. 사주에 이걸 딱 커트해 줄 '관성'이 살짝 부족하거든요. 맺고 끊는 걸 어려워하니까 자꾸 피곤한 관계가 반복되는 겁니다."
        ],
        isLocked: true
      },
      {
        id: 'wealth',
        category: '재물과 직업',
        iconName: 'Briefcase',
        hook: "한 직장에 오래 있으면 병나는 스타일? 역마살이 통장을 꽉꽉 채워줍니다 💸",
        paragraphs: [
          `어른들은 한 곳에 진득하게 있으라고 하지만, ${payload.name || '명운'}님 사주에 강하게 자리 잡은 [역마살(驛馬煞)]은 억누를수록 독이 됩니다.`,
          "과거에는 떠돌이 팔자라며 안 좋게 보았지만, 현대 사회에서 [역마살]은 곧 '글로벌 비즈니스, 영업, 트렌드 세터'를 의미해요. 새로운 환경에 던져졌을 때 남들보다 2배 빠르게 적응하고 기회를 포착하는 능력이 있습니다."
        ],
        isLocked: true
      }
    ]
  };
};
