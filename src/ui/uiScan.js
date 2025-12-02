// ========================================================================
// uiScan.js — Lecture + exploitation de fiche IA RCH
// ========================================================================

import { decodeFiche } from "../core/compression.js";

// ---------- Sélecteurs ----------
const sectionScan = document.querySelector(".card:nth-of-type(1)");
const sectionMeta = document.querySelector(".card:nth-of-type(2)");
const sectionVars = document.querySelector(".card:nth-of-type(3)");
const sectionExtra = document.querySelector(".card:nth-of-type(4)");
const sectionPrompt = document.querySelector(".card:nth-of-type(5)");

const metaHeader = document.getElementById("metaHeader");
const scanVariables = document.getElementById("scanVariables");
const extraInput = document.getElementById("extra_input");
const promptResult = document.getElementById("promptResult");
const aiButtons = document.getElementById("aiButtons");

// Masquer d’abord toutes les sections d’exploitation
sectionMeta.style.display =
sectionVars.style.display =
sectionExtra.style.display =
sectionPrompt.style.display = "none";

// ========================================================================
// FONCTION CENTRALE – Quand un QR est décodé
// ========================================================================
function onFicheDecoded(fiche) {

    // -------- Masquer la zone scan --------
    sectionScan.style.display = "none";

    // -------- Afficher les sections 2 à 5 --------
    sectionMeta.style.display =
    sectionVars.style.display =
    sectionExtra.style.display =
    sectionPrompt.style.display = "block";

    // -------- Remplir les métadonnées --------
    metaHeader.innerHTML = `
      <h3>${fiche.meta?.titre || "Titre inconnu"}</h3>
      <p><b>Catégorie :</b> ${fiche.meta?.categorie || "-"}</p>
      <p><b>Objectif :</b> ${fiche.meta?.objectif || "-"}</p>
      <p><b>Mis à jour le :</b> ${fiche.meta?.date || "-"}</p>
      <p><b>Concepteur :</b> ${fiche.meta?.concepteur || "-"}</p>
    `;

    // -------- Construire les champs variables --------
    scanVariables.innerHTML = "";
    fiche.prompt.variables.forEach(v => {

        const block = document.createElement("div");
        block.className = "var-field";

        const label = document.createElement("label");
        label.textContent = v.label;
        block.appendChild(label);

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
            v.options.forEach(opt => {
                const o = document.createElement("option");
                o.value = opt;
                o.textContent = opt;
                field.appendChild(o);
            });
        }
        else if (v.type === "geoloc") {
            field = document.createElement("div");
            field.innerHTML = `
                <button class="btn-reset" id="${v.id}_gps">📍 Acquérir position</button>
                <input id="${v.id}_lat" placeholder="Latitude">
                <input id="${v.id}_lon" placeholder="Longitude">
            `;
            setTimeout(() => {
                document.getElementById(`${v.id}_gps`).onclick = () => {
                    navigator.geolocation.getCurrentPosition(pos => {
                        document.getElementById(`${v.id}_lat`).value = pos.coords.latitude.toFixed(6);
                        document.getElementById(`${v.id}_lon`).value = pos.coords.longitude.toFixed(6);
                    });
                };
            }, 50);
        }

        field.dataset.id = v.id;
        block.appendChild(field);
        scanVariables.appendChild(block);
    });

    window.currentFiche = fiche;
}

// ========================================================================
// LECTURE VIA FICHIER
// ========================================================================
document.getElementById("qrFileInput").addEventListener("change", async ev => {
    const file = e
