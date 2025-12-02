// ===============================================================
// uiMeta.js — Gestion de la section “Métadonnées de la fiche”
// ===============================================================

// Renvoie un objet meta conforme au JSON final
export function getMetaFromUI() {
  return {
    categorie: document.getElementById("meta_categorie").value.trim(),
    titre: document.getElementById("meta_titre").value.trim(),
    objectif: document.getElementById("meta_objectif").value.trim(),
    concepteur: document.getElementById("meta_concepteur").value.trim(),
    date_maj: document.getElementById("meta_date").value
  };
}

// Applique les valeurs par défaut ENSOSP
export function resetMetaUI() {
  document.getElementById("meta_categorie").value = "";
  document.getElementById("meta_titre").value = "";
  document.getElementById("meta_objectif").value = "";
  document.getElementById("meta_concepteur").value = "";
  
  const now = new Date().toISOString().split("T")[0];
  document.getElementById("meta_date").value = now;
}

// Validation minimale
export function validateMeta(meta) {
  if (!meta.titre) throw new Error("Le titre de la fiche est obligatoire.");
  if (!meta.objectif) throw new Error("L’objectif de la fiche est obligatoire.");
}
