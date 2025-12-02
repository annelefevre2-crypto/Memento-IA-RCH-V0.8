// ===============================================================
// uiVariables.js — Gestion UI des variables (PAGE CREATION)
// ===============================================================

let varCount = 0;
const MAX_VARS = 10;

export function initVariablesUI() {
  document.getElementById("btnAddVariable").addEventListener("click", addVariableUI);
  document.getElementById("variablesContainer").innerHTML = "";
  varCount = 0;
  addVariableUI(); // Ajoute une variable vide par défaut
}

export function addVariableUI() {
  if (varCount >= MAX_VARS) return alert("Maximum 10 variables.");

  varCount++;

  const container = document.getElementById("variablesContainer");

  const div = document.createElement("div");
  div.className = "variableBlock";
  div.dataset.index = varCount;

  // IMPORTANT : aucun élément de géolocalisation dans l’onglet création !
  div.innerHTML = `
    <div class="varHeader">
      <label class="checkbox">
        <input type="checkbox" id="var_req_${varCount}">
        Obligatoire
      </label>
      <button class="btnSmall" data-del="${varCount}">Supprimer</button>
    </div>

    <input class="input" placeholder="Label (ex : Code ONU)" id="var_label_${varCount}">
    <input class="input" placeholder="Identifiant (ex : code_onu)" id="var_id_${varCount}">

    <select class="input" id="var_type_${varCount}">
      <option value="text">text</option>
      <option value="number">number</option>
      <option value="choice">choice</option>
      <option value="geoloc">geoloc</option>
    </select>

    <!-- Aucun champ supplémentaire ici -->
  `;

  // Bouton supprimer
  div.querySelector("button").addEventListener("click", () => {
    div.remove();
  });

  container.appendChild(div);
}


// Extraction du JSON final pour l’export QR
export function getVariablesFromUI() {
  const blocks = [...document.querySelectorAll(".variableBlock")];
  const vars = [];
  const ids = new Set();

  for (const b of blocks) {
    const idx = b.dataset.index;

    const label = document.getElementById(`var_label_${idx}`).value.trim();
    const id = document.getElementById(`var_id_${idx}`).value.trim();
    const type = document.getElementById(`var_type_${idx}`).value;
    const req = document.getElementById(`var_req_${idx}`).checked;

    if (!label || !id) continue;

    if (ids.has(id)) {
      throw new Error(`Identifiant '${id}' dupliqué.`);
    }
    ids.add(id);

    vars.push({
      id,
      label,
      type,
      required: req
    });
  }

  return vars;
}
