// ===============================================================
// uiPrompt.js — Gestion du champ prompt
// ===============================================================

const MAX_PROMPT = 4000;

export function initPromptUI() {
  const p = document.getElementById("prompt_input");
  const c = document.getElementById("prompt_count");

  p.addEventListener("input", () => {
    const len = p.value.length;
    c.textContent = `${len} / ${MAX_PROMPT}`;

    if (len > MAX_PROMPT) {
      p.value = p.value.substring(0, MAX_PROMPT);
    }
  });
}

export function getPromptFromUI() {
  return document.getElementById("prompt_input").value.trim();
}
