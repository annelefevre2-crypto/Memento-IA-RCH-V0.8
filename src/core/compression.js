// ======================================================
// compression.js — Version optimisée pako + Base64 + wrapper strict
// ======================================================

import { toCompact, fromCompact } from "./jsonSchema.js";

const WRAPPER_VERSION = "p1";
const MAX_JSON_CHARS = 5000;

// ------------------------------------------------------
// Helpers Base64 <-> Uint8Array
// ------------------------------------------------------
function uint8ToBase64(u8) {
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < u8.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, u8.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

function base64ToUint8(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ------------------------------------------------------
// Encodage
// ------------------------------------------------------
export function encodeFiche(fiche) {
  if (!window.pako) throw new Error("pako n'est pas chargé");

  const jsonString = JSON.stringify(toCompact(fiche));

  if (jsonString.length > MAX_JSON_CHARS) {
    throw new Error(`JSON trop long (${jsonString.length}) > ${MAX_JSON_CHARS}`);
  }

  const utf8 = new TextEncoder().encode(jsonString);
  const compressed = window.pako.deflate(utf8, { level: 9 });
  const b64 = uint8ToBase64(compressed);

  return {
    wrapper: { z: WRAPPER_VERSION, d: b64 },
    wrapperString: JSON.stringify({ z: WRAPPER_VERSION, d: b64 })
  };
}

// ------------------------------------------------------
// Validation stricte du wrapper
// ------------------------------------------------------
function normalizeWrapper(raw) {
  if (!raw) throw new Error("QR vide ou invalide.");

  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      throw new Error("Le QR doit contenir un wrapper JSON valide.");
    }
  }

  if (typeof raw !== "object") throw new Error("Wrapper non reconnu.");
  if (!raw.z || !raw.d) throw new Error("Wrapper invalide : champs 'z' ou 'd' manquants.");
  if (raw.z !== WRAPPER_VERSION) throw new Error(`Version wrapper '${raw.z}' non supportée.`);

  return raw;
}

// ------------------------------------------------------
// Décodage
// ------------------------------------------------------
export function decodeFiche(raw) {
  if (!window.pako) throw new Error("pako n'est pas chargé");

  const wrapper = normalizeWrapper(raw);
  const compressed = base64ToUint8(wrapper.d);

  let inflated;
  try {
    inflated = window.pako.inflate(compressed);
  } catch (e) {
    throw new Error("Erreur DEFLATE : " + e.message);
  }

  let obj;
  try {
    obj = JSON.parse(new TextDecoder().decode(inflated));
  } catch (e) {
    throw new Error("JSON décompressé invalide : " + e.message);
  }

  return fromCompact(obj);
}
