// Saju Logic Implementation

// 천간(Heavenly Stems) 오행 및 음양
export const GAN_INFO: Record<string, { element: string, yinYang: string }> = {
  '갑': { element: '목', yinYang: '+' },
  '을': { element: '목', yinYang: '-' },
  '병': { element: '화', yinYang: '+' },
  '정': { element: '화', yinYang: '-' },
  '무': { element: '토', yinYang: '+' },
  '기': { element: '토', yinYang: '-' },
  '경': { element: '금', yinYang: '+' },
  '신': { element: '금', yinYang: '-' },
  '임': { element: '수', yinYang: '+' },
  '계': { element: '수', yinYang: '-' },
};

// 지지(Earthly Branches) 오행 및 음양
export const ZHI_INFO: Record<string, { element: string, yinYang: string }> = {
  '자': { element: '수', yinYang: '+' }, // 체양용음 (체는 양이나 쓰임은 음)
  '축': { element: '토', yinYang: '-' },
  '인': { element: '목', yinYang: '+' },
  '묘': { element: '목', yinYang: '-' },
  '진': { element: '토', yinYang: '+' },
  '사': { element: '화', yinYang: '-' }, // 체음용양
  '오': { element: '화', yinYang: '+' }, // 체양용음
  '미': { element: '토', yinYang: '-' },
  '신': { element: '금', yinYang: '+' },
  '유': { element: '금', yinYang: '-' },
  '술': { element: '토', yinYang: '+' },
  '해': { element: '수', yinYang: '-' }, // 체음용양
};

// 오행 상생상극 (생: 1, 극: -1, 비화: 0)
export const ELEMENT_RELATION: Record<string, Record<string, number>> = {
  '목': { '목': 0, '화': 1, '토': -1, '금': -2, '수': 2 }, // 금극목(-2), 수생목(2)
  '화': { '목': 2, '화': 0, '토': 1, '금': -1, '수': -2 },
  '토': { '목': -2, '화': 2, '토': 0, '금': 1, '수': -1 },
  '금': { '목': -1, '화': -2, '토': 2, '금': 0, '수': 1 },
  '수': { '목': 1, '화': -1, '토': -2, '금': 2, '수': 0 },
};

// 십성 계산 (일간 기준)
export const getTenDeity = (dayGan: string, target: string, isGan: boolean): string => {
  if (dayGan === target && isGan) return '비견'; // 일간 자신은 비견으로 처리 안함 (보통 안적음)
  
  const dayInfo = GAN_INFO[dayGan];
  const targetInfo = isGan ? GAN_INFO[target] : ZHI_INFO[target];
  
  if (!dayInfo || !targetInfo) return '';

  const relation = ELEMENT_RELATION[dayInfo.element][targetInfo.element];
  const sameYinYang = dayInfo.yinYang === targetInfo.yinYang;

  if (relation === 0) return sameYinYang ? '비견' : '겁재';
  if (relation === 1) return sameYinYang ? '식신' : '상관';
  if (relation === -1) return sameYinYang ? '편재' : '정재';
  if (relation === -2) return sameYinYang ? '편관' : '정관';
  if (relation === 2) return sameYinYang ? '편인' : '정인';
  
  return '';
};

// 지장간 (Hidden Stems)
export const HIDDEN_STEMS: Record<string, string[]> = {
  '자': ['임', '계'],
  '축': ['계', '신', '기'],
  '인': ['무', '병', '갑'],
  '묘': ['갑', '을'],
  '진': ['을', '계', '무'],
  '사': ['무', '경', '병'],
  '오': ['병', '기', '정'],
  '미': ['정', '을', '기'],
  '신': ['무', '임', '경'],
  '유': ['경', '신'],
  '술': ['신', '정', '무'],
  '해': ['무', '갑', '임'],
};

// 십이운성 (12 Phases) 계산 (일간 기준)
const PHASES = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];
const JANGSAENG_ZHI: Record<string, string> = {
  '갑': '해', '을': '오',
  '병': '인', '정': '유',
  '무': '인', '기': '유',
  '경': '사', '신': '자',
  '임': '신', '계': '묘'
};
const ZHI_ORDER_12 = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

