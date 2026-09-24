"use client";
import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Sky,
  Stars,
  Text,
  Billboard,
  Sphere,
  Box,
  Cylinder,
  Plane,
  Ring,
  Torus,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { useSimulation } from "@/app/store/simulation";

// ─── Ground / Terrain ────────────────────────────────────────────────────────
function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  return (
    <group>
      {/* Main farm ground */}
      <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <meshLambertMaterial color="#3d6b2f" />
      </Plane>
      {/* Soil patches - crop rows */}
      {[-3, -1, 1, 3].map((x) =>
        [-3, -1, 1, 3].map((z) => (
          <Box
            key={`soil-${x}-${z}`}
            args={[1.6, 0.06, 1.6]}
            position={[x, 0, z]}
          >
            <meshLambertMaterial color="#5c3d1a" />
          </Box>
        ))
      )}
      {/* Farm border fence posts */}
      {[-5, -2.5, 0, 2.5, 5].map((x) => (
        <group key={`fence-north-${x}`}>
          <Cylinder args={[0.04, 0.04, 1.2]} position={[x, 0.6, -5.5]}>
            <meshLambertMaterial color="#8B4513" />
          </Cylinder>
          <Cylinder args={[0.04, 0.04, 1.2]} position={[x, 0.6, 5.5]}>
            <meshLambertMaterial color="#8B4513" />
          </Cylinder>
        </group>
      ))}
      {[-5, -2.5, 0, 2.5, 5].map((z) => (
        <group key={`fence-east-${z}`}>
          <Cylinder args={[0.04, 0.04, 1.2]} position={[-5.5, 0.6, z]}>
            <meshLambertMaterial color="#8B4513" />
          </Cylinder>
          <Cylinder args={[0.04, 0.04, 1.2]} position={[5.5, 0.6, z]}>
            <meshLambertMaterial color="#8B4513" />
          </Cylinder>
        </group>
      ))}
      {/* Horizontal fence wires */}
      <mesh position={[0, 0.5, -5.5]} rotation={[0, 0, 0]}>
        <boxGeometry args={[11, 0.02, 0.02]} />
        <meshLambertMaterial color="#888" />
      </mesh>
      <mesh position={[0, 0.5, 5.5]}>
        <boxGeometry args={[11, 0.02, 0.02]} />
        <meshLambertMaterial color="#888" />
      </mesh>
      <mesh position={[-5.5, 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[11, 0.02, 0.02]} />
        <meshLambertMaterial color="#888" />
      </mesh>
      <mesh position={[5.5, 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[11, 0.02, 0.02]} />
        <meshLambertMaterial color="#888" />
      </mesh>
      {/* Path */}
      <Plane args={[1.5, 12]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <meshLambertMaterial color="#c4a26e" />
      </Plane>
      <Plane args={[12, 1.5]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <meshLambertMaterial color="#c4a26e" />
      </Plane>
    </group>
  );
}

// ─── Crop Plants ─────────────────────────────────────────────────────────────
function CropPlant({ position, type, health = 1 }: {
  position: [number, number, number];
  type: "wheat" | "rice" | "maize" | "tomato";
  health?: number;
}) {
  const meshRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  const color = health > 0.7 ? "#22c55e" : health > 0.4 ? "#eab308" : "#ef4444";

  if (type === "wheat") {
    return (
      <group position={position}>
        <Cylinder args={[0.03, 0.03, 0.6]} position={[0, 0.3, 0]}>
          <meshLambertMaterial color="#a16207" />
        </Cylinder>
        <Sphere args={[0.12]} position={[0, 0.7, 0]}>
          <meshLambertMaterial color={color} />
        </Sphere>
      </group>
    );
  }
  if (type === "rice") {
    return (
      <group position={position}>
        {[-0.05, 0, 0.05].map((x, i) => (
          <Cylinder key={i} args={[0.02, 0.02, 0.5]} position={[x, 0.25, 0]}>
            <meshLambertMaterial color={color} />
          </Cylinder>
        ))}
      </group>
    );
  }
  if (type === "maize") {
    return (
      <group position={position}>
        <Cylinder args={[0.04, 0.04, 0.8]} position={[0, 0.4, 0]}>
          <meshLambertMaterial color="#15803d" />
        </Cylinder>
        <Box args={[0.08, 0.3, 0.04]} position={[0.08, 0.5, 0]} rotation={[0, 0, 0.3]}>
          <meshLambertMaterial color={color} />
        </Box>
        <Box args={[0.08, 0.3, 0.04]} position={[-0.08, 0.4, 0]} rotation={[0, 0, -0.3]}>
          <meshLambertMaterial color={color} />
        </Box>
        <Cylinder args={[0.05, 0.05, 0.2]} position={[0, 0.9, 0]}>
          <meshLambertMaterial color="#eab308" />
        </Cylinder>
      </group>
    );
  }
  // tomato
  return (
    <group position={position}>
      <Cylinder args={[0.025, 0.025, 0.5]} position={[0, 0.25, 0]}>
        <meshLambertMaterial color="#15803d" />
      </Cylinder>
      <Sphere args={[0.1]} position={[0, 0.55, 0]}>
        <meshLambertMaterial color="#ef4444" />
      </Sphere>
      <Sphere args={[0.08]} position={[0.12, 0.45, 0]}>
        <meshLambertMaterial color="#dc2626" />
      </Sphere>
    </group>
  );
}

function CropField() {
  const cropTypes: Array<"wheat" | "rice" | "maize" | "tomato"> = ["wheat", "rice", "maize", "tomato"];
  const positions: [number, number, number][] = [];
  for (let x = -4.5; x <= 4.5; x += 1.0) {
    for (let z = -4.5; z <= 4.5; z += 1.0) {
      if (Math.abs(x) > 0.6 || Math.abs(z) > 0.6) {
        positions.push([x, 0, z]);
      }
    }
  }
  return (
    <group>
      {positions.map((pos, i) => (
        <CropPlant
          key={i}
          position={pos}
          type={cropTypes[i % cropTypes.length]}
          health={0.7 + Math.random() * 0.3}
        />
      ))}
    </group>
  );
}

// ─── ESP32 Node Tower ─────────────────────────────────────────────────────────
function NodeTower({ position, status, label }: {
  position: [number, number, number];
  status: "active" | "inactive" | "threat";
  label: string;
}) {
  const color = status === "threat" ? "#ef4444" : status === "active" ? "#22c55e" : "#6b7280";
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((_, delta) => {
    if (lightRef.current && status === "threat") {
      lightRef.current.intensity = 1 + Math.sin(Date.now() / 200) * 0.8;
    }
  });

  return (
    <group position={position}>
      {/* Pole */}
      <Cylinder args={[0.05, 0.07, 2]} position={[0, 1, 0]}>
        <meshLambertMaterial color="#374151" />
      </Cylinder>
      {/* Solar panel */}
      <Box args={[0.5, 0.04, 0.35]} position={[0, 2.1, 0]} rotation={[-0.3, 0, 0]}>
        <meshLambertMaterial color="#1e40af" />
      </Box>
      {/* Camera housing */}
      <Box args={[0.15, 0.12, 0.12]} position={[0, 1.85, 0.1]}>
        <meshLambertMaterial color="#1f2937" />
      </Box>
      {/* Camera lens */}
      <Cylinder args={[0.04, 0.04, 0.08]} rotation={[Math.PI / 2, 0, 0]} position={[0, 1.85, 0.18]}>
        <meshLambertMaterial color="#111827" />
      </Cylinder>
      {/* Speaker */}
      <Cylinder args={[0.06, 0.06, 0.1]} position={[0, 1.65, 0.12]}>
        <meshLambertMaterial color="#374151" />
      </Cylinder>
      {/* Status LED */}
      <Sphere args={[0.05]} position={[0, 2.05, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </Sphere>
      {/* Point light for threat */}
      {status === "threat" && (
        <pointLight ref={lightRef} color="#ef4444" intensity={1.5} distance={5} />
      )}
      {/* Label */}
      <Billboard position={[0, 2.5, 0]}>
        <Text fontSize={0.18} color={color} anchorX="center" anchorY="middle">
          {label}
        </Text>
      </Billboard>
      {/* Coverage ring */}
      <Ring args={[1.8, 2, 32]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.DoubleSide} />
      </Ring>
    </group>
  );
}

// ─── Animal (Elephant) ────────────────────────────────────────────────────────
function ElephantMesh({ progress }: { progress: number }) {
  const x = -6 + progress * 12;
  const z = -3;
  const bodyRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (bodyRef.current) {
      bodyRef.current.position.y = 0.3 + Math.abs(Math.sin(Date.now() / 300)) * 0.05;
    }
  });

  return (
    <group position={[x, 0, z]}>
      <group ref={bodyRef}>
        {/* Body */}
        <Sphere args={[0.5, 8, 6]} position={[0, 0.5, 0]} scale={[1.4, 0.9, 0.9]}>
          <meshLambertMaterial color="#6b7280" />
        </Sphere>
        {/* Head */}
        <Sphere args={[0.3, 8, 6]} position={[0.5, 0.7, 0]}>
          <meshLambertMaterial color="#6b7280" />
        </Sphere>
        {/* Trunk */}
        <Cylinder args={[0.08, 0.05, 0.5]} position={[0.75, 0.4, 0]} rotation={[0, 0, -0.8]}>
          <meshLambertMaterial color="#6b7280" />
        </Cylinder>
        {/* Ears */}
        <Sphere args={[0.22, 8, 6]} position={[0.35, 0.75, 0.3]} scale={[0.4, 0.8, 0.1]}>
          <meshLambertMaterial color="#9ca3af" />
        </Sphere>
        <Sphere args={[0.22, 8, 6]} position={[0.35, 0.75, -0.3]} scale={[0.4, 0.8, 0.1]}>
          <meshLambertMaterial color="#9ca3af" />
        </Sphere>
        {/* Legs */}
        {[[-0.2, -0.3], [-0.2, 0.3], [0.2, -0.3], [0.2, 0.3]].map(([lx, lz], i) => (
          <Cylinder key={i} args={[0.1, 0.1, 0.5]} position={[lx, 0, lz]}>
            <meshLambertMaterial color="#4b5563" />
          </Cylinder>
        ))}
        {/* Eyes */}
        <Sphere args={[0.04]} position={[0.72, 0.8, 0.12]}>
          <meshStandardMaterial color="#000" emissive="#ef4444" emissiveIntensity={2} />
        </Sphere>
        {/* Tusk */}
        <Cylinder args={[0.03, 0.01, 0.4]} position={[0.8, 0.55, 0.08]} rotation={[0.2, 0, -0.6]}>
          <meshLambertMaterial color="#fffbeb" />
        </Cylinder>
      </group>
      {/* Bounding box / detection overlay */}
      {progress > 0.2 && (
        <Billboard position={[0, 1.8, 0]}>
          <Html center>
            <div className="border-2 border-red-500 px-2 py-1 text-xs font-mono text-red-400 bg-red-950/50 rounded animate-pulse">
              🐘 ELEPHANT • 0.91
            </div>
          </Html>
        </Billboard>
      )}
    </group>
  );
}

// ─── Wild Boar ────────────────────────────────────────────────────────────────
function WildBoarMesh({ progress }: { progress: number }) {
  const x = -6 + progress * 11;
  const z = 2;
  return (
    <group position={[x, 0.2, z]}>
      <Sphere args={[0.3, 8, 6]} scale={[1.5, 0.8, 0.8]}>
        <meshLambertMaterial color="#78350f" />
      </Sphere>
      <Sphere args={[0.18]} position={[0.45, 0.1, 0]}>
        <meshLambertMaterial color="#92400e" />
      </Sphere>
      {/* Tusk */}
      <Cylinder args={[0.025, 0.01, 0.2]} position={[0.58, 0, 0.06]} rotation={[0.2, 0, -0.5]}>
        <meshLambertMaterial color="#fffbeb" />
      </Cylinder>
      {progress > 0.2 && (
        <Billboard position={[0, 1.0, 0]}>
          <Html center>
            <div className="border-2 border-red-500 px-2 py-1 text-xs font-mono text-red-400 bg-red-950/50 rounded animate-pulse">
              🐗 WILDBOAR • 0.86
            </div>
          </Html>
        </Billboard>
      )}
    </group>
  );
}

// ─── Bird Flock ───────────────────────────────────────────────────────────────
function BirdFlock({ progress }: { progress: number }) {
  const birds = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      offset: [(i % 4) * 0.6 - 0.9, Math.floor(i / 4) * 0.4, (i % 3) * 0.5 - 0.5] as [number, number, number],
      phase: i * 0.5,
    })), []
  );
  const x = -7 + progress * 14;

  return (
    <group position={[x, 3, 1]}>
      {birds.map((b, i) => {
        const wingAngle = Math.sin(Date.now() / 200 + b.phase) * 0.4;
        return (
          <group key={i} position={b.offset}>
            {/* Body */}
            <Sphere args={[0.06, 6, 4]} scale={[2, 0.6, 0.6]}>
              <meshLambertMaterial color="#1c1917" />
            </Sphere>
            {/* Wings */}
            <Box args={[0.25, 0.02, 0.1]} position={[0, 0, 0.12]} rotation={[wingAngle, 0, 0]}>
              <meshLambertMaterial color="#292524" />
            </Box>
            <Box args={[0.25, 0.02, 0.1]} position={[0, 0, -0.12]} rotation={[-wingAngle, 0, 0]}>
              <meshLambertMaterial color="#292524" />
            </Box>
          </group>
        );
      })}
      {progress > 0.15 && (
        <Billboard position={[0, 0.8, 0]}>
          <Html center>
            <div className="border-2 border-yellow-500 px-2 py-1 text-xs font-mono text-yellow-400 bg-yellow-950/50 rounded animate-pulse">
              🐦 BIRD FLOCK • 12 birds
            </div>
          </Html>
        </Billboard>
      )}
    </group>
  );
}

