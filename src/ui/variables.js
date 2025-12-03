// ======================================================================
// variables.js — UI dynamique pour la LECTURE d’une fiche
// (Corrigé : la géolocalisation apparaît uniquement dans scan.html)
// ======================================================================

// Détection automatique : on est dans scan.html ?
const isScanMode = window.location.pathname.includes("scan.html");


// =================================================================
// Construire l’UI dynamique des variables
// =================================================================
export function buildVariablesUI(container, fiche) {
  container.innerHTML = "";

  fiche.prompt.variables.forEach(v => {

    const wrapper = document.createElement("div");
    wrapper.className = "var-field";

    // Label
    const label = document.createElement("label");
    label.textContent = v.label;
    label.htmlFor = v.id;
    wrapper.appendChild(label);

    let inputEl = null;

    // --------------------------
    // TYPE : TEXT
    // --------------------------
    if (v.type === "text") {
      inputEl = document.createElement("input");
      inputEl.type = "text";
    }

    // --------------------------
    // TYPE : NUMBER
    // --------------------------
    else if (v.type === "number") {
      inputEl = document.createElement("input");
      inputEl.type = "number";
    }

    // --------------------------
    // TYPE : SELECT (choice)
    // --------------------------
    else if (v.type === "choice") {
      inputEl = document.createElement("select");
      v.options.forEach(opt => {
        const o = document.createElement("option");
        o.value = opt;
        o.textContent = opt;
        inputEl.appendChild(o);
      });
    }

    // --------------------------
    // TYPE : GEOLOC 
    // -> Affiché UNIQUEMENT dans scan.html
    // --------------------------
    else if (v.type === "geoloc") {

      inputEl = document.createElement("div");

      if (isScanMode) {
        const btn = document.createElement("button");
        btn.textContent = "📍 Acquérir position";
        btn.type = "button";
        btn.className = "btnSmall";

        const lat = document.createElement("input");
        lat.placeholder = "Latitude";
        lat.dataset.id = v.id + "_lat";
        lat.className = "geo-input";

        const lon = document.createElement("input");
        lon.placeholder = "Longitude";
        lon.dataset.id = v.id + "_lon";
        lon.className = "geo-input";

        btn.onclick = () => {
          navigator.geolocation.getCurrentPosition(pos => {
            lat.value = pos.coords.latitude.toFixed(6);
            lon.value = pos.coords.longitude.toFixed(6);
          }, err => {
            alert("Erreur GPS : " + err.message);
          });
        };

        inputEl.appendChild(btn);
        inputEl.appendChild(lat);
        inputEl.appendChild(lon);
      } 
      else {
        // Mode création => rien de plus 
        const info = document.createElement("div");
        info.className = "helper-small";
        info.textContent = "(géolocalisation — champs générés automatiquement lors du scan)";
        inputEl.appendChild(info);
      }
    }

    // --------------------------
    // ATTRIBUT COMMUN
    // --------------------------
    inputEl.dataset.id = v.id;

    wrapper.appendChild(inputEl);
    container.appendChild(wrapper);
  });
}


// =================================================================
// Récupérer toutes les valeurs du formulaire (scan mode only)
// =================================================================
export function getValues(fiche) {
  const vals = {};

  fiche.prompt.variables.forEach(v => {

    if (v.type === "geoloc") {
      // GPS => latitude + longitude
      const lat = document.querySelector(`[data-id="${v.id}_lat"]`);
      const lon = document.querySelector(`[data-id="${v.id}_lon"]`);

      vals[v.id] = (lat && lon) ? `${lat.value},${lon.value}` : "";
      return;
    }

    // Variables simples
    const el = document.querySelector(`[data-id="${v.id}"]`);
    vals[v.id] = el ? el.value : "";
  });

  return vals;
}


// =================================================================
// Générer le prompt final
// =================================================================
export function generatePrompt(fiche, vals) {
  let p = fiche.prompt.base;
  Object.keys(vals).forEach(k => {
    p = p.replaceAll(`{{${k}}}`, vals[k]);
  });
  return p;
}
