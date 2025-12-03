// ======================================================
// uiCamera.js — Caméra unifiée + event QR détecté
// ======================================================

import { startCameraScan, stopCameraScan } from "../core/qrReaderCamera.js";

export function setupCameraUI() {
  const btnStart = document.getElementById("btnStartCam");
  const btnStop  = document.getElementById("btnStopCam");
  const video    = document.getElementById("qrVideo");
  const box      = document.getElementById("videoContainer");

  if (!btnStart || !btnStop || !video || !box) return;

  btnStop.disabled = true;

  btnStart.onclick = async () => {
    box.style.display = "block";
    btnStart.disabled = true;
    btnStop.disabled = false;

    await startCameraScan(video, (rawText) => {
      const event = new CustomEvent("qr-text-found", { detail: rawText });
      window.dispatchEvent(event);

      stopCameraScan();
      btnStart.disabled = false;
      btnStop.disabled = true;
      box.style.display = "none";
    });
  };

  btnStop.onclick = async () => {
    await stopCameraScan();
    btnStart.disabled = false;
    btnStop.disabled = true;
    box.style.display = "none";
  };
}