export const getPhase = (dayGan: string, zhi: string): string => {
  const jangsaengZhi = JANGSAENG_ZHI[dayGan];
  if (!jangsaengZhi) return '';
  
  const jangsaengIdx = ZHI_ORDER_12.indexOf(jangsaengZhi);
  const zhiIdx = ZHI_ORDER_12.indexOf(zhi);
  if (jangsaengIdx === -1 || zhiIdx === -1) return '';
  
  const isYin = GAN_INFO[dayGan].yinYang === '-';
  let phaseIdx = isYin ? (jangsaengIdx - zhiIdx + 12) % 12 : (zhiIdx - jangsaengIdx + 12) % 12;
  return PHASES[phaseIdx];
};

// 십이신살 (12 Shensha) 계산 (년지 또는 일지 기준)
const SHENSHA = ['지살', '년살', '월살', '망신살', '장성살', '반안살', '역마살', '육해살', '화개살', '겁살', '재살', '천살'];
const SHENSHA_GROUP: Record<string, number> = {
  '해': 0, '묘': 0, '미': 0, // 해묘미 목국 -> 지살: 해
  '인': 3, '오': 3, '술': 3, // 인오술 화국 -> 지살: 인
  '사': 6, '유': 6, '축': 6, // 사유축 금국 -> 지살: 사
  '신': 9, '자': 9, '진': 9, // 신자진 수국 -> 지살: 신
};
const ZHI_ORDER_SHENSHA = ['해', '자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술'];

export const getTwelveShensha = (baseZhi: string, targetZhi: string): string => {
  const groupStart = SHENSHA_GROUP[baseZhi];
  if (groupStart === undefined) return '';
  
  const targetIdx = ZHI_ORDER_SHENSHA.indexOf(targetZhi);
  const startIdx = ZHI_ORDER_SHENSHA.indexOf(ZHI_ORDER_SHENSHA[groupStart]);
  
  const diff = (targetIdx - startIdx + 12) % 12;
  return SHENSHA[diff];
};

export const MODERN_TEN_DEITY: Record<string, string> = {
  '비견': '나만의 길',
  '겁재': '승부사',
  '식신': '아이디어 뱅크',
  '상관': '천재적 반항아',
  '편재': '기회의 포착',
  '정재': '꼼꼼한 관리자',
  '편관': '브레이크 없는 전차',
  '정관': '나를 지키는 방패',
  '편인': '독창적 사색가',
  '정인': '지혜의 보고',
};

export const getModernTerm = (tenDeity: string): string => {
  return MODERN_TEN_DEITY[tenDeity] || tenDeity;
};

export const STEM_EMOJIS: Record<string, string> = {
  '갑': '🌳', '을': '🌱', '병': '☀️', '정': '🕯️', '무': '⛰️',
  '기': '🏡', '경': '💎', '신': '💍', '임': '🌊', '계': '☔'
};

export const BRANCH_EMOJIS: Record<string, string> = {
  '자': '🐭', '축': '🐮', '인': '🐯', '묘': '🐰', '진': '🐲', '사': '🐍',
  '오': '🐴', '미': '🐑', '신': '🐵', '유': '🐔', '술': '🐶', '해': '🐷'
};

