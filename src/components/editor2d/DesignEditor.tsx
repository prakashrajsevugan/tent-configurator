import { useRef, useState, type ChangeEvent, type PointerEvent } from "react";
import { useConfiguratorStore } from "../../store/configuratorStore";
import type { DesignSection } from "../../types/configuration";

const encodeSvg = (svg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const SAMPLE_LOGOS = [
  {
    name: "Summit Outdoors",
    aspectRatio: 280 / 90,
    src: encodeSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="90" viewBox="0 0 280 90">
        <rect width="100%" height="100%" fill="none"/>
        <path d="M35 70 L75 18 L115 70 Z" fill="#2563eb"/>
        <path d="M85 70 L115 28 L145 70 Z" fill="#10b981"/>
        <text x="155" y="55" font-family="Inter, -apple-system, sans-serif" font-weight="900" font-size="28" fill="#111827">SUMMIT</text>
      </svg>`,
    ),
  },
  {
    name: "Alpha Tech",
    aspectRatio: 280 / 90,
    src: encodeSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="90" viewBox="0 0 280 90">
        <rect width="100%" height="100%" fill="none"/>
        <rect x="25" y="25" width="44" height="44" rx="10" fill="#dc2626"/>
        <polygon points="47,30 63,63 31,63" fill="#ffffff"/>
        <text x="82" y="55" font-family="Inter, -apple-system, sans-serif" font-weight="900" font-size="30" fill="#111827">ALPHA</text>
      </svg>`,
    ),
  },
  {
    name: "Pure Energy",
    aspectRatio: 280 / 90,
    src: encodeSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="90" viewBox="0 0 280 90">
        <rect width="100%" height="100%" fill="none"/>
        <circle cx="45" cy="45" r="26" fill="#f59e0b"/>
        <path d="M45 25 L51 43 L37 43 L49 65 L44 47 L58 47 Z" fill="#ffffff"/>
        <text x="85" y="55" font-family="Inter, -apple-system, sans-serif" font-weight="900" font-size="28" fill="#111827">ENERGY</text>
      </svg>`,
    ),
  },
];

function calculateLogoDimensions(
  scalePercent: number,
  imgAspect: number,
  sectionAspect: number,
): { width: number; height: number } {
  const safeImgAspect = Math.max(0.1, Math.min(10, imgAspect || 1.5));
  const safeSectionAspect = Math.max(0.1, Math.min(10, sectionAspect || 1.5));
  const aspectFactor = safeImgAspect / safeSectionAspect;

  let maxW = 90;
  let maxH = 90;

  if (aspectFactor >= 1) {
    // Image is wider than section -> width reaches 90% first
    maxW = 90;
    maxH = 90 / aspectFactor;
  } else {
    // Image is taller than section -> height reaches 90% first
    maxH = 90;
    maxW = 90 * aspectFactor;
  }

  const s = Math.max(10, Math.min(100, scalePercent)) / 100;
  return {
    width: Number((maxW * s).toFixed(1)),
    height: Number((maxH * s).toFixed(1)),
  };
}

export default function DesignEditor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const [draggingTarget, setDraggingTarget] = useState<
    "logo" | "resize-logo" | string | null
  >(null);
  const [selectedElement, setSelectedElement] = useState<"logo" | string | null>(
    "logo",
  );

  const config = useConfiguratorStore((state) => state.config);
  const activeSection = config.activeSection;
  const design = config.sections[activeSection];

  const setActiveSection = useConfiguratorStore(
    (state) => state.setActiveSection,
  );
  const setLogo = useConfiguratorStore((state) => state.setLogo);
  const removeLogo = useConfiguratorStore((state) => state.removeLogo);
  const addText = useConfiguratorStore((state) => state.addText);
  const updateText = useConfiguratorStore((state) => state.updateText);
  const removeText = useConfiguratorStore((state) => state.removeText);
  const clearActiveSection = useConfiguratorStore(
    (state) => state.clearActiveSection,
  );

  const sections: { id: DesignSection; label: string; desc: string }[] = [
    {
      id: "canopy",
      label: "Canopy Roof",
      desc: "Front Sloping Peak (Primary Logo Area)",
    },
    {
      id: "frontWall",
      label: "Front Valance",
      desc: "Front Ribbon Flap (Tagline / Web Address)",
    },
    {
      id: "leftWall",
      label: "Left Wall",
      desc: "Left Side Exterior Banner",
    },
    {
      id: "rightWall",
      label: "Right Wall",
      desc: "Right Side Exterior Banner",
    },
  ];

  // Aspect ratio tailored to the actual physical section surface
  const sectionAspectRatio =
    activeSection === "frontWall"
      ? 4.2 // Wide horizontal valance ribbon
      : activeSection === "canopy"
        ? 1.46 // Sloping roof trapezoid face
        : 1.95; // Side walls

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image (PNG, SVG, or JPEG).");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const src = reader.result;

      // Pre-load the image to detect exact natural aspect ratio
      const img = new Image();
      img.onload = () => {
        const naturalW = img.naturalWidth || 300;
        const naturalH = img.naturalHeight || 150;
        const imgAspect = naturalW / naturalH;

        const defaultScale = 55;
        const dims = calculateLogoDimensions(
          defaultScale,
          imgAspect,
          sectionAspectRatio,
        );

        setLogo({
          id: crypto.randomUUID(),
          src,
          name: file.name,
          x: 50,
          y: 50,
          width: dims.width,
          height: dims.height,
          rotation: 0,
          scale: defaultScale,
          aspectRatio: imgAspect,
        });
        setSelectedElement("logo");
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const loadSampleLogo = (logo: (typeof SAMPLE_LOGOS)[0]) => {
    const defaultScale = 55;
    const dims = calculateLogoDimensions(
      defaultScale,
      logo.aspectRatio,
      sectionAspectRatio,
    );

    setLogo({
      id: crypto.randomUUID(),
      src: logo.src,
      name: logo.name,
      x: 50,
      y: 50,
      width: dims.width,
      height: dims.height,
      rotation: 0,
      scale: defaultScale,
      aspectRatio: logo.aspectRatio,
    });
    setSelectedElement("logo");
  };

  const handleAddText = () => {
    const newId = crypto.randomUUID();
    addText({
      id: newId,
      text: activeSection === "frontWall" ? "WWW.YOURBRAND.COM" : "COMPANY NAME",
      x: 50,
      y: activeSection === "frontWall" ? 50 : 75,
      width: 50,
      height: 16,
      fontSize: activeSection === "frontWall" ? 22 : 32,
      color: "#111827",
      rotation: 0,
      isBold: true,
    });
    setSelectedElement(newId);
  };

  // Direct scale adjustment updating both width and height proportionally
  const handleScaleChange = (newScale: number) => {
    if (!design?.logo) return;
    const imgAspect = design.logo.aspectRatio || 2.0;
    const clampedScale = Math.max(10, Math.min(100, Math.round(newScale)));
    const dims = calculateLogoDimensions(
      clampedScale,
      imgAspect,
      sectionAspectRatio,
    );

    setLogo({
      ...design.logo,
      scale: clampedScale,
      width: dims.width,
      height: dims.height,
    });
  };

  // Pointer dragging handler for both positioning and corner resizing
  const handlePointerDown = (
    e: PointerEvent<HTMLDivElement>,
    target: "logo" | "resize-logo" | string,
  ) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingTarget(target);
    if (target === "logo" || target === "resize-logo") {
      setSelectedElement("logo");
    } else {
      setSelectedElement(target);
    }
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingTarget || !printAreaRef.current) return;

    const rect = printAreaRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;

    if (draggingTarget === "resize-logo" && design?.logo) {
      // Calculate scale based on distance from logo center to current pointer
      const dx = Math.abs(rawX - design.logo.x);
      const dy = Math.abs(rawY - design.logo.y);
      // Derive scale percent from radial distance
      const distancePercent = Math.max(dx, dy) * 2;
      handleScaleChange(distancePercent);
    } else if (draggingTarget === "logo" && design?.logo) {
      const clampedX = Math.round(Math.max(5, Math.min(95, rawX)));
      const clampedY = Math.round(Math.max(5, Math.min(95, rawY)));
      setLogo({
        ...design.logo,
        x: clampedX,
        y: clampedY,
      });
    } else if (typeof draggingTarget === "string" && draggingTarget !== "resize-logo") {
      const clampedX = Math.round(Math.max(5, Math.min(95, rawX)));
      const clampedY = Math.round(Math.max(5, Math.min(95, rawY)));
      updateText(draggingTarget, {
        x: clampedX,
        y: clampedY,
      });
    }
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (draggingTarget) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
      setDraggingTarget(null);
    }
  };

  const sectionBgColor =
    activeSection === "canopy" || activeSection === "frontWall"
      ? config.appearance.canopyColor
      : config.appearance.wallColor;

  // Read current scale or calculate fallback from current width
  const currentLogoScale =
    design?.logo?.scale ??
    (design?.logo
      ? Math.round((design.logo.width / 90) * 100)
      : 55);

  return (
    <div className="flex h-[620px] w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-gray-50/70 p-3">
        <div className="flex items-center gap-1.5">
          {sections.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => {
                setActiveSection(sec.id);
                setSelectedElement("logo");
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeSection === sec.id
                  ? "bg-black text-white shadow-xs"
                  : "bg-white border text-gray-700 hover:bg-gray-100"
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-gray-800"
          >
            + Upload Logo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleImageUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleAddText}
            className="rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
          >
            + Add Text
          </button>

          {(design?.logo || (design?.texts && design.texts.length > 0)) && (
            <button
              type="button"
              onClick={clearActiveSection}
              className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Clear Section
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Interactive Print Template Canvas with matched aspect ratio */}
        <div
          className="flex flex-1 items-center justify-center overflow-auto bg-slate-100 p-6 select-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div
            className="relative w-full max-w-[580px] overflow-hidden rounded-xl border border-gray-300 shadow-md transition-all"
            style={{
              aspectRatio: `${sectionAspectRatio}`,
              backgroundColor: sectionBgColor,
            }}
          >
            {/* Visual Guide: Canopy Peak Triangle Indicator */}
            {activeSection === "canopy" && (
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-15"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <polygon points="50,2 96,98 4,98" fill="white" stroke="white" strokeWidth="1" />
              </svg>
            )}

            {/* Template Bleed & Safe Print Area */}
            <div
              ref={printAreaRef}
              className="absolute inset-0"
              onClick={() => setSelectedElement(null)}
            >
              <div className="absolute top-2 left-2 pointer-events-none rounded bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                {sections.find((s) => s.id === activeSection)?.desc}
              </div>

              {/* Logo Layer with Interactive Corner Scaling Handles */}
              {design?.logo && (
                <div
                  onPointerDown={(e) => handlePointerDown(e, "logo")}
                  className={`absolute cursor-grab active:cursor-grabbing p-1 transition-shadow ${
                    selectedElement === "logo"
                      ? "ring-2 ring-blue-500 rounded bg-white/10"
                      : "hover:ring-1 hover:ring-blue-300"
                  }`}
                  style={{
                    left: `${design.logo.x}%`,
                    top: `${design.logo.y}%`,
                    width: `${design.logo.width}%`,
                    height: `${design.logo.height}%`,
                    transform: `translate(-50%, -50%) rotate(${design.logo.rotation}deg)`,
                    touchAction: "none",
                  }}
                >
                  <img
                    src={design.logo.src}
                    alt="Custom Logo"
                    draggable={false}
                    className="h-full w-full object-contain drop-shadow-sm pointer-events-none"
                  />

                  {/* Corner Resize Handles for intuitive visual drag-scaling */}
                  {selectedElement === "logo" && (
                    <>
                      <div
                        onPointerDown={(e) => handlePointerDown(e, "resize-logo")}
                        className="absolute -bottom-2 -right-2 h-4 w-4 cursor-se-resize rounded-full border-2 border-white bg-blue-600 shadow-sm transition hover:scale-125"
                        title="Drag corner to scale logo"
                      />
                      <div
                        onPointerDown={(e) => handlePointerDown(e, "resize-logo")}
                        className="absolute -top-2 -left-2 h-4 w-4 cursor-nw-resize rounded-full border-2 border-white bg-blue-600 shadow-sm transition hover:scale-125"
                        title="Drag corner to scale logo"
                      />
                    </>
                  )}
                </div>
              )}

              {/* Text Layers */}
              {design?.texts?.map((item) => (
                <div
                  key={item.id}
                  onPointerDown={(e) => handlePointerDown(e, item.id)}
                  className={`absolute cursor-grab active:cursor-grabbing whitespace-nowrap p-1 font-bold ${
                    selectedElement === item.id
                      ? "ring-2 ring-blue-500 rounded bg-white/10"
                      : "hover:ring-1 hover:ring-blue-300"
                  }`}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                    color: item.color,
                    fontSize: `${item.fontSize}px`,
                    touchAction: "none",
                  }}
                >
                  {item.text}
                </div>
              ))}

              {!design?.logo && (!design?.texts || design.texts.length === 0) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <p className="text-sm font-semibold text-white drop-shadow-sm">
                    No artwork on {sections.find((s) => s.id === activeSection)?.label} yet
                  </p>
                  <p className="mt-1 text-xs text-white/80 drop-shadow-sm">
                    Upload your logo or try a sample brand below:
                  </p>

                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {SAMPLE_LOGOS.map((sample) => (
                      <button
                        key={sample.name}
                        type="button"
                        onClick={() => loadSampleLogo(sample)}
                        className="rounded-md border border-gray-300 bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-xs hover:bg-white active:scale-95 transition"
                      >
                        + {sample.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Properties Inspector Panel */}
        <aside className="w-[310px] overflow-y-auto border-l bg-white p-3.5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Element Inspector
            </h3>
            <span className="text-[11px] text-gray-400">
              {sections.find((s) => s.id === activeSection)?.label}
            </span>
          </div>

          {/* Logo Adjustments */}
          {design?.logo ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">
                  Logo Size & Position
                </span>
                <button
                  type="button"
                  onClick={removeLogo}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Delete Logo
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Unified Proportional Logo Scale */}
                <div>
                  <div className="flex justify-between items-center text-gray-700 font-semibold">
                    <span>Logo Scale / Size:</span>
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 font-bold text-blue-600 font-mono">
                      {currentLogoScale}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => handleScaleChange(currentLogoScale - 5)}
                      className="flex h-7 w-7 items-center justify-center rounded border bg-white font-bold text-gray-700 hover:bg-gray-100 active:scale-95 transition"
                      title="Zoom Out"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min="15"
                      max="100"
                      value={currentLogoScale}
                      onChange={(e) => handleScaleChange(Number(e.target.value))}
                      className="flex-1 accent-blue-600 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => handleScaleChange(currentLogoScale + 5)}
                      className="flex h-7 w-7 items-center justify-center rounded border bg-white font-bold text-gray-700 hover:bg-gray-100 active:scale-95 transition"
                      title="Zoom In"
                    >
                      +
                    </button>
                  </div>

                  {/* Proportional Scale Presets */}
                  <div className="grid grid-cols-4 gap-1 mt-1.5">
                    {[
                      { label: "25%", val: 25 },
                      { label: "50%", val: 50 },
                      { label: "75%", val: 75 },
                      { label: "Max", val: 100 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => handleScaleChange(p.val)}
                        className={`rounded border py-1 text-center text-[10px] font-semibold transition ${
                          Math.abs(currentLogoScale - p.val) < 4
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* X Position */}
                <div>
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Horizontal Pos (X):</span>
                    <span>{design.logo.x}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={design.logo.x}
                    onChange={(e) =>
                      setLogo({
                        ...design.logo!,
                        x: Number(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer accent-gray-800"
                  />
                </div>

                {/* Y Position */}
                <div>
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Vertical Pos (Y):</span>
                    <span>{design.logo.y}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={design.logo.y}
                    onChange={(e) =>
                      setLogo({
                        ...design.logo!,
                        y: Number(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer accent-gray-800"
                  />
                </div>

                {/* Rotation */}
                <div>
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Rotation:</span>
                    <span>{design.logo.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={design.logo.rotation}
                    onChange={(e) =>
                      setLogo({
                        ...design.logo!,
                        rotation: Number(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer accent-gray-800"
                  />
                </div>

                {/* Quick alignment shortcuts */}
                <div className="grid grid-cols-3 gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setLogo({
                        ...design.logo!,
                        x: 50,
                        y: 50,
                        rotation: 0,
                      })
                    }
                    className="rounded border bg-white py-1 text-center text-[10px] font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Center
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLogo({
                        ...design.logo!,
                        y: activeSection === "canopy" ? 35 : 30,
                      })
                    }
                    className="rounded border bg-white py-1 text-center text-[10px] font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Top
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLogo({
                        ...design.logo!,
                        y: activeSection === "canopy" ? 65 : 70,
                      })
                    }
                    className="rounded border bg-white py-1 text-center text-[10px] font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Bottom
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-3 text-center">
              <span className="text-xs text-gray-500 font-medium">No logo on this section</span>
              <div className="mt-2 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg bg-black px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
                >
                  Upload Logo
                </button>
                <div className="flex justify-center gap-1">
                  {SAMPLE_LOGOS.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => loadSampleLogo(s)}
                      className="rounded border bg-white px-2 py-1 text-[10px] font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      {s.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Text Adjustments */}
          {design?.texts?.map((txt, idx) => (
            <div
              key={txt.id}
              className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800">
                  Text Line {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeText(txt.id)}
                  className="text-red-600 hover:underline font-semibold"
                >
                  Delete
                </button>
              </div>

              <input
                type="text"
                value={txt.text}
                onChange={(e) =>
                  updateText(txt.id, { text: e.target.value })
                }
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 font-semibold"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500 text-[10px] font-medium">Font Size:</span>
                  <input
                    type="number"
                    min="14"
                    max="64"
                    value={txt.fontSize}
                    onChange={(e) =>
                      updateText(txt.id, {
                        fontSize: Number(e.target.value),
                      })
                    }
                    className="w-full rounded border border-gray-300 bg-white px-1.5 py-0.5 text-xs font-semibold"
                  />
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] font-medium">Color:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={txt.color}
                      onChange={(e) =>
                        updateText(txt.id, { color: e.target.value })
                      }
                      className="h-7 w-8 cursor-pointer rounded border border-gray-300"
                    />
                    <span className="text-[10px] font-mono text-gray-600">{txt.color}</span>
                  </div>
                </div>
              </div>

              {/* X / Y Position Sliders */}
              <div>
                <div className="flex justify-between text-gray-600 text-[10px]">
                  <span>Horizontal (X): {txt.x}%</span>
                  <span>Vertical (Y): {txt.y}%</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={txt.x}
                    onChange={(e) => updateText(txt.id, { x: Number(e.target.value) })}
                  />
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={txt.y}
                    onChange={(e) => updateText(txt.id, { y: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => updateText(txt.id, { x: 50, y: 50 })}
                  className="flex-1 rounded border bg-white py-1 text-center text-[10px] font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Center
                </button>
                <button
                  type="button"
                  onClick={() => updateText(txt.id, { y: 20 })}
                  className="flex-1 rounded border bg-white py-1 text-center text-[10px] font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Top
                </button>
                <button
                  type="button"
                  onClick={() => updateText(txt.id, { y: 80 })}
                  className="flex-1 rounded border bg-white py-1 text-center text-[10px] font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Bottom
                </button>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
