interface HeaderProps {
  configurationId: string;
  onReset: () => void;
  onGeneratePDF: () => void;
  onAddToCart: () => void;
  onViewShopifyPayload?: () => void;
  addingToCart: boolean;
  totalPrice?: number;
}

export default function Header({
  configurationId,
  onReset,
  onGeneratePDF,
  onAddToCart,
  onViewShopifyPayload,
  addingToCart,
  totalPrice,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-md">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white font-black text-sm tracking-tight shadow-xs">
            MVP
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-gray-900 sm:text-lg">
                Custom Canopy Tent Configurator
              </h1>
              <span className="hidden rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 sm:inline-block">
                MVP Visuals
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Full Dye Sublimation Print</span>
              <span>•</span>
              <span className="font-mono text-[11px] text-gray-600">
                {configurationId}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onViewShopifyPayload && (
            <button
              type="button"
              onClick={onViewShopifyPayload}
              className="hidden rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 md:inline-flex items-center gap-1.5"
              title="Inspect Shopify Payload"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Shopify Data
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={onGeneratePDF}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50"
          >
            <svg
              className="h-3.5 w-3.5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download PDF
          </button>

          <button
            type="button"
            onClick={onAddToCart}
            disabled={addingToCart}
            className="flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 transition"
          >
            {addingToCart ? (
              <span>Adding...</span>
            ) : (
              <>
                <span>Add to Cart</span>
                {totalPrice !== undefined && totalPrice > 0 && (
                  <span className="ml-1 rounded bg-white/20 px-1.5 py-0.2 text-[11px]">
                    ${totalPrice.toFixed(0)}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
