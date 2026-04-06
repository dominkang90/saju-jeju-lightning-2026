import { SajuFormPayload, SajuResultData, Pillar, MatchFormPayload, MatchResultData } from '../types/saju';
import { Solar, Lunar } from 'lunar-javascript';
import { getTenDeity, HIDDEN_STEMS, getPhase, getTwelveShensha, getOtherShensha, getPillarInteractions, getModernTerm, calculateElementScores } from '../utils/sajuLogic';
import { GoogleGenAI, Type } from "@google/genai";

// 천간(Heavenly Stems)과 지지(Earthly Branches) 데이터
const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

const STEM_DETAILS: Record<string, { hanja: string; element: string; color: string }> = {
  '갑': { hanja: '甲', element: '나무', color: 'bg-[#E8F5E9] dark:bg-[#2E7D32]/20 text-[#2E7D32] dark:text-[#81C784] border-[#2E7D32]/30 dark:border-[#81C784]/30' },
  '을': { hanja: '乙', element: '나무', color: 'bg-[#E8F5E9] dark:bg-[#2E7D32]/20 text-[#2E7D32] dark:text-[#81C784] border-[#2E7D32]/30 dark:border-[#81C784]/30' },
  '병': { hanja: '丙', element: '불', color: 'bg-[#FFE8E8] dark:bg-[#FF6B6B]/20 text-[#FF6B6B] dark:text-[#FF8787] border-[#FF6B6B]/30 dark:border-[#FF8787]/30' },
  '정': { hanja: '丁', element: '불', color: 'bg-[#FFE8E8] dark:bg-[#FF6B6B]/20 text-[#FF6B6B] dark:text-[#FF8787] border-[#FF6B6B]/30 dark:border-[#FF8787]/30' },
  '무': { hanja: '戊', element: '흙', color: 'bg-[#FFF8E1] dark:bg-[#F57F17]/20 text-[#F57F17] dark:text-[#FFD54F] border-[#F57F17]/30 dark:border-[#FFD54F]/30' },
  '기': { hanja: '己', element: '흙', color: 'bg-[#FFF8E1] dark:bg-[#F57F17]/20 text-[#F57F17] dark:text-[#FFD54F] border-[#F57F17]/30 dark:border-[#FFD54F]/30' },
  '경': { hanja: '庚', element: '쇠', color: 'bg-[#F3E5F5] dark:bg-[#6A1B9A]/20 text-[#6A1B9A] dark:text-[#CE93D8] border-[#6A1B9A]/30 dark:border-[#CE93D8]/30' },
  '신': { hanja: '辛', element: '쇠', color: 'bg-[#F3E5F5] dark:bg-[#6A1B9A]/20 text-[#6A1B9A] dark:text-[#CE93D8] border-[#6A1B9A]/30 dark:border-[#CE93D8]/30' },
  '임': { hanja: '壬', element: '물', color: 'bg-[#E3F2FD] dark:bg-[#1565C0]/20 text-[#1565C0] dark:text-[#90CAF9] border-[#1565C0]/30 dark:border-[#90CAF9]/30' },
  '계': { hanja: '癸', element: '물', color: 'bg-[#E3F2FD] dark:bg-[#1565C0]/20 text-[#1565C0] dark:text-[#90CAF9] border-[#1565C0]/30 dark:border-[#90CAF9]/30' },
};

const BRANCH_DETAILS: Record<string, { hanja: string; element: string; color: string }> = {
  '자': { hanja: '子', element: '쥐(물)', color: 'bg-[#E3F2FD] dark:bg-[#1565C0]/20 text-[#1565C0] dark:text-[#90CAF9] border-[#1565C0]/30 dark:border-[#90CAF9]/30' },
  '축': { hanja: '丑', element: '소(흙)', color: 'bg-[#FFF8E1] dark:bg-[#F57F17]/20 text-[#F57F17] dark:text-[#FFD54F] border-[#F57F17]/30 dark:border-[#FFD54F]/30' },
  '인': { hanja: '寅', element: '호랑이(나무)', color: 'bg-[#E8F5E9] dark:bg-[#2E7D32]/20 text-[#2E7D32] dark:text-[#81C784] border-[#2E7D32]/30 dark:border-[#81C784]/30' },
  '묘': { hanja: '卯', element: '토끼(나무)', color: 'bg-[#E8F5E9] dark:bg-[#2E7D32]/20 text-[#2E7D32] dark:text-[#81C784] border-[#2E7D32]/30 dark:border-[#81C784]/30' },
  '진': { hanja: '辰', element: '용(흙)', color: 'bg-[#FFF8E1] dark:bg-[#F57F17]/20 text-[#F57F17] dark:text-[#FFD54F] border-[#F57F17]/30 dark:border-[#FFD54F]/30' },
  '사': { hanja: '巳', element: '뱀(불)', color: 'bg-[#FFE8E8] dark:bg-[#FF6B6B]/20 text-[#FF6B6B] dark:text-[#FF8787] border-[#FF6B6B]/30 dark:border-[#FF8787]/30' },
  '오': { hanja: '午', element: '말(불)', color: 'bg-[#FFE8E8] dark:bg-[#FF6B6B]/20 text-[#FF6B6B] dark:text-[#FF8787] border-[#FF6B6B]/30 dark:border-[#FF8787]/30' },
  '미': { hanja: '未', element: '양(흙)', color: 'bg-[#FFF8E1] dark:bg-[#F57F17]/20 text-[#F57F17] dark:text-[#FFD54F] border-[#F57F17]/30 dark:border-[#FFD54F]/30' },
  '신': { hanja: '申', element: '원숭이(쇠)', color: 'bg-[#F3E5F5] dark:bg-[#6A1B9A]/20 text-[#6A1B9A] dark:text-[#CE93D8] border-[#6A1B9A]/30 dark:border-[#CE93D8]/30' },
  '유': { hanja: '酉', element: '닭(쇠)', color: 'bg-[#F3E5F5] dark:bg-[#6A1B9A]/20 text-[#6A1B9A] dark:text-[#CE93D8] border-[#6A1B9A]/30 dark:border-[#CE93D8]/30' },
  '술': { hanja: '戌', element: '개(흙)', color: 'bg-[#FFF8E1] dark:bg-[#F57F17]/20 text-[#F57F17] dark:text-[#FFD54F] border-[#F57F17]/30 dark:border-[#FFD54F]/30' },
  '해': { hanja: '亥', element: '돼지(물)', color: 'bg-[#E3F2FD] dark:bg-[#1565C0]/20 text-[#1565C0] dark:text-[#90CAF9] border-[#1565C0]/30 dark:border-[#90CAF9]/30' },
};

const parsePillarString = (str: string, dayGan: string, yearZhi: string): Pillar => {
  if (str === '모름') {
    return {
      stem: { hanja: '?', name: '모름', element: '알수없음', color: 'bg-[#F1F3F5] dark:bg-[#343A40] text-[#999999] dark:text-[#ADB5BD]' },
      branch: { hanja: '?', name: '모름', element: '알수없음', color: 'bg-[#F1F3F5] dark:bg-[#343A40] text-[#999999] dark:text-[#ADB5BD]' },
      hiddenStems: [],
      phase: '',
      twelveShensha: '',
      otherShensha: [],
      interactions: []
    };
  }

  const stemChar = str.charAt(0);
  const branchChar = str.charAt(1);
  
  return {
    stem: { 
      name: stemChar, 
      ...(STEM_DETAILS[stemChar] || STEM_DETAILS['갑']),
      tenDeity: getTenDeity(dayGan, stemChar, true),
      modernTerm: getModernTerm(getTenDeity(dayGan, stemChar, true))
    },
    branch: { 
      name: branchChar, 
      ...(BRANCH_DETAILS[branchChar] || BRANCH_DETAILS['자']),
      tenDeity: getTenDeity(dayGan, branchChar, false),
      modernTerm: getModernTerm(getTenDeity(dayGan, branchChar, false))
    },
    hiddenStems: HIDDEN_STEMS[branchChar] || [],
    phase: getPhase(dayGan, branchChar),
    twelveShensha: getTwelveShensha(yearZhi, branchChar), // 년지 기준 십이신살
    otherShensha: getOtherShensha(dayGan, branchChar, stemChar),
    interactions: [] // 나중에 전체 지지를 모아서 계산
  };
};

export const callGeminiSajuOverallStream = async function* (
  userName: string,
  birthInfo: string,
  elementScores: { element: string; score: number }[],
  pillars: { year: string; month: string; day: string; time: string },
  stars: string,
  shisung: string,
  dayElement: string,
  strongestElement: string,
  gender: string
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    yield "GEMINI_API_KEY가 설정되지 않아 분석을 진행할 수 없습니다.";
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  yield "사주 정보를 바탕으로 인생의 흐름을 분석하고 있습니다. 잠시만 기다려주세요...";

  const prompt = `
# Role: 당신은 사용자의 사주를 분석하여 삶의 방향성을 제시하는 '라이프 아키텍트(Life Architect)'입니다.
# Context:
사용자의 사주 정보를 바탕으로 인생의 전반적인 흐름(인생총운)에 대한 깊이 있는 통찰과 조언을 제공합니다. 
과도한 칭찬이나 미사여구는 배제하고, 담백하지만 확신에 찬 어조를 유지하세요.

# Input Data Structure
- User_Name: ${userName}
- Gender: ${gender === 'male' ? '남성' : '여성'}
- Birth_Info: ${birthInfo}
- Five_Elements_Score: { 목:${elementScores.find(e => e.element === '목')?.score || 0}, 화:${elementScores.find(e => e.element === '화')?.score || 0}, 토:${elementScores.find(e => e.element === '토')?.score || 0}, 금:${elementScores.find(e => e.element === '금')?.score || 0}, 수:${elementScores.find(e => e.element === '수')?.score || 0} }
- Pillers: { 년:${pillars.year}, 월:${pillars.month}, 일:${pillars.day}, 시:${pillars.time} }
- Main_Element (일간): ${dayElement}
- Strongest_Element: ${strongestElement}
- Key_Stars: ${stars}
- Relationships: ${shisung}

# [AI 사주 해설 지침]
1. **기질의 정의 (The 'Cool'):**
   - 사주의 강한 기운(십신/오행)을 '능력'이 아닌 사용자의 **'고유한 스타일'**로 정의하라. 
   - 예: 비겁이 강하면 "독립적인 추진 스타일", 식상이 강하면 "표현의 감각" 등.

2. **성별 맞춤 지침:**
   - **남성:** 결과의 타당성을 부여하라. "당신의 이런 기질은 성과를 만들어내는 구조와 **논리적으로 잘 맞물립니다.**"
   - **여성:** 과정의 일관성을 부여하라. "당신이 지향하는 이 방향은 당신 본연의 색깔과 **자연스럽게 결을 같이 합니다.**"

3. **'어울림'의 문장 설계:**
   - "당신은 ~한 사람이니 ~하세요"라는 명령조 대신, "**당신이 가진 ~한 기질은 현재의 ~한 상황에서 가장 자연스러운 조화(어울림)를 만들어냅니다.**"라고 서술하라.

4. **금기 사항:**
   - "천재적이다", "완벽하다", "최고다" 등의 근거 없는 최상급 표현 사용 금지.
   - 대신 "독보적인", "안정적인", "밀도 높은" 등 구체적인 상태 형용사 사용.

# Rules:
1. **주제**: 오직 **인생총운풀이**(전반적인 인생의 흐름, 타고난 기질, 대운의 흐름 등)만 작성하세요.
2. **분량**: 반드시 **최소 1000자 이상**의 매우 상세하고 긴 풀이를 작성하세요.
3. **구조화**: 
   - 첫 줄은 반드시 전체 핵심을 요약하는 한 줄(Hook)로 시작하세요. (예: "🔥 어둠을 밝히는 따뜻한 불꽃처럼, 사람들을 이끄는 리더의 사주입니다.")
   - 그 다음 줄부터 본문을 작성하되, 주제별로 중제목(### 제목)을 사용하여 구분하세요.
   - 상세 내용의 각 문단은 **반드시 소주제를 요약하여 마크다운 볼드체(**소주제**)**로 시작하고, 그 뒤에 해설을 이어 적어주세요.
4. **용어**: 전문 용어는 대괄호([역마살] 등)로 감싸고 쉽게 풀이하세요.
5. **형식**: JSON이 아닌 **일반 텍스트(Markdown)** 형식으로 바로 출력하세요.

작성을 시작하세요:
`;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini API stream error:", error);
    yield "\n\n(분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.)";
  }
};

