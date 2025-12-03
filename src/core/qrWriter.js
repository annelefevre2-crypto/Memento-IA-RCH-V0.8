// ======================================================
// qrWriter.js — Générateur de QR Codes pour fiches compressées
// Version améliorée : QR min 600x600 + adaptation dynamique
// ======================================================

import { encodeFiche } from "./compression.js";

// Taille minimale obligatoire (pour QR longs)
const MIN_QR_SIZE = 600;

// Taille dynamique : plus le wrapper est long, plus on augmente
function computeQrSize(payloadLength) {
  // base minimum
  let size = MIN_QR_SIZE;

  // QR très long : augmenter encore
  if (payloadLength > 3500) size = 700;
  if (payloadLength > 4500) size = 800;

  return size;
}

// ------------------------------------------------------
// Génération QR
// ------------------------------------------------------
export function generateQrForFiche(fiche, containerId) {
  const enc = encodeFiche(fiche);
  const wrapperString = enc.wrapperString;

  const container = document.getElementById(containerId);
  if (!container) throw new Error("Container QR introuvable : " + containerId);

  // Nettoyage précédent
  container.innerHTML = "";

  const qrSize = computeQrSize(wrapperString.length);
  console.log("📐 Taille QR choisie :", qrSize, "px");

  // Création du QR Code haute définition
  const qr = new QRCode(container, {
    text: wrapperString,
    width: qrSize,
    height: qrSize,
    correctLevel: QRCode.CorrectLevel.M  // M = meilleur équilibre
  });

  return {
    encoded: enc,
    qrSize
  };
}
