import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { CelestialScene } from './UniverseLogo';
import { Logo } from './Logo';

const LOADING_PHRASES = [
  "하늘의 기운을 모아\n당신의 명식을 세우는 중입니다...",
  "운명의 실타래를 조심스럽게 풀며\n길흉화복을 가늠하고 있습니다...",
  "별들의 속삭임을 데이터로 변환하여\n오행의 흐름을 읽고 있습니다...",
  "당신의 오행(木, 火, 土, 金, 水)이\n어떻게 조화를 이루는지 분석 중입니다...",
  "천간과 지지의 복잡한 상호작용을\n정교하게 계산하고 있습니다...",
  "과거와 현재의 궤적을 바탕으로\n미래의 지도를 정성껏 그리고 있습니다...",
  "우주의 에너지가 당신의 사주 팔자로\n수렴되는 과정을 지켜보고 있습니다...",
  "잠시만 기다려주세요.\n우주가 당신만을 위한 답을 준비하고 있습니다...",
  "당신이 타고난 복록과 잠재력을\n하나하나 짚어보고 있습니다...",
  "대운의 흐름이 앞으로 10년간\n어디로 향하는지 분석하고 있습니다...",
  "당신만의 '인생 치트키'가 무엇인지\n명리학적 관점에서 찾는 중입니다...",
  "삼라만상의 이치를\n당신의 사주에 대입하여 해석 중입니다...",
  "음양오행의 미세한 불균형을 찾아\n개운의 실마리를 엮고 있습니다...",
  "당신의 삶에 숨겨진 특별한 재능과\n인연의 끈을 발견하는 중입니다..."
];

interface LoadingScreenProps {}

const ExpandingCelestialScene = ({ progress }: { progress: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = Math.min(clock.getElapsedTime() / 2, 1);
      const scale = 0.5 + t * 0.5;
      groupRef.current.scale.set(scale, scale, scale);
      groupRef.current.position.z = -3 + t * 3;
    }
  });

  return (
    <group ref={groupRef}>
      <CelestialScene />
    </group>
  );
};

export const LoadingScreen: React.FC<LoadingScreenProps> = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [finalPhraseIndex, setFinalPhraseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  const FINAL_PHRASES = [
    "우주의 기운이 조금 복잡하네요...",
    "깊은 통찰을 위해 별들이 정렬 중입니다...",
    "당신만을 위한 특별한 조언을 엮고 있습니다...",
    "운명의 실타래가 거의 다 풀렸습니다...",
    "마지막 기운의 조화를 맞추는 중입니다...",
    "거의 다 되었습니다! 잠시만 더 기다려주세요."
  ];

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const phraseInterval = setInterval(() => {
      if (progressRef.current > 96) {
        setFinalPhraseIndex((prev) => (prev + 1) % FINAL_PHRASES.length);
      } else {
        setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
      }
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99.9) return 99.9;
        const increment = prev < 90 
          ? Math.random() * 8 + 1 
          : (100 - prev) * 0.1;
        return prev + Math.max(increment, 0.05);
      });
    }, 300);

    return () => {
      clearInterval(phraseInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <motion.div 
      ref={containerRef} 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#020617] flex flex-col items-center justify-center p-6 text-center overflow-hidden"
    >
      {/* 3D Universe Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#D4AF37" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3B82F6" />
          
          <ExpandingCelestialScene progress={progress} />
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.4}
          />
        </Canvas>
      </div>

      {/* Content Overlay: Logo and Loading Bar grouped together */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-6">
        <div className="w-full max-w-md flex flex-col items-center justify-center gap-8 mt-12">
          {/* Logo */}
          <div className="transform scale-125 md:scale-150 mb-4">
            <Logo />
          </div>
          
          {/* Loading Bar Container */}
          <div className="w-full flex flex-col items-center px-4">
            {/* Standard Loading Bar */}
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mb-2 backdrop-blur-sm">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#D4AF37]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="flex justify-end w-full mb-6">
              <span className="text-[12px] font-bold text-[#D4AF37] tracking-widest">
                {Math.floor(progress)}%
              </span>
            </div>
            
            {/* Loading Phrases below the bar */}
            <div className="h-20 flex items-start justify-center w-full">
              <AnimatePresence mode="wait">
                <motion.p
                  key={progress > 96 ? `final-${finalPhraseIndex}` : phraseIndex}
                  initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
                  transition={{ duration: 0.6 }}
                  className="text-[14px] md:text-[16px] font-medium text-white/90 leading-relaxed whitespace-pre-line tracking-wide text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                >
                  {progress > 96 ? FINAL_PHRASES[finalPhraseIndex] : LOADING_PHRASES[phraseIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
