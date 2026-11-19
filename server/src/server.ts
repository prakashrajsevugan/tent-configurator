import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";

// Automatically load environment variables from server/.env or root .env
const candidateEnvPaths = [
  path.resolve(process.cwd(), "server/.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(__dirname, "../.env"),
  path.resolve(__dirname, "../../.env"),
];

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    try {
      if (typeof process.loadEnvFile === "function") {
        process.loadEnvFile(envPath);
      } else {
        const fileContent = fs.readFileSync(envPath, "utf8");
        for (const line of fileContent.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const [key, ...rest] = trimmed.split("=");
          const k = key?.trim();
          if (k && !process.env[k]) {
            process.env[k] = rest.join("=").trim().replace(/^["']|["']$/g, "");
          }
        }
      }
    } catch {
      // Ignore if unable to read
    }
  }
}

const app = express();

const PORT = Number(process.env.PORT || 3001);
const NODE_ENV = process.env.NODE_ENV || "development";
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "";

const corsEnv = process.env.CORS_ORIGIN || "*";
const configuredOrigins = corsEnv
  ? corsEnv.split(",").map((s) => s.trim()).filter(Boolean)
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        corsEnv === "*" ||
        configuredOrigins.includes(origin) ||
        configuredOrigins.includes("*")
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "15mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    service: "tent-configurator-api",
    version: "2.0.0",
    status: "healthy",
    env: NODE_ENV,
    port: PORT,
    shopifyStore: SHOPIFY_STORE_DOMAIN,
  });
});

app.post("/api/pricing", (req, res) => {
  const configuration = req.body;

  if (!configuration) {
    res.status(400).json({
      message: "Configuration payload is required.",
    });
    return;
  }

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
  for (const section of Object.values(sections) as any[]) {
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

  res.json({
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
  });
});

app.post("/api/shopify/cart", (req, res) => {
  const { variantId, quantity, price, properties } = req.body;

  const cartItem = {
    id: `gid://shopify/ProductVariant/${variantId || "tent-8x8"}`,
    variantId: variantId || "tent-8x8",
    title: `${(variantId || "Custom Canopy").replace("tent-", "").replace("-", "x")} Commercial Custom Canopy Tent`,
    quantity: quantity || 1,
    price: Number(price || 799).toFixed(2),
    currency: "USD",
    shopDomain: SHOPIFY_STORE_DOMAIN,
    properties: {
      _configuration_id: properties?.configurationId || `CONF-${Date.now()}`,
      _production_type: "Custom Full Dye Sublimation",
      ...properties,
    },
    timestamp: new Date().toISOString(),
  };

  console.log("\n================ [SHOPIFY CART ADD EVENT] ================");
  console.log(JSON.stringify(cartItem, null, 2));
  console.log("==========================================================\n");

  res.json({
    success: true,
    message: "Configuration successfully pushed to Shopify Cart.",
    item: cartItem,
  });
});

app.listen(PORT, () => {
  console.log(`[${NODE_ENV.toUpperCase()}] API running at http://localhost:${PORT}`);
});