export const calculateElementScores = (stems: string[], zhis: string[], hiddenStems: string[] = [], interactions: string[] = []) => {
  const scores: Record<string, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
  const secondaryScores: Record<string, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
  
  stems.forEach(s => {
    if (GAN_INFO[s]) scores[GAN_INFO[s].element]++;
  });
  
  zhis.forEach(z => {
    if (ZHI_INFO[z]) scores[ZHI_INFO[z].element]++;
  });

  // 지장간 및 합으로 인한 잠재적 기운 계산
  hiddenStems.forEach(s => {
    if (GAN_INFO[s]) secondaryScores[GAN_INFO[s].element] += 0.3;
  });

  interactions.forEach(inter => {
    if (inter.includes('→')) {
      const targetElem = inter.split('→')[1];
      if (scores[targetElem] !== undefined) secondaryScores[targetElem] += 0.5;
    }
  });

  const elementColors: Record<string, string> = {
    '목': '#2E7D32',
    '화': '#FF6B6B',
    '토': '#F57F17',
    '금': '#6A1B9A',
    '수': '#1565C0'
  };

  const elementLabels: Record<string, string> = {
    '목': '성장과 창조',
    '화': '열정과 확산',
    '토': '중심과 중재',
    '금': '결단과 수렴',
    '수': '지혜와 유연'
  };

  const elementDescriptions: Record<string, string> = {
    '목': '새로운 시작과 성장을 의미합니다.',
    '화': '화려함과 열정, 확산하는 힘을 의미합니다.',
    '토': '안정감과 중재, 포용력을 의미합니다.',
    '금': '결실과 결단, 냉철함을 의미합니다.',
    '수': '지혜와 유연함, 깊은 생각을 의미합니다.'
  };

  return Object.keys(scores).map(element => {
    const mainScore = scores[element];
    const secondaryScore = secondaryScores[element];
    const totalScore = mainScore + secondaryScore;
    
    let reason = '';
    if (mainScore === 0 && secondaryScore > 0) {
      reason = '사주 원국에는 없으나 지장간이나 합의 기운으로 인해 잠재적으로 존재합니다.';
    }

    return {
      element,
      score: mainScore,
      secondaryScore,
      totalScore,
      isSecondary: mainScore === 0 && secondaryScore > 0,
      reason,
      color: elementColors[element],
      label: elementLabels[element],
      description: elementDescriptions[element]
    };
  }).sort((a, b) => b.totalScore - a.totalScore);
};

// 기타 신살 및 형충회합 로직
export interface Pillar {
  stem: string;
  zhi: string;
}

