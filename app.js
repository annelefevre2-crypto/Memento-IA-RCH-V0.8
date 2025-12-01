// ================================================================
// Imports modules
// ================================================================
import { validateFiche } from "./src/core/jsonSchema.js";
import { buildVariablesUI, getValues, generatePrompt } from "./src/core/variables.js";
import { encodeFiche, decodeFiche } from "./src/core/compression.js";
import { generateQrForFiche } from "./src/core/qrWriter.js";
import { readQrFromFile } from "./src/core/qrReaderFile.js";


// ================================================================
// DOMContentLoaded — tout le code est initialisé ici
// ================================================================
document.addEventListener("DOMContentLoaded", () => {

  const logBox = document.getElementById("log");
  const outputBox = document.getElementById("output");

  function log(msg) {
    logBox.textContent += msg + "\n";
  }

  // ================================================================
  // 1) Charger + valider la fiche JSON
  // ================================================================
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

    // Construction du formulaire variables
    const container = document.getElementById("formContainer");
    buildVariablesUI(container, fiche);

    window.currentFiche = fiche;
  });


  // ================================================================
  // 2) Lire les valeurs du formulaire
  // ================================================================
  document.getElementById("btnValues").addEventListener("click", () => {
    outputBox.textContent = "";

    const fiche = window.currentFiche;
    if (!fiche) {
      outputBox.textContent = "❌ Aucune fiche chargée.";
      return;
    }

    try {
      const vals = getValues(fiche);
      outputBox.textContent =
        "✔ Valeurs saisies :\n" + JSON.stringify(vals, null, 2);
    } catch (e) {
      outputBox.textContent = "❌ Erreur : " + e.message;
    }
  });


  // ================================================================
  // 3) Générer le prompt final
  // ================================================================
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


  // ================================================================
  // 4) Générer le QR CODE (module QRWriter)
  // ================================================================
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


  // ================================================================
  // 5) Lecture QR via fichier image (Module A)
  // ================================================================
  const qrInput = document.getElementById("qrFileInput");
  const qrOutput = document.getElementById("qrFileResult");

  if (qrInput) {
    qrInput.addEventListener("change", async (ev) => {
      const file = ev.target.files[0];
      if (!file) return;

      qrOutput.textContent = "Lecture en cours…";

      try {
        const fiche = await readQrFromFile(file);

        qrOutput.textContent =
          "✔ QR décodé :\n\n" + JSON.stringify(fiche, null, 2);

        // Option : stocker la fiche décodée
        window.lastDecodedFiche = fiche;

      } catch (err) {
        qrOutput.textContent = "❌ Erreur : " + err.message;
      }
    });
  }

}); // fin DOMContentLoaded
