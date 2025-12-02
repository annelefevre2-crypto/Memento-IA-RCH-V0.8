// ======================================================================
// uiScan.js — Lecture, décodage, exploitation d’une fiche IA – RCH
// ======================================================================

import { decodeFiche } from "../core/compression.js";

// Elements UI
const qrFileInput = document.getElementById("qrFileInput");
const qrRaw = document.getElementById("qrRaw");

const videoContainer = document.getElementById("videoContainer");
const videoEl = document.getElementById("qrVideo");
const btnStart = document.getElementById("btnStartCam");
const btnStop = document.getElementById("btnStopCam");

const metaHeader = document.getElementById("metaHeader");
const scanVariables = document.getElementById("scanVariables");
const extraInput = document.getElementById("extra_input");

const promptResult = document.getElementById("promptResult");
const btnBuild = document.getElementById("btnBuildPrompt");
const btnCopy = document.getElementById("btnCopy");
const aiButtons = document.getElementById("aiButtons");

let scanner = null;
let currentFiche = null;

// ======================================================================
// UTILITAIRES
// ======================================================================

function hideScanSection() {
    const section1 = document.querySelector(".card");
    if (section1) section1.style.display = "none";
}

function showAllSectionsExceptScan() {
    document.querySelectorAll(".card").forEach((sec, i) => {
        if (i > 0) sec.style.display = "block";
    });
}

function buildMetaHeader(meta) {
    metaHeader.innerHTML = `
        <div class="meta-item"><b>Catégorie :</b> ${meta.categorie || "-"}</div>
        <div class="meta-item"><b>Titre :</b> ${meta.titre || "-"}</div>
        <div class="meta-item"><b>Objectif :</b> ${meta.objectif || "-"}</div>
        <div class="meta-item"><b>Concepteur :</b> ${meta.concepteur || "-"}</div>
        <div class="meta-item"><b>Date :</b> ${meta.date || "-"}</div>
        <div class="meta-item"><b>Version :</b> ${meta.version || "1.0"}</div>
    `;
}

function buildVariablesUI(vars) {
    scanVariables.innerHTML = "";

    vars.forEach(v => {
        const block = document.createElement("div");
        block.className = "var-block";

        let html = `<label>${v.label}</label>`;

        if (v.type === "text") {
            html += `<input data-var="${v.id}" type="text">`;
        }
        else if (v.type === "number") {
            html += `<input data-var="${v.id}" type="number">`;
        }
        else if (v.type === "choice" && v.options) {
            html += `<select data-var="${v.id}">`;
            v.options.forEach(opt => {
                html += `<option value="${opt}">${opt}</option>`;
            });
            html += `</select>`;
        }
        else if (v.type === "geoloc") {
            html += `
                <button class="btn-add-var" data-geo="${v.id}">📍 Acquérir position</button>
                <input data-var="${v.id}_lat" placeholder="Latitude">
                <input data-var="${v.id}_lon" placeholder="Longitude">
            `;
        }

        block.innerHTML = html;
        scanVariables.appendChild(block);
    });

    // Gestion acquisition geoloc
    document.querySelectorAll("[data-geo]").forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.geo;
            navigator.geolocation.getCurrentPosition(pos => {
                document.querySelector(`[data-var="${id}_lat"]`).value =
                    pos.coords.latitude.toFixed(6);
                document.querySelector(`[data-var="${id}_lon"]`).value =
                    pos.coords.longitude.toFixed(6);
            });
        };
    });
}

function collectVariableValues(vars) {
    const out = {};

    vars.forEach(v => {
        if (v.type === "geoloc") {
            out[v.id] = {
                lat: document.querySelector(`[data-var="${v.id}_lat"]`)?.value || "",
                lon: document.querySelector(`[data-var="${v.id}_lon"]`)?.value || ""
            };
        } else {
            out[v.id] = document.querySelector(`[data-var="${v.id}"]`)?.value || "";
        }
    });

    return out;
}

