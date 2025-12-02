// ======================================================================
// uiScan.js — Lecture, décodage, exploitation d’une fiche IA – RCH
// ======================================================================

import { decodeFiche } from "../core/compression.js";
import { fromCompact } from "../core/jsonSchema.js";

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
// UI UTILITIES
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
        <div><b>Catégorie :</b> ${meta.categorie || "-"}</div>
        <div><b>Titre :</b> ${meta.titre || "-"}</div>
        <div><b>Objectif :</b> ${meta.objectif || "-"}</div>
        <div><b>Concepteur :</b> ${meta.concepteur || "-"}</div>
        <div><b>Date :</b> ${meta.date || "-"}</div>
        <div><b>Version :</b> ${meta.version || "1.0"}</div>
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

    // Boutons GPS
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

function buildAIButtons(ai, prompt) {
    aiButtons.innerHTML = "";

    const encoded = encodeURIComponent(prompt);

    const MODELS = [
        {
            label: "ChatGPT",
            level: Number(ai.chatgpt || 1),
            url: `https://chat.openai.com/?q=${encoded}`
        },
        {
            label: "Perplexity",
            level: Number(ai.perplexity || 1),
            url: `https://www.perplexity.ai/search?q=${encoded}`
        },
        {
            label: "Mistral AI",
            level: Number(ai.mistral || 1),
            url: `https://chat.mistral.ai/chat?q=${encoded}`
        }
    ];

    MODELS.forEach(m => {
        const btn = document.createElement("button");
        btn.className = "btn-ia";

        // couleur selon indice de confiance
        btn.style.background =
            m.level === 3 ? "#2ecc71" :
            m.level === 2 ? "#f1c40f" :
            "#bdc3c7";

        btn.textContent = m.label;

        if (m.level === 1) {
            btn.disabled = true;
            btn.style.cursor = "not-allowed";
            btn.style.opacity = "0.6";
        } else {
            btn.onclick = () => window.open(m.url, "_blank");
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

            const raw = decodeFiche(text);
            currentFiche = fromCompact(raw);

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

            const raw = decodeFiche(result);
            currentFiche = fromCompact(raw);

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

    if (extraInput.value.trim() !== "") {
        prompt += `\n\nInformations complémentaires :\n${extraInput.value.trim()}`;
    }

    promptResult.textContent = prompt;

    buildAIButtons(currentFiche.ai, prompt);
};

// ======================================================================
// COPIE
// ======================================================================

btnCopy.onclick = () => {
    navigator.clipboard.writeText(promptResult.textContent);
    btnCopy.textContent = "✔ Copié !";
    setTimeout(() => (btnCopy.textContent = "📋 Copier le prompt"), 1500);
};
