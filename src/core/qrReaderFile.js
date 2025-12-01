import { decodeFiche } from "./compression.js";

// ================================================================
// qrReaderFile.js — Lecture QR via image (upload fichier)
// ================================================================

/**
 * Lit un QR code depuis un fichier image
 * @param {File} file - fichier image fourni par l'utilisateur
 * @returns {Promise<object>} fiche JSON décompressée
 */
export async function readQrFromFile(file) {
  if (!file) throw new Error("Aucun fichier image fourni.");

  // Vérification QrScanner global
  if (!window.QrScanner) {
    throw new Error("QrScanner n'est pas chargé.");
  }

  const result = await window.QrScanner.scanImage(file, {
    returnDetailedScanResult: true
  });

  const rawText = result?.data;
  if (!rawText) throw new Error("QR code introuvable dans l’image.");

  // RAW = JSON compressé → décompression + reconstruction
  const parsed = JSON.parse(rawText);
  const fiche = decodeFiche(parsed);

  return fiche;
}
