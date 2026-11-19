import jsPDF from "jspdf";
import type { ProductConfiguration } from "../types/configuration";
import type { PricingResponse } from "../types/pricing";

export async function generateConfigurationPDF(
  configuration: ProductConfiguration,
  pricing: PricingResponse | null,
  previewDataUrl?: string,
) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 16;
  let y = 18;

  // Header Bar
  pdf.setFillColor(17, 24, 39); // Slate-900
  pdf.rect(0, 0, 210, 26, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("MVP VISUALS — PRODUCTION SUMMARY", margin, 13);

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text("Custom Canopy Tent Production Order & Artwork Proof", margin, 20);

  pdf.setFontSize(9);
  pdf.text(
    `Order ID: ${configuration.configurationId}`,
    210 - margin - 45,
    13,
  );
  pdf.text(
    `Date: ${new Date().toLocaleDateString()}`,
    210 - margin - 45,
    20,
  );

  y = 34;
  pdf.setTextColor(17, 24, 39);

  // Optional 3D Preview Snapshot
  if (previewDataUrl) {
    try {
      pdf.setDrawColor(229, 231, 235);
      pdf.rect(margin, y, 80, 56);
      pdf.addImage(previewDataUrl, "PNG", margin + 1, y + 1, 78, 54);
    } catch {
      // Fallback if image data cannot be drawn
    }
  }

  const specStartX = previewDataUrl ? margin + 86 : margin;

  // PRODUCT SPECIFICATIONS
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("PRODUCT SPECIFICATIONS", specStartX, y + 5);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");

  const specs = [
    `Canopy Model: ${configuration.product.sizeId.toUpperCase()}`,
    `Frame Hardware: ${configuration.product.frameId.replace("-", " ").toUpperCase()}`,
    `Wall Setup: ${configuration.options.walls.replace("-", " ").toUpperCase()}`,
    `Half Walls: ${configuration.options.halfWalls.replace("-", " ").toUpperCase()}`,
    `Turnaround: ${configuration.options.turnaround === "rush-2day" ? "RUSH 2-DAY PRODUCTION" : "Standard 5-Day"}`,
    `Accessories: ${configuration.options.accessories?.length ? configuration.options.accessories.join(", ") : "None"}`,
    `Fire Rating: CPAI-84 & NFPA-701 Compliant`,
    `Fabric: 600D Heavy-Duty UV50+ Waterproof Polyester`,
  ];

  let specY = y + 11;
  for (const s of specs) {
    pdf.text(`• ${s}`, specStartX, specY);
    specY += 5.5;
  }

  y = Math.max(y + 64, specY + 8);

  // COLOR & ARTWORK PROOF DETAILS
  pdf.setFillColor(243, 244, 246);
  pdf.rect(margin, y, 210 - margin * 2, 7, "F");

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("COLOR SPECIFICATIONS & DYE SUBLIMATION ARTWORK", margin + 3, y + 5);

  y += 12;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");

  pdf.text(`Canopy Color (Hex): ${configuration.appearance.canopyColor}`, margin + 3, y);
  pdf.text(`Wall Color (Hex): ${configuration.appearance.wallColor}`, margin + 85, y);

  y += 8;

  // Customization Sections Matrix
  const sectionEntries = Object.entries(configuration.sections);
  for (const [secName, sec] of sectionEntries) {
    const hasArtwork = sec.logo || sec.texts.length > 0;
    const desc = hasArtwork
      ? `Artwork: ${sec.logo ? "Custom Logo" : ""} ${sec.texts.length > 0 ? `+ ${sec.texts.length} Text Element(s)` : ""}`
      : "No custom print artwork (Blank fabric color)";

    pdf.setFont("helvetica", "bold");
    pdf.text(`• ${secName.toUpperCase()}:`, margin + 3, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(desc, margin + 45, y);

    if (sec.texts.length > 0) {
      y += 5;
      pdf.setFontSize(8);
      pdf.setTextColor(75, 85, 99);
      pdf.text(
        `   Texts: "${sec.texts.map((t) => t.text).join('", "')}"`,
        margin + 45,
        y,
      );
      pdf.setFontSize(9);
      pdf.setTextColor(17, 24, 39);
    }

    y += 6.5;
  }

  y += 6;

  // FINANCIAL BILL OF MATERIALS & ORDER ESTIMATE
  pdf.setFillColor(243, 244, 246);
  pdf.rect(margin, y, 210 - margin * 2, 7, "F");

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("BILL OF MATERIALS & PRICING BREAKDOWN", margin + 3, y + 5);

  y += 12;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");

  if (pricing) {
    const rows = [
      ["Base Commercial Canopy", `$${pricing.basePrice.toFixed(2)}`],
      ["Frame Package", pricing.options.frame ? `+$${pricing.options.frame.toFixed(2)}` : "Included"],
      ["Full Walls", pricing.options.walls ? `+$${pricing.options.walls.toFixed(2)}` : "None"],
      ["Half Walls with Bars", pricing.options.halfWalls ? `+$${pricing.options.halfWalls.toFixed(2)}` : "None"],
      ["Accessories & Hardware", pricing.options.accessories ? `+$${pricing.options.accessories.toFixed(2)}` : "$0.00"],
      ["Production Speed", pricing.options.turnaround ? `+$${pricing.options.turnaround.toFixed(2)}` : "Included"],
      ["Custom Logo Sublimation", pricing.customization.logo ? `+$${pricing.customization.logo.toFixed(2)}` : "Free Proof"],
      ["Custom Text Sublimation", pricing.customization.text ? `+$${pricing.customization.text.toFixed(2)}` : "$0.00"],
    ];

    for (const [label, val] of rows) {
      pdf.text(label, margin + 4, y);
      pdf.text(val, 210 - margin - 25, y, { align: "right" });
      y += 5.5;
    }

    y += 2;
    pdf.setDrawColor(209, 213, 219);
    pdf.line(margin, y, 210 - margin, y);
    y += 6;

    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text("TOTAL ORDER PRICE:", margin + 4, y);
    pdf.text(`$${pricing.total.toFixed(2)} USD`, 210 - margin - 25, y, {
      align: "right",
    });
  }

  // Footer & Disclaimer
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(107, 114, 128);
  pdf.text(
    "Generated automatically by MVP Visuals Custom Canopy Tent Configurator. Production ready format for Shopify order attachment.",
    margin,
    285,
  );

  pdf.save(`MVPVisuals-Canopy-${configuration.configurationId}.pdf`);
}
