"use client";

import { useEffect, useState } from "react";
import { BrandTitle } from "@/components/brand-title";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true)
  );
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    setIsStandalone(isStandaloneMode());
    setIsIos(isIosDevice());

    const dismissedKey = "preventivpro-pwa-install-dismissed";
    if (sessionStorage.getItem(dismissedKey) === "1") {
      setDismissed(true);
    }

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function onAppInstalled() {
      setDeferredPrompt(null);
      setIsStandalone(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem("preventivpro-pwa-install-dismissed", "1");
  }

  const showAndroidPrompt = Boolean(deferredPrompt);
  const showIosPrompt = isIos && !isStandalone;

  if (isStandalone || dismissed || (!showAndroidPrompt && !showIosPrompt)) {
    return null;
  }

  return (
    <div
      className="fixed bottom-20 md:bottom-4 left-4 right-4 z-40 mx-auto max-w-lg card p-4 shadow-2xl shadow-black/40 md:left-auto md:right-6"
      role="region"
      aria-label="Installa app"
    >
      <p className="text-sm text-muted mb-3">
        Installa <BrandTitle size="sm" className="inline" />{" "}
        {showIosPrompt
          ? "sul tuo iPhone: tocca Condividi e poi «Aggiungi a Home»."
          : "sul telefono per un accesso rapido, anche offline."}
      </p>
      <div className="flex gap-2">
        {showAndroidPrompt ? (
          <button
            type="button"
            onClick={handleInstall}
            className="flex-1 btn-primary text-sm py-2.5"
          >
            Installa app
          </button>
        ) : (
          <p className="flex-1 text-xs text-muted self-center">
            Safari → Condividi → Aggiungi a Home
          </p>
        )}
        <button
          type="button"
          onClick={handleDismiss}
          className="btn-secondary text-sm py-2.5 shrink-0"
        >
          Dopo
        </button>
      </div>
    </div>
  );
}
