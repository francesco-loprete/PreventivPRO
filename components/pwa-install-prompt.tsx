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
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-lg rounded-2xl border border-gray-800 bg-[#1a1a1a] p-4 shadow-2xl md:left-auto md:right-6"
      role="region"
      aria-label="Installa app"
    >
      <p className="text-sm text-gray-300 mb-3">
        Installa <span className="text-green-500 font-semibold">PreventivPRO</span>{" "}
        sul telefono per un accesso rapido, anche offline.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="flex-1 bg-green-500 text-black px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-green-400"
        >
          Installa app
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="px-4 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm hover:border-gray-600"
        >
          Dopo
        </button>
      </div>
    </div>
  );
}
