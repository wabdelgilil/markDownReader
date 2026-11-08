import { useState, useRef, useCallback, useEffect } from 'react';

interface PanZoomState {
  scale: number;
  x: number;
  y: number;
}

interface UseCanvasPanZoomOptions {
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  scaleStep?: number;
}

export function useCanvasPanZoom({
  minScale = 0.2,
  maxScale = 6.0,
  initialScale = 1.0,
  scaleStep = 1.2,
}: UseCanvasPanZoomOptions = {}) {
  const [transform, setTransform] = useState<PanZoomState>({
    scale: initialScale,
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartDistRef = useRef<number | null>(null);

  // Reset transform to initial state
  const reset = useCallback(() => {
    setTransform({ scale: initialScale, x: 0, y: 0 });
  }, [initialScale]);

  // Step Zoom In centered on container
  const zoomIn = useCallback(() => {
    setTransform((prev) => {
      const nextScale = Math.min(prev.scale * scaleStep, maxScale);
      return { ...prev, scale: nextScale };
    });
  }, [scaleStep, maxScale]);

  // Step Zoom Out centered on container
  const zoomOut = useCallback(() => {
    setTransform((prev) => {
      const nextScale = Math.max(prev.scale / scaleStep, minScale);
      return { ...prev, scale: nextScale };
    });
  }, [scaleStep, minScale]);

  // Fit to Screen
  const fitToScreen = useCallback(() => {
    setTransform({ scale: 1.0, x: 0, y: 0 });
  }, []);

  // Mouse Wheel: Cursor-centered dynamic zooming (Figma / Maps algorithm)
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;

      setTransform((prev) => {
        const nextScale = Math.min(Math.max(prev.scale * zoomFactor, minScale), maxScale);
        const ratio = nextScale / prev.scale;

        // Mathematical cursor-offset anchor formula
        const nextX = mouseX - (mouseX - prev.x) * ratio;
        const nextY = mouseY - (mouseY - prev.y) * ratio;

        return {
          scale: nextScale,
          x: nextX,
          y: nextY,
        };
      });
    },
    [minScale, maxScale]
  );

  // Mouse Drag to Pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left mouse click only
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

      setTransform((prev) => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch Events: 1-finger Pan & 2-finger Pinch to Zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
        const deltaX = e.touches[0].clientX - dragStartRef.current.x;
        const deltaY = e.touches[0].clientY - dragStartRef.current.y;

        dragStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };

        setTransform((prev) => ({
          ...prev,
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));
      } else if (e.touches.length === 2 && touchStartDistRef.current !== null) {
        const newDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );

        const factor = newDist / touchStartDistRef.current;
        touchStartDistRef.current = newDist;

        setTransform((prev) => ({
          ...prev,
          scale: Math.min(Math.max(prev.scale * factor, minScale), maxScale),
        }));
      }
    },
    [isDragging, minScale, maxScale]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    touchStartDistRef.current = null;
  }, []);

  // Window-level mouse up safety
  useEffect(() => {
    const onWindowMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', onWindowMouseUp);
    return () => window.removeEventListener('mouseup', onWindowMouseUp);
  }, []);

  return {
    containerRef,
    transform,
    isDragging,
    zoomIn,
    zoomOut,
    reset,
    fitToScreen,
    setTransform,
    handlers: {
      onWheel: handleWheel,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onDoubleClick: reset,
    },
  };
}
