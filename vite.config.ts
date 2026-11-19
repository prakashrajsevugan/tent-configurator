import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function mockApiPlugin(): Plugin {
  return {
    name: "mock-api-middleware",
    configureServer(server) {
      server.middlewares.use("/api/health", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: true,
            service: "tent-configurator-api",
            version: "2.0.0",
            status: "healthy",
          }),
        );
      });

      server.middlewares.use("/api/pricing", (req, res, next) => {
        if (req.method !== "POST") return next();

        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });

        req.on("end", () => {
          try {
            const config = JSON.parse(body);

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
              sizePrices[config.product?.sizeId] ?? 799;
            const frame =
              framePrices[config.product?.frameId] ?? 0;
            const walls =
              wallPrices[config.options?.walls] ?? 0;
            const halfWalls =
              halfWallPrices[config.options?.halfWalls] ?? 0;

            let accessories = 0;
            if (Array.isArray(config.options?.accessories)) {
              for (const acc of config.options.accessories) {
                accessories += accessoryPrices[acc] ?? 0;
              }
            }

            const turnaround =
              turnaroundPrices[config.options?.turnaround] ?? 0;

            let logo = 0;
            let text = 0;
            const sections = config.sections ?? {};
            for (const section of Object.values(sections) as any[]) {
              if (section.logo) logo += 25;
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

            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
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
              }),
            );
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Invalid configuration JSON" }));
          }
        });
      });

      server.middlewares.use("/api/shopify/cart", (req, res, next) => {
        if (req.method !== "POST") return next();

        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });

        req.on("end", () => {
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              cartToken: `mock-cart-${Date.now()}`,
              message: "Custom canopy successfully staged for Shopify cart.",
            }),
          );
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    mockApiPlugin(),
  ],
  server: {
    port: 5174,
  },
});
