// ====================================================================
// app.js — Test minimal de l'architecture JSON + variables
// ====================================================================

import { validateFiche } from "./src/core/jsonSchema.js";
import { buildVariablesUI, getValues, generatePrompt } from "./src/core/variables.js";

// ============================================================
// IMPORTANT : attendre que le DOM soit complètement chargé
// ============================================================
document.addEventListener("DOMContentLoaded", () => {

  const logBox = document.getElementById("log");
  const outputBox = document.getElementById("output");

  function log(msg) {
    logBox.textContent += msg + "\n";
  }

  // ====================================================================
  // 1. Charger + valider la fiche JSON entrée par l'utilisateur
  // ====================================================================
  document.getElementById("btnLoad").addEventListener("click", () => {
    logBox.textContent = "";
    outputBox.textContent = "";

    let raw = document.getElementById("jsonInput").value.trim();
    if (!raw) {
      log("❌ Erreur : aucun JSON fourni.");
      return;
    }

    let fiche = null;

    // Tentative de parsing JSON
    try {
      fiche = JSON.parse(raw);
    } catch (e) {
      log("❌ JSON invalide : " + e.message);
      return;
    }

    // Validation via jsonSchema.js
    try {
      validateFiche(fiche);
      log("✔ Fiche JSON valide !");
    } catch (e) {
      log("❌ Erreur validation : " + e.message);
      return;
    }

    // Génération du formulaire
    const container = document.getElementById("formContainer");
    buildVariablesUI(container, fiche);

    // Stocker la fiche en mémoire pour les actions suivantes
    window.currentFiche = fiche;
  });


  // ====================================================================
  // 2. Lire les valeurs saisies dans le formulaire
  // ====================================================================
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


  // ====================================================================
  // 3. Générer le prompt final avec {{variables}}
  // ====================================================================
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

});
