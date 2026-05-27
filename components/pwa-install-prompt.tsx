"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as Navigator & { standalone?: boolean }).standalone ===
          true);

    setIsStandalone(standalone);

    const dismissedKey = "preventivpro-pwa-install-dismissed";
    if (sessionStorage.getItem(dismissedKey) === "1") {
      setDismissed(true);
    }

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
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

  if (isStandalone || dismissed || !deferredPrompt) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-lg card p-4 shadow-2xl shadow-black/40 md:left-auto md:right-6"
      role="region"
      aria-label="Installa app"
    >
      <p className="text-sm text-muted mb-3">
        Installa{" "}
        <span className="font-semibold">
          <span className="text-foreground">Preventiv</span>
          <span className="text-accent">PRO</span>
        </span>{" "}
        sul telefono per un accesso rapido, anche offline.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="flex-1 btn-primary text-sm py-2.5"
        >
          Installa app
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="btn-secondary text-sm py-2.5"
        >
          Dopo
        </button>
      </div>
    </div>
  );
}
