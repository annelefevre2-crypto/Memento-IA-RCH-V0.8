// ======================================================
// compression.js — Compression DEFLATE + Base64 (format compact)
// Format unique : "1:<base64>"
// ======================================================
export function compactFiche(fiche) {
  return {
    v: fiche.v || "1.0",
    c: fiche.category,
    m: {
      t: fiche.meta?.title,
      a: fiche.meta?.author,
      c: fiche.meta?.created
    },
    p: {
      b: fiche.prompt?.base,
      v: fiche.prompt?.variables
    },
    ai: fiche.ai
  };
}

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
const compact = compactFiche(fiche);
const json = JSON.stringify(compact);


  // DEFLATE
  const deflated = pako.deflate(jsonStr, { level: 9 });

  // Uint8Array -> string binaire -> Base64
  const base64 = btoa(
    String.fromCharCode.apply(null, deflated)
  );

  // Format compact version 1
  return "1:" + base64;
}

// ------------------------------------------------------
// 2. Décompression : "1:<base64>" -> fiche JSON
// ------------------------------------------------------
export function decodeFiche(payload) {
  ensurePako();

  if (typeof payload !== "string") {
    throw new Error("Payload de type invalide (string attendu).");
  }

  if (!payload.startsWith("1:")) {
    throw new Error("Format de payload inconnu (préfixe '1:' attendu).");
  }

  const base64 = payload.slice(2);

  // Base64 -> string binaire -> tableau d'octets
  const binary = atob(base64)
    .split("")
    .map(c => c.charCodeAt(0));

  // Inflate vers string JSON
  const inflated = pako.inflate(new Uint8Array(binary), { to: "string" });

  return JSON.parse(inflated);
}
