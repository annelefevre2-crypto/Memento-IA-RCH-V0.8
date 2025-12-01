import { encodeFiche } from "./compression.js";

// ===================================================================
// qrWriter.js — Générateur de QR Codes (mono ou multi-parties)
// ===================================================================

// Taille max de payload par QR (hors en-tête multi)
const MAX_CHARS_PER_QR = 800;

// ------------------------
// Taille visuelle du QR  — FIX A5
// ------------------------
// On impose des tailles beaucoup plus grandes pour lisibilité
function computeQrSize(len) {
  if (len < 200) return 300;     // min 300 px
  if (len < 500) return 400;
  if (len < 1200) return 500;
  if (len < 2000) return 600;
  return 700;                   // QR très denses → 700 px
}

// ------------------------
// Niveau ECC dynamique
// ------------------------
function computeECC(len) {
  if (len < 500) return "M";
  if (len < 1200) return "Q";
  return "H";
}

// ------------------------
// Ajout d’une bordure blanche obligatoire — FIX A5
// ------------------------
function addWhiteBorderToCanvas(canvas, border = 40) {
  const newCanvas = document.createElement("canvas");
  newCanvas.width = canvas.width + border * 2;
  newCanvas.height = canvas.height + border * 2;

  const ctx = newCanvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

  ctx.drawImage(canvas, border, border);

  return newCanvas;
}

// ------------------------
// Fragmentation de la chaîne encodée
// ------------------------
function buildQrPayloadsForFiche(fiche, maxCharsPerQr = MAX_CHARS_PER_QR) {
  const encoded = encodeFiche(fiche);

  if (encoded.length <= maxCharsPerQr) {
    return [encoded];
  }

  const id = Math.random().toString(36).slice(2, 6);
  const total = Math.ceil(encoded.length / maxCharsPerQr);
  const payloads = [];

  for (let index = 0; index < total; index++) {
    const start = index * maxCharsPerQr;
    const end = start + maxCharsPerQr;
    const chunk = encoded.slice(start, end);

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

  container.innerHTML = "";

  const payloads = buildQrPayloadsForFiche(fiche);

  // ===========================
  // Cas MONO-QR
  // ===========================
  if (payloads.length === 1) {
    const payload = payloads[0];
    const size = computeQrSize(payload.length);
    const ecc = computeECC(payload.length);

    const div = document.createElement("div");
    container.appendChild(div);

    // Génération QR brut
    new QRCode(div, {
      text: payload,
      width: size,
      height: size,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel[ecc]
    });

    // Récupération du canvas
    const rawCanvas = div.querySelector("canvas");

    // Ajout d’une large bordure blanche — FIX A5
    const borderedCanvas = addWhiteBorderToCanvas(rawCanvas, 80);

    // Remplacement du QR final
    div.innerHTML = "";
    div.appendChild(borderedCanvas);

    return;
  }

  // ===========================
  // MULTI QR
  // ===========================
  const total = payloads.length;

  const wrapper = document.createElement("div");
  wrapper.style.display = "grid";
  wrapper.style.gridTemplateColumns = "repeat(auto-fit, minmax(260px, 1fr))";
  wrapper.style.gap = "20px";

  payloads.forEach((payload, idx) => {
    const cell = document.createElement("div");
    cell.style.display = "flex";
    cell.style.flexDirection = "column";
    cell.style.alignItems = "center";

    const qrDiv = document.createElement("div");

    const size = computeQrSize(payload.length);
    const ecc = computeECC(payload.length);

    new QRCode(qrDiv, {
      text: payload,
      width: size,
      height: size,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel[ecc]
    });

    const canvas = qrDiv.querySelector("canvas");
    const borderedCanvas = addWhiteBorderToCanvas(canvas, 80);

    qrDiv.innerHTML = "";
    qrDiv.appendChild(borderedCanvas);

    const label = document.createElement("div");
    label.textContent = `Partie ${idx + 1} / ${total}`;
    label.style.marginTop = "6px";
    label.style.fontSize = "14px";

    cell.appendChild(qrDiv);
    cell.appendChild(label);

    wrapper.appendChild(cell);
  });

  container.appendChild(wrapper);
}
