import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useMemo } from "react";
import type { ArticulationSceneConfig } from "../../data/articulationGuides";

const LERP = 3.5;
const ORANGE = new THREE.Color("#F97316");
const PURPLE = new THREE.Color("#A855F7");
const AMBER = new THREE.Color("#F59E0B");
const CORAL = new THREE.Color("#FB7185");

// ─── Dental arch tooth positions ─────────────────────────────────────────────

function buildTeethArc(y: number, z: number, count: number, arcRadius: number, halfAngle: number) {
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0 : (i / (count - 1)) * 2 - 1; // -1..1
    const angle = t * halfAngle;
    const x = Math.sin(angle) * arcRadius;
    const zOff = (1 - Math.cos(angle)) * -0.15;
    return [x, y, z + zOff] as [number, number, number];
  });
}

const UPPER_TEETH = buildTeethArc(0.28, 0.05, 7, 0.70, 0.75);
const LOWER_TEETH = buildTeethArc(-0.28, 0.05, 7, 0.65, 0.70);

// ─── Reusable helpers ────────────────────────────────────────────────────────

function RoundMesh({
  initialPos,
  w, h, d, radius = 0.08,
  color,
  highlightColor,
  targetPosY,
  targetScaleX = 1,
  targetGlow = 0,
}: {
  initialPos: [number, number, number];
  w: number; h: number; d: number; radius?: number;
  color: string;
  highlightColor: THREE.Color;
  targetPosY?: number;
  targetScaleX?: number;
  targetGlow?: number;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const initY = initialPos[1];

  useFrame((_, delta) => {
    const g = groupRef.current;
    const m = matRef.current;
    if (!g || !m) return;
    const ty = targetPosY !== undefined ? targetPosY : initY;
    g.position.y += (ty - g.position.y) * delta * LERP;
    g.scale.x += (targetScaleX - g.scale.x) * delta * LERP;
    m.emissiveIntensity += (targetGlow - m.emissiveIntensity) * delta * LERP;
  });

  return (
    <group ref={groupRef} position={initialPos}>
      <mesh>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={highlightColor}
          emissiveIntensity={0}
          roughness={0.65}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

// ─── Alveolar ridge / velum highlight sphere ──────────────────────────────────

function HighlightBump({
  position,
  radius,
  color,
  targetGlow,
  label,
}: {
  position: [number, number, number];
  radius: number;
  color: THREE.Color;
  targetGlow: number;
  label: string;
}) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame((_, delta) => {
    const m = matRef.current;
    if (!m) return;
    m.emissiveIntensity += (targetGlow - m.emissiveIntensity) * delta * LERP;
    // Subtle pulse when active
    if (targetGlow > 0.1) {
      m.emissiveIntensity += Math.sin(Date.now() * 0.005) * 0.07;
    }
  });

  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 14, 10]} />
      <meshStandardMaterial
        ref={matRef}
        color={targetGlow > 0.1 ? "#FFDDAA" : "#FFCCC0"}
        emissive={color}
        emissiveIntensity={0}
        roughness={0.7}
      />
    </mesh>
  );
}

// ─── Tongue (single group, two sub-meshes for body + tip) ────────────────────

