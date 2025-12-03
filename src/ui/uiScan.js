// ======================================================
// uiScan.js — écoute événement caméra unifiée
// ======================================================

import { decodeFiche } from "../core/compression.js";
import { fullReset } from "./uiFullReset.js";

const btnScanReset = document.getElementById("btnScanReset");
if (btnScanReset) btnScanReset.onclick = fullReset;


window.addEventListener("qr-text-found", (ev) => {
  try {
    const fiche = decodeFiche(ev.detail);
    onFicheDecoded(fiche);
  } catch (e) {
    alert("QR invalide : " + e.message);
  }
});