export const callGeminiSajuDetails = async (
  userName: string,
  birthInfo: string,
  elementScores: { element: string; score: number }[],
  pillars: { year: string; month: string; day: string; time: string },
  stars: string,
  shisung: string,
  dayElement: string,
  strongestElement: string,
  gender: string
) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Falling back to static analysis.");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
# Role: 당신은 사용자의 사주를 분석하여 삶의 방향성을 제시하는 '라이프 아키텍트(Life Architect)'입니다.
# Context:
사용자의 사주 정보를 바탕으로 인생의 주요 영역에 대한 깊이 있는 통찰과 조언을 제공합니다. 
단순한 운세 풀이가 아니라, 사용자가 자신의 삶을 되돌아보고 앞으로의 방향을 설정할 수 있도록 돕는 '인생 지침서'가 되어야 합니다.
과도한 칭찬이나 미사여구는 배제하고, 담백하지만 확신에 찬 어조를 유지하세요.

# Input Data Structure (Variables)
- User_Name: ${userName}
- Gender: ${gender === 'male' ? '남성' : '여성'}
- Birth_Info: ${birthInfo}
- Five_Elements_Score: { 목:${elementScores.find(e => e.element === '목')?.score || 0}, 화:${elementScores.find(e => e.element === '화')?.score || 0}, 토:${elementScores.find(e => e.element === '토')?.score || 0}, 금:${elementScores.find(e => e.element === '금')?.score || 0}, 수:${elementScores.find(e => e.element === '수')?.score || 0} }
- Pillers: { 년:${pillars.year}, 월:${pillars.month}, 일:${pillars.day}, 시:${pillars.time} }
- Main_Element (일간): ${dayElement}
- Strongest_Element: ${strongestElement}
- Key_Stars: ${stars} (신살/귀인)
- Relationships: ${shisung} (십성/형충회합)

# [AI 사주 해설 지침]
1. **기질의 정의 (The 'Cool'):**
   - 사주의 강한 기운(십신/오행)을 '능력'이 아닌 사용자의 **'고유한 스타일'**로 정의하라. 
   - 예: 비겁이 강하면 "독립적인 추진 스타일", 식상이 강하면 "표현의 감각" 등.

2. **성별 맞춤 지침:**
   - **남성:** 결과의 타당성을 부여하라. "당신의 이런 기질은 성과를 만들어내는 구조와 **논리적으로 잘 맞물립니다.**"
   - **여성:** 과정의 일관성을 부여하라. "당신이 지향하는 이 방향은 당신 본연의 색깔과 **자연스럽게 결을 같이 합니다.**"

3. **'어울림'의 문장 설계:**
   - "당신은 ~한 사람이니 ~하세요"라는 명령조 대신, "**당신이 가진 ~한 기질은 현재의 ~한 상황에서 가장 자연스러운 조화(어울림)를 만들어냅니다.**"라고 서술하라.

4. **금기 사항:**
   - "천재적이다", "완벽하다", "최고다" 등의 근거 없는 최상급 표현 사용 금지.
   - 대신 "독보적인", "안정적인", "밀도 높은" 등 구체적인 상태 형용사 사용.

# Rules:
1. **카테고리 구분**: 반드시 다음 11가지 카테고리로 나누어 설명하세요. (인생총운은 제외됨)
   - **재물운**: 타고난 재복, 돈을 버는 스타일, 재테크 조언, 주의할 점
   - **건강운**: 취약한 신체 부위, 추천하는 건강 관리법, 멘탈 관리
   - **애정운**: 연애 스타일, 이성을 만나는 시기, 매력 포인트
   - **결혼운**: 결혼 시기, 배우자복, 이상적인 배우자상
   - **자녀운**: 자녀와의 관계, 자녀의 성향, 양육 조언
   - **직업운**: 적성에 맞는 직업, 취업운, 직장 내 처세술
   - **사업운**: 창업/사업 적성, 동업운, 사업 확장 시기
   - **학업운**: 공부 스타일, 시험운, 추천 전공/분야
   - **부모운**: 부모님과의 관계, 조상덕, 물려받는 기운
   - **대인관계운**: 사람들과의 관계, 귀인운, 피해야 할 사람
   - **부동산운**: 문서운, 부동산 투자 적성, 이사/이동수

2. **분량 및 깊이 준수 (매우 중요)**: 
   - 사주 풀이가 너무 짧다는 피드백이 있습니다. 각 카테고리의 'content'는 **반드시 최소 5~6개의 매우 상세한 문단**으로 구성되어야 하며, 전체적으로 **압도적으로 길고 풍부한 해설**을 제공해야 합니다.
   - 각 카테고리당 **반드시 최소 1000자 내외의 매우 상세하고 긴 풀이**를 작성하세요. 절대로 내용을 축약하거나 줄이지 마세요.

3. **구조화 및 가독성**: 
   - 각 카테고리는 'hook'(전체 핵심 주제 한 줄), 'content'(상세 설명), 'advice'(전문가의 조언)로 구성됩니다.
   - 'content' 작성 시 **주제별로 중제목(### 제목)**을 먼저 작성하고, 그 아래에 상세 내용을 작성해주세요.
   - 상세 내용의 각 문단은 **반드시 소주제를 요약하여 마크다운 볼드체(**소주제**)**로 시작하고, 그 뒤에 해설을 이어 적어주세요. (예: "**타고난 재물복** 당신은...")

4. **용어 사용**: 사주 전문 용어(예: [역마살], [도화살], [편관] 등)를 사용할 때는 반드시 대괄호로 감싸고, 문맥 안에서 자연스럽게 뜻을 풀이해주세요. 

5. **톤앤매너**: '라이프 아키텍트'로서 담백하지만 확신에 찬 어조. "~합니다", "~입니다" 체를 사용하세요.

# Output Format (JSON):
{
  "wealth": {
    "hook": "[재물운 핵심 요약 한 줄]",
    "content": "[300자 이상의 상세한 재물운 풀이]",
    "advice": "[재물운에 대한 전문가의 따뜻한 조언 한 마디]"
  },
  "health": {
    "hook": "[건강운 핵심 요약 한 줄]",
    "content": "[300자 이상의 상세한 건강운 풀이]",
    "advice": "[건강운에 대한 전문가의 따뜻한 조언 한 마디]"
  },
  "love": {
    "hook": "[애정운 핵심 요약 한 줄]",
    "content": "[300자 이상의 상세한 애정운 풀이]",
    "advice": "[애정운에 대한 전문가의 따뜻한 조언 한 마디]"
  },
  "marriage": {
    "hook": "[결혼운 핵심 요약 한 줄]",
    "content": "[300자 이상의 상세한 결혼운 풀이]",
    "advice": "[결혼운에 대한 전문가의 따뜻한 조언 한 마디]"
  },
  "children": {
    "hook": "[자녀운 핵심 요약 한 줄]",
    "content": "[300자 이상의 상세한 자녀운 풀이]",
    "advice": "[자녀운에 대한 전문가의 따뜻한 조언 한 마디]"
  },
  "career": {
    "hook": "[직업운 핵심 요약 한 줄]",
    "content": "[300자 이상의 상세한 직업운 풀이]",
    "advice": "[직업운에 대한 전문가의 따뜻한 조언 한 마디]"
  },
  "business": {
    "hook": "[사업운 핵심 요약 한 줄]",
    "content": "[300자 이상의 상세한 사업운 풀이]",
    "advice": "[사업운에 대한 전문가의 따뜻한 조언 한 마디]"
  },
  "study": {
    "hook": "[학업운 핵심 요약 한 줄]",
    "content": "[300자 이상의 상세한 학업운 풀이]",
    "advice": "[학업운에 대한 전문가의 따뜻한 조언 한 마디]"
  },
  "parents": {
    "hook": "[부모운 핵심 요약 한 줄]",
    "content": "[300자 이상의 상세한 부모운 풀이]",
    "advice": "[부모운에 대한 전문가의 따뜻한 조언 한 마디]"
  },
  "interpersonal": {
    "hook": "[대인관계운 핵심 요약 한 줄]",
    "content": "[300자 이상의 상세한 대인관계운 풀이]",
    "advice": "[대인관계운에 대한 전문가의 따뜻한 조언 한 마디]"
  },
  "realestate": {
    "hook": "[부동산운 핵심 요약 한 줄]",
    "content": "[300자 이상의 상세한 부동산운 풀이]",
    "advice": "[부동산운에 대한 전문가의 따뜻한 조언 한 마디]"
  },
  "prescription": {
    "advice": "[부족한 오행을 보완하고 넘치는 오행을 다스릴 수 있는, 사용자의 사주에 완벽히 맞춤화된 구체적인 개운법 및 실천 가이드 (300자 이상)]"
  }
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let text = response.text || '{}';
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API error:", error);
    return null;
  }
};

