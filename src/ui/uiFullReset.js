// ======================================================
// uiFullReset.js — Reset global mode scan + création
// ======================================================

import { stopCameraScan } from "../core/qrReaderCamera.js";
import { resetMetaUI } from "./uiMeta.js";
import { initVariablesUI } from "./uiVariables.js";
import { resetPromptUI } from "./uiPrompt.js";
import { resetConfidenceIndexes } from "./uiReset.js";

export function fullReset() {

  // --------------------------
  // 1. Variables globales
  // --------------------------
  window.currentFiche = null;

  // --------------------------
  // 2. MODE CRÉATION
  // --------------------------
  resetMetaUI();        // metadata
  initVariablesUI();    // variables
  resetPromptUI();      // prompt
  resetConfidenceIndexes(); // indices IA

  // --------------------------
  // 3. MODE SCAN
  // --------------------------
  stopCameraScan();

  const videoBox = document.getElementById("videoContainer");
  if (videoBox) videoBox.style.display = "none";

  [
    "qrContainer",
    "promptResult",
    "scanVariables"
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = "";
  });

  // --------------------------
  // 4. Restauration affichage initial SCAN
  // --------------------------
  const sectionScan = document.getElementById("sectionScan");
  const sectionMeta = document.getElementById("sectionMeta");
  const sectionVars = document.getElementById("sectionVars");
  const sectionExtra = document.getElementById("sectionExtra");
  const sectionPrompt = document.getElementById("sectionPrompt");

  if (sectionScan) sectionScan.style.display = "block";
  if (sectionMeta) sectionMeta.style.display = "none";
  if (sectionVars) sectionVars.style.display = "none";
  if (sectionExtra) sectionExtra.style.display = "none";
  if (sectionPrompt) sectionPrompt.style.display = "none";

  console.log("♻️ Reset global appliqué.");
}
