export interface ConfigOption {
  id: string;
  name: string;
  price: number;
  description?: string;
  badge?: string;
}

export interface ColorOption {
  id: string;
  name: string;
  value: string;
}

export const frameOptions: ConfigOption[] = [
  {
    id: "standard",
    name: "Commercial Aluminum Frame",
    price: 0,
    description: "40mm hex legs, push-button sliders, lifetime warranty",
    badge: "Recommended",
  },
  {
    id: "deluxe-heavy",
    name: "Deluxe 50mm Hex Frame",
    price: 150,
    description: "Heavy-duty 2\" anodized aluminum, extreme wind rated",
    badge: "Heavy Duty",
  },
  {
    id: "steel",
    name: "Commercial Steel Frame",
    price: 80,
    description: "White powder-coated steel with reinforced truss bars",
  },
  {
    id: "canopy-only",
    name: "Canopy Top Only (No Frame)",
    price: -100,
    description: "Fits any standard commercial 10x10 popup tent frame",
  },
];

export const wallOptions: ConfigOption[] = [
  {
    id: "none",
    name: "No Walls (Open Canopy)",
    price: 0,
  },
  {
    id: "one-single",
    name: "1 Back Wall (Single-Sided Print)",
    price: 90,
  },
  {
    id: "one-double",
    name: "1 Back Wall (Double-Sided Print)",
    price: 140,
  },
  {
    id: "three-single",
    name: "3 Full Walls (Single-Sided Print)",
    price: 240,
    badge: "Popular",
  },
  {
    id: "three-double",
    name: "3 Full Walls (Double-Sided Print)",
    price: 360,
  },
];

export const halfWallOptions: ConfigOption[] = [
  {
    id: "none",
    name: "No Half Walls",
    price: 0,
  },
  {
    id: "two-single",
    name: "2 Side Half Walls + Support Bars (Single)",
    price: 130,
  },
  {
    id: "two-double",
    name: "2 Side Half Walls + Support Bars (Double)",
    price: 190,
  },
];

export const accessoryOptions: ConfigOption[] = [
  {
    id: "sandbags",
    name: "Heavy-Duty Sand Bags (Set of 4)",
    price: 45,
    description: "Holds up to 120 lbs total ballast for outdoor stability",
  },
  {
    id: "roller-bag",
    name: "Commercial Wheeled Roller Bag",
    price: 75,
    description: "Reinforced 1680D polyester with heavy-duty all-terrain wheels",
  },
  {
    id: "stakes-ropes",
    name: "Heavy-Duty Ground Stakes & Tie-Downs",
    price: 25,
    description: "Set of 4 steel spiral stakes and high-strength ratchets",
  },
  {
    id: "led-lights",
    name: "LED Canopy Light Strip Kit",
    price: 60,
    description: "Ultra-bright rechargeable clip-on LED bar for evening events",
  },
];

export const turnaroundOptions: ConfigOption[] = [
  {
    id: "standard-5day",
    name: "Standard Production (5 Days)",
    price: 0,
    description: "Guaranteed shipping in 5 business days after proof approval",
  },
  {
    id: "rush-2day",
    name: "Rush 2-Day Production",
    price: 99,
    description: "Priority expedited dye sublimation printing & dispatch",
    badge: "2-Day Rush",
  },
];

export const canopyColors: ColorOption[] = [
  { id: "white", name: "Pure White", value: "#ffffff" },
  { id: "black", name: "Jet Black", value: "#111827" },
  { id: "red", name: "Crimson Red", value: "#dc2626" },
  { id: "royal-blue", name: "Royal Blue", value: "#2563eb" },
  { id: "navy", name: "Navy Blue", value: "#1e3a8a" },
  { id: "forest-green", name: "Forest Green", value: "#15803d" },
  { id: "gold-yellow", name: "Golden Yellow", value: "#f59e0b" },
  { id: "orange", name: "Safety Orange", value: "#f97316" },
  { id: "purple", name: "Imperial Purple", value: "#7e22ce" },
  { id: "silver", name: "Silver Gray", value: "#94a3b8" },
];

export const wallColors: ColorOption[] = [
  { id: "white", name: "Pure White", value: "#ffffff" },
  { id: "black", name: "Jet Black", value: "#111827" },
  { id: "red", name: "Crimson Red", value: "#dc2626" },
  { id: "royal-blue", name: "Royal Blue", value: "#2563eb" },
  { id: "navy", name: "Navy Blue", value: "#1e3a8a" },
  { id: "forest-green", name: "Forest Green", value: "#15803d" },
  { id: "gold-yellow", name: "Golden Yellow", value: "#f59e0b" },
  { id: "orange", name: "Safety Orange", value: "#f97316" },
  { id: "purple", name: "Imperial Purple", value: "#7e22ce" },
  { id: "silver", name: "Silver Gray", value: "#94a3b8" },
];
