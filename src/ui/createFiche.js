// ======================================================================
// createFiche.js — Module principal de l’onglet création de fiche IA RCH
// ======================================================================

// Import des sous-modules UI
import { initVariablesUI, getVariablesFromUI } from "./uiVariables.js";
import { getMetaFromUI, resetMetaUI } from "./uiMeta.js";
import { getPromptFromUI, resetPromptUI } from "./uiPrompt.js";
import { resetConfidenceIndexes } from "./uiReset.js";

// Import du moteur JSON + QR
import { encodeFiche } from "../core/compression.js";
import { generateQrForFiche } from "../core/qrWriter.js";

// ================================================================
// INITIALISATION DE LA PAGE
// ================================================================
document.addEventListener("DOMContentLoaded", () => {

    console.log("🔧 createFiche.js chargé");

    // Pré-remplit la date du jour
    const dateField = document.getElementById("meta_date");
    if (dateField) {
        const today = new Date().toISOString().slice(0, 10);
        dateField.value = today;
    }

    // Initialise l’UI Variables
    initVariablesUI();

    // Bouton principal : Générer JSON + QR
    document.getElementById("btnGenerate").addEventListener("click", onGenerate);

    // Bouton RESET
    document.getElementById("btnReset").addEventListener("click", onReset);

});


// ================================================================
// GÉNÉRATION JSON + QR CODE
// ================================================================
async function onGenerate() {
    console.log("🟦 Génération de la fiche demandée…");

    let meta, vars, prompt;

    try {
        meta = getMetaFromUI();
        vars = getVariablesFromUI();
        prompt = getPromptFromUI();
    }
    catch (e) {
        alert("Erreur dans la saisie : " + e.message);
        console.error(e);
        return;
    }

    // Vérification taille du prompt
    if (prompt.length > 4000) {
        alert("Le prompt dépasse 4000 caractères !");
        return;
    }

    // Construction JSON final
    const fiche = {
        meta,
        prompt: {
            base: prompt,
            variables: vars
        }
    };

    console.log("📦 Fiche JSON construite :", fiche);

    // Compression + wrapper
    let encoded;
    try {
        encoded = encodeFiche(fiche);
    }
    catch (err) {
        alert("Erreur compression : " + err.message);
        console.error(err);
        return;
    }

    console.log("📚 Fiche compressée :", encoded);

    // Génération QR
    const qrContainer = document.getElementById("qrContainer");
    qrContainer.innerHTML = "";

    try {
        generateQrForFiche(fiche, "qrContainer");
        console.log("🎉 QR généré !");
    }
    catch (err) {
        alert("Erreur génération QR : " + err.message);
        console.error(err);
    }
}


// ================================================================
// RESET COMPLET
// ================================================================
function onReset() {
    console.log("🔄 Réinitialisation complète demandée");

    // 1. Métadonnées
    resetMetaUI();

    // 2. Variables
    initVariablesUI();

    // 3. Prompt
    resetPromptUI();

    // 4. Indices IA → remise à 3
    resetConfidenceIndexes();

    // 5. Nettoyer QR
    const qrContainer = document.getElementById("qrContainer");
    if (qrContainer) qrContainer.innerHTML = "";

    // 6. Remettre la date du jour
    const dateField = document.getElementById("meta_date");
    if (dateField) {
        const today = new Date().toISOString().slice(0, 10);
        dateField.value = today;
    }

    console.log("♻️ Réinitialisation terminée");
}
