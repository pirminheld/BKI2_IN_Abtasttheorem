# Abtasttheorem verstehen · BKI2 IN

Homepage zum 45-minütigen Unterrichtsbesuch am 30.09.2026. Homepage: https://pirminheld.github.io/BKI2_IN_Abtasttheorem/

## Verwendung

`index.html` direkt öffnen oder statisch bereitstellen. Kein Build und keine externen Bibliotheken erforderlich.

1. Messproblem: nur drei Messpunkte sichtbar; tatsächliches Signal per Knopfdruck aufdecken.
2. A/B/C: Abtastintervalle 4/2/1 ms, einzeln oder automatisch erfassen, Tabelle; bei B Startzeit auf 1 ms verschieben.
3. Aliasinglabor (optional): 250-Hz-Signal bei veränderlicher Abtastfrequenz und Startzeit; weiteren zu allen Messpunkten passenden Verlauf einblenden.
4. Sicherung: Abtasttheorem aufdecken und Auswahlaufgabe zu fmax = 300 Hz prüfen.

`Arbeitsblatt.pdf` ist die unveränderte zweiseitige Schülerfassung. Die Musterlösung wird nicht veröffentlicht. `QR_Code.png` führt zur Homepage. Im lokalen Arbeitsblattordner liegt eine Internetverknüpfung.

## Fachliches Modell

U(t) = 2 + sin(2π · 250 · t), t in Sekunden. Abtastzeiten t0 + k/fa. Die Kurven zeigen analoge Spannungen; Quantisierung ist ausgeblendet.

Für Unterabtastung wird ein passender Alias mit vorzeichenbehafteter Frequenz f' = f − round(f/fa) · fa erzeugt. Die Phase 2π(f − f')t0 erhält die Gleichheit an sämtlichen Abtastpunkten auch bei verschobener Startzeit. Bei fa = 2f wird nur im Fall einer konstanten Messreihe diese konstante Alternative gezeigt; andernfalls wird der phasenabhängige Grenzfall erläutert. Bei fa > 2f wird kein langsamerer Alias angezeigt. Eindeutigkeit setzt die angegebene Bandbegrenzung voraus. Geradlinige Punktverbindungen werden nicht als Rekonstruktion dargestellt.

Fachlicher Hintergrund: [NI: Acquiring an Analog Signal – Nyquist Sampling Theorem and Aliasing](https://www.ni.com/en/shop/data-acquisition/measurement-fundamentals/analog-fundamentals/acquiring-an-analog-signal--bandwidth--nyquist-sampling-theorem-.html), Abschnitt Sample Rate. Eigene Aufgaben, Diagramme und Berechnungen.

## Gestaltung und Prüfung

`style.css`, `FTS_logo.png` und `impressum.html` unverändert aus `../BKI2_IN_ADC_Quantisierung` übernommen. `sampling.css` ergänzt die neue Oberfläche.

`node test.cjs` prüft Abtastpunkte, Frequenzgrenzen und die Übereinstimmung der alternativen Verläufe mit allen Messwerten. Die Benutzeroberfläche wird im Browser auf Desktop- und Mobilbreiten sowie beim Offline-Aufruf geprüft.

Nutzung und rechtliche Angaben: siehe `impressum.html`.