const calculateBazi = (payload: SajuFormPayload) => {
  const yearInt = parseInt(payload.birthYear);
  const monthInt = parseInt(payload.birthMonth);
  const dayInt = parseInt(payload.birthDay);
  
  let hourInt = 0;
  let minuteInt = 0;
  
  if (!payload.isTimeUnknown && payload.birthTime) {
    const [hour, minute] = payload.birthTime.split(':').map(Number);
    hourInt = hour;
    minuteInt = minute;
  }

  let solar;
  if (payload.calendarType === 'solar') {
    solar = Solar.fromYmdHms(yearInt, monthInt, dayInt, hourInt, minuteInt, 0);
  } else {
    const isLeap = payload.calendarType === 'lunar_leap';
    const m = isLeap ? -monthInt : monthInt;
    const lunarTemp = Lunar.fromYmdHms(yearInt, m, dayInt, hourInt, minuteInt, 0);
    solar = lunarTemp.getSolar();
  }

  // 시간 보정 (경도 보정 및 썸머타임)
  if (!payload.isTimeUnknown && payload.birthTime) {
    const jsDate = new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay(), solar.getHour(), solar.getMinute(), 0);
    
    // 1. 경도 보정 (Longitude Correction) - 기본값 적용 (명시적으로 false가 아니면 적용)
    if (payload.useLongitudeCorrection !== false) {
      jsDate.setMinutes(jsDate.getMinutes() - 30);
    }

    // 2. 썸머타임 (DST) - 기본값 적용
    if (payload.useSummerTime !== false) {
      const y = solar.getYear();
      const m = solar.getMonth();
      const d = solar.getDay();
      const dateNum = y * 10000 + m * 100 + d;
      
      let isDST = false;
      if (dateNum >= 19480601 && dateNum <= 19510908) isDST = true;
      else if (dateNum >= 19550505 && dateNum <= 19600913) isDST = true;
      else if (dateNum >= 19870510 && dateNum <= 19871011) isDST = true;
      else if (dateNum >= 19880508 && dateNum <= 19881009) isDST = true;

      if (isDST) {
        jsDate.setMinutes(jsDate.getMinutes() - 60);
      }
    }

    // 보정된 시간으로 다시 Solar 객체 생성
    solar = Solar.fromYmdHms(
      jsDate.getFullYear(),
      jsDate.getMonth() + 1,
      jsDate.getDate(),
      jsDate.getHours(),
      jsDate.getMinutes(),
      0
    );
  }

  const lunar = solar.getLunar();
  const baZi = lunar.getEightChar();
  
  // 야자시/조자시 처리 (기본값은 야자시: current_day)
  if (payload.yajaMethod === 'next_day') {
    baZi.setSect(1); // 조자시 (다음날로 넘김)
  } else {
    baZi.setSect(2); // 야자시 (일진 유지)
  }

  return baZi;
};

