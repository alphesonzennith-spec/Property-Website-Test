'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

interface DistrictCluster {
  name: string;
  code: string;
  position: [number, number, number];
  count: number;
  showLabel: boolean;
}

const DISTRICTS: DistrictCluster[] = [
  { name: 'Marina Bay', code: 'D01', position: [0.1, 0.05, 0.4], count: 320, showLabel: true },
  { name: 'Sentosa', code: 'D04', position: [-0.6, 0.05, 0.7], count: 180, showLabel: false },
  { name: 'Buona Vista', code: 'D05', position: [-0.9, 0.05, 0.1], count: 210, showLabel: false },
  { name: 'Orchard', code: 'D09', position: [-0.2, 0.05, -0.1], count: 450, showLabel: true },
  { name: 'East Coast', code: 'D15', position: [0.8, 0.05, 0.5], count: 380, showLabel: true },
  { name: 'Tampines', code: 'D18', position: [1.2, 0.05, 0.0], count: 520, showLabel: true },
  { name: 'Punggol', code: 'D19', position: [1.0, 0.05, -0.8], count: 290, showLabel: false },
  { name: 'Bishan', code: 'D20', position: [0.2, 0.05, -0.5], count: 310, showLabel: false },
  { name: 'Jurong', code: 'D22', position: [-1.1, 0.05, 0.4], count: 480, showLabel: true },
  { name: 'Woodlands', code: 'D25', position: [-0.1, 0.05, -1.2], count: 350, showLabel: false },
];

function Island() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Main island body */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI * 0.05, 0, 0]}>
        <boxGeometry args={[3.2, 0.12, 1.8]} />
        <meshStandardMaterial
          color="#0d3b2e"
          emissive="#10B981"
          emissiveIntensity={0.15}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {/* Glow plane */}
      <mesh position={[0, -0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.6, 2.2]} />
        <meshStandardMaterial
          color="#10B981"
          emissive="#10B981"
          emissiveIntensity={0.08}
          transparent
          opacity={0.25}
          roughness={1}
        />
      </mesh>

      {/* Property cluster spheres */}
      {DISTRICTS.map((d) => {
        const scale = 0.04 + (d.count / 520) * 0.1;
        return (
          <group key={d.code}>
            <mesh position={d.position}>
              <sphereGeometry args={[scale, 16, 16]} />
              <meshStandardMaterial
                color="#F59E0B"
                emissive="#F59E0B"
                emissiveIntensity={0.6}
                roughness={0.2}
                metalness={0.5}
              />
            </mesh>
            {/* Pulse ring */}
            <mesh position={[d.position[0], d.position[1] - 0.01, d.position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[scale * 1.4, scale * 1.8, 32]} />
              <meshBasicMaterial color="#F59E0B" transparent opacity={0.3} />
            </mesh>
            {d.showLabel && (
              <Html
                position={[d.position[0], d.position[1] + scale + 0.15, d.position[2]]}
                center
                distanceFactor={6}
              >
                <div
                  style={{
                    background: 'rgba(13, 33, 55, 0.85)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '9px',
                    color: '#10B981',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {d.name}
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Grid lines */}
      <gridHelper args={[4, 12, '#10B98120', '#10B98110']} position={[0, -0.09, 0]} />
    </group>
  );
}

export default function SingaporeMapCanvas() {
  const dummyVec = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  return (
    <Canvas
      camera={{ position: [0, 3.5, 4], fov: 45 }}
      style={{ background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
      aria-label="Interactive 3D map of Singapore property districts"
    >
      <ambientLight intensity={0.4} color="#10B981" />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-3, 2, -3]} intensity={0.4} color="#6366F1" />
      <pointLight position={[0, 4, 0]} intensity={0.6} color="#10B981" />

      <Island />

      <OrbitControls
        target={dummyVec}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}
