import type { ProductDefinition } from "../types/product";

export type { ProductDefinition };

export const products: ProductDefinition[] = [
  {
    id: "tent-8x8",
    name: "8 × 8 ft Custom Event Canopy",
    size: "8 × 8 ft",
    width: 8,
    depth: 8,
    modelPath: "/models/Tent_8_8.glb",
    basePrice: 799,
  },
  {
    id: "tent-6-5x6-5",
    name: "6.5 × 6.5 ft Trade Show Canopy",
    size: "6.5 × 6.5 ft",
    width: 6.5,
    depth: 6.5,
    modelPath: "/models/Tent 6.5_6.5.glb",
    basePrice: 699,
  },
  {
    id: "tent-5x5",
    name: "5 × 5 ft Compact Kiosk Canopy",
    size: "5 × 5 ft",
    width: 5,
    depth: 5,
    modelPath: "/models/Tent_5_5.glb",
    basePrice: 599,
  },
];

export function getProductById(
  productId: string,
): ProductDefinition | undefined {
  return products.find((product) => product.id === productId);
}
