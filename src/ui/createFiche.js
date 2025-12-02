// ======================================================================
// createFiche.js — Génération d’une fiche IA RCH + QR (Version corrigée)
// ======================================================================

import { encodeFiche } from "../core/compression.js";
import { gatherVariablesFromUI } from "./uiVariables.js";

// ----------------------------------------------------------------------
// Lecture des blocs META et PROMPT depuis l’UI
// ----------------------------------------------------------------------
function getMetaFromUI() {
  return {
    titre: document.getElementById("meta_titre").value.trim(),
    categorie: document.getElementById("meta_categorie").value.trim(),
    objectif: document.getElementById("meta_objectif").value.trim(),
    date: new Date().toISOString().slice(0, 10),
    concepteur: document.getElementById("meta_concepteur").value.trim()
  };
}

function getPromptFromUI() {
  return document.getElementById("prompt_base").value.trim();
}

// ----------------------------------------------------------------------
// Génération de la fiche
// ----------------------------------------------------------------------
export async function onGenerate() {
  console.log("🟦 Génération de la fiche demandée…");

  let meta, vars, basePrompt;

  // ---------------------------
  // Lecture META + VARIABLES + PROMPT
  // ---------------------------
  try {
    meta = getMetaFromUI();
    vars = gatherVariablesFromUI();
    basePrompt = getPromptFromUI();
  }
  catch (e) {
    alert("Erreur dans la saisie : " + e.message);
    console.error(e);
    return;
  }

  // ------------------------------------------------------------------
  // 🔧 Correction #AI-1
  // Lecture des indices de confiance IA (ajout du bloc `ai`)
  // ------------------------------------------------------------------
  const ai = {
    chatgpt: Number(document.getElementById("aiChatGPT")?.value ?? 3),
    perplexity: Number(document.getElementById("aiPerplexity")?.value ?? 3),
    mistral: Number(document.getElementById("aiMistral")?.value ?? 3)
  };

  console.log("📌 Indices IA détectés :", ai);

  // ------------------------------------------------------------------
  // Construction du JSON final de la fiche
  // ------------------------------------------------------------------
  const fiche = {
    meta,
    prompt: {
      base: basePrompt,
      variables: vars
    },
    ai          // 🔧 Correction #AI-2 : insertion du bloc IA dans la fiche
  };

  console.log("🟩 FICHE construite :", fiche);

  // ------------------------------------------------------------------
  // Encodage + Compression via encodeFiche()
  // ------------------------------------------------------------------
  let encoded;

  try {
    encoded = encodeFiche(fiche);
    console.log("🟩 Encodage OK :", encoded);
  }
  catch (e) {
    console.error("❌ Erreur encodeFiche :", e);
    alert("Erreur lors de l’encodage de la fiche.");
    return;
  }

  // ------------------------------------------------------------------
  // Export JSON + QR dans l’UI
  // ------------------------------------------------------------------
  document.getElementById("json_output").textContent =
    JSON.stringify(fiche, null, 2);

  const qrContainer = document.getElementById("qr_output");
  qrContainer.innerHTML = "";

  // ------------------------------------------------------------------
  // Génération QR (texte = encoded)
  // ------------------------------------------------------------------
  new QRCode(qrContainer, {
    text: encoded,
    width: 300,
    height: 300,
  });

  alert("Fiche générée et QR Code créé !");
}
