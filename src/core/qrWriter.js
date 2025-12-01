import { encodeFiche } from "./compression.js";

// ===================================================================
// qrWriter.js — Générateur de QR Codes (mono ou multi-parties)
// ===================================================================

// Taille max de payload par QR (hors en-tête multi)
const MAX_CHARS_PER_QR = 800;

// ------------------------
// Taille visuelle du QR
// ------------------------
function computeQrSize(len) {
  if (len < 200) return 180;
  if (len < 500) return 220;
  if (len < 1200) return 260;
  if (len < 2000) return 320;
  return 380;
}

// ------------------------
// Niveau ECC dynamique
// ------------------------
function computeECC(len) {
  if (len < 500) return "M";   // peu dense
  if (len < 1200) return "Q"; // compromis
  return "H";                 // gros fragments
}

// ------------------------
// Fragmentation de la chaîne encodée
// ------------------------
function buildQrPayloadsForFiche(fiche, maxCharsPerQr = MAX_CHARS_PER_QR) {
  const encoded = encodeFiche(fiche); // "1:<base64>"

  // Cas simple : un seul QR
  if (encoded.length <= maxCharsPerQr) {
    return [encoded];
  }

  // Cas multi-parties
  const id = Math.random().toString(36).slice(2, 6); // identifiant court
  const total = Math.ceil(encoded.length / maxCharsPerQr);
  const payloads = [];

  for (let index = 0; index < total; index++) {
    const start = index * maxCharsPerQr;
    const end = start + maxCharsPerQr;
    const chunk = encoded.slice(start, end);

    // Format : 1m:<id>:<total>:<index>:<chunk>
    const multiPayload = `1m:${id}:${total}:${index}:${chunk}`;
    payloads.push(multiPayload);
  }

  return payloads;
}

// ===================================================================
// Fonction principale : génère 1 ou N QR dans un conteneur
// ===================================================================
export function generateQrForFiche(fiche, containerId) {
  if (!fiche) throw new Error("Aucune fiche fournie à generateQrForFiche()");
  if (!containerId) throw new Error("containerId manquant");

  const container = document.getElementById(containerId);
  if (!container) throw new Error(`Impossible de trouver ${containerId}`);

  container.innerHTML = ""; // reset

  // Construire les payloads (mono ou multi)
  const payloads = buildQrPayloadsForFiche(fiche);

  // Mono-QR : comportement identique à avant
  if (payloads.length === 1) {
    const payload = payloads[0];
    const qrSize = computeQrSize(payload.length);
    const ecc = computeECC(payload.length);

    new QRCode(container, {
      text: payload,
      width: qrSize,
      height: qrSize,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel[ecc]
    });

    return;
  }

  // Multi-QR : générer une "planche" de QR
  const total = payloads.length;

  const wrapper = document.createElement("div");
  wrapper.style.display = "grid";
  wrapper.style.gridTemplateColumns = "repeat(auto-fit, minmax(160px, 1fr))";
  wrapper.style.gap = "12px";

  payloads.forEach((payload, idx) => {
    const cell = document.createElement("div");
    cell.style.display = "flex";
    cell.style.flexDirection = "column";
    cell.style.alignItems = "center";
    cell.style.justifyContent = "center";

    const qrDiv = document.createElement("div");

    const qrSize = computeQrSize(payload.length);
    const ecc = computeECC(payload.length);

    new QRCode(qrDiv, {
      text: payload,
      width: qrSize,
      height: qrSize,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel[ecc]
    });

    const label = document.createElement("div");
    label.textContent = `Partie ${idx + 1} / ${total}`;
    label.style.marginTop = "4px";
    label.style.fontSize = "12px";

    cell.appendChild(qrDiv);
    cell.appendChild(label);
    wrapper.appendChild(cell);
  });

  container.appendChild(wrapper);
}
