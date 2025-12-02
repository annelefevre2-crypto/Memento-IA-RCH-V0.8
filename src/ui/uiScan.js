import { decodeFiche } from "../core/compression.js";
import { buildVariablesUI, getValues, generatePrompt } from "../core/variables.js";

// ==================================================================
// Sélecteurs
// ==================================================================
const metaBox = document.getElementById("metaHeader");
const scanVars = document.getElementById("scanVariables");
const qrRaw = document.getElementById("qrRaw");
const promptOut = document.getElementById("promptResult");
const aiZone = document.getElementById("aiButtons");

const videoContainer = document.getElementById("videoContainer");
const video = document.getElementById("qrVideo");

// Masqué par défaut
videoContainer.style.display = "none";

// ==================================================================
// Affichage META
// ==================================================================
function showMeta(meta) {
  metaBox.innerHTML = `
    <div class="meta-line"><b>Catégorie :</b> ${meta.categorie}</div>
    <div class="meta-line"><b>Titre :</b> ${meta.titre}</div>
    <div class="meta-line"><b>Objectif :</b> ${meta.objectif}</div>
    <div class="meta-line"><b>Concepteur :</b> ${meta.concepteur}</div>
    <div class="meta-line"><b>Mise à jour :</b> ${meta.date}</div>
  `;

  metaBox.style.display = "block";
}

// ==================================================================
// Génération des boutons IA (dynamiques)
// ==================================================================
function buildAIButtons(aiRatings, prompt) {
  aiZone.innerHTML = "";  // reset

  const IA = [
    { id: "ChatGPT", base: "https://chat.openai.com/?q=", score: aiRatings.ChatGPT },
    { id: "Perplexity", base: "https://www.perplexity.ai/search?q=", score: aiRatings.Perplexity },
    { id: "Mistral", base: "https://chat.mistral.ai/chat?q=", score: aiRatings.Mistral }
  ];

  IA.forEach(ai => {
    const btn = document.createElement("button");
    btn.classList.add("btn-add-var");
    btn.textContent = ai.id;

    // Couleurs selon score
    if (ai.score == 3) btn.style.background = "#2ecc71";      // vert
    else if (ai.score == 2) btn.style.background = "#f1c40f"; // orange
    else {
      btn.style.background = "#bdc3c7";                        // gris
      btn.disabled = true;
    }

    btn.onclick = () => {
      const url = ai.base + encodeURIComponent(prompt);
      window.open(url, "_blank");
    };

    aiZone.appendChild(btn);
  });

  aiZone.style.display = "block";
}

// ==================================================================
// Lecture via image
// ==================================================================
const qrFileInput = document.getElementById("qrFileInput");

qrFileInput.addEventListener("change", async ev => {
  const file = ev.target.files[0];
  if (!file) return;

  const result = await window.QrScanner.scanImage(file);
  handleDecoded(result);
});

// ==================================================================
// Lecture via caméra
// ==================================================================
let scanner = null;

document.getElementById("btnStartCam").onclick = async () => {
  videoContainer.style.display = "block";

  scanner = new window.QrScanner(
    video,
    (r) => handleDecoded(r),
    { returnDetailedScanResult: true }
  );

  await scanner.start();
};

document.getElementById("btnStopCam").onclick = async () => {
  if (scanner) await scanner.stop();
  videoContainer.style.display = "none";
};

// ==================================================================
// Traitement du QR décodé
// ==================================================================
function handleDecoded(data) {
  // Masquer video
  if (scanner) scanner.stop();
  videoContainer.style.display = "none";

  // Récupération texte brut
  const raw = typeof data === "string" ? data : data.data;

  // Ne plus afficher le contenu brut !
  qrRaw.textContent = "";

  // Décodage JSON compacté
  const fiche = decodeFiche(raw);

  // META → affichage
  showMeta(fiche.meta);

  // Variables dynamiques
  buildVariablesUI(scanVars, fiche);

  window.currentFiche = fiche;
}

// ==================================================================
// Compilation du prompt final
// ==================================================================
document.getElementById("btnBuildPrompt").onclick = () => {
  const fiche = window.currentFiche;
  if (!fiche) return alert("Aucune fiche chargée");

  const vals = getValues(fiche);
  const basePrompt = generatePrompt(fiche, vals);

  const extra = document.getElementById("extra_input").value.trim();
  const finalPrompt =
    basePrompt +
    "\n\nInformations complémentaires :\n" +
    extra;

  promptOut.textContent = finalPrompt;

  // Générer les boutons IA après compilation
  buildAIButtons(
    {
      ChatGPT: fiche.ai.ChatGPT,
      Perplexity: fiche.ai.Perplexity,
      Mistral: fiche.ai.Mistral
    },
    finalPrompt
  );
};

// ==================================================================
// Copier le prompt
// ==================================================================
document.getElementById("btnCopy").onclick = () => {
  navigator.clipboard.writeText(promptOut.textContent);
  alert("Prompt copié !");
};
