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
    // TYPE : SELECT
    // --------------------------
    else if (v.type === "select") {
      inputEl = document.createElement("select");
      v.options.forEach(opt => {
        const o = document.createElement("option");
        o.value = opt;
        o.textContent = opt;
        inputEl.appendChild(o);
      });
    }

    // --------------------------
    // TYPE : GEOLOC (bouton GPS + champs lat/lon)
    // --------------------------
    else if (v.type === "geoloc") {
      inputEl = document.createElement("div");

      const btn = document.createElement("button");
      btn.textContent = "Acquérir position";
      btn.type = "button";

      const lat = document.createElement("input");
      lat.placeholder = "Latitude";
      lat.dataset.id = v.id + "_lat";

      const lon = document.createElement("input");
      lon.placeholder = "Longitude";
      lon.dataset.id = v.id + "_lon";

      btn.onclick = () => {
        navigator.geolocation.getCurrentPosition(pos => {
          lat.value = pos.coords.latitude.toFixed(6);
          lon.value = pos.coords.longitude.toFixed(6);
        });
      };

      inputEl.appendChild(btn);
      inputEl.appendChild(lat);
      inputEl.appendChild(lon);
    }

    // --------------------------
    // COMMON ATTRIBUTES
    // --------------------------
    inputEl.dataset.id = v.id;

    wrapper.appendChild(inputEl);
    container.appendChild(wrapper);
  });
}


// =================================================================
// Lire toutes les valeurs du formulaire
// =================================================================
export function getValues(fiche) {
  const vals = {};

  fiche.prompt.variables.forEach(v => {
    const el = document.querySelector(`[data-id="${v.id}"]`);

    if (!el) {
      vals[v.id] = "";
      return;
    }

    vals[v.id] = el.value;
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