function Tongue({ config }: { config: ArticulationSceneConfig }) {
  const bodyRef = useRef<THREE.Group>(null!);
  const tipRef = useRef<THREE.Group>(null!);
  const bodyMatRef = useRef<THREE.MeshStandardMaterial>(null!);
  const tipMatRef = useRef<THREE.MeshStandardMaterial>(null!);

  const targetBodyY = config.tongueBodyRaise ? 0.0 : -0.48;
  const targetBodyZ = config.tongueBodyRaise ? -0.42 : -0.28;
  const targetTipY = config.tongueTipRaise ? -0.04 : -0.44;
  const targetTipZ = config.tongueTipRaise ? 0.20 : 0.02;
  const glowTip = config.tongueTipRaise || config.tongueBodyRaise ? 0.45 : 0;
  const glowBody = config.tongueBodyRaise ? 0.5 : 0;
  const highlightCol = config.tongueBodyRaise ? ORANGE : CORAL;

  useFrame((_, delta) => {
    const b = bodyRef.current;
    const t = tipRef.current;
    const bm = bodyMatRef.current;
    const tm = tipMatRef.current;
    if (!b || !t || !bm || !tm) return;

    b.position.y += (targetBodyY - b.position.y) * delta * LERP;
    b.position.z += (targetBodyZ - b.position.z) * delta * LERP;
    t.position.y += (targetTipY - t.position.y) * delta * LERP;
    t.position.z += (targetTipZ - t.position.z) * delta * LERP;

    bm.emissiveIntensity += (glowBody - bm.emissiveIntensity) * delta * LERP;
    tm.emissiveIntensity += (glowTip - tm.emissiveIntensity) * delta * LERP;
  });

  return (
    <>
      {/* Tongue body */}
      <group ref={bodyRef} position={[0, -0.48, -0.28]}>
        <mesh>
          <boxGeometry args={[0.88, 0.22, 0.55]} />
          <meshStandardMaterial
            ref={bodyMatRef}
            color="#F09090"
            emissive={highlightCol}
            emissiveIntensity={0}
            roughness={0.7}
          />
        </mesh>
      </group>
      {/* Tongue tip */}
      <group ref={tipRef} position={[0, -0.44, 0.02]}>
        <mesh scale={[0.72, 0.18, 0.3]}>
          <sphereGeometry args={[0.5, 12, 8]} />
          <meshStandardMaterial
            ref={tipMatRef}
            color="#E88080"
            emissive={AMBER}
            emissiveIntensity={0}
            roughness={0.6}
          />
        </mesh>
      </group>
    </>
  );
}

// ─── Full mouth scene ─────────────────────────────────────────────────────────

