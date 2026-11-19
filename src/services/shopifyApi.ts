import type {
  ProductConfiguration,
} from "../types/configuration";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export async function addToShopifyCart(
  configuration: ProductConfiguration,
  price: number
) {
  const url = API_URL ? `${API_URL}/api/shopify/cart` : "/api/shopify/cart";
  const response = await fetch(
    url,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        variantId:
          configuration.product.sizeId,

        quantity: 1,

        price,

        properties: {
          configurationId:
            configuration.configurationId,

          configuration: JSON.stringify(
            configuration
          ),
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Shopify cart request failed"
    );
  }

  return response.json();
}