// ======================================================================
// createFiche.js — Génération d’une fiche IA RCH + QR Code
// Version corrigée (IA + variables + QR)
// ======================================================================

import { encodeFiche } from "../core/compression.js";
import { getVariablesFromUI } from "./uiVariables.js";

// ----------------------------------------------------------------------
// Lecture des champs META depuis l’interface utilisateur
// ----------------------------------------------------------------------
function getMetaFromUI() {
  return {
    titre: document.getElementById("meta_titre").value.trim(),
    categorie: document.getElementById("meta_categorie").value.trim(),
    objectif: document.getElementById("meta_objectif").value.trim(),
    date: new Date().toISOString().slice(0, 10),
    concepteur: document.getElementById("meta_concepteur").value.trim(),
  };
}

// ----------------------------------------------------------------------
// Lecture du prompt principal
// ----------------------------------------------------------------------
function getPromptFromUI() {
  return document.getElementById("prompt_base").value.trim();
}

// ----------------------------------------------------------------------
// Fonction principale déclenchée par "Générer JSON + QR"
// ----------------------------------------------------------------------
export async function onGenerate() {
  console.log("🟦 Démarrage génération fiche…");

  let meta, vars, basePrompt;

  // ------------------------------------------------------------------
  // Lecture META, VARIABLES, PROMPT (avec gestion des erreurs UI)
  // ------------------------------------------------------------------
  try {
    meta = getMetaFromUI();
    vars = getVariablesFromUI(); // ✅ Correction : bon nom de fonction
    basePrompt = getPromptFromUI();
  } catch (e) {
    alert("Erreur dans la saisie : " + e.message);
    console.error(e);
    return;
  }

  // ------------------------------------------------------------------
  // 🔧 Correction IA — Lecture des indices de confiance IA
  // ------------------------------------------------------------------
  const ai = {
    chatgpt: Number(document.getElementById("aiChatGPT")?.value ?? 3),
    perplexity: Number(document.getElementById("aiPerplexity")?.value ?? 3),
    mistral: Number(document.getElementById("aiMistral")?.value ?? 3),
  };

  console.log("📌 Indices IA :", ai);

  // ------------------------------------------------------------------
  // Construction de l’objet FICHE
  // ------------------------------------------------------------------
  const fiche = {
    meta,
    prompt: {
      base: basePrompt,
      variables: vars,
    },
    ai, // ✅ Correction : insertion du bloc IA dans la fiche
  };

  console.log("🟩 Fiche construite :", fiche);

  // ------------------------------------------------------------------
  // Encodage + compression via encodeFiche()
  // ------------------------------------------------------------------
  let encoded;
  try {
    encoded = encodeFiche(fiche);
    console.log("🟩 Encodage OK :", encoded);
  } catch (e) {
    alert("Erreur durant l’encodage de la fiche !");
    console.error(e);
    return;
  }

  // ------------------------------------------------------------------
  // Affichage JSON dans l’UI
  // ------------------------------------------------------------------
  document.getElementById("json_output").textContent = JSON.stringify(
    fiche,
    null,
    2
  );

  // ------------------------------------------------------------------
  // Génération et affichage du QR
  // ------------------------------------------------------------------
  const qrContainer = document.getElementById("qr_output");
  qrContainer.innerHTML = "";

  new QRCode(qrContainer, {
    text: encoded,
    width: 300,
    height: 300,
  });

  alert("Fiche générée et QR Code créé !");
}
