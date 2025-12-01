import { decodeFiche } from "./compression.js";

export async function readQrFromFile(file) {
  if (!(file instanceof File)) {
    throw new Error("Le fichier fourni n'est pas un objet File.");
  }

  if (!window.QrScanner) {
    throw new Error("QrScanner n'est pas chargé.");
  }

  // Convertir le fichier en URL d'image (méthode la plus stable)
  const imageUrl = URL.createObjectURL(file);

  let result;
  try {
    result = await window.QrScanner.scanImage(imageUrl, {
      returnDetailedScanResult: true
    });
  } catch (err) {
    console.error("⚠️ Erreur scanImage :", err);
    throw new Error("Impossible de lire le QR dans cette image.");
  }

  if (!result?.data) {
    throw new Error("Aucun QR détecté dans l'image.");
  }

  // Décompression et décodage
  let compressed;
  try {
    compressed = JSON.parse(result.data);
  } catch (err) {
    console.error("⚠️ JSON du QR illisible :", result.data);
    throw new Error("Les données du QR ne sont pas un JSON valide.");
  }

  try {
    return decodeFiche(compressed);
  } catch (err) {
    console.error("⚠️ Erreur lors de decodeFiche :", err);
    throw new Error("Échec de la décompression de la fiche.");
  }
}
