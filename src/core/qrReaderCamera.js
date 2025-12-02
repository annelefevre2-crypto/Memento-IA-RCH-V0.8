// ======================================================
// qrReaderCamera.js — Lecture QR via caméra (module technique)
// ======================================================
//
// - Gère l'instance QrScanner unique
// - Normalise le résultat (string / ScanResult / objet iOS...)
// - Expose startCameraScan() et stopCameraScan()
// - NE fait AUCUNE manipulation d'UI
// ======================================================

let currentScanner = null;

/**
 * Normalise le résultat renvoyé par QrScanner en string.
 * Gère les cas :
 *  - string simple
 *  - { data: "..." }
 *  - { data: { ... } }
 */
function extractTextFromScanResult(result) {
  if (!result) return "";

  // QrScanner peut appeler le callback avec directement une string
  if (typeof result === "string") return result;

  // ScanResult : { data: "...", cornerPoints: [...] }
  if (typeof result.data === "string") return result.data;

  // Cas tordu iOS : data est un objet
  if (result.data && typeof result.data === "object") {
    try {
      return JSON.stringify(result.data);
    } catch {
      return "";
    }
  }

  // Fallback : on tente de stringify
  try {
    return JSON.stringify(result);
  } catch {
    return "";
  }
}

/**
 * Démarre le scan caméra.
 *
 * @param {HTMLVideoElement} videoElement
 * @param {(rawText: string) => void} onText
 */
export async function startCameraScan(videoElement, onText) {
  if (!window.QrScanner) {
    throw new Error("QrScanner n'est pas chargé (window.QrScanner absent).");
  }
  if (!videoElement) {
    throw new Error("Élément <video> non fourni.");
  }

  // Si une instance existe déjà, on la nettoie
  if (currentScanner) {
    try {
      await currentScanner.stop();
      currentScanner.destroy();
    } catch (_) {}
    currentScanner = null;
  }

  currentScanner = new window.QrScanner(
    videoElement,
    (scanResult) => {
      console.log("[CAM] Résultat brut QrScanner :", scanResult);
      const text = extractTextFromScanResult(scanResult);
      console.log("[CAM] Texte normalisé :", text);
      if (text) {
        onText(text);
      }
    },
    {
      // On veut les infos détaillées (cornerPoints, etc.)
      returnDetailedScanResult: true
    }
  );

  // On privilégie la caméra arrière si dispo
  await currentScanner.start({ facingMode: "environment" });
}

/**
 * Arrête et détruit le scanner actuel.
 */
export async function stopCameraScan() {
  if (!currentScanner) return;
  try {
    await currentScanner.stop();
    currentScanner.destroy();
  } catch (e) {
    console.warn("[CAM] Erreur à l'arrêt du scanner :", e);
  } finally {
    currentScanner = null;
  }
}
