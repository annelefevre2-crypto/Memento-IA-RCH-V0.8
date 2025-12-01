// ======================================================
// qrReaderFile.js — Lecture d'un QR Code depuis un fichier
// ------------------------------------------------------
// - Utilise QrScanner (global) pour lire l'image
// - Passe le texte décodé à decodeFiche
// - Renvoie la fiche JSON
// ======================================================

import { decodeFiche } from "./compression.js";

export async function readQrFromFile(file) {
  if (!file) {
    throw new Error("Aucun fichier fourni.");
  }

  if (!window.QrScanner) {
    throw new Error(
      "QrScanner n'est pas chargé. Vérifie l'import dans index.html."
    );
  }

  const imgUrl = URL.createObjectURL(file);

  try {
    // QrScanner.scanImage accepte une URL ou un objet Image/Video
    const text = await window.QrScanner.scanImage(imgUrl, {
      returnDetailedScanResult: false,
    });

    if (!text) {
      throw new Error("Aucune donnée texte trouvée dans le QR.");
    }

    // Décodage fiche (wrapper JSON ou Base64 nu)
    const fiche = decodeFiche(text);

    return fiche;
  } catch (e) {
    throw new Error("Impossible de lire le QR : " + (e.message || e));
  } finally {
    URL.revokeObjectURL(imgUrl);
  }
}
