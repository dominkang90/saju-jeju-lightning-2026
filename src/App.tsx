import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Sparkles, X, BookOpen, User, Heart, Briefcase, Lock, Bell, CheckCircle2, CreditCard, Share2, Home, Users, Calendar, UserCircle, Coins, Gift, MessageCircle, Link as LinkIcon } from 'lucide-react';
import { analyzeSaju } from './api/saju';
import { SajuFormPayload, SajuResultData } from './types/saju';

// --- Mock Data ---
const SAJU_TERMS: Record<string, { title: string; desc: string; detail: string; advice: string }> = {
  '태극귀인': {
    title: '태극귀인 (太極貴人)',
    desc: '시작과 끝을 의미하며, 어떤 일을 하든 결국 큰 성과를 거두고 타인의 도움을 받아 부귀영화를 누릴 수 있는 아주 좋은 길성(행운의 별)입니다.',
    detail: '태극(太極)은 우주의 근원, 즉 만물의 시작과 끝을 의미합니다. 사주에 태극귀인이 있으면 초년에는 다소 고생할 수 있으나, 중년 이후부터는 뜻밖의 귀인을 만나거나 자신의 노력이 크게 빛을 발하여 부귀영화를 누리게 됩니다. 특히 타인의 도움을 끌어당기는 힘이 강해 "인덕이 있다"는 소리를 자주 듣게 됩니다.',
    advice: '당장 성과가 보이지 않더라도 포기하지 마세요. 당신의 노력은 반드시 누군가 지켜보고 있으며, 결정적인 순간에 큰 도움으로 돌아올 것입니다.'
  },
  '나체도화': {
    title: '나체도화 (裸體桃花)',
    desc: '일반적인 도화살보다 더 강한 매력을 뜻합니다. 숨기려 해도 드러나는 치명적인 매력으로 사람을 끌어당기지만, 구설수에 오를 수 있어 관리가 필요한 기운입니다.',
    detail: '나체(裸體)라는 말처럼 꾸미지 않아도 본연의 매력이 강하게 발산되는 기운입니다. 연예인, 인플루언서, 영업직 등 사람의 마음을 사로잡아야 하는 직업에서 엄청난 무기가 됩니다. 하지만 의도치 않게 이성의 오해를 사거나 구설수에 오르기 쉽고, 에너지를 빼앗는 사람(소위 "똥파리")이 꼬일 확률도 높습니다.',
    advice: '모든 사람에게 친절할 필요는 없습니다. 맺고 끊음을 확실히 하고, 당신의 매력을 질투하는 사람들의 시선을 너무 의식하지 마세요.'
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

// 1. Terminology Popup Modal
const TermModal = ({ term, onClose }: { term: string; onClose: () => void }) => {
  const data = SAJU_TERMS[term];
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[20px] p-6 max-w-sm w-full shadow-[0_12px_30px_rgba(15,23,42,0.12)] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-2 text-[#FF6B6B]">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-[20px] font-bold text-[#111111]">{data.title}</h3>
          </div>
          <button onClick={onClose} className="text-[#999999] hover:text-[#111111] transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-[#F7F7F9] p-4 rounded-[12px]">
            <h4 className="text-[13px] font-bold text-[#666666] mb-1">핵심 요약</h4>
            <p className="text-[#111111] leading-[1.5] text-[15px] font-medium">
              {data.desc}
            </p>
          </div>
          
          <div>
            <h4 className="text-[13px] font-bold text-[#666666] mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              상세 풀이
            </h4>
            <p className="text-[#444444] leading-[1.6] text-[14px]">
              {data.detail}
            </p>
          </div>

          <div className="bg-[#FFE8E8]/50 border border-[#FF6B6B]/20 p-4 rounded-[12px] mt-2">
            <h4 className="text-[13px] font-bold text-[#FF6B6B] mb-1">💡 명운의 조언</h4>
            <p className="text-[#111111] leading-[1.5] text-[14px]">
              {data.advice}
            </p>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="w-full mt-6 py-[14px] bg-[#111111] text-white rounded-[12px] text-[15px] font-bold hover:bg-[#333333] transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
};

// 2. Expandable Result Card
const ResultCard: React.FC<{ 
  icon: any, 
  category: string, 
  hook: string, 
  content: React.ReactNode,
  onTermClick: (term: string) => void,
  isLocked?: boolean,
  onUnlock?: () => void
}> = ({ 
  icon: Icon, 
  category, 
  hook, 
  content, 
  onTermClick,
  isLocked = false,
  onUnlock
}) => {
  const [isExpanded, setIsExpanded] = useState(!isLocked);

  return (
    <div className={`bg-[#FFFFFF] border ${isExpanded && !isLocked ? 'border-[#FF6B6B]' : 'border-[#E5E7EB]'} rounded-[12px] overflow-hidden transition-all duration-300 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)]`}>
      <button 
        onClick={() => !isLocked && setIsExpanded(!isExpanded)}
        className="w-full p-[20px] text-left flex items-start gap-4 focus:outline-none relative"
      >
        <div className={`mt-1 p-2 rounded-full shrink-0 ${isLocked ? 'bg-[#F1F3F5] text-[#999999]' : 'bg-[#FFE8E8] text-[#FF6B6B]'}`}>
          {isLocked ? <Lock className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
        </div>
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-semibold text-[#FF6B6B] tracking-wide">{category}</span>
            {isLocked && (
              <span className="px-2 py-0.5 bg-[#111111] text-white text-[10px] font-bold rounded-full">잠김</span>
            )}
          </div>
          <h3 className={`text-[18px] md:text-[20px] font-bold leading-[1.35] ${isLocked ? 'text-[#999999]' : 'text-[#111111]'}`}>
            {hook}
          </h3>
        </div>
        {!isLocked && (
          <div className="shrink-0 text-[#999999] mt-2">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        )}
      </button>

      {!isLocked && (
        <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className="p-[20px] pt-0 pl-[68px] border-t border-[#EEEEEE] mt-2">
            <div className="text-[#666666] leading-[1.7] text-[14px] md:text-[16px] space-y-4">
              {content}
            </div>
          </div>
        </div>
      )}

      {isLocked && (
        <div className="px-[20px] pb-[20px] pl-[68px]">
          <button 
            onClick={onUnlock}
            className="w-full py-[12px] px-[16px] bg-[#111111] hover:bg-[#333333] text-white rounded-[8px] text-[14px] font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            재화 1개로 전체 결과 잠금 해제하기
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [sajuStep, setSajuStep] = useState<'input' | 'result'>('input');
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
  const [sajuResult, setSajuResult] = useState<SajuResultData | null>(null);
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mainCoin, setMainCoin] = useState(0);
  const [bonusCoin, setBonusCoin] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!sajuForm.name.trim()) errors.name = '이름을 입력해주세요.';
    
    const year = parseInt(sajuForm.birthYear);
    const month = parseInt(sajuForm.birthMonth);
    const day = parseInt(sajuForm.birthDay);
    
    if (!year || year < 1900 || year > new Date().getFullYear()) {
      errors.birthDate = '올바른 연도를 입력해주세요.';
    } else if (!month || month < 1 || month > 12) {
      errors.birthDate = '올바른 월을 입력해주세요.';
    } else if (!day || day < 1 || day > 31) {
      errors.birthDate = '올바른 일을 입력해주세요.';
    } else {
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        errors.birthDate = '존재하지 않는 날짜입니다.';
      }
    }

    if (!sajuForm.isTimeUnknown && !sajuForm.birthTime) {
      errors.birthTime = '태어난 시간을 입력하거나 모름을 체크해주세요.';
    }

    setFormErrors(errors);
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

  const renderTextWithTerms = (text: string) => {
    const parts = text.split(/(\[[^\]]+\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const term = part.slice(1, -1);
        // Extract Hanja if present, e.g., "태극귀인(太極貴人)"
        const match = term.match(/([^(]+)(\([^)]+\))?/);
        const displayTerm = match ? match[1].trim() : term;
        const hanja = match && match[2] ? match[2] : '';

        return (
          <button 
            key={i} 
            onClick={() => setActiveTerm(displayTerm)}
            className="inline-flex items-center gap-1 px-[8px] py-[2px] mx-0.5 bg-[#E3F9F6] text-[#4ECDC4] rounded-full font-medium text-[13px] hover:bg-[#4ECDC4] hover:text-white transition-colors"
          >
            {displayTerm} {hanja && <span className="text-[11px] opacity-70">{hanja}</span>}
            <Info className="w-3 h-3" />
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderHeader = () => (
    <header className="px-[16px] h-[64px] flex items-center justify-between border-b border-[#EEEEEE] bg-[#FFFFFF] sticky top-0 z-10">
      <button onClick={() => setActiveTab('home')} className="flex items-center gap-2 focus:outline-none">
        <Sparkles className="w-6 h-6 text-[#FF6B6B]" />
        <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">명운</h1>
      </button>
      
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <div className="flex items-center gap-2 bg-[#F1F3F5] px-3 py-1.5 rounded-full cursor-pointer" onClick={() => setShowStore(true)}>
            <div className="flex items-center gap-1 text-[#F59E0B] font-bold text-[13px]">
              <Coins className="w-4 h-4" /> {mainCoin}
            </div>
            <div className="w-[1px] h-3 bg-[#D1D5DB]"></div>
            <div className="flex items-center gap-1 text-[#FF6B6B] font-bold text-[13px]">
              <Gift className="w-4 h-4" /> {bonusCoin}
            </div>
          </div>
        ) : (
          <button onClick={() => setShowLogin(true)} className="px-[16px] py-[8px] bg-[#FEE500] hover:bg-[#F4DC00] text-[#000000] rounded-full text-[13px] font-bold transition-colors shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />
            카카오 시작
          </button>
        )}
      </div>
    </header>
  );

  const renderBottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#EEEEEE] flex justify-around items-center h-[64px] pb-safe z-10">
      {[
        { id: 'saju', icon: Sparkles, label: '사주' },
        { id: 'match', icon: Users, label: '궁합' },
        { id: 'newyear', icon: Calendar, label: '신년운세' },
        { id: 'mypage', icon: UserCircle, label: '마이페이지' },
      ].map(tab => (
        <button 
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 ${activeTab === tab.id ? 'text-[#FF6B6B]' : 'text-[#999999] hover:text-[#666666]'}`}
        >
          <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'fill-current opacity-20' : ''}`} />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  );

  const renderHome = () => (
    <div className="flex flex-col min-h-[calc(100vh-128px)] bg-white">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-[20px] py-[60px] relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FFE8E8] rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#E3F9F6] rounded-full blur-3xl opacity-50"></div>
        
        <div className="w-24 h-24 bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] rounded-[24px] flex items-center justify-center mb-8 shadow-[0_8px_24px_rgba(255,107,107,0.3)] relative z-10 rotate-3 hover:rotate-0 transition-transform duration-300">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        
        <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#111111] mb-6 leading-[1.2] tracking-tight relative z-10">
          어려운 한자 사주,<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E]">가장 쉽고 정확하게</span>
        </h2>
        
        <p className="text-[#666666] text-[16px] md:text-[18px] leading-[1.6] max-w-[340px] mb-10 relative z-10 font-medium">
          전문가가 옆에서 친절하게 설명해주듯,<br/>
          당신의 진짜 기질과 숨겨진 무기를 알려드립니다.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[500px] mb-12 relative z-10">
          <div className="bg-[#F7F7F9] p-5 rounded-[16px] border border-[#EEEEEE] text-left hover:border-[#FF6B6B]/30 transition-colors">
            <div className="w-10 h-10 bg-[#FFE8E8] rounded-full flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5 text-[#FF6B6B]" />
            </div>
            <h3 className="font-bold text-[15px] mb-1 text-[#111111]">쉬운 용어 풀이</h3>
            <p className="text-[13px] text-[#666666] leading-[1.5]">
              태극귀인? 나체도화? 어려운 명리학 용어를 팝업으로 쉽게 풀어드립니다.
            </p>
          </div>
          <div className="bg-[#F7F7F9] p-5 rounded-[16px] border border-[#EEEEEE] text-left hover:border-[#F59E0B]/30 transition-colors">
            <div className="w-10 h-10 bg-[#FEF3C7] rounded-full flex items-center justify-center mb-3">
              <Coins className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <h3 className="font-bold text-[15px] mb-1 text-[#111111]">합리적인 가격</h3>
            <p className="text-[13px] text-[#666666] leading-[1.5]">
              단돈 990원으로 전체 사주 풀이를 평생 소장하세요.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="p-[20px] pb-[40px] bg-white relative z-20">
        <button 
          onClick={() => {
            setActiveTab('saju');
            setSajuStep('input');
          }}
          className="w-full max-w-[500px] mx-auto block py-[18px] bg-[#111111] hover:bg-[#333333] text-white rounded-[16px] text-[18px] font-bold transition-all shadow-[0_8px_20px_rgba(17,17,17,0.2)] hover:shadow-[0_12px_24px_rgba(17,17,17,0.3)] hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          내 사주 보러가기
        </button>
      </div>
    </div>
  );

  const renderSajuInput = () => (
    <div className="max-w-[720px] mx-auto px-[16px] py-[32px] pb-[100px]">
      <div className="mb-[32px]">
        <h2 className="text-[24px] md:text-[28px] font-bold mb-[8px] leading-[1.35] text-[#111111]">
          정확한 사주 분석을 위해<br/>정보를 입력해주세요 📝
        </h2>
        <p className="text-[#666666] text-[14px] md:text-[16px] leading-[1.6]">
          입력하신 정보는 사주 분석에만 사용되며 저장되지 않습니다.
        </p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-[24px] shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-[24px]">
        
        {/* 이름 */}
        <div>
          <label className="block text-[14px] font-bold text-[#111111] mb-2">이름</label>
          <input 
            type="text" 
            placeholder="이름을 입력해주세요"
            value={sajuForm.name}
            onChange={e => {
              setSajuForm({...sajuForm, name: e.target.value});
              if (formErrors.name) setFormErrors({...formErrors, name: ''});
            }}
            className={`w-full px-[16px] py-[14px] bg-[#F7F7F9] border ${formErrors.name ? 'border-[#FF6B6B]' : 'border-[#EEEEEE]'} rounded-[12px] text-[15px] focus:outline-none focus:border-[#FF6B6B] focus:bg-[#FFFFFF] transition-colors`}
          />
          {formErrors.name && <p className="text-[#FF6B6B] text-[12px] mt-1.5 ml-1">{formErrors.name}</p>}
        </div>

        {/* 성별 */}
        <div>
          <label className="block text-[14px] font-bold text-[#111111] mb-2">성별</label>
          <div className="flex gap-2">
            <button 
              onClick={() => setSajuForm({...sajuForm, gender: 'male'})}
              className={`flex-1 py-[12px] rounded-[12px] text-[15px] font-medium transition-colors ${sajuForm.gender === 'male' ? 'bg-[#111111] text-white' : 'bg-[#F7F7F9] text-[#666666] border border-[#EEEEEE] hover:bg-[#F1F3F5]'}`}
            >
              남성
            </button>
            <button 
              onClick={() => setSajuForm({...sajuForm, gender: 'female'})}
              className={`flex-1 py-[12px] rounded-[12px] text-[15px] font-medium transition-colors ${sajuForm.gender === 'female' ? 'bg-[#111111] text-white' : 'bg-[#F7F7F9] text-[#666666] border border-[#EEEEEE] hover:bg-[#F1F3F5]'}`}
            >
              여성
            </button>
          </div>
        </div>

        {/* 생년월일 */}
        <div>
          <label className="block text-[14px] font-bold text-[#111111] mb-2">생년월일</label>
          <div className="flex gap-2 mb-3">
            <button 
              onClick={() => setSajuForm({...sajuForm, calendarType: 'solar'})}
              className={`flex-1 py-[10px] rounded-[8px] text-[13px] font-medium transition-colors ${sajuForm.calendarType === 'solar' ? 'bg-[#FFE8E8] text-[#FF6B6B] border border-[#FF6B6B]/30' : 'bg-[#F7F7F9] text-[#666666] border border-[#EEEEEE]'}`}
            >
              양력
            </button>
            <button 
              onClick={() => setSajuForm({...sajuForm, calendarType: 'lunar'})}
              className={`flex-1 py-[10px] rounded-[8px] text-[13px] font-medium transition-colors ${sajuForm.calendarType === 'lunar' ? 'bg-[#FFE8E8] text-[#FF6B6B] border border-[#FF6B6B]/30' : 'bg-[#F7F7F9] text-[#666666] border border-[#EEEEEE]'}`}
            >
              음력
            </button>
            <button 
              onClick={() => setSajuForm({...sajuForm, calendarType: 'lunar_leap'})}
              className={`flex-1 py-[10px] rounded-[8px] text-[13px] font-medium transition-colors ${sajuForm.calendarType === 'lunar_leap' ? 'bg-[#FFE8E8] text-[#FF6B6B] border border-[#FF6B6B]/30' : 'bg-[#F7F7F9] text-[#666666] border border-[#EEEEEE]'}`}
            >
              윤달
            </button>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input 
                type="number" 
                placeholder="YYYY"
                value={sajuForm.birthYear}
                onChange={e => {
                  setSajuForm({...sajuForm, birthYear: e.target.value});
                  if (formErrors.birthDate) setFormErrors({...formErrors, birthDate: ''});
                }}
                className={`w-full px-[12px] py-[14px] bg-[#F7F7F9] border ${formErrors.birthDate ? 'border-[#FF6B6B]' : 'border-[#EEEEEE]'} rounded-[12px] text-[15px] focus:outline-none focus:border-[#FF6B6B] focus:bg-[#FFFFFF] transition-colors text-center`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] text-[13px]">년</span>
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
                className={`w-full px-[12px] py-[14px] bg-[#F7F7F9] border ${formErrors.birthDate ? 'border-[#FF6B6B]' : 'border-[#EEEEEE]'} rounded-[12px] text-[15px] focus:outline-none focus:border-[#FF6B6B] focus:bg-[#FFFFFF] transition-colors text-center`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] text-[13px]">월</span>
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
                className={`w-full px-[12px] py-[14px] bg-[#F7F7F9] border ${formErrors.birthDate ? 'border-[#FF6B6B]' : 'border-[#EEEEEE]'} rounded-[12px] text-[15px] focus:outline-none focus:border-[#FF6B6B] focus:bg-[#FFFFFF] transition-colors text-center`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] text-[13px]">일</span>
            </div>
          </div>
          {formErrors.birthDate && <p className="text-[#FF6B6B] text-[12px] mt-1.5 ml-1">{formErrors.birthDate}</p>}
        </div>

        {/* 태어난 시간 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-[14px] font-bold text-[#111111]">태어난 시간</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={sajuForm.isTimeUnknown}
                onChange={e => {
                  setSajuForm({...sajuForm, isTimeUnknown: e.target.checked});
                  if (formErrors.birthTime) setFormErrors({...formErrors, birthTime: ''});
                }}
                className="w-4 h-4 accent-[#FF6B6B] rounded-sm"
              />
              <span className="text-[13px] text-[#666666]">모름</span>
            </label>
          </div>
          <input 
            type="time" 
            disabled={sajuForm.isTimeUnknown}
            value={sajuForm.birthTime}
            onChange={e => {
              setSajuForm({...sajuForm, birthTime: e.target.value});
              if (formErrors.birthTime) setFormErrors({...formErrors, birthTime: ''});
            }}
            className={`w-full px-[16px] py-[14px] border rounded-[12px] text-[15px] focus:outline-none transition-colors ${sajuForm.isTimeUnknown ? 'bg-[#F1F3F5] border-[#EEEEEE] text-[#999999]' : `bg-[#F7F7F9] ${formErrors.birthTime ? 'border-[#FF6B6B]' : 'border-[#EEEEEE]'} focus:border-[#FF6B6B] focus:bg-[#FFFFFF] text-[#111111]`}`}
          />
          {formErrors.birthTime && <p className="text-[#FF6B6B] text-[12px] mt-1.5 ml-1">{formErrors.birthTime}</p>}
          <p className="text-[12px] text-[#999999] mt-2 flex items-start gap-1">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            시간을 모르면 분석이 부정확할 수 있습니다. 가급적 정확한 시간을 입력해주세요.
          </p>
        </div>

      </div>

      <div className="mt-[32px]">
        <button 
          onClick={() => {
            if (!validateForm()) return;
            
            setIsLoading(true);
            analyzeSaju(sajuForm).then((res) => {
              setSajuResult(res);
              setIsLoading(false);
              setSajuStep('result');
            });
          }}
          disabled={isLoading}
          className={`w-full py-[16px] text-white rounded-[12px] text-[16px] font-bold transition-colors shadow-[0_4px_12px_rgba(255,107,107,0.3)] flex items-center justify-center gap-2 ${isLoading ? 'bg-[#ef5a5a] opacity-80 cursor-not-allowed' : 'bg-[#FF6B6B] hover:bg-[#ef5a5a]'}`}
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
      <div className="max-w-[720px] mx-auto px-[16px] py-[32px] pb-[100px]">
        {/* Intro Section */}
        <div className="mb-[32px]">
          <h2 className="text-[24px] md:text-[28px] font-bold mb-[8px] leading-[1.35] text-[#111111]">
            안녕하세요! 사주 전문가 명운입니다 👋
          </h2>
          <p className="text-[#666666] text-[14px] md:text-[16px] leading-[1.6]">
            사주가 처음이시라고요? 걱정 마세요. 제가 아주 쉽고 친절하게, 하지만 핵심은 콕 집어서 {sajuForm.name || '김명운'}님의 타고난 기질을 설명해 드릴게요.
          </p>
        </div>

        {/* Manse-ryeok Chart */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-[20px] mb-[32px] shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[16px] font-bold text-[#111111]">{sajuForm.name || '김명운'}님의 만세력 차트</h3>
            <span className="text-[12px] text-[#999999] bg-[#F1F3F5] px-2 py-1 rounded-full">
              {sajuForm.calendarType === 'solar' ? '양력' : sajuForm.calendarType === 'lunar' ? '음력' : '윤달'} {sajuForm.birthYear || '1990'}.{sajuForm.birthMonth ? sajuForm.birthMonth.padStart(2, '0') : '05'}.{sajuForm.birthDay ? sajuForm.birthDay.padStart(2, '0') : '15'} {sajuForm.isTimeUnknown ? '시간모름' : (sajuForm.birthTime || '14:30')}
            </span>
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-center mb-4">
            <div className="text-[12px] text-[#999999] font-medium">시주(시간)</div>
            <div className="text-[12px] text-[#999999] font-medium">일주(나)</div>
            <div className="text-[12px] text-[#999999] font-medium">월주(부모)</div>
            <div className="text-[12px] text-[#999999] font-medium">년주(조상)</div>
            
            {/* 천간 */}
            {[sajuResult.chart.time, sajuResult.chart.day, sajuResult.chart.month, sajuResult.chart.year].map((pillar, idx) => (
              <div key={`stem-${idx}`} className={`py-3 rounded-[8px] border ${idx === 1 ? 'border-[#FF6B6B]/30' : 'border-[#EEEEEE]'} ${pillar.stem.color} relative`}>
                {idx === 1 && <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#FF6B6B] text-white text-[9px] px-1.5 rounded-sm">나</div>}
                <div className="text-[24px] font-bold">{pillar.stem.hanja}</div>
                <div className={`text-[11px] mt-1 ${idx === 1 ? 'text-[#FF6B6B]' : 'text-[#666666]'}`}>{pillar.stem.name}</div>
              </div>
            ))}

            {/* 지지 */}
            {[sajuResult.chart.time, sajuResult.chart.day, sajuResult.chart.month, sajuResult.chart.year].map((pillar, idx) => (
              <div key={`branch-${idx}`} className={`py-3 rounded-[8px] border border-[#EEEEEE] ${pillar.branch.color}`}>
                <div className="text-[24px] font-bold">{pillar.branch.hanja}</div>
                <div className="text-[11px] text-[#666666] mt-1">{pillar.branch.name}</div>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-[#666666] bg-[#F7F7F9] p-3 rounded-[8px]">
            💡 <strong>전문가의 한마디:</strong> {sajuResult.expertComment}
          </p>
        </div>

        {/* Insight Cards */}
        <div className="space-y-[16px]">
          {sajuResult.insights.map((insight) => {
            const ICONS: Record<string, any> = { User, Heart, Briefcase };
            const IconComponent = ICONS[insight.iconName] || Sparkles;
            return (
              <ResultCard 
                key={insight.id}
                icon={IconComponent}
                category={insight.category}
                hook={insight.hook}
                onTermClick={setActiveTerm}
                isLocked={insight.isLocked && !isUnlocked}
                onUnlock={handleUnlock}
                content={
                  <>
                    {insight.paragraphs.map((p, idx) => (
                      <p key={idx}>{renderTextWithTerms(p)}</p>
                    ))}
                    {insight.advice && (
                      <div className="p-[16px] bg-[#E3F9F6]/30 rounded-[8px] border border-[#4ECDC4]/30 mt-4">
                        <strong className="text-[#111111] block mb-2 text-[14px] flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-[#4ECDC4]" /> 전문가의 따뜻한 조언
                        </strong>
                        <span className="text-[#666666] text-[14px]">{insight.advice}</span>
                      </div>
                    )}
                  </>
                }
              />
            );
          })}
        </div>

        {isUnlocked && (
          <div className="mt-8 flex justify-center">
            <button 
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white rounded-full font-bold shadow-lg hover:bg-[#333333] transition-colors"
            >
              <Share2 className="w-5 h-5" />
              내 사주 결과 공유하기
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
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[20px] p-[40px] text-center shadow-sm">
          <div className="w-20 h-20 bg-[#F1F3F5] rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCircle className="w-10 h-10 text-[#999999]" />
          </div>
          <h3 className="text-[20px] font-bold mb-3 text-[#111111]">로그인이 필요합니다</h3>
          <p className="text-[#666666] text-[15px] mb-8 leading-[1.6]">
            3초 만에 로그인하고<br/>나만의 사주 결과를 평생 소장하세요.
          </p>
          <button onClick={() => setShowLogin(true)} className="px-[24px] py-[16px] bg-[#FEE500] hover:bg-[#F4DC00] text-[#000000] rounded-[12px] font-bold w-full max-w-[280px] mx-auto flex items-center justify-center gap-2 transition-colors">
            <MessageCircle className="w-5 h-5" /> 카카오로 시작하기
          </button>
        </div>
      ) : (
        <div className="space-y-[24px]">
          {/* Profile Summary */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[20px] p-[24px] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center text-white shadow-inner">
                <span className="text-[24px] font-bold">{sajuForm.name ? sajuForm.name.charAt(0) : '명'}</span>
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-[#111111] mb-1">{sajuForm.name || '김명운'} 님</h3>
                <p className="text-[14px] text-[#666666] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {sajuForm.birthYear || '1990'}.{sajuForm.birthMonth ? sajuForm.birthMonth.padStart(2, '0') : '05'}.{sajuForm.birthDay ? sajuForm.birthDay.padStart(2, '0') : '15'} 
                  <span className="bg-[#F1F3F5] px-2 py-0.5 rounded text-[12px] ml-1">
                    {sajuForm.calendarType === 'solar' ? '양력' : sajuForm.calendarType === 'lunar' ? '음력' : '윤달'}
                  </span>
                </p>
              </div>
            </div>
            <button className="text-[14px] text-[#666666] font-medium hover:text-[#111111] transition-colors bg-[#F7F7F9] px-4 py-2 rounded-[8px]">
              수정
            </button>
          </div>

          {/* Wallet */}
          <div className="bg-[#111111] rounded-[20px] p-[24px] text-white flex justify-between items-center shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
            <div className="relative z-10">
              <p className="text-[14px] text-[#999999] mb-2 font-medium">보유 재화</p>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <div className="bg-[#333333] p-1.5 rounded-full"><Coins className="w-5 h-5 text-[#F59E0B]" /></div>
                  <span className="font-bold text-[24px]">{mainCoin}</span>
                </div>
                <div className="w-[1px] h-6 bg-[#333333]"></div>
                <div className="flex items-center gap-2">
                  <div className="bg-[#333333] p-1.5 rounded-full"><Gift className="w-5 h-5 text-[#FF6B6B]" /></div>
                  <span className="font-bold text-[24px]">{bonusCoin}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setShowStore(true)} className="relative z-10 bg-[#FFFFFF] hover:bg-[#F1F3F5] text-[#111111] px-5 py-2.5 rounded-[10px] text-[14px] font-bold transition-colors">
              충전하기
            </button>
          </div>

          {/* Storage */}
          <div>
            <div className="flex items-center justify-between mb-[16px]">
              <h3 className="text-[18px] font-bold text-[#111111]">보관함</h3>
              <span className="text-[13px] text-[#666666] bg-[#F1F3F5] px-2 py-1 rounded-full">총 1건</span>
            </div>
            <div className="space-y-3">
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-[20px] flex justify-between items-center cursor-pointer hover:border-[#FF6B6B] hover:shadow-md transition-all group" onClick={() => setActiveTab('saju')}>
                <div className="flex items-center gap-4">
                  <div className="bg-[#FFE8E8] p-3 rounded-full text-[#FF6B6B] group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[16px] text-[#111111] mb-1">나의 종합 사주 분석</h4>
                    <p className="text-[13px] text-[#999999] flex items-center gap-1">
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
                    className="p-2 text-[#999999] hover:text-[#111111] hover:bg-[#F1F3F5] rounded-full transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <ChevronDown className="w-5 h-5 text-[#D1D5DB] -rotate-90 group-hover:text-[#FF6B6B] transition-colors" />
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
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0F172A]/60 backdrop-blur-sm" onClick={() => setShowStore(false)}>
        <div className="bg-[#FFFFFF] w-full sm:max-w-md rounded-t-[24px] sm:rounded-[24px] p-[24px] pb-safe shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[20px] font-bold">재화 충전소</h3>
            <button onClick={() => setShowStore(false)} className="text-[#999999] hover:text-[#111111]">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-3 mb-6">
            {/* 990 KRW */}
            <button onClick={() => buyCoins(1, 0)} className="w-full flex items-center justify-between p-4 border border-[#E5E7EB] rounded-[12px] hover:border-[#FF6B6B] hover:bg-[#FFE8E8]/30 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="bg-[#F1F3F5] p-2 rounded-full"><Coins className="w-6 h-6 text-[#F59E0B]" /></div>
                <div>
                  <div className="font-bold text-[16px]">재화 1개</div>
                  <div className="text-[12px] text-[#666666]">사주 1회 열람 가능</div>
                </div>
              </div>
              <div className="font-bold text-[16px] text-[#FF6B6B]">990원</div>
            </button>

            {/* 4,900 KRW */}
            <button onClick={() => buyCoins(5, 1)} className="w-full flex items-center justify-between p-4 border border-[#FF6B6B] bg-[#FFE8E8]/10 rounded-[12px] hover:bg-[#FFE8E8]/30 transition-all text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#FF6B6B] text-white text-[10px] font-bold px-2 py-1 rounded-bl-[8px]">BEST</div>
              <div className="flex items-center gap-3">
                <div className="bg-[#F1F3F5] p-2 rounded-full relative">
                  <Coins className="w-6 h-6 text-[#F59E0B]" />
                  <Gift className="w-4 h-4 text-[#FF6B6B] absolute -bottom-1 -right-1" />
                </div>
                <div>
                  <div className="font-bold text-[16px]">재화 5개 <span className="text-[#FF6B6B]">+1 보너스</span></div>
                  <div className="text-[12px] text-[#666666]">총 6회 열람 가능</div>
                </div>
              </div>
              <div className="font-bold text-[16px] text-[#FF6B6B]">4,900원</div>
            </button>

            {/* 9,900 KRW */}
            <button onClick={() => buyCoins(10, 3)} className="w-full flex items-center justify-between p-4 border border-[#E5E7EB] rounded-[12px] hover:border-[#FF6B6B] hover:bg-[#FFE8E8]/30 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="bg-[#F1F3F5] p-2 rounded-full relative">
                  <Coins className="w-6 h-6 text-[#F59E0B]" />
                  <Gift className="w-5 h-5 text-[#FF6B6B] absolute -bottom-2 -right-2" />
                </div>
                <div>
                  <div className="font-bold text-[16px]">재화 10개 <span className="text-[#FF6B6B]">+3 보너스</span></div>
                  <div className="text-[12px] text-[#666666]">총 13회 열람 가능</div>
                </div>
              </div>
              <div className="font-bold text-[16px] text-[#FF6B6B]">9,900원</div>
            </button>
          </div>

          <div className="text-[11px] text-[#999999] text-center bg-[#F7F7F9] p-3 rounded-[8px]">
            결제 시 토스페이, 카카오페이, 신용/체크카드를 지원합니다.<br/>
            보너스 재화는 주재화 소진 후 사용됩니다.
          </div>
        </div>
      </div>
    );
  };

  const renderShareModal = () => {
    if (!showShare) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0F172A]/60 backdrop-blur-sm" onClick={() => setShowShare(false)}>
        <div className="bg-[#FFFFFF] w-full sm:max-w-sm rounded-t-[24px] sm:rounded-[24px] p-[24px] pb-safe shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[18px] font-bold">사주 결과 공유하기</h3>
            <button onClick={() => setShowShare(false)} className="text-[#999999] hover:text-[#111111]">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => { alert('카카오톡으로 공유되었습니다.'); setShowShare(false); }} className="flex flex-col items-center justify-center gap-2 p-4 bg-[#FEE500]/10 rounded-[12px] hover:bg-[#FEE500]/20 transition-colors">
              <div className="w-12 h-12 bg-[#FEE500] rounded-full flex items-center justify-center text-black">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-[13px] font-medium">카카오톡</span>
            </button>
            <button onClick={() => { alert('링크가 복사되었습니다.'); setShowShare(false); }} className="flex flex-col items-center justify-center gap-2 p-4 bg-[#F1F3F5] rounded-[12px] hover:bg-[#E5E7EB] transition-colors">
              <div className="w-12 h-12 bg-[#FFFFFF] rounded-full flex items-center justify-center text-[#111111] shadow-sm">
                <LinkIcon className="w-6 h-6" />
              </div>
              <span className="text-[13px] font-medium">링크 복사</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderLoginModal = () => {
    if (!showLogin) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0F172A]/60 backdrop-blur-sm" onClick={() => setShowLogin(false)}>
        <div className="bg-[#FFFFFF] w-full sm:max-w-sm rounded-t-[24px] sm:rounded-[24px] p-[24px] pb-safe shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[20px] font-bold">로그인 / 회원가입</h3>
            <button onClick={() => setShowLogin(false)} className="text-[#999999] hover:text-[#111111]">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#FFE8E8] rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-[#FF6B6B]" />
            </div>
            <p className="text-[#666666] text-[15px]">3초 만에 로그인하고<br/>나만의 사주 결과를 평생 소장하세요.</p>
          </div>
          <div className="space-y-3">
            <button onClick={handleLoginSuccess} className="w-full py-[14px] bg-[#FEE500] hover:bg-[#F4DC00] text-[#000000] rounded-[12px] text-[15px] font-bold transition-colors flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" /> 카카오로 1초 만에 시작하기
            </button>
            <button onClick={handleLoginSuccess} className="w-full py-[14px] bg-[#03C75A] hover:bg-[#02b351] text-white rounded-[12px] text-[15px] font-bold transition-colors flex items-center justify-center gap-2">
              <div className="w-5 h-5 bg-white text-[#03C75A] rounded-sm flex items-center justify-center text-[12px] font-black">N</div> 네이버로 시작하기
            </button>
            <button onClick={handleLoginSuccess} className="w-full py-[14px] bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#F1F3F5] text-[#111111] rounded-[12px] text-[15px] font-bold transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> 구글로 시작하기
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F7F9] text-[#111111] font-sans">
      {renderHeader()}
      
      <div className="pb-[64px]">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'saju' && (sajuStep === 'input' ? renderSajuInput() : renderSajuResult())}
        {activeTab === 'mypage' && renderMyPage()}
        {(activeTab === 'match' || activeTab === 'newyear') && (
          <div className="flex flex-col items-center justify-center h-[50vh] text-[#999999]">
            <Sparkles className="w-12 h-12 mb-4 opacity-20" />
            <p>준비 중인 기능입니다.</p>
          </div>
        )}
      </div>

      {renderBottomNav()}
      {activeTerm && <TermModal term={activeTerm} onClose={() => setActiveTerm(null)} />}
      {renderStoreModal()}
      {renderShareModal()}
      {renderLoginModal()}
    </div>
  );
}
