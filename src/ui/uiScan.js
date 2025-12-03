// ======================================================
// uiScan.js — écoute événement caméra unifiée
// ======================================================

import { decodeFiche } from "../core/compression.js";

window.addEventListener("qr-text-found", (ev) => {
  try {
    const fiche = decodeFiche(ev.detail);
    onFicheDecoded(fiche);
  } catch (e) {
    alert("QR invalide : " + e.message);
  }
});
