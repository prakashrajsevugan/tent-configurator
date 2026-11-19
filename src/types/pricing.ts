export interface PricingResponse {
  currency: string;
  basePrice: number;
  options: {
    frame: number;
    walls: number;
    halfWalls: number;
    accessories: number;
    turnaround: number;
  };
  customization: {
    logo: number;
    text: number;
  };
  total: number;
}
