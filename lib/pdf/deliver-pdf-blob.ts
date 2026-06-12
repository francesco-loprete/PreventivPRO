import { isCapacitorIos } from "@/lib/capacitor/platform";

function sanitizeFilesystemFilename(filename: string): string {
  return filename.replace(/[/\\?%*:|"<>]/g, "-");
}

async function blobToBase64Data(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        reject(new Error("Lettura PDF fallita"));
        return;
      }

      const commaIndex = dataUrl.indexOf(",");
      resolve(commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl);
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("Lettura PDF fallita"));
    reader.readAsDataURL(blob);
  });
}

async function deliverPdfOnCapacitorIos(
  blob: Blob,
  filename: string
): Promise<void> {
  const { Filesystem, Directory } = await import("@capacitor/filesystem");
  const { Share } = await import("@capacitor/share");
  const { FileOpener } = await import("@capacitor-community/file-opener");

  const safeName = sanitizeFilesystemFilename(filename);
  const base64 = await blobToBase64Data(blob);

  const { uri } = await Filesystem.writeFile({
    path: safeName,
    data: base64,
    directory: Directory.Cache,
  });

  try {
    await FileOpener.open({
      filePath: uri,
      contentType: "application/pdf",
      openWithDefault: true,
    });
    return;
  } catch {
    // Quick Look unavailable: fall back to the native iOS share sheet.
  }

  await Share.share({
    title: safeName,
    files: [uri],
  });
}

export function downloadPdfBlobOnWeb(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function deliverPdfBlob(blob: Blob, filename: string): Promise<void> {
  if (isCapacitorIos()) {
    await deliverPdfOnCapacitorIos(blob, filename);
    return;
  }

  downloadPdfBlobOnWeb(blob, filename);
}
