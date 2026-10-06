// Image formats Satori (next/og) can render, detected by magic bytes
const detectImageType = (bytes: Uint8Array): string | null => {
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e) {
    return "image/png";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return "image/gif";
  }
  const head = new TextDecoder().decode(bytes.slice(0, 512));
  if (head.includes("<svg")) return "image/svg+xml";
  return null;
};

const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
};

/**
 * Fetches the first candidate URL that returns an image Satori can render and
 * returns it as a data URL. Passing a remote URL straight to <img> lets a slow
 * or broken host (e.g. an IPFS gateway returning an HTML error page) fail the
 * whole ImageResponse with "Unsupported image type".
 */
export const loadOGImage = async (
  candidates: (string | undefined)[],
  timeoutMs = 5000,
): Promise<string | undefined> => {
  for (const url of new Set(candidates.filter(Boolean) as string[])) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (!res.ok) continue;
      const bytes = new Uint8Array(await res.arrayBuffer());
      const type = detectImageType(bytes);
      if (type) return `data:${type};base64,${toBase64(bytes)}`;
    } catch {
      // Timeout or network error — try the next candidate
    }
  }
  return undefined;
};
