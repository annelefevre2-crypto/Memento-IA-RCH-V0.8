// ===============================================================
// uiVariables.js — Gestion UI des variables (avec support choice)
// ===============================================================

let varCount = 0;
const MAX_VARS = 10;

export function initVariablesUI() {
  document.getElementById("btnAddVariable").addEventListener("click", addVariableUI);
  document.getElementById("variablesContainer").innerHTML = "";
  varCount = 0;
  addVariableUI(); // ajoute une variable vide par défaut
}

export function addVariableUI() {
  if (varCount >= MAX_VARS) return alert("Maximum 10 variables.");

  varCount++;

  const container = document.getElementById("variablesContainer");

  const div = document.createElement("div");
  div.className = "variableBlock";
  div.dataset.index = varCount;

  // -----------------------------------------------
  // UI : Ajout du champ options pour les types "choice"
  // -----------------------------------------------
  div.innerHTML = `
    <input class="input" placeholder="Label (ex : Code ONU)" id="var_label_${varCount}">

    <input class="input" placeholder="Identifiant (ex : code_onu)" id="var_id_${varCount}">

    <select class="input var-type" id="var_type_${varCount}">
      <option value="text">text</option>
      <option value="number">number</option>
      <option value="choice">choice</option>
    </select>

    <!-- Champ options (masqué par défaut) -->
    <div id="var_options_block_${varCount}" style="display:none; margin-top:10px;">
      <label>
        Options (séparées par des ;)  
        <input class="input" placeholder="ex : Eau ; Poudre ; CO2" id="var_options_${varCount}">
      </label>
    </div>

    <label class="checkbox">
      <input type="checkbox" id="var_req_${varCount}">
      Obligatoire
    </label>

    <button class="btnSmall" data-del="${varCount}">Supprimer</button>
  `;

  // -----------------------------------------------
  // Gestion dynamique de l'affichage du champ options
  // -----------------------------------------------
  const typeSelect = div.querySelector(`#var_type_${varCount}`);
  const optBlock = div.querySelector(`#var_options_block_${varCount}`);

  typeSelect.addEventListener("change", () => {
    if (typeSelect.value === "choice") {
      optBlock.style.display = "block";
    } else {
      optBlock.style.display = "none";
    }
  });

  // -----------------------------------------------
  // Suppression d'une variable
  // -----------------------------------------------
  div.querySelector("button").addEventListener("click", () => {
    div.remove();
    varCount--;
  });

  container.appendChild(div);
}

// ===============================================================
// Extraction du JSON final
// ===============================================================
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

    // Vérification doublons
    if (ids.has(id)) {
      throw new Error(`Identifiant '${id}' dupliqué.`);
    }
    ids.add(id);

    const variable = { id, label, type, required: req };

    // ---------------------------------------------------------
    // Gestion du type choice → extraction des options
    // ---------------------------------------------------------
    if (type === "choice") {
      const raw = document.getElementById(`var_options_${idx}`).value.trim();

      if (!raw) {
        throw new Error(`La variable '${label}' est de type choice mais ne possède aucune option.`);
      }

      const options = raw
        .split(";")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (options.length === 0) {
        throw new Error(`La variable '${label}' est de type choice mais aucune option valide n’a été fournie.`);
      }

      variable.options = options;
    }

    vars.push(variable);
  }

  return vars;
}
