import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Info, Sparkles, X, BookOpen, User, Heart, Briefcase, Lock, Bell, CheckCircle2, CreditCard, Share2, Home, Users, Calendar, UserCircle, Coins, Gift, MessageCircle, Link as LinkIcon, Download, Activity, Compass, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeSaju, getHanjaDetail, getTermDetail, callGeminiSajuOverallStream, callGeminiSajuDetails } from './api/saju';
import { SajuFormPayload, SajuResultData, SavedProfile, MatchFormPayload, MatchResultData } from './types/saju';
import { SajuStoryteller } from './components/SajuVisuals';
import { LoadingScreen } from './components/LoadingScreen';
import { UniverseLogo } from './components/UniverseLogo';
import { Logo } from './components/Logo';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from './lib/supabase';

const TERM_DESCRIPTIONS: Record<string, string> = {
  // 십이운성
  '장생': '새로운 시작, 후원, 순수함',
  '목욕': '도화, 호기심, 불안정, 매력',
  '관대': '성장, 고집, 제복, 발전',
  '건록': '독립, 자수성가, 안정, 실행력',
  '제왕': '최고조, 권력, 고집, 리더십',
  '쇠': '노련함, 쇠퇴, 타협, 안정',
  '병': '역마, 동정심, 예민함, 이동',
  '사': '사색, 정신적, 집중력, 정지',
  '묘': '저장, 수집, 구두쇠, 안정',
  '절': '단절, 전환, 불안정, 새로운 시작',
  '태': '잉태, 가능성, 불안, 의존',
  '양': '양육, 상속, 평화, 준비',
  
  // 신살
  '천을귀인': '최고의 길성, 위기에서 돕는 귀인',
  '태극귀인': '시작과 끝을 맺는 힘, 예상치 못한 행운',
  '현침살': '예리함, 분석력, 의약/기술 분야 적성',
  '백호대살': '강한 에너지, 프로페셔널, 폭발력',
  '괴강살': '강력한 리더십, 총명함, 극단적 에너지',
  '나체도화': '숨길 수 없는 매력, 시선 집중',
  '효신살': '어머니와의 인연, 외로움, 자수성가',
  '간여지동': '강한 주관, 고집, 배우자 자리의 불안정',
  '곡각살': '수족 이상 주의, 타인을 돕는 활인업 적성',
  '복성귀인': '타고난 복록, 평생 의식주 걱정 없음',
  '재고귀인': '재물을 모으는 창고, 부자 사주',
  '탕화살': '감정의 기복, 화상/중독 주의',
  '육수': '예리한 직관, 재치, 성급함',
  '남연살': '이성에게 인기가 많음',
  '여연살': '이성에게 인기가 많음',
  '구추방해': '아홉 가지 험난함, 잦은 이동과 변화',
  '년살': '도화살, 인기, 매력, 시선 집중',
  '월살': '고갈, 정체, 종교/철학적 관심',
  '망신살': '망신, 노출, 프로페셔널한 자기 PR',
  '장성살': '중심, 권위, 리더십, 주도권',
  '반안살': '안정, 출세, 말안장, 편안함',
  '역마살': '이동, 변화, 글로벌, 활동성',
  '육해살': '여섯 가지 해로움, 직관력, 예민함',
  '화개살': '예술성, 종교, 화려함을 덮음, 명예',
  '겁살': '빼앗김, 강제성, 결단력, 프로',
  '재살': '수옥살, 갇힘, 두뇌 회전, 꾀',
  '천살': '하늘의 뜻, 불가항력, 이상주의',
  '지살': '새로운 시작, 이동, 자발적 변화',
};

const getTermDescription = (term: string) => {
  if (!term || term === '-') return '';
  const cleanTerm = term.trim();

  if (SAJU_TERMS[cleanTerm]) return SAJU_TERMS[cleanTerm].desc;
  if (TERM_DESCRIPTIONS[cleanTerm]) return TERM_DESCRIPTIONS[cleanTerm];
  
  // Handle Gan-Zhi terms like "기축일주", "임인년", "갑자"
  const ganziMatch = cleanTerm.match(/^([갑을병정무기경신임계])([자축인묘진사오미신유술해])(일주|월주|시주|년주|년|월|일|시)?/);
  if (ganziMatch) {
    const gan = ganziMatch[1];
    const zhi = ganziMatch[2];
    const suffix = ganziMatch[3] || '';
    
    const ganMap: Record<string, string> = {
      '갑': '나무(木)', '을': '나무(木)',
      '병': '불(火)', '정': '불(火)',
      '무': '흙(土)', '기': '흙(土)',
      '경': '쇠(金)', '신': '쇠(金)',
      '임': '물(水)', '계': '물(水)'
    };
    const zhiMap: Record<string, string> = {
      '자': '물(水)', '축': '흙(土)', '인': '나무(木)', '묘': '나무(木)',
      '진': '흙(土)', '사': '불(火)', '오': '불(火)', '미': '흙(土)',
      '신': '쇠(金)', '유': '쇠(金)', '술': '흙(土)', '해': '물(水)'
    };

    let desc = `천간 '${gan}'(${ganMap[gan]})와(과) 지지 '${zhi}'(${zhiMap[zhi]})가 결합된 기운입니다.`;
    if (suffix.includes('주')) {
      desc = `${gan}${zhi} 기운을 가진 ${suffix}를 의미합니다. ${desc}`;
    }
    return desc;
  }
  
  if (cleanTerm.includes('비견')) return '나와 같은 기운. 독립심, 주관, 경쟁심을 의미합니다.';
  if (cleanTerm.includes('겁재')) return '나의 재물을 빼앗는 기운. 승부욕, 투쟁심, 강한 고집을 의미합니다.';
  if (cleanTerm.includes('식신')) return '내가 생하는 기운. 창의성, 표현력, 의식주, 낙천성을 의미합니다.';
  if (cleanTerm.includes('상관')) return '관을 상하게 하는 기운. 뛰어난 언변, 반항심, 혁신, 예술성을 의미합니다.';
  if (cleanTerm.includes('편재')) return '치우친 재물. 통 큰 재물, 사업성, 공간지각력, 유흥을 의미합니다.';
  if (cleanTerm.includes('정재')) return '바른 재물. 안정적인 수입, 꼼꼼함, 현실감각, 절약 정신을 의미합니다.';
  if (cleanTerm.includes('편관')) return '나를 극하는 치우친 기운. 명예욕, 카리스마, 인내심, 스트레스를 의미합니다.';
  if (cleanTerm.includes('정관')) return '나를 극하는 바른 기운. 원칙, 책임감, 보수성, 안정된 직장을 의미합니다.';
  if (cleanTerm.includes('편인')) return '치우친 학문. 직관력, 신비주의, 외로움, 눈치를 의미합니다.';
  if (cleanTerm.includes('정인')) return '바른 학문. 수용성, 도덕성, 어머니의 사랑, 학문적 성취를 의미합니다.';
  if (cleanTerm.includes('충')) return '서로 부딪히고 깨지는 기운으로, 변화와 이동을 의미합니다.';
  if (cleanTerm.includes('합')) return '서로 끌어당기고 합쳐지는 기운으로, 결속과 다정함을 의미합니다.';
  if (cleanTerm.includes('원진')) return '서로 미워하고 원망하는 기운으로, 갈등과 오해를 의미합니다.';
  if (cleanTerm.includes('귀문')) return '예민하고 직관력이 뛰어나며, 감정 기복이 있을 수 있는 기운입니다.';
  if (cleanTerm.includes('형')) return '조정하고 깎아내는 기운으로, 관재구설이나 수술, 권력기관과 연관됩니다.';
  if (cleanTerm.includes('해')) return '서로 방해하고 해를 끼치는 기운입니다.';
  
  const singleChar = cleanTerm[0];
  if (['갑', '을', '인', '묘'].includes(singleChar)) return '나무(木)의 기운. 성장, 의욕, 시작을 의미합니다.';
  if (['병', '정', '사', '오'].includes(singleChar)) return '불(火)의 기운. 열정, 확산, 예의를 의미합니다.';
  if (['무', '기', '진', '술', '축', '미'].includes(singleChar)) return '흙(土)의 기운. 포용력, 중재, 신용을 의미합니다.';
  if (['경', '신', '유'].includes(singleChar)) return '쇠(金)의 기운. 결단력, 의리, 숙살지기를 의미합니다.';
  if (['임', '계', '해', '자'].includes(singleChar)) return '물(水)의 기운. 지혜, 유연성, 휴식을 의미합니다.';
  
  return '';
};

const TermWithTooltip = ({ term, type, onClick, disableHover }: { term: string, type?: 'phase' | 'shensha' | 'interaction', onClick?: () => void, disableHover?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const displayDesc = getTermDescription(term);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpen = () => {
    if (disableHover) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (disableHover) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="relative inline-block w-full text-center" 
      onMouseEnter={handleOpen} 
      onMouseLeave={handleClose}
      onTouchStart={handleOpen}
      onTouchEnd={() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setIsOpen(false), 3000);
      }}
      onClick={(e) => { 
        if (disableHover) {
          e.stopPropagation();
          if (onClick) onClick();
        } else {
          setIsOpen(!isOpen); 
          if (onClick) onClick();
        }
      }}>
      <span className={`cursor-pointer ${!disableHover ? 'hover:underline decoration-dashed underline-offset-2' : ''} ${type === 'shensha' ? 'text-[var(--primary)]' : type === 'phase' ? 'text-[var(--text-main)] font-bold' : 'text-[var(--text-secondary)]'}`}>
        {term}
      </span>
      {!disableHover && isOpen && displayDesc && (
        <div 
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[var(--text-main)] text-[var(--bg-main)] text-xs p-2 rounded-lg shadow-lg pointer-events-auto"
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
        >
          <div className="font-bold mb-1">{term}</div>
          <div className="text-[var(--bg-muted)]">{displayDesc}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--text-main)]"></div>
        </div>
      )}
    </div>
  );
};

