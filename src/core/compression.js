// ======================================================
// compression.js — Compression DEFLATE + Base64 (format compact)
// Format unique : "1:<base64>"
// ======================================================

// Vérification présence pako
function ensurePako() {
  if (typeof pako === "undefined") {
    throw new Error("Pako (DEFLATE) n'est pas chargé.");
  }
}

// ------------------------------------------------------
// 1. Compression : fiche JSON -> "1:<base64>"
// ------------------------------------------------------
export function encodeFiche(fiche) {
  ensurePako();

  const jsonStr = JSON.stringify(fiche);
