// ======================================================
// compression.js — Encodage / décodage des fiches
// ------------------------------------------------------
// - Minimisation des clés via toCompact/fromCompact
// - JSON.stringify compact
// - Compression pako.deflate (Uint8Array)
// - Encodage Base64
// - Wrapper { z: "p1", d: "<base64>" }
// ======================================================

import { toCompact, fromCompact } from "./jsonSchema.js";

const WRAPPER_VERSION = "p1";
const MAX_JSON_CHARS = 4000;

// ------------------------------------------------------
// Helpers Base64 <-> Uint8Array
// ------------------------------------------------------
function uint8ToBase64(u8) {
  let binary = "";
  const len = u8.length;

  // On découpe pour éviter les dépassements de pile
  const chunkSize = 0x8000;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = u8.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function base64ToUint8(b64) {
  const binary = atob(b64);
  const len = binary.length;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    u8[i] = binary.charCodeAt(i);
  }
  return u8;
}

// ------------------------------------------------------
// encodeFiche(fiche)
// -> renvoie un objet { wrapper, wrapperString, stats }
// wrapperString est ce qu'on injecte dans le QR
// ------------------------------------------------------
export function encodeFiche(fiche) {
  if (!window.pako) {
    throw ne
