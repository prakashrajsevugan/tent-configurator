import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  calculatePrice,
  type PricingResponse,
} from "../../services/pricingApi";
import { useConfiguratorStore } from "../../store/configuratorStore";

interface PriceSummaryProps {
  onPriceChange?: (price: PricingResponse | null) => void;
}

export default function PriceSummary({ onPriceChange }: PriceSummaryProps) {
  const configuration = useConfiguratorStore((state) => state.config);

  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // GSAP animated price counter
  const [displayTotal, setDisplayTotal] = useState(799);
  const totalNumberRef = useRef({ val: 799 });
  const totalElementRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrice() {
      setLoading(true);
      setError(null);

      try {
        const result = await calculatePrice(configuration);

        if (!cancelled) {
          setPricing(result);
          onPriceChange?.(result);

          // Animate number counting with GSAP
          gsap.to(totalNumberRef.current, {
            val: result.total,
            duration: 0.65,
            ease: "power2.out",
            onUpdate: () => {
              setDisplayTotal(Math.round(totalNumberRef.current.val));
            },
          });

          // Subtle number scale pulse
          if (totalElementRef.current) {
            gsap.fromTo(
              totalElementRef.current,
              { scale: 1.08, color: "#16a34a" },
              { scale: 1, color: "#030712", duration: 0.5, ease: "power2.out" },
            );
          }
        }
      } catch {
        if (!cancelled) {
          setError("Unable to calculate price.");
          setPricing(null);
          onPriceChange?.(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPrice();

    return () => {
      cancelled = true;
    };
  }, [configuration, onPriceChange]);

  return (
    <div
      ref={containerRef}
      className="rounded-xl border bg-white p-4 shadow-xs transition-shadow hover:shadow-sm"
    >
      <div className="mb-4">
        <h2 className="text-base font-bold text-gray-900">Your Estimate</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Real-time pricing determined by selected options & print artwork.
        </p>
      </div>

      <div className="space-y-2.5 text-xs">
        <PriceRow label="Base Canopy" value={pricing?.basePrice} />

        <PriceRow label="Frame Package" value={pricing?.options?.frame} />

        {configuration.options.walls !== "none" && (
          <PriceRow label="Side Walls" value={pricing?.options?.walls} />
        )}

        {configuration.options.halfWalls !== "none" && (
          <PriceRow label="Half Walls" value={pricing?.options?.halfWalls} />
        )}

        {pricing?.options?.accessories && pricing.options.accessories > 0 ? (
          <PriceRow
            label={`Accessories (${configuration.options.accessories?.length || 0})`}
            value={pricing.options.accessories}
          />
        ) : null}

        {pricing?.options?.turnaround && pricing.options.turnaround > 0 ? (
          <PriceRow
            label="Rush 2-Day Production"
            value={pricing.options.turnaround}
          />
        ) : null}

        {pricing?.customization?.logo ? (
          <PriceRow
            label="Custom Logo Sublimation"
            value={pricing.customization.logo}
          />
        ) : null}

        {pricing?.customization?.text ? (
          <PriceRow
            label="Custom Text Elements"
            value={pricing.customization.text}
          />
        ) : null}
      </div>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 border-t pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-800">Total Price</span>
          <span
            ref={totalElementRef}
            className="text-2xl font-black text-gray-950 transition-colors"
          >
            {loading && !pricing ? "..." : `$${displayTotal.toFixed(2)}`}
          </span>
        </div>

        <div className="mt-2 rounded bg-gray-50 p-2 text-[11px] text-gray-500">
          ✓ Free Ground Shipping in 48 Contiguous States
          <br />✓ Dye Sublimation Color Match Proof Included
        </div>
      </div>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value?: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">
        {value === undefined
          ? "..."
          : value === 0
            ? "Included"
            : value < 0
              ? `-$${Math.abs(value)}`
              : `+$${value}`}
      </span>
    </div>
  );
}
