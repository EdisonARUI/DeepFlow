"use client";

import { useEffect, useRef } from "react";

type WaveLayerConfig = {
  baseRibbon: number;
  baseAmplitude: number;
  frequency: number;
  phaseSpeed: number;
  lineSpacing: number;
  opacity: number;
  spreadIndex: number;
};

type WaveLayer = WaveLayerConfig & {
  phase: number;
};

const LAYER_SPREAD = [-1.5, -0.5, 0.5, 1.5] as const;

const LAYERS: WaveLayerConfig[] = [
  {
    lineSpacing: 20,
    frequency: 0.0022,
    phaseSpeed: 0.008,
    baseRibbon: 160,
    baseAmplitude: 70,
    opacity: 0.22,
    spreadIndex: 0,
  },
  {
    lineSpacing: 40,
    frequency: 0.0018,
    phaseSpeed: 0.006,
    baseRibbon: 180,
    baseAmplitude: 85,
    opacity: 0.28,
    spreadIndex: 1,
  },
  {
    lineSpacing: 20,
    frequency: 0.0028,
    phaseSpeed: 0.01,
    baseRibbon: 150,
    baseAmplitude: 65,
    opacity: 0.18,
    spreadIndex: 2,
  },
  {
    lineSpacing: 40,
    frequency: 0.002,
    phaseSpeed: 0.007,
    baseRibbon: 170,
    baseAmplitude: 75,
    opacity: 0.25,
    spreadIndex: 3,
  },
];

const TWO_PI = Math.PI * 2;
const HEIGHT_BASELINE = 700;
const LINE_WIDTH = 5;

function createLayers(): WaveLayer[] {
  return LAYERS.map((layer) => ({ ...layer, phase: 0 }));
}

function drawWaves(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layers: WaveLayer[],
  animate: boolean,
) {
  ctx.clearRect(0, 0, width, height);

  const centerY = height * 0.5;
  const spread = height * 0.22;
  const scale = height / HEIGHT_BASELINE;

  for (const layer of layers) {
    if (animate) {
      layer.phase = (layer.phase + layer.phaseSpeed) % TWO_PI;
    }

    const centerOffset = LAYER_SPREAD[layer.spreadIndex] * spread;
    const layerCenterY = centerY + centerOffset;
    const ribbonHeight = layer.baseRibbon * scale;
    const amplitude = layer.baseAmplitude * scale;

    ctx.strokeStyle = `rgba(255, 255, 255, ${layer.opacity})`;
    ctx.lineWidth = LINE_WIDTH;

    for (let x = 0; x <= width; x += layer.lineSpacing) {
      const waveY =
        layerCenterY + amplitude * Math.sin(x * layer.frequency + layer.phase);
      const halfHeight = ribbonHeight / 2;

      ctx.beginPath();
      ctx.moveTo(x, waveY - halfHeight);
      ctx.lineTo(x, waveY + halfHeight);
      ctx.stroke();
    }
  }
}

export function LandingHeroWaves() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layersRef = useRef<WaveLayer[]>(createLayers());
  const frameRef = useRef<number>(0);
  const reducedMotionRef = useRef(false);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = motionQuery.matches;

    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      if (event.matches) {
        cancelAnimationFrame(frameRef.current);
        const { width, height } = dimensionsRef.current;
        drawWaves(ctx, width, height, layersRef.current, false);
      } else {
        startLoop();
      }
    };

    motionQuery.addEventListener("change", handleMotionChange);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      dimensionsRef.current = { width, height };

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = () => {
      const { width, height } = dimensionsRef.current;
      drawWaves(
        ctx,
        width,
        height,
        layersRef.current,
        !reducedMotionRef.current,
      );
    };

    const loop = () => {
      if (document.visibilityState === "hidden") {
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      render();
      frameRef.current = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      cancelAnimationFrame(frameRef.current);
      if (reducedMotionRef.current) {
        render();
        return;
      }
      frameRef.current = requestAnimationFrame(loop);
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (reducedMotionRef.current) {
        render();
      }
    });

    observer.observe(container);
    resize();

    if (reducedMotionRef.current) {
      render();
    } else {
      startLoop();
    }

    const handleVisibility = () => {
      if (
        document.visibilityState === "visible" &&
        !reducedMotionRef.current
      ) {
        startLoop();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      motionQuery.removeEventListener("change", handleMotionChange);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute left-0 top-1/2 h-[240%] w-full -translate-y-1/2"
    >
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden />
    </div>
  );
}
