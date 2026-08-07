"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

type RoutePoint = {
  x: number;
  y: number;
  delay: number;
};

type Route = {
  start: RoutePoint;
  end: RoutePoint;
  color: string;
};

interface DotMapProps {
  className?: string;
  dotColor?: string;
  routeColor?: string;
  routeGlow?: string;
  routeCount?: number;
}

export function DotMap({
  className = "",
  dotColor = "rgba(99, 102, 241, 0.4)",
  routeColor = "#6366f1",
  routeGlow = "rgba(99, 102, 241, 0.4)",
  routeCount = 6,
}: DotMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const routesRef = useRef<Route[]>([]);
  const startTimeRef = useRef(Date.now());

  const generateRoutes = useCallback(
    (width: number, height: number): Route[] => {
      const routes: Route[] = [];
      for (let i = 0; i < routeCount; i++) {
        routes.push({
          start: {
            x: Math.random() * width * 0.8 + width * 0.1,
            y: Math.random() * height * 0.8 + height * 0.1,
            delay: Math.random() * 3,
          },
          end: {
            x: Math.random() * width * 0.8 + width * 0.1,
            y: Math.random() * height * 0.8 + height * 0.1,
            delay: Math.random() * 3 + 3,
          },
          color: routeColor,
        });
      }
      return routes;
    },
    [routeCount, routeColor]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      routesRef.current = generateRoutes(width, height);
      startTimeRef.current = Date.now();
    });

    resizeObserver.observe(canvas.parentElement as Element);
    return () => resizeObserver.disconnect();
  }, [generateRoutes]);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Capture non-null references for animation functions
    const canvasEl = canvas;
    const ctxEl = ctx;
    const dpr = window.devicePixelRatio || 1;
    const width = dimensions.width;
    const height = dimensions.height;

    // Generate dots for the background pattern
    const dots: { x: number; y: number; radius: number; opacity: number }[] = [];
    const gap = 14;
    const dotRadius = 1;

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        // Create a flowing organic shape
        const nx = x / width;
        const ny = y / height;
        const dist = Math.sqrt(
          Math.pow(nx - 0.5, 2) + Math.pow(ny - 0.5, 2)
        );
        const angle = Math.atan2(ny - 0.5, nx - 0.5);
        const shape =
          0.3 +
          0.15 * Math.sin(angle * 3 + dist * 8) +
          0.1 * Math.cos(angle * 5 - dist * 6);

        if (dist < shape && Math.random() > 0.25) {
          dots.push({
            x,
            y,
            radius: dotRadius,
            opacity: Math.random() * 0.4 + 0.15,
          });
        }
      }
    }

    let animationFrameId: number;

    function drawDots() {
      ctxEl.clearRect(0, 0, canvasEl.width, canvasEl.height);
      ctxEl.save();
      ctxEl.scale(dpr, dpr);

      dots.forEach((dot) => {
        ctxEl.beginPath();
        ctxEl.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctxEl.fillStyle = dotColor.replace(/[\d.]+\)$/, `${dot.opacity})`);
        ctxEl.fill();
      });

      ctxEl.restore();
    }

    function drawRoutes() {
      const currentTime = (Date.now() - startTimeRef.current) / 1000;

      ctxEl.save();
      ctxEl.scale(dpr, dpr);

      routesRef.current.forEach((route) => {
        const elapsed = currentTime - route.start.delay;
        if (elapsed <= 0) return;

        const duration = 4;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

        const x = route.start.x + (route.end.x - route.start.x) * eased;
        const y = route.start.y + (route.end.y - route.start.y) * eased;

        // Draw the route line
        ctxEl.beginPath();
        ctxEl.moveTo(route.start.x, route.start.y);
        ctxEl.lineTo(x, y);
        ctxEl.strokeStyle = route.color;
        ctxEl.lineWidth = 1.5;
        ctxEl.globalAlpha = 0.6;
        ctxEl.stroke();
        ctxEl.globalAlpha = 1;

        // Draw the start point
        ctxEl.beginPath();
        ctxEl.arc(route.start.x, route.start.y, 3, 0, Math.PI * 2);
        ctxEl.fillStyle = route.color;
        ctxEl.fill();

        // Draw the moving point
        ctxEl.beginPath();
        ctxEl.arc(x, y, 3, 0, Math.PI * 2);
        ctxEl.fillStyle = route.color;
        ctxEl.fill();

        // Add glow effect to the moving point
        ctxEl.beginPath();
        ctxEl.arc(x, y, 8, 0, Math.PI * 2);
        ctxEl.fillStyle = routeGlow;
        ctxEl.fill();

        // If the route is complete, draw the end point
        if (progress === 1) {
          ctxEl.beginPath();
          ctxEl.arc(route.end.x, route.end.y, 3, 0, Math.PI * 2);
          ctxEl.fillStyle = route.color;
          ctxEl.fill();
        }
      });

      ctxEl.restore();
    }

    function animate() {
      drawDots();
      drawRoutes();

      const currentTime = (Date.now() - startTimeRef.current) / 1000;
      if (currentTime > 12) {
        startTimeRef.current = Date.now();
        routesRef.current = generateRoutes(width, height);
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions, dotColor, routeColor, routeGlow, generateRoutes]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: "auto" }}
      />
    </div>
  );
}
