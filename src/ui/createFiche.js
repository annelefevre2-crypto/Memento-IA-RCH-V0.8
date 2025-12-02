// =========================================================
// Module UI : Création de fiche JSON + QR
// =========================================================

import { encodeFiche } from "../core/compression.js";
import { validateFiche } from "../core/jsonSchema.js";
import { generateQrForFiche } from "../core/qrWriter.js";

// ---------------------------------------------------------
// RÉFÉRENCES DOM
// ---------------------------------------------------------
const dom = {
    reset: document.getElementById("btnReset"),
    meta: {
        categorie: document.getElementById("metaCategorie"),
        titre: document.getElementById("metaTitre"),
        objectif: document.getElementById("metaObjectif"),
        concepteur: document.getElementById("metaConcepteur"),
        date: document.getElementById("metaDate"),
    },
    ai: {
        chatgpt: document.getElementById("aiChatGPT"),
        perplexity: document.getElementById("aiPerplexity"),
        mistral: document.getElementById("aiMistral")
    },
    variablesContainer: document.getElementById("variablesContainer"),
    addVarBtn: document.getElementById("btnAddVariable"),
    prompt: document.getElementById("promptText"),
    promptCounter: document.getElementById("promptCounter"),
    generate: document.getElementById("btnGenerate"),
    qrContainer: document.getElementById("qrContainer")
};

// ---------------------------------------------------------
// OUTILS
// ---------------------------------------------------------

function clearForm() {
    Object.values(dom.meta).forEach(el => el.value = "");
    dom.ai.chatgpt.value = "3";
    dom.ai.perplexity.value = "3";
    dom.ai.mistral.value = "3";
    dom.prompt.value = "";
    dom.promptCounter.textContent = "0 / 4000";

    // reset variables
    dom.variablesContainer.innerHTML = "";
}

function getVariablesFromUI() {
    const vars = [];
    const blocks = dom.variablesContainer.querySelectorAll(".var-block");

    blocks.forEach(block => {
        vars.push({
            label: block.querySelector(".var-label").value,
            id: block.querySelector(".var-id").value,
            type: block.querySelector(".var-type").value,
            required: block.querySelector(".var-required").checked
        });
    });

    return vars;
}

function addVariableUI() {
    if (dom.variablesContainer.children.length >= 10) {
        alert("Maximum : 10 variables");
        return;
    }

    const div = document.createElement("div");
    div.className = "var-block";
    div.innerHTML = `
        <input class="var-label" placeholder="Label">
        <input class="var-id" placeholder="Identifiant">
        <select class="var-type">
            <option value="text">Text</option>
            <option value="number">Nombre</option>
            <option value="select">Liste</option>
            <option value="localisation">Localisation</option>
        </select>
        <label><input type="checkbox" class="var-required"> Obligatoire</label>
        <button class="remove-var">Supprimer</button>
    `;

    div.querySelector(".remove-var").onclick = () => div.remove();

    dom.variablesContainer.appendChild(div);
}

function updatePromptCounter() {
    const len = dom.prompt.value.length;
    dom.promptCounter.textContent = `${len} / 4000`;

    if (len > 4000) {
        dom.promptCounter.style.color = "red";
    } else {
        dom.promptCounter.style.color = "";
    }
}

// ---------------------------------------------------------
// CONSTRUCTION DU JSON FINAL
// ---------------------------------------------------------

function buildFiche() {
    return {
        meta: {
            categorie: dom.meta.categorie.value,
            titre: dom.meta.titre.value,
            objectif: dom.meta.objectif.value,
            concepteur: dom.meta.concepteur.value,
            date: dom.meta.date.value,
            ai_scores: {
                chatgpt: Number(dom.ai.chatgpt.value),
                perplexity: Number(dom.ai.perplexity.value),
                mistral: Number(dom.ai.mistral.value)
            }
        },
        prompt: {
            base: dom.prompt.value,
            variables: getVariablesFromUI()
        }
    };
}

// ---------------------------------------------------------
// GÉNÉRATION JSON + QR CODE
// ---------------------------------------------------------
async function generateQR() {
    try {
        const fiche = buildFiche();
        validateFiche(fiche);

        const { wrapperString, stats } = encodeFiche(fiche);

        console.log("JSON compacté :", stats);

        dom.qrContainer.innerHTML = "";
        generateQrForFiche(fiche, "qrContainer");

        alert("QR Code généré !");
    } catch (e) {
        alert("Erreur : " + e.message);
        console.error(e);
    }
}

// ---------------------------------------------------------
// LISTENERS
// ---------------------------------------------------------

dom.reset.onclick = clearForm;
dom.addVarBtn.onclick = addVariableUI;
dom.prompt.oninput = updatePromptCounter;
dom.generate.onclick = generateQR;

// Initialisation compteur
updatePromptCounter();