// ─── Fire ─────────────────────────────────────────────────────────────────────
function FireEffect({ intensity }: { intensity: number }) {
  const flameRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (flameRef.current) {
      const t = Date.now() / 150;
      flameRef.current.scale.y = 1 + Math.sin(t) * 0.15;
      flameRef.current.scale.x = 1 + Math.cos(t * 1.3) * 0.1;
    }
  });

  const scale = intensity / 100;

  return (
    <group position={[3, 0, 2]} scale={[scale, scale, scale]}>
      <group ref={flameRef}>
        {/* Base fire */}
        <Sphere args={[0.5, 8, 8]} position={[0, 0.5, 0]} scale={[1, 1.5, 1]}>
          <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={3} transparent opacity={0.9} />
        </Sphere>
        {/* Inner flame */}
        <Sphere args={[0.3, 8, 8]} position={[0, 0.8, 0]} scale={[1, 1.8, 1]}>
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={4} transparent opacity={0.8} />
        </Sphere>
        {/* Tip */}
        <Sphere args={[0.15, 6, 6]} position={[0, 1.3, 0]} scale={[1, 2, 1]}>
          <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={5} transparent opacity={0.6} />
        </Sphere>
        {/* Secondary fires */}
        <Sphere args={[0.3, 8, 8]} position={[0.6, 0.3, 0.4]} scale={[1, 1.2, 1]}>
          <meshStandardMaterial color="#f97316" emissive="#dc2626" emissiveIntensity={2} transparent opacity={0.85} />
        </Sphere>
        <Sphere args={[0.25, 8, 8]} position={[-0.5, 0.3, 0.3]} scale={[1, 1.1, 1]}>
          <meshStandardMaterial color="#fb923c" emissive="#ea580c" emissiveIntensity={2} transparent opacity={0.8} />
        </Sphere>
        {/* Smoke particles (dark spheres above) */}
        {[0, 0.4, 0.8, 1.2].map((y, i) => (
          <Sphere key={i} args={[0.2 + i * 0.1]} position={[(i % 2 - 0.5) * 0.3, 1.8 + y, 0]} >
            <meshStandardMaterial color="#1f2937" transparent opacity={0.3 - i * 0.05} />
          </Sphere>
        ))}
      </group>
      {/* Point light */}
      <pointLight color="#f97316" intensity={intensity / 20} distance={8} />
      {/* Detection box */}
      <Billboard position={[0, 2.5, 0]}>
        <Html center>
          <div className="border-2 border-orange-500 px-2 py-1 text-xs font-mono text-orange-400 bg-orange-950/50 rounded animate-pulse">
            🔥 FIRE DETECTED • {Math.round(intensity)}%
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

// ─── Irrigation Sprinkler ─────────────────────────────────────────────────────
function Sprinkler({ position, active }: { position: [number, number, number]; active: boolean }) {
  const rotRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (rotRef.current && active) {
      rotRef.current.rotation.y += delta * 2;
    }
  });

  return (
    <group position={position}>
      {/* Pipe */}
      <Cylinder args={[0.03, 0.03, 0.4]} position={[0, 0.2, 0]}>
        <meshLambertMaterial color="#374151" />
      </Cylinder>
      {/* Head */}
      <group ref={rotRef} position={[0, 0.45, 0]}>
        <Cylinder args={[0.05, 0.04, 0.08]}>
          <meshLambertMaterial color="#6b7280" />
        </Cylinder>
        {/* Spray arms */}
        {active && [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
          <group key={i} rotation={[0, angle, 0]}>
            <Box args={[0.3, 0.02, 0.02]} position={[0.15, 0, 0]}>
              <meshLambertMaterial color="#4b5563" />
            </Box>
            {/* Water droplets */}
            {[0.1, 0.2, 0.3].map((d, j) => (
              <Sphere key={j} args={[0.015]} position={[d + 0.1, -0.05 * j, 0]}>
                <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={1} transparent opacity={0.8} />
              </Sphere>
            ))}
          </group>
        ))}
      </group>
      {/* Status indicator */}
      <Sphere args={[0.04]} position={[0, 0.52, 0]}>
        <meshStandardMaterial
          color={active ? "#22c55e" : "#6b7280"}
          emissive={active ? "#22c55e" : "#000"}
          emissiveIntensity={active ? 2 : 0}
        />
      </Sphere>
    </group>
  );
}

