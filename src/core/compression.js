// =====================================================================
// compression.js — Module DEFLATE + Base64 pour QR Codes
// =====================================================================

function ensurePako() {
  if (typeof pako === "undefined") {
    throw new Error("Pako (DEFLATE) n'est pas chargé.");
  }
}

// =============================================================
// 1. Compression JSON → Base64
// =============================================================
export function compressJSON(obj) {
  ensurePako();

  const jsonStr = JSON.stringify(obj);
  const deflated = pako.deflate(jsonStr, { level: 9 });
  const base64 = btoa(String.fromCharCode(...deflated));

  return base64;
}

// =============================================================
// 2. Décompression Base64 → JSON
// =============================================================
export function decompressToJSON(base64) {
  ensurePako();

  const binary = atob(base64)
    .split("")
    .map(c => c.charCodeAt(0));

  const inflated = pako.inflate(new Uint8Array(binary), { to: "string" });

  return JSON.parse(inflated);
}

// =============================================================
// 3. Envelopper données compressées
// =============================================================
export function wrapCompressedData(base64) {
  return {
    z: "pako-base64-v1",
    d: base64
  };
}

// =============================================================
// 4. Extraire et décompresser
// =============================================================
export function unwrapCompressedData(wrapper) {
  if (!wrapper || wrapper.z !== "pako-base64-v1") {
    throw new Error("Format compressé non reconnu");
  }
  return decompressToJSON(wrapper.d);
}

// =============================================================
// 5. Encodage complet d’une fiche
// =============================================================
export function encodeFiche(json) {
  const base64 = compressJSON(json);
  return wrapCompressedData(base64);
}

// =============================================================
// 6. Décodage complet d’une fiche
// =============================================================
export function decodeFiche(wrapper) {
  return unwrapCompressedData(wrapper);
}

// =============================================================
// 7. Débogage console
// =============================================================
if (typeof window !== "undefined") {
  window.encodeFiche = encodeFiche;
  window.decodeFiche = decodeFiche;
}
