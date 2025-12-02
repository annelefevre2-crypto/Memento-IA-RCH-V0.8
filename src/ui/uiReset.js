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
