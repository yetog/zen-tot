import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface AvatarCoreProps {
  isSpeaking: boolean;
  isConnected: boolean;
}

const AvatarCore: React.FC<AvatarCoreProps> = ({ isSpeaking, isConnected }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  
  // Breathing animation + lip sync
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (meshRef.current) {
      // Breathing effect
      const breathe = Math.sin(time * 1.5) * 0.03;
      meshRef.current.scale.setScalar(1 + breathe);
      
      // Subtle idle rotation
      meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      meshRef.current.rotation.z = Math.sin(time * 0.3) * 0.02;
    }
    
    if (glowRef.current) {
      // Pulsing glow when connected
      const glowIntensity = isConnected 
        ? 1.2 + Math.sin(time * 2) * 0.3 
        : 0.8;
      glowRef.current.scale.setScalar(glowIntensity);
    }
    
    // Eye blink animation
    if (eyeLeftRef.current && eyeRightRef.current) {
      const blink = Math.sin(time * 0.5) > 0.95 ? 0.1 : 1;
      eyeLeftRef.current.scale.y = blink;
      eyeRightRef.current.scale.y = blink;
    }
    
    // Lip sync animation when speaking
    if (mouthRef.current) {
      if (isSpeaking) {
        const lipSync = Math.abs(Math.sin(time * 15)) * 0.15 + 0.05;
        mouthRef.current.scale.y = lipSync * 3;
        mouthRef.current.scale.x = 1 + lipSync * 0.5;
      } else {
        // Subtle smile when idle
        mouthRef.current.scale.y = 0.3;
        mouthRef.current.scale.x = 1;
      }
    }
  });

  const primaryColor = useMemo(() => new THREE.Color('#a855f7'), []);
  const accentColor = useMemo(() => new THREE.Color('#c084fc'), []);
  const glowColor = useMemo(() => new THREE.Color('#e879f9'), []);

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group>
        {/* Outer glow sphere */}
        <mesh ref={glowRef} scale={1.3}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial 
            color={glowColor} 
            transparent 
            opacity={0.1} 
          />
        </mesh>
        
        {/* Main avatar body */}
        <Sphere ref={meshRef} args={[1, 64, 64]}>
          <MeshDistortMaterial
            color={primaryColor}
            attach="material"
            distort={isSpeaking ? 0.3 : 0.1}
            speed={isSpeaking ? 4 : 1.5}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
        
        {/* Face features */}
        <group position={[0, 0.1, 0.9]}>
          {/* Left eye */}
          <mesh ref={eyeLeftRef} position={[-0.25, 0.15, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
          </mesh>
          
          {/* Right eye */}
          <mesh ref={eyeRightRef} position={[0.25, 0.15, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
          </mesh>
          
          {/* Left pupil */}
          <mesh position={[-0.25, 0.15, 0.08]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
          
          {/* Right pupil */}
          <mesh position={[0.25, 0.15, 0.08]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
          
          {/* Mouth */}
          <mesh ref={mouthRef} position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.08, 0.2, 8, 16]} />
            <meshStandardMaterial 
              color={accentColor} 
              emissive={isSpeaking ? accentColor : primaryColor}
              emissiveIntensity={isSpeaking ? 0.8 : 0.2}
            />
          </mesh>
        </group>
        
        {/* Floating rings when speaking */}
        {isSpeaking && (
          <>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
              <ringGeometry args={[1.3, 1.35, 64]} />
              <meshBasicMaterial color={glowColor} transparent opacity={0.6} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
              <ringGeometry args={[1.5, 1.53, 64]} />
              <meshBasicMaterial color={accentColor} transparent opacity={0.4} />
            </mesh>
          </>
        )}
      </group>
    </Float>
  );
};

interface ZenAvatar3DProps {
  isSpeaking: boolean;
  isConnected: boolean;
  className?: string;
}

const ZenAvatar3D: React.FC<ZenAvatar3DProps> = ({ 
  isSpeaking, 
  isConnected, 
  className = '' 
}) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#a855f7" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#c084fc" />
        <spotLight
          position={[0, 5, 5]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          color="#e879f9"
        />
        
        <AvatarCore isSpeaking={isSpeaking} isConnected={isConnected} />
        
        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
          color="#a855f7"
        />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default ZenAvatar3D;
