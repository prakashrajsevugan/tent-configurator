import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { SectionDesign } from "../../types/configuration";

// In-memory decoded image cache to prevent async reloading flashes during drags
const imageCache = new Map<string, HTMLImageElement>();

/**
 * Creates a reactive THREE.CanvasTexture representing the 2D logo and text
 * design for a specific section, preserving correct aspect ratios and alignments.
 */
export function useSectionTexture(
  design?: SectionDesign,
  aspectRatio: number = 1.5, // width / height
): THREE.CanvasTexture | null {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // If section has no artwork, clean up and return null
    if (
      !design ||
      (!design.logo && (!design.texts || design.texts.length === 0))
    ) {
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }
      queueMicrotask(() => {
        setTexture(null);
      });
      return;
    }

    const canvasWidth = 1200;
    const canvasHeight = Math.max(240, Math.round(canvasWidth / aspectRatio));

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isCancelled = false;

    const drawTexts = () => {
      if (!design.texts || design.texts.length === 0) return;
      for (const item of design.texts) {
        ctx.save();
        const posX = (item.x / 100) * canvas.width;
        const posY = (item.y / 100) * canvas.height;
        ctx.translate(posX, posY);
        ctx.rotate((item.rotation * Math.PI) / 180);
        ctx.fillStyle = item.color || "#000000";

        // Scale font proportionally to canvas resolution
        const fontPx = Math.round(item.fontSize * (canvasHeight / 240));
        ctx.font = `${item.isBold !== false ? "bold" : "normal"} ${fontPx}px Inter, -apple-system, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.text, 0, 0);
        ctx.restore();
      }
    };

    const commitTexture = () => {
      if (isCancelled) return;
      if (!textureRef.current) {
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.needsUpdate = true;
        textureRef.current = tex;
        setTexture(tex);
      } else {
        textureRef.current.needsUpdate = true;
        setTexture(textureRef.current);
      }
    };

    const renderCanvas = (loadedImg?: HTMLImageElement) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (loadedImg && design.logo) {
        ctx.save();
        const posX = (design.logo.x / 100) * canvas.width;
        const posY = (design.logo.y / 100) * canvas.height;
        const targetW = (design.logo.width / 100) * canvas.width;
        const targetH = (design.logo.height / 100) * canvas.height;

        ctx.translate(posX, posY);
        ctx.rotate((design.logo.rotation * Math.PI) / 180);

        // Preserve intrinsic aspect ratio like object-contain
        const naturalW = loadedImg.naturalWidth || loadedImg.width || 240;
        const naturalH = loadedImg.naturalHeight || loadedImg.height || 80;
        const imgAspect = naturalW / naturalH;
        let drawW = targetW;
        let drawH = targetH;
        if (targetW / targetH > imgAspect) {
          drawW = targetH * imgAspect;
        } else {
          drawH = targetW / imgAspect;
        }

        ctx.drawImage(loadedImg, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

      drawTexts();
      commitTexture();
    };

    if (design.logo && design.logo.src) {
      const src = design.logo.src;
      const cached = imageCache.get(src);
      if (cached && cached.complete && cached.naturalWidth > 0) {
        // Cached & ready: render synchronously with ZERO lag
        renderCanvas(cached);
      } else {
        const img = new Image();
        if (!src.startsWith("data:")) {
          img.crossOrigin = "anonymous";
        }
        img.onload = () => {
          if (isCancelled) return;
          imageCache.set(src, img);
          renderCanvas(img);
        };
        img.onerror = (err) => {
          console.warn("Logo image failed to load, rendering text only:", err);
          if (isCancelled) return;
          renderCanvas();
        };
        img.src = src;
      }
    } else {
      renderCanvas();
    }

    return () => {
      isCancelled = true;
    };
  }, [design, aspectRatio]);

  return texture;
}
