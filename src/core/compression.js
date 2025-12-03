// ======================================================
// compression.js — Version optimisée pako + Base64
// ======================================================

import { toCompact, fromCompact } from "./jsonSchema.js";

const WRAPPER_VERSION = "p1";
const MAX_JSON_CHARS = 5000;

// ------------------------------------------------------
// Helpers Base64 <-> Uint8Array (optimisés)
// ------------------------------------------------------
function uint8ToBase64(u8) {
  // encode en blocs pour éviter les stacks overflow
  let binary = "";
  const CHUNK = 0x8000;

  for (let i = 0; i < u8.length; i += CHUNK) {
    binary += String.fromCharCode.apply(
      null,
      u8.subarray(i, i + CHUNK)
    );
  }
  return btoa(binary);
}

function base64ToUint8(b64) {
  const binary = atob(b64);
  const len = binary.length;
  const out = new Uint8Array(len);

  for (let i = 0; i < len; i++) out[i] = binary.charCodeAt(i);
  return out;
}

// ------------------------------------------------------
// Encodage Fiche → Wrapper compressé
// ------------------------------------------------------
export function encodeFiche(fiche) {
  if (!window.pako) throw new Error("pako n'est pas chargé");

  // 1) JSON compact (structure minimale)
  const jsonString = JSON.stringify(toCompact(fiche));

  if (jsonString.length > MAX_JSON_CHARS) {
    throw new Error(`JSON trop long (${jsonString.length}) > ${MAX_JSON_CHARS}`);
  }

  // 2) UTF-8 + Compression + Base64
  const utf8 = new TextEncoder().encode(jsonString);
  const compressed = window.pako.deflate(utf8, { level: 9 }); // meilleure compression
  const b64 = uint8ToBase64(compressed);

  const wrapper = { z: WRAPPER_VERSION, d: b64 };

  return {
    wrapper,
    wrapperString: JSON.stringify(wrapper),
    stats: {
      jsonLength: jsonString.length,
      deflated: compressed.length,
      base64: b64.length
    }
  };
}

// ------------------------------------------------------
// Normalisation du wrapper (sécurisé + simplifié)
// ------------------------------------------------------
function normaliseWrapper(raw) {
  if (!raw) throw new Error("QR vide");

  // Cas : déjà un objet
  if (typeof raw === "object") {
    if (!raw.d) throw new Error("Wrapper JSON invalide : champ 'd' manquant");
    return raw;
  }

  // Cas : string
  if (typeof raw !== "string") throw new Error("QR non reconnu");

  const t = raw.trim();

  // On tente JSON
  try {
    const parsed = JSON.parse(t);
    if (parsed?.d) return parsed;
  } catch (_) {}

  // Cas legacy : le QR contient directement la base64
  return { z: "legacy", d: t };
}

// ------------------------------------------------------
// Décodage Wrapper → fiche JSON reconstruite
// ------------------------------------------------------
export function decodeFiche(raw) {
  if (!window.pako) throw new Error("pako n'est pas chargé");

  const wrapper = normaliseWrapper(raw);

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
