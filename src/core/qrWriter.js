// ======================================================
// qrWriter.js — QR dynamique haute fiabilité
// ======================================================

import { encodeFiche } from "./compression.js";

function computeQrSize(len) {
  if (len < 2000) return 600;
  if (len < 3500) return 700;
  if (len < 5000) return 900;
  if (len < 6500) return 1100;
  return 1300; // extrême
}

export function generateQrForFiche(fiche, containerId) {
  const enc = encodeFiche(fiche);
  const wrapperString = enc.wrapperString;

  const container = document.getElementById(containerId);
  if (!container) throw new Error("Container QR introuvable.");

  container.innerHTML = "";

  const size = computeQrSize(wrapperString.length);

  new QRCode(container, {
    text: wrapperString,
    width: size,
    height: size,
    correctLevel: QRCode.CorrectLevel.M
  });

  return { size };
}
