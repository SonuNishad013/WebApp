import React, { useEffect, useRef } from "react";

const chars = ".:-=+*#%X@";

const AsciiFlameCanvas = ({ hue = 190, theme = "dark" }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId;
    let width = 1;
    let height = 1;
    let columns = 1;
    let rows = 1;
    let fontSize = 8;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fontSize = Math.max(6, Math.min(10, Math.round(Math.min(width / 24, height / 7))));
      columns = Math.floor(width / fontSize);
      rows = Math.floor(height / fontSize);
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
      ctx.textBaseline = "top";
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(container);

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);

      const baseLightness = theme === "dark" ? 60 : 32;
      const alphaBase = theme === "dark" ? 0.55 : 0.6;

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < columns; x += 1) {
          const noise =
            Math.sin(x * 0.35 + time * 0.002) +
            Math.cos(y * 0.35 + time * 0.003);
          const index =
            Math.floor(Math.abs(noise) * (chars.length - 1)) % chars.length;
          const char = chars[index];

          if (Math.random() > 0.08) {
            const flicker = 0.25 + Math.abs(noise) * 0.6;
            const lightness = baseLightness + Math.abs(noise) * 18;
            ctx.fillStyle = `hsl(${hue} 90% ${lightness}%)`;
            ctx.globalAlpha = alphaBase * flicker;
            ctx.fillText(char, x * fontSize, y * fontSize);
          }
        }
      }

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      resizeObserver.disconnect();
    };
  }, [hue, theme]);

  return (
    <div ref={containerRef} className="ascii-flame" aria-hidden="true">
      <canvas ref={canvasRef} className="ascii-canvas" />
    </div>
  );
};

export default AsciiFlameCanvas;