function MouthModel({ config }: { config: ArticulationSceneConfig }) {
  const groupRef = useRef<THREE.Group>(null!);

  // Gentle idle bob
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
    }
  });

  const {
    lipsClosing, lipsRounding, lowerLipRise,
    highlightBilabial, highlightLabiodental,
    highlightAlveolar, highlightVelar,
  } = config;

  // Upper lip target
  const upperLipY = lipsClosing ? 0.12 : lipsRounding ? 0.38 : 0.72;
  const lowerLipY = lipsClosing ? -0.12 : lipsRounding ? -0.38 : -0.72;
  const lipsScaleX = lipsRounding ? 0.52 : 1.0;
  const lowerLipActualY = lowerLipRise ? -0.18 : lowerLipY;

  const lipGlow = highlightBilabial || highlightLabiodental ? 0.55 : 0;
  const lowerLipGlow = highlightBilabial || highlightLabiodental ? 0.55 : 0;
  const upperTeethGlow = highlightLabiodental ? 0.5 : 0;

  const upperTeethGlowColor = ORANGE;
  const lowerLipRiseGlowColor = ORANGE;

  return (
    <group ref={groupRef}>
      {/* ── Oral cavity background ── */}
      <mesh>
        <sphereGeometry args={[1.75, 20, 16]} />
        <meshStandardMaterial color="#FFE5E5" side={THREE.BackSide} roughness={1} />
      </mesh>

      {/* ── Floor of mouth ── */}
      <mesh position={[0, -0.7, -0.3]}>
        <boxGeometry args={[1.5, 0.12, 0.9]} />
        <meshStandardMaterial color="#FFDDD5" roughness={0.9} />
      </mesh>

      {/* ── Palate / roof ── */}
      <mesh position={[0, 0.60, -0.32]}>
        <boxGeometry args={[1.45, 0.1, 0.82]} />
        <meshStandardMaterial color="#FFCFC8" roughness={0.85} />
      </mesh>

      {/* ── Alveolar ridge (behind upper teeth) ── */}
      <HighlightBump
        position={[0, 0.52, 0.18]}
        radius={0.14}
        color={AMBER}
        targetGlow={highlightAlveolar ? 0.7 : 0}
        label="alveolar"
      />

      {/* ── Velum / soft palate (back of roof) ── */}
      <HighlightBump
        position={[0, 0.50, -0.68]}
        radius={0.17}
        color={PURPLE}
        targetGlow={highlightVelar ? 0.7 : 0}
        label="velum"
      />

      {/* ── Upper teeth ── */}
      {UPPER_TEETH.map((pos, i) => (
        <group key={`ut${i}`} position={pos}>
          <mesh>
            <boxGeometry args={[0.14, 0.30, 0.11]} />
            <meshStandardMaterial
              color="#F8F4EF"
              emissive={upperTeethGlowColor}
              emissiveIntensity={upperTeethGlow}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}

      {/* ── Lower teeth ── */}
      {LOWER_TEETH.map((pos, i) => (
        <group key={`lt${i}`} position={pos}>
          <mesh>
            <boxGeometry args={[0.13, 0.25, 0.10]} />
            <meshStandardMaterial color="#F8F4EF" roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* ── Tongue ── */}
      <Tongue config={config} />

      {/* ── Upper gum ridge ── */}
      <mesh position={[0, 0.36, -0.06]}>
        <boxGeometry args={[1.3, 0.14, 0.26]} />
        <meshStandardMaterial color="#FFBFB8" roughness={0.9} />
      </mesh>

      {/* ── Lower gum ridge ── */}
      <mesh position={[0, -0.36, -0.06]}>
        <boxGeometry args={[1.3, 0.13, 0.25]} />
        <meshStandardMaterial color="#FFBFB8" roughness={0.9} />
      </mesh>

      {/* ── Upper lip ── */}
      <RoundMesh
        initialPos={[0, 0.72, 0.46]}
        w={1.82} h={0.36} d={0.26}
        color="#E07878"
        highlightColor={CORAL}
        targetPosY={upperLipY}
        targetScaleX={lipsScaleX}
        targetGlow={lipGlow}
      />

      {/* ── Lower lip ── */}
      <RoundMesh
        initialPos={[0, -0.72, 0.46]}
        w={1.82} h={0.40} d={0.28}
        color="#C86464"
        highlightColor={lowerLipRise ? lowerLipRiseGlowColor : CORAL}
        targetPosY={lowerLipActualY}
        targetScaleX={lipsScaleX}
        targetGlow={lowerLipGlow}
      />

      {/* ── Uvula (decorative, back center) ── */}
      <mesh position={[0, 0.25, -1.0]}>
        <sphereGeometry args={[0.09, 8, 6]} />
        <meshStandardMaterial color="#E08080" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ─── Canvas wrapper (exported) ────────────────────────────────────────────────

interface MouthSceneCanvasProps {
  config: ArticulationSceneConfig;
  height?: number;
}

export function MouthSceneCanvas({ config, height = 280 }: MouthSceneCanvasProps) {
  return (
    <div style={{ width: "100%", height }} className="rounded-3xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 0.5, 4.2], fov: 38 }}
        gl={{ antialias: true }}
        style={{ background: "linear-gradient(160deg, #FFF7F0 0%, #FFE8D6 100%)" }}
      >
        <ambientLight intensity={1.1} color="#FFF3E8" />
        <pointLight position={[2.5, 3, 4]} intensity={2.5} color="#FFFFFF" />
        <pointLight position={[-2, 1, 2]} intensity={0.8} color="#FFE0C0" />
        <pointLight position={[0, -2, 2]} intensity={0.6} color="#FFD0D0" />
        <MouthModel config={config} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
          minAzimuthAngle={-Math.PI / 3}
          maxAzimuthAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
}
