export type DesignSection =
  | "canopy"
  | "frontWall"
  | "leftWall"
  | "rightWall";

export type GroundEnvironment = "grassland" | "techpark" | "studio";

export interface LogoConfiguration {
  id: string;
  src: string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale?: number;
  aspectRatio?: number;
}

export interface TextConfiguration {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily?: string;
  color: string;
  rotation: number;
  isBold?: boolean;
}

export interface SectionDesign {
  logo?: LogoConfiguration;
  texts: TextConfiguration[];
}

export interface ProductConfiguration {
  configurationId: string;

  product: {
    id: string;
    sizeId: string;
    frameId: string;
  };

  options: {
    walls: string;
    halfWalls: string;
    accessories: string[];
    turnaround: string;
  };

  appearance: {
    canopyColor: string;
    wallColor: string;
    theme: GroundEnvironment;
  };

  activeSection: DesignSection;

  sections: Record<DesignSection, SectionDesign>;
}