function buildAIButtons(meta, prompt) {
    aiButtons.innerHTML = "";

    const encoded = encodeURIComponent(prompt);

    const MODELS = [
        {
            key: "chatgpt",
            label: "ChatGPT",
            color: meta.chatgpt == 3 ? "green" : meta.chatgpt == 2 ? "orange" : "gray",
            url: `https://chat.openai.com/?q=${encoded}`
        },
        {
            key: "perplexity",
            label: "Perplexity",
            color: meta.perplexity == 3 ? "green" : meta.perplexity == 2 ? "orange" : "gray",
            url: `https://www.perplexity.ai/search?q=${encoded}`
        },
        {
            key: "mistral",
            label: "Mistral AI",
            color: meta.mistral == 3 ? "green" : meta.mistral == 2 ? "orange" : "gray",

            // ✅ Correction URL
            url: `https://chat.mistral.ai/chat?q=${encoded}`
        }
    ];

    MODELS.forEach(m => {
        const btn = document.createElement("button");
        btn.className = "btn-ia";
        btn.style.background =
            m.color === "green" ? "#2ecc71" :
            m.color === "orange" ? "#f1c40f" :
            "#bdc3c7";

        btn.textContent = m.label;

        if (m.color !== "gray") {
            btn.onclick = () => window.open(m.url, "_blank");
        } else {
            btn.disabled = true;
        }

        aiButtons.appendChild(btn);
    });
}

// ======================================================================
// LECTURE QR VIA FICHIER
// ======================================================================

if (qrFileInput) {
    qrFileInput.addEventListener("change", async ev => {
        const file = ev.target.files[0];
        if (!file) return;

        try {
            const text = await window.QrScanner.scanImage(file);
            qrRaw.textContent = text;

            currentFiche = decodeFiche(text);

            hideScanSection();
            showAllSectionsExceptScan();

            buildMetaHeader(currentFiche.meta);
            buildVariablesUI(currentFiche.prompt.variables);

        } catch (err) {
            qrRaw.textContent = "Erreur : " + err.message;
        }
    });
}

// ======================================================================
// SCAN VIA CAMERA
// ======================================================================

if (btnStart) {
    btnStart.onclick = async () => {
        videoContainer.style.display = "block";

        scanner = new window.QrScanner(videoEl, result => {
            videoContainer.style.display = "none";
            scanner.stop();

            currentFiche = decodeFiche(result);

            hideScanSection();
            showAllSectionsExceptScan();

            buildMetaHeader(currentFiche.meta);
            buildVariablesUI(currentFiche.prompt.variables);
        });

        scanner.start();
        btnStart.disabled = true;
        btnStop.disabled = false;
    };
}

if (btnStop) {
    btnStop.onclick = async () => {
        if (scanner) scanner.stop();
        videoContainer.style.display = "none";
        btnStart.disabled = false;
        btnStop.disabled = true;
    };
}

// ======================================================================
// PROMPT FINAL
// ======================================================================

btnBuild.onclick = () => {
    if (!currentFiche) return;

    const vars = collectVariableValues(currentFiche.prompt.variables);

    let prompt = currentFiche.prompt.base;

    Object.keys(vars).forEach(k => {
        const v = vars[k];
        if (typeof v === "object") {
            prompt = prompt.replaceAll(`{{${k}}}`, `${v.lat}, ${v.lon}`);
        } else {
            prompt = prompt.replaceAll(`{{${k}}}`, v);
        }
    });

    // Ajout des informations complémentaires
    if (extraInput.value.trim() !== "") {
        prompt += `\n\nInformations complémentaires :\n${extraInput.value.trim()}`;
    }

    promptResult.textContent = prompt;

    // Générer les boutons IA
    buildAIButtons(currentFiche.meta, prompt);
};

// ======================================================================
// COPIE
// ======================================================================

btnCopy.onclick = () => {
    navigator.clipboard.writeText(promptResult.textContent);
    btnCopy.textContent = "✔ Copié !";
    setTimeout(() => (btnCopy.textContent = "📋 Copier le prompt"), 1500);
};
