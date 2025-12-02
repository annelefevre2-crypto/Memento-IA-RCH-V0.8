// =================================================================
// createFiche.js — Module principal de création de fiche IA RCH
// =================================================================

import { getMetaFromUI, validateMeta } from "./uiMeta.js";
import { getVariablesFromUI, initVariablesUI } from "./uiVariables.js";
import { initPromptUI, getPromptFromUI } from "./uiPrompt.js";
import { resetCreateUI } from "./uiReset.js";

import { encodeFiche } from "../core/compression.js";
import { generateQrForFiche } from "../core/qrWriter.js";

document.addEventListener("DOMContentLoaded", () => {
  // Remplit automatiquement la date du jour dans le champ meta_date
const dateField = document.getElementById("meta_date");
if (dateField) {
    const today = new Date().toISOString().slice(0, 10);
    dateField.value = today;
}

  // Initialise les UIs spécialisées
  initVariablesUI();
  initPromptUI();

  // Bouton reset
  document.getElementById("btnReset").addEventListener("click", () => {
    resetCreateUI();
  });

  // Bouton générer fiche + QR
  document.getElementById("btnGenerate").addEventListener("click", () => {
    try {
      const meta = getMetaFromUI();
      validateMeta(meta);

      const vars = getVariablesFromUI();
      const prompt = getPromptFromUI();

      const fiche = {
        meta,
        prompt: {
          base: prompt,
          variables: vars
        }
      };

      const enc = encodeFiche(fiche);

      generateQrForFiche(fiche, "qrContainer");

    } catch (e) {
      alert("Erreur : " + e.message);
    }
  });

});
