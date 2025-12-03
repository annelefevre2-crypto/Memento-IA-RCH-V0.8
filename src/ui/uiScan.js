// ========================================================================
// uiScan.js — Lecture + exploitation de fiche IA RCH (Version unifiée)
// ========================================================================

import { decodeFiche } from "../core/compression.js";
import { fullReset } from "./uiFullReset.js";

// ---------- Sections ----------
const sectionScan   = document.getElementById("sectionScan");
const sectionMeta   = document.getElementById("sectionMeta");
const sectionVars   = document.getElementById("sectionVars");
const sectionExtra  = document.getElementById("sectionExtra");
const sectionPrompt = document.getElementById("sectionPrompt");

// ---------- Éléments principaux ----------
const metaHeader    = document.getElementById("metaHeader");
const scanVariables = document.getElementById("scanVariables");
const extraInput    = document.getElementById("extra_input");
const promptResult  = document.getElementById("promptResult");
const aiButtons     = document.getElementById("aiButtons");

// ---------- Reset scan ----------
const btnScanReset = document.getElementById("btnScanReset");
if (btnScanReset) btnScanReset.onclick = fullReset;

// ---------- Lecture via fichier ----------
const fileInput = document.getElementById("qrFileInput");
if (fileInput) {
  fileInput.addEventListener("change", async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;

    try {
      const text = await window.QrScanner.scanImage(file, { returnDetailedScanResult: false });
      const fiche = decodeFiche(text);
      onFicheDecoded(fiche);
    } catch (err) {
      alert("Erreur lecture fichier : " + err.message);
    }
  });
}

// ========================================================================
// Gestion de la fiche décodée
// ========================================================================
function onFicheDecoded(fiche) {
  window.currentFiche = fiche;

  // 1) Afficher l'UI complète
  if (sectionScan)   sectionScan.style.display   = "none";
  if (sectionMeta)   sectionMeta.style.display   = "block";
  if (sectionVars)   sectionVars.style.display   = "block";
  if (sectionExtra)  sectionExtra.style.display  = "block";
  if (sectionPrompt) sectionPrompt.style.display = "block";

  // 2) Métadonnées
  metaHeader.innerHTML = `
    <h3>${fiche.meta?.titre || "Titre inconnu"}</h3>
    <p><b>Catégorie :</b> ${fiche.meta?.categorie || "-"}</p>
    <p><b>Objectif :</b> ${fiche.meta?.objectif || "-"}</p>
    <p><b>Date :</b> ${fiche.meta?.date || "-"}</p>
    <p><b>Concepteur :</b> ${fiche.meta?.concepteur || "-"}</p>
  `;

  // 3) Variables
  scanVariables.innerHTML = "";
  (fiche.prompt?.variables || []).forEach(v => {
    const block = document.createElement("div");
    block.className = "var-field";

    const lab = document.createElement("label");
    lab.textContent = v.label || v.id;
    block.appendChild(lab);

    let field;

    if (v.type === "text") {
      field = document.createElement("input");
      field.type = "text";
    }
    else if (v.type === "number") {
      field = document.createElement("input");
      field.type = "number";
    }
    else if (v.type === "choice") {
      field = document.createElement("select");
      (v.options || []).forEach(opt => {
        const o = document.createElement("option");
        o.textContent = opt;
        o.value = opt;
        field.appendChild(o);
      });
    }
    else if (v.type === "geoloc") {
      field = document.createElement("div");
      field.innerHTML = `
        <button class="btnSmall" id="${v.id}_gps">📍 Position</button>
        <input id="${v.id}_lat" placeholder="Latitude">
        <input id="${v.id}_lon" placeholder="Longitude">
      `;
      setTimeout(() => {
        const btn = document.getElementById(`${v.id}_gps`);
        if (btn) {
          btn.onclick = () => {
            navigator.geolocation.getCurrentPosition(pos => {
              document.getElementById(`${v.id}_lat`).value = pos.coords.latitude.toFixed(6);
              document.getElementById(`${v.id}_lon`).value = pos.coords.longitude.toFixed(6);
            });
          };
        }
      }, 50);
    }
    else {
      field = document.createElement("input");
      field.type = "text";
    }

    field.dataset.id = v.id;
    block.appendChild(field);
    scanVariables.appendChild(block);
  });

  promptResult.textContent = "";
  aiButtons.innerHTML = "";
}

// ========================================================================
// Compilation du prompt
// ========================================================================
const btnBuildPrompt = document.getElementById("btnBuildPrompt");
if (btnBuildPrompt) {
  btnBuildPrompt.onclick = () => {
    const fiche = window.currentFiche;
    if (!fiche) return alert("Aucune fiche chargée.");

    let prompt = fiche.prompt?.base || "";

    (fiche.prompt?.variables || []).forEach(v => {
      let val = "";

      if (v.type === "geoloc") {
        const lat = document.getElementById(`${v.id}_lat`)?.value || "";
        const lon = document.getElementById(`${v.id}_lon`)?.value || "";
        val = `${lat},${lon}`;
      } else {
        const el = document.querySelector(`[data-id="${v.id}"]`);
        val = el?.value || "";
      }

      prompt = prompt.replaceAll(`{{${v.id}}}`, val);
    });

    const extra = extraInput.value.trim();
    if (extra) {
      prompt += `\n\nInformations complémentaires :\n${extra}`;
    }

    promptResult.textContent = prompt;
    buildAIButtons(fiche, prompt);
  };
}

// ========================================================================
// Copier prompt
// ========================================================================
const btnCopy = document.getElementById("btnCopy");
if (btnCopy) {
  btnCopy.onclick = async () => {
    try {
      await navigator.clipboard.writeText(promptResult.textContent);
      alert("Prompt copié !");
    } catch {
      alert("Impossible de copier.");
    }
  };
}

// ========================================================================
// Boutons IA
// ========================================================================
function buildAIButtons(fiche, prompt) {
  aiButtons.innerHTML = "";

  const levels = fiche.ai || { chatgpt: 3, perplexity: 3, mistral: 3 };

  const palette = lvl => {
    if (lvl === 3) return "background:#1dbf65;color:white;";
    if (lvl === 2) return "background:#ff9f1c;color:white;";
    return "background:#ccc;color:#666;";
  };

  const mk = (label, lvl, url) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.style = palette(lvl) +
      "padding:10px 16px;margin-right:8px;border:none;border-radius:10px;cursor:pointer;";
    btn.onclick = () => window.open(url + encodeURIComponent(prompt), "_blank");
    aiButtons.appendChild(btn);
  };

  mk("ChatGPT", levels.chatgpt, "https://chat.openai.com/?q=");
  mk("Perplexity", levels.perplexity, "https://www.perplexity.ai/search?q=");
  mk("Mistral", levels.mistral, "https://chat.mistral.ai/chat?q=");
}

// ========================================================================
// Événement envoyé par uiCamera.js
// ========================================================================
window.addEventListener("qr-text-found", (ev) => {
  try {
    const fiche = decodeFiche(ev.detail);
    onFicheDecoded(fiche);
  } catch (e) {
    alert("QR invalide : " + e.message);
  }
});
