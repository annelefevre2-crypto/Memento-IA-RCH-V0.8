// ======================================================================
// uiScan.js — Version stable (lecture fichier + caméra + decodeFiche)
// ======================================================================

import { decodeFiche } from "../core/compression.js";

// --------------------------------------------------
// ELEMENTS UI
// --------------------------------------------------

const qrFileInput = document.getElementById("qrFileInput");
const qrFileResult = document.getElementById("qrFileResult");

const btnStartCam = document.getElementById("btnStartCam");
const btnStopCam = document.getElementById("btnStopCam");
const qrCamResult = document.getElementById("qrCamResult");
const videoElem = document.getElementById("qrVideo");

let scanner = null;

// ======================================================================
// 1) LECTURE QR VIA FICHIER
// ======================================================================

if (qrFileInput) {
    qrFileInput.addEventListener("change", async (ev) => {
        const file = ev.target.files[0];
        if (!file) return;

        qrFileResult.textContent = "Lecture...";

        try {
            const text = await window.QrScanner.scanImage(file, {
                returnDetailedScanResult: false
            });

            qrFileResult.textContent = "QR détecté :\n" + text;

            // Décodage JSON compressé
            const fiche = decodeFiche(text);

            qrFileResult.textContent +=
                "\n\nJSON décodé :\n" + JSON.stringify(fiche, null, 2);

        } catch (err) {
            qrFileResult.textContent = "❌ Erreur : " + err.message;
        }
    });
}

// ======================================================================
// 2) LECTURE QR VIA CAMÉRA
// ======================================================================

if (btnStartCam && btnStopCam && videoElem) {
    btnStartCam.addEventListener("click", async () => {
        qrCamResult.textContent = "Activation caméra…";

        try {
            scanner = new window.QrScanner(
                videoElem,
                (text) => {
                    qrCamResult.textContent = "QR détecté :\n" + text;

                    try {
                        const fiche = decodeFiche(text);
                        qrCamResult.textContent +=
                            "\n\nJSON :\n" + JSON.stringify(fiche, null, 2);
                    } catch (e) {
                        qrCamResult.textContent +=
                            "\n\nErreur decodeFiche : " + e.message;
                    }

                    // Arrêt auto après détection
                    scanner.stop();
                    btnStartCam.disabled = false;
                    btnStopCam.disabled = true;
                },
                { returnDetailedScanResult: true }
            );

            await scanner.start();
            btnStartCam.disabled = true;
            btnStopCam.disabled = false;

            qrCamResult.textContent = "Caméra activée — Scanne un QR.";
        } catch (err) {
            qrCamResult.textContent = "❌ Erreur caméra : " + err.message;
        }
    });

    btnStopCam.addEventListener("click", async () => {
        if (scanner) await scanner.stop();
        btnStartCam.disabled = false;
        btnStopCam.disabled = true;
        qrCamResult.textContent = "Caméra arrêtée.";
    });
}
