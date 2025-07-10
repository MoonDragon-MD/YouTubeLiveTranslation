// ==UserScript==
// @name         YouTube Directs with Translation via LibreTranslate
// @namespace    https://greasyfork.org/
// @version      1.0
// @description  Live subtitle translation via LibreTranslate (localhost:5000)
// @author       MoonDragon
// @match        https://www.youtube.com/watch*
// @grant        none
// @noframes
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Funzione per verificare se il video è una diretta
    function isLiveStream() {
        const player = document.getElementById('movie_player');
        return player && player.getElementsByClassName('ytp-live-badge').length > 0;
    }

    // Funzione per attivare i sottotitoli (se non attivi)
    function enableSubtitlesIfNeeded() {
        const subtitleButton = document.querySelector('.ytp-subtitles-button');
        if (subtitleButton && !subtitleButton.getAttribute('aria-pressed')) {
            subtitleButton.click(); // Attiva i sottotitoli
        }
    }

    // Funzione per tradurre il testo dei sottotitoli tramite LibreTranslate
    async function translateSubtitle(text) {
        const url = 'http://localhost:5000/translate'; // End-point di LibreTranslate
        const body = JSON.stringify({
            q: text,
            source: 'auto',   // Lingua di origine automatica
            target: 'it',     // Lingua di destinazione (italiano)
            format: 'text'
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body
        });

        if (!response.ok) {
            console.error('Errore durante la traduzione:', response.status);
            return text; // Restituisci il testo originale se la traduzione fallisce
        }

        const result = await response.json();
        return result.translatedText; // Restituisci il testo tradotto
    }

    // Funzione per intercettare e tradurre i sottotitoli
    function interceptSubtitles() {
        const subtitles = document.querySelectorAll('.ytp-caption-segment');
        subtitles.forEach(async (subtitle) => {
            if (subtitle && subtitle.innerText) {
                const originalText = subtitle.innerText;
                const translatedText = await translateSubtitle(originalText);
                subtitle.innerText = translatedText; // Sostituisci il sottotitolo con quello tradotto
            }
        });
    }

    // Funzione per avviare il processo di traduzione
    async function startTranslationProcess() {
        // Verifica se il video è una diretta
        if (isLiveStream()) {
            console.log('Video in diretta rilevato. Traducendo sottotitoli in tempo reale...');

            // Attiva i sottotitoli se non sono già attivi
            enableSubtitlesIfNeeded();

            // Intercetta e traduci i sottotitoli
            interceptSubtitles();
        } else {
            console.log('Non è un video in diretta, quindi non modifico i sottotitoli.');
        }
    }

    // Monitorare la disponibilità dei sottotitoli e avviare la traduzione
    setInterval(startTranslationProcess, 500); // Avvia ogni mezzo secondo per verificare i sottotitoli

})();

