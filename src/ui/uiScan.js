// ========================================================================
// uiScan.js — Lecture + exploitation de fiche IA RCH
// ========================================================================

import { decodeFiche } from "../core/compression.js";

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

// Caméra / fichier
const btnStartCam   = document.getElementById("btnStartCam");
const btnStopCam    = document.getElementById("btnStopCam");
const videoContainer= document.getElementById("videoContainer");
const videoEl       = document.getElementById("qrVideo");
const fileInput     = document.getElementById("qrFileInput");

// Stockage de la fiche courante
window.currentFiche = null;

// ------------------------------------------------------------------------
// Quand une fiche est décodée (depuis fichier ou caméra)
// ------------------------------------------------------------------------
function onFicheDecoded(fiche) {
  window.currentFiche = fiche;

  // 1) Masquer la zone scan, afficher les autres
  if (sectionScan)   sectionScan.style.display   = "none";
  if (sectionMeta)   sectionMeta.style.display   = "block";
  if (sectionVars)   sectionVars.style.display   = "block";
  if (sectionExtra)  sectionExtra.style.display  = "block";
  if (sectionPrompt) sectionPrompt.style.display = "block";

  // 2) Remplir les métadonnées
  metaHeader.innerHTML = `
    <h3>${fiche.meta?.titre || "Titre inconnu"}</h3>
    <p><b>Catégorie :</b> ${fiche.meta?.categorie || "-"}</p>
    <p><b>Objectif :</b> ${fiche.meta?.objectif || "-"}</p>
    <p><b>Mis à jour le :</b> ${fiche.meta?.date || "-"}</p>
    <p><b>Concepteur :</b> ${fiche.meta?.concepteur || "-"}</p>
  `;

  // 3) Générer les champs de variables
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
    } else if (v.type === "number") {
      field = document.createElement("input");
      field.type = "number";
    } else if (v.type === "choice") {
      field = document.createElement("select");
      (v.options || []).forEach(opt => {
        const o = document.createElement("option");
        o.value = opt;
        o.textContent = opt;
        field.appendChild(o);
      });
    } else if (v.type === "geoloc") {
      field = document.createElement("div");
      field.innerHTML = `
        <button class="btn-reset" id="${v.id}_gps">📍 Acquérir position</button>
        <input id="${v.id}_lat" placeholder="Latitude">
        <input id="${v.id}_lon" placeholder="Longitude">
      `;
      // branchement GPS après insertion dans le DOM
      setTimeout(() => {
        const btn = document.getElementById(`${v.id}_gps`);
        if (!btn) return;
        btn.onclick = () => {
          navigator.geolocation.getCurrentPosition(pos => {
            const lat = document.getElementById(`${v.id}_lat`);
            const lon = document.getElementById(`${v.id}_lon`);
            if (lat) lat.value = pos.coords.latitude.toFixed(6);
            if (lon) lon.value = pos.coords.longitude.toFixed(6);
          });
        };
      }, 0);
    } else {
      field = document.createElement("input");
      field.type = "text";
    }

    field.dataset.id = v.id;
    block.appendChild(field);
    scanVariables.appendChild(block);
  });

  // Nettoyage de l'affichage prompt / boutons
  promptResult.textContent = "";
  aiButtons.innerHTML = "";
}

// ------------------------------------------------------------------------
// Lecture via FICHIER
// ------------------------------------------------------------------------
if (fileInput) {
  fileInput.addEventListener("change", async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;

    try {
      const text = await window.QrScanner.scanImage(file);
      const fiche = decodeFiche(text);
      onFicheDecoded(fiche);
    } catch (err) {
      alert("Erreur lecture fichier : " + err.message);
    }
  });
}

// ------------------------------------------------------------------------
// Lecture via CAMÉRA
// ------------------------------------------------------------------------
let scanner = null;

