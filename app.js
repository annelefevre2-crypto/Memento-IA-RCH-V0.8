// ================================================================
// Imports modules
// ================================================================
import { validateFiche } from "./src/core/jsonSchema.js";
import { buildVariablesUI, getValues, generatePrompt } from "./src/core/variables.js";
import { encodeFiche, decodeFiche } from "./src/core/compression.js";
import { generateQrForFiche } from "./src/core/qrWriter.js";
import { readQrFromFile } from "./src/core/qrReaderFile.js";
import { compactFiche, encodeFiche } from "./src/core/compression.js";

function computeQrFeasibility(fiche) {
  const compact = compactFiche(fiche);
  const json = JSON.stringify(compact);
  const deflated = pako.deflate(json);
  const base64 = btoa(String.fromCharCode(...deflated));

  const finalLength = ("1:" + base64).length;

  return {
    compactSize: json.length,
    compressedSize: deflated.length,
    qrPayload: finalLength,
    fitsInSingleQR: finalLength <= 1800
  };
}


// ================================================================
// Exposition console pour tests
// ================================================================
window.encodeFiche = encodeFiche;
window.decodeFiche = decodeFiche;
window.generateQrForFiche = generateQrForFiche;
window.readQrFromFile = readQrFromFile;   // ⚠️ AJOUT OBLIGATOIRE

// ================================================================
// DOMContentLoaded
// ================================================================
document.addEventListener("DOMContentLoaded", () => {

  const logBox = document.getElementById("log");
  const outputBox = document.getElementById("output");

  function log(msg) {
    logBox.textContent += msg + "\n";
  }

  // ------------------------------------------------------------
  // 1) Charger + valider la fiche JSON
  // ------------------------------------------------------------
  document.getElementById("btnLoad").addEventListener("click", () => {
    logBox.textContent = "";
    outputBox.textContent = "";

    let raw = document.getElementById("jsonInput").value.trim();
    if (!raw) {
      log("❌ Erreur : aucun JSON fourni.");
      return;
    }

    let fiche = null;

    try {
      fiche = JSON.parse(raw);
    } catch (e) {
      log("❌ JSON invalide : " + e.message);
      return;
    }

    try {
      validateFiche(fiche);
      log("✔ Fiche JSON valide !");
    } catch (e) {
      log("❌ Erreur validation : " + e.message);
      return;
    }
    
    const diag = computeQrFeasibility(fiche);
log(`Taille JSON compacté : ${diag.compactSize} caractères`);
log(`Taille après DEFLATE : ${diag.compressedSize} bytes`);
log(`Payload final QR : ${diag.qrPayload} caractères`);
log(`→ QR unique possible : ${diag.fitsInSingleQR ? "✔ OUI" : "❌ NON (fragmentation requise)"}`);


    const container = document.getElementById("formContainer");
    buildVariablesUI(container, fiche);

    window.currentFiche = fiche;
  });

  // ------------------------------------------------------------
  // 2) Lire les valeurs
  // ------------------------------------------------------------
  document.getElementById("btnValues").addEventListener("click", () => {
    outputBox.textContent = "";

    const fiche = window.currentFiche;
    if (!fiche) {
      outputBox.textContent = "❌ Aucune fiche chargée.";
      return;
    }

    try {
      const vals = getValues(fiche);
      outputBox.textContent = "✔ Valeurs saisies :\n" + JSON.stringify(vals, null, 2);
    } catch (e) {
      outputBox.textContent = "❌ Erreur : " + e.message;
    }
  });

  // ------------------------------------------------------------
  // 3) Générer le prompt final
  // ------------------------------------------------------------
  document.getElementById("btnPrompt").addEventListener("click", () => {
    outputBox.textContent = "";

    const fiche = window.currentFiche;
    if (!fiche) {
      outputBox.textContent = "❌ Aucune fiche chargée.";
      return;
    }

    try {
      const vals = getValues(fiche);
      const prompt = generatePrompt(fiche, vals);
      outputBox.textContent = "✔ Prompt généré :\n\n" + prompt;
    } catch (e) {
      outputBox.textContent = "❌ Erreur : " + e.message;
    }
  });

  // ------------------------------------------------------------
  // 4) Générer QR Code
  // ------------------------------------------------------------
  document.getElementById("btnMakeQR").addEventListener("click", () => {
    const fiche = window.currentFiche;
    if (!fiche) {
      alert("Aucune fiche chargée !");
      return;
    }

    try {
      generateQrForFiche(fiche, "qrContainer");
    } catch (e) {
      console.error("Erreur QR :", e);
      alert("Erreur pendant la génération du QR : " + e.message);
    }
  });

  // ------------------------------------------------------------
  // 5) Lecture QR via fichier
  // ------------------------------------------------------------
  const qrInput = document.getElementById("qrFileInput");
  const qrOutput = document.getElementById("qrFileResult");

  console.log("qrFileInput trouvé :", qrInput); // DEBUG

  if (qrInput) {
    console.log("Installation du listener change…");
    qrInput.addEventListener("change", async (ev) => {
      console.log("Listener activé !");
      const file = ev.target.files[0];
      if (!file) return;

      qrOutput.textContent = "Lecture en cours…";

      try {
        const fiche = await readQrFromFile(file);
        qrOutput.textContent = "✔ QR décodé :\n\n" + JSON.stringify(fiche, null, 2);
        window.lastDecodedFiche = fiche;
      } catch (err) {
        console.error(err);
        qrOutput.textContent = "❌ Erreur : " + (err.message || err);
      }
    });
  }
});
