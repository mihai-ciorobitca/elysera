# Masterprompt: Elysera präzise verfeinern

## Auftrag und unveränderliche Grenzen
Du arbeitest als verantwortlicher UI-Designer und Frontend-Entwickler an der bestehenden Elysera-Website. Verfeinere das vorhandene Design zu einer stimmigen, lesbaren Luxury-Presale-Oberfläche. Nutze den installierten offiziellen frontend-design Skill. Die ausdrückliche Nutzerkorrektur hat Vorrang: Hero nicht ändern. Bilder, Produktidentitäten, Texte, Preise, Termine, Seitenreihenfolge und Funktionen erhalten. Keine neue Seitenarchitektur, keine austauschbaren Kampagnen, keine erfundenen Produktversprechen. Die frühere Midnight-Atelier-Neustrukturierung ist nicht freigegeben und wird nicht umgesetzt.

## Arbeitsweise
1. Prüfe jede öffentliche Seite auf dem tatsächlich verwendeten Server, aktuell localhost:3003. Lies vor Änderungen die vorhandenen Komponenten und die gesamte relevante CSS-Kaskade.
2. Erfasse konkrete Mängel nach Wirkung: unlesbarer Text/Überlagerung zuerst, danach Ausrichtung und Abstände, danach visuelle Details. Ein Screenshot des Nutzers ist ein Fehlerhinweis, kein Auftrag zur freien Neugestaltung.
3. Suche die Ursache. Bei Grid/Flex immer Container und Kinder zusammen prüfen. Alte grid-column-, width-, min-width-, position- und transform-Regeln müssen zur neuen Darstellung passen. Ergänze nicht nur eine weitere Regel, wenn dadurch widersprüchliche Definitionen bleiben.
4. Halte die gestalterischen Mittel zusammen: Nachtblau und Gold, vorhandene Schriftfamilien, sparsame Konturen, nachvollziehbare Abstände, klar erkennbare primäre und sekundäre Aktionen. Jeder Text muss seiner Informationsaufgabe entsprechend lesbar sein.
5. Mobile hat Vorrang: 320, 390, 460, 768 und 1440 px prüfen. Lange deutsche Bezeichnungen dürfen mehrere sinnvolle Zeilen bilden, aber nie in schmale Restspalten rutschen. Unterseiten müssen ebenso sorgfältig geprüft werden wie die Startseite.
6. Verfeinere vorhandene Interaktionen: sichtbarer Fokus, angemessene Touchflächen, ruhige Hover-Zustände und verständliche aktive Zustände. Kein Effekt darf Lesen, Scrollen, Produktauswahl oder Checkout beeinträchtigen. Reduced Motion respektieren. Hero-Animationen und bestehende Wechselgeschwindigkeiten nicht verändern.
7. Bestehende Auswahl/Backend-/Login-/Checkout-Funktionen und Freigabestatus unangetastet lassen. Lokale Auswahl darf nicht zur Bestellung umgedeutet werden.

## Verbindliche Seitenliste
Startseite; Shop; Renewal Serum; Balance Toner; Contour Eye Cream; Routine; Science; About; FAQ; Contact; Presale; Account; Quiz; Checkout; Video-Auswahl. Gemeinsame Navigation, Footer, Such-/Menü-/Warenkorb-Drawer auf mehreren Routen prüfen.

## Prüfung pro Komponente
- FAQ: Frage nutzt die breite Spalte, Icon eine feste schmale Spalte; zwischen den beiden Rechtecken mindestens 10 px; Frage ist bei 320 px noch sinnvoll lesbar. Geschlossene und geöffnete Zustände auf Start- und FAQ-Seite prüfen. Der gesamte Summary-Bereich bleibt bedienbar.
- Footer: Logo, Markentext und Navigation bilden einen ausgewogenen Abschluss. Gleiche linke Kanten pro Spalte, gleiche Zeilenhöhen, ausreichender Spaltenabstand; Copyright kompakt und lesbar. Mobile und Tablet dürfen keine zufällige Mischform zeigen.
- Produkte: komplette Packshots, keine Texte auf Produkten, gleiche Achsen für Namen/Preis/Button, keine abgeschnittenen Labels. Shopfilter und Vergleich auf Mobilgeräten bedienen.
- Account/Contact/Presale: beschreibende Texte lesbar, Formularfelder und Buttons gleichmäßig, keine bildbedingten Leerflächen oder abgeschnittenen Motive. Bestehende Texte erhalten.
- Quiz/Checkout: Fragen, Optionen und Ergebnis beziehungsweise leere/gefüllte Auswahl prüfen. Kein Senden von Formularen, keine Bestellung für Design-QA auslösen.
- Hero: Vorher/nachher Quellcode und relevante berechnete Maße/Stile vergleichen. Die geschützte Komponente erhält keine Designänderung.

## Abnahmeregeln
Kein Abschluss allein anhand HTTP 200, Build oder fehlendem horizontalen Überlauf. Sichtbare Screenshots müssen zusätzlich kontrolliert werden. Alle geänderten Layouts auf Mobile und Desktop anschauen. Automatische Checks erfassen auch zu schmale Textspalten, Text/Icon-Überschneidungen und erforderliche Touchflächen. Ausfälle reproduzieren und nach der Korrektur gezielt erneut prüfen. Nicht jede Seite braucht eine Änderung; begründe, welche gemeinsame Verfeinerung sie erhält oder weshalb sie bereits stimmig ist.

Dokumentiere pro Route Befund, Änderung und Prüfung. Führe einen Produktionsbuild und angemessene Interaktionschecks durch. Stage ausschließlich die Auftragsdateien; vorhandene fremde Änderungen und QA-Bilder nicht pauschal committen. Berichte konkret, was geändert und geprüft wurde, samt verbleibenden Grenzen. Keine pauschale Behauptung „perfekt“.
