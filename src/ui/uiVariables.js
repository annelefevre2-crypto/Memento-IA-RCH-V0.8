// ===============================================================
// uiVariables.js — Gestion UI des variables
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

  div.innerHTML = `
    <input class="input" placeholder="Label (ex : Code ONU)" id="var_label_${varCount}">
    <input class="input" placeholder="Identifiant (ex : code_onu)" id="var_id_${varCount}">

    <select class="input var-type" id="var_type_${varCount}">
      <option value="text">text</option>
      <option value="number">number</option>
      <option value="choice">choice</option>
      <option value="geoloc">geoloc</option>
    </select>

    <!-- Options pour type = choice -->
    <div id="var_options_block_${varCount}" style="display:none; margin-top:10px;">
      <label>
        Options (séparées par des ;)
        <input class="input" placeholder="ex : Eau ; Poudre ; CO2" id="var_options_${varCount}">
      </label>
    </div>

    <!-- Bloc GEOLOC -->
    <div id="var_geo_block_${varCount}" style="display:none; margin-top:10px;">
      <button class="btnSmall" type="button" id="btn_geo_${varCount}">📍 Acquérir position</button>

      <input class="input" placeholder="Latitude" id="var_lat_${varCount}" style="margin-top:8px;">
      <input class="input" placeholder="Longitude" id="var_lon_${varCount}" style="margin-top:8px;">
    </div>

    <label class="checkbox">
      <input type="checkbox" id="var_req_${varCount}">
      Obligatoire
    </label>

    <button class="btnSmall" data-del="${varCount}">Supprimer</button>
  `;

  // -------------------------
  // Gestion dynamique UI
  // -------------------------
  const typeSelect = div.querySelector(`#var_type_${varCount}`);
  const optBlock = div.querySelector(`#var_options_block_${varCount}`);
  const geoBlock = div.querySelector(`#var_geo_block_${varCount}`);
  const geoBtn = div.querySelector(`#btn_geo_${varCount}`);

  typeSelect.addEventListener("change", () => {
    if (typeSelect.value === "choice") {
      optBlock.style.display = "block";
      geoBlock.style.display = "none";
    }
    else if (typeSelect.value === "geoloc") {
      optBlock.style.display = "none";
      geoBlock.style.display = "block";
    }
    else {
      optBlock.style.display = "none";
      geoBlock.style.display = "none";
    }
  });

  // -------------------------
  // Bouton d'acquisition GPS
  // -------------------------
  geoBtn.addEventListener("click", () => {
    const latField = document.getElementById(`var_lat_${varCount}`);
    const lonField = document.getElementById(`var_lon_${varCount}`);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latField.value = pos.coords.latitude.toFixed(6);
        lonField.value = pos.coords.longitude.toFixed(6);
      },
      (err) => {
        alert("Impossible d'acquérir la position : " + err.message);
      }
    );
  });

  // -------------------------
  // Suppression d'une variable
  // -------------------------
  div.querySelector("button[data-del]").addEventListener("click", () => {
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

    if (ids.has(id)) {
      throw new Error(`Identifiant '${id}' dupliqué.`);
    }
    ids.add(id);

    const variable = { id, label, type, required: req };

    // ---- TYPE CHOICE ----
    if (type === "choice") {
      const raw = document.getElementById(`var_options_${idx}`).value.trim();

      if (!raw)
        throw new Error(`La variable '${label}' est de type choice mais n’a aucune option.`);

      variable.options = raw
        .split(";")
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }

    // ---- TYPE GEOLOC ----
    if (type === "geoloc") {
      const lat = document.getElementById(`var_lat_${idx}`).value.trim();
      const lon = document.getElementById(`var_lon_${idx}`).value.trim();

      variable.latitude = lat || null;
      variable.longitude = lon || null;
    }

    vars.push(variable);
  }

  return vars;
}
