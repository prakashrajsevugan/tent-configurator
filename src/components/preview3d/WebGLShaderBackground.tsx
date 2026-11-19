import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { GroundEnvironment } from "../../types/configuration";
import {
  createGroundShaderMaterial,
  createSkyShaderMaterial,
  environmentPresets,
} from "../../shaders/backgroundShader";

interface WebGLShaderBackgroundProps {
  themeId?: GroundEnvironment;
}

export default function WebGLShaderBackground({
  themeId = "grassland",
}: WebGLShaderBackgroundProps) {
  const groundMaterialRef = useRef<THREE.ShaderMaterial>(null);

  const preset = environmentPresets[themeId] || environmentPresets.grassland;

  const groundMaterial = useMemo(() => {
    return createGroundShaderMaterial(themeId);
  }, [themeId]);

  const skyMaterial = useMemo(() => {
    return createSkyShaderMaterial(preset);
  }, [preset]);

  // Animate procedural ground shader time uniform
  useFrame(({ clock }) => {
    if (groundMaterialRef.current?.uniforms?.u_time) {
      groundMaterialRef.current.uniforms.u_time.value = clock.getElapsedTime();
    }
  });

  return (
    <group>
      {/* 
        Surrounding Sky Dome using Custom WebGL GLSL Shader
      */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[28, 48, 32]} />
        <primitive object={skyMaterial} attach="material" />
      </mesh>

      {/* 
        Procedural Ground Plane Shader (Grassland Turf or Tech Park Paved Plaza)
      */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[28, 28, 64, 64]} />
        <primitive
          ref={groundMaterialRef}
          object={groundMaterial}
          attach="material"
        />
      </mesh>

      {/* 
        Soft ambient ground shadow directly under the tent footprint
      */}
      <mesh
        position={[0, 0.003, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[6.5, 6.5]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={themeId === "grassland" ? 0.38 : 0.3}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-1}
        >
          <canvasTexture
            attach="alphaMap"
            image={createRadialShadowCanvas()}
          />
        </meshBasicMaterial>
      </mesh>
    </group>
  );
}

function createRadialShadowCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
  grad.addColorStop(0, "rgba(0, 0, 0, 1.0)");
  grad.addColorStop(0.35, "rgba(0, 0, 0, 0.65)");
  grad.addColorStop(0.7, "rgba(0, 0, 0, 0.2)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return canvas;
}
