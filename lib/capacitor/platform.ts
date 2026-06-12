import { Capacitor } from "@capacitor/core";

export function isCapacitorIos(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
}