export const analyzeSaju = async (payload: SajuFormPayload): Promise<SajuResultData> => {
  let yearPillarStr = '임술';
  let monthPillarStr = '갑진';
  let dayPillarStr = '병오';
  let timePillarStr = '모름';

  try {
    const baZi = calculateBazi(payload);
    
    // 한자로 반환됨 (예: "庚午")
    const yearHanja = baZi.getYear(); 
    const monthHanja = baZi.getMonth();
    const dayHanja = baZi.getDay();
    const timeHanja = baZi.getTime();

    // 한자를 한글로 변환하는 맵
    const hanjaToHangulStem: Record<string, string> = {
      '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무',
      '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계'
    };
    const hanjaToHangulBranch: Record<string, string> = {
      '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사',
      '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해'
    };

    const convertPillar = (hanjaStr: string) => {
      const stemHanja = hanjaStr.charAt(0);
      const branchHanja = hanjaStr.charAt(1);
      return (hanjaToHangulStem[stemHanja] || '갑') + (hanjaToHangulBranch[branchHanja] || '자');
    };

    yearPillarStr = convertPillar(yearHanja);
    monthPillarStr = convertPillar(monthHanja);
    dayPillarStr = convertPillar(dayHanja);
    
    if (payload.isTimeUnknown || !payload.birthTime) {
      timePillarStr = '모름';
    } else {
      timePillarStr = convertPillar(timeHanja);
    }
    
  } catch (error) {
    console.error('사주 계산 실패:', error);
    // 에러 발생 시 기본값 유지
  }

  const dayStemChar = dayPillarStr.charAt(0);
  const yearBranchChar = yearPillarStr.charAt(1);
  
  // 시주 객체 생성
  let timePillar = parsePillarString(timePillarStr, dayStemChar, yearBranchChar);
  let dayPillar = parsePillarString(dayPillarStr, dayStemChar, yearBranchChar);
  let monthPillar = parsePillarString(monthPillarStr, dayStemChar, yearBranchChar);
  let yearPillar = parsePillarString(yearPillarStr, dayStemChar, yearBranchChar);

  // 형충회합 계산
  const allPillars = [
    { stem: timePillar.stem.name, zhi: timePillar.branch.name },
    { stem: dayPillar.stem.name, zhi: dayPillar.branch.name },
    { stem: monthPillar.stem.name, zhi: monthPillar.branch.name },
    { stem: yearPillar.stem.name, zhi: yearPillar.branch.name }
  ];

  const interactions = getPillarInteractions(allPillars);
  
  timePillar.interactions = interactions[0];
  dayPillar.interactions = interactions[1];
  monthPillar.interactions = interactions[2];
  yearPillar.interactions = interactions[3];

  const allStems = [timePillar.stem.name, dayPillar.stem.name, monthPillar.stem.name, yearPillar.stem.name].filter(s => s !== '모름');
  const allZhis = [timePillar.branch.name, dayPillar.branch.name, monthPillar.branch.name, yearPillar.branch.name].filter(z => z !== '모름');
  const elementScores = calculateElementScores(allStems, allZhis);

  const presentElements = elementScores.filter(s => s.score > 0).map(s => s.element);
  const allElements = ['목', '화', '토', '금', '수'];
  const missingElements = allElements.filter(e => !presentElements.includes(e));

  const dayElement = STEM_DETAILS[dayStemChar]?.element || '불';
  const strongestElement = elementScores[0]?.element || '화';
  
  const timeStem = timePillar.stem.name;
  const timeBranch = timePillar.branch.name;
  const timeTenDeity = timePillar.stem.tenDeity || '비견';
  
  const timeInterpretation = timeStem !== '모름' 
    ? `특히 태어난 시간의 기운(${timeStem}${timeBranch})이 말년운과 숨겨진 잠재력을 강하게 뒷받침하고 있습니다. [${timeTenDeity}]의 성향이 내면에 깊이 자리잡아, 시간이 지날수록 그 진가가 발휘될 것입니다.`
    : `태어난 시간을 알 수 없어 말년의 구체적인 흐름을 완벽히 파악하기는 어렵지만, 현재까지의 기운만으로도 충분히 강한 에너지를 느낄 수 있습니다.`;

  let headline = `화려한 조명 아래 정교하게 조각하는 장인`;
  let narrative = `부드러운 흙 속의 날카로운 칼날처럼, 겉으로는 온화해 보이지만 내면에는 예리한 통찰력과 결단력을 품고 있습니다. 주변의 기운들이 당신의 재능을 세상에 드러내도록 돕고 있네요. ${timeInterpretation}`;
  let myungriBasis = `일간 ${dayStemChar}(${dayElement})를 중심으로, 주변에 ${strongestElement} 기운이 강하게 형성되어 식상생재의 흐름을 띠고 있습니다. ${timeStem !== '모름' ? `시주(時柱)의 ${timeStem}${timeBranch} 기운이 이를 더욱 보완해주고 있습니다.` : ''}`;
  
  if (dayElement === '나무') headline = '깊은 숲속에서 홀로 우뚝 솟은 거목';
  else if (dayElement === '불') headline = '어둠을 밝히는 따뜻하고 강렬한 모닥불';
  else if (dayElement === '흙') headline = '모든 것을 품어내는 넓고 단단한 대지';
  else if (dayElement === '쇠') headline = '제련을 거쳐 완성된 날카롭고 빛나는 보석';
  else if (dayElement === '물') headline = '어디로든 흘러가며 생명을 품는 깊은 바다';

  const userName = payload.name || '명운';

  const getPersonalityInsight = () => {
    if (dayElement === '나무') {
      return {
        hook: "한번 꽂히면 끝장을 보는 직진러? 꺾이지 않는 고집의 비밀 🌳",
        paragraphs: [
          `자, 차트를 한번 볼까요? ${userName}님은 위로 곧게 뻗어나가는 나무의 기운을 품고 태어났습니다. 남들이 안 된다고 할 때 오히려 오기가 생기는 타입이죠.`,
          "한번 목표를 정하면 주변의 만류에도 불구하고 끝까지 밀어붙이는 강한 추진력이 있습니다. 때로는 고집불통이라는 소리를 듣기도 하지만, 그 뚝심이 결국 큰 성과를 만들어냅니다."
        ],
        advice: "가끔은 주변을 돌아보며 유연하게 대처하는 지혜가 필요합니다. 부러지기보다는 바람에 흔들리는 법을 배워보세요."
      };
    } else if (dayElement === '불') {
      return {
        hook: "어딜 가나 분위기 메이커, 하지만 혼자 있을 땐 방전? 🔋",
        paragraphs: [
          `${userName}님은 주변을 환하게 밝히는 불꽃 같은 에너지를 가졌습니다. 사람들 사이에서 에너지를 뿜어내며 분위기를 주도하는 탁월한 능력이 있죠.`,
          "하지만 밖에서 에너지를 다 태우고 집에 돌아오면 급격히 방전되어 아무것도 하기 싫어지는 극단적인 면모도 있습니다. 감정의 기복이 꽤 큰 편입니다."
        ],
        advice: "에너지 분배가 핵심입니다. 모든 사람에게 100%를 쏟지 말고, 나를 위해 에너지를 남겨두는 연습을 하세요."
      };
    } else if (dayElement === '흙') {
      return {
        hook: "모두가 기대고 싶어하는 든든한 바위, 근데 내 속은 누가 알아주나? 🪨",
        paragraphs: [
          `${userName}님은 모든 것을 품어주는 넓은 대지 같은 성향입니다. 주변 사람들의 고민을 잘 들어주고 묵묵히 챙겨주는 든든한 존재죠.`,
          "하지만 정작 내 속마음은 남들에게 잘 털어놓지 못해 혼자 끙끙 앓는 경우가 많습니다. 남을 챙기느라 내 감정을 억누르는 데 익숙해져 버렸네요."
        ],
        advice: "때로는 이기적으로 굴어도 괜찮습니다. 남의 눈치를 보느라 내 감정을 숨기지 말고, 솔직하게 표현하는 연습을 해보세요."
      };
    } else if (dayElement === '쇠') {
      return {
        hook: "맺고 끊음이 확실한 팩트폭격기, 사실은 속여린 츤데레? ⚔️",
        paragraphs: [
          `${userName}님은 예리하고 단단한 쇠의 기운을 가졌습니다. 아닌 건 아니라고 확실하게 말할 줄 아는 결단력과 냉철한 판단력이 돋보입니다.`,
          "겉으로는 차갑고 찔러도 피 한 방울 안 나올 것 같지만, 내 사람이라고 생각하면 뒤에서 묵묵히 챙겨주는 따뜻한 반전 매력이 있습니다."
        ],
        advice: "팩트도 중요하지만, 가끔은 상대방의 감정을 먼저 헤아려주는 부드러운 화법이 인간관계를 더욱 풍성하게 만들어줄 것입니다."
      };
    } else {
      return {
        hook: "어디든 스며드는 미친 적응력, 속을 알 수 없는 신비주의 🌊",
        paragraphs: [
          `${userName}님은 형태가 없는 물처럼 어떤 환경에서도 유연하게 적응하는 능력이 탁월합니다. 겉으로는 순응하는 듯 보이지만 내면에는 깊은 지혜가 숨어 있죠.`,
          "생각이 너무 많아 때로는 행동으로 옮기는 데 시간이 걸리기도 합니다. 속마음을 쉽게 드러내지 않아 주변에서 '무슨 생각 하는지 모르겠다'는 말을 종종 듣습니다."
        ],
        advice: "생각을 멈추고 일단 저질러보는 용기가 필요합니다. 완벽한 계획보다 때로는 직관에 몸을 맡겨보세요."
      };
    }
  };

  const getWealthInsight = () => {
    if (strongestElement === '나무') {
      return {
        hook: "끊임없이 새로운 것을 기획하고 시작하는 스타트업 체질 🚀",
        paragraphs: [
          `사주에 나무(木) 기운이 강하게 자리잡고 있어, 무에서 유를 창조하는 기획력과 추진력이 뛰어납니다. 남들이 생각하지 못한 아이디어를 현실로 만드는 데 탁월한 재능이 있죠.`,
          "한 곳에 정체되어 있는 것을 견디지 못하며, 끊임없이 성장하고 새로운 프로젝트를 벌이는 것을 좋아합니다. 초기 세팅에 강한 타입입니다.",
          timeStem !== '모름' ? `특히 태어난 시간의 [${timeTenDeity}] 기운이 당신의 아이디어를 끝까지 밀고 나가는 뒷심이 되어줄 것입니다.` : ''
        ].filter(Boolean),
        advice: "시작은 잘하지만 마무리가 약할 수 있습니다. 일을 벌이기 전에 끝을 맺을 수 있는 시스템이나 믿을 만한 파트너를 곁에 두는 것이 좋습니다."
      };
    } else if (strongestElement === '불') {
      return {
        hook: "나 자신을 드러내고 표현할 때 돈이 따라오는 사주 🌟",
        paragraphs: [
          `사주에 불(火) 기운이 강해, 남들 앞에 나서고 자신을 표현하는 분야에서 큰 성과를 낼 수 있습니다. 방송, 예술, 마케팅, 영업 등 사람들의 시선을 끄는 직업이 찰떡입니다.`,
          "당신의 열정과 에너지가 곧 돈이 되는 구조입니다. 숨어있지 말고 적극적으로 당신의 매력과 능력을 세상에 알리세요.",
          timeStem !== '모름' ? `특히 태어난 시간의 [${timeTenDeity}] 기운이 당신의 명예와 부를 더욱 확고하게 다져줄 것입니다.` : ''
        ].filter(Boolean),
        advice: "감정 기복에 따라 재물운도 출렁일 수 있습니다. 기분이 태도가 되지 않도록 멘탈 관리에 신경 쓰면 더 큰 부를 축적할 수 있습니다."
      };
    } else if (strongestElement === '흙') {
      return {
        hook: "부동산이나 안정적인 자산 운용, 중간에서 연결하는 중개업 🏢",
        paragraphs: [
          `사주에 흙(土) 기운이 강해, 매우 안정적이고 신중하게 재물을 모으는 스타일입니다. 일확천금보다는 차곡차곡 쌓아가는 저축이나 부동산 투자가 잘 맞습니다.`,
          "사람과 사람, 기업과 기업을 연결해주는 중개 역할이나 컨설팅 분야에서도 두각을 나타낼 수 있습니다. 신뢰감이 당신의 가장 큰 무기입니다.",
          timeStem !== '모름' ? `특히 태어난 시간의 [${timeTenDeity}] 기운이 말년의 안정적인 자산 형성에 큰 도움을 줄 것입니다.` : ''
        ].filter(Boolean),
        advice: "너무 신중하다 보면 좋은 기회를 놓칠 수 있습니다. 때로는 확실한 정보가 있다면 과감하게 투자하는 결단력도 필요합니다."
      };
    } else if (strongestElement === '쇠') {
      return {
        hook: "금융, IT, 분석 등 정확하고 예리한 판단력이 돈이 되는 사주 💻",
        paragraphs: [
          `사주에 쇠(金) 기운이 강해, 숫자와 데이터를 다루거나 정확한 판단이 요구되는 분야에서 큰 돈을 만질 수 있습니다. 금융, IT, 법률, 의료 등 전문직에 적합합니다.`,
          "남들이 보지 못하는 허점을 짚어내고, 불필요한 것을 잘라내는 구조조정이나 효율화 작업에서도 탁월한 능력을 발휘합니다.",
          timeStem !== '모름' ? `특히 태어난 시간의 [${timeTenDeity}] 기운이 당신의 전문성을 더욱 날카롭게 벼려줄 것입니다.` : ''
        ].filter(Boolean),
        advice: "너무 완벽을 기하다가 타이밍을 놓치지 마세요. 80% 정도 확신이 섰다면 실행에 옮기면서 수정해 나가는 유연함이 필요합니다."
      };
    } else {
      return {
        hook: "해외 역마, 유통, 지혜를 쓰는 교육이나 연구 분야가 찰떡 ✈️",
        paragraphs: [
          `사주에 물(水) 기운이 강해, 한 곳에 머물기보다는 끊임없이 흘러가며 교류하는 분야에서 재물운이 터집니다. 무역, 유통, 해외 관련 업무나 지식 산업이 잘 맞습니다.`,
          "깊은 사고력과 지혜를 바탕으로 연구, 교육, 기획 분야에서도 두각을 나타냅니다. 유연한 사고방식이 당신의 가장 큰 자산입니다.",
          timeStem !== '모름' ? `특히 태어난 시간의 [${timeTenDeity}] 기운이 당신의 아이디어를 현실적인 성과로 연결해줄 것입니다.` : ''
        ].filter(Boolean),
        advice: "생각만 하다가 끝나는 경우가 많습니다. 머릿속의 뛰어난 아이디어를 현실로 끄집어내는 실행력을 기르는 것이 부자가 되는 지름길입니다."
      };
    }
  };

  const getLoveInsight = () => {
    if (dayElement === '나무') {
      return {
        hook: "한번 빠지면 뒤도 안 돌아보는 해바라기 로맨티스트 🌻",
        paragraphs: [
          `${userName}님은 연애에 있어서도 직진하는 스타일입니다. 마음에 드는 사람이 생기면 계산하지 않고 자신의 마음을 솔직하게 표현하죠.`,
          "한번 내 사람이다 싶으면 헌신적으로 챙기지만, 상대방이 내 마음을 알아주지 않거나 배신하면 그 상처를 회복하는 데 꽤 오랜 시간이 걸립니다."
        ],
        advice: "너무 빠른 속도로 다가가면 상대방이 부담을 느낄 수 있습니다. 상대방의 속도에 맞춰 천천히 관계를 발전시키는 여유를 가져보세요."
      };
    } else if (dayElement === '불') {
      return {
        hook: "금사빠 금사식? 진짜 사랑을 만나면 모든 걸 다 태웁니다 🔥",
        paragraphs: [
          `${userName}님은 감정에 솔직하고 열정적인 연애를 추구합니다. 첫눈에 반하는 경우도 많고, 연애 초반에 불같이 타오르는 스타일이죠.`,
          "하지만 호기심이 떨어지면 금방 식어버리는 경향도 있습니다. 진정한 인연을 만나면 자신의 모든 것을 내어줄 만큼 헌신적인 사랑을 합니다."
        ],
        advice: "순간의 감정에 휩쓸리기보다는, 상대방의 내면을 깊이 알아가는 시간을 가지세요. 오래 타오르는 은은한 불꽃 같은 사랑이 필요합니다."
      };
    } else if (dayElement === '흙') {
      return {
        hook: "천천히 스며드는 가랑비 같은 연애를 추구해요 ☔",
        paragraphs: [
          `${userName}님은 한눈에 반하기보다는 오랫동안 지켜보며 서서히 정이 드는 스타일입니다. 신중하고 안정적인 관계를 원하죠.`,
          "상대방을 편안하게 해주는 매력이 있지만, 속마음을 잘 표현하지 않아 상대방이 답답해할 수도 있습니다. 밀당보다는 진정성 있는 태도가 무기입니다."
        ],
        advice: "가끔은 예상치 못한 이벤트나 적극적인 애정 표현으로 관계에 활력을 불어넣어 보세요. 당신의 반전 매력에 상대방이 푹 빠질 것입니다."
      };
    } else if (dayElement === '쇠') {
      return {
        hook: "조건보다 내 기준이 확고한 까다로운 로맨티스트 💎",
        paragraphs: [
          `${userName}님은 연애에 있어서도 자신만의 확고한 기준이 있습니다. 아무나 만나지 않고, 맺고 끊음이 확실한 편이죠.`,
          "겉으로는 차갑고 도도해 보이지만, 내 사람에게는 한없이 다정하고 헌신적인 츤데레 스타일입니다. 한번 마음을 열면 절대 배신하지 않는 의리파입니다."
        ],
        advice: "너무 높은 기준을 세워두면 좋은 인연을 놓칠 수 있습니다. 완벽한 사람을 찾기보다는, 서로의 부족함을 채워줄 수 있는 사람을 만나보세요."
      };
    } else {
      return {
        hook: "정신적인 교감을 가장 중요하게 생각하는 소울메이트 찾기 🌌",
        paragraphs: [
          `${userName}님은 외모나 조건보다는 대화가 잘 통하고 가치관이 맞는 사람에게 강하게 끌립니다. 정신적인 교감을 매우 중요하게 생각하죠.`,
          "상대방의 마음을 잘 읽고 배려심이 깊지만, 때로는 혼자만의 시간이 반드시 필요한 스타일입니다. 구속받는 것을 극도로 싫어합니다."
        ],
        advice: "혼자만의 동굴에 너무 오래 머물지 마세요. 상대방에게 당신의 감정과 생각을 솔직하게 공유할 때 더욱 깊은 관계로 발전할 수 있습니다."
      };
    }
  };

  const getRelationshipInsight = () => {
    if (strongestElement === '나무') {
      return {
        hook: "사람을 키우고 성장시키는 데 탁월한 멘토형 인간 🌱",
        paragraphs: [
          `명리학적으로 볼 때, ${userName}님은 주변 사람들에게 긍정적인 에너지를 주고 성장을 돕는 데 탁월한 재능이 있습니다.`,
          "하지만 때로는 오지랖이 넓어 피곤한 일에 휘말리기도 합니다. 나에게 진짜 도움이 되는 사람과 그렇지 않은 사람을 구분하는 안목이 필요합니다."
        ],
        advice: "모든 사람을 책임지려 하지 마세요. 맺고 끊음을 확실히 하고, 나를 진정으로 아껴주는 사람에게만 에너지를 쏟으세요."
      };
    } else if (strongestElement === '불') {
      return {
        hook: "어딜 가나 시선 집중! 화려한 인맥의 중심 🌟",
        paragraphs: [
          `${userName}님은 특유의 밝고 따뜻한 에너지로 사람들을 끌어당기는 묘한 매력이 있습니다. 주변에 항상 사람이 끊이지 않죠.`,
          "하지만 그만큼 피곤한 관계도 많이 엮이게 됩니다. 감정 소모가 심해지면 혼자만의 동굴로 들어가버리는 극단적인 면도 있습니다."
        ],
        advice: "모든 사람에게 좋은 사람이 될 필요는 없습니다. 내 에너지를 갉아먹는 '에너지 뱀파이어'를 멀리하는 연습을 하세요."
      };
    } else if (strongestElement === '흙') {
      return {
        hook: "모두가 기대고 싶어하는 든든한 바위 같은 존재 🪨",
        paragraphs: [
          `${userName}님은 입이 무겁고 신뢰감을 주어 주변 사람들이 비밀이나 고민을 털어놓기 좋은 상대입니다. 인간관계의 든든한 허브 역할을 하죠.`,
          "하지만 정작 본인의 속마음은 잘 털어놓지 않아 스트레스가 쌓이기 쉽습니다. 남의 이야기만 듣다가 내 감정을 놓치는 경우가 많습니다."
        ],
        advice: "때로는 내 약점이나 고민을 솔직하게 털어놓는 것이 관계를 더욱 깊게 만듭니다. 나를 온전히 기댈 수 있는 사람을 한 명쯤은 꼭 만드세요."
      };
    } else if (strongestElement === '쇠') {
      return {
        hook: "맺고 끊음이 확실한 의리파, 내 사람은 끝까지 챙긴다 ⚔️",
        paragraphs: [
          `${userName}님은 인간관계에서 선이 명확합니다. 내 바운더리 안에 들어온 사람은 끝까지 책임지지만, 선을 넘으면 가차 없이 잘라냅니다.`,
          "겉으로는 차갑고 다가가기 힘들어 보일 수 있지만, 한번 친해지면 속 깊은 정을 나누는 진국 같은 스타일입니다."
        ],
        advice: "너무 칼 같은 잣대로 사람을 평가하면 외로워질 수 있습니다. 가끔은 상대방의 실수나 부족함을 부드럽게 감싸주는 여유를 가져보세요."
      };
    } else {
      return {
        hook: "누구와도 잘 어울리는 미친 친화력의 소유자 🌊",
        paragraphs: [
          `${userName}님은 물처럼 유연하게 어떤 무리에도 자연스럽게 스며드는 탁월한 친화력을 가졌습니다. 적을 잘 만들지 않는 평화주의자죠.`,
          "하지만 이 사람 저 사람에게 다 맞춰주다 보면 정작 '진짜 내 모습'을 잃어버릴 수 있습니다. 줏대가 없다는 오해를 받기도 합니다."
        ],
        advice: "모두에게 맞추려다 나 자신을 잃지 마세요. 갈등을 두려워하지 말고, 필요할 때는 내 주장을 명확하게 표현하는 용기가 필요합니다."
      };
    }
  };

  const getHiddenTalentInsight = () => {
    if (timeTenDeity === '비견' || timeTenDeity === '겁재') {
      return {
        hook: "남의 밑에선 못 일해! 독립적인 리더십과 승부사 기질 👑",
        paragraphs: [
          `사주 구조를 보면 ${userName}님은 남의 지시를 받기보다는 스스로 판을 짜고 주도할 때 가장 큰 능력을 발휘합니다.`,
          "강한 승부욕과 독립심이 숨어 있어, 위기 상황에서 오히려 침착하게 리더십을 발휘하는 반전 매력이 있습니다."
        ],
        advice: "조직 생활이 답답하게 느껴진다면, 당신의 주도성을 발휘할 수 있는 독립적인 프로젝트나 창업을 진지하게 고민해 보세요."
      };
    } else if (timeTenDeity === '식신' || timeTenDeity === '상관') {
      return {
        hook: "말 한마디로 천냥 빚을 갚는 탁월한 언변과 표현력 🎤",
        paragraphs: [
          `사주에 무언가를 만들어내고 표현하는 기운이 강합니다. 글, 말, 예술 등 어떤 형태로든 자신의 생각을 밖으로 표출하는 데 천부적인 재능이 있죠.`,
          "특히 위기 상황에서 번뜩이는 아이디어와 순발력으로 문제를 해결하는 능력이 탁월합니다. 남들을 설득하는 데 도가 텄습니다."
        ],
        advice: "당신의 아이디어와 표현력을 썩히지 마세요. 블로그, 유튜브, 혹은 사내 발표 등 당신의 목소리를 낼 수 있는 무대를 적극적으로 찾으세요."
      };
    } else if (timeTenDeity === '편재' || timeTenDeity === '정재') {
      return {
        hook: "돈 냄새를 기가 막히게 맡는 타고난 비즈니스 감각 💰",
        paragraphs: [
          `사주 구조를 보면 현실적인 감각과 계산 능력이 매우 뛰어납니다. 남들은 보지 못하는 시장의 흐름이나 돈이 되는 포인트를 정확히 짚어내죠.`,
          "단순히 돈을 모으는 것을 넘어, 자원을 효율적으로 배분하고 가치를 극대화하는 기획력과 비즈니스 마인드가 숨어 있습니다."
        ],
        advice: "당신의 현실 감각을 믿으세요. 재테크 공부나 비즈니스 모델 분석에 시간을 투자하면 남들보다 훨씬 빠르게 경제적 자유를 얻을 수 있습니다."
      };
    } else if (timeTenDeity === '편관' || timeTenDeity === '정관') {
      return {
        hook: "어떤 위기에도 흔들리지 않는 강인한 책임감과 카리스마 🛡️",
        paragraphs: [
          `사주에 자신을 통제하고 규칙을 준수하는 기운이 강합니다. 남들이 기피하는 어렵고 힘든 일도 묵묵히 해내는 엄청난 책임감의 소유자죠.`,
          "평소에는 조용해 보이지만, 조직에 위기가 닥쳤을 때 흔들림 없이 중심을 잡고 사람들을 이끄는 부드러운 카리스마가 있습니다."
        ],
        advice: "너무 많은 짐을 혼자 짊어지려 하지 마세요. 당신의 책임감은 훌륭하지만, 때로는 타인에게 위임하고 휴식을 취하는 것도 능력입니다."
      };
    } else if (timeTenDeity === '편인' || timeTenDeity === '정인') {
      return {
        hook: "하나를 보면 열을 아는 비상한 직관력과 학자적 기질 📚",
        paragraphs: [
          `사주에 지식을 흡수하고 깊이 사고하는 기운이 강합니다. 남들은 겉핥기식으로 넘어가는 정보도 본질을 꿰뚫어보는 예리한 직관력이 있죠.`,
          "특정 분야에 깊이 파고들어 전문가 수준의 지식을 쌓는 데 탁월한 재능이 있습니다. 사람의 마음을 읽어내는 눈치도 매우 빠릅니다."
        ],
        advice: "당신의 깊은 통찰력을 활용할 수 있는 전문 분야를 찾으세요. 끊임없이 배우고 연구하는 자세가 당신을 대체 불가능한 존재로 만들 것입니다."
      };
    } else {
      return {
        hook: "본인만 모르는 천재성? 남들이 절대 따라올 수 없는 독보적인 무기 😈",
        paragraphs: [
          `사주 구조를 보면 남들은 대충 넘어가는 것도 ${userName}님 눈에는 거슬려서 못 참는 예리함이 숨어 있습니다.`,
          "이걸 예민하다고 스트레스 받지 마세요. 현대 사회에서는 이게 바로 '전문성'이고 '디테일'입니다. 기획, 분석, 디자인 등에서 남들이 절대 따라올 수 없는 독보적인 무기가 됩니다."
        ],
        advice: "당신의 예리한 통찰력을 사람을 찌르는 데 쓰지 말고, 문제를 해결하고 사람을 살리는 직업적 무기로 활용하세요."
      };
    }
  };

  const getHealthInsight = () => {
    if (missingElements.includes('목')) {
      return {
        hook: "간/담낭 주의! 피로가 쉽게 쌓이는 체질 🌿",
        paragraphs: [
          `사주에 나무(木) 기운이 부족하여, 남들보다 피로를 쉽게 느끼고 회복이 더딜 수 있습니다. 간과 담낭의 건강에 각별히 신경 써야 합니다.`,
          "스트레스를 받으면 근육이 쉽게 뭉치거나 눈이 피로해지는 증상이 나타날 수 있습니다. 충분한 수면과 휴식이 그 어떤 보약보다 중요합니다."
        ],
        advice: "푸른 잎채소를 자주 섭취하고, 아침에 일찍 일어나는 습관을 들이세요. 숲길을 산책하며 맑은 공기를 마시는 것이 큰 도움이 됩니다."
      };
    } else if (missingElements.includes('화')) {
      return {
        hook: "심장/혈액순환 주의! 갑자기 텐션이 떨어질 수 있어요 🔥",
        paragraphs: [
          `사주에 불(火) 기운이 부족하여, 몸이 차갑고 혈액순환이 원활하지 않을 수 있습니다. 심장과 소장의 건강을 챙겨야 합니다.`,
          "평소에는 괜찮다가도 갑자기 무기력해지거나 우울감이 찾아올 수 있습니다. 몸을 항상 따뜻하게 유지하는 것이 중요합니다."
        ],
        advice: "따뜻한 차를 자주 마시고, 반신욕이나 족욕으로 체온을 높여주세요. 햇볕을 쬐며 가벼운 조깅을 하는 것도 활력을 되찾는 데 좋습니다."
      };
    } else if (missingElements.includes('토')) {
      return {
        hook: "위장/소화기 주의! 스트레스 받으면 속부터 아픈 스타일 🪨",
        paragraphs: [
          `사주에 흙(土) 기운이 부족하여, 소화 기능이 약하고 위장 장애를 겪기 쉽습니다. 스트레스가 바로 소화불량으로 이어지는 타입이죠.`,
          "식사 시간이 불규칙하거나 폭식을 하면 몸에 큰 무리가 갑니다. 비장과 위장의 건강을 최우선으로 관리해야 합니다."
        ],
        advice: "밀가루나 찬 음식은 피하고, 따뜻하고 소화가 잘 되는 음식을 천천히 씹어 드세요. 식후에 가볍게 걷는 습관이 소화에 큰 도움이 됩니다."
      };
    } else if (missingElements.includes('금')) {
      return {
        hook: "폐/호흡기 주의! 환절기마다 고생하는 예민한 기관지 ⚔️",
        paragraphs: [
          `사주에 쇠(金) 기운이 부족하여, 환절기나 미세먼지에 매우 취약합니다. 폐와 대장의 건강에 각별한 주의가 필요합니다.`,
          "감기에 한 번 걸리면 오래가거나, 피부 트러블, 알레르기 증상으로 고생할 수 있습니다. 면역력 관리가 필수적입니다."
        ],
        advice: "실내 습도를 적절히 유지하고, 도라지나 배 등 기관지에 좋은 음식을 챙겨 드세요. 깊은 복식 호흡을 통해 폐활량을 늘리는 것도 좋습니다."
      };
    } else if (missingElements.includes('수')) {
      return {
        hook: "신장/방광 주의! 체력 방전이 빠른 편이니 수분 섭취 필수 🌊",
        paragraphs: [
          `사주에 물(水) 기운이 부족하여, 신장과 방광 기능이 약할 수 있습니다. 남들보다 체력 방전이 빠르고 만성 피로에 시달리기 쉽죠.`,
          "몸에 수분이 부족해지기 쉬우므로, 피부가 건조해지거나 뼈와 관절이 약해질 수 있습니다. 꾸준한 수분 섭취가 생명입니다."
        ],
        advice: "하루 2리터 이상의 미지근한 물을 꾸준히 마시는 습관을 들이세요. 짠 음식을 줄이고, 하체를 따뜻하게 유지하는 것이 중요합니다."
      };
    } else {
      return {
        hook: "타고난 강철 체력? 하지만 방심은 금물입니다 💪",
        paragraphs: [
          `오행이 고루 갖춰져 있어 전반적인 신체 밸런스가 매우 좋습니다. 잔병치레가 적고 회복력도 빠른 타고난 건강 체질이네요.`,
          "하지만 체력을 과신하여 무리하다가 한 번에 크게 앓아누울 수 있습니다. 특히 스트레스가 쌓이면 멘탈 건강에 적신호가 켜질 수 있으니 주의하세요."
        ],
        advice: "넘치는 에너지를 운동이나 일적인 성취로 발산하세요. 감정이 격해질 때는 심호흡을 하고 한 템포 쉬어가는 여유가 필요합니다. 나만의 '케렌시아(안식처)'를 반드시 만드세요."
      };
    }
  };

  const getTurningPointInsight = () => {
    if (dayElement === '나무') {
      return {
        hook: "새로운 환경에 뿌리를 내릴 때 가장 크게 성장합니다 🌱",
        paragraphs: [
          `사주는 10년마다 큰 환경이 바뀌는 '대운(大運)'이라는 게 있습니다. ${userName}님은 익숙한 곳을 떠나 새로운 토양에 뿌리를 내릴 때 인생의 큰 전환점을 맞이합니다.`,
          "이직, 이사, 혹은 새로운 인간관계 등 환경의 변화를 두려워하지 마세요. 그 변화가 당신을 더 큰 나무로 성장시키는 자양분이 될 것입니다."
        ],
        advice: "변화의 시기에는 두려움보다 기대감을 가지세요. 과거의 영광이나 실패에 얽매이지 말고, 새로운 환경이 주는 기회를 적극적으로 수용하는 자세가 필요합니다."
      };
    } else if (dayElement === '불') {
      return {
        hook: "당신의 열정을 알아주는 귀인을 만날 때 인생이 바뀝니다 🔥",
        paragraphs: [
          `사주는 10년마다 큰 환경이 바뀌는 '대운(大運)'이라는 게 있습니다. ${userName}님은 당신의 가치와 열정을 알아보고 불을 지펴줄 '귀인'을 만나는 순간이 가장 큰 터닝포인트입니다.`,
          "혼자서 모든 것을 해결하려 하지 말고, 다양한 사람들과 교류하며 당신을 이끌어줄 멘토나 파트너를 적극적으로 찾아보세요."
        ],
        advice: "인맥이 곧 자산입니다. 당신의 능력을 숨기지 말고 적극적으로 어필하세요. 준비된 자만이 귀인이 내미는 손을 잡을 수 있습니다."
      };
    } else if (dayElement === '흙') {
      return {
        hook: "오랜 시간 묵묵히 쌓아온 노력이 마침내 빛을 발하는 순간 🪨",
        paragraphs: [
          `사주는 10년마다 큰 환경이 바뀌는 '대운(大運)'이라는 게 있습니다. ${userName}님은 극적인 변화보다는, 오랜 시간 묵묵히 다져온 내공이 임계점을 넘는 순간 인생이 크게 도약합니다.`,
          "당장 성과가 보이지 않는다고 조급해하지 마세요. 당신이 지금 걷고 있는 그 길이 결국 가장 단단하고 높은 산을 만드는 과정입니다."
        ],
        advice: "포기하고 싶은 순간이 바로 성공의 문턱입니다. 흔들리지 않는 우직함으로 당신만의 전문성을 끝까지 밀고 나가세요."
      };
    } else if (dayElement === '쇠') {
      return {
        hook: "과감하게 과거를 끊어내고 새로운 도전을 시작할 때 ⚔️",
        paragraphs: [
          `사주는 10년마다 큰 환경이 바뀌는 '대운(大運)'이라는 게 있습니다. ${userName}님은 나를 옭아매던 낡은 관습이나 인간관계를 단호하게 끊어낼 때 비로소 새로운 길이 열립니다.`,
          "제련되지 않은 원석이 뜨거운 불을 만나 명검으로 탄생하듯, 고통스러운 결단의 순간이 당신을 더욱 빛나게 만들어줄 것입니다."
        ],
        advice: "아닌 것은 아니라고 말할 수 있는 용기가 필요합니다. 미련 때문에 과거를 끌어안고 있지 말고, 과감한 결단으로 새로운 챕터를 시작하세요."
      };
    } else {
      return {
        hook: "흐름에 몸을 맡기고 유연하게 대처할 때 뜻밖의 기회가 찾아옵니다 🌊",
        paragraphs: [
          `사주는 10년마다 큰 환경이 바뀌는 '대운(大運)'이라는 게 있습니다. ${userName}님은 억지로 상황을 통제하려 하기보다, 물 흐르듯 자연스럽게 상황에 순응할 때 뜻밖의 행운을 만납니다.`,
          "예상치 못한 위기나 변화가 찾아오더라도 당황하지 마세요. 그 파도를 타고 넘으면 당신이 상상하지 못했던 더 넓은 바다가 펼쳐질 것입니다."
        ],
        advice: "계획대로 되지 않는다고 좌절하지 마세요. 때로는 우연이 만들어낸 길이 가장 완벽한 목적지로 당신을 안내할 수 있습니다."
      };
    }
  };

  const getPastLifeInsight = () => {
    if (dayElement === '나무') {
      return {
        hook: "전생에 억압받던 영혼, 이번 생의 미션은 '완전한 자유' 🕊️",
        paragraphs: [
          `명리학적으로 볼 때, ${userName}님의 사주 구조는 과거의 억압이나 틀에서 벗어나 온전한 자기 자신으로 살아가려는 강한 열망을 담고 있습니다.`,
          "어딘가에 얽매이는 것을 극도로 싫어하고, 나만의 규칙을 만들고 싶어 하는 이유가 바로 여기에 있죠. 남들의 시선이나 사회적 기준에 맞추려 하지 마세요."
        ],
        advice: "당신의 영혼은 자유로울 때 가장 빛납니다. 타인의 기대에 부응하려 애쓰지 말고, 당신이 진정으로 원하는 삶의 방식을 당당하게 선택하세요."
      };
    } else if (dayElement === '불') {
      return {
        hook: "전생에 세상을 밝히던 지도자, 이번 생의 미션은 '따뜻한 나눔' 🕯️",
        paragraphs: [
          `명리학적으로 볼 때, ${userName}님은 전생에 많은 사람들을 이끌고 영감을 주던 리더의 카르마를 안고 태어났습니다.`,
          "이번 생에서는 그 뜨거운 에너지를 나 혼자만의 성공이 아닌, 주변 사람들을 따뜻하게 품어주고 성장시키는 데 사용해야 합니다."
        ],
        advice: "당신이 가진 긍정적인 에너지와 지혜를 아낌없이 나누세요. 타인을 빛나게 할 때, 당신의 삶도 더욱 찬란하게 빛날 것입니다."
      };
    } else if (dayElement === '흙') {
      return {
        hook: "전생에 많은 이를 품었던 대지, 이번 생의 미션은 '나 자신을 돌보는 것' 🌾",
        paragraphs: [
          `명리학적으로 볼 때, ${userName}님은 전생에 끊임없이 남을 위해 희생하고 헌신했던 카르마를 안고 태어났습니다.`,
          "이번 생에서는 남을 챙기기 전에 '나 자신'을 먼저 사랑하고 돌보는 법을 배워야 합니다. 이기적이라는 죄책감을 가질 필요가 전혀 없습니다."
        ],
        advice: "내 그릇이 가득 차야 남에게도 나누어 줄 수 있습니다. 온전히 나만을 위한 시간을 가지고, 내면의 목소리에 귀 기울이는 연습을 하세요."
      };
    } else if (dayElement === '쇠') {
      return {
        hook: "전생에 정의를 위해 싸우던 전사, 이번 생의 미션은 '부드러운 타협' 🗡️",
        paragraphs: [
          `명리학적으로 볼 때, ${userName}님은 전생에 옳고 그름을 명확히 가리고 불의와 타협하지 않던 전사의 카르마를 안고 태어났습니다.`,
          "이번 생에서는 날카로운 칼날을 거두고, 나와 다른 의견을 가진 사람들과도 부드럽게 조화를 이루며 살아가는 법을 배워야 합니다."
        ],
        advice: "세상 모든 일이 흑과 백으로 나뉘는 것은 아닙니다. 회색 지대를 인정하고, 타인의 실수에 관대해지는 포용력을 기르세요."
      };
    } else {
      return {
        hook: "전생에 세상을 떠돌던 방랑자, 이번 생의 미션은 '안정적인 정착' ⛵",
        paragraphs: [
          `명리학적으로 볼 때, ${userName}님은 전생에 한 곳에 얽매이지 않고 세상을 자유롭게 떠돌던 방랑자의 카르마를 안고 태어났습니다.`,
          "이번 생에서는 깊이 뿌리를 내리고, 나와 뜻을 함께하는 사람들과 안정적인 공동체를 구축하는 것이 중요한 미션입니다."
        ],
        advice: "끊임없이 새로운 것을 찾아 헤매기보다는, 지금 내 곁에 있는 사람들과 현재의 환경에 감사하며 깊이를 더해가는 삶을 살아보세요."
      };
    }
  };

  const personalityInsight = getPersonalityInsight();
  const wealthInsight = getWealthInsight();
  const loveInsight = getLoveInsight();
  const relationshipInsight = getRelationshipInsight();
  const hiddenTalentInsight = getHiddenTalentInsight();
  const healthInsight = getHealthInsight();
  const turningPointInsight = getTurningPointInsight();
  const pastLifeInsight = getPastLifeInsight();

  const stars = [
    ...(yearPillar.otherShensha || []),
    ...(monthPillar.otherShensha || []),
    ...(dayPillar.otherShensha || []),
    ...(timePillar.otherShensha || []),
    yearPillar.twelveShensha,
    monthPillar.twelveShensha,
    dayPillar.twelveShensha,
    timePillar.twelveShensha
  ].filter(Boolean).join(', ');

  const shisung = [
    yearPillar.stem.tenDeity, yearPillar.branch.tenDeity,
    monthPillar.stem.tenDeity, monthPillar.branch.tenDeity,
    dayPillar.stem.tenDeity, dayPillar.branch.tenDeity,
    timePillar.stem.tenDeity, timePillar.branch.tenDeity
  ].filter(Boolean).join(', ');

  const birthInfo = `${payload.birthYear}년 ${payload.birthMonth}월 ${payload.birthDay}일 ${payload.isTimeUnknown ? '시간 모름' : payload.birthTime}`;

  let finalExpertComment = `${dayElement}(${dayStemChar})의 기운을 가지고 태어나셨네요! ${dayElement === '나무' ? '위로 곧게 뻗어나가는 긍정적이고 진취적인 에너지가 돋보이는 사주입니다.' : dayElement === '불' ? '밝고 열정적이며 사람들을 이끄는 따뜻한 에너지가 돋보이는 사주입니다.' : dayElement === '흙' ? '모든 것을 품어주는 넓고 안정적인 에너지가 돋보이는 사주입니다.' : dayElement === '쇠' ? '맺고 끊음이 확실하고 결단력 있는 에너지가 돋보이는 사주입니다.' : '어디든 스며들고 유연하게 대처하는 지혜로운 에너지가 돋보이는 사주입니다.'} ${timeStem !== '모름' ? `특히 말년을 의미하는 시주(時柱)에 ${timeStem}${timeBranch}의 기운이 자리잡아, 시간이 갈수록 더욱 안정되고 빛나는 삶이 예상됩니다.` : ''}`;

  let insights: any[] = [
    {
      id: 'overall',
      category: '인생총운풀이',
      iconName: 'User',
      hook: '인생총운 심층 분석',
      paragraphs: [],
      advice: '',
      isLocked: false,
      isLoading: true
    },
    {
      id: 'wealth',
      category: '재물운',
      iconName: 'Coins',
      hook: '재물운 분석',
      paragraphs: [],
      advice: '',
      isLocked: true,
      isLoading: true
    },
    {
      id: 'health',
      category: '건강운',
      iconName: 'Activity',
      hook: '건강운 분석',
      paragraphs: [],
      advice: '',
      isLocked: true,
      isLoading: true
    },
    {
      id: 'love',
      category: '애정운',
      iconName: 'Heart',
      hook: '애정운 분석',
      paragraphs: [],
      advice: '',
      isLocked: true,
      isLoading: true
    },
    {
      id: 'marriage',
      category: '결혼운',
      iconName: 'Users',
      hook: '결혼운 분석',
      paragraphs: [],
      advice: '',
      isLocked: true,
      isLoading: true
    },
    {
      id: 'children',
      category: '자녀운',
      iconName: 'Gift',
      hook: '자녀운 분석',
      paragraphs: [],
      advice: '',
      isLocked: true,
      isLoading: true
    },
    {
      id: 'career',
      category: '직업운',
      iconName: 'Briefcase',
      hook: '직업운 분석',
      paragraphs: [],
      advice: '',
      isLocked: true,
      isLoading: true
    },
    {
      id: 'business',
      category: '사업운',
      iconName: 'Compass',
      hook: '사업운 분석',
      paragraphs: [],
      advice: '',
      isLocked: true,
      isLoading: true
    },
    {
      id: 'study',
      category: '학업운',
      iconName: 'BookOpen',
      hook: '학업운 분석',
      paragraphs: [],
      advice: '',
      isLocked: true,
      isLoading: true
    },
    {
      id: 'parents',
      category: '부모운',
      iconName: 'UserCircle',
      hook: '부모운 분석',
      paragraphs: [],
      advice: '',
      isLocked: true,
      isLoading: true
    },
    {
      id: 'interpersonal',
      category: '대인관계운',
      iconName: 'MessageCircle',
      hook: '대인관계운 분석',
      paragraphs: [],
      advice: '',
      isLocked: true,
      isLoading: true
    },
    {
      id: 'realestate',
      category: '부동산운',
      iconName: 'Home',
      hook: '부동산운 분석',
      paragraphs: [],
      advice: '',
      isLocked: true,
      isLoading: true
    }
  ];

  const advice = missingElements.length > 0 
    ? `사주에 ${missingElements.join(', ')} 기운이 부족합니다. 이를 보완하기 위해 검은색이나 푸른색 소품을 가까이 하고, 물가나 숲을 산책하는 시간을 가져보세요.`
    : `오행이 고루 갖춰진 조화로운 사주입니다. 지금처럼 균형 잡힌 삶의 태도를 유지하세요.`;

  return {
    chart: {
      time: timePillar,
      day: dayPillar,
      month: monthPillar,
      year: yearPillar
    },
    expertComment: finalExpertComment,
    headline,
    narrative,
    myungriBasis,
    prescription: {
      missingElements,
      advice
    },
    luckyItems: {
      number: dayElement === '나무' ? '3, 8' : dayElement === '불' ? '2, 7' : dayElement === '흙' ? '5, 10' : dayElement === '쇠' ? '4, 9' : '1, 6',
      color: dayElement === '나무' ? '푸른색, 초록색' : dayElement === '불' ? '붉은색, 핑크색' : dayElement === '흙' ? '노란색, 황토색' : dayElement === '쇠' ? '흰색, 은색' : '검은색, 짙은 남색',
      direction: dayElement === '나무' ? '동쪽' : dayElement === '불' ? '남쪽' : dayElement === '흙' ? '중앙' : dayElement === '쇠' ? '서쪽' : '북쪽'
    },
    networkInterpretation: `${userName}님의 우주는 ${dayElement}의 본질을 중심으로, 주변의 ${strongestElement} 에너지가 강하게 상호작용하며 역동적인 삶의 궤적을 만들어내고 있습니다. 각 행성들은 당신의 재능, 인간관계, 그리고 잠재력을 상징하며 끊임없이 에너지를 주고받습니다.`,
    elementScores,
    insights,
    promptParams: {
      userName,
      birthInfo,
      elementScores,
      pillars: { year: yearPillarStr, month: monthPillarStr, day: dayPillarStr, time: timePillarStr },
      stars,
      shisung,
      dayElement,
      strongestElement,
      gender: payload.gender
    }
  };
};

