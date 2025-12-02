// ======================================================
// jsonSchema.js — Compactage JSON extrême
// ======================================================

// Table de compactage
const MAP = {
  meta: "m",
  version: "v",
  titre: "T",

  prompt: "p",
  base: "b",
  variables: "V",

  id: "i",
  label: "l",
  type: "t"
};

// Table inverse (pour reconstruction)
const REVERSE = Object.fromEntries(
  Object.entries(MAP).map(([k, v]) => [v, k])
);

// ------------------------------------------------------
// Compactage récursif
// ------------------------------------------------------
export function toCompact(obj) {
  if (Array.isArray(obj)) {
    return obj.map(toCompact);
  }

  if (obj && typeof obj === "object") {
    const result = {};
    for (const key in obj) {
      const compactKey = MAP[key] || key;
      result[compactKey] = toCompact(obj[key]);
    }
    return result;
  }

  return obj;
}

// ------------------------------------------------------
// Décompactage récursif
// ------------------------------------------------------
export function fromCompact(obj) {
  if (Array.isArray(obj)) {
    return obj.map(fromCompact);
  }

  if (obj && typeof obj === "object") {
    const result = {};
    for (const key in obj) {
      const fullKey = REVERSE[key] || key;
      result[fullKey] = fromCompact(obj[key]);
    }
    return result;
  }

  return obj;
}

// ------------------------------------------------------
// Validation (optionnel - tu peux étendre)
// ------------------------------------------------------
export function validateFiche(fiche) {
  // Ici, à personnaliser selon ton schéma.
  return true;
}
