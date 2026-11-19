import type { ProductConfiguration } from "../../types/configuration";
import type { PricingResponse } from "../../types/pricing";

interface ShopifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProductConfiguration;
  pricing: PricingResponse | null;
  onConfirmAddToCart: () => void;
  isSubmitting: boolean;
}

export default function ShopifyModal({
  isOpen,
  onClose,
  config,
  pricing,
  onConfirmAddToCart,
  isSubmitting,
}: ShopifyModalProps) {
  if (!isOpen) return null;

  const totalPrice = pricing?.total ?? 899;

  // Format line item properties payload for Shopify Cart API (/cart/add.js)
  const shopifyPayload = {
    items: [
      {
        id: config.product.sizeId,
        quantity: 1,
        price: totalPrice * 100, // Shopify represents amounts in cents
        properties: {
          _configuration_id: config.configurationId,
          "Tent Size": config.product.sizeId.toUpperCase(),
          "Frame Hardware": config.product.frameId.replace("-", " ").toUpperCase(),
          "Wall Configuration": config.options.walls.replace("-", " "),
          "Half Walls": config.options.halfWalls.replace("-", " "),
          "Canopy Color": config.appearance.canopyColor,
          "Wall Color": config.appearance.wallColor,
          "Turnaround Time":
            config.options.turnaround === "rush-2day"
              ? "Rush 2-Day Production"
              : "Standard 5-Day",
          Accessories:
            config.options.accessories?.length > 0
              ? config.options.accessories.join(", ")
              : "None",
          "Custom Logo Elements": Object.values(config.sections).filter(
            (s) => s.logo,
          ).length,
          "Custom Text Elements": Object.values(config.sections).reduce(
            (acc, s) => acc + s.texts.length,
            0,
          ),
          _production_pdf_spec: `https://cdn.shopify.com/orders/specs/${config.configurationId}.pdf`,
        },
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white font-bold text-xs">
              🛍️
            </span>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Shopify Integration Payload Inspector
              </h3>
              <p className="text-xs text-gray-500">
                Data payload formatted for Shopify Storefront & Cart API (/cart/add.js)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Payload Preview */}
        <div className="my-4 max-h-[380px] overflow-auto rounded-xl bg-gray-950 p-4 font-mono text-xs text-emerald-400">
          <pre>{JSON.stringify(shopifyPayload, null, 2)}</pre>
        </div>

        {/* Integration Architecture Summary */}
        <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
          <span className="font-semibold text-gray-900">How it connects in production:</span>
          <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px]">
            <li>Customer selections determine real-time variant & line-item attributes.</li>
            <li>Properties starting with an underscore (e.g. <code>_configuration_id</code>) are saved to the Shopify order line item and passed to the warehouse fulfillment system.</li>
            <li>Production summary PDF is automatically attached to the Shopify Order confirmation.</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Total Price:{" "}
            <span className="text-base font-bold text-gray-900">
              ${totalPrice.toFixed(2)} USD
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirmAddToCart}
              disabled={isSubmitting}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Send to Shopify Mock Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
