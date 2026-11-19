import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import type { DesignSection, SectionDesign } from "../../types/configuration";
import { DecalPlane } from "./LogoDecal";
import { useSectionTexture } from "./useSectionTexture";

interface TentModelProps {
  modelPath: string;
  canopyColor: string;
  wallColor: string;
  frameId?: string;
  walls?: string;
  halfWalls?: string;
  sections?: Record<DesignSection, SectionDesign>;
}

interface Coordinates {
  halfWidth: number;
  valanceCenterY: number;
  valanceZ: number;
  valanceWidth: number;
  valanceHeight: number;
  slopeCenterY: number;
  slopeCenterZ: number;
  slopeRotX: number;
  slopeWidth: number;
  slopeHeight: number;
  wallHeight: number;
  wallWidth: number;
}

const MODEL_SPECS: Record<string, Coordinates> = {
  "Tent_8_8.glb": {
    halfWidth: 1.206,
    valanceCenterY: 1.384,
    valanceZ: 1.222,
    valanceWidth: 2.38,
    valanceHeight: 0.33,
    slopeCenterY: 2.056,
    slopeCenterZ: 0.635,
    slopeRotX: -0.849,
    slopeWidth: 1.20,
    slopeHeight: 0.82,
    wallHeight: 1.20,
    wallWidth: 2.38,
  },
  "Tent 6.5_6.5.glb": {
    halfWidth: 0.755,
    valanceCenterY: 1.043,
    valanceZ: 0.771,
    valanceWidth: 1.50,
    valanceHeight: 0.33,
    slopeCenterY: 1.625,
    slopeCenterZ: 0.406,
    slopeRotX: -0.723,
    slopeWidth: 0.85,
    slopeHeight: 0.65,
    wallHeight: 0.88,
    wallWidth: 1.50,
  },
  "Tent_5_5.glb": {
    halfWidth: 0.755,
    valanceCenterY: 1.116,
    valanceZ: 0.767,
    valanceWidth: 1.50,
    valanceHeight: 0.34,
    slopeCenterY: 1.666,
    slopeCenterZ: 0.406,
    slopeRotX: -0.764,
    slopeWidth: 0.85,
    slopeHeight: 0.65,
    wallHeight: 0.94,
    wallWidth: 1.50,
  },
};