export const getTermDetail = async (
  term: string,
  pillarType: string,
  sajuResult: SajuResultData
) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
사용자의 사주 정보와 클릭한 특정 사주 용어(신살, 지장간, 십이운성 등) 정보를 바탕으로 상세 분석을 제공해주세요.

[사용자 사주 요약]
- 헤드라인: ${sajuResult.headline}
- 전체 흐름: ${sajuResult.narrative}
- 오행 점수: ${sajuResult.elementScores.map(s => `${s.element}(${s.score})`).join(', ')}

[클릭한 용어 정보]
- 용어: ${term}
- 위치: ${pillarType} (시주/일주/월주/년주 중 하나)

[요청 사항]
다음 세 가지 항목에 대해 친절하고 전문적인 어조로 설명해주세요:
1. **용어(한자) 및 뜻**: 해당 용어의 한자 표기와 명리학적 기본 의미를 설명해주세요.
2. **해당 위치(${pillarType})에 있을 때의 의미**: 이 용어가 사주의 ${pillarType}에 위치할 때 어떤 특별한 의미를 가지는지 설명해주세요.
3. **전체 사주에서의 적용**: 사용자의 전체 사주 구성(헤드라인 및 흐름 참고) 내에서 이 기운이 어떻게 작용하며, 삶에 어떻게 적용할 수 있을지 조언해주세요.

