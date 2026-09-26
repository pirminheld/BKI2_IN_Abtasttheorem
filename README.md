# Abtasttheorem verstehen · BKI2 IN

Homepage zum 45-minütigen Unterrichtsbesuch am 30.09.2026. Homepage: https://pirminheld.github.io/BKI2_IN_Abtasttheorem/

## Verwendung

`index.html` direkt öffnen oder statisch bereitstellen. Kein Build und keine externen Bibliotheken erforderlich.

1. Messproblem: nur drei Messpunkte sichtbar; tatsächliches Signal per Knopfdruck aufdecken.
2. A/B/C: Abtastintervalle 4/2/1 ms, einzeln oder automatisch erfassen, Tabelle; bei B Startzeit auf 1 ms verschieben.
3. [Aliasinglabor](https://pirminheld.github.io/BKI2_IN_Abtasttheorem/#lab): Signalfrequenz 25–1000 Hz und Abtastfrequenz 25–3000 Hz unabhängig einstellen; Startzeit und Zeitfenster wählen. Bei Unterabtastung erscheint automatisch eine orange Sinuskurve, die zu allen Messpunkten passt. Original und Alias lassen sich einzeln ausblenden.
4. [Propeller](https://pirminheld.github.io/BKI2_IN_Abtasttheorem/#wheel): Ein automatisch laufender Propeller mit Drehfrequenzregler von 0 bis 15 Hz und fester Modell-Abtastrate von 12 Hz. Die Drehzahl lässt sich im Lauf ändern, ohne die Bewegung oder Messhistorie zurückzusetzen. Darunter erscheint der zugehörige Signalverlauf mit Abtastpunkten und Alias-Kurve. Pause und ein Vergleich mit der tatsächlichen Drehung sind möglich.
5. Sicherung: Abtasttheorem aufdecken und Auswahlaufgabe zu fmax = 300 Hz prüfen.

`Arbeitsblatt.pdf` ist die unveränderte zweiseitige Schülerfassung. Die Musterlösung wird nicht veröffentlicht. `QR_Code.png` führt zur Homepage. Im lokalen Arbeitsblattordner liegt eine Internetverknüpfung.

## Fachliches Modell

U(t) = 2 + sin(2π · f · t), t in Sekunden. Im Einstieg und A/B/C gilt f = 250 Hz, im Labor ist f einstellbar. Abtastzeiten t0 + k/fa. Die Kurven zeigen analoge Spannungen; Quantisierung ist ausgeblendet.

Für Unterabtastung wird ein passender Alias mit vorzeichenbehafteter Frequenz f' = f − round(f/fa) · fa erzeugt. Die Phase 2π(f − f')t0 erhält die Gleichheit an sämtlichen Abtastpunkten auch bei verschobener Startzeit. Bei fa = 2f wird nur im Fall einer konstanten Messreihe diese konstante Alternative gezeigt; andernfalls wird der phasenabhängige Grenzfall erläutert. Bei fa > 2f wird kein langsamerer Alias angezeigt. Eindeutigkeit setzt die angegebene Bandbegrenzung voraus. Geradlinige Punktverbindungen werden nicht als Rekonstruktion dargestellt.

Fachlicher Hintergrund: [NI: Acquiring an Analog Signal – Nyquist Sampling Theorem and Aliasing](https://www.ni.com/en/shop/data-acquisition/measurement-fundamentals/analog-fundamentals/acquiring-an-analog-signal--bandwidth--nyquist-sampling-theorem-.html), Abschnitt Sample Rate. Eigene Aufgaben, Diagramme und Berechnungen.

Beim Propeller wird ein markiertes Blatt verfolgt. `propeller-model.js` integriert die tatsächliche Drehstellung über die Zeit. Änderungen der Drehfrequenz erhalten Phase, Zeit und bisherige Messwerte. Aufnahmen erfolgen weiterhin auf dem festen Raster k/12 s. Aus aufeinanderfolgenden erfassten Drehstellungen entsteht jeweils die kürzeste mögliche Drehung; ihre Sinusprojektion liefert die orange Kurve. Bei konstanter Drehzahl entspricht dies f' = f − round(f/12) · 12. Ein negatives Vorzeichen bedeutet Rückwärtslauf. Reale und interpretierte Stellung stimmen an jedem Aufnahmezeitpunkt überein. Eine halbe Umdrehung ist mehrdeutig.

Propeller und Signal verwenden dieselbe interpolierte Phase. Zur Darstellung zwischen zwei bereits erfassten Bildern wird die Anzeige um ein Abtastintervall verzögert. Der Verlauf zeigt die letzten zwei Modellsekunden; gespeicherte Messwerte und Frequenzsegmente werden nach drei Sekunden begrenzt. Die Animation läuft in vierfacher Zeitlupe und pausiert in ausgeblendeten Bereichen oder Hintergrund-Tabs. Bei einer Systemeinstellung für reduzierte Bewegung startet sie pausiert. Die feste Modellrate von 12 Hz ist keine Behauptung über eine Bildrate des menschlichen Auges. Unmarkierte identische Blätter, Belichtungszeit und Rolling Shutter sind nicht Teil des Modells. Hintergrund: [UC Davis: Temporal Aliasing – The Wagon Wheel Effect](https://www.cs.ucdavis.edu/~koehl/Teaching/ECS17/Chapters/Chapter1/wagon.html).

## Gestaltung und Prüfung

`style.css`, `FTS_logo.png` und `impressum.html` unverändert aus `../BKI2_IN_ADC_Quantisierung` übernommen. `sampling.css` ergänzt die neue Oberfläche.

`node test.cjs`: 26.527 bestandene Prüfungen zu Abtastpunkten, Frequenzgrenzen, Aliaswerten auch bei verschobenen Startzeiten, Propellerrichtungen und übereinstimmenden Winkelstellungen an den Aufnahmezeitpunkten.

`node test-propeller.cjs`: 160.900 Prüfungen des neuen dynamischen Propellermodells; insbesondere feste Abtastzeitpunkte bei Drehzahländerungen, Erhalt der Drehstellung und Messwerte sowie passende Aliaswerte an allen Aufnahmen.

`python test-browser.py`: Bedienprüfung mit Python Playwright und installiertem Chrome. Prüft die bisherigen Bereiche, automatische Propelleranimation, Drehzahländerungen ohne Neustart, Rückwärtslauf, Stillstand, Grenzfall, Pause/Fortsetzen und Übereinstimmung von Propellerwinkel und Signalmarkierung. Dazu Navigation und Darstellung bei 1440, 768 und 390 Pixeln Breite. Ohne `SITE_URL` wird die lokale Datei geöffnet; mit dieser Umgebungsvariable lässt sich die veröffentlichte Seite prüfen. Screenshots liegen im ignorierten Ordner `tmp/`.

Nutzung und rechtliche Angaben: siehe `impressum.html`.
