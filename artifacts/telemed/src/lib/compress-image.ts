export async function compressImageToDataUrl(
  file: File,
  maxWidth = 1280,
  quality = 0.7,
): Promise<{ dataUrl: string; sizeBytes: number; mimeType: string }> {
  if (!file.type.startsWith("image/")) {
    // Pass through non-image (e.g. PDF) as base64 data url
    const buf = await file.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);
    const dataUrl = `data:${file.type || "application/octet-stream"};base64,${b64}`;
    return { dataUrl, sizeBytes: file.size, mimeType: file.type };
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  const base64 = dataUrl.split(",")[1] ?? "";
  const sizeBytes = Math.floor((base64.length * 3) / 4);
  return { dataUrl, sizeBytes, mimeType: "image/jpeg" };
}
