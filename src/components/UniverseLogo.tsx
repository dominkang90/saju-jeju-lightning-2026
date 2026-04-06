import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles, Float, Stars, Trail } from '@react-three/drei';
import * as THREE from 'three';

// 태양 (양의 기운)
export const Sun = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (sunRef.current) {
      sunRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group>
      <mesh ref={sunRef}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial 
          color="#FDB813" 
          emissive="#FDB813" 
          emissiveIntensity={2} 
          toneMapped={false} 
        />
      </mesh>
      <pointLight color="#FDB813" intensity={2} distance={10} />
      {/* 태양의 코로나(빛번짐) 효과 */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#FDB813" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

// 달 (음의 기운)
export const Moon = () => {
  const groupRef = useRef<THREE.Group>(null);
  const moonRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      // 달이 태양(중심)을 공전
      groupRef.current.rotation.y = t * 0.5;
      groupRef.current.rotation.z = Math.sin(t * 0.2) * 0.2; // 약간의 궤도 기울기
    }
    if (moonRef.current) {
      // 달 자체의 자전
      moonRef.current.rotation.y = t * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <group position={[1.5, 0, 0]}>
        <mesh ref={moonRef}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial 
            color="#E2E8F0" 
            emissive="#94A3B8" 
            emissiveIntensity={1} 
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
        <pointLight color="#E2E8F0" intensity={0.5} distance={5} />
        <mesh>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshBasicMaterial color="#E2E8F0" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
};

// 나침반의 궤도 링 (운명의 수레바퀴)
export const CompassRings = () => {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.PI / 2;
      ring1Ref.current.rotation.z = t * 0.1;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.2) * 0.2;
      ring2Ref.current.rotation.y = Math.cos(t * 0.2) * 0.2;
      ring2Ref.current.rotation.z = -t * 0.15;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = Math.PI / 2;
      ring3Ref.current.rotation.y = Math.PI / 4;
      ring3Ref.current.rotation.z = t * 0.05;
    }
  });

  const brassMaterial = new THREE.MeshStandardMaterial({
    color: '#D4AF37', // 황동/금색
    metalness: 0.8,
    roughness: 0.2,
    envMapIntensity: 1,
  });

  return (
    <group>
      {/* 안쪽 링 */}
      <mesh ref={ring1Ref} material={brassMaterial}>
        <torusGeometry args={[2.0, 0.015, 16, 100]} />
      </mesh>
      {/* 중간 링 (기울어짐) */}
      <mesh ref={ring2Ref} material={brassMaterial}>
        <torusGeometry args={[2.4, 0.02, 16, 100]} />
      </mesh>
      {/* 바깥쪽 링 */}
      <mesh ref={ring3Ref} material={brassMaterial}>
        <torusGeometry args={[2.8, 0.01, 16, 100]} />
      </mesh>
      
      {/* 나침반 바늘 (가상의 축) */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 6, 8]} />
        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

// 오행을 상징하는 5개의 떠도는 별
export const ElementStars = () => {
  const groupRef = useRef<THREE.Group>(null);
  const colors = ['#10B981', '#EF4444', '#F59E0B', '#E5E7EB', '#3B82F6']; // 목화토금수

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {colors.map((color, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 2.4; // 중간 링 궤도
        return (
          <group key={i} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
            <Trail width={0.05} color={color} length={20} decay={1}>
              <mesh>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshBasicMaterial color={color} />
              </mesh>
            </Trail>
            <pointLight color={color} intensity={0.5} distance={2} />
          </group>
        );
      })}
    </group>
  );
};

export const CelestialScene = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ pointer }) => {
    if (groupRef.current) {
      // 마우스에 따라 전체 씬이 부드럽게 반응
      const targetX = (pointer.y * Math.PI) / 8;
      const targetY = (pointer.x * Math.PI) / 8;
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;
    }
  });

  return (
    <group ref={groupRef} rotation={[Math.PI / 6, 0, 0]}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <Sun />
        <Moon />
        <CompassRings />
        <ElementStars />
      </Float>
      
      {/* 우주 배경의 은은한 별빛 */}
      <Stars radius={10} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={50} scale={6} size={2} speed={0.2} opacity={0.2} color="#D4AF37" />
    </group>
  );
};

export const UniverseLogo = () => {
  return (
    <div className="w-full h-[300px] md:h-[400px] relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#020617] via-[#0F172A] to-[#1E293B] shadow-2xl mb-12">
      {/* 신비로운 우주 배경 효과 */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1E3A8A] via-transparent to-transparent"></div>
      
      <Canvas camera={{ position: [0, 2, 6], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#FFF8E7" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#3B82F6" />
        
        <CelestialScene />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
        <p className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase opacity-90 drop-shadow-md">
          Celestial Compass
        </p>
        <p className="text-white/60 text-xs mt-1 font-light tracking-wide">
          해와 달, 그리고 별이 가리키는 운명의 나침반
        </p>
      </div>
    </div>
  );
};
