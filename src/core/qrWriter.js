// ======================================================
// qrWriter.js — Génération d'un QR Code pour une fiche
// ------------------------------------------------------
// - encodeFiche(fiche) -> wrapperString compressé+Base64
// - Adaptation de la taille du QR à la longueur
// - Utilise qrcodejs (QRCode global)
// ======================================================

import { encodeFiche } from "./compression.js";

// Approximation de la taille visuelle selon la longueur
function computeQrSize(len) {
  if (len < 500) return 256;
  if (len < 1500) return 320;
  if (len < 2500) return 384;
  if (len < 3500) return 448;
  return 512; // cas très dense, on augmente pour la lisibilité
}

// ------------------------------------------------------
// generateQrForFiche(fiche, containerId = "qrContainer")
// ------------------------------------------------------
export function generateQrForFiche(fiche, containerId = "qrContainer") {
  if (typeof QRCode === "undefined") {
    throw new Error("Librairie qrcodejs (QRCode) non chargée.");
  }

  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Conteneur QR introuvable : #${containerId}`);
  }

  // On nettoie le conteneur
  container.innerHTML = "";

  // Encodage de la fiche
  const { wrapperString, stats } = encodeFiche(fiche);

  const qrSize = computeQrSize(stats.wrapperLength);

  // Pour debug en console si besoin
  console.log("[QR] Stats encodage :", stats, "Taille QR (px) :", qrSize);

  // Génération du QR
  // On encode directement wrapperString (texte JSON du wrapper)
  new QRCode(container, {
    text: wrapperString,
    width: qrSize,
    height: qrSize,
    correctLevel: QRCode.CorrectLevel.M, // compromis robustesse / densité
  });
}
