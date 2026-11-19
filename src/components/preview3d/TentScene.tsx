import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import gsap from "gsap";
import type {
  DesignSection,
  GroundEnvironment,
  SectionDesign,
} from "../../types/configuration";
import TentModel from "./TentModel";
import WebGLShaderBackground from "./WebGLShaderBackground";
import { environmentPresets } from "../../shaders/backgroundShader";

interface TentSceneProps {
  modelPath: string;
  canopyColor: string;
  wallColor: string;
  frameId?: string;
  walls?: string;
  halfWalls?: string;
  theme?: GroundEnvironment;
  onThemeChange?: (theme: GroundEnvironment) => void;
  sections?: Record<DesignSection, SectionDesign>;
}

export default function TentScene({
  modelPath,
  canopyColor,
  wallColor,
  frameId = "standard",
  walls = "none",
  halfWalls = "none",
  theme = "grassland",
  onThemeChange,
  sections,
}: TentSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [autoRotate, setAutoRotate] = useState(false);

  const envPreset =
    environmentPresets[theme] || environmentPresets.grassland;

  // Smooth cinematic camera flight transitions with GSAP
  const setCameraPreset = (x: number, y: number, z: number) => {
    if (!controlsRef.current) return;
    const cam = controlsRef.current.object;

    gsap.to(cam.position, {
      x,
      y,
      z,
      duration: 1.0,
      ease: "power2.inOut",
      onUpdate: () => {
        controlsRef.current?.update();
      },
    });

    gsap.to(controlsRef.current.target, {
      x: 0,
      y: 1.05,
      z: 0,
      duration: 0.8,
      ease: "power2.inOut",
    });
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      {/* 3D WebGL Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: [3.4, 2.3, 4.0],
          fov: 38,
          near: 0.1,
          far: 60,
        }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {/* Procedural WebGL Ground & Sky Shaders (Grassland / Tech Park) */}
        <WebGLShaderBackground themeId={theme} />

        {/* Dynamic HDRI reflections matching environment */}
        <Environment
          preset={theme === "grassland" ? "park" : "city"}
          environmentIntensity={0.65}
        />

        {/* Ambient lighting tuned to environment */}
        <ambientLight intensity={envPreset.ambientIntensity} />

        {/* Sun direct light with soft shadows */}
        <directionalLight
          position={[6, 9, 6]}
          intensity={envPreset.lightIntensity}
          color={envPreset.lightColor}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0001}
        />

        <directionalLight
          position={[-6, 4, -4]}
          intensity={0.4}
        />

        <directionalLight
          position={[0, 5, -6]}
          intensity={0.3}
        />

        {/* 3D Tent with dynamic colors, frame options, walls & decals */}
        <TentModel
          modelPath={modelPath}
          canopyColor={canopyColor}
          wallColor={wallColor}
          frameId={frameId}
          walls={walls}
          halfWalls={halfWalls}
          sections={sections}
        />

        {/* Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.08}
          enablePan={false}
          minDistance={1.8}
          maxDistance={12}
          maxPolarAngle={Math.PI / 2 - 0.04}
          target={[0, 1.05, 0]}
          autoRotate={autoRotate}
          autoRotateSpeed={1.5}
        />
      </Canvas>

      {/* Floating Ground / Environment Preset Selector */}
      <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-gray-200/90 bg-white/95 p-1 shadow-sm backdrop-blur-sm">
        <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Ground:
        </span>
        {(
          [
            { id: "grassland", label: "🌿 Grass Land" },
            { id: "techpark", label: "🏢 Tech Park" },
            { id: "studio", label: "💡 Studio" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onThemeChange?.(t.id)}
            className={`pointer-events-auto rounded px-2.5 py-1 text-xs font-semibold transition ${
              theme === t.id
                ? "bg-black text-white shadow-xs"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Floating View Controls & Angle Presets */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2">
        <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-gray-200/80 bg-white/90 p-1 shadow-sm backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setCameraPreset(0, 1.15, 4.4)}
            className="rounded px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100 active:bg-gray-200"
            title="Front View"
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset(3.4, 2.3, 4.0)}
            className="rounded px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100 active:bg-gray-200"
            title="3/4 Perspective"
          >
            3/4
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset(4.4, 1.15, 0)}
            className="rounded px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100 active:bg-gray-200"
            title="Side View"
          >
            Side
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset(0, 5.0, 0.05)}
            className="rounded px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100 active:bg-gray-200"
            title="Top View"
          >
            Top
          </button>
        </div>

        <button
          type="button"
          onClick={() => setAutoRotate((prev) => !prev)}
          className={`pointer-events-auto flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm transition ${
            autoRotate
              ? "border-black bg-black text-white"
              : "border-gray-200/80 bg-white/90 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <span>{autoRotate ? "⏹ Stop Rotation" : "▶ Auto Rotate"}</span>
        </button>
      </div>
    </div>
  );
}
