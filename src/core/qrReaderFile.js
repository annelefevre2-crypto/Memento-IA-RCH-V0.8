import { decodeFiche } from "./compression.js";

export async function readQrFromFile(file) {
  if (!(file instanceof File)) {
    throw new Error("Le fichier fourni n'est pas un objet File.");
  }

  if (!window.QrScanner) {
    throw new Error("QrScanner n'est pas disponible.");
  }

  // Lecture brute du QR
  const result = await window.QrScanner.scanImage(file, {
    returnDetailedScanResult: true
  });

  if (!result?.data) {
    throw new Error("Aucun QR détecté dans l'image.");
  }

  const raw = (result.data || "").trim();
  console.log("RAW DATA DU QR :", raw);

  // 🔥 IMPORTANT : On NE PARSE PAS.
  // Le texte commence par "1:" ou "1m:", cela doit aller DIRECTEMENT dans decodeFiche()
  try {
    const fiche = decodeFiche(raw);
    console.log("Fiche décodée :", fiche);
    return fiche;
  } catch (e) {
    console.error("Erreur decodeFiche :", e);
    throw new Error("Le QR contient des données compressées invalides.");
  }
}
