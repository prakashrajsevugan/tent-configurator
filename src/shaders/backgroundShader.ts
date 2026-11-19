import * as THREE from "three";
import type { GroundEnvironment } from "../types/configuration";

/**
 * GLSL Shaders for the WebGL 3D Ground & Environment.
 * Implements:
 * 1. Grassland (Outdoor Event Lawn / Festival park with procedural grass noise & sunny sky)
 * 2. Tech Park (Architectural Paved Plaza / Modern Silicon Valley Tech Campus Courtyard)
 * 3. Studio (Clean Minimalist Cyclorama)
 */

export const GroundVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

// ============================================================================
// GRASSLAND SHADER
// ============================================================================
export const GrasslandFragmentShader = /* glsl */ `
  uniform float u_time;
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 coord = vWorldPosition.xz;
    
    // Multi-octave procedural grass blade texture
    float n1 = noise(coord * 8.0);
    float n2 = noise(coord * 24.0);
    float n3 = noise(coord * 70.0);
    float grassNoise = n1 * 0.5 + n2 * 0.35 + n3 * 0.15;

    // Grass color palette
    vec3 deepGrass = vec3(0.14, 0.36, 0.15); // Rich deep turf
    vec3 midGrass  = vec3(0.24, 0.52, 0.22); // Vibrant event lawn
    vec3 sunLitTip = vec3(0.42, 0.68, 0.28); // Sunlit fresh blades
    vec3 earthSoil = vec3(0.22, 0.28, 0.12); // Subtle undertone

    vec3 grassColor = mix(deepGrass, midGrass, grassNoise);
    grassColor = mix(grassColor, sunLitTip, smoothstep(0.4, 0.8, n3));
    grassColor = mix(earthSoil, grassColor, smoothstep(0.1, 0.35, n1));

    // Radial distance fade to horizon
    float dist = length(coord);
    float edgeFade = smoothstep(14.0, 7.0, dist);

    // Tent soft contact shadow darkening
    float underTent = smoothstep(0.2, 1.8, length(coord));
    grassColor *= mix(0.55, 1.0, underTent);

    gl_FragColor = vec4(grassColor, edgeFade);
  }
`;

// ============================================================================
// TECH PARK PLAZA SHADER
// ============================================================================
export const TechParkFragmentShader = /* glsl */ `
  uniform float u_time;
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    vec2 pos = vWorldPosition.xz;
    
    // Scale for modern architectural pavers (approx 0.8m pavers)
    float tileSize = 1.25;
    vec2 tileCoord = pos * tileSize;
    vec2 tileIndex = floor(tileCoord);
    vec2 tileFract = fract(tileCoord);

    // Mortar joint line (dark clean groove)
    float mortarWidth = 0.035;
    float isMortar = 1.0 - (step(mortarWidth, tileFract.x) * step(mortarWidth, tileFract.y));

    // Per-tile slight color & tone variation
    float randTone = hash(tileIndex);
    
    // Modern architectural granite paver palette
    vec3 paverBase = vec3(0.68, 0.72, 0.75); // Light concrete/granite
    vec3 paverAlt  = vec3(0.58, 0.62, 0.66); // Cool tech slate
    vec3 paverColor = mix(paverBase, paverAlt, randTone * 0.6);

    // Fine aggregate noise on the concrete surface
    float grain = hash(pos * 40.0) * 0.06;
    paverColor += vec3(grain - 0.03);

    // Mortar groove color (dark charcoal)
    vec3 mortarColor = vec3(0.28, 0.32, 0.36);
    vec3 surfaceColor = mix(paverColor, mortarColor, isMortar);

    // Subtle sun reflection sheen
    vec3 sunSheen = vec3(0.08, 0.10, 0.12) * smoothstep(0.4, 0.9, 1.0 - isMortar);
    surfaceColor += sunSheen;

    // Contact shadow under tent
    float underTent = smoothstep(0.2, 1.8, length(pos));
    surfaceColor *= mix(0.55, 1.0, underTent);

    // Radial boundary fade
    float dist = length(pos);
    float edgeFade = smoothstep(14.0, 7.5, dist);

    gl_FragColor = vec4(surfaceColor, edgeFade);
  }
`;

// ============================================================================
// SKY DOME SHADERS
// ============================================================================
export const SkyVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const SkyFragmentShader = /* glsl */ `
  uniform vec3 u_sky_zenith;
  uniform vec3 u_sky_horizon;
  uniform vec3 u_sky_ground;
  varying vec3 vWorldPosition;

  void main() {
    vec3 dir = normalize(vWorldPosition);
    float height = dir.y;

    vec3 skyColor;
    if (height > 0.0) {
      skyColor = mix(u_sky_horizon, u_sky_zenith, pow(height, 0.55));
    } else {
      skyColor = mix(u_sky_horizon, u_sky_ground, pow(-height, 0.6));
    }

    gl_FragColor = vec4(skyColor, 1.0);
  }
`;

export interface EnvironmentPreset {
  name: string;
  icon: string;
  skyZenith: string;
  skyHorizon: string;
  skyGround: string;
  lightIntensity: number;
  lightColor: string;
  ambientIntensity: number;
}

export const environmentPresets: Record<GroundEnvironment, EnvironmentPreset> = {
  grassland: {
    name: "Grassland Park",
    icon: "🌿",
    skyZenith: "#38bdf8", // Sunny blue sky
    skyHorizon: "#dbeafe", // Soft horizon haze
    skyGround: "#1b4332",  // Grass ground glow
    lightIntensity: 1.4,
    lightColor: "#fffbeb", // Warm sunlight
    ambientIntensity: 0.6,
  },
  techpark: {
    name: "Tech Park Plaza",
    icon: "🏢",
    skyZenith: "#475569", // Modern architectural slate
    skyHorizon: "#cbd5e1", // Polished glass horizon
    skyGround: "#334155",  // Slate paver ground
    lightIntensity: 1.25,
    lightColor: "#f8fafc", // Clean cool daylight
    ambientIntensity: 0.55,
  },
  studio: {
    name: "Clean Studio",
    icon: "💡",
    skyZenith: "#e2e8f0",
    skyHorizon: "#f8fafc",
    skyGround: "#cbd5e1",
    lightIntensity: 1.2,
    lightColor: "#ffffff",
    ambientIntensity: 0.55,
  },
};

export function createGroundShaderMaterial(env: GroundEnvironment) {
  const isGrass = env === "grassland";
  return new THREE.ShaderMaterial({
    vertexShader: GroundVertexShader,
    fragmentShader: isGrass ? GrasslandFragmentShader : TechParkFragmentShader,
    uniforms: {
      u_time: { value: 0 },
    },
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  });
}

export function createSkyShaderMaterial(preset: EnvironmentPreset) {
  return new THREE.ShaderMaterial({
    vertexShader: SkyVertexShader,
    fragmentShader: SkyFragmentShader,
    uniforms: {
      u_sky_zenith: { value: new THREE.Color(preset.skyZenith) },
      u_sky_horizon: { value: new THREE.Color(preset.skyHorizon) },
      u_sky_ground: { value: new THREE.Color(preset.skyGround) },
    },
    side: THREE.BackSide,
    depthWrite: false,
  });
}
