import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Header from "./Header";
import Sidebar from "./Sidebar";
import PreviewPanel from "./PreviewPanel";
import PriceSummary from "./PriceSummary";
import DesignEditor from "../editor2d/DesignEditor";
import ShopifyModal from "./ShopifyModal";
import { useConfiguratorStore } from "../../store/configuratorStore";
import { generateConfigurationPDF } from "../../services/pdfService";
import { addToShopifyCart } from "../../services/shopifyApi";
import type { PricingResponse } from "../../services/pricingApi";

export default function Configurator() {
  const config = useConfiguratorStore((state) => state.config);
  const reset = useConfiguratorStore((state) => state.reset);
  const setFullConfiguration = useConfiguratorStore(
    (state) => state.setFullConfiguration,
  );

  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showShopifyModal, setShowShopifyModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // GSAP layout animation refs
  const headerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const centerViewportRef = useRef<HTMLElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

  // GSAP Page Load Staggered Entrance
  useEffect(() => {
    const tl = gsap.timeline();

    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: "power2.out" },
      );
    }

    if (sidebarRef.current) {
      tl.fromTo(
        sidebarRef.current,
        { x: -35, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.35",
      );
    }

    if (centerViewportRef.current) {
      tl.fromTo(
        centerViewportRef.current,
        { scale: 0.96, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.65, ease: "power2.out" },
        "-=0.45",
      );
    }

    if (summaryRef.current) {
      tl.fromTo(
        summaryRef.current,
        { x: 35, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.45",
      );
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (addingToCart) return;

    setAddingToCart(true);

    try {
      const totalPrice = pricing?.total ?? 799;
      const result = await addToShopifyCart(config, totalPrice);

      if (window.parent !== window) {
        window.parent.postMessage(
          {
            type: "CONFIGURATION_COMPLETED",
            payload: {
              configuration: config,
              price: totalPrice,
              result,
            },
          },
          "*",
        );
      }

      setShowShopifyModal(false);
      showToast("✓ Added to Shopify Cart with custom print specifications!");
    } catch (error) {
      console.error("Add to cart failed:", error);
      alert("Unable to add configuration to cart.");
    } finally {
      setAddingToCart(false);
    }
  }, [addingToCart, config, pricing, showToast]);

  const handleAddToCartRef = useRef(handleAddToCart);
  useEffect(() => {
    handleAddToCartRef.current = handleAddToCart;
  }, [handleAddToCart]);

  // Notify parent window for iframe integration
  useEffect(() => {
    if (window.parent !== window) {
      window.parent.postMessage(
        {
          type: "CONFIGURATION_UPDATED",
          payload: {
            configuration: config,
            pricing,
          },
        },
        "*",
      );
    }
  }, [config, pricing]);

  // Handle incoming postMessages from parent embedding website
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      switch (event.data.type) {
        case "GET_CONFIGURATION":
          window.parent.postMessage(
            {
              type: "CONFIGURATION_RESPONSE",
              payload: { configuration: config, pricing },
            },
            "*",
          );
          break;
        case "SET_CONFIGURATION":
          if (event.data.payload) {
            setFullConfiguration(event.data.payload);
          }
          break;
        case "RESET_CONFIGURATION":
          reset();
          break;
        case "TRIGGER_ADD_TO_CART":
          handleAddToCartRef.current();
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [config, pricing, reset, setFullConfiguration]);

  const handlePDF = async () => {
    try {
      await generateConfigurationPDF(config, pricing);
      showToast("✓ Production Summary PDF Downloaded!");
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Unable to generate PDF.");
    }
  };

  const totalCustomElements = Object.values(config.sections).reduce(
    (acc, s) => acc + (s.logo ? 1 : 0) + s.texts.length,
    0,
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-100/70 text-gray-900 font-sans antialiased">
      {/* Header bar */}
      {!window.location.search.includes("hideHeader=true") && (
        <div ref={headerRef}>
          <Header
            configurationId={config.configurationId}
            onReset={reset}
            onGeneratePDF={handlePDF}
            onAddToCart={() => setShowShopifyModal(true)}
            onViewShopifyPayload={() => setShowShopifyModal(true)}
            addingToCart={addingToCart}
            totalPrice={pricing?.total}
          />
        </div>
      )}

      {/* Main Configurator Studio Workspace */}
      <main className="grid flex-1 grid-cols-1 gap-4 p-3.5 lg:grid-cols-[330px_minmax(0,1fr)_310px] max-w-[1720px] mx-auto w-full">
        {/* Left Options Rail */}
        <aside ref={sidebarRef} className="min-w-0">
          <Sidebar />
        </aside>

        {/* Center 3D / 2D Canvas Viewport */}
        <section ref={centerViewportRef} className="min-w-0 flex flex-col space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-gray-200/90 bg-white px-4 py-2.5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  {showEditor ? "2D Print Template Editor" : "3D Interactive Studio Preview"}
                </h2>
                <p className="text-[11px] text-gray-500">
                  {showEditor
                    ? "Drag & scale logos, customize text, inspect print safe area"
                    : "Real-time WebGL studio lighting, fabric recoloring & live decals"}
                </p>
              </div>
            </div>

            {/* View Mode Segmented Controls */}
            <div className="flex rounded-lg border border-gray-200 bg-gray-100 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 transition ${
                  !showEditor
                    ? "bg-white text-gray-950 shadow-xs"
                    : "text-gray-600 hover:text-gray-950"
                }`}
              >
                <span>3D View</span>
              </button>

              <button
                type="button"
                onClick={() => setShowEditor(true)}
                className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 transition ${
                  showEditor
                    ? "bg-white text-gray-950 shadow-xs"
                    : "text-gray-600 hover:text-gray-950"
                }`}
              >
                <span>2D Artwork</span>
                {totalCustomElements > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] font-bold text-white">
                    {totalCustomElements}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Viewport Container */}
          <div className="flex-1 min-h-[620px]">
            {showEditor ? <DesignEditor /> : <PreviewPanel />}
          </div>
        </section>

        {/* Right Financial & Order Summary Rail */}
        <aside ref={summaryRef} className="min-w-0 space-y-3">
          <PriceSummary onPriceChange={setPricing} />

          {/* MVP Visuals Guarantee Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs text-xs text-gray-600 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <span className="text-base">🛡️</span>
              <span>MVP Visuals Quality Guarantee</span>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-500">
              Every canopy is crafted with industrial-grade 600D UV50+ polyester and high-definition dye sublimation printing that will never crack, peel, or fade.
            </p>
            <div className="border-t pt-2 text-[10px] text-gray-400 space-y-1">
              <div>✓ Lifetime Hardware Warranty on Aluminum Frames</div>
              <div>✓ Complimentary Free Digital Proofing</div>
              <div>✓ 2-Day Rush Production Available</div>
            </div>
          </div>
        </aside>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xl">
          {toastMessage}
        </div>
      )}

      {/* Shopify Cart Line Item Payload Modal */}
      <ShopifyModal
        isOpen={showShopifyModal}
        onClose={() => setShowShopifyModal(false)}
        config={config}
        pricing={pricing}
        onConfirmAddToCart={handleAddToCart}
        isSubmitting={addingToCart}
      />
    </div>
  );
}