// ─── Soil Sensor ──────────────────────────────────────────────────────────────
function SoilSensor({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Cylinder args={[0.04, 0.04, 0.3]} position={[0, 0.15, 0]}>
        <meshLambertMaterial color="#1f2937" />
      </Cylinder>
      <Box args={[0.12, 0.08, 0.04]} position={[0, 0.35, 0]}>
        <meshStandardMaterial color="#1e40af" emissive="#1d4ed8" emissiveIntensity={0.5} />
      </Box>
      <Sphere args={[0.03]} position={[0, 0.42, 0]}>
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
      </Sphere>
    </group>
  );
}

// ─── Central ESP32 Hub ────────────────────────────────────────────────────────
function CentralHub() {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.8;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Base */}
      <Cylinder args={[0.3, 0.35, 0.15]} position={[0, 0.075, 0]}>
        <meshLambertMaterial color="#1f2937" />
      </Cylinder>
      {/* ESP32 board */}
      <Box args={[0.4, 0.05, 0.3]} position={[0, 0.18, 0]}>
        <meshStandardMaterial color="#1e3a5f" emissive="#1e40af" emissiveIntensity={0.3} />
      </Box>
      {/* Antenna */}
      <Cylinder args={[0.015, 0.015, 0.5]} position={[0.15, 0.45, 0]}>
        <meshLambertMaterial color="#374151" />
      </Cylinder>
      {/* WiFi signal rings */}
      <mesh ref={ringRef} position={[0, 0.25, 0]}>
        <torusGeometry args={[0.5, 0.01, 8, 32]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1} transparent opacity={0.6} />
      </mesh>
      <Torus args={[0.8, 0.008, 8, 32]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} transparent opacity={0.3} />
      </Torus>
      {/* Label */}
      <Billboard position={[0, 0.7, 0]}>
        <Text fontSize={0.14} color="#4ade80" anchorX="center">
          ESP32 Hub
        </Text>
      </Billboard>
    </group>
  );
}

