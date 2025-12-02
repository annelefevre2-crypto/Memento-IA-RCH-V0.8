// ===============================================================
// uiReset.js — Réinitialisation complète du module création
// ===============================================================

import { resetMetaUI } from "./uiMeta.js";
import { initVariablesUI } from "./uiVariables.js";

export function resetCreateUI() {
  resetMetaUI();
  initVariablesUI();

  const p = document.getElementById("prompt_input");
  p.value = "";
  document.getElementById("prompt_count").textContent = "0 / 4000";

  document.getElementById("qrContainer").innerHTML = "";
}
// ======================================================================
// uiReset.js — Gestion des réinitialisations globales
// ======================================================================

// Tous les selects ayant la classe .indice-confiance seront remis à 3
export function resetConfidenceIndexes() {
    document.querySelectorAll(".indice-confiance").forEach(sel => {
        sel.value = "3";
    });
}