export const getPillarInteractions = (pillars: Pillar[]): string[][] => {
  // pillars: [time, day, month, year]
  const interactions: string[][] = [[], [], [], []];
  
  // 천간합
  const ganHap: Record<string, string> = {
    '갑기': '갑기합→토', '기갑': '갑기합→토',
    '을경': '을경합→금', '경을': '을경합→금',
    '병신': '병신합→수', '신병': '병신합→수',
    '정임': '정임합→목', '임정': '정임합→목',
    '무계': '무계합→화', '계무': '무계합→화',
  };
  
  // 천간충
  const ganChung: Record<string, string> = {
    '갑경': '갑경충', '경갑': '갑경충',
    '을신': '을신충', '신을': '을신충',
    '병임': '병임충', '임병': '병임충',
    '정계': '정계충', '계정': '정계충',
  };

  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      if (pillars[i].stem === '?' || pillars[j].stem === '?') continue;
      const g1 = pillars[i].stem;
      const g2 = pillars[j].stem;
      const hap = ganHap[g1 + g2];
      if (hap) {
        interactions[i].push(hap);
        interactions[j].push(hap);
      }
      const chung = ganChung[g1 + g2];
      if (chung) {
        interactions[i].push(chung);
        interactions[j].push(chung);
      }
    }
  }

  // 지지 상호작용
  const zhiHap: Record<string, string> = {
    '자축': '자축합', '축자': '자축합',
    '인해': '인해합', '해인': '인해합',
    '묘술': '묘술합', '술묘': '묘술합',
    '진유': '진유합', '유진': '진유합',
    '사신': '사신합', '신사': '사신합',
    '오미': '오미합', '미오': '오미합',
  };

  const zhiChung: Record<string, string> = {
    '자오': '자오충', '오자': '자오충',
    '축미': '축미충', '미축': '축미충',
    '인신': '인신충', '신인': '인신충',
    '묘유': '묘유충', '유묘': '묘유충',
    '진술': '진술충', '술진': '진술충',
    '사해': '사해충', '해사': '사해충',
  };

  const zhiWonjin: Record<string, string> = {
    '자미': '자미원진', '미자': '자미원진',
    '축오': '축오원진', '오축': '축오원진',
    '인유': '인유원진', '유인': '인유원진',
    '묘신': '묘신원진', '신묘': '묘신원진',
    '진해': '진해원진', '해진': '진해원진',
    '사술': '사술원진', '술사': '사술원진',
  };

  const zhiGuimun: Record<string, string> = {
    '자유': '자유귀문', '유자': '자유귀문',
    '축오': '축오귀문', '오축': '축오귀문',
    '인미': '인미귀문', '미인': '인미귀문',
    '묘신': '묘신귀문', '신묘': '묘신귀문',
    '진해': '진해귀문', '해진': '진해귀문',
    '사술': '사술귀문', '술사': '사술귀문',
  };

  const zhiHae: Record<string, string> = {
    '자미': '자미해', '미자': '자미해',
    '축오': '축오해', '오축': '축오해',
    '인사': '인사해', '사인': '인사해',
    '묘진': '묘진해', '진묘': '묘진해',
    '신해': '신해해', '해신': '신해해',
    '유술': '유술해', '술유': '유술해',
  };

  const zhiHyeong: Record<string, string> = {
    '인사': '인사형', '사인': '인사형',
    '사신': '사신형', '신사': '사신형',
    '인신': '인신형', '신인': '인신형',
    '축술': '축술형', '술축': '축술형',
    '술미': '술미형', '미술': '술미형',
    '축미': '축미형', '미축': '축미형',
    '자묘': '자묘형', '묘자': '자묘형',
    '진진': '진진자형', '오오': '오오자형', '유유': '유유자형', '해해': '해해자형'
  };

  // 삼합 / 반합
  const samhapGroups = [
    { name: '해묘미', chars: ['해', '묘', '미'], elem: '목' },
    { name: '인오술', chars: ['인', '오', '술'], elem: '화' },
    { name: '사유축', chars: ['사', '유', '축'], elem: '금' },
    { name: '신자진', chars: ['신', '자', '진'], elem: '수' },
  ];

  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      if (pillars[i].zhi === '?' || pillars[j].zhi === '?') continue;
      const z1 = pillars[i].zhi;
      const z2 = pillars[j].zhi;
      
      if (zhiHap[z1 + z2]) { interactions[i].push(zhiHap[z1 + z2]); interactions[j].push(zhiHap[z1 + z2]); }
      if (zhiChung[z1 + z2]) { interactions[i].push(zhiChung[z1 + z2]); interactions[j].push(zhiChung[z1 + z2]); }
      if (zhiWonjin[z1 + z2]) { interactions[i].push(zhiWonjin[z1 + z2]); interactions[j].push(zhiWonjin[z1 + z2]); }
      if (zhiGuimun[z1 + z2] && !zhiWonjin[z1 + z2]) { interactions[i].push(zhiGuimun[z1 + z2]); interactions[j].push(zhiGuimun[z1 + z2]); }
      if (zhiHae[z1 + z2] && !zhiWonjin[z1 + z2]) { interactions[i].push(zhiHae[z1 + z2]); interactions[j].push(zhiHae[z1 + z2]); }
      if (zhiHyeong[z1 + z2]) { interactions[i].push(zhiHyeong[z1 + z2]); interactions[j].push(zhiHyeong[z1 + z2]); }

      // 반합 확인
      for (const group of samhapGroups) {
        if (group.chars.includes(z1) && group.chars.includes(z2)) {
          const wangji = group.chars[1];
          if (z1 === wangji || z2 === wangji) {
            const name = `${z1}${z2}반합`;
            interactions[i].push(name);
            interactions[j].push(name);
          }
        }
      }
    }
  }

  // 삼합 전체 확인
  const allZhis = pillars.map(p => p.zhi);
  for (const group of samhapGroups) {
    if (group.chars.every(c => allZhis.includes(c))) {
      for (let i = 0; i < 4; i++) {
        if (group.chars.includes(allZhis[i])) {
          interactions[i].push(`${group.name}삼합`);
        }
      }
    }
  }

  // 중복 제거
  return interactions.map(arr => Array.from(new Set(arr)));
};