// ─── Scene Lighting ───────────────────────────────────────────────────────────
function SceneLighting({ activeThreat }: { activeThreat: string }) {
  return (
    <>
      <ambientLight intensity={activeThreat === "fire" ? 0.4 : 0.6} color={activeThreat === "fire" ? "#ff8c00" : "#ffffff"} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow color="#fff9e6" />
      <directionalLight position={[-5, 8, -5]} intensity={0.4} color="#c7d7ff" />
      {activeThreat === "fire" && (
        <pointLight position={[3, 3, 2]} color="#f97316" intensity={3} distance={12} />
      )}
    </>
  );
}

// ─── Main 3D Scene ────────────────────────────────────────────────────────────
export default function FarmScene() {
  const {
    activeThreat,
    animalType,
    animalPosition,
    birdPosition,
    birdFlock,
    fireIntensity,
    cameraNodes,
    irrigationZones,
  } = useSimulation();

  return (
    <Canvas
      camera={{ position: [8, 7, 10], fov: 55, near: 0.1, far: 200 }}
      shadows
      style={{ background: "linear-gradient(180deg, #0c1a3a 0%, #0a2a1a 60%, #0a0f0d 100%)" }}
    >
      <SceneLighting activeThreat={activeThreat} />
      <Stars radius={80} depth={40} count={3000} factor={3} fade />
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0.5}
        azimuth={0.25}
        rayleigh={activeThreat === "fire" ? 3 : 1}
      />

      {/* Farm */}
      <Terrain />
      <CropField />

      {/* Irrigation */}
      {[[-2, 0, -2], [2, 0, -2], [-2, 0, 2], [2, 0, 2]].map((pos, i) => (
        <Sprinkler
          key={i}
          position={pos as [number, number, number]}
          active={irrigationZones[i]?.active ?? false}
        />
      ))}

      {/* Soil sensors */}
      {[[-1, 0, -1], [1, 0, 1], [-1, 0, 2], [1, 0, -2]].map((pos, i) => (
        <SoilSensor key={i} position={pos as [number, number, number]} />
      ))}

      {/* Camera nodes */}
      {cameraNodes.map((node) => (
        <NodeTower
          key={node.id}
          position={node.position}
          status={node.status}
          label={node.id}
        />
      ))}

      {/* Central Hub */}
      <CentralHub />

      {/* Threats */}
      {activeThreat === "animal" && animalPosition >= 0 && (
        animalType === "elephant"
          ? <ElephantMesh progress={animalPosition} />
          : <WildBoarMesh progress={animalPosition} />
      )}
      {activeThreat === "bird" && birdFlock && birdPosition >= 0 && (
        <BirdFlock progress={birdPosition} />
      )}
      {activeThreat === "fire" && fireIntensity > 0 && (
        <FireEffect intensity={fireIntensity} />
      )}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={3}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.1}
        autoRotate={activeThreat === "none"}
        autoRotateSpeed={0.4}
      />
    </Canvas>
  );
}