응답은 반드시 JSON 형식으로 보내주세요:
{
  "meaning": "용어(한자) 및 뜻 설명",
  "positionMeaning": "해당 위치에 있을 때의 의미 설명",
  "overall": "전체 사주에서의 적용 설명"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error fetching term detail:", error);
    return {
      meaning: `${term}의 기본적인 의미입니다.`,
      positionMeaning: `${pillarType}에서 작용하는 기운입니다.`,
      overall: "당신의 사주에서 중요한 역할을 합니다."
    };
  }
};

export const getHanjaDetail = async (
  hanja: string,
  name: string,
  pillarType: string,
  sajuResult: SajuResultData
) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const ai = new GoogleGenAI({ apiKey });
    const model = ai.models.get({ model: "gemini-3-flash-preview" });

    const prompt = `
사용자의 사주 정보와 클릭한 특정 한자(천간/지지) 정보를 바탕으로 상세 분석을 제공해주세요.

[사용자 사주 요약]
- 헤드라인: ${sajuResult.headline}
- 전체 흐름: ${sajuResult.narrative}
- 오행 점수: ${sajuResult.elementScores.map(s => `${s.element}(${s.score})`).join(', ')}

[클릭한 한자 정보]
- 한자: ${hanja} (${name})
- 위치: ${pillarType} (시주/일주/월주/년주 중 하나)

[요청 사항]
다음 세 가지 항목에 대해 친절하고 전문적인 어조로 설명해주세요:
1. **한자의 의미**: 해당 글자가 명리학적으로 어떤 기본 성질을 가지고 있는지 설명 (예: 정화는 등불, 따뜻함 등)
2. **지장간에서의 작용**: 이 글자가 사용자의 지장간(Hidden Stems) 구성과 어떻게 상호작용하거나 숨겨진 기운으로서 어떤 역할을 하는지
3. **전체 사주에서의 해석**: 사용자의 전체 사주 구성(헤드라인 및 흐름 참고) 내에서 이 글자가 어떤 핵심적인 의미를 갖는지, 삶의 어떤 부분에 영향을 주는지

응답은 반드시 JSON 형식으로 보내주세요:
{
  "meaning": "한자의 기본 의미 설명",
  "jijanggan": "지장간에서의 작용 설명",
  "overall": "전체 사주에서의 해석 설명"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error fetching hanja detail:", error);
    return {
      meaning: `${name}(${hanja})의 기본적인 기운입니다.`,
      jijanggan: "지장간 내에서 조화롭게 작용하고 있습니다.",
      overall: "당신의 사주에서 중요한 균형을 잡아주는 역할을 합니다."
    };
  }
};

export const analyzeMatch = async (payload: MatchFormPayload): Promise<MatchResultData> => {
  // 한자를 한글로 변환하는 맵
  const hanjaToHangulStem: Record<string, string> = {
    '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무',
    '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계'
  };
  const hanjaToHangulBranch: Record<string, string> = {
    '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사',
    '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해'
  };

  const convertPillar = (hanjaStr: string) => {
    const stemHanja = hanjaStr.charAt(0);
    const branchHanja = hanjaStr.charAt(1);
    return (hanjaToHangulStem[stemHanja] || '갑') + (hanjaToHangulBranch[branchHanja] || '자');
  };

  // 1. Calculate Saju for Person A
  const myBaZi = calculateBazi(payload.myData);
  
  const myYearStr = convertPillar(myBaZi.getYear());
  const myMonthStr = convertPillar(myBaZi.getMonth());
  const myDayStr = convertPillar(myBaZi.getDay());
  const myTimeStr = payload.myData.isTimeUnknown ? '모름' : convertPillar(myBaZi.getTime());
  
  const myDayStemChar = myDayStr.charAt(0);
  const myYearBranchChar = myYearStr.charAt(1);
  
  const myYearPillar = parsePillarString(myYearStr, myDayStemChar, myYearBranchChar);
  const myMonthPillar = parsePillarString(myMonthStr, myDayStemChar, myYearBranchChar);
  const myDayPillar = parsePillarString(myDayStr, myDayStemChar, myYearBranchChar);
  const myTimePillar = parsePillarString(myTimeStr, myDayStemChar, myYearBranchChar);

  // 2. Calculate Saju for Person B
  const partnerBaZi = calculateBazi(payload.partnerData);
  
  const partnerYearStr = convertPillar(partnerBaZi.getYear());
  const partnerMonthStr = convertPillar(partnerBaZi.getMonth());
  const partnerDayStr = convertPillar(partnerBaZi.getDay());
  const partnerTimeStr = payload.partnerData.isTimeUnknown ? '모름' : convertPillar(partnerBaZi.getTime());
  
  const partnerDayStemChar = partnerDayStr.charAt(0);
  const partnerYearBranchChar = partnerYearStr.charAt(1);
  
  const partnerYearPillar = parsePillarString(partnerYearStr, partnerDayStemChar, partnerYearBranchChar);
  const partnerMonthPillar = parsePillarString(partnerMonthStr, partnerDayStemChar, partnerYearBranchChar);
  const partnerDayPillar = parsePillarString(partnerDayStr, partnerDayStemChar, partnerYearBranchChar);
  const partnerTimePillar = parsePillarString(partnerTimeStr, partnerDayStemChar, partnerYearBranchChar);

  // 3. Call Gemini API for Match Analysis
  const prompt = `
