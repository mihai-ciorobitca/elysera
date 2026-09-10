# Lieferansicht, Bildmotive und Interaktionen

10. September 2026 – Folgeauftrag nach dem Screenshot der mobilen Auslieferungstabelle.

## Korrektur

Die Tabelle hatte zwar keinen technischen Überlauf, erzwang aber auf dem Handy enge Textspalten. Die neue `DeliveryOverview` verwendet drei semantische Listeneinträge. Jeder Eintrag hält Produktname und Menge zusammen. Mobil steht der Lieferhinweis darunter über die volle Breite; am Desktop sind Produkt, Hinweis und Aktion gemeinsam ausgerichtet. Die Termine und Formulierungen kommen unverändert aus dem Katalog. Eine beschriftete Produktverknüpfung öffnet jeweils die passende Detailseite.

Auch die Bezeichnungen im mobilen Produktvergleich sind jetzt ausdrücklich linksbündig, ebenso die Kopf- und Inhaltszellen des Desktopvergleichs. Die zusätzlichen Layoutprüfungen erfassen die nutzbare Breite der Lieferhinweise, die Position von Bezeichnung und Text sowie die Größe und Begrenzung der Aktionen.

## Zusätzliche Gestaltung

- Zwei neue KI-generierte Stillleben, als ergänzende Bildkarten auf Startseite und Presale-Seite: Glas/Textur und Pflegemoment mit Handtuch/Wasserschale.
- Die vorhandenen Fotos und der Hero bleiben erhalten. Die neuen Motive enthalten keine erfundenen ELYSERA-Verpackungen oder Produktversprechen und sind als illustrative Stillleben gekennzeichnet.
- Acht zusammengehörige SVG-Linienicons für Peptide, Textur, Routine, Kalender, Kontakt, Konto, Bestellung und Richtung. Verwendet in Pflegevorteilen, Servicebereichen, Lieferansicht und neuen Bildkarten.
- Kreisförmige Richtungsschaltflächen, klarer Tastaturfokus, 44-px-Aktionen und dezente Reaktionen auf Hover/Klick. Übergänge dauern 180–260 ms; reduzierte Bewegung deaktiviert die Übergänge. Bestehende Wechselzeiten wurden nicht verändert.

## Bilddateien

Erzeugt mit dem integrierten Imagegen-Werkzeug. Die ausgewählten Bilder wurden in die Website kopiert und als responsive WebP-Dateien bereitgestellt:

- `public/media/editorial-2026/glass-texture-640.webp` (61.016 Byte), `glass-texture-1280.webp` (169.546 Byte).
- `public/media/editorial-2026/quiet-ritual-640.webp` (58.574 Byte), `quiet-ritual-1280.webp` (166.542 Byte).

Motivvorgaben: Nachtblau, Champagnergold, heller Stein, natürliche Materialdetails, ohne Text, Logos, Personen oder Verpackungen. Die generierten Originale bleiben im Codex-Bildordner erhalten. Website-Dateien verwenden feste Bildproportionen, `srcSet` und Lazy Loading.

## Aktuelle Prüfung

- 75 Layoutfälle in Chromium und 75 in WebKit: 15 Seiten bei 320/390/460/768/1440 px, ohne festgestellte Verletzung der geprüften Regeln.
- 30 komplette Seitenchecks bei 390/1440 px: HTTP 200, keine defekten Bilder, abgeschnittenen Texte, horizontalen Überläufe oder JavaScript-Seitenfehler.
- 60 bestehende Funktionstests bestanden.
- Sieben gezielte Prüfungen: unveränderter Hero, geladene responsive Bilder, reduzierte Bewegung, Navigation per Tastatur, drei Lieferdatensätze, Produktverknüpfung, Hoveranimation.
- Produktionsbuild mit `.next-design-review` erfolgreich.

Visuelle Aufnahmen: `outputs/editorial-details/`; Layoutberichte: `outputs/editorial-layout/` und `outputs/editorial-webkit/`; Seiten- und Funktionsberichte: `outputs/editorial-pages/` und `outputs/editorial-interactions/`. Die Browserprüfungen ersetzen keinen Test auf einem physischen Mobilgerät.