if (btnStartCam && btnStopCam && videoEl) {
  btnStartCam.onclick = async () => {
    videoContainer.style.display = "block";
    btnStartCam.disabled = true;
    btnStopCam.disabled = false;

    scanner = new window.QrScanner(videoEl, result => {
      const text = result.data || result;
      try {
        const fiche = decodeFiche(text);
        // On stoppe dès qu’un QR valide est lu
        scanner.stop();
        videoContainer.style.display = "none";
        onFicheDecoded(fiche);
      } catch (e) {
        console.warn("QR non compatible :", e.message);
      }
    });

    await scanner.start();
  };

  btnStopCam.onclick = async () => {
    if (scanner) await scanner.stop();
    videoContainer.style.display = "none";
    btnStartCam.disabled = false;
    btnStopCam.disabled = true;
  };
}

// ------------------------------------------------------------------------
// Compiler le PROMPT final
// ------------------------------------------------------------------------
const btnBuildPrompt = document.getElementById("btnBuildPrompt");
const btnCopyPrompt  = document.getElementById("btnCopy");

if (btnBuildPrompt) {
  btnBuildPrompt.onclick = () => {
    const fiche = window.currentFiche;
    if (!fiche) {
      alert("Aucune fiche chargée.");
      return;
    }

    let prompt = fiche.prompt?.base || "";

    (fiche.prompt?.variables || []).forEach(v => {
      let replacement = "";

      if (v.type === "geoloc") {
        const lat = document.getElementById(`${v.id}_lat`)?.value || "";
        const lon = document.getElementById(`${v.id}_lon`)?.value || "";
        replacement = `${lat},${lon}`;
      } else {
        const el = document.querySelector(`[data-id="${v.id}"]`);
        replacement = el?.value || "";
      }

      prompt = prompt.replaceAll(`{{${v.id}}}`, replacement);
    });

    const extra = extraInput.value.trim();
    if (extra) {
      prompt += `\n\nInformations complémentaires :\n${extra}`;
    }

    promptResult.textContent = prompt;
    buildAIButtons(fiche, prompt);
  };
}

// Copier le prompt
if (btnCopyPrompt) {
  btnCopyPrompt.onclick = async () => {
    const txt = promptResult.textContent.trim();
    if (!txt) return;
    try {
      await navigator.clipboard.writeText(txt);
      alert("Prompt copié dans le presse-papiers.");
    } catch {
      alert("Impossible de copier le prompt.");
    }
  };
}

// ------------------------------------------------------------------------
// Boutons d’envoi vers les IA
// ------------------------------------------------------------------------
function buildAIButtons(fiche, prompt) {
  aiButtons.innerHTML = "";
  if (!prompt.trim()) return;

  const levels = fiche.ai || {
    chatgpt: 3,
    perplexity: 3,
    mistral: 3,
  };

  const styleForLevel = (lvl) => {
    switch (Number(lvl)) {
      case 3: return "background:#1dbf65;color:white;";
      case 2: return "background:#ff9f1c;color:white;";
      default: return "background:#cccccc;color:#777;";
    }
  };

  const mkBtn = (label, lvl, baseUrl) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.style = styleForLevel(lvl)
      + "padding:10px 16px;margin-right:10px;border:none;border-radius:10px;font-weight:600;cursor:pointer;";

    if (Number(lvl) === 1) {
      btn.disabled = true;
      btn.style.cursor = "not-allowed";
    } else {
      btn.onclick = () => {
        const encoded = encodeURIComponent(prompt);
        window.open(baseUrl + encoded, "_blank");
      };
    }

    aiButtons.appendChild(btn);
  };

  mkBtn("ChatGPT",   levels.chatgpt,   "https://chat.openai.com/?q=");
  mkBtn("Perplexity",levels.perplexity,"https://www.perplexity.ai/search?q=");
  mkBtn("Mistral",   levels.mistral,   "https://chat.mistral.ai/chat?message=");
}

