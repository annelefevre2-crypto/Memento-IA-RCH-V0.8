// ======================================================================
// uiPrompt.js — Gestion du prompt IA RCH
// ======================================================================

const MAX_PROMPT = 4000;

export function initPromptUI() {
    const input = document.getElementById("prompt_input");
    const counter = document.getElementById("prompt_count");

    if (!input || !counter) return;

    input.addEventListener("input", () => {
        if (input.value.length > MAX_PROMPT) {
            input.value = input.value.slice(0, MAX_PROMPT);
        }
        counter.textContent = `${input.value.length} / ${MAX_PROMPT}`;
    });
}

export function getPromptFromUI() {
    const input = document.getElementById("prompt_input");
    if (!input) throw new Error("Champ prompt introuvable.");
    return input.value.trim();
}

export function resetPromptUI() {
    const input = document.getElementById("prompt_input");
    const counter = document.getElementById("prompt_count");

    if (input) input.value = "";
    if (counter) counter.textContent = `0 / ${MAX_PROMPT}`;
}
