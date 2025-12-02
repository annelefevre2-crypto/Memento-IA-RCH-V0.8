// ======================================================================
// scanModule.js — Gestion de la lecture QR fichier + caméra
// ======================================================================

import { decodeFiche } from "../core/compression.js";

// -------- Lecture via fichier -----------------------------------------
const qrInput = document.getElementById("qrFileInput");
const qrFileResult = document.getElementById("qrFileResult");

if (qrInput) {
    qrInput.addEventListener("change", async (ev) => {
        const file = ev.target.files[0];
        if (!file) return;

        qrFileResult.textContent = "Lecture en cours…";

        try {
            const text = await window.QrScanner.scanImage(file);
            const fiche = decodeFiche(text);
            qrFileResult.textContent = JSON.stringify(fiche, null, 2);
        } 
        catch (err) {
            qrFileResult.textContent = "❌ Erreur : " + err.message;
        }
    });
}

// -------- Lecture via caméra -----------------------------------------
let scanner = null;

const btnStart = document.getElementById("btnStartCam");
const btnStop = document.getElementById("btnStopCam");
const videoEl = document.getElementById("qrVideo");
const camResult = document.getElementById("qrCamResult");

if (btnStart && btnStop && videoEl) {
    btnStart.addEventListener("click", async () => {
        camResult.textContent = "Activation caméra…";

        scanner = new window.QrScanner(
            videoEl,
            (text) => {
                camResult.textContent = "QR détecté :\n" + text;
                try {
                    const fiche = decodeFiche(text);
                    camResult.textContent += "\n\nJSON :\n" + JSON.stringify(fiche, null, 2);
                } catch (e) {
                    camResult.textContent += "\n\nErreur decodeFiche : " + e.message;
                }
            },
            { returnDetailedScanResult: true }
        );

        await scanner.start();
        btnStart.disabled = true;
        btnStop.disabled = false;

        camResult.textContent = "Caméra activée — Scanne le QR.";
    });

    btnStop.addEventListener("click", async () => {
        if (scanner) await scanner.stop();
        btnStart.disabled = false;
        btnStop.disabled = true;
        camResult.textContent = "Caméra arrêtée.";
    });
}
