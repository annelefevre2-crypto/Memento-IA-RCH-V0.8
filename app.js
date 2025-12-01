import { validateFiche } from "./src/core/jsonSchema.js";
import { buildVariablesUI, getValues, generatePrompt } from "./src/core/variables.js";

document.addEventListener("DOMContentLoaded", () => {

  const logBox = document.getElementById("log");
  const outputBox = document.getElementById("output");

  function log(msg) {
    logBox.textContent += msg + "\n";
  }

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

    const container = document.getElementById("formContainer");
    buildVariablesUI(container, fiche);

    window.currentFiche = fiche;
  });

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
