import type { ProductConfiguration } from "../types/configuration";
import type { PricingResponse } from "../types/pricing";

export type { PricingResponse };

const API_URL = import.meta.env.VITE_API_URL || "";

export function calculateLocalPrice(
  configuration: ProductConfiguration,
): PricingResponse {
  const sizePrices: Record<string, number> = {
    "tent-8x8": 799,
    "tent-6-5x6-5": 699,
    "tent-5x5": 599,
  };

  const framePrices: Record<string, number> = {
    standard: 0,
    "deluxe-heavy": 150,
    steel: 80,
    "canopy-only": -100,
  };

  const wallPrices: Record<string, number> = {
    none: 0,
    "one-single": 90,
    "one-double": 140,
    "three-single": 240,
    "three-double": 360,
  };

  const halfWallPrices: Record<string, number> = {
    none: 0,
    "two-single": 130,
    "two-double": 190,
  };

  const accessoryPrices: Record<string, number> = {
    sandbags: 45,
    "roller-bag": 75,
    "stakes-ropes": 25,
    "led-lights": 60,
  };

  const turnaroundPrices: Record<string, number> = {
    "standard-5day": 0,
    "rush-2day": 99,
  };

  const basePrice =
    sizePrices[configuration.product?.sizeId] ?? 799;

  const frame =
    framePrices[configuration.product?.frameId] ?? 0;

  const walls =
    wallPrices[configuration.options?.walls] ?? 0;

  const halfWalls =
    halfWallPrices[configuration.options?.halfWalls] ?? 0;

  let accessories = 0;
  if (Array.isArray(configuration.options?.accessories)) {
    for (const accId of configuration.options.accessories) {
      accessories += accessoryPrices[accId] ?? 0;
    }
  }

  const turnaround =
    turnaroundPrices[configuration.options?.turnaround] ?? 0;

  let logo = 0;
  let text = 0;

  const sections = configuration.sections ?? {};
  for (const section of Object.values(sections)) {
    if (section.logo) {
      logo += 25;
    }
    if (Array.isArray(section.texts)) {
      text += section.texts.length * 10;
    }
  }

  const total =
    basePrice +
    frame +
    walls +
    halfWalls +
    accessories +
    turnaround +
    logo +
    text;

  return {
    currency: "USD",
    basePrice,
    options: {
      frame,
      walls,
      halfWalls,
      accessories,
      turnaround,
    },
    customization: {
      logo,
      text,
    },
    total,
  };
}

export async function calculatePrice(
  configuration: ProductConfiguration,
): Promise<PricingResponse> {
  try {
    const url = API_URL ? `${API_URL}/api/pricing` : "/api/pricing";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(configuration),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Graceful fallback to local computation
  }

  return calculateLocalPrice(configuration);
}
