import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Info, Sparkles, ArrowRight, Zap, Leaf, Flame, Mountain, Diamond, Droplets, X } from 'lucide-react';
import { SajuChart, ElementScore, Pillar } from '../types/saju';
import { ELEMENT_RELATION, GAN_INFO, ZHI_INFO, STEM_EMOJIS, BRANCH_EMOJIS } from '../utils/sajuLogic';

const ELEMENT_ICONS: Record<string, any> = {
  '목': Leaf,
  '화': Flame,
  '토': Mountain,
  '금': Diamond,
  '수': Droplets
};

const ELEMENT_DESCRIPTIONS: Record<string, { desc: string, high: string, low: string }> = {
  '목': { desc: '성장, 시작, 의욕, 뻗어나가는 에너지', high: '시작은 잘하지만 마무리가 약할 수 있습니다. 고집이 세질 수 있습니다.', low: '새로운 시작을 두려워하거나 추진력이 부족할 수 있습니다.' },
  '화': { desc: '열정, 확산, 표현력, 밝고 따뜻한 에너지', high: '감정 기복이 심하고 성급해질 수 있습니다. 쉽게 지칠 수 있습니다.', low: '표현력이 부족하고 소극적이거나 열정이 부족할 수 있습니다.' },
  '토': { desc: '수용, 안정, 신뢰, 포용력과 중재의 에너지', high: '변화를 싫어하고 고지식해질 수 있습니다. 게을러질 수 있습니다.', low: '안정감이 부족하고 정착하기 어려울 수 있습니다. 신뢰를 쌓기 어려울 수 있습니다.' },
  '금': { desc: '결단, 원칙, 의리, 단단하고 예리한 에너지', high: '너무 냉정하고 융통성이 부족할 수 있습니다. 타인에게 상처를 줄 수 있습니다.', low: '결단력이 부족하고 맺고 끊음이 확실하지 않을 수 있습니다.' },
  '수': { desc: '지혜, 유연성, 수용력, 깊고 흐르는 에너지', high: '생각이 너무 많아 우울해지거나 실천력이 떨어질 수 있습니다.', low: '융통성이 부족하고 지혜롭게 대처하는 능력이 부족할 수 있습니다.' }
};