export default function TentModel({
  modelPath,
  canopyColor,
  wallColor,
  frameId = "standard",
  walls = "none",
  halfWalls = "none",
  sections,
}: TentModelProps) {
  const { scene } = useGLTF(modelPath);

  const groupRef = useRef<THREE.Group>(null);
  const canopyMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const wallMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const backWallRef = useRef<THREE.Mesh>(null);
  const leftWallRef = useRef<THREE.Group>(null);
  const rightWallRef = useRef<THREE.Group>(null);
  const halfWallsRef = useRef<THREE.Group>(null);
  const frameMeshesRef = useRef<THREE.Mesh[]>([]);

  // Find exact measurements for active model
  const filename = modelPath.split("/").pop() || "Tent_8_8.glb";
  const coords = MODEL_SPECS[filename] || MODEL_SPECS["Tent_8_8.glb"];

  // Reactive textures with matched aspect ratios for zero distortion
  const canopyTexture = useSectionTexture(
    sections?.canopy,
    coords.slopeWidth / coords.slopeHeight,
  );
  const frontValanceTexture = useSectionTexture(
    sections?.frontWall,
    coords.valanceWidth / coords.valanceHeight,
  );
  const leftWallTexture = useSectionTexture(
    sections?.leftWall,
    coords.wallWidth / coords.wallHeight,
  );
  const rightWallTexture = useSectionTexture(
    sections?.rightWall,
    coords.wallWidth / coords.wallHeight,
  );

  const memoizedData = useMemo(() => {
    const cloned = scene.clone(true);
    const materialsList: THREE.MeshStandardMaterial[] = [];
    const frameList: THREE.Mesh[] = [];

    const isCanopyOnly = frameId === "canopy-only";
    const isLightFrame = frameId === "light-frame";

    cloned.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      const objectName = object.name.toLowerCase();
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      const isFrame =
        objectName.includes("leg") ||
        objectName.includes("mechanism") ||
        materials.some((m) => m.name.toLowerCase().includes("metal"));

      if (isFrame) {
        frameList.push(object);
        if (isCanopyOnly) {
          object.visible = false;
        } else {
          object.visible = true;
        }
      }

      object.castShadow = true;
      object.receiveShadow = true;

      const updatedMaterials = materials.map((originalMaterial) => {
        if (!(originalMaterial instanceof THREE.MeshStandardMaterial)) {
          return originalMaterial;
        }

        const material = originalMaterial.clone();
        const matName = material.name.toLowerCase();
        const combined = `${objectName} ${matName}`;

        if (
          combined.includes("canopy") ||
          combined.includes("fabric") ||
          combined.includes("roof")
        ) {
          material.map = null;
          material.color.set(canopyColor);
          material.roughness = 0.65;
          material.metalness = 0.04;
          material.side = THREE.DoubleSide;
          materialsList.push(material);
        } else if (isFrame) {
          material.roughness = isLightFrame ? 0.22 : 0.35;
          material.metalness = isLightFrame ? 0.92 : 0.82;
          if (isLightFrame) {
            material.color.set("#f1f5f9");
          }
        }

        material.needsUpdate = true;
        return material;
      });

      object.material =
        updatedMaterials.length === 1
          ? updatedMaterials[0]
          : updatedMaterials;
    });

    return {
      model: cloned,
      materialsList,
      frameList,
    };
  }, [scene, frameId, canopyColor]);

  const { model, materialsList, frameList } = memoizedData;

  useEffect(() => {
    canopyMaterialsRef.current = materialsList;
    frameMeshesRef.current = frameList;
  }, [materialsList, frameList]);

  // GSAP 3D Animations
  useEffect(() => {
    if (!groupRef.current) return;

    gsap.fromTo(
      groupRef.current.scale,
      { x: 0.78, y: 0.78, z: 0.78 },
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.75,
        ease: "back.out(1.5)",
      },
    );

    gsap.fromTo(
      groupRef.current.position,
      { y: 0.25 },
      {
        y: 0,
        duration: 0.65,
        ease: "power2.out",
      },
    );

    gsap.fromTo(
      groupRef.current.rotation,
      { y: groupRef.current.rotation.y + 0.35 },
      {
        y: groupRef.current.rotation.y,
        duration: 0.8,
        ease: "power3.out",
      },
    );
  }, [modelPath]);

  useEffect(() => {
    const target = new THREE.Color(canopyColor);
    canopyMaterialsRef.current.forEach((mat) => {
      gsap.to(mat.color, {
        r: target.r,
        g: target.g,
        b: target.b,
        duration: 0.45,
        ease: "power2.out",
      });
    });
  }, [canopyColor]);

  useEffect(() => {
    if (!wallMaterialRef.current) return;
    const target = new THREE.Color(wallColor);
    gsap.to(wallMaterialRef.current.color, {
      r: target.r,
      g: target.g,
      b: target.b,
      duration: 0.45,
      ease: "power2.out",
    });
  }, [wallColor]);

  useEffect(() => {
    if (backWallRef.current) {
      gsap.fromTo(
        backWallRef.current.scale,
        { y: 0.05 },
        { y: 1, duration: 0.5, ease: "power2.out" },
      );
    }
  }, [walls]);

  useEffect(() => {
    if (leftWallRef.current) {
      gsap.fromTo(
        leftWallRef.current.scale,
        { y: 0.05 },
        { y: 1, duration: 0.5, ease: "power2.out", delay: 0.05 },
      );
    }
    if (rightWallRef.current) {
      gsap.fromTo(
        rightWallRef.current.scale,
        { y: 0.05 },
        { y: 1, duration: 0.5, ease: "power2.out", delay: 0.1 },
      );
    }
  }, [walls]);

  useEffect(() => {
    if (halfWallsRef.current) {
      gsap.fromTo(
        halfWallsRef.current.scale,
        { y: 0.05 },
        { y: 1, duration: 0.5, ease: "power2.out" },
      );
    }
  }, [halfWalls]);

  useEffect(() => {
    const isCanopyOnly = frameId === "canopy-only";
    frameMeshesRef.current.forEach((mesh) => {
      if (isCanopyOnly) {
        gsap.to(mesh.scale, {
          y: 0.05,
          duration: 0.35,
          ease: "power2.in",
          onComplete: () => {
            mesh.visible = false;
          },
        });
      } else {
        mesh.visible = true;
        gsap.to(mesh.scale, {
          y: 1,
          duration: 0.45,
          ease: "back.out(1.4)",
        });
      }
    });
  }, [frameId]);

  const showBackWall =
    walls === "one-single" ||
    walls === "three-single" ||
    walls === "one-double" ||
    walls === "three-double";

  const showSideWalls =
    walls === "three-single" || walls === "three-double";

  const showHalfWalls =
    halfWalls === "two-single" || halfWalls === "two-double";

  const wallThickness = 0.01;
  const halfWallHeight = coords.wallHeight * 0.45;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 3D GLTF Tent Model */}
      <primitive object={model} />

      {/* 
        1. 3D CANOPY ROOF DECAL (Front Sloping Face)
        Positioned proud of the fabric surface along its normal vector.
      */}
      {canopyTexture && (
        <DecalPlane
          texture={canopyTexture}
          position={[0, coords.slopeCenterY, coords.slopeCenterZ]}
          rotation={[coords.slopeRotX, 0, 0]}
          width={coords.slopeWidth}
          height={coords.slopeHeight}
        />
      )}

      {/* 
        2. 3D FRONT VALANCE DECAL (Vertical Front Flap)
        Most common branding location on commercial tents. Always visible.
      */}
      {frontValanceTexture && (
        <DecalPlane
          texture={frontValanceTexture}
          position={[0, coords.valanceCenterY, coords.valanceZ]}
          rotation={[0, 0, 0]}
          width={coords.valanceWidth}
          height={coords.valanceHeight}
        />
      )}

      {/* ======================================================== */}
      {/* BACK WALL */}
      {/* ======================================================== */}
      {showBackWall && (
        <mesh
          ref={backWallRef}
          position={[0, coords.wallHeight / 2, -coords.halfWidth + 0.005]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[coords.wallWidth, coords.wallHeight, wallThickness]}
          />
          <meshStandardMaterial
            ref={wallMaterialRef}
            color={wallColor}
            roughness={0.7}
            metalness={0.04}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* ======================================================== */}
      {/* LEFT WALL */}
      {/* ======================================================== */}
      {showSideWalls && (
        <group
          ref={leftWallRef}
          position={[-coords.halfWidth + 0.005, coords.wallHeight / 2, 0]}
        >
          <mesh
            rotation={[0, Math.PI / 2, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry
              args={[coords.wallWidth, coords.wallHeight, wallThickness]}
            />
            <meshStandardMaterial
              color={wallColor}
              roughness={0.7}
              metalness={0.04}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Left Wall Logo Decal */}
          {leftWallTexture && (
            <DecalPlane
              texture={leftWallTexture}
              position={[-0.012, 0, 0]}
              rotation={[0, -Math.PI / 2, 0]}
              width={coords.wallWidth * 0.9}
              height={coords.wallHeight * 0.85}
            />
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* RIGHT WALL */}
      {/* ======================================================== */}
      {showSideWalls && (
        <group
          ref={rightWallRef}
          position={[coords.halfWidth - 0.005, coords.wallHeight / 2, 0]}
        >
          <mesh
            rotation={[0, Math.PI / 2, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry
              args={[coords.wallWidth, coords.wallHeight, wallThickness]}
            />
            <meshStandardMaterial
              color={wallColor}
              roughness={0.7}
              metalness={0.04}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Right Wall Logo Decal */}
          {rightWallTexture && (
            <DecalPlane
              texture={rightWallTexture}
              position={[0.012, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
              width={coords.wallWidth * 0.9}
              height={coords.wallHeight * 0.85}
            />
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* HALF WALLS (Left & Right) */}
      {/* ======================================================== */}
      {showHalfWalls && !showSideWalls && (
        <group ref={halfWallsRef}>
          {/* Left Half Wall */}
          <group position={[-coords.halfWidth + 0.005, halfWallHeight / 2, 0]}>
            <mesh
              rotation={[0, Math.PI / 2, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry
                args={[coords.wallWidth, halfWallHeight, wallThickness]}
              />
              <meshStandardMaterial
                color={wallColor}
                roughness={0.7}
                metalness={0.04}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh
              position={[0, halfWallHeight / 2, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry
                args={[0.012, 0.012, coords.wallWidth, 12]}
              />
              <meshStandardMaterial
                color="#cbd5e1"
                metalness={0.85}
                roughness={0.3}
              />
            </mesh>
          </group>

          {/* Right Half Wall */}
          <group position={[coords.halfWidth - 0.005, halfWallHeight / 2, 0]}>
            <mesh
              rotation={[0, Math.PI / 2, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry
                args={[coords.wallWidth, halfWallHeight, wallThickness]}
              />
              <meshStandardMaterial
                color={wallColor}
                roughness={0.7}
                metalness={0.04}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh
              position={[0, halfWallHeight / 2, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry
                args={[0.012, 0.012, coords.wallWidth, 12]}
              />
              <meshStandardMaterial
                color="#cbd5e1"
                metalness={0.85}
                roughness={0.3}
              />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}
