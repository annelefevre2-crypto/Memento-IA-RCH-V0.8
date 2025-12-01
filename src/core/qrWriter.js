import { encodeFiche } from "./compression.js";

// ===================================================================
// qrWriter.js — Générateur de QR Code dynamique pour Mémento IA – RCH
// ===================================================================

// Définir une taille dynamique en fonction de la longueur de la data
function computeQrSize(len) {
  if (len < 200) return 180;
  if (len < 500) return 220;
  if (len < 1500) return 260;
  if (len < 3000) return 320;
  return 380; // maximum pour garder lisible
}

// Déterminer ECC automatiquement
function computeECC(len) {
  if (len < 500) return "H";   // très robuste
  if (len < 1500) return "Q";
  if (len < 2500) return "M";
  return "L"; // nécessaire quand dataset est long
}

// ===================================================================
// Fonction principale : Générer un QR
// ===================================================================
export function generateQrForFiche(fiche, containerId) {
  if (!fiche) throw new Error("Aucune fiche fournie à generateQrForFiche()");
  if (!containerId) throw new Error("containerId manquant");

  const container = document.getElementById(containerId);
  if (!container) throw new Error(`Impossible de trouver ${containerId}`);

  container.innerHTML = ""; // reset

  // Étape 1 : compression
  const encoded = encodeFiche(fiche);
  const payload = JSON.stringify(encoded);
  
  // Étape 2 : taille + ECC adaptées
  const qrSize = computeQrSize(payload.length);
  const ecc = computeECC(payload.length);

  // Étape 3 : génération du QR
  const qr = new QRCode(container, {
    text: payload,
    width: qrSize,
    height: qrSize,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel[ecc] // L/M/Q/H
  });

  return qr;
}
