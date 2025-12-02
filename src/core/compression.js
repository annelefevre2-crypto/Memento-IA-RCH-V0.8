// ======================================================
// compression.js — Encodage / décodage des fiches
// ======================================================

import { toCompact, fromCompact } from "./jsonSchema.js";

const WRAPPER_VERSION = "p1";
const MAX_JSON_CHARS = 5000;

// ------------------------------------------------------
// Helpers Base64 <-> Uint8Array
// ------------------------------------------------------
function uint8ToBase64(u8) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < u8.length; i += chunkSize) {
    binary += String.fromCharCode(...u8.subarray(i, i + chunkSize));
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
// encodeFiche
// ------------------------------------------------------
export function encodeFiche(fiche) {
  if (!window.pako) {
    throw new Error("pako n'est pas chargé");
  }

  const compact = toCompact(fiche);
  const jsonString = JSON.stringify(compact);

  if (jsonString.length > MAX_JSON_CHARS) {
    throw new Error(`JSON trop long (${jsonString.length} chars) > ${MAX_JSON_CHARS}`);
  }

  const utf8 = new TextEncoder().encode(jsonString);
  const deflated = window.pako.deflate(utf8);
  const base64Data = uint8ToBase64(deflated);

  const wrapper = {
    z: WRAPPER_VERSION,
    d: base64Data
  };

  const wrapperString = JSON.stringify(wrapper);

  return {
    wrapper,
    wrapperString,
    stats: {
      jsonLength: jsonString.length,
      deflatedLength: deflated.length,
      base64Length: base64Data.length,
      wrapperLength: wrapperString.length
    }
  };
}

// ------------------------------------------------------
// Normalisation du wrapper
// ------------------------------------------------------
function normaliseWrapper(raw) {
  if (raw && typeof raw === "object") {
    if (!raw.d) {
      throw new Error("Wrapper JSON invalide : champ 'd' manquant");
    }
    return raw;
  }

  if (typeof raw !== "string") {
    throw new Error("QR non reconnu");
  }

  const text = raw.trim();

  try {
    const parsed = JSON.parse(text);
    if (parsed && parsed.d) return parsed;
  } catch (_) {}

  return {
    z: "legacy",
    d: text
  };
}

// ------------------------------------------------------
// decodeFiche
// ------------------------------------------------------
export function decodeFiche(raw) {
  if (!window.pako) {
    throw new Error("pako n'est pas chargé");
  }

  const wrapper = normaliseWrapper(raw);
  const deflated = base64ToUint8(wrapper.d);

  let inflated;
  try {
    inflated = window.pako.inflate(deflated);
  } catch (e) {
    throw new Error("Erreur DEFLATE : " + e.message);
  }

  const jsonString = new TextDecoder().decode(inflated);

  let obj;
  try {
    obj = JSON.parse(jsonString);
  } catch (e) {
    throw new Error("JSON décompressé invalide : " + e.message);
  }

  return fromCompact(obj);
}