당신은 최고의 명리학자이자 관계 심리 전문가입니다.
다음 두 사람의 사주 명식을 바탕으로 '${payload.relationship}' 관계에 대한 궁합을 분석해주세요.

[나의 정보]
이름: ${payload.myData.name}
성별: ${payload.myData.gender === 'male' ? '남성' : '여성'}
사주:
- 년주: ${myYearPillar.stem.hanja}${myYearPillar.branch.hanja} (${myYearPillar.stem.name}${myYearPillar.branch.name})
- 월주: ${myMonthPillar.stem.hanja}${myMonthPillar.branch.hanja} (${myMonthPillar.stem.name}${myMonthPillar.branch.name})
- 일주: ${myDayPillar.stem.hanja}${myDayPillar.branch.hanja} (${myDayPillar.stem.name}${myDayPillar.branch.name})
- 시주: ${payload.myData.isTimeUnknown ? '모름' : `${myTimePillar.stem.hanja}${myTimePillar.branch.hanja} (${myTimePillar.stem.name}${myTimePillar.branch.name})`}

[상대방 정보]
이름: ${payload.partnerData.name}
성별: ${payload.partnerData.gender === 'male' ? '남성' : '여성'}
사주:
- 년주: ${partnerYearPillar.stem.hanja}${partnerYearPillar.branch.hanja} (${partnerYearPillar.stem.name}${partnerYearPillar.branch.name})
- 월주: ${partnerMonthPillar.stem.hanja}${partnerMonthPillar.branch.hanja} (${partnerMonthPillar.stem.name}${partnerMonthPillar.branch.name})
- 일주: ${partnerDayPillar.stem.hanja}${partnerDayPillar.branch.hanja} (${partnerDayPillar.stem.name}${partnerDayPillar.branch.name})
- 시주: ${payload.partnerData.isTimeUnknown ? '모름' : `${partnerTimePillar.stem.hanja}${partnerTimePillar.branch.hanja} (${partnerTimePillar.stem.name}${partnerTimePillar.branch.name})`}

