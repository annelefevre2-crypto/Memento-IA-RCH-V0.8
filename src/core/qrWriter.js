// ======================================================
// qrWriter.js — Génération correcte d’un QR sans texte parasite
// ======================================================

import { encodeFiche } from "./compression.js";

export function generateQrForFiche(fiche, containerId) {
  const container = document.getElementById(containerId);
  if (!container) throw new Error("Container QR introuvable");

  // Nettoyer l'ancien QR
  container.innerHTML = "";

  // Encodage fiche → wrapper JSON compressé
  const { wrapperString, stats } = encodeFiche(fiche);

  console.log("[QR] Stats encodage :", stats);

  // Taille dynamique
  let size = 256;
  if (stats.wrapperLength > 250) size = 320;
  if (stats.wrapperLength > 400) size = 384;
  if (stats.wrapperLength > 600) size = 448;

  console.log("[QR] Taille sélectionnée :", size);

  // Génération du QR (canvas only)
  const qr = new QRCode(container, {
    text: wrapperString,
    width: size,
    height: size,
    correctLevel: QRCode.CorrectLevel.M  // ECC M recommandé
  });

  // SUPPRIMER LE TEXTE AUTO-GÉNÉRÉ
  // qrcode.js crée parfois un <div> contenant le texte !
  // On le supprime explicitement :
  const possibleText = container.querySelector("div");
  if (possibleText) {
    possibleText.remove();
  }
}