export const getOtherShensha = (dayGan: string, zhi: string, stem: string): string[] => {
  const shensha: string[] = [];
  if (zhi === '?' || stem === '?') return shensha;
  
  // 천을귀인
  if (dayGan === '갑' || dayGan === '무' || dayGan === '경') {
    if (zhi === '축' || zhi === '미') shensha.push('천을귀인');
  }
  if (dayGan === '을' || dayGan === '기') {
    if (zhi === '자' || zhi === '신') shensha.push('천을귀인');
  }
  if (dayGan === '병' || dayGan === '정') {
    if (zhi === '해' || zhi === '유') shensha.push('천을귀인');
  }
  if (dayGan === '신') {
    if (zhi === '인' || zhi === '오') shensha.push('천을귀인');
  }
  if (dayGan === '임' || dayGan === '계') {
    if (zhi === '묘' || zhi === '사') shensha.push('천을귀인');
  }

  // 태극귀인
  if (dayGan === '갑' || dayGan === '을') {
    if (zhi === '자' || zhi === '오') shensha.push('태극귀인');
  }
  if (dayGan === '병' || dayGan === '정') {
    if (zhi === '묘' || zhi === '유') shensha.push('태극귀인');
  }
  if (dayGan === '무' || dayGan === '기') {
    if (zhi === '진' || zhi === '술' || zhi === '축' || zhi === '미') shensha.push('태극귀인');
  }
  if (dayGan === '경' || dayGan === '신') {
    if (zhi === '인' || zhi === '해') shensha.push('태극귀인');
  }
  if (dayGan === '임' || dayGan === '계') {
    if (zhi === '사' || zhi === '신') shensha.push('태극귀인');
  }

  // 현침살
  if (['갑', '신'].includes(stem) || ['묘', '오', '미', '신'].includes(zhi)) {
    shensha.push('현침살');
  }

  const pillar = stem + zhi;
  
  // 백호대살
  if (['갑진', '을미', '병술', '정축', '무진', '임술', '계축'].includes(pillar)) {
    shensha.push('백호대살');
  }
  
  // 괴강살
  if (['경진', '경술', '임진', '임술', '무술'].includes(pillar)) {
    shensha.push('괴강살');
  }

  // 나체도화
  if (['갑자', '경오', '정묘', '계유'].includes(pillar)) {
    shensha.push('나체도화');
  }

  // 효신살
  if (['갑자', '을해', '병인', '정묘', '무오', '기사', '경진', '경술', '신미', '신축', '임신', '계유'].includes(pillar)) {
    shensha.push('효신살');
  }

  // 간여지동
  if (['갑인', '을묘', '병오', '정사', '무진', '무술', '기축', '기미', '경신', '신유', '임자', '계해'].includes(pillar)) {
    shensha.push('간여지동');
  }

  // 곡각살
  if (['을', '기'].includes(stem) || ['사', '축'].includes(zhi)) {
    shensha.push('곡각살');
  }

  // 복성귀인
  const bokseong: Record<string, string> = { '갑': '인', '을': '축', '병': '자', '정': '유', '무': '신', '기': '미', '경': '오', '신': '사', '임': '진', '계': '묘' };
  if (bokseong[dayGan] === zhi) {
    shensha.push('복성귀인');
  }

  // 재고귀인
  if (['갑진', '을미', '병술', '정축', '무진', '기축', '경술', '신미', '임술', '계축'].includes(pillar)) {
    shensha.push('재고귀인');
  }

  // 탕화살
  if (dayGan === '인' && ['인', '사', '신'].includes(zhi)) shensha.push('탕화살');
  if (dayGan === '오' && ['오', '진', '축'].includes(zhi)) shensha.push('탕화살');
  if (dayGan === '축' && ['축', '술', '미'].includes(zhi)) shensha.push('탕화살');

  // 육수
  if (['병오', '정미', '무자', '기축', '무오', '기미'].includes(pillar)) {
    shensha.push('육수');
  }

  // 남연살 / 여연살
  if (['갑인', '을묘', '병오', '정사', '무진', '무술', '기축', '기미', '경신', '신유', '임자', '계해'].includes(pillar)) {
    shensha.push('남연살');
  }
  if (['갑신', '을유', '병자', '정해', '무인', '기묘', '경오', '신사', '임술', '계미'].includes(pillar)) {
    shensha.push('여연살');
  }

  // 구추방해
  if (['임자', '임오', '무자', '무오', '기묘', '기유', '을묘', '을유', '신묘', '신유'].includes(pillar)) {
    shensha.push('구추방해');
  }

  return Array.from(new Set(shensha));
};
