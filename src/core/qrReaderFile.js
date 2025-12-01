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

  // Décompression JSON
  const compressed = JSON.parse(result.data);
  const fiche = decodeFiche(compressed);

  return fiche;
}
