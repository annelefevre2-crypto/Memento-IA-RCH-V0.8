import { decodeFiche } from "./compression.js";

export async function readQrFromFile(file) {
  if (!(file instanceof File)) {
    throw new Error("Le fichier fourni n'est pas un objet File.");
  }

  if (!window.QrScanner) {
    throw new Error("QrScanner n'est pas disponible.");
  }

  // Lecture du QR dans l'image
  const result = await window.QrScanner.scanImage(file, {
    returnDetailedScanResult: true
  });

  if (!result?.data) {
    throw new Error("Aucun QR détecté dans l'image.");
  }

  const raw = (result.data || "").trim();
  console.log("Données brutes du QR :", raw);

  // ❌ AVANT : on essayait de faire JSON.parse(raw)
  // const compressed = JSON.parse(result.data);

  // ✅ MAINTENANT : on passe directement la chaîne à decodeFiche
  //    decodeFiche sait gérer les formats "1:...." ou "1m:...."
  const fiche = decodeFiche(raw);

  console.log("Fiche décodée depuis le QR :", fiche);
  return fiche;
}
