import { create } from "zustand";
import type {
  DesignSection,
  GroundEnvironment,
  LogoConfiguration,
  ProductConfiguration,
  TextConfiguration,
} from "../types/configuration";

const createInitialConfiguration = (): ProductConfiguration => ({
  configurationId: `CONF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,

  product: {
    id: "custom-canopy-tent",
    sizeId: "tent-8x8",
    frameId: "standard",
  },

  options: {
    walls: "none",
    halfWalls: "none",
    accessories: [],
    turnaround: "standard-5day",
  },

  appearance: {
    canopyColor: "#ffffff",
    wallColor: "#ffffff",
    theme: "grassland", // Default to Grassland as requested
  },

  activeSection: "canopy",

  sections: {
    canopy: {
      logo: undefined,
      texts: [],
    },
    frontWall: {
      logo: undefined,
      texts: [],
    },
    leftWall: {
      logo: undefined,
      texts: [],
    },
    rightWall: {
      logo: undefined,
      texts: [],
    },
  },
});

interface ConfiguratorStore {
  config: ProductConfiguration;

  setSize: (sizeId: string) => void;
  setFrame: (frameId: string) => void;
  setWalls: (walls: string) => void;
  setHalfWalls: (halfWalls: string) => void;
  toggleAccessory: (accessoryId: string) => void;
  setTurnaround: (turnaroundId: string) => void;
  setCanopyColor: (color: string) => void;
  setWallColor: (color: string) => void;
  setTheme: (theme: GroundEnvironment) => void;
  setActiveSection: (section: DesignSection) => void;

  setLogo: (logo: LogoConfiguration) => void;
  removeLogo: () => void;
  addText: (text: TextConfiguration) => void;
  updateText: (id: string, updates: Partial<TextConfiguration>) => void;
  removeText: (id: string) => void;
  clearActiveSection: () => void;

  setFullConfiguration: (config: ProductConfiguration) => void;
  reset: () => void;
}

export const useConfiguratorStore = create<ConfiguratorStore>((set) => ({
  config: createInitialConfiguration(),

  setSize: (sizeId) =>
    set((state) => ({
      config: {
        ...state.config,
        product: {
          ...state.config.product,
          sizeId,
        },
      },
    })),

  setFrame: (frameId) =>
    set((state) => ({
      config: {
        ...state.config,
        product: {
          ...state.config.product,
          frameId,
        },
      },
    })),

  setWalls: (walls) =>
    set((state) => ({
      config: {
        ...state.config,
        options: {
          ...state.config.options,
          walls,
        },
      },
    })),

  setHalfWalls: (halfWalls) =>
    set((state) => ({
      config: {
        ...state.config,
        options: {
          ...state.config.options,
          halfWalls,
        },
      },
    })),

  toggleAccessory: (accessoryId) =>
    set((state) => {
      const current = state.config.options.accessories || [];
      const exists = current.includes(accessoryId);
      const updated = exists
        ? current.filter((id) => id !== accessoryId)
        : [...current, accessoryId];

      return {
        config: {
          ...state.config,
          options: {
            ...state.config.options,
            accessories: updated,
          },
        },
      };
    }),

  setTurnaround: (turnaround) =>
    set((state) => ({
      config: {
        ...state.config,
        options: {
          ...state.config.options,
          turnaround,
        },
      },
    })),

  setCanopyColor: (color) =>
    set((state) => ({
      config: {
        ...state.config,
        appearance: {
          ...state.config.appearance,
          canopyColor: color,
        },
      },
    })),

  setWallColor: (color) =>
    set((state) => ({
      config: {
        ...state.config,
        appearance: {
          ...state.config.appearance,
          wallColor: color,
        },
      },
    })),

  setTheme: (theme) =>
    set((state) => ({
      config: {
        ...state.config,
        appearance: {
          ...state.config.appearance,
          theme,
        },
      },
    })),

  setActiveSection: (section) =>
    set((state) => ({
      config: {
        ...state.config,
        activeSection: section,
      },
    })),

  setLogo: (logo) =>
    set((state) => {
      const section = state.config.activeSection;
      return {
        config: {
          ...state.config,
          sections: {
            ...state.config.sections,
            [section]: {
              ...state.config.sections[section],
              logo,
            },
          },
        },
      };
    }),

  removeLogo: () =>
    set((state) => {
      const section = state.config.activeSection;
      return {
        config: {
          ...state.config,
          sections: {
            ...state.config.sections,
            [section]: {
              ...state.config.sections[section],
              logo: undefined,
            },
          },
        },
      };
    }),

  addText: (text) =>
    set((state) => {
      const section = state.config.activeSection;
      return {
        config: {
          ...state.config,
          sections: {
            ...state.config.sections,
            [section]: {
              ...state.config.sections[section],
              texts: [...state.config.sections[section].texts, text],
            },
          },
        },
      };
    }),

  updateText: (id, updates) =>
    set((state) => {
      const section = state.config.activeSection;
      return {
        config: {
          ...state.config,
          sections: {
            ...state.config.sections,
            [section]: {
              ...state.config.sections[section],
              texts: state.config.sections[section].texts.map((text) =>
                text.id === id ? { ...text, ...updates } : text,
              ),
            },
          },
        },
      };
    }),

  removeText: (id) =>
    set((state) => {
      const section = state.config.activeSection;
      return {
        config: {
          ...state.config,
          sections: {
            ...state.config.sections,
            [section]: {
              ...state.config.sections[section],
              texts: state.config.sections[section].texts.filter(
                (text) => text.id !== id,
              ),
            },
          },
        },
      };
    }),

  clearActiveSection: () =>
    set((state) => {
      const section = state.config.activeSection;
      return {
        config: {
          ...state.config,
          sections: {
            ...state.config.sections,
            [section]: {
              logo: undefined,
              texts: [],
            },
          },
        },
      };
    }),

  setFullConfiguration: (config) =>
    set({
      config,
    }),

  reset: () =>
    set({
      config: createInitialConfiguration(),
    }),
}));