관계: ${payload.relationship}

반드시 아래 JSON 형식으로만 응답해주세요. (마크다운 백틱 없이 순수 JSON만 출력)
{
  "score": 0~100 사이의 궁합 점수 (숫자),
  "headline": "두 사람의 관계를 요약하는 감성적이고 임팩트 있는 한 줄 (예: 두 사람의 우주는 서로를 강하게 끌어당깁니다)",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "summary": "두 사람의 궁합에 대한 전반적인 요약 (3~4문장)",
  "insights": [
    {
      "id": "core_match",
      "category": "핵심 궁합",
      "hook": "두 사람의 근본적인 연결고리",
      "paragraphs": ["문단1", "문단2"]
    },
    {
      "id": "synergy",
      "category": "시너지 효과",
      "hook": "함께할 때 발휘되는 특별한 힘",
      "paragraphs": ["문단1", "문단2"]
    },
    {
      "id": "conflict",
      "category": "갈등과 해결",
      "hook": "서로 다름을 이해하는 방법",
      "paragraphs": ["문단1", "문단2"],
      "advice": "갈등 해결을 위한 구체적인 조언"
    }
  ]
}
`;

  let geminiData: any = null;
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing");
    }
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || '{}';
    geminiData = JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error in analyzeMatch:", error);
    // Fallback data
    geminiData = {
      score: Math.floor(Math.random() * 30) + 70,
      headline: `두 사람의 우주는\n서로를 끌어당기고 있습니다`,
      keywords: ['상호보완', '정신적 교감', '성장'],
      summary: `서로가 부족한 기운을 채워주는 이상적인 ${payload.relationship} 관계입니다. 특히 상대방의 기운이 당신의 에너지를 더욱 긍정적으로 만들어줍니다.`,
      insights: [
        {
          id: 'core_match',
          category: '핵심 궁합',
          hook: '두 사람의 근본적인 연결고리',
          paragraphs: [
            `나의 일간(${myDayStemChar})과 상대방의 일간(${partnerDayStemChar})이 만나 특별한 시너지를 냅니다.`,
            `서로의 다름이 오히려 매력으로 작용하며, 함께 있을 때 심리적 안정감을 느낄 수 있는 좋은 궁합입니다.`
          ]
        },
        {
          id: 'conflict',
          category: '갈등과 해결',
          hook: '서로 다름을 이해하는 방법',
          paragraphs: [
            `가끔 의견 충돌이 발생할 수 있으나, 이는 서로의 성장을 위한 밑거름이 됩니다.`,
            `상대방의 방식을 존중하고 한 발짝 물러서서 배려한다면 더 깊은 관계로 발전할 수 있습니다.`
          ],
          advice: '대화할 때 감정보다는 이성적으로 접근하고, 상대방의 장점을 먼저 칭찬해주세요.'
        }
      ]
    };
  }

  return {
    myChart: {
      time: myTimePillar,
      day: myDayPillar,
      month: myMonthPillar,
      year: myYearPillar
    },
    partnerChart: {
      time: partnerTimePillar,
      day: partnerDayPillar,
      month: partnerMonthPillar,
      year: partnerYearPillar
    },
    score: geminiData?.score || 80,
    headline: geminiData?.headline || `두 사람의 우주는\n서로를 끌어당기고 있습니다`,
    keywords: geminiData?.keywords || ['상호보완', '정신적 교감', '성장'],
    summary: geminiData?.summary || `서로가 부족한 기운을 채워주는 이상적인 ${payload.relationship} 관계입니다.`,
    insights: (geminiData?.insights || []).map((insight: any) => ({
      ...insight,
      isLocked: insight.id !== 'core_match' // Lock everything except the first one
    }))
  };
};