const TermDetailModal = ({ 
  isOpen, 
  onClose, 
  term, 
  pillarType, 
  detail, 
  isLoading 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  term: string; 
  pillarType: string; 
  detail: { meaning: string; positionMeaning: string; overall: string } | null;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[var(--bg-card)] w-full max-w-[400px] max-h-[80vh] rounded-[24px] overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 pb-4 border-b border-[var(--border-main)] shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-[var(--bg-input)] rounded-2xl flex items-center justify-center text-[18px] font-bold text-[var(--text-main)] border border-[var(--border-main)]">
                {term.slice(0, 2)}
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-[var(--text-main)]">{term}</h3>
                <p className="text-[13px] text-[var(--primary)] font-medium">{pillarType}의 기운</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[var(--bg-muted)] rounded-full transition-colors">
              <X className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
          </div>
        </div>

        <div className="p-6 pt-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-5">
            <section>
              <h4 className="text-[14px] font-bold text-[var(--text-main)] mb-2 flex items-center gap-1.5">
                <div className="w-1 h-4 bg-[var(--primary)] rounded-full"></div>
                용어(한자) 및 뜻
              </h4>
              <div className="bg-[var(--bg-input)] p-4 rounded-xl text-[14px] text-[var(--text-secondary)] leading-relaxed">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Sparkles className="w-4 h-4 animate-spin" /> 분석 중...
                  </div>
                ) : detail?.meaning}
              </div>
            </section>

            <section>
              <h4 className="text-[14px] font-bold text-[var(--text-main)] mb-2 flex items-center gap-1.5">
                <div className="w-1 h-4 bg-[#4ECDC4] dark:bg-[#81E6D9] rounded-full"></div>
                {pillarType}에 있을 때의 의미
              </h4>
              <div className="bg-[#E3F9F6]/30 dark:bg-[#4ECDC4]/10 p-4 rounded-xl text-[14px] text-[var(--text-secondary)] leading-relaxed">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Sparkles className="w-4 h-4 animate-spin" /> 분석 중...
                  </div>
                ) : detail?.positionMeaning}
              </div>
            </section>

            <section>
              <h4 className="text-[14px] font-bold text-[var(--text-main)] mb-2 flex items-center gap-1.5">
                <div className="w-1 h-4 bg-[#FFC078] dark:bg-[#FFD8A8] rounded-full"></div>
                전체 사주에서의 적용
              </h4>
              <div className="bg-[#FFF4E6]/50 dark:bg-[#FFC078]/10 p-4 rounded-xl text-[14px] text-[var(--text-secondary)] leading-relaxed">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Sparkles className="w-4 h-4 animate-spin" /> 분석 중...
                  </div>
                ) : detail?.overall}
              </div>
            </section>
          </div>

          <div className="mt-8 shrink-0">
            <button 
              onClick={onClose}
              className="w-full py-4 bg-[var(--text-main)] text-[var(--bg-main)] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity"
            >
              확인했습니다
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const HanjaDetailModal = ({ 
  isOpen, 
  onClose, 
  hanja, 
  name, 
  pillarType, 
  detail, 
  isLoading 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  hanja: string; 
  name: string; 
  pillarType: string; 
  detail: { meaning: string; jijanggan: string; overall: string } | null;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[var(--bg-card)] w-full max-w-[400px] max-h-[80vh] rounded-[24px] overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 pb-4 border-b border-[var(--border-main)] shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-[var(--bg-input)] rounded-2xl flex items-center justify-center text-[28px] font-bold text-[var(--text-main)] border border-[var(--border-main)]">
                {hanja}
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-[var(--text-main)]">{name} ({hanja})</h3>
                <p className="text-[13px] text-[var(--primary)] font-medium">{pillarType}의 기운</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[var(--bg-muted)] rounded-full transition-colors">
              <X className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
          </div>
        </div>

        <div className="p-6 pt-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-5">
            <section>
              <h4 className="text-[14px] font-bold text-[var(--text-main)] mb-2 flex items-center gap-1.5">
                <div className="w-1 h-4 bg-[var(--primary)] rounded-full"></div>
                한자의 의미
              </h4>
              <div className="bg-[var(--bg-input)] p-4 rounded-xl text-[14px] text-[var(--text-secondary)] leading-relaxed">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Sparkles className="w-4 h-4 animate-spin" /> 분석 중...
                  </div>
                ) : detail?.meaning}
              </div>
            </section>

            <section>
              <h4 className="text-[14px] font-bold text-[var(--text-main)] mb-2 flex items-center gap-1.5">
                <div className="w-1 h-4 bg-[#4ECDC4] dark:bg-[#81E6D9] rounded-full"></div>
                지장간에서의 작용
              </h4>
              <div className="bg-[var(--bg-input)] p-4 rounded-xl text-[14px] text-[var(--text-secondary)] leading-relaxed">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Sparkles className="w-4 h-4 animate-spin" /> 분석 중...
                  </div>
                ) : detail?.jijanggan}
              </div>
            </section>

            <section>
              <h4 className="text-[14px] font-bold text-[var(--text-main)] mb-2 flex items-center gap-1.5">
                <div className="w-1 h-4 bg-[#6366F1] dark:bg-[#818CF8] rounded-full"></div>
                전체 사주에서의 해석
              </h4>
              <div className="bg-[var(--bg-input)] p-4 rounded-xl text-[14px] text-[var(--text-secondary)] leading-relaxed">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Sparkles className="w-4 h-4 animate-spin" /> 분석 중...
                  </div>
                ) : detail?.overall}
              </div>
            </section>
          </div>

          <div className="mt-8 shrink-0">
            <button 
              onClick={onClose}
              className="w-full py-4 bg-[var(--text-main)] text-[var(--bg-main)] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity"
            >
              확인했습니다
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const PrescriptionCard = ({ result, userName }: { result: SajuResultData, userName: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { 
        scale: 2,
        backgroundColor: 'var(--bg-card)',
        useCORS: true,
        logging: false
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${userName}님의_행운처방전.png`;
      link.href = url;
      link.click();
    } catch (err) {
      console.error('Failed to save image', err);
      alert('이미지 저장에 실패했습니다.');
    }
  };

  return (
    <>
      <div className="mt-8 mb-4">
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full py-[16px] bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[var(--primary)] rounded-[12px] text-[16px] font-bold transition-transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          나만의 맞춤 개운법 카드보기
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div 
            className="relative w-full max-w-[340px] bg-[var(--bg-card)] rounded-[16px] shadow-2xl overflow-hidden" 
            onClick={e => e.stopPropagation()}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center bg-black/5 dark:bg-white/10 rounded-full text-[var(--text-secondary)] dark:text-[var(--text-main)] hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* The Card */}
            <div ref={cardRef} className="p-[32px] relative rounded-t-[16px]" style={{
              backgroundColor: 'var(--bg-card)',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
            }}>
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-2" style={{ background: 'linear-gradient(to right, #8B0000, #D4AF37, #8B0000)' }}></div>
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[60px]" style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)' }}></div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full blur-[60px]" style={{ backgroundColor: 'rgba(139, 0, 0, 0.1)' }}></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: 'var(--primary)' }}>MYUNG-UN SAJU</div>
                    <h4 className="text-[22px] font-bold leading-tight font-serif" style={{ color: 'var(--text-main)' }}>
                      {userName}님을 위한<br/>
                      <span style={{ color: 'var(--primary)' }}>행운의 처방전</span>
                    </h4>
                  </div>
                  
                  {/* Lucky Items Top Right */}
                  <div className="text-right p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-main)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                    <div className="text-[10px] font-bold mb-1.5" style={{ color: 'var(--primary)' }}>행운의 요소</div>
                    <div className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>숫자: {result.luckyItems?.number || '3, 8'}</div>
                    <div className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>컬러: {result.luckyItems?.color || '푸른색'}</div>
                    <div className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>방향: {result.luckyItems?.direction || '동쪽'}</div>
                  </div>
                </div>
                
                <div className="rounded-[12px] p-[24px] border mt-4 relative" style={{ backgroundColor: 'var(--bg-card)', backdropFilter: 'blur(4px)', borderColor: 'var(--border-main)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                  {/* Traditional corner ornaments */}
                  <div className="absolute top-2 left-2 w-2 h-2 border-t border-l" style={{ borderColor: '#D4AF37' }}></div>
                  <div className="absolute top-2 right-2 w-2 h-2 border-t border-r" style={{ borderColor: '#D4AF37' }}></div>
                  <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l" style={{ borderColor: '#D4AF37' }}></div>
                  <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r" style={{ borderColor: '#D4AF37' }}></div>

                  <div className="mb-5">
                    <div className="text-[12px] font-bold mb-1.5" style={{ color: 'var(--primary)' }}>필요한 에너지</div>
                    <div className="text-[16px] font-bold" style={{ color: 'var(--text-main)' }}>
                      {result.prescription.missingElements.length > 0 
                        ? result.prescription.missingElements.join(', ') + ' 기운'
                        : '현재 조화로움'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[12px] font-bold mb-1.5" style={{ color: 'var(--primary)' }}>실천 가이드</div>
                    <div className="text-[14px] leading-relaxed font-serif" style={{ color: 'var(--text-secondary)' }}>
                      {result.prescription.advice}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center text-[11px] tracking-widest font-serif" style={{ color: 'var(--primary)' }}>
                  인사주(inSaju) - 당신의 길을 밝히다
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="p-4 bg-[var(--bg-muted)] border-t border-[var(--border-main)]">
              <button 
                onClick={handleDownload}
                className="w-full py-[14px] bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--bg-main)] rounded-[8px] text-[15px] font-bold transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4" />
                이미지로 저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
const SAJU_TERMS: Record<string, { title: string; desc: string; detail: string; advice: string }> = {
  '태극귀인': {
    title: '태극귀인 (太極貴人)',
    desc: '시작과 끝을 의미하며, 어떤 일을 하든 결국 큰 성과를 거두고 타인의 도움을 받아 부귀영화를 누릴 수 있는 아주 좋은 길성(행운의 별)입니다.',
    detail: '태극(太極)은 우주의 근원, 즉 만물의 시작과 끝을 의미합니다. 사주에 태극귀인이 있으면 초년에는 다소 고생할 수 있으나, 중년 이후부터는 뜻밖의 귀인을 만나거나 자신의 노력이 크게 빛을 발하여 부귀영화를 누리게 됩니다. 특히 타인의 도움을 끌어당기는 힘이 강해 "인덕이 있다"는 소리를 자주 듣게 됩니다.',
    advice: '당장 성과가 보이지 않더라도 포기하지 마세요. 당신의 노력은 반드시 누군가 지켜보고 있으며, 결정적인 순간에 큰 도움으로 돌아올 것입니다.'
  },
  '천을귀인': {
    title: '천을귀인 (天乙貴人)',
    desc: '모든 흉살을 길하게 변화시키는 최고의 귀인입니다. 위기 상황에서 반드시 돕는 손길이 나타납니다.',
    detail: '사주에서 가장 좋은 길성으로 꼽힙니다. 천을귀인이 있으면 총명하고 지혜로우며, 어려운 일에 처해도 뜻밖의 귀인이 나타나 도움을 줍니다. 인덕이 많고 흉한 기운을 막아주는 강력한 수호천사와 같습니다.',
    advice: '주변 사람들에게 베푸는 마음을 가지세요. 당신이 베푼 호의가 결국 당신을 돕는 귀인으로 돌아옵니다.'
  },
  '나체도화': {
    title: '나체도화 (裸體桃花)',
    desc: '일반적인 도화살보다 더 강한 매력을 뜻합니다. 숨기려 해도 드러나는 치명적인 매력으로 사람을 끌어당기지만, 구설수에 오를 수 있어 관리가 필요한 기운입니다.',
    detail: '나체(裸體)라는 말처럼 꾸미지 않아도 본연의 매력이 강하게 발산되는 기운입니다. 연예인, 인플루언서, 영업직 등 사람의 마음을 사로잡아야 하는 직업에서 엄청난 무기가 됩니다. 하지만 의도치 않게 이성의 오해를 사거나 구설수에 오르기 쉽고, 에너지를 빼앗는 사람(소위 "똥파리")이 꼬일 확률도 높습니다.',
    advice: '모든 사람에게 친절할 필요는 없습니다. 맺고 끊음을 확실히 하고, 당신의 매력을 질투하는 사람들의 시선을 너무 의식하지 마세요.'
  },
  '현침살': {
    title: '현침살 (懸針煞)',
    desc: '바늘이나 칼처럼 뾰족하고 예리한 기운입니다. 통찰력이 뛰어나고 손재주가 좋으나, 말이 날카로울 수 있습니다.',
    detail: '글자의 모양이 바늘처럼 뾰족한 것에서 유래했습니다. 의사, 간호사, 타투이스트, 미용, IT 개발자, 분석가 등 정교하고 예리한 직업에 아주 유리합니다. 남들이 보지 못하는 디테일을 캐치하는 능력이 탁월합니다. 다만, 성격이 예민하고 팩트폭력으로 타인에게 상처를 줄 수 있습니다.',
    advice: '당신의 예리한 통찰력을 사람을 찌르는 데 쓰지 말고, 문제를 해결하고 사람을 살리는 직업적 무기로 활용하세요.'
  },
  '백호대살': {
    title: '백호대살 (白虎大煞)',
    desc: '호랑이처럼 강렬하고 폭발적인 에너지를 의미합니다. 과거에는 흉살로 보았으나, 현대에는 큰 성공을 거두는 강력한 카리스마로 해석됩니다.',
    detail: '에너지가 매우 강해 평소에는 얌전하다가도 한 번 화가 나면 무섭게 돌변합니다. 독립심과 추진력이 엄청나서 리더, 사업가, 정치인, 스포츠 선수 등에서 큰 두각을 나타냅니다. 다만 감정 기복이 심하고 욱하는 성질이 있어 관재구설이나 사고를 조심해야 합니다.',
    advice: '넘치는 에너지를 운동이나 일적인 성취로 발산하세요. 감정이 격해질 때는 심호흡을 하고 한 템포 쉬어가는 여유가 필요합니다.'
  },
  '괴강살': {
    title: '괴강살 (魁罡煞)',
    desc: '우두머리의 기운으로, 총명하고 결단력이 뛰어나며 카리스마가 넘치는 별입니다.',
    detail: '백호대살과 비슷하게 강한 에너지를 가졌지만, 괴강살은 좀 더 지적이고 권력 지향적인 성향이 강합니다. 결단력과 통솔력이 뛰어나 조직의 리더가 되기에 적합합니다. 고집이 세고 타인의 지시를 받는 것을 싫어해 마찰이 생길 수 있습니다.',
    advice: '당신의 강한 리더십을 부드러운 카리스마로 승화시키세요. 타인의 의견을 경청하는 자세를 가지면 더 큰 존경을 받을 수 있습니다.'
  },
  '효신살': {
    title: '효신살 (梟神煞)',
    desc: '올빼미를 의미하며, 어머니와의 인연이 각별하거나 반대로 갈등이 있을 수 있는 기운입니다.',
    detail: '눈치가 빠르고 직관력이 뛰어나며 다방면에 재주가 많습니다. 하지만 외로움을 잘 타고 변덕이 심한 면이 있습니다. 특히 어머니의 간섭이 심하거나, 반대로 어머니와 일찍 떨어져 지내는 등 모친과의 관계에서 특징적인 모습이 나타납니다.',
    advice: '타인의 시선에 너무 예민하게 반응하지 마세요. 독립심을 기르고 자신만의 확고한 주관을 가지는 것이 중요합니다.'
  },
  '간여지동': {
    title: '간여지동 (干與支同)',
    desc: '천간과 지지가 같은 오행으로 이루어져 있어, 자아와 주관이 매우 뚜렷하고 고집이 센 기운입니다.',
    detail: '위아래가 같은 기운으로 뭉쳐 있어 겉과 속이 같고 줏대가 있습니다. 한번 결심한 일은 끝까지 밀고 나가는 추진력이 엄청납니다. 하지만 타인의 조언을 잘 듣지 않고 자기주장만 내세우다 배우자나 동업자와 갈등을 겪기 쉽습니다.',
    advice: '가끔은 지는 것이 이기는 것입니다. 내 고집을 꺾고 상대방의 의견을 수용하는 유연함을 기르세요.'
  },
  '곡각살': {
    title: '곡각살 (曲脚煞)',
    desc: '뼈나 관절이 굽거나 다칠 수 있다는 의미를 가진 살입니다. 현대에는 남을 돕는 활인업(의료, 복지 등)에 종사하면 액운을 막을 수 있다고 봅니다.',
    detail: '신체적으로 뼈, 관절, 신경계 질환에 취약할 수 있으니 평소 바른 자세와 건강 관리가 필요합니다. 타인에 대한 동정심이 많고 베풀기를 좋아합니다. 남을 돕고 살리는 직업을 가지면 흉한 기운이 오히려 큰 덕으로 돌아옵니다.',
    advice: '평소 스트레칭과 운동을 꾸준히 하세요. 그리고 주변의 어려운 사람들에게 작은 도움이라도 베푸는 삶을 실천해보세요.'
  },
  '복성귀인': {
    title: '복성귀인 (福星貴人)',
    desc: '평생 복록이 따르고 부귀장수한다는 매우 좋은 길성입니다.',
    detail: '뜻밖의 행운이 자주 따르고, 어려운 일에 처해도 귀인의 도움으로 쉽게 벗어납니다. 성품이 온화하고 베풀기를 좋아해 주변에 사람이 많습니다. 특히 재물운과 식복이 타고나 평생 경제적인 어려움을 크게 겪지 않습니다.',
    advice: '당신이 가진 긍정적인 에너지와 복을 주변 사람들과 나누세요. 나눌수록 더 큰 행운이 찾아옵니다.'
  },
  '재고귀인': {
    title: '재고귀인 (財庫貴人)',
    desc: '재물을 창고에 쌓아둔다는 의미로, 알부자가 많고 재물운이 매우 좋은 기운입니다.',
    detail: '돈을 모으는 능력이 탁월하고, 한 번 들어온 돈은 잘 나가지 않습니다. 겉으로는 평범해 보여도 속으로는 상당한 재력을 갖춘 알부자가 많습니다. 부동산이나 저축을 통해 재산을 불리는 데 유리합니다. 다만 너무 인색하다는 소리를 들을 수 있습니다.',
    advice: '돈을 모으는 것도 중요하지만, 가치 있는 곳에 쓸 줄 아는 지혜도 필요합니다. 주변 사람들에게 가끔은 크게 한턱 쏘세요.'
  },
  '탕화살': {
    title: '탕화살 (湯火煞)',
    desc: '불이나 뜨거운 물에 데이거나 화재, 폭발 등의 사고를 조심해야 하는 기운입니다. 감정의 폭발을 의미하기도 합니다.',
    detail: '과거에는 화상이나 흉터를 조심하라는 의미였으나, 현대에는 화기나 화학물질을 다루는 직업, 혹은 감정의 기복이 심해 욱하는 성질로 해석되기도 합니다. 스트레스를 받으면 화를 참지 못하고 폭발할 수 있으니 감정 조절이 필수입니다.',
    advice: '화가 날 때는 심호흡을 10번 하고 말하는 습관을 들이세요. 요리나 캠핑 등 불을 다루는 취미로 기운을 긍정적으로 해소하는 것도 좋습니다.'
  },
  '육수': {
    title: '육수 (六秀)',
    desc: '총명하고 재주가 많으며, 외모가 수려하고 사람을 끄는 매력이 있는 기운입니다.',
    detail: '다방면에 재능이 뛰어나고 눈치가 빨라 어떤 환경에서도 잘 적응합니다. 성격이 급하고 승부욕이 강해 지는 것을 싫어합니다. 자기주장이 강해 타인과 마찰이 생길 수 있으니 겸손함을 잃지 않는 것이 중요합니다.',
    advice: '당신의 뛰어난 재능을 과시하기보다는 타인을 돕는 데 사용하세요. 겸손한 태도가 당신을 더욱 빛나게 할 것입니다.'
  },
  '남연살': {
    title: '남연살 (男戀煞)',
    desc: '이성에 대한 관심이 많고 연애운이 활발한 기운입니다.',
    detail: '다정다감하고 매력이 있어 이성에게 인기가 많습니다. 하지만 연애에 너무 많은 에너지를 쏟거나, 부적절한 관계에 빠질 위험도 있으니 주의가 필요합니다.',
    advice: '이성 관계에서 맺고 끊음을 확실히 하고, 자신의 본업에 충실하는 것이 중요합니다.'
  },
  '여연살': {
    title: '여연살 (女戀煞)',
    desc: '이성에 대한 관심이 많고 연애운이 활발한 기운입니다.',
    detail: '다정다감하고 매력이 있어 이성에게 인기가 많습니다. 하지만 연애에 너무 많은 에너지를 쏟거나, 부적절한 관계에 빠질 위험도 있으니 주의가 필요합니다.',
    advice: '이성 관계에서 맺고 끊음을 확실히 하고, 자신의 본업에 충실하는 것이 중요합니다.'
  },
  '구추방해': {
    title: '구추방해 (九醜妨害)',
    desc: '아홉 가지 추한 일에 얽히기 쉽다는 의미로, 이성 문제나 구설수, 관재수를 조심해야 하는 기운입니다.',
    detail: '매력이 넘치고 사교성이 좋아 주변에 사람이 끊이지 않지만, 그만큼 이성 문제로 인한 스캔들이나 구설수에 오르기 쉽습니다. 특히 유흥이나 도박 등에 빠지지 않도록 자기 관리가 철저히 요구됩니다.',
    advice: '항상 바른 행실을 유지하고, 오해를 살 만한 행동은 피하는 것이 좋습니다. 건전한 취미 생활로 스트레스를 해소하세요.'
  },
  '식신': {
    title: '식신 (食神)',
    desc: '먹을 복, 표현력, 무언가를 길러내고 창조하는 능력을 의미합니다. 남을 챙기고 베푸는 성향이 강합니다.',
    detail: '식신(食神)은 글자 그대로 "먹을 것을 관장하는 신"입니다. 평생 굶어 죽을 일은 없다는 든든한 길신이죠. 단순히 먹을 복뿐만 아니라, 내 안의 에너지를 밖으로 표출하는 능력(말솜씨, 글솜씨, 예술적 재능)과 타인을 먹이고 기르는(교육, 요식업, 돌봄) 성향을 모두 포함합니다. 성격이 원만하고 베풀기를 좋아해 주변에 사람이 끊이지 않습니다.',
    advice: '남을 챙기는 것도 좋지만, 때로는 그 에너지를 온전히 자신을 위해 써보세요. 당신의 창조적인 재능을 발휘할 취미나 부업을 시작해보는 것을 추천합니다.'
  },
  '역마살': {
    title: '역마살 (驛馬煞)',
    desc: '한 곳에 정착하지 못하고 이동하거나 활동적으로 움직여야 직성이 풀리는 기운입니다. 현대에는 글로벌 비즈니스, 출장, 영업 등에서 큰 성공을 거두는 에너지로 해석됩니다.',
    detail: '과거 농경사회에서는 한 곳에 정착하지 못하는 역마살을 흉살로 보았지만, 글로벌 시대인 현대에는 최고의 무기입니다. 역마살이 강한 사람은 변화에 대한 적응력이 뛰어나고, 새로운 환경에서 오히려 에너지를 얻습니다. 해외 운이 좋고, 무역, 외교, 항공, 영업, 프리랜서 등 활동 반경이 넓은 직업에서 크게 성공할 수 있습니다.',
    advice: '답답한 사무실에만 갇혀 있으면 오히려 병이 날 수 있습니다. 자주 여행을 다니거나, 활동적인 취미를 가지세요. 이직이나 부서 이동을 두려워하지 마세요.'
  },
  '관성': {
    title: '관성 (官星)',
    desc: '나를 통제하고 억제하는 기운으로, 직장운, 명예운, 규칙을 준수하는 성향을 의미합니다. 여성에게는 남편이나 이성운을 뜻하기도 합니다.',
    detail: '관성은 사회적 규범, 법, 직장 내의 규칙 등 나를 틀 안에 가두는 힘입니다. 관성이 적절히 있으면 책임감이 강하고 조직 생활에 잘 적응하며 승진운이 좋습니다. 하지만 관성이 너무 약하면 자유분방하여 조직 생활에 답답함을 느끼고, 너무 강하면 타인의 시선을 지나치게 의식하거나 스트레스에 취약해질 수 있습니다.',
    advice: '관성이 부족하다면 의식적으로 루틴을 만들고 규칙을 지키는 연습이 필요합니다. 반대로 너무 강하다면 완벽주의를 내려놓고 가끔은 일탈을 즐겨보세요.'
  }
};

// --- Components ---

// 2. Expandable Result Card
const ResultCard: React.FC<{ 
  icon: any, 
  category: string, 
  hook: string, 
  content: React.ReactNode,
  onTermClick: (term: string) => void,
  isLocked?: boolean,
  onUnlock?: () => void,
  isLoading?: boolean,
  isEmpty?: boolean
}> = ({ 
  icon: Icon, 
  category, 
  hook, 
  content, 
  onTermClick,
  isLocked = false,
  onUnlock,
  isLoading = false,
  isEmpty = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!isLocked);

  return (
    <div className={`bg-[var(--bg-card)] border ${isExpanded && !isLocked ? 'border-[var(--primary)]' : 'border-[var(--border-main)]'} rounded-[12px] overflow-hidden transition-all duration-300 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)]`}>
      <button 
        onClick={() => {
          if (isLocked && onUnlock) {
            onUnlock();
          } else if (!isLocked) {
            setIsExpanded(!isExpanded);
          }
        }}
        className="w-full p-[20px] text-left flex items-start gap-4 focus:outline-none relative"
      >
        <div className={`mt-1 p-2 rounded-full shrink-0 ${isLocked ? 'bg-[var(--bg-muted)] text-[var(--text-muted)]' : 'bg-[var(--primary-light)] text-[var(--primary)]'}`}>
          {isLocked ? <Lock className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
        </div>
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-semibold text-[var(--primary)] tracking-wide">{category}</span>
            {isLocked && (
              <span className="px-2 py-0.5 bg-[var(--text-main)] text-[var(--bg-main)] text-[10px] font-bold rounded-full">잠김</span>
            )}
            {isLoading && (
              <span className="px-2 py-0.5 bg-[var(--primary-light)] text-[var(--primary)] text-[10px] font-bold rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-spin" /> 분석 중
              </span>
            )}
          </div>
          <h3 className={`text-[18px] md:text-[20px] font-bold leading-[1.35] ${isLocked ? 'text-[var(--text-muted)]' : 'text-[var(--text-main)]'}`}>
            {isLoading && !hook ? '운세를 분석하고 있습니다...' : hook}
          </h3>
        </div>
        {!isLocked && (
          <div className="shrink-0 text-[var(--text-muted)] mt-2">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        )}
      </button>

      {!isLocked && (
        <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className="p-[20px] pt-4 border-t border-[var(--border-main)] mt-2">
            <div className="text-[var(--text-secondary)] leading-[1.7] text-[14px] md:text-[16px] space-y-4">
              {isLoading && isEmpty ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-[var(--bg-muted)] rounded w-3/4"></div>
                  <div className="h-4 bg-[var(--bg-muted)] rounded w-full"></div>
                  <div className="h-4 bg-[var(--bg-muted)] rounded w-5/6"></div>
                </div>
              ) : (
                content
              )}
            </div>
          </div>
        </div>
      )}

      {isLocked && (
        <div className="px-[20px] pb-[20px]">
          <button 
            onClick={onUnlock}
            className="w-full py-[12px] px-[16px] bg-[var(--text-main)] hover:bg-[var(--bg-muted)] text-[var(--bg-main)] rounded-[8px] text-[14px] font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            재화 1개로 전체 결과 잠금 해제하기
          </button>
        </div>
      )}
    </div>
  );
};

const InlineHoverTerm = ({ term, hanja }: { term: string, hanja?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const desc = getTermDescription(term);
  const spanRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpen = () => {
    if (spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      const halfWidth = 128; // w-64 is 256px, half is 128px
      const minLeft = halfWidth + 16;
      const maxLeft = window.innerWidth - halfWidth - 16;
      
      setPosition({
        top: rect.top - 10,
        left: Math.min(Math.max(rect.left + rect.width / 2, minLeft), maxLeft)
      });
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <>
      <span 
        ref={spanRef}
        className="relative inline-flex items-center gap-1 px-[8px] py-[2px] mx-0.5 bg-[#E3F9F6] dark:bg-[#4ECDC4]/20 text-[#4ECDC4] dark:text-[#81E6D9] rounded-full font-bold text-[14.5px] hover:bg-[#4ECDC4] dark:hover:bg-[#4ECDC4] hover:text-[var(--bg-main)] transition-colors cursor-help"
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onTouchStart={handleOpen}
        onTouchEnd={() => {
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => setIsOpen(false), 3000);
        }}
      >
        {term} {hanja && <span className="text-[11px] opacity-70">{hanja}</span>}
        <Info className="w-3 h-3" />
      </span>
      
      {isOpen && desc && (
        <span 
          className="fixed z-[100] w-64 bg-[var(--text-main)] text-[var(--bg-main)] text-xs p-3 rounded-xl shadow-xl pointer-events-auto whitespace-normal text-left leading-relaxed font-normal block"
          style={{
            top: position.top,
            left: position.left,
            transform: 'translate(-50%, -100%)',
            maxWidth: 'calc(100vw - 32px)',
          }}
          onMouseEnter={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
          }}
          onMouseLeave={handleClose}
        >
          <span className="font-bold block mb-1 text-[#4ECDC4] dark:text-[#81E6D9]">{term} {hanja}</span>
          {desc}
          <span 
            className="absolute top-full border-4 border-transparent border-t-[var(--text-main)]"
            style={{
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          ></span>
        </span>
      )}
    </>
  );
};

const AdvancedSettings = ({ data, onChange }: { data: SajuFormPayload, onChange: (data: SajuFormPayload) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4 pt-4 border-t border-[var(--border-main)]">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <label className="block text-[13px] font-bold text-[var(--text-main)] flex items-center gap-1 cursor-pointer">
          정밀 보정 설정
          <div className="group relative">
            <Info className="w-3.5 h-3.5 text-[var(--text-muted)] cursor-help" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg shadow-lg text-[11px] text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
              한국 표준시와 실제 태양시의 차이를 반영하여 더욱 정교하게 산출합니다.
            </div>
          </div>
        </label>
        {isOpen ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
      </div>
      
      {isOpen && (
        <div className="space-y-3 mt-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-[12px] text-[var(--text-secondary)]">경도 보정 (30분 적용)</span>
            <input 
              type="checkbox" 
              checked={data.useLongitudeCorrection !== false}
              onChange={e => onChange({...data, useLongitudeCorrection: e.target.checked})}
              className="w-4 h-4 accent-[var(--primary)] rounded-sm"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-[12px] text-[var(--text-secondary)]">썸머타임 적용 (해당 연도 1시간 차감)</span>
            <input 
              type="checkbox" 
              checked={data.useSummerTime !== false}
              onChange={e => onChange({...data, useSummerTime: e.target.checked})}
              className="w-4 h-4 accent-[var(--primary)] rounded-sm"
            />
          </label>

          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[var(--text-secondary)]">야자시/조자시 (23:30~24:00)</span>
            <select
              value={data.yajaMethod || 'current_day'}
              onChange={e => onChange({...data, yajaMethod: e.target.value as 'current_day' | 'next_day'})}
              className="bg-[var(--bg-input)] border border-[var(--border-main)] rounded-md px-2 py-1 text-[11px] text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="current_day">야자시 (일진 유지)</option>
              <option value="next_day">조자시 (다음날로 넘김)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const [activeTab, setActiveTab] = useState('home');
  const [sajuStep, setSajuStep] = useState<'input' | 'result'>('input');
  const [matchStep, setMatchStep] = useState<'input' | 'result'>('input');
  const [newyearStep, setNewyearStep] = useState<'input' | 'result'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [sajuForm, setSajuForm] = useState<SajuFormPayload>({
    name: '',
    gender: 'female',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    calendarType: 'solar',
    birthTime: '',
    isTimeUnknown: false,
  });
  const [matchForm, setMatchForm] = useState<MatchFormPayload>({
    myData: {
      name: '',
      gender: 'female',
      birthYear: '',
      birthMonth: '',
      birthDay: '',
      calendarType: 'solar',
      birthTime: '',
      isTimeUnknown: false,
    },
    partnerData: {
      name: '',
      gender: 'female',
      birthYear: '',
      birthMonth: '',
      birthDay: '',
      calendarType: 'solar',
      birthTime: '',
      isTimeUnknown: false,
    },
    relationship: '연인/부부'
  });
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [sajuResult, setSajuResult] = useState<SajuResultData | null>(null);
  const [detailsProgress, setDetailsProgress] = useState<number>(0);
  const [matchResult, setMatchResult] = useState<MatchResultData | null>(null);
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setUser(session?.user || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const loggedIn = !!session;
      setIsLoggedIn(loggedIn);
      setUser(session?.user || null);
      if (loggedIn) {
        setShowLogin(false);
        showToast('로그인되었습니다.');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      console.error('Google login error:', error.message);
      showToast('구글 로그인에 실패했습니다.');
    }
  };

  const handleKakaoLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error('Kakao login error:', error.message);
      showToast('카카오 로그인에 실패했습니다.');
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    } else {
      showToast('로그아웃 되었습니다.');
    }
  };
  const [mainCoin, setMainCoin] = useState(0);
  const [bonusCoin, setBonusCoin] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [selectedHanja, setSelectedHanja] = useState<{ hanja: string; name: string; pillarType: string } | null>(null);
  const [hanjaDetail, setHanjaDetail] = useState<{ meaning: string; jijanggan: string; overall: string } | null>(null);
  const [isHanjaLoading, setIsHanjaLoading] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<{ term: string; pillarType: string } | null>(null);
  const [termDetail, setTermDetail] = useState<{ meaning: string; positionMeaning: string; overall: string } | null>(null);
  const [isTermLoading, setIsTermLoading] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const hasFetchedInsights = useRef(false);

  useEffect(() => {
    if (sajuStep === 'result' && sajuResult && sajuResult.promptParams && sajuResult.insights[0]?.isLoading && !hasFetchedInsights.current) {
      hasFetchedInsights.current = true;
      
      const fetchInsights = async () => {
        const { userName, birthInfo, elementScores, pillars, stars, shisung, dayElement, strongestElement, gender } = sajuResult.promptParams!;
        
        // 1. Start streaming overall
        const stream = callGeminiSajuOverallStream(userName, birthInfo, elementScores, pillars, stars, shisung, dayElement, strongestElement, gender);
        
        // 2. Start fetching details in parallel
        setDetailsProgress(0);
        const progressInterval = setInterval(() => {
          setDetailsProgress(prev => {
            if (prev >= 95) return prev;
            return prev + Math.floor(Math.random() * 5) + 2; // Increment by 2-6%
          });
        }, 1000);

        const detailsPromise = callGeminiSajuDetails(userName, birthInfo, elementScores, pillars, stars, shisung, dayElement, strongestElement, gender)
          .finally(() => {
            clearInterval(progressInterval);
            setDetailsProgress(100);
          });

        let overallContent = '';
        
        try {
          for await (const chunk of stream) {
            overallContent += chunk;
            setSajuResult(prev => {
              if (!prev) return prev;
              const newInsights = [...prev.insights];
              newInsights[0] = { ...newInsights[0], paragraphs: overallContent.split('\n\n').filter(p => p.trim() !== '') };
              return { ...prev, insights: newInsights };
            });
          }
          // Finished streaming overall
          setSajuResult(prev => {
            if (!prev) return prev;
            const newInsights = [...prev.insights];
            newInsights[0] = { ...newInsights[0], isLoading: false, hook: '인생총운 풀이' };
            return { ...prev, insights: newInsights };
          });
        } catch (error) {
          console.error("Overall stream error:", error);
          setSajuResult(prev => {
            if (!prev) return prev;
            const newInsights = [...prev.insights];
            newInsights[0] = { ...newInsights[0], isLoading: false, paragraphs: ["분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."] };
            return { ...prev, insights: newInsights };
          });
        }

        try {
          const details = await detailsPromise;
          if (details) {
            setSajuResult(prev => {
              if (!prev) return prev;
              const newInsights = [...prev.insights];
              
              const updateInsight = (id: string, data: any) => {
                const idx = newInsights.findIndex(i => i.id === id);
                if (idx !== -1) {
                  if (data) {
                    newInsights[idx] = {
                      ...newInsights[idx],
                      hook: data.hook || newInsights[idx].hook,
                      paragraphs: data.content ? data.content.split('\n\n').filter((p: string) => p.trim() !== '') : [],
                      advice: data.advice,
                      isLoading: false
                    };
                  } else {
                    newInsights[idx] = { ...newInsights[idx], isLoading: false };
                  }
                }
              };

              updateInsight('wealth', details.wealth);
              updateInsight('health', details.health);
              updateInsight('love', details.love);
              updateInsight('marriage', details.marriage);
              updateInsight('children', details.children);
              updateInsight('career', details.career);
              updateInsight('business', details.business);
              updateInsight('study', details.study);
              updateInsight('parents', details.parents);
              updateInsight('interpersonal', details.interpersonal);
              updateInsight('realestate', details.realestate);

              return { 
                ...prev, 
                insights: newInsights,
                prescription: {
                  ...prev.prescription,
                  advice: details.prescription?.advice || prev.prescription.advice
                }
              };
            });
          } else {
            throw new Error("Failed to fetch details");
          }
        } catch (error) {
          console.error("Details fetch error:", error);
          // Set isLoading to false for the rest if error occurs
          setSajuResult(prev => {
            if (!prev) return prev;
            const newInsights = prev.insights.map((insight, idx) => 
              idx === 0 ? insight : { ...insight, isLoading: false }
            );
            return { ...prev, insights: newInsights };
          });
        }
      };

      fetchInsights();
    }
  }, [sajuStep, sajuResult]);

  // Load saved profiles on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedProfiles');
    if (saved) {
      try {
        setSavedProfiles(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved profiles');
      }
    }
  }, []);

  const saveProfile = (payload: SajuFormPayload) => {
    const newProfile: SavedProfile = {
      ...payload,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    const updated = [newProfile, ...savedProfiles];
    setSavedProfiles(updated);
    localStorage.setItem('savedProfiles', JSON.stringify(updated));
  };

  const nameRef = useRef<HTMLInputElement>(null);
  const birthDateRef = useRef<HTMLInputElement>(null);
  const birthTimeRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleHanjaClick = async (hanja: string, name: string, idx: number) => {
    const pillarTypes = ['시주', '일주', '월주', '년주'];
    const pillarType = pillarTypes[idx];
    
    setSelectedHanja({ hanja, name, pillarType });
    setHanjaDetail(null);
    setIsHanjaLoading(true);

    try {
      const detail = await getHanjaDetail(hanja, name, pillarType, sajuResult!);
      setHanjaDetail(detail);
    } catch (error) {
      console.error(error);
      showToast('상세 정보를 가져오는데 실패했습니다.');
    } finally {
      setIsHanjaLoading(false);
    }
  };

  const handleTermClick = async (term: string, idx: number) => {
    const pillarTypes = ['시주', '일주', '월주', '년주'];
    const pillarType = pillarTypes[idx];
    
    setSelectedTerm({ term, pillarType });
    setTermDetail(null);
    setIsTermLoading(true);

    try {
      const detail = await getTermDetail(term, pillarType, sajuResult!);
      setTermDetail(detail);
    } catch (error) {
      console.error(error);
      showToast('상세 정보를 가져오는데 실패했습니다.');
    } finally {
      setIsTermLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    let firstErrorRef: React.RefObject<HTMLInputElement> | null = null;

    if (!sajuForm.name.trim()) {
      errors.name = '이름을 입력해주세요.';
      if (!firstErrorRef) firstErrorRef = nameRef;
    }
    
    const year = parseInt(sajuForm.birthYear);
    const month = parseInt(sajuForm.birthMonth);
    const day = parseInt(sajuForm.birthDay);
    
    if (!year || year < 1900 || year > new Date().getFullYear()) {
      errors.birthDate = '올바른 연도를 입력해주세요.';
      if (!firstErrorRef) firstErrorRef = birthDateRef;
    } else if (!month || month < 1 || month > 12) {
      errors.birthDate = '올바른 월을 입력해주세요.';
      if (!firstErrorRef) firstErrorRef = birthDateRef;
    } else if (!day || day < 1 || day > 31) {
      errors.birthDate = '올바른 일을 입력해주세요.';
      if (!firstErrorRef) firstErrorRef = birthDateRef;
    } else {
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        errors.birthDate = '존재하지 않는 날짜입니다.';
        if (!firstErrorRef) firstErrorRef = birthDateRef;
      }
    }

    if (!sajuForm.isTimeUnknown && !sajuForm.birthTime) {
      errors.birthTime = '태어난 시간을 입력하거나 모름을 체크해주세요.';
      if (!firstErrorRef) firstErrorRef = birthTimeRef;
    }

    setFormErrors(errors);

    if (firstErrorRef && firstErrorRef.current) {
      firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstErrorRef.current.focus();
    }

    return Object.keys(errors).length === 0;
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setMainCoin(1); // Give 1 free coin on login for demo
    setShowLogin(false);
  };

  const handleUnlock = () => {
    if (mainCoin > 0) {
      setMainCoin(prev => prev - 1);
      setIsUnlocked(true);
    } else if (bonusCoin > 0) {
      setBonusCoin(prev => prev - 1);
      setIsUnlocked(true);
    } else {
      setShowStore(true);
    }
  };

  const buyCoins = (main: number, bonus: number) => {
    setMainCoin(prev => prev + main);
    setBonusCoin(prev => prev + bonus);
    setShowStore(false);
  };

  const exportToPDF = async () => {
    const element = document.getElementById('saju-result-content');
    if (!element) return;

    try {
      showToast('PDF 생성 중... (잠시만 기다려주세요)');
      
      // 모바일 기기 캔버스 크기 제한(4096px) 오류 방지 및 스크롤 잘림 해결
      const scale = window.innerWidth < 768 ? 1 : 2;
      
      const canvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        logging: false,
        backgroundColor: 'var(--bg-card)',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollY: -window.scrollY
      });
      
      // PNG보다 메모리를 적게 차지하는 JPEG 사용
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${sajuForm.name || '사용자'}_사주결과.pdf`);
      showToast('PDF 저장 완료!');
    } catch (error) {
      console.error('PDF export failed:', error);
      showToast('PDF 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const renderInlineBold = (text: string) => {
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <>
        {boldParts.map((part, idx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={idx} className="font-bold text-[var(--text-main)]">{renderTermsOnly(part.slice(2, -2))}</strong>;
          }
          return <span key={idx}>{renderTermsOnly(part)}</span>;
        })}
      </>
    );
  };

  const renderTextWithTerms = (text: string) => {
    const lines = text.split('\n');
    
    return (
      <div className="space-y-1">
        {lines.map((line, lineIdx) => {
          const trimmedLine = line.trim();
          if (!trimmedLine) return null;

          // Handle subheadings (###)
          if (trimmedLine.startsWith('###')) {
            return (
              <h5 key={lineIdx} className="text-[16px] font-bold text-[var(--text-main)] mt-6 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[var(--primary)] rounded-full"></span>
                {trimmedLine.replace(/^###\s*/, '')}
              </h5>
            );
          }

          // Check if line starts with bold text (Subtopic)
          const subtopicMatch = trimmedLine.match(/^(\*\*.*?\*\*)\s*(.*)$/);
          if (subtopicMatch) {
            const boldText = subtopicMatch[1].slice(2, -2);
            const restText = subtopicMatch[2];

            return (
              <div key={lineIdx} className="mt-4 mb-2">
                <div className="font-bold text-[var(--text-main)] text-[15px] mb-2 flex items-start gap-2">
                  <span className="w-1 h-4 bg-[var(--primary)] rounded-full opacity-60 mt-0.5"></span>
                  <span>{renderTermsOnly(boldText)}</span>
                </div>
                {restText.trim() && (
                  <div className="pl-3 border-l-2 border-[var(--border-main)] ml-1 text-[var(--text-secondary)] text-[14.5px] leading-relaxed">
                    {renderInlineBold(restText)}
                  </div>
                )}
              </div>
            );
          }

          // Regular line (continuation of explanation)
          return (
            <div key={lineIdx} className="pl-3 border-l-2 border-[var(--border-main)] ml-1 text-[var(--text-secondary)] text-[14.5px] leading-relaxed mb-2">
              {renderInlineBold(trimmedLine)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderTermsOnly = (text: string) => {
    const parts = text.split(/(\[[^\]]+\])/g);
    const ignoreList = ['목', '화', '토', '금', '수', '나무', '불', '흙', '쇠', '물', '음', '양'];
    
    return parts.map((part, i) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const fullTerm = part.slice(1, -1);
        // Extract Hanja if present, e.g., "태극귀인(太極貴人)"
        const match = fullTerm.match(/([^(]+)(\([^)]+\))?/);
        const displayTerm = match ? match[1].trim() : fullTerm;
        const hanja = match && match[2] ? match[2] : '';

        if (ignoreList.includes(displayTerm)) {
          return <span key={i}>{displayTerm}</span>;
        }

        return <span key={i}><InlineHoverTerm term={displayTerm} hanja={hanja} /></span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderHeader = () => (
    <header className="px-[16px] h-[64px] flex items-center justify-between border-b border-[var(--border-main)] bg-[var(--bg-card)] sticky top-0 z-10">
      <button onClick={() => setActiveTab('home')} className="flex items-center gap-2 focus:outline-none">
        <Logo />
      </button>

      
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className="p-2 rounded-full bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--primary)] transition-all duration-300 hover:scale-110"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        {isLoggedIn ? (
          <div className="flex items-center gap-2 bg-[var(--bg-muted)] px-3 py-1.5 rounded-full cursor-pointer" onClick={() => setShowStore(true)}>
            <div className="flex items-center gap-1 text-[#F59E0B] dark:text-[#FCD34D] font-bold text-[13px]">
              <Coins className="w-4 h-4" /> {mainCoin}
            </div>
            <div className="w-[1px] h-3 bg-[#D1D5DB] dark:bg-[#4B5563]"></div>
            <div className="flex items-center gap-1 text-[var(--primary)] font-bold text-[13px]">
              <Gift className="w-4 h-4" /> {bonusCoin}
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="ml-2 p-1 hover:text-[var(--primary)]">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={() => setShowLogin(true)} className="px-[16px] py-[8px] bg-[#FEE500] hover:bg-[#F4DC00] text-[#000000] rounded-full text-[13px] font-bold transition-colors shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-1.5">
            로그인
          </button>
        )}
      </div>
    </header>
  );

  const renderBottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border-main)] flex justify-around items-center h-[64px] pb-safe z-10">
      {[
        { id: 'saju', icon: Sparkles, label: '사주' },
        { id: 'match', icon: Users, label: '궁합' },
        { id: 'newyear', icon: Calendar, label: '신년운세' },
        { id: 'mypage', icon: UserCircle, label: '마이페이지' },
      ].map(tab => (
        <button 
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 ${activeTab === tab.id ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
        >
          <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'fill-current opacity-20' : ''}`} />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  );

  const renderHome = () => (
    <div className="flex flex-col min-h-[calc(100vh-128px)] bg-[var(--bg-card)]">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-[20px] py-[60px] relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary-light)] rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#E3F9F6] dark:bg-[#4ECDC4]/20 rounded-full blur-3xl opacity-50"></div>
        
        <UniverseLogo />
        
        <h2 className="text-[32px] md:text-[40px] font-extrabold text-[var(--text-main)] mb-6 leading-[1.2] tracking-tight relative z-10">
          어려운 한자 사주,<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E94560] to-[var(--primary)]">가장 쉽고 정확하게</span>
        </h2>
        
        <p className="text-[var(--text-secondary)] text-[16px] md:text-[18px] leading-[1.6] max-w-[340px] mb-10 relative z-10 font-medium">
          전문가가 옆에서 친절하게 설명해주듯,<br/>
          당신의 진짜 기질과 숨겨진 무기를 알려드립니다.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[500px] mb-12 relative z-10">
          <div className="bg-[var(--bg-input)] p-5 rounded-[16px] border border-[var(--border-main)] text-left hover:border-[var(--primary)]/30 transition-colors">
            <div className="w-10 h-10 bg-[var(--primary-light)] rounded-full flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <h3 className="font-bold text-[15px] mb-1 text-[var(--text-main)]">쉬운 용어 풀이</h3>
            <p className="text-[13px] text-[var(--text-secondary)] leading-[1.5]">
              태극귀인? 나체도화? 어려운 명리학 용어를 팝업으로 쉽게 풀어드립니다.
            </p>
          </div>
          <div className="bg-[var(--bg-input)] p-5 rounded-[16px] border border-[var(--border-main)] text-left hover:border-[#F59E0B]/30 transition-colors">
            <div className="w-10 h-10 bg-[#FEF3C7] dark:bg-[#F59E0B]/20 rounded-full flex items-center justify-center mb-3">
              <Coins className="w-5 h-5 text-[#F59E0B] dark:text-[#FCD34D]" />
            </div>
            <h3 className="font-bold text-[15px] mb-1 text-[var(--text-main)]">합리적인 가격</h3>
            <p className="text-[13px] text-[var(--text-secondary)] leading-[1.5]">
              단돈 990원으로 전체 사주 풀이를 평생 소장하세요.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="p-[20px] pb-[40px] bg-[var(--bg-card)] relative z-20">
        <div className="relative w-full max-w-[500px] mx-auto">
          {/* Animated glowing background (Aura) */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#F9A826] via-[#E94560] to-[#3B82F6] rounded-[24px] blur opacity-40 animate-pulse"></div>
          
          <motion.button 
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            variants={{
              initial: { scale: 1 },
              hover: { scale: 1.02, boxShadow: "0 0 30px rgba(249, 168, 38, 0.4)" },
              tap: { scale: 0.98 }
            }}
            onClick={() => {
              setActiveTab('saju');
              setSajuStep('input');
            }}
            className="relative w-full py-[20px] bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-[#334155] text-[var(--bg-main)] rounded-[20px] text-[18px] font-bold transition-colors flex items-center justify-center gap-3 overflow-hidden"
          >
            {/* Shimmer effect */}
            <motion.div 
              variants={{
                initial: { x: '-100%', opacity: 0 },
                hover: { x: '100%', opacity: 1, transition: { duration: 1.2, repeat: Infinity, ease: "linear" } }
              }}
              className="absolute top-0 left-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 z-0"
            />
            
            {/* Star/Sparkle Icon */}
            <motion.div
              variants={{
                initial: { rotate: 0, color: '#F9A826' },
                hover: { rotate: 180, color: '#FFD700', transition: { duration: 0.5 } }
              }}
              className="z-10"
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            
            {/* Text */}
            <motion.span 
              variants={{
                initial: { color: '#FFFFFF' },
                hover: { color: '#FFD700', textShadow: "0 0 8px rgba(255, 215, 0, 0.5)" }
              }}
              className="tracking-wide z-10"
            >
              내 사주 보러가기
            </motion.span>
            
            {/* Arrow */}
            <motion.div 
              variants={{
                initial: { x: 0, backgroundColor: '#1E293B', color: '#94A3B8' },
                hover: { x: 5, backgroundColor: 'rgba(249, 168, 38, 0.2)', color: '#F9A826' }
              }}
              className="absolute right-6 w-8 h-8 rounded-full flex items-center justify-center z-10"
            >
              <ChevronDown className="w-5 h-5 -rotate-90" />
            </motion.div>
          </motion.button>
        </div>
      </div>
    </div>
  );

  const renderSajuInput = () => (
    <div className="max-w-[720px] mx-auto px-[16px] py-[32px] pb-[100px]">
      <div className="mb-[32px]">
        <h2 className="text-[24px] md:text-[28px] font-bold mb-[8px] leading-[1.35] text-[var(--text-main)]">
          정확한 사주 분석을 위해<br/>정보를 입력해주세요 📝
        </h2>
        <p className="text-[var(--text-secondary)] text-[14px] md:text-[16px] leading-[1.6]">
          입력하신 정보는 사주 분석에만 사용되며 저장되지 않습니다.
        </p>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[16px] p-[24px] shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-[24px]">
        
        {/* 이름 */}
        <div>
          <label className="block text-[14px] font-bold text-[var(--text-main)] mb-2">이름</label>
          <input 
            ref={nameRef}
            type="text" 
            placeholder="이름을 입력해주세요"
            value={sajuForm.name}
            onChange={e => {
              setSajuForm({...sajuForm, name: e.target.value});
              if (formErrors.name) setFormErrors({...formErrors, name: ''});
            }}
            className={`w-full px-[16px] py-[14px] bg-[var(--bg-input)] border ${formErrors.name ? 'border-[var(--primary)]' : 'border-[var(--border-main)]'} rounded-[12px] text-[15px] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--bg-card)] transition-colors`}
          />
          {formErrors.name && <p className="text-[var(--primary)] text-[12px] mt-1.5 ml-1">{formErrors.name}</p>}
        </div>

        {/* 성별 */}
        <div>
          <label className="block text-[14px] font-bold text-[var(--text-main)] mb-2">성별</label>
          <div className="flex gap-2">
            <button 
              onClick={() => setSajuForm({...sajuForm, gender: 'male'})}
              className={`flex-1 py-[12px] rounded-[12px] text-[15px] font-medium transition-colors ${sajuForm.gender === 'male' ? 'bg-[var(--text-main)] text-[var(--bg-main)]' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-main)] hover:bg-[var(--bg-muted)]'}`}
            >
              남성
            </button>
            <button 
              onClick={() => setSajuForm({...sajuForm, gender: 'female'})}
              className={`flex-1 py-[12px] rounded-[12px] text-[15px] font-medium transition-colors ${sajuForm.gender === 'female' ? 'bg-[var(--text-main)] text-[var(--bg-main)]' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-main)] hover:bg-[var(--bg-muted)]'}`}
            >
              여성
            </button>
          </div>
        </div>

        {/* 생년월일 */}
        <div>
          <label className="block text-[14px] font-bold text-[var(--text-main)] mb-2">생년월일</label>
          <div className="flex gap-2 mb-3">
            <button 
              onClick={() => setSajuForm({...sajuForm, calendarType: 'solar'})}
              className={`flex-1 py-[10px] rounded-[8px] text-[13px] font-medium transition-colors ${sajuForm.calendarType === 'solar' ? 'bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--primary)]/30' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-main)]'}`}
            >
              양력
            </button>
            <button 
              onClick={() => setSajuForm({...sajuForm, calendarType: 'lunar'})}
              className={`flex-1 py-[10px] rounded-[8px] text-[13px] font-medium transition-colors ${sajuForm.calendarType === 'lunar' ? 'bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--primary)]/30' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-main)]'}`}
            >
              음력
            </button>
            <button 
              onClick={() => setSajuForm({...sajuForm, calendarType: 'lunar_leap'})}
              className={`flex-1 py-[10px] rounded-[8px] text-[13px] font-medium transition-colors ${sajuForm.calendarType === 'lunar_leap' ? 'bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--primary)]/30' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-main)]'}`}
            >
              윤달
            </button>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input 
                ref={birthDateRef}
                type="number" 
                placeholder="YYYY"
                value={sajuForm.birthYear}
                onChange={e => {
                  setSajuForm({...sajuForm, birthYear: e.target.value});
                  if (formErrors.birthDate) setFormErrors({...formErrors, birthDate: ''});
                }}
                className={`w-full px-[12px] py-[14px] bg-[var(--bg-input)] border ${formErrors.birthDate ? 'border-[var(--primary)]' : 'border-[var(--border-main)]'} rounded-[12px] text-[15px] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--bg-card)] transition-colors text-center`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[13px]">년</span>
            </div>
            <div className="flex-1 relative">
              <input 
                type="number" 
                placeholder="MM"
                value={sajuForm.birthMonth}
                onChange={e => {
                  setSajuForm({...sajuForm, birthMonth: e.target.value});
                  if (formErrors.birthDate) setFormErrors({...formErrors, birthDate: ''});
                }}
                className={`w-full px-[12px] py-[14px] bg-[var(--bg-input)] border ${formErrors.birthDate ? 'border-[var(--primary)]' : 'border-[var(--border-main)]'} rounded-[12px] text-[15px] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--bg-card)] transition-colors text-center`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[13px]">월</span>
            </div>
            <div className="flex-1 relative">
              <input 
                type="number" 
                placeholder="DD"
                value={sajuForm.birthDay}
                onChange={e => {
                  setSajuForm({...sajuForm, birthDay: e.target.value});
                  if (formErrors.birthDate) setFormErrors({...formErrors, birthDate: ''});
                }}
                className={`w-full px-[12px] py-[14px] bg-[var(--bg-input)] border ${formErrors.birthDate ? 'border-[var(--primary)]' : 'border-[var(--border-main)]'} rounded-[12px] text-[15px] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--bg-card)] transition-colors text-center`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[13px]">일</span>
            </div>
          </div>
          {formErrors.birthDate && <p className="text-[var(--primary)] text-[12px] mt-1.5 ml-1">{formErrors.birthDate}</p>}
        </div>

        {/* 태어난 시간 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-[14px] font-bold text-[var(--text-main)]">태어난 시간</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={sajuForm.isTimeUnknown}
                onChange={e => {
                  setSajuForm({...sajuForm, isTimeUnknown: e.target.checked});
                  if (formErrors.birthTime) setFormErrors({...formErrors, birthTime: ''});
                }}
                className="w-4 h-4 accent-[var(--primary)] rounded-sm"
              />
              <span className="text-[13px] text-[var(--text-secondary)]">모름</span>
            </label>
          </div>
          <input 
            ref={birthTimeRef}
            type="time" 
            disabled={sajuForm.isTimeUnknown}
            value={sajuForm.birthTime}
            onClick={(e) => {
              try {
                if ('showPicker' in HTMLInputElement.prototype) {
                  (e.target as HTMLInputElement).showPicker();
                }
              } catch (err) {}
            }}
            onChange={e => {
              setSajuForm({...sajuForm, birthTime: e.target.value});
              if (formErrors.birthTime) setFormErrors({...formErrors, birthTime: ''});
            }}
            className={`w-full px-[16px] py-[14px] border rounded-[12px] text-[15px] focus:outline-none transition-colors ${sajuForm.isTimeUnknown ? 'bg-[var(--bg-muted)] border-[var(--border-main)] text-[var(--text-muted)]' : `bg-[var(--bg-input)] ${formErrors.birthTime ? 'border-[var(--primary)]' : 'border-[var(--border-main)]'} focus:border-[var(--primary)] focus:bg-[var(--bg-card)] text-[var(--text-main)]`}`}
          />
          {formErrors.birthTime && <p className="text-[var(--primary)] text-[12px] mt-1.5 ml-1">{formErrors.birthTime}</p>}
          <p className="text-[12px] text-[var(--text-muted)] mt-2 flex items-start gap-1">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            시간을 모르면 분석이 부정확할 수 있습니다. 가급적 정확한 시간을 입력해주세요.
          </p>
        </div>

        <AdvancedSettings data={sajuForm} onChange={setSajuForm} />
      </div>

      <div className="mt-[32px]">
        <button 
          onClick={() => {
            if (!validateForm()) return;
            
            saveProfile(sajuForm);
            setIsLoading(true);
            hasFetchedInsights.current = false;
            analyzeSaju(sajuForm).then((res) => {
              setSajuResult(res);
              setIsLoading(false);
              setSajuStep('result');
            }).catch((err) => {
              console.error(err);
              showToast('사주 분석 중 오류가 발생했습니다.');
              setIsLoading(false);
            });
          }}
          disabled={isLoading}
          className={`w-full py-[16px] text-[var(--bg-main)] rounded-[12px] text-[16px] font-bold transition-colors shadow-lg shadow-[var(--primary)]/30 flex items-center justify-center gap-2 ${isLoading ? 'bg-[var(--primary-hover)] opacity-80 cursor-not-allowed' : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)]'}`}
        >
          {isLoading ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              사주 분석 중...
            </>
          ) : (
            '사주 분석하기'
          )}
        </button>
      </div>
    </div>
  );

  const renderSajuResult = () => {
    if (!sajuResult) return null;

    return (
      <div id="saju-result-content" className="max-w-[720px] mx-auto px-[16px] py-[32px] pb-[100px]">
        {/* Intro Section */}
        <div className="mb-[32px]">
          <h2 className="text-[24px] md:text-[28px] font-bold mb-[8px] leading-[1.35] text-[var(--text-main)]">
            {sajuResult.headline}
          </h2>
          <p className="text-[var(--text-secondary)] text-[14px] md:text-[16px] leading-[1.6] mb-4">
            {sajuResult.narrative}
          </p>
          <div className="bg-[var(--bg-input)] p-4 rounded-xl border border-[var(--border-main)]">
            <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed">
              <strong>명리학적 근거:</strong> {sajuResult.myungriBasis}
            </p>
          </div>
        </div>

        {/* Traditional Manse-ryeok Chart (Optional/Secondary) */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[16px] p-[20px] mb-[32px] shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[16px] font-bold text-[var(--text-main)]">{sajuForm.name || '김사주'}님의 만세력 차트</h3>
            <span className="text-[12px] text-[var(--text-muted)] bg-[var(--bg-muted)] px-2 py-1 rounded-full">
              {sajuForm.calendarType === 'solar' ? '양력' : sajuForm.calendarType === 'lunar' ? '음력' : '윤달'} {sajuForm.birthYear || '1990'}.{sajuForm.birthMonth ? sajuForm.birthMonth.padStart(2, '0') : '05'}.{sajuForm.birthDay ? sajuForm.birthDay.padStart(2, '0') : '15'} {sajuForm.isTimeUnknown ? '시간모름' : (sajuForm.birthTime || '14:30')}
            </span>
          </div>
          
          <div className="bg-[#E3F9F6]/50 dark:bg-[#4ECDC4]/10 text-[#4ECDC4] dark:text-[#81E6D9] text-[13px] px-3 py-2.5 rounded-xl mb-5 flex items-center justify-center gap-2 font-bold animate-pulse">
            <Sparkles className="w-4 h-4" />
            차트의 한자나 단어를 터치하면 뜻을 확인할 수 있어요!
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-center mb-4">
            <div className="text-[12px] text-[var(--text-muted)] font-medium">시주(시간)</div>
            <div className="text-[12px] text-[var(--text-muted)] font-medium">일주(나)</div>
            <div className="text-[12px] text-[var(--text-muted)] font-medium">월주(부모)</div>
            <div className="text-[12px] text-[var(--text-muted)] font-medium">년주(조상)</div>
            
            {/* 천간 */}
            {[sajuResult.chart.time, sajuResult.chart.day, sajuResult.chart.month, sajuResult.chart.year].map((pillar, idx) => (
              <div key={`stem-${idx}`} className={`py-3 rounded-[8px] border ${idx === 1 ? 'border-[var(--primary)]/30' : 'border-[var(--border-main)]'} ${pillar.stem.color} relative flex flex-col items-center justify-center`}>
                {idx === 1 && <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-[var(--bg-main)] text-[9px] px-1.5 rounded-sm">나</div>}
                <div className="text-[10px] text-[var(--text-secondary)] mb-1"><TermWithTooltip term={pillar.stem.tenDeity || '-'} /></div>
                <div className="text-[24px] font-bold leading-none">
                  <TermWithTooltip 
                    term={pillar.stem.hanja} 
                    disableHover={true} 
                    onClick={() => handleHanjaClick(pillar.stem.hanja, pillar.stem.name, idx)} 
                  />
                </div>
                <div className={`text-[11px] mt-1 ${idx === 1 ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}><TermWithTooltip term={pillar.stem.name} /></div>
              </div>
            ))}

            {/* 지지 */}
            {[sajuResult.chart.time, sajuResult.chart.day, sajuResult.chart.month, sajuResult.chart.year].map((pillar, idx) => (
              <div key={`branch-${idx}`} className={`py-3 rounded-[8px] border border-[var(--border-main)] ${pillar.branch.color} flex flex-col items-center justify-center`}>
                <div className="text-[10px] text-[var(--text-secondary)] mb-1"><TermWithTooltip term={pillar.branch.tenDeity || '-'} /></div>
                <div className="text-[24px] font-bold leading-none">
                  <TermWithTooltip 
                    term={pillar.branch.hanja} 
                    disableHover={true} 
                    onClick={() => handleHanjaClick(pillar.branch.hanja, pillar.branch.name, idx)} 
                  />
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-1"><TermWithTooltip term={pillar.branch.name} /></div>
              </div>
            ))}
            
            {/* 지장간 */}
            {[sajuResult.chart.time, sajuResult.chart.day, sajuResult.chart.month, sajuResult.chart.year].map((pillar, idx) => (
              <div key={`hidden-${idx}`} className="py-2 border-b border-[var(--border-main)] flex flex-col items-center justify-center">
                <div className="text-[10px] text-[var(--text-muted)] mb-1">지장간</div>
                <div className="text-[11px] text-[var(--text-secondary)] font-medium tracking-widest flex gap-1">
                  {pillar.hiddenStems?.map((stem, sIdx) => (
                    <span key={sIdx}>
                      <TermWithTooltip 
                        term={stem} 
                        disableHover={true}
                        onClick={() => handleTermClick(stem, idx)}
                      />
                    </span>
                  )) || '-'}
                </div>
              </div>
            ))}

            {/* 십이운성 & 신살 */}
            {[sajuResult.chart.time, sajuResult.chart.day, sajuResult.chart.month, sajuResult.chart.year].map((pillar, idx) => (
              <div key={`shensha-${idx}`} className="py-2 flex flex-col items-center justify-start gap-1">
                <div className="text-[11px] font-bold text-[var(--text-main)] bg-[var(--bg-muted)] px-2 py-0.5 rounded-sm w-full">
                  <TermWithTooltip 
                    term={pillar.phase || '-'} 
                    type="phase" 
                    disableHover={true}
                    onClick={() => handleTermClick(pillar.phase || '-', idx)}
                  />
                </div>
                {pillar.twelveShensha && (
                  <div className="text-[11px] text-[var(--text-secondary)] w-full">
                    <TermWithTooltip 
                      term={pillar.twelveShensha} 
                      type="shensha" 
                      disableHover={true}
                      onClick={() => handleTermClick(pillar.twelveShensha, idx)}
                    />
                  </div>
                )}
                {pillar.otherShensha?.map((shensha, sIdx) => (
                  <div key={sIdx} className="text-[11px] text-[var(--primary)] w-full">
                    <TermWithTooltip 
                      term={shensha} 
                      type="shensha" 
                      disableHover={true}
                      onClick={() => handleTermClick(shensha, idx)}
                    />
                  </div>
                ))}
              </div>
            ))}

            {/* 형충회합 */}
            {[sajuResult.chart.time, sajuResult.chart.day, sajuResult.chart.month, sajuResult.chart.year].map((pillar, idx) => (
              <div key={`interactions-${idx}`} className="py-2 flex flex-col items-center justify-start gap-1 border-t border-[var(--border-main)]">
                {pillar.interactions?.map((interaction, iIdx) => (
                  <div key={iIdx} className="text-[11px] text-[var(--text-secondary)] w-full font-medium">
                    <TermWithTooltip 
                      term={interaction} 
                      type="interaction" 
                      disableHover={true}
                      onClick={() => handleTermClick(interaction, idx)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <p className="text-[13px] text-[var(--text-secondary)] bg-[var(--bg-input)] p-3 rounded-[8px] mt-4">
            💡 <strong>전문가의 한마디:</strong> {sajuResult.expertComment}
          </p>
        </div>

        {/* Modern Saju Storytelling Visuals */}
        <div className="mb-[32px]">
          <SajuStoryteller result={sajuResult} onToast={showToast} />
        </div>

        {/* Insight Cards */}
        <div className="space-y-[16px]">
          {sajuResult.insights.map((insight) => {
            const ICONS: Record<string, any> = { User, Heart, Briefcase, Activity, Compass, Coins, Users, Gift, BookOpen, UserCircle, MessageCircle, Home };
            const IconComponent = ICONS[insight.iconName] || Sparkles;
            return (
              <React.Fragment key={insight.id}>
                <ResultCard 
                  icon={IconComponent}
                  category={insight.category}
                  hook={insight.hook}
                  onTermClick={setActiveTerm}
                  isLocked={insight.isLocked && !isUnlocked}
                  onUnlock={handleUnlock}
                  isLoading={insight.isLoading}
                  isEmpty={insight.paragraphs.length === 0 || (insight.paragraphs.length === 1 && insight.paragraphs[0].trim() === '')}
                  content={
                    <>
                      {insight.paragraphs.map((p, idx) => (
                        <div key={idx} className="mb-4 last:mb-0">{renderTextWithTerms(p)}</div>
                      ))}
                      {insight.advice && (
                        <div className="p-[16px] bg-[#E3F9F6]/30 dark:bg-[#4ECDC4]/10 rounded-[8px] border border-[#4ECDC4]/30 dark:border-[#4ECDC4]/20 mt-4">
                          <strong className="text-[var(--text-main)] block mb-2 text-[14px] flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-[#4ECDC4] dark:text-[#81E6D9]" /> 전문가의 따뜻한 조언
                          </strong>
                          <span className="text-[var(--text-secondary)] text-[14px]">{insight.advice}</span>
                        </div>
                      )}
                    </>
                  }
                />
                {insight.id === 'overall' && detailsProgress > 0 && detailsProgress < 100 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-[var(--bg-card)] p-4 rounded-[16px] border border-[var(--border-main)] shadow-sm my-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[14px] font-bold text-[var(--text-main)] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[var(--primary)] animate-pulse" />
                        상세 운세 심층 분석 중...
                      </span>
                      <span className="text-[12px] font-bold text-[var(--primary)]">{detailsProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-[var(--primary)] to-[#F59E0B]"
                        initial={{ width: 0 }}
                        animate={{ width: `${detailsProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Prescription Card */}
        <PrescriptionCard result={sajuResult} userName={sajuForm.name || '사용자'} />

        {isUnlocked && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <button 
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--text-main)] text-[var(--bg-main)] rounded-full font-bold shadow-lg hover:bg-[var(--bg-muted)] transition-colors w-full max-w-[280px] justify-center"
            >
              <Share2 className="w-5 h-5" />
              내 사주 결과 공유하기
            </button>
            <button 
              onClick={exportToPDF}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-main)] rounded-full font-bold shadow-sm hover:bg-[var(--bg-muted)] transition-colors w-full max-w-[280px] justify-center"
            >
              <Download className="w-5 h-5" />
              PDF로 저장하기
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderMyPage = () => (
    <div className="max-w-[720px] mx-auto px-[16px] py-[32px] pb-[100px]">
      <h2 className="text-[24px] font-bold mb-[24px]">마이페이지</h2>
      
      {!isLoggedIn ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[20px] p-[40px] text-center shadow-sm">
          <div className="w-20 h-20 bg-[var(--bg-muted)] rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCircle className="w-10 h-10 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-[20px] font-bold mb-3 text-[var(--text-main)]">로그인이 필요합니다</h3>
          <p className="text-[var(--text-secondary)] text-[15px] mb-8 leading-[1.6]">
            3초 만에 로그인하고<br/>나만의 사주 결과를 평생 소장하세요.
          </p>
          <button onClick={() => setShowLogin(true)} className="px-[24px] py-[16px] bg-[#FEE500] hover:bg-[#F4DC00] text-[#000000] rounded-[12px] font-bold w-full max-w-[280px] mx-auto flex items-center justify-center gap-2 transition-colors">
            <MessageCircle className="w-5 h-5" /> 카카오로 시작하기
          </button>
        </div>
      ) : (
        <div className="space-y-[24px]">
          {/* Profile Summary */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[20px] p-[24px] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-gradient-end)] rounded-full flex items-center justify-center text-[var(--bg-main)] shadow-inner">
                <span className="text-[24px] font-bold">{sajuForm.name ? sajuForm.name.charAt(0) : '사'}</span>
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-[var(--text-main)] mb-1">
                  {isLoggedIn ? (user?.user_metadata?.full_name || user?.email?.split('@')[0] || '회원') : (sajuForm.name || '김사주')} 님
                </h3>
                <p className="text-[14px] text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {sajuForm.birthYear || '1990'}.{sajuForm.birthMonth ? sajuForm.birthMonth.padStart(2, '0') : '05'}.{sajuForm.birthDay ? sajuForm.birthDay.padStart(2, '0') : '15'} 
                  <span className="bg-[var(--bg-muted)] px-2 py-0.5 rounded text-[12px] ml-1">
                    {sajuForm.calendarType === 'solar' ? '양력' : sajuForm.calendarType === 'lunar' ? '음력' : '윤달'}
                  </span>
                </p>
              </div>
            </div>
            <button className="text-[14px] text-[var(--text-secondary)] font-medium hover:text-[var(--text-main)] transition-colors bg-[var(--bg-input)] px-4 py-2 rounded-[8px]">
              수정
            </button>
          </div>

          {/* Wallet */}
          <div className="bg-[var(--text-main)] rounded-[20px] p-[24px] text-[var(--bg-main)] flex justify-between items-center shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--bg-card)] opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
            <div className="relative z-10">
              <p className="text-[14px] text-[var(--text-muted)] mb-2 font-medium">보유 재화</p>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <div className="bg-[var(--bg-muted)] p-1.5 rounded-full"><Coins className="w-5 h-5 text-[#F59E0B] dark:text-[#FCD34D]" /></div>
                  <span className="font-bold text-[24px]">{mainCoin}</span>
                </div>
                <div className="w-[1px] h-6 bg-[var(--bg-muted)]"></div>
                <div className="flex items-center gap-2">
                  <div className="bg-[var(--bg-muted)] p-1.5 rounded-full"><Gift className="w-5 h-5 text-[var(--primary)]" /></div>
                  <span className="font-bold text-[24px]">{bonusCoin}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setShowStore(true)} className="relative z-10 bg-[var(--bg-card)] hover:bg-[var(--bg-muted)] text-[var(--text-main)] px-5 py-2.5 rounded-[10px] text-[14px] font-bold transition-colors">
              충전하기
            </button>
          </div>

          {/* Storage */}
          <div>
            <div className="flex items-center justify-between mb-[16px]">
              <h3 className="text-[18px] font-bold text-[var(--text-main)]">보관함</h3>
              <span className="text-[13px] text-[var(--text-secondary)] bg-[var(--bg-muted)] px-2 py-1 rounded-full">총 1건</span>
            </div>
            <div className="space-y-3">
              <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[16px] p-[20px] flex justify-between items-center cursor-pointer hover:border-[var(--primary)] hover:shadow-md transition-all group" onClick={() => setActiveTab('saju')}>
                <div className="flex items-center gap-4">
                  <div className="bg-[var(--primary-light)] p-3 rounded-full text-[var(--primary)] group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[16px] text-[var(--text-main)] mb-1">나의 종합 사주 분석</h4>
                    <p className="text-[13px] text-[var(--text-muted)] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 2026.02.28 열람 완료
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowShare(true);
                    }}
                    className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-muted)] rounded-full transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <ChevronDown className="w-5 h-5 text-[#D1D5DB] dark:text-[#6B7280] -rotate-90 group-hover:text-[var(--primary)] transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStoreModal = () => {
    if (!showStore) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0F172A]/60 dark:bg-[#000000]/80 backdrop-blur-sm" onClick={() => setShowStore(false)}>
        <div className="bg-[var(--bg-card)] w-full sm:max-w-md rounded-t-[24px] sm:rounded-[24px] p-[24px] pb-safe shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[20px] font-bold">재화 충전소</h3>
            <button onClick={() => setShowStore(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-3 mb-6">
            {/* 990 KRW */}
            <button onClick={() => buyCoins(1, 0)} className="w-full flex items-center justify-between p-4 border border-[var(--border-main)] rounded-[12px] hover:border-[var(--primary)] hover:bg-[var(--primary-light)]/30 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="bg-[var(--bg-muted)] p-2 rounded-full"><Coins className="w-6 h-6 text-[#F59E0B] dark:text-[#FCD34D]" /></div>
                <div>
                  <div className="font-bold text-[16px]">재화 1개</div>
                  <div className="text-[12px] text-[var(--text-secondary)]">사주 1회 열람 가능</div>
                </div>
              </div>
              <div className="font-bold text-[16px] text-[var(--primary)]">990원</div>
            </button>

            {/* 4,900 KRW */}
            <button onClick={() => buyCoins(5, 1)} className="w-full flex items-center justify-between p-4 border border-[var(--primary)] bg-[var(--primary-light)]/10 rounded-[12px] hover:bg-[var(--primary-light)]/30 transition-all text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[var(--primary)] text-[var(--bg-main)] text-[10px] font-bold px-2 py-1 rounded-bl-[8px]">BEST</div>
              <div className="flex items-center gap-3">
                <div className="bg-[var(--bg-muted)] p-2 rounded-full relative">
                  <Coins className="w-6 h-6 text-[#F59E0B] dark:text-[#FCD34D]" />
                  <Gift className="w-4 h-4 text-[var(--primary)] absolute -bottom-1 -right-1" />
                </div>
                <div>
                  <div className="font-bold text-[16px]">재화 5개 <span className="text-[var(--primary)]">+1 보너스</span></div>
                  <div className="text-[12px] text-[var(--text-secondary)]">총 6회 열람 가능</div>
                </div>
              </div>
              <div className="font-bold text-[16px] text-[var(--primary)]">4,900원</div>
            </button>

            {/* 9,900 KRW */}
            <button onClick={() => buyCoins(10, 3)} className="w-full flex items-center justify-between p-4 border border-[var(--border-main)] rounded-[12px] hover:border-[var(--primary)] hover:bg-[var(--primary-light)]/30 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="bg-[var(--bg-muted)] p-2 rounded-full relative">
                  <Coins className="w-6 h-6 text-[#F59E0B] dark:text-[#FCD34D]" />
                  <Gift className="w-5 h-5 text-[var(--primary)] absolute -bottom-2 -right-2" />
                </div>
                <div>
                  <div className="font-bold text-[16px]">재화 10개 <span className="text-[var(--primary)]">+3 보너스</span></div>
                  <div className="text-[12px] text-[var(--text-secondary)]">총 13회 열람 가능</div>
                </div>
              </div>
              <div className="font-bold text-[16px] text-[var(--primary)]">9,900원</div>
            </button>
          </div>

          <div className="text-[11px] text-[var(--text-muted)] text-center bg-[var(--bg-input)] p-3 rounded-[8px]">
            결제 시 토스페이, 카카오페이, 신용/체크카드를 지원합니다.<br/>
            보너스 재화는 주재화 소진 후 사용됩니다.
          </div>
        </div>
      </div>
    );
  };

  const handleShare = async (type: 'kakao' | 'link') => {
    if (type === 'kakao') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: '인사주(inSaju)',
            text: '나만의 사주 분석 결과를 확인해보세요!',
            url: window.location.href,
          });
        } catch (err) {
          console.error('Share failed:', err);
        }
      } else {
        alert('현재 환경에서는 카카오톡 공유를 지원하지 않습니다. 링크 복사를 이용해주세요.');
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 복사되었습니다.');
      } catch (err) {
        alert('링크 복사에 실패했습니다.');
      }
    }
    setShowShare(false);
  };

  const renderShareModal = () => {
    if (!showShare) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0F172A]/60 dark:bg-[#000000]/80 backdrop-blur-sm" onClick={() => setShowShare(false)}>
        <div className="bg-[var(--bg-card)] w-full sm:max-w-sm rounded-t-[24px] sm:rounded-[24px] p-[24px] pb-safe shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[18px] font-bold">사주 결과 공유하기</h3>
            <button onClick={() => setShowShare(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleShare('kakao')} className="flex flex-col items-center justify-center gap-2 p-4 bg-[#FEE500]/10 rounded-[12px] hover:bg-[#FEE500]/20 transition-colors">
              <div className="w-12 h-12 bg-[#FEE500] rounded-full flex items-center justify-center text-black">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-[13px] font-medium">카카오톡</span>
            </button>
            <button onClick={() => handleShare('link')} className="flex flex-col items-center justify-center gap-2 p-4 bg-[var(--bg-muted)] rounded-[12px] hover:bg-[var(--border-main)] transition-colors">
              <div className="w-12 h-12 bg-[var(--bg-card)] rounded-full flex items-center justify-center text-[var(--text-main)] shadow-sm">
                <LinkIcon className="w-6 h-6" />
              </div>
              <span className="text-[13px] font-medium">링크 복사</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMatchInput = () => (
    <div className="p-[20px] max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 pb-[100px]">
      <h2 className="text-[24px] font-bold mb-6">나와 그 사람의<br/><span className="text-[var(--primary)]">우주적 연결고리</span></h2>
      
      <div className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-main)] mb-6">
        <h3 className="font-bold mb-4 text-[var(--text-main)]">나의 정보</h3>
        {savedProfiles.length > 0 ? (
          <select 
            className="w-full h-12 bg-[var(--bg-input)] rounded-xl px-4 border border-[var(--border-main)] focus:outline-none focus:border-[var(--primary)] mb-4"
            value={matchForm.myProfileId || ''}
            onChange={(e) => {
              const profile = savedProfiles.find(p => p.id === e.target.value);
              if (profile) {
                setMatchForm({ ...matchForm, myProfileId: profile.id, myData: profile });
              } else {
                setMatchForm({ ...matchForm, myProfileId: '' });
              }
            }}
          >
            <option value="">새로 입력하기</option>
            {savedProfiles.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.birthYear}.{p.birthMonth}.{p.birthDay})</option>
            ))}
          </select>
        ) : null}
        
        {!matchForm.myProfileId && (
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="이름" 
              value={matchForm.myData.name}
              onChange={e => setMatchForm({...matchForm, myData: {...matchForm.myData, name: e.target.value}})}
              className="w-full h-12 bg-[var(--bg-input)] rounded-xl px-4 border border-[var(--border-main)] focus:outline-none focus:border-[var(--primary)]" 
            />
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setMatchForm({...matchForm, myData: {...matchForm.myData, gender: 'female'}})}
                className={`flex-1 h-12 rounded-xl border font-medium transition-colors ${matchForm.myData.gender === 'female' ? 'bg-[var(--primary-lighter)] border-[var(--primary)] text-[var(--primary)]' : 'bg-[var(--bg-input)] border-[var(--border-main)] text-[var(--text-secondary)]'}`}
              >
                여성
              </button>
              <button 
                type="button"
                onClick={() => setMatchForm({...matchForm, myData: {...matchForm.myData, gender: 'male'}})}
                className={`flex-1 h-12 rounded-xl border font-medium transition-colors ${matchForm.myData.gender === 'male' ? 'bg-[#F0F7FF] dark:bg-[#4A90E2]/20 border-[#4A90E2] dark:border-[#4A90E2]/50 text-[#4A90E2] dark:text-[#6BA4E9]' : 'bg-[var(--bg-input)] border-[var(--border-main)] text-[var(--text-secondary)]'}`}
              >
                남성
              </button>
            </div>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setMatchForm({...matchForm, myData: {...matchForm.myData, calendarType: 'solar'}})}
                className={`flex-1 h-12 rounded-xl border font-medium transition-colors ${matchForm.myData.calendarType === 'solar' ? 'bg-[var(--primary-lighter)] border-[var(--primary)] text-[var(--primary)]' : 'bg-[var(--bg-input)] border-[var(--border-main)] text-[var(--text-secondary)]'}`}
              >
                양력
              </button>
              <button 
                type="button"
                onClick={() => setMatchForm({...matchForm, myData: {...matchForm.myData, calendarType: 'lunar'}})}
                className={`flex-1 h-12 rounded-xl border font-medium transition-colors ${matchForm.myData.calendarType === 'lunar' ? 'bg-[var(--primary-lighter)] border-[var(--primary)] text-[var(--primary)]' : 'bg-[var(--bg-input)] border-[var(--border-main)] text-[var(--text-secondary)]'}`}
              >
                음력
              </button>
              {matchForm.myData.calendarType.startsWith('lunar') && (
                <button 
                  type="button"
                  onClick={() => setMatchForm({...matchForm, myData: {...matchForm.myData, calendarType: matchForm.myData.calendarType === 'lunar' ? 'lunar_leap' : 'lunar'}})}
                  className={`flex-1 h-12 rounded-xl border font-medium transition-colors ${matchForm.myData.calendarType === 'lunar_leap' ? 'bg-[var(--primary-lighter)] border-[var(--primary)] text-[var(--primary)]' : 'bg-[var(--bg-input)] border-[var(--border-main)] text-[var(--text-secondary)]'}`}
                >
                  윤달
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="YYYY" 
                value={matchForm.myData.birthYear}
                onChange={e => setMatchForm({...matchForm, myData: {...matchForm.myData, birthYear: e.target.value}})}
                className="flex-1 min-w-0 h-12 bg-[var(--bg-input)] rounded-xl px-2 border border-[var(--border-main)] focus:outline-none focus:border-[var(--primary)] text-center" 
              />
              <input 
                type="number" 
                placeholder="MM" 
                value={matchForm.myData.birthMonth}
                onChange={e => setMatchForm({...matchForm, myData: {...matchForm.myData, birthMonth: e.target.value}})}
                className="flex-1 min-w-0 h-12 bg-[var(--bg-input)] rounded-xl px-2 border border-[var(--border-main)] focus:outline-none focus:border-[var(--primary)] text-center" 
              />
              <input 
                type="number" 
                placeholder="DD" 
                value={matchForm.myData.birthDay}
                onChange={e => setMatchForm({...matchForm, myData: {...matchForm.myData, birthDay: e.target.value}})}
                className="flex-1 min-w-0 h-12 bg-[var(--bg-input)] rounded-xl px-2 border border-[var(--border-main)] focus:outline-none focus:border-[var(--primary)] text-center" 
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="time" 
                disabled={matchForm.myData.isTimeUnknown}
                value={matchForm.myData.birthTime}
                onChange={e => setMatchForm({...matchForm, myData: {...matchForm.myData, birthTime: e.target.value}})}
                className={`flex-1 min-w-0 h-12 rounded-xl px-4 border focus:outline-none focus:border-[var(--primary)] ${matchForm.myData.isTimeUnknown ? 'bg-[var(--bg-muted)] border-[var(--border-main)] text-[var(--text-muted)]' : 'bg-[var(--bg-input)] border-[var(--border-main)]'}`} 
              />
              <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap px-2">
                <input 
                  type="checkbox" 
                  checked={matchForm.myData.isTimeUnknown}
                  onChange={e => setMatchForm({...matchForm, myData: {...matchForm.myData, isTimeUnknown: e.target.checked}})}
                  className="w-4 h-4 accent-[var(--primary)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">모름</span>
              </label>
            </div>
            
            <AdvancedSettings data={matchForm.myData} onChange={(data) => setMatchForm({...matchForm, myData: data})} />
          </div>
        )}
      </div>

      <div className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-main)] mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] to-[#4ECDC4]"></div>
        <h3 className="font-bold mb-4 text-[var(--text-main)]">상대방 정보</h3>
        {savedProfiles.length > 0 ? (
          <select 
            className="w-full h-12 bg-[var(--bg-input)] rounded-xl px-4 border border-[var(--border-main)] focus:outline-none focus:border-[var(--primary)] mb-4"
            value={matchForm.partnerProfileId || ''}
            onChange={(e) => {
              const profile = savedProfiles.find(p => p.id === e.target.value);
              if (profile) {
                setMatchForm({ ...matchForm, partnerProfileId: profile.id, partnerData: profile });
              } else {
                setMatchForm({ ...matchForm, partnerProfileId: '' });
              }
            }}
          >
            <option value="">새로 입력하기</option>
            {savedProfiles.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.birthYear}.{p.birthMonth}.{p.birthDay})</option>
            ))}
          </select>
        ) : null}

        {!matchForm.partnerProfileId && (
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="이름" 
              value={matchForm.partnerData.name}
              onChange={e => setMatchForm({...matchForm, partnerData: {...matchForm.partnerData, name: e.target.value}})}
              className="w-full h-12 bg-[var(--bg-input)] rounded-xl px-4 border border-[var(--border-main)] focus:outline-none focus:border-[var(--primary)]" 
            />
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setMatchForm({...matchForm, partnerData: {...matchForm.partnerData, gender: 'female'}})}
                className={`flex-1 h-12 rounded-xl border font-medium transition-colors ${matchForm.partnerData.gender === 'female' ? 'bg-[var(--primary-lighter)] border-[var(--primary)] text-[var(--primary)]' : 'bg-[var(--bg-input)] border-[var(--border-main)] text-[var(--text-secondary)]'}`}
              >
                여성
              </button>
              <button 
                type="button"
                onClick={() => setMatchForm({...matchForm, partnerData: {...matchForm.partnerData, gender: 'male'}})}
                className={`flex-1 h-12 rounded-xl border font-medium transition-colors ${matchForm.partnerData.gender === 'male' ? 'bg-[#F0F7FF] dark:bg-[#4A90E2]/20 border-[#4A90E2] dark:border-[#4A90E2]/50 text-[#4A90E2] dark:text-[#6BA4E9]' : 'bg-[var(--bg-input)] border-[var(--border-main)] text-[var(--text-secondary)]'}`}
              >
                남성
              </button>
            </div>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setMatchForm({...matchForm, partnerData: {...matchForm.partnerData, calendarType: 'solar'}})}
                className={`flex-1 h-12 rounded-xl border font-medium transition-colors ${matchForm.partnerData.calendarType === 'solar' ? 'bg-[var(--primary-lighter)] border-[var(--primary)] text-[var(--primary)]' : 'bg-[var(--bg-input)] border-[var(--border-main)] text-[var(--text-secondary)]'}`}
              >
                양력
              </button>
              <button 
                type="button"
                onClick={() => setMatchForm({...matchForm, partnerData: {...matchForm.partnerData, calendarType: 'lunar'}})}
                className={`flex-1 h-12 rounded-xl border font-medium transition-colors ${matchForm.partnerData.calendarType === 'lunar' ? 'bg-[var(--primary-lighter)] border-[var(--primary)] text-[var(--primary)]' : 'bg-[var(--bg-input)] border-[var(--border-main)] text-[var(--text-secondary)]'}`}
              >
                음력
              </button>
              {matchForm.partnerData.calendarType.startsWith('lunar') && (
                <button 
                  type="button"
                  onClick={() => setMatchForm({...matchForm, partnerData: {...matchForm.partnerData, calendarType: matchForm.partnerData.calendarType === 'lunar' ? 'lunar_leap' : 'lunar'}})}
                  className={`flex-1 h-12 rounded-xl border font-medium transition-colors ${matchForm.partnerData.calendarType === 'lunar_leap' ? 'bg-[var(--primary-lighter)] border-[var(--primary)] text-[var(--primary)]' : 'bg-[var(--bg-input)] border-[var(--border-main)] text-[var(--text-secondary)]'}`}
                >
                  윤달
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="YYYY" 
                value={matchForm.partnerData.birthYear}
                onChange={e => setMatchForm({...matchForm, partnerData: {...matchForm.partnerData, birthYear: e.target.value}})}
                className="flex-1 min-w-0 h-12 bg-[var(--bg-input)] rounded-xl px-2 border border-[var(--border-main)] focus:outline-none focus:border-[var(--primary)] text-center" 
              />
              <input 
                type="number" 
                placeholder="MM" 
                value={matchForm.partnerData.birthMonth}
                onChange={e => setMatchForm({...matchForm, partnerData: {...matchForm.partnerData, birthMonth: e.target.value}})}
                className="flex-1 min-w-0 h-12 bg-[var(--bg-input)] rounded-xl px-2 border border-[var(--border-main)] focus:outline-none focus:border-[var(--primary)] text-center" 
              />
              <input 
                type="number" 
                placeholder="DD" 
                value={matchForm.partnerData.birthDay}
                onChange={e => setMatchForm({...matchForm, partnerData: {...matchForm.partnerData, birthDay: e.target.value}})}
                className="flex-1 min-w-0 h-12 bg-[var(--bg-input)] rounded-xl px-2 border border-[var(--border-main)] focus:outline-none focus:border-[var(--primary)] text-center" 
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="time" 
                disabled={matchForm.partnerData.isTimeUnknown}
                value={matchForm.partnerData.birthTime}
                onChange={e => setMatchForm({...matchForm, partnerData: {...matchForm.partnerData, birthTime: e.target.value}})}
                className={`flex-1 min-w-0 h-12 rounded-xl px-4 border focus:outline-none focus:border-[var(--primary)] ${matchForm.partnerData.isTimeUnknown ? 'bg-[var(--bg-muted)] border-[var(--border-main)] text-[var(--text-muted)]' : 'bg-[var(--bg-input)] border-[var(--border-main)]'}`} 
              />
              <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap px-2">
                <input 
                  type="checkbox" 
                  checked={matchForm.partnerData.isTimeUnknown}
                  onChange={e => setMatchForm({...matchForm, partnerData: {...matchForm.partnerData, isTimeUnknown: e.target.checked}})}
                  className="w-4 h-4 accent-[var(--primary)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">모름</span>
              </label>
            </div>
            
            <AdvancedSettings data={matchForm.partnerData} onChange={(data) => setMatchForm({...matchForm, partnerData: data})} />
          </div>
        )}
      </div>

      <div className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-main)] mb-6">
        <h3 className="font-bold mb-4 text-[var(--text-main)]">어떤 관계인가요?</h3>
        <select 
          value={matchForm.relationship}
          onChange={e => setMatchForm({...matchForm, relationship: e.target.value as any})}
          className="w-full h-12 bg-[var(--bg-input)] rounded-xl px-4 border border-[var(--border-main)] focus:outline-none focus:border-[var(--primary)]"
        >
          <option value="연인/부부">연인/부부</option>
          <option value="친구/동료">친구/동료</option>
          <option value="가족">가족</option>
          <option value="비즈니스">비즈니스 파트너</option>
        </select>
      </div>

      <button 
        onClick={() => {
          if (!matchForm.myData.name || !matchForm.partnerData.name) {
            showToast('이름을 모두 입력해주세요.');
            return;
          }
          if (!matchForm.myProfileId) saveProfile(matchForm.myData);
          if (!matchForm.partnerProfileId) saveProfile(matchForm.partnerData);

          setIsLoading(true);
          import('./api/saju').then(({ analyzeMatch }) => {
            analyzeMatch(matchForm).then(res => {
              setMatchResult(res);
              setIsLoading(false);
              setMatchStep('result');
            }).catch(err => {
              console.error(err);
              showToast('궁합 분석 중 오류가 발생했습니다.');
              setIsLoading(false);
            });
          });
        }} 
        disabled={isLoading}
        className={`w-full py-4 text-[var(--bg-main)] rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2 ${isLoading ? 'bg-[var(--text-secondary)] opacity-80 cursor-not-allowed' : 'bg-[var(--text-main)] hover:bg-[var(--text-main)]'}`}
      >
        {isLoading ? <Sparkles className="w-5 h-5 animate-spin" /> : '궁합 분석하기'}
      </button>
    </div>
  );

  const renderMatchResult = () => {
    if (!matchResult) return null;
    return (
      <div className="p-[20px] max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 pb-[100px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--primary-light)] rounded-full mb-4">
            <Sparkles className="w-10 h-10 text-[var(--primary)]" />
          </div>
          <h2 className="text-[24px] font-bold mb-2 whitespace-pre-wrap">{matchResult.headline}</h2>
          <p className="text-[var(--text-secondary)] text-lg font-bold">궁합 점수: {matchResult.score}점</p>
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-main)] mb-6">
          <h3 className="font-bold mb-4 text-[var(--text-main)] text-center">두 사람의 만세력</h3>
          
          <div className="mb-6">
            <h4 className="text-sm font-bold text-[var(--primary)] mb-2">{matchForm.myData.name}님의 사주</h4>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="text-[11px] text-[var(--text-muted)] mb-1">시주</div>
                <div className="bg-[var(--bg-input)] rounded-lg p-2">
                  <div className="text-[18px] font-bold mb-1" style={{ color: matchResult.myChart.time.stem.color }}>{matchResult.myChart.time.stem.hanja}</div>
                  <div className="text-[18px] font-bold" style={{ color: matchResult.myChart.time.branch.color }}>{matchResult.myChart.time.branch.hanja}</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-[11px] text-[var(--text-muted)] mb-1">일주</div>
                <div className="bg-[var(--primary-lighter)] border border-[var(--primary)]/30 rounded-lg p-2">
                  <div className="text-[18px] font-bold mb-1" style={{ color: matchResult.myChart.day.stem.color }}>{matchResult.myChart.day.stem.hanja}</div>
                  <div className="text-[18px] font-bold" style={{ color: matchResult.myChart.day.branch.color }}>{matchResult.myChart.day.branch.hanja}</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-[11px] text-[var(--text-muted)] mb-1">월주</div>
                <div className="bg-[var(--bg-input)] rounded-lg p-2">
                  <div className="text-[18px] font-bold mb-1" style={{ color: matchResult.myChart.month.stem.color }}>{matchResult.myChart.month.stem.hanja}</div>
                  <div className="text-[18px] font-bold" style={{ color: matchResult.myChart.month.branch.color }}>{matchResult.myChart.month.branch.hanja}</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-[11px] text-[var(--text-muted)] mb-1">년주</div>
                <div className="bg-[var(--bg-input)] rounded-lg p-2">
                  <div className="text-[18px] font-bold mb-1" style={{ color: matchResult.myChart.year.stem.color }}>{matchResult.myChart.year.stem.hanja}</div>
                  <div className="text-[18px] font-bold" style={{ color: matchResult.myChart.year.branch.color }}>{matchResult.myChart.year.branch.hanja}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#4A90E2] dark:text-[#6BA4E9] mb-2">{matchForm.partnerData.name}님의 사주</h4>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="text-[11px] text-[var(--text-muted)] mb-1">시주</div>
                <div className="bg-[var(--bg-input)] rounded-lg p-2">
                  <div className="text-[18px] font-bold mb-1" style={{ color: matchResult.partnerChart.time.stem.color }}>{matchResult.partnerChart.time.stem.hanja}</div>
                  <div className="text-[18px] font-bold" style={{ color: matchResult.partnerChart.time.branch.color }}>{matchResult.partnerChart.time.branch.hanja}</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-[11px] text-[var(--text-muted)] mb-1">일주</div>
                <div className="bg-[#F0F7FF] dark:bg-[#4A90E2]/20 border border-[#D6E8FF] dark:border-[#4A90E2]/30 rounded-lg p-2">
                  <div className="text-[18px] font-bold mb-1" style={{ color: matchResult.partnerChart.day.stem.color }}>{matchResult.partnerChart.day.stem.hanja}</div>
                  <div className="text-[18px] font-bold" style={{ color: matchResult.partnerChart.day.branch.color }}>{matchResult.partnerChart.day.branch.hanja}</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-[11px] text-[var(--text-muted)] mb-1">월주</div>
                <div className="bg-[var(--bg-input)] rounded-lg p-2">
                  <div className="text-[18px] font-bold mb-1" style={{ color: matchResult.partnerChart.month.stem.color }}>{matchResult.partnerChart.month.stem.hanja}</div>
                  <div className="text-[18px] font-bold" style={{ color: matchResult.partnerChart.month.branch.color }}>{matchResult.partnerChart.month.branch.hanja}</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-[11px] text-[var(--text-muted)] mb-1">년주</div>
                <div className="bg-[var(--bg-input)] rounded-lg p-2">
                  <div className="text-[18px] font-bold mb-1" style={{ color: matchResult.partnerChart.year.stem.color }}>{matchResult.partnerChart.year.stem.hanja}</div>
                  <div className="text-[18px] font-bold" style={{ color: matchResult.partnerChart.year.branch.color }}>{matchResult.partnerChart.year.branch.hanja}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-main)] mb-6">
          <h3 className="font-bold mb-4 text-[var(--text-main)]">관계의 핵심 키워드</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {matchResult.keywords.map((kw, i) => (
              <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">{kw}</span>
            ))}
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed text-sm whitespace-pre-wrap">
            {matchResult.summary}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {matchResult.insights.map((insight, idx) => (
            <div key={idx} className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-main)]">
              <h4 className="font-bold text-[var(--primary)] mb-2">{insight.category}</h4>
              <h5 className="font-bold text-[var(--text-main)] mb-3">{insight.hook}</h5>
              <div className="space-y-3">
                {insight.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-sm text-[var(--text-secondary)] leading-relaxed">{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => setMatchStep('input')} className="w-full py-4 bg-[var(--bg-muted)] text-[var(--text-secondary)] rounded-2xl font-bold text-lg hover:bg-[var(--border-main)] transition-colors">
          다시 분석하기
        </button>
      </div>
    );
  };

  const renderNewyearInput = () => (
    <div className="p-[20px] max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-[24px] font-bold mb-6">2026년,<br/><span className="text-[var(--primary)]">당신의 새로운 챕터</span></h2>
      <div className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-main)] mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-[var(--text-main)]">분석할 연도</h3>
          <select className="bg-[var(--bg-input)] border border-[var(--border-main)] rounded-lg px-3 py-1 font-medium focus:outline-none">
            <option>2026년 (병오년)</option>
            <option>2027년 (정미년)</option>
          </select>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-4">내 정보는 내 사주에서 입력한 정보로 자동 설정됩니다.</p>
        <div className="h-12 bg-[var(--bg-input)] rounded-xl flex items-center px-4 text-[var(--text-muted)] border border-[var(--border-main)]">
          {sajuForm.name || '이름을 입력해주세요'}
        </div>
      </div>
      <button 
        onClick={() => {
          setIsLoading(true);
          // Simulate analysis time
          setTimeout(() => {
            setIsLoading(false);
            setNewyearStep('result');
          }, 2500);
        }} 
        className="w-full py-4 bg-[var(--text-main)] text-[var(--bg-main)] rounded-2xl font-bold text-lg hover:bg-[var(--text-main)] transition-colors"
      >
        신년운세 분석하기
      </button>
    </div>
  );

  const renderNewyearResult = () => (
    <div className="p-[20px] max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FFF8E1] dark:bg-[#F57F17]/20 rounded-full mb-4">
          <Sparkles className="w-10 h-10 text-[#F57F17] dark:text-[#FBC02D]" />
        </div>
        <h2 className="text-[24px] font-bold mb-2">2026년 병오년,<br/><span className="text-[#F57F17] dark:text-[#FBC02D]">도약의 해가 될 것입니다</span></h2>
        <p className="text-[var(--text-secondary)]">올해의 테마: 확장과 성취</p>
      </div>
      <div className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-main)] mb-6">
        <h3 className="font-bold mb-4 text-[var(--text-main)]">월별 운세 흐름</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[var(--bg-input)] rounded-xl flex flex-col items-center justify-center shrink-0">
              <span className="text-xs text-[var(--text-muted)] font-bold">상반기</span>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1">씨앗을 뿌리는 시기</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">새로운 프로젝트나 공부를 시작하기 좋습니다. 당장의 성과보다는 기반을 다지는 데 집중하세요.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[var(--primary-light)] rounded-xl flex flex-col items-center justify-center shrink-0">
              <span className="text-xs text-[var(--primary)] font-bold">하반기</span>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1">수확의 기쁨</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">상반기의 노력이 결실을 맺습니다. 특히 재물운과 직업운이 크게 상승하는 시기입니다.</p>
            </div>
          </div>
        </div>
      </div>
      <button onClick={() => setNewyearStep('input')} className="w-full py-4 bg-[var(--bg-muted)] text-[var(--text-secondary)] rounded-2xl font-bold text-lg hover:bg-[var(--border-main)] transition-colors">
        다시 분석하기
      </button>
    </div>
  );

  const renderLoginModal = () => {
    if (!showLogin) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0F172A]/60 dark:bg-[#000000]/80 backdrop-blur-sm" onClick={() => setShowLogin(false)}>
        <div className="bg-[var(--bg-card)] w-full sm:max-w-sm rounded-t-[24px] sm:rounded-[24px] p-[24px] pb-safe shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[20px] font-bold">로그인 / 회원가입</h3>
            <button onClick={() => setShowLogin(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[var(--primary-light)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <p className="text-[var(--text-secondary)] text-[15px]">3초 만에 로그인하고<br/>나만의 사주 결과를 평생 소장하세요.</p>
          </div>
          <div className="space-y-3">
            <button onClick={handleKakaoLogin} className="w-full py-[14px] bg-[#FEE500] hover:bg-[#F4DC00] text-[#000000] rounded-[12px] text-[15px] font-bold transition-colors flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" /> 카카오로 시작하기
            </button>
            <button onClick={handleGoogleLogin} className="w-full py-[14px] bg-[var(--bg-main)] hover:bg-[var(--bg-muted)] text-[var(--text-main)] border border-[var(--border-main)] rounded-[12px] text-[15px] font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 시작하기
            </button>
            <button onClick={handleLoginSuccess} className="w-full py-[14px] bg-[#03C75A] hover:bg-[#02b351] text-[var(--bg-main)] rounded-[12px] text-[15px] font-bold transition-colors flex items-center justify-center gap-2">
              <div className="w-5 h-5 bg-[var(--bg-card)] text-[#03C75A] rounded-sm flex items-center justify-center text-[12px] font-black">N</div> 네이버로 시작하기
            </button>
            <button onClick={handleLoginSuccess} className="w-full py-[14px] bg-[var(--bg-card)] border border-[var(--border-main)] hover:bg-[var(--bg-muted)] text-[var(--text-main)] rounded-[12px] text-[15px] font-bold transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> 구글로 시작하기
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-input)] text-[var(--text-main)] font-sans">
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen />
        )}
      </AnimatePresence>
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-[var(--text-main)] text-[var(--bg-main)] px-4 py-2 rounded-full shadow-lg text-sm animate-in fade-in slide-in-from-top-4">
          {toastMessage}
        </div>
      )}
      {renderHeader()}
      
      <div className="pb-[64px]">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'saju' && (sajuStep === 'input' ? renderSajuInput() : renderSajuResult())}
        {activeTab === 'mypage' && renderMyPage()}
        {activeTab === 'match' && (matchStep === 'input' ? renderMatchInput() : renderMatchResult())}
        {activeTab === 'newyear' && (newyearStep === 'input' ? renderNewyearInput() : renderNewyearResult())}
      </div>

      {renderBottomNav()}
      {renderStoreModal()}
      {renderShareModal()}
      {renderLoginModal()}
      <HanjaDetailModal 
        isOpen={!!selectedHanja} 
        onClose={() => setSelectedHanja(null)} 
        hanja={selectedHanja?.hanja || ''} 
        name={selectedHanja?.name || ''}
        pillarType={selectedHanja?.pillarType || ''}
        detail={hanjaDetail}
        isLoading={isHanjaLoading}
      />
      <TermDetailModal 
        isOpen={!!selectedTerm} 
        onClose={() => setSelectedTerm(null)} 
        term={selectedTerm?.term || ''} 
        pillarType={selectedTerm?.pillarType || ''}
        detail={termDetail}
        isLoading={isTermLoading}
      />
    </div>
  );
}
