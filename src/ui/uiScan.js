import { decodeFiche } from "../core/compression.js";
import { buildVariablesUI, getValues, generatePrompt } from "../core/variables.js";

// =========================================
// Sélecteurs
// =========================================
const metaBox = document.getElementById("metaHeader");
const scanVars = document.getElementById("scanVariables");
const qrRaw = document.getElementById("qrRaw");
const promptOut = document.getElementById("promptResult");
const aiZone = document.getElementById("aiButtons");

// =========================================
// 1. Affichage META
// =========================================
function showMeta(meta) {
  metaBox.innerHTML = `
    <div><b>Catégorie :</b> ${meta.categorie}</div>
    <div><b>Titre :</b> ${meta.titre}</div>
    <div><b>Objectif :</b> ${meta.objectif}</div>
    <div><b>Concepteur :</b> ${meta.concepteur}</div>
    <div><b>Mise à jour :</b> ${meta.date}</div>
  `;
}

// =========================================
// 2. Construction des boutons IA dynamiques
// =========================================
function buildAIButtons(aiRatings, prompt) {

  aiZone.innerHTML = "";

  const IA = [
    { id: "ChatGPT", base: "https://chat.openai.com/?q=", score: aiRatings.ChatGPT },
    { id: "Perplexity", base: "https://www.perplexity.ai/search?q=", score: aiRatings.Perplexity },
    { id: "Mistral", base: "https://chat.mistral.ai/chat?q=", score: aiRatings.Mistral },
  ];

  IA.forEach(ai => {
    const btn = document.createElement("button");
    btn.textContent = ai.id;

    if (ai.score == 3) btn.style.background = "#2ecc71";
    else if (ai.score == 2) btn.style.background = "#f1c40f";
    else { btn.style.background = "#bdc3c7"; btn.disabled = true; }

    btn.className = "btn-add-var";

    btn.onclick = () => {
      const url = ai.base + encodeURIComponent(prompt);
      window.open(url, "_blank");
    };

    aiZone.appendChild(btn);
  });
}

// =========================================
// 3. Lecture via Image
// =========================================
const qrFileInput = document.getElementById("qrFileInput");

qrFileInput.addEventListener("change", async ev => {
  const file = ev.target.files[0];
  if (!file) return;

  const result = await window.QrScanner.scanImage(file);
  handleDecoded(result);
});

// =========================================
// 4. Lecture via caméra
// =========================================
let scanner = null;

document.getElementById("btnStartCam").onclick = async () => {
  const video = document.getElementById("qrVideo");
  scanner = new window.QrScanner(video, r => handleDecoded(r), { returnDetailedScanResult: true });

  await scanner.start();
};

document.getElementById("btnStopCam").onclick = async () => {
  if (scanner) await scanner.stop();
};

// =========================================
// 5. Gestion du QR décodé
// =========================================
function handleDecoded(data) {

  const raw = typeof data === "string" ? data : data.data;
  qrRaw.textContent = raw;

  const fiche = decodeFiche(raw);

  showMeta(fiche.meta);

  buildVariablesUI(scanVars, fiche);

  window.currentFiche = fiche;
}

// =========================================
// 6. Génération du prompt final
// =========================================
document.getElementById("btnBuildPrompt").onclick = () => {
  const fiche = window.currentFiche;
  if (!fiche) return alert("Aucune fiche chargée");

  const vals = getValues(fiche);
  const basePrompt = generatePrompt(fiche, vals);

  const extra = document.getElementById("extra_input").value.trim();

  const finalPrompt = basePrompt + "\n\nInformations complémentaires :\n" + extra;

  promptOut.textContent = finalPrompt;

  // Boutons IA en fonction des scores
  buildAIButtons({
    ChatGPT: fiche.ai.ChatGPT,
    Perplexity: fiche.ai.Perplexity,
    Mistral: fiche.ai.Mistral
  }, finalPrompt);
};

// =========================================
// 7. Copier le prompt
// =========================================
document.getElementById("btnCopy").onclick = () => {
  navigator.clipboard.writeText(promptOut.textContent);
  alert("Prompt copié !");
};