export const ElementScoreboard: React.FC<{ scores: ElementScore[], onToast?: (msg: string) => void, onTermClick?: (term: string) => void }> = ({ scores, onToast, onTermClick }) => {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  return (
    <div className="mb-8">
      <div className="grid grid-cols-5 gap-2">
        {scores.map((s, idx) => {
          const Icon = ELEMENT_ICONS[s.element] || Sparkles;
          return (
            <motion.div 
              key={s.element}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex flex-col items-center relative ${s.isSecondary ? 'opacity-60' : ''}`}
              onMouseEnter={() => setHoveredElement(s.element)}
              onMouseLeave={() => setHoveredElement(null)}
              onClick={() => {
                if (onTermClick) {
                  onTermClick(s.element);
                } else if (onToast) {
                  const desc = ELEMENT_DESCRIPTIONS[s.element];
                  const msg = s.score >= 3 ? desc.high : s.score === 0 ? desc.low : desc.desc;
                  onToast(`${s.element} 기운(${s.score}개): ${msg}${s.reason ? ' (' + s.reason + ')' : ''}`);
                }
              }}
            >
              <div className={`relative w-full aspect-square rounded-2xl flex flex-col items-center justify-center mb-2 overflow-hidden bg-[var(--bg-card)] border ${s.isSecondary ? 'border-dashed border-[var(--border-main)]' : 'border-[var(--border-main)]'} shadow-sm cursor-pointer hover:shadow-md transition-shadow`}>
                <div 
                  className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-out"
                  style={{ 
                    height: `${((s.score + (s.secondaryScore || 0)) / 8) * 100}%`, 
                    backgroundColor: s.color,
                    opacity: s.isSecondary ? 0.08 : 0.15
                  }}
                />
                <Icon className="w-6 h-6 mb-1 relative z-10" style={{ color: s.color, opacity: s.isSecondary ? 0.5 : 1 }} />
                <span className="text-sm font-bold relative z-10" style={{ color: s.color, opacity: s.isSecondary ? 0.6 : 1 }}>{s.element}</span>
                <span className="absolute top-1 right-2 text-[10px] font-bold opacity-30">{s.score + (s.secondaryScore ? '+' : '')}</span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-medium text-center leading-tight">{s.label}</span>
              
              {/* Hover Tooltip */}
              <AnimatePresence>
                {hoveredElement === s.element && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-[var(--text-main)] text-[var(--bg-main)] text-xs p-3 rounded-xl shadow-xl z-50 pointer-events-none"
                  >
                    <p className="font-bold mb-1">{s.element} ({s.label})</p>
                    {s.reason && <p className="text-amber-300 font-bold mb-1">✨ {s.reason}</p>}
                    <p className="text-[var(--bg-muted)] leading-relaxed">{ELEMENT_DESCRIPTIONS[s.element].desc}</p>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--text-main)] rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const TEN_DEITY_DESC: Record<string, { title: string, desc: string, relation: string, advice: string }> = {
  '비견': { 
    title: '나와 같은 기운 (비견)', 
    desc: '나와 동등한 위치의 친구, 동료, 형제를 의미합니다. 주관이 뚜렷해지고 독립심이 강해지며, 선의의 경쟁을 통해 스스로를 성장시키는 에너지를 줍니다.', 
    relation: '나와 어깨를 나란히 하는 동반자이자 거울',
    advice: '지나친 고집을 주의하고, 타인과의 협력을 배우면 더 큰 시너지를 낼 수 있습니다.'
  },
  '겁재': { 
    title: '나와 경쟁하는 기운 (겁재)', 
    desc: '나와 비슷하지만 다른 성향을 가진 경쟁자나 동료를 의미합니다. 강한 승부욕과 투쟁심을 자극하며, 때로는 내 것을 나누어야 하는 상황을 만들기도 합니다.', 
    relation: '나를 자극하고 성장시키는 강력한 라이벌',
    advice: '경쟁심을 긍정적인 원동력으로 승화시키고, 베푸는 마음을 가지면 액운을 피할 수 있습니다.'
  },
  '식신': { 
    title: '내가 생해주는 기운 (식신)', 
    desc: '나의 재능, 표현력, 창의성을 의미합니다. 내가 즐거워서 하는 일, 베푸는 마음, 그리고 의식주와 관련된 풍요롭고 안정적인 에너지를 줍니다.', 
    relation: '내가 기꺼이 에너지를 쏟고 키워주는 대상',
    advice: '자신이 진정으로 좋아하는 한 가지 분야를 깊이 파고들면 전문가로 대성할 수 있습니다.'
  },
  '상관': { 
    title: '내가 발산하는 기운 (상관)', 
    desc: '기존의 틀을 깨는 파격적인 아이디어와 뛰어난 언변, 예술적 재능을 의미합니다. 호기심이 많고 반항적인 기질이 있어 변화를 주도하는 에너지를 줍니다.', 
    relation: '나의 에너지를 강하게 발산하고 표현하는 대상',
    advice: '날카로운 언행으로 인한 구설수를 주의하고, 창조적인 활동으로 에너지를 발산하세요.'
  },
  '편재': { 
    title: '내가 통제하는 기운 (편재)', 
    desc: '불규칙하고 큰 재물, 사업성, 공간 지각 능력을 의미합니다. 모험심이 강하고 통제하려는 욕구가 크며, 넓은 인간관계를 형성하는 에너지를 줍니다.', 
    relation: '내가 관리하고 통제하며 결과를 얻어내는 대상',
    advice: '무리한 투자를 경계하고, 눈앞의 이익보다는 사람을 남기는 투자를 하는 것이 좋습니다.'
  },
  '정재': { 
    title: '내가 소유하는 기운 (정재)', 
    desc: '안정적이고 고정적인 재물, 꼼꼼함, 성실함을 의미합니다. 예측 가능한 결과를 선호하며, 책임감이 강하고 현실적인 에너지를 줍니다.', 
    relation: '내가 책임지고 소유하며 지켜나가는 대상',
    advice: '지나치게 인색해지는 것을 경계하고, 때로는 작은 모험을 통해 새로운 기회를 발견해보세요.'
  },
  '편관': { 
    title: '나를 극하는 기운 (편관)', 
    desc: '나를 강하게 압박하는 규율, 카리스마, 명예욕을 의미합니다. 힘든 시련을 극복하고 큰 권력이나 명예를 쟁취하게 하는 강렬한 에너지를 줍니다.', 
    relation: '나를 엄격하게 통제하고 단련시키는 대상',
    advice: '스트레스 관리가 필수적이며, 눈앞의 시련을 인내로 넘으면 큰 명예를 얻게 됩니다.'
  },
  '정관': { 
    title: '나를 지켜주는 기운 (정관)', 
    desc: '합리적인 규칙, 도덕성, 안정적인 직장과 명예를 의미합니다. 원칙을 중시하고 보수적이며, 나를 안전한 테두리 안에서 보호하는 에너지를 줍니다.', 
    relation: '나를 바른 길로 이끌고 보호하는 대상',
    advice: '지나치게 틀에 얽매여 답답해지지 않도록, 상황에 맞는 유연성을 기르는 것이 중요합니다.'
  },
  '편인': { 
    title: '나를 생해주는 기운 (편인)', 
    desc: '직관력, 신비주의, 특수한 분야의 학문이나 기술을 의미합니다. 남들이 보지 못하는 이면을 꿰뚫어 보며, 외로움을 타지만 독창적인 에너지를 줍니다.', 
    relation: '나에게 독특한 영감과 아이디어를 주는 대상',
    advice: '자신만의 독특한 세계관에 갇히지 말고, 이를 현실적인 결과물로 연결하는 연습이 필요합니다.'
  },
  '정인': { 
    title: '나를 품어주는 기운 (정인)', 
    desc: '어머니와 같은 무조건적인 사랑, 학문, 도덕성, 수용력을 의미합니다. 전통적인 가치를 중시하고, 타인의 도움을 잘 받아들이는 안정적인 에너지를 줍니다.', 
    relation: '나를 따뜻하게 수용하고 지지해주는 대상',
    advice: '타인에게 지나치게 의존하기보다, 스스로 결단하고 행동하는 독립심을 기르는 것이 좋습니다.'
  },
};

// --- 2. Saju Network Graph (Solar System Model) ---
export const SajuNetworkGraph: React.FC<{ chart: SajuChart, onNodeClick?: (msg: string, term?: string) => void }> = ({ chart, onNodeClick }) => {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);

  const dayGan = chart.day.stem;
  const myElement = GAN_INFO[dayGan.name]?.element || '화';
  
  // Nodes: Center is Day Stem, others orbit
  const orbitNodes = [
    { id: 'yearStem', data: chart.year.stem, label: '조상', angle: -90, isGan: true },
    { id: 'yearZhi', data: chart.year.branch, label: '환경', angle: -45, isGan: false },
    { id: 'monthStem', data: chart.month.stem, label: '부모', angle: 0, isGan: true },
    { id: 'monthZhi', data: chart.month.branch, label: '사회', angle: 45, isGan: false },
    { id: 'dayZhi', data: chart.day.branch, label: '배우자', angle: 135, isGan: false },
    { id: 'timeStem', data: chart.time.stem, label: '자식', angle: 180, isGan: true },
    { id: 'timeZhi', data: chart.time.branch, label: '미래', angle: 225, isGan: false },
  ].filter(n => n.data.name !== '모름');

  const radius = 120;
  const centerX = 160;
  const centerY = 160;

  return (
    <div className="relative w-full max-w-[320px] mx-auto aspect-square bg-[var(--bg-input)] rounded-[40px] p-4 border border-[var(--border-main)] shadow-inner overflow-hidden">
      <svg viewBox="0 0 320 320" className="w-full h-full">
        <defs>
          <marker id="arrowhead-to-center" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#CBD5E1" />
          </marker>
          <marker id="arrowhead-to-node" markerWidth="10" markerHeight="7" refX="1" refY="3.5" orient="auto">
            <polygon points="10 0, 0 3.5, 10 7" fill="#CBD5E1" />
          </marker>
        </defs>

        {/* Orbit Path */}
        <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Connections (Energy Flow) */}
        {orbitNodes.map((node) => {
          const angleRad = (node.angle * Math.PI) / 180;
          const x = centerX + radius * Math.cos(angleRad);
          const y = centerY + radius * Math.sin(angleRad);
          
          const targetElement = node.isGan ? GAN_INFO[node.data.name]?.element : ZHI_INFO[node.data.name]?.element;
          const relation = ELEMENT_RELATION[myElement][targetElement || '화'];
          
          const elementColors: Record<string, string> = {
            '목': '#2E7D32',
            '화': 'var(--primary)',
            '토': '#F57F17',
            '금': '#6A1B9A',
            '수': '#1565C0'
          };

          let markerId = '';
          let strokeWidth = '1';
          let strokeColor = elementColors[targetElement || '화'] || '#CBD5E1';
          let opacity = '0.4';

          if (relation === 1 || relation === -1) markerId = 'url(#arrowhead-to-node)';
          if (relation === 2 || relation === -2) markerId = 'url(#arrowhead-to-center)';
          
          if (relation === -1 || relation === -2) {
            strokeWidth = '2.5';
            opacity = '0.6';
          }
          if (relation === 1 || relation === 2) {
            strokeWidth = '1.5';
            opacity = '0.5';
          }

          return (
            <g key={`line-group-${node.id}`}>
              <line 
                x1={centerX} y1={centerY} x2={x} y2={y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                opacity={opacity}
                markerEnd={markerId}
              />
              {/* Animated Particle */}
              {(relation !== 0) && (
                <circle r="2" fill={strokeColor}>
                  <animateMotion 
                    dur={`${2 + Math.random()}s`} 
                    repeatCount="indefinite"
                    path={`M ${relation > 0 ? centerX : x} ${relation > 0 ? centerY : y} L ${relation > 0 ? x : centerX} ${relation > 0 ? y : centerY}`}
                  />
                </circle>
              )}
            </g>
          );
        })}

        {/* Orbiting Nodes */}
        {orbitNodes.map((node, idx) => {
          const x = centerX + radius * Math.cos((node.angle * Math.PI) / 180);
          const y = centerY + radius * Math.sin((node.angle * Math.PI) / 180);
          
          return (
            <motion.g 
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              onMouseEnter={() => setActiveNode(node.id)}
              onMouseLeave={() => setActiveNode(null)}
              onClick={() => {
                const targetElement = node.isGan ? GAN_INFO[node.data.name]?.element : ZHI_INFO[node.data.name]?.element;
                const relation = ELEMENT_RELATION[myElement][targetElement || '화'];
                setSelectedNode({
                  ...node,
                  targetElement,
                  relation
                });
              }}
              className="cursor-pointer"
            >
              <circle cx={x} cy={y} r="24" fill="white" stroke="#F1F5F9" strokeWidth="2" className="shadow-sm" />
              <text x={x} y={y - 4} textAnchor="middle" className="text-[20px] fill-[var(--text-main)]">
                {node.isGan ? STEM_EMOJIS[node.data.name] : BRANCH_EMOJIS[node.data.name]}
              </text>
              <text x={x} y={y + 12} textAnchor="middle" className="text-[9px] font-bold fill-[var(--text-muted)]">{node.label}</text>
              
              {/* Interaction Indicator */}
              <circle cx={x + 16} cy={y - 16} r="8" fill={node.data.color.includes('text-') ? node.data.color.split('text-[')[1]?.split(']')[0] : '#CBD5E1'} />
              <text x={x + 16} y={y - 13} textAnchor="middle" className="text-[8px] font-bold fill-white">
                {node.data.tenDeity?.charAt(0)}
              </text>
            </motion.g>
          );
        })}

        {/* Center Node (Me) */}
        <motion.g 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="cursor-pointer"
          onClick={() => setSelectedNode({
            id: 'center',
            data: dayGan,
            label: '본질(나)',
            isCenter: true,
            targetElement: myElement
          })}
        >
          <circle cx={centerX} cy={centerY} r="40" fill="white" stroke="var(--primary)" strokeWidth="3" className="shadow-md" />
          <text x={centerX} y={centerY - 5} textAnchor="middle" className="text-[32px] fill-[var(--text-main)]">{STEM_EMOJIS[dayGan.name]}</text>
          <text x={centerX} y={centerY + 18} textAnchor="middle" className="text-[10px] font-bold fill-[var(--primary)]">본질(나)</text>
          
          {/* Pulsing Ring */}
          <motion.circle 
            cx={centerX} cy={centerY} r="40" 
            fill="none" stroke="var(--primary)" strokeWidth="1"
            animate={{ r: [40, 50], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </motion.g>
      </svg>

      {/* Node Info Overlay (Hover) */}
      <AnimatePresence>
        {activeNode && !selectedNode && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 right-4 bg-[var(--bg-card)]/90 backdrop-blur-md p-3 rounded-2xl border border-[var(--border-main)] shadow-lg z-20 pointer-events-none"
          >
            {orbitNodes.find(n => n.id === activeNode) && (
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[20px] bg-[var(--bg-card)] shadow-sm border border-[var(--border-main)]`}>
                  {orbitNodes.find(n => n.id === activeNode)?.isGan 
                    ? STEM_EMOJIS[orbitNodes.find(n => n.id === activeNode)?.data.name || ''] 
                    : BRANCH_EMOJIS[orbitNodes.find(n => n.id === activeNode)?.data.name || '']}
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-[var(--text-main)]">
                    {orbitNodes.find(n => n.id === activeNode)?.data.modernTerm}
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {orbitNodes.find(n => n.id === activeNode)?.label} 영역의 에너지
                  </p>
                </div>
                <div className="ml-auto bg-[var(--bg-muted)] px-2 py-1 rounded-md text-[10px] font-bold text-[var(--text-muted)]">
                  {orbitNodes.find(n => n.id === activeNode)?.data.tenDeity}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Node Popup (Click) - Rendered via Portal to escape overflow-hidden */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedNode && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--text-main)]/60 backdrop-blur-sm"
              onClick={() => setSelectedNode(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-[var(--bg-card)] rounded-3xl p-6 shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="absolute top-4 right-4 p-2 bg-[var(--bg-muted)] text-[var(--text-muted)] rounded-full hover:bg-[var(--border-main)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="flex flex-col items-center text-center mb-6 mt-2">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-main)] shadow-sm flex items-center justify-center text-[32px] mb-3">
                    {selectedNode.isCenter 
                      ? STEM_EMOJIS[selectedNode.data.name] 
                      : (selectedNode.isGan ? STEM_EMOJIS[selectedNode.data.name] : BRANCH_EMOJIS[selectedNode.data.name])}
                  </div>
                  <div className="inline-block px-3 py-1 bg-[var(--bg-muted)] text-[var(--text-secondary)] text-[11px] font-bold rounded-full mb-2">
                    {selectedNode.label} 영역
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-main)]">
                    {selectedNode.data.modernTerm} <span className="text-[var(--text-muted)] text-base font-normal">({selectedNode.data.hanja})</span>
                  </h3>
                </div>

                <div className="space-y-4">
                  {selectedNode.isCenter ? (
                    <div className="bg-[var(--bg-input)] p-5 rounded-2xl">
                      <h4 className="font-bold text-[var(--text-main)] mb-3 text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                        나의 본질 (일간)
                      </h4>
                      <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-4">
                        당신의 타고난 기질과 영혼의 색깔을 나타내는 가장 중요한 에너지입니다. 모든 관계와 운명의 중심이 되는 별이며, 이 에너지를 어떻게 활용하느냐에 따라 삶의 방향이 크게 달라집니다.
                      </p>
                      <div className="pt-4 border-t border-[var(--border-main)]">
                        <span className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">💡 조언</span>
                        <p className="text-[13px] text-[var(--text-secondary)] font-medium leading-relaxed">
                          자신의 본질을 있는 그대로 받아들이고 사랑하는 것이 모든 운명 개척의 첫걸음입니다.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-[var(--bg-input)] p-5 rounded-2xl">
                        <h4 className="font-bold text-[var(--text-main)] mb-3 text-sm flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" />
                          {TEN_DEITY_DESC[selectedNode.data.tenDeity]?.title || selectedNode.data.tenDeity}
                        </h4>
                        <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-4">
                          {TEN_DEITY_DESC[selectedNode.data.tenDeity]?.desc || '당신의 삶에 영향을 주는 중요한 에너지입니다.'}
                        </p>
                        
                        <div className="space-y-4">
                          <div className="pt-4 border-t border-[var(--border-main)]">
                            <span className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">나와의 관계성</span>
                            <p className="text-[13px] text-[var(--text-secondary)] font-medium mb-2">
                              {TEN_DEITY_DESC[selectedNode.data.tenDeity]?.relation || '서로 영향을 주고받는 관계'}
                            </p>
                            <div className="bg-[var(--bg-muted)]/50 rounded-lg p-3 mt-2 border border-[var(--border-main)]">
                              <span className="text-[10px] font-bold text-[var(--text-muted)] block mb-1 flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="m15 5 7 7-7 7"/></svg>
                                에너지 흐름 (선의 굵기와 방향)
                              </span>
                              <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                                {selectedNode.relation === 0 && "선이 얇고 화살표가 없는 것은 서로 동등하게 에너지를 교류하는 평등한 관계임을 의미합니다."}
                                {selectedNode.relation === 1 && "밖으로 향하는 얇은 선은 나의 에너지가 자연스럽게 흘러가서 이 영역을 돕고 키워주는(생해주는) 관계임을 의미합니다."}
                                {selectedNode.relation === -1 && "밖으로 향하는 굵은 선은 내가 강한 에너지를 써서 이 영역을 통제하고 관리하는(극하는) 관계임을 의미합니다."}
                                {selectedNode.relation === 2 && "나를 향하는 얇은 선은 이 영역의 에너지가 나에게 자연스럽게 흘러들어와 나를 돕고 키워주는(생해주는) 관계임을 의미합니다."}
                                {selectedNode.relation === -2 && "나를 향하는 굵은 선은 이 영역의 강한 에너지가 나를 엄격하게 통제하고 단련시키는(극하는) 관계임을 의미합니다."}
                              </p>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-[var(--border-main)]">
                            <span className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">💡 조언</span>
                            <p className="text-[13px] text-[var(--text-secondary)] font-medium leading-relaxed">
                              {TEN_DEITY_DESC[selectedNode.data.tenDeity]?.advice || '이 에너지를 긍정적으로 활용해보세요.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="w-full mt-6 py-3 bg-[var(--text-main)] text-white rounded-xl font-bold text-sm hover:bg-[var(--text-main)] transition-colors"
                >
                  확인
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Technical Toggle Hint */}
      <div className="absolute top-4 right-4">
        <button 
          onClick={() => setShowTechnical(!showTechnical)}
          className={`p-2 rounded-full transition-colors ${showTechnical ? 'bg-[var(--primary)] text-[var(--bg-main)]' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-main)]'}`}
        >
          <Zap className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// --- 3. Progressive Disclosure Wrapper ---
export const SajuStoryteller: React.FC<{ result: any, onToast?: (msg: string) => void, onTermClick?: (term: string) => void }> = ({ result, onToast, onTermClick }) => {
  const [step, setStep] = useState(1);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowOnboarding(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (showOnboarding) {
    const elements = [
      { hanja: result.chart.year.stem.name, isGan: true, element: result.chart.year.stem.element },
      { hanja: result.chart.month.stem.name, isGan: true, element: result.chart.month.stem.element },
      { hanja: result.chart.day.stem.name, isGan: true, element: result.chart.day.stem.element },
      { hanja: result.chart.time.stem.name, isGan: true, element: result.chart.time.stem.element },
      { hanja: result.chart.year.branch.name, isGan: false, element: result.chart.year.branch.element },
      { hanja: result.chart.month.branch.name, isGan: false, element: result.chart.month.branch.element },
      { hanja: result.chart.day.branch.name, isGan: false, element: result.chart.day.branch.element },
      { hanja: result.chart.time.branch.name, isGan: false, element: result.chart.time.branch.element }
    ];
    
    // Convert elements like '쥐(물)' to just '물'
    const cleanElements = elements.map(e => {
      let cleanEl = e.element;
      if (cleanEl.includes('(')) cleanEl = cleanEl.split('(')[1].replace(')', '');
      return { ...e, cleanEl };
    });

    return (
      <div className="flex flex-col items-center justify-center h-64 bg-[var(--bg-card)] rounded-[32px] border border-[var(--border-main)] shadow-sm overflow-hidden relative">
        <h3 className="text-lg font-bold text-[var(--text-main)] mb-8 z-10 bg-[var(--bg-card)]/80 px-4 py-2 rounded-full backdrop-blur-sm">
          당신의 우주는 이런 에너지들로 이루어져 있어요 ✨
        </h3>
        <div className="flex flex-wrap justify-center gap-4 max-w-xs z-10">
          {cleanElements.map((item, i) => {
            const emoji = item.isGan ? STEM_EMOJIS[item.hanja] : BRANCH_EMOJIS[item.hanja];
            const colorClass = 
              item.cleanEl === '나무' ? 'text-[#2E7D32] dark:text-[#81C784] bg-[#E8F5E9] dark:bg-[#2E7D32]/20 border-[#2E7D32]/30 dark:border-[#81C784]/30' :
              item.cleanEl === '불' ? 'text-[var(--primary)] bg-[var(--primary-light)] border-[var(--primary)]/30' :
              item.cleanEl === '흙' ? 'text-[#F57F17] dark:text-[#FFD54F] bg-[#FFF8E1] dark:bg-[#F57F17]/20 border-[#F57F17]/30 dark:border-[#FFD54F]/30' :
              item.cleanEl === '쇠' ? 'text-[#6A1B9A] dark:text-[#CE93D8] bg-[#F3E5F5] dark:bg-[#6A1B9A]/20 border-[#6A1B9A]/30 dark:border-[#CE93D8]/30' :
              'text-[#1565C0] dark:text-[#90CAF9] bg-[#E3F2FD] dark:bg-[#1565C0]/20 border-[#1565C0]/30 dark:border-[#90CAF9]/30';

            return (
              <motion.div
                key={i}
                initial={{ y: -150, opacity: 0, rotate: Math.random() * 90 - 45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ delay: i * 0.15, type: 'spring', bounce: 0.6 }}
                className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shadow-sm border ${colorClass}`}
              >
                <span className="text-xl">{emoji}</span>
                <span className="text-[10px] font-bold opacity-80 mt-0.5">{item.hanja}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Core Energy */}
      <section className="bg-[var(--bg-card)] rounded-[32px] p-6 border border-[var(--border-main)] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-main)]">에너지 성적표</h3>
            <p className="text-xs text-[var(--text-muted)]">당신을 해석하는 5가지 핵심 키워드</p>
          </div>
          <div className="bg-[var(--bg-input)] px-3 py-1 rounded-full text-[10px] font-bold text-[var(--text-muted)]">STEP 01</div>
        </div>
        
        <ElementScoreboard scores={result.elementScores} onToast={onToast} onTermClick={onTermClick} />
        
        {step === 1 && (
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setStep(2)}
            className="w-full py-4 bg-[var(--text-main)] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[var(--text-main)] transition-colors"
          >
            에너지 관계도 확인하기
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
      </section>

      {/* Step 2: Relationship Map */}
      <AnimatePresence>
        {step >= 2 && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-[var(--bg-card)] rounded-[32px] p-6 border border-[var(--border-main)] shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-main)]">운명의 네트워크</h3>
                <p className="text-xs text-[var(--text-muted)]">나를 중심으로 회전하는 에너지들</p>
              </div>
              <div className="bg-[var(--bg-input)] px-3 py-1 rounded-full text-[10px] font-bold text-[var(--text-muted)]">STEP 02</div>
            </div>

            <SajuNetworkGraph chart={result.chart} onNodeClick={(msg, term) => {
              if (onTermClick && term) {
                onTermClick(term);
              } else if (onToast) {
                onToast(msg);
              }
            }} />

            <div className="mt-6 p-4 bg-[var(--bg-input)] rounded-2xl">
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed italic text-center mb-4">
                "중앙의 붉은 원은 당신의 본질입니다. <br/>
                주변의 행성들을 터치하여 각 에너지가 당신의 삶에 <br/>
                어떤 현대적 의미를 갖는지 확인해보세요."
              </p>
              <div className="pt-4 border-t border-[var(--border-main)]">
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {result.networkInterpretation}
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};
