"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/app/providers";

function Particles({ count = 50 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);
  const mouse = useRef({ x: 0, y: 0 });

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * 15 + 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = -(Math.random() * 0.02 + 0.01);
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    return [pos, vel];
  }, [count]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    if (!mesh.current) return;
    const posArray = (mesh.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArray[i * 3] += velocities[i * 3];
      posArray[i * 3 + 1] += velocities[i * 3 + 1];
      posArray[i * 3 + 2] += velocities[i * 3 + 2];

      const dx = posArray[i * 3] - mouse.current.x * 8;
      const dy = posArray[i * 3 + 1] - mouse.current.y * 8;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2) {
        posArray[i * 3] += dx * 0.01;
        posArray[i * 3 + 1] += dy * 0.01;
      }

      if (posArray[i * 3 + 1] < -8) {
        posArray[i * 3] = (Math.random() - 0.5) * 20;
        posArray[i * 3 + 1] = 8;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#0071e3"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function ParticleBackground() {
  const { particles, theme } = useTheme();

  if (!particles) return null;

  return (
    <div className="fixed inset-0 z-40" style={{ pointerEvents: "none" }}>
      <Canvas
        style={{ pointerEvents: "none" }}
        camera={{ position: [0, 0, 10], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <Particles count={50} />
      </Canvas>
    </div>
  );
}
