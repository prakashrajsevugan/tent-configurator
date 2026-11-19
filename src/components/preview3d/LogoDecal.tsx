import * as THREE from "three";

interface DecalPlaneProps {
  texture: THREE.CanvasTexture | null;
  position: [number, number, number];
  rotation?: [number, number, number];
  width: number;
  height: number;
}

export function DecalPlane({
  texture,
  position,
  rotation = [0, 0, 0],
  width,
  height,
}: DecalPlaneProps) {
  if (!texture) return null;

  return (
    <mesh position={position} rotation={rotation} renderOrder={10}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={1.0}
        depthWrite={false}
        depthTest={true}
        polygonOffset={true}
        polygonOffsetFactor={-6}
        polygonOffsetUnits={-6}
        side={THREE.FrontSide}
        toneMapped={false}
      />
    </mesh>
  );
}

export default DecalPlane;
