import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useConfiguratorStore } from "../../store/configuratorStore";
import { products } from "../../config/products";
import {
  canopyColors,
  wallColors,
  frameOptions,
  wallOptions,
  halfWallOptions,
  accessoryOptions,
  turnaroundOptions,
} from "../../config/options";
import type { DesignSection } from "../../types/configuration";

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState<"product" | "colors" | "addons">(
    "product",
  );
  const tabContentRef = useRef<HTMLDivElement>(null);

  const config = useConfiguratorStore((state) => state.config);

  const setSize = useConfiguratorStore((state) => state.setSize);
  const setFrame = useConfiguratorStore((state) => state.setFrame);
  const setWalls = useConfiguratorStore((state) => state.setWalls);
  const setHalfWalls = useConfiguratorStore((state) => state.setHalfWalls);
  const toggleAccessory = useConfiguratorStore((state) => state.toggleAccessory);
  const setTurnaround = useConfiguratorStore((state) => state.setTurnaround);
  const setCanopyColor = useConfiguratorStore((state) => state.setCanopyColor);
  const setWallColor = useConfiguratorStore((state) => state.setWallColor);
  const setActiveSection = useConfiguratorStore(
    (state) => state.setActiveSection,
  );

  // GSAP Tab Switch Fade/Slide Animation
  useEffect(() => {
    if (tabContentRef.current) {
      gsap.fromTo(
        tabContentRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
      );
    }
  }, [activeTab]);

  const sections: { id: DesignSection; label: string }[] = [
    { id: "canopy", label: "Canopy Roof" },
    { id: "frontWall", label: "Front Valance/Wall" },
    { id: "leftWall", label: "Left Wall" },
    { id: "rightWall", label: "Right Wall" },
  ];

  return (
    <div className="space-y-2.5">
      {/* Tab Navigation */}
      <div className="grid grid-cols-3 rounded-xl border bg-white p-1 text-xs font-semibold shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("product")}
          className={`rounded-lg py-1.5 transition ${
            activeTab === "product"
              ? "bg-black text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          1. Structure
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("colors")}
          className={`rounded-lg py-1.5 transition ${
            activeTab === "colors"
              ? "bg-black text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          2. Colors
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("addons")}
          className={`rounded-lg py-1.5 transition ${
            activeTab === "addons"
              ? "bg-black text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          3. Add-ons
        </button>
      </div>

      <div ref={tabContentRef}>
        {/* ======================================================== */}
        {/* TAB 1: PRODUCT STRUCTURE (COMPACT & USER-FRIENDLY)       */}
        {/* ======================================================== */}
        {activeTab === "product" && (
          <div className="space-y-2.5">
            {/* Tent Size: Compact 3-column pill grid */}
            <section className="rounded-xl border bg-white p-3 shadow-xs">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Canopy Size
                </h2>
                <span className="text-[11px] font-semibold text-gray-500">
                  {products.find((p) => p.id === config.product.sizeId)?.size}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {products.map((product) => {
                  const selected = config.product.sizeId === product.id;

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setSize(product.id)}
                      className={`rounded-lg border p-2 text-center transition ${
                        selected
                          ? "border-black bg-black text-white shadow-xs"
                          : "border-gray-200 hover:border-gray-400 bg-white"
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">
                        {product.size}
                      </div>
                      <div
                        className={`mt-0.5 text-[11px] font-semibold ${
                          selected ? "text-gray-200" : "text-gray-900"
                        }`}
                      >
                        ${product.basePrice}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Frame Package: Compact 2x2 grid */}
            <section className="rounded-xl border bg-white p-3 shadow-xs">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Frame Hardware
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {frameOptions.map((option) => {
                  const selected = config.product.frameId === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFrame(option.id)}
                      className={`flex flex-col justify-between rounded-lg border p-2 text-left transition ${
                        selected
                          ? "border-black bg-gray-50 ring-1 ring-black"
                          : "border-gray-200 hover:border-gray-400 bg-white"
                      }`}
                    >
                      <span className="text-xs font-bold text-gray-900 leading-tight">
                        {option.name}
                      </span>
                      <span className="mt-1 text-[11px] font-semibold text-gray-600">
                        {option.price > 0
                          ? `+$${option.price}`
                          : option.price < 0
                            ? `-$${Math.abs(option.price)}`
                            : "Included"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Full Walls: Compact 2-column / multi-pill grid */}
            <section className="rounded-xl border bg-white p-3 shadow-xs">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Full Walls
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {wallOptions.map((option) => {
                  const selected = config.options.walls === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setWalls(option.id)}
                      className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-left text-xs transition ${
                        selected
                          ? "border-black bg-gray-50 font-semibold ring-1 ring-black"
                          : "border-gray-200 hover:border-gray-400 bg-white text-gray-700"
                      }`}
                    >
                      <span className="truncate pr-1">{option.name}</span>
                      <span className="shrink-0 font-bold text-[11px]">
                        {option.price > 0 ? `+$${option.price}` : "Free"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Half Walls: Compact 3-column pill grid */}
            <section className="rounded-xl border bg-white p-3 shadow-xs">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Half Walls (With Support Bars)
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {halfWallOptions.map((option) => {
                  const selected = config.options.halfWalls === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setHalfWalls(option.id)}
                      className={`rounded-lg border p-1.5 text-center text-xs transition ${
                        selected
                          ? "border-black bg-gray-50 font-semibold ring-1 ring-black"
                          : "border-gray-200 hover:border-gray-400 bg-white text-gray-700"
                      }`}
                    >
                      <div className="truncate font-medium text-[11px]">
                        {option.name.replace("2 Side Half Walls + Support Bars", "2 Half Walls")}
                      </div>
                      <div className="mt-0.5 font-bold text-[11px]">
                        {option.price > 0 ? `+$${option.price}` : "Free"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: COLORS & SECTIONS                                 */}
        {/* ======================================================== */}
        {activeTab === "colors" && (
          <div className="space-y-3">
            {/* Active Design Section */}
            <section className="rounded-xl border bg-white p-3 shadow-xs">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Customizing Section
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {sections.map((section) => {
                  const selected = config.activeSection === section.id;
                  const hasCustomDesign =
                    config.sections[section.id]?.logo ||
                    config.sections[section.id]?.texts.length > 0;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={`relative rounded-lg border p-2 text-left text-xs font-medium transition ${
                        selected
                          ? "border-black bg-black text-white shadow-xs"
                          : "border-gray-200 hover:border-gray-400 bg-white text-gray-800"
                      }`}
                    >
                      <div>{section.label}</div>
                      {hasCustomDesign && (
                        <span className="mt-0.5 inline-block rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] text-emerald-400">
                          Customized
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Canopy Color */}
            <section className="rounded-xl border bg-white p-3 shadow-xs">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Canopy Color
                </h2>
                <span className="text-[11px] font-mono text-gray-500">
                  {config.appearance.canopyColor}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {canopyColors.map((color) => {
                  const selected =
                    config.appearance.canopyColor.toLowerCase() ===
                    color.value.toLowerCase();

                  return (
                    <button
                      key={color.id}
                      type="button"
                      title={color.name}
                      aria-label={color.name}
                      onClick={() => setCanopyColor(color.value)}
                      className={`h-8 w-8 rounded-full border-2 transition ${
                        selected
                          ? "scale-110 border-black ring-2 ring-gray-400 shadow-sm"
                          : "border-gray-300 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.value }}
                    />
                  );
                })}
              </div>
            </section>

            {/* Wall Color */}
            <section className="rounded-xl border bg-white p-3 shadow-xs">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Wall Color
                </h2>
                <span className="text-[11px] font-mono text-gray-500">
                  {config.appearance.wallColor}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {wallColors.map((color) => {
                  const selected =
                    config.appearance.wallColor.toLowerCase() ===
                    color.value.toLowerCase();

                  return (
                    <button
                      key={color.id}
                      type="button"
                      title={color.name}
                      aria-label={color.name}
                      onClick={() => setWallColor(color.value)}
                      className={`h-8 w-8 rounded-full border-2 transition ${
                        selected
                          ? "scale-110 border-black ring-2 ring-gray-400 shadow-sm"
                          : "border-gray-300 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.value }}
                    />
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ADD-ONS & PRODUCTION                              */}
        {/* ======================================================== */}
        {activeTab === "addons" && (
          <div className="space-y-3">
            {/* Turnaround Speed */}
            <section className="rounded-xl border bg-white p-3 shadow-xs">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-700">
                Turnaround Speed
              </h2>
              <div className="space-y-1.5">
                {turnaroundOptions.map((opt) => {
                  const selected = config.options.turnaround === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTurnaround(opt.id)}
                      className={`flex w-full items-center justify-between rounded-lg border p-2 text-left text-xs transition ${
                        selected
                          ? "border-black bg-gray-50 ring-1 ring-black"
                          : "border-gray-200 hover:border-gray-400 bg-white"
                      }`}
                    >
                      <div>
                        <span className="font-semibold text-gray-900">
                          {opt.name}
                        </span>
                        {opt.badge && (
                          <span className="ml-1.5 rounded bg-emerald-100 px-1 py-0.2 text-[9px] font-bold text-emerald-800">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-[11px]">
                        {opt.price > 0 ? `+$${opt.price}` : "Free"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Accessories */}
            <section className="rounded-xl border bg-white p-3 shadow-xs">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-700">
                Accessories
              </h2>
              <div className="space-y-1.5">
                {accessoryOptions.map((acc) => {
                  const selected = config.options.accessories?.includes(acc.id);

                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => toggleAccessory(acc.id)}
                      className={`flex w-full items-center justify-between rounded-lg border p-2 text-left text-xs transition ${
                        selected
                          ? "border-black bg-gray-50 ring-1 ring-black"
                          : "border-gray-200 hover:border-gray-400 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={selected}
                          readOnly
                          className="h-3.5 w-3.5 rounded text-black"
                        />
                        <span className="font-medium text-gray-900">
                          {acc.name}
                        </span>
                      </div>
                      <span className="font-bold text-[11px]">+${acc.price}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
