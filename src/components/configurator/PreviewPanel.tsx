import TentScene from "../preview3d/TentScene";
import { getProductById } from "../../config/products";
import { useConfiguratorStore } from "../../store/configuratorStore";

export default function PreviewPanel() {
  const config = useConfiguratorStore((state) => state.config);
  const setTheme = useConfiguratorStore((state) => state.setTheme);

  const product = getProductById(config.product.sizeId);

  if (!product) {
    return (
      <div className="flex h-[620px] w-full items-center justify-center rounded-xl border bg-gray-100">
        <div className="text-center">
          <h2 className="font-semibold text-gray-900">Product not found</h2>
          <p className="mt-1 text-sm text-gray-500">
            Selected product: {config.product.sizeId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[620px] w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      <TentScene
        modelPath={product.modelPath}
        canopyColor={config.appearance.canopyColor}
        wallColor={config.appearance.wallColor}
        frameId={config.product.frameId}
        walls={config.options.walls}
        halfWalls={config.options.halfWalls}
        theme={config.appearance.theme}
        onThemeChange={setTheme}
        sections={config.sections}
      />

      {/* Floating Active Specs Badge */}
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-lg border border-gray-200/90 bg-white/95 px-3 py-1.5 text-xs text-gray-700 shadow-sm backdrop-blur-sm">
        <span className="font-bold text-gray-900">{product.size}</span>
        <span className="text-gray-300">•</span>
        <span className="capitalize">
          {config.product.frameId.replace("-", " ")}
        </span>
        {config.options.walls !== "none" && (
          <>
            <span className="text-gray-300">•</span>
            <span>Walls: {config.options.walls}</span>
          </>
        )}
      </div>
    </div>
  );
}
