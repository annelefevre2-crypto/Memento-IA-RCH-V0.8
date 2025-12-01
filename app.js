// ================================================================
// app.js — Version stable test moteur JSON + variables + QR
// ================================================================

// 1) Imports des modules de base
import { validateFiche } from "./src/core/jsonSchema.js";
import { buildVariablesUI, getValues, generatePrompt } from "./src/core/variables.js";
import { encodeFiche, decodeFiche } from "./src/core/compression.js";
import { generateQrForFiche } from "./src/core/qrWriter.js";
import { readQrFromFile } from "./src/core/qrReaderFile.js";

// 2) Exposition pour tests console (optionnel mais pratique)
window.encodeFiche = encodeFiche;
window.decodeFiche = decodeFiche;
window.generateQrForFiche = generateQrForFiche;

// ================================================================
// Initialisation après chargement du DOM
// ================================================================
document.addEventListener("DOMContentLoaded", () => {
  const logBox = document.getElementById("log");
  const outputBox = document.getElementById("output");

  function log(msg) {
    if (!logBox) return;
    logBox.textContent += msg + "\n";
  }

  // ------------------------------------------------------------
  // 1) Charger + valider la fiche JSON
  // ------------------------------------------------------------
  const btnLoad = document.getElementById("btnLoad");
  if (btnLoad) {
    btnLoad.addEventListener("click", () => {
      if (logBox) logBox.textContent = "";
      if (outputBox) outputBox.textContent = "";

      const input = document.getElementById("jsonInput");
      if (!input) {
        log("❌ Erreur : champ JSON introuvable.");
        return;
      }

      let raw = input.value.trim();
      if (!raw) {
        log("❌ Erreur : aucun JSON fourni.");
        return;
      }

      let fiche = null;

      // Parsing JSON
      try {
        fiche = JSON.parse(raw);
      } catch (e) {
        log("❌ JSON invalide : " + e.message);
        return;
      }

      // Validation via jsonSchema
      try {
        validateFiche(fiche);
        log("✔ Fiche JSON valide !");
      } catch (e) {
        log("❌ Erreur validation : " + e.message);
        return;
      }

      // Génération du formulaire de variables
      const container = document.getElementById("formContainer");
      if (container) {
        buildVariablesUI(container, fiche);
      }

      // Stockage global pour les autres actions
      window.currentFiche = fiche;
    });
  }

  // ------------------------------------------------------------
  // 2) Lire les valeurs du formulaire
  // ------------------------------------------------------------
  const btnValues = document.getElementById("btnValues");
  if (btnValues) {
    btnValues.addEventListener("click", () => {
      if (outputBox) outputBox.textContent = "";

      const fiche = window.currentFiche;
      if (!fiche) {
        if (outputBox) outputBox.textContent = "❌ Aucune fiche chargée.";
        return;
      }

      try {
        const vals = getValues(fiche);
        if (outputBox) {
          outputBox.textContent =
            "✔ Valeurs saisies :\n" + JSON.stringify(vals, null, 2);
        }
      } catch (e) {
        if (outputBox) outputBox.textContent = "❌ Erreur : " + e.message;
      }
    });
  }

  // ------------------------------------------------------------
  // 3) Générer le prompt final
  // ------------------------------------------------------------
  const btnPrompt = document.getElementById("btnPrompt");
  if (btnPrompt) {
    btnPrompt.addEventListener("click", () => {
      if (outputBox) outputBox.textContent = "";

      const fiche = window.currentFiche;
      if (!fiche) {
        if (outputBox) outputBox.textContent = "❌ Aucune fiche chargée.";
        return;
      }

      try {
        const vals = getValues(fiche);
        const prompt = generatePrompt(fiche, vals);
        if (outputBox) {
          outputBox.textContent = "✔ Prompt généré :\n\n" + prompt;
        }
      } catch (e) {
        if (outputBox) outputBox.textContent = "❌ Erreur : " + e.message;
      }
    });
  }

  // ------------------------------------------------------------
  // 4) Générer le QR Code pour la fiche
  // ------------------------------------------------------------
  const btnMakeQR = document.getElementById("btnMakeQR");
  if (btnMakeQR) {
    btnMakeQR.addEventListener("click", () => {
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
  }

  // ------------------------------------------------------------
  // 5) Lecture d’un QR via fichier image
  // ------------------------------------------------------------
  const qrInput = document.getElementById("qrFileInput");
  const qrOutput = document.getElementById("qrFileResult");

  if (qrInput && qrOutput) {
    qrInput.addEventListener("change", async (ev) => {
      const file = ev.target.files[0];
      if (!file) return;

      qrOutput.textContent = "Lecture en cours…";

      try {
        const fiche = await readQrFromFile(file);
        qrOutput.textContent =
          "✔ QR décodé :\n\n" + JSON.stringify(fiche, null, 2);
        window.lastDecodedFiche = fiche;
      } catch (err) {
        console.error(err);
        qrOutput.textContent = "❌ Erreur : " + (err.message || err);
      }
    });
  }
});
