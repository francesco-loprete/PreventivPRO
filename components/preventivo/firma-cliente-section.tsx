"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "@/components/i18n/locale-provider";
import { FormFeedback } from "@/components/ui/form-feedback";
import { createClient } from "@/lib/supabase/client";
import { rlsErrorHint } from "@/lib/types/preventivo";

const CANVAS_HEIGHT = 160;

type FirmaClienteSectionProps = {
  preventivoId: number;
  firmaCliente?: string | null;
  idPrefix?: string;
  onSaved?: (firma: string | null) => void;
};

function getCanvasPoint(
  canvas: HTMLCanvasElement,
  event: MouseEvent | TouchEvent
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  if ("touches" in event) {
    const touch = event.touches[0] ?? event.changedTouches[0];
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  }

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

export function FirmaClienteSection({
  preventivoId,
  firmaCliente,
  idPrefix = "firma",
  onSaved,
}: FirmaClienteSectionProps) {
  const router = useRouter();
  const t = useTranslations();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef(false);
  const hasStrokeRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const [savedFirma, setSavedFirma] = useState<string | null>(firmaCliente ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setSavedFirma(firmaCliente ?? null);
  }, [firmaCliente, preventivoId]);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = Math.max(container.clientWidth, 280);
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(CANVAS_HEIGHT * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${CANVAS_HEIGHT}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, CANVAS_HEIGHT);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    hasStrokeRef.current = false;
    lastPointRef.current = null;

    if (savedFirma) {
      const img = new Image();
      img.onload = () => {
        const drawWidth = Math.min(width - 16, img.width);
        const drawHeight = Math.min(CANVAS_HEIGHT - 16, img.height);
        const scale = Math.min(drawWidth / img.width, drawHeight / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (width - w) / 2, (CANVAS_HEIGHT - h) / 2, w, h);
        hasStrokeRef.current = true;
      };
      img.src = savedFirma;
    }
  }, [savedFirma]);

  useEffect(() => {
    setupCanvas();

    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => setupCanvas());
    observer.observe(container);
    return () => observer.disconnect();
  }, [setupCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function startDraw(event: MouseEvent | TouchEvent) {
      if ("touches" in event) event.preventDefault();
      drawingRef.current = true;
      lastPointRef.current = getCanvasPoint(canvas!, event);
    }

    function draw(event: MouseEvent | TouchEvent) {
      if (!drawingRef.current) return;
      if ("touches" in event) event.preventDefault();

      const ctx = canvas!.getContext("2d");
      if (!ctx) return;

      const point = getCanvasPoint(canvas!, event);
      const last = lastPointRef.current ?? point;

      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();

      lastPointRef.current = point;
      hasStrokeRef.current = true;
    }

    function endDraw() {
      drawingRef.current = false;
      lastPointRef.current = null;
    }

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", endDraw);
    canvas.addEventListener("mouseleave", endDraw);
    canvas.addEventListener("touchstart", startDraw, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", endDraw);
    canvas.addEventListener("touchcancel", endDraw);

    return () => {
      canvas.removeEventListener("mousedown", startDraw);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", endDraw);
      canvas.removeEventListener("mouseleave", endDraw);
      canvas.removeEventListener("touchstart", startDraw);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", endDraw);
      canvas.removeEventListener("touchcancel", endDraw);
    };
  }, [setupCanvas]);

  function clearCanvas() {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = Math.max(container.clientWidth, 280);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, CANVAS_HEIGHT);
    hasStrokeRef.current = false;
    lastPointRef.current = null;
  }

  function handleClear() {
    setError(null);
    setSuccess(null);
    clearCanvas();
  }

  async function handleSave() {
    setError(null);
    setSuccess(null);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const firmaToSave = hasStrokeRef.current
      ? canvas.toDataURL("image/png")
      : null;

    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError(t("common.sessionExpired"));
      return;
    }

    const { error: updateError } = await supabase
      .from("preventivi")
      .update({ firma_cliente: firmaToSave })
      .eq("id", preventivoId)
      .eq("user_id", user.id);

    setLoading(false);

    if (updateError) {
      setError(updateError.message + rlsErrorHint(updateError.code));
      return;
    }

    setSavedFirma(firmaToSave);
    setSuccess(firmaToSave ? t("firma.saved") : t("firma.removed"));
    onSaved?.(firmaToSave);
    router.refresh();
  }

  return (
    <div className="mt-6 border-t border-border pt-6">
      <label className="block mb-3 text-muted text-sm font-medium">
        {t("firma.label")}
      </label>

      <div
        ref={containerRef}
        className="w-full min-w-0 rounded-xl border border-border bg-white overflow-hidden touch-none"
      >
        <canvas
          ref={canvasRef}
          id={`${idPrefix}-canvas`}
          className="block w-full cursor-crosshair touch-none"
          aria-label={t("firma.canvasAria")}
        />
      </div>

      <p className="text-xs text-muted mt-2">
        {t("firma.hint")}
      </p>

      <FormFeedback
        error={error}
        success={success}
        loading={loading}
        loadingMessage={t("firma.loadingMessage")}
        className="mt-3 space-y-2"
      />

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
        <button
          type="button"
          onClick={handleClear}
          disabled={loading}
          className="btn-secondary flex-1 sm:flex-none disabled:opacity-50"
        >
          {t("firma.clear")}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="btn-primary flex-1 sm:flex-none disabled:opacity-50"
        >
          {loading ? t("firma.saving") : t("firma.save")}
        </button>
      </div>
    </div>
  );
}
