# ELYSERA – Designverfeinerung, 10. September 2026

Arbeitsgrundlage: `docs/elysera-design-masterprompt.md`, mit dem installierten Skill `frontend-design`. Lokale Vorschau: http://localhost:3003. Dieser Durchgang verfeinert die bestehenden Komponenten; Fotos, Texte, Preise, Termine und Abschnittsreihenfolge bleiben erhalten.

## Sichtbare Änderungen

| Seite | Ergebnis dieses Durchgangs |
| --- | --- |
| Startseite `/` | Kollektion, Hero, FAQ und Footer erneut geprüft. Die bereits korrigierte Gestaltung bleibt erhalten. |
| `/shop` | Gemeinsam ausgerichtete Produktzeilen ersetzen feste Mindesthöhen. Bilder füllen die Kartenbreite; Preise sind größer lesbar und Aktionsbuttons bleiben auf derselben Höhe. |
| `/products/renewal-serum` | Preis, Menge und Auswahl sind auf einer gemeinsamen elfenbeinfarbenen Fläche gruppiert. Auf schmalen Displays ordnen sich die Bedienelemente untereinander an. |
| `/products/balance-toner` | Derselbe Auswahlbereich; langer Produktname, Mengensteuerung und Galerie geprüft. |
| `/products/contour-eye-cream` | Derselbe Auswahlbereich; aktive Galerie-Vorschau mit Goldakzent und Platz für Accordion-Symbole. |
| `/routine` | Zusammenhängende Bild-/Textflächen, linksbündige Anwendungstexte, hervorgehobene Schrittangabe und klare Innenabstände. |
| `/science` | Nachtblauer Textbereich führt das vorhandene Texturbild fort; helle Schrift, warme Goldakzente und linksbündige Erklärung verbessern die Hierarchie. |
| `/about` | Die bestehende Markenpassage erhält eine klare Trennung zwischen Leitgedanke und Erklärung; mobil wird die Trennlinie horizontal geführt. |
| `/faq` | Bestehende breite Frage-/Icon-Spalten beibehalten und bei geöffneten wie geschlossenen Antworten geprüft. |
| `/contact` | Kontaktwege als lesbare, linksbündige Servicegruppen mit konsistenten Innenabständen und ausgerichteten Aktionen. |
| `/presale` | Nummern und Inhalte der drei Schritte sind mobil nebeneinander angeordnet; die Reihenfolge ist dadurch leichter zu erfassen. |
| `/account` | Login und Bestellungen verwenden dieselben Serviceflächen; Hinweis und lokale Auswahl bilden eine zusammenhängende Gruppe. |
| `/quiz` | Ausgewählte Antworten erscheinen in Nachtblau mit heller Schrift und goldener Markierung. Der Hoverzustand überdeckt die Auswahl nicht mehr. |
| `/checkout` | Mehr Abstand zwischen vorhandenen Auswahlpositionen und ein klar gefasster Preisbereich. Leerer und gefüllter Zustand geprüft. |
| `/video-auswahl` | Bildunterschriften und vorhandene Bedienelemente erhalten eine zusammenhängende helle Fläche; Videoquellen und Auswahlfunktion bleiben erhalten. |

Im Desktopvergleich bei 1440 px sinkt die Höhe des Shoprasters von 875 auf 809 px. Mobil hat die Lesbarkeit der vergrößerten Preisangaben Vorrang: 1137 auf 1149 px bei 390 px Breite. Es wurden keine Inhalte gekürzt, um Höhe zu sparen.

## Prüfungen

- Chromium: 15 Seiten × 5 Breiten (320, 390, 460, 768, 1440 px), 75 Durchläufe ohne Layoutverletzung.
- WebKit: dieselben 75 Durchläufe ohne Layoutverletzung. Das ist eine Browser-Engine-Prüfung, kein Test auf einem physischen iPhone.
- Die Layoutprüfung umfasst seit diesem Durchgang zusätzlich die Reihenfolge und Kollisionsfreiheit der Shopfelder, volle Bildbreite, gleich hohe Aktionen und die Begrenzung der Auswahlsteuerung auf ihre Fläche.
- 60 bestandene Funktionstests: mobile Navigation, Suche, Filter, Sortierung, Galerie, Lightbox/Fokusrückkehr, Quiz, FAQs, Presale-Auswahl/Persistenz und bestehende automatische Wechsel.
- 30 vollständige Seitenchecks bei 390/1440 px: jeweils HTTP 200, keine defekten Bilder, abgeschnittenen Texte, horizontalen Überläufe oder JavaScript-Seitenfehler. Desktop-Dropdowns auf Startseite und Shop passen in den sichtbaren Bereich.
- Produktionsbuild erfolgreich: `ELYSERA_BUILD_DIR=.next-design-review npm run build`.
- Vorher-/Nachher-Inventar der Hauptüberschriften und Bildquellen: auf allen 30 Kombinationen aus Seite und 390/1440 px identisch.
- Hero-Vergleich bei 390 × 844 px mit reduzierter Bewegung: alle erfassten DOM-Elemente stimmen in Breite, Höhe, Schriftgröße, Farben, Padding, Margin, Display und Position exakt mit der gespeicherten Ausgangsbasis überein. Die Hero-Komponente und ihre Zeitsteuerung wurden nicht editiert.

## Lokale Nachweise

Die Bilddateien bleiben lokale Prüfartefakte; sie werden nicht als zusätzliche Website-Assets ausgeliefert.

- `outputs/masterprompt-before/`: 30 Komponentenaufnahmen und Ausgangsinventar.
- `outputs/masterprompt-after/`: passende Nachher-Aufnahmen, geöffnete Navigation, Quiz-Auswahl und FAQ-Zustand.
- `outputs/masterprompt-layout/layout.json`: Chromium-Layoutprüfung.
- `outputs/masterprompt-webkit/layout.json`: WebKit-Layoutprüfung.
- `outputs/masterprompt-interactions/`: Funktionstests und Zustandsaufnahmen.
- `outputs/masterprompt-pages/`: kompletter Seitencheck bei 390/1440 px.

Die bestehenden Auswahl- und Kontoverknüpfungen wurden bedient und geprüft. Externe Kontaktformulare, Bestellungen oder Zahlungen wurden nicht abgeschickt.
