# ELYSERA — Masterprompt für die vollständige Designverfeinerung

> Folgeauftrag vom 10. September 2026: Zusätzliche generierte Bildmotive, eigene Icons und interaktive Details sind ausdrücklich erwünscht. Ergänzende Bildkarten und eine mobile Neuordnung der Auslieferungsübersicht sind damit erlaubt. Vorhandene Motive und der geschützte Hero bleiben erhalten. Diese Freigabe ergänzt die ursprünglichen Grenzen unten. Umsetzung und aktuelle Nachweise: `docs/editorial-details-review.md`.

## Auftrag

Nutze den installierten Skill `frontend-design` unter `C:/Users/lol/.codex/skills/frontend-design/SKILL.md`. Arbeite als verantwortlicher Designer und Frontend-Entwickler an der bestehenden ELYSERA-Website in `C:/Users/lol/Documents/elysera`. Prüfe zunächst den aktuellen Stand auf `http://localhost:3003` und verfeinere anschließend alle öffentlichen Seiten innerhalb der folgenden Grenzen.

Das Ziel ist eine sichtbar hochwertigere, glamouröse Luxury-Skincare-Website mit einer klaren Presale-Präsentation. Die Qualität soll sich in Bildwirkung, Typografie, Ausrichtung, Materialien, Abständen und präzisen Interaktionen zeigen. Eine weitere Runde nur leicht veränderter Rahmenfarben reicht nicht. Jede Änderung muss einen erkennbaren Nutzen für das Erscheinungsbild oder die Bedienung haben.

Dies ist ein ausführbarer Arbeitsauftrag. Die unten genannten Punkte sind Prüf- und Gestaltungsaufgaben, keine Behauptung, dass die jeweilige Seite aktuell fehlerhaft ist. Beginne mit einer aktuellen visuellen Prüfung; alte Berichte sind Ausgangspunkte, kein Ersatz dafür.

## 1. Verbindliche Grenzen

- Den Hero nicht verändern: weder Aufbau, Höhe, Texte, Bilder, Logo, Ausschnitte, Reihenfolge, Navigation der Motive noch bestehende Animationen und Wechselzeiten. Auch globale CSS-Regeln dürfen ihn nicht indirekt verändern.
- Die vorhandene Seitenstruktur und Reihenfolge der Abschnitte erhalten. Keine Abschnitte entfernen, zusammenlegen oder durch eine neue Kampagne ersetzen.
- Bestehende Fotos, Gesichter, Produktverpackungen und das originale goldene Logo erhalten. Keine neuen Bilder generieren oder vorhandene Dateien überschreiben.
- Bestehende Texte, Preise, Termine, Produktrollen und Kennzeichnungen erhalten. Keine neuen Versprechen, Kundenstimmen, künstlichen Restbestände oder Countdown-Uhrzeiten erfinden.
- Navigation, Produktauswahl, Warenkorb, Kontoverknüpfung und Checkout müssen funktional bleiben. Die unverbindliche lokale Auswahl bleibt von einer Bestellung unterscheidbar.
- Die ausdrücklichen Nutzerkorrekturen gehen allgemeinen Skill-Empfehlungen vor. Empfehlungen für einen neuen Hero oder eine andere Informationsarchitektur gelten hier nicht.
- Arbeite selbstständig innerhalb dieses Rahmens. Stelle keine Rückfrage für gewöhnliche Entscheidungen zu Abständen, Lesbarkeit und vorhandenen Komponenten.

## 2. Visuelle Richtung

ELYSERA soll wie eine sorgfältig gestaltete Beauty-Marke auftreten: selbstbewusst, feminin, glamourös und souverän. Die vorhandenen blauen Verpackungen, goldenen Details, Materialien und Porträts geben die Richtung vor.

### Farbe und Material

Verwende die bestehenden Nachtblau-, Gold- und hellen Flächentöne mit klaren Rollen. Dunkle Flächen geben Präsenz, helle Flächen tragen lesbare Produktinformationen, Gold kennzeichnet Akzente und aktive Zustände. Prüfe bei jeder zusätzlichen Fläche, ob sie eine inhaltliche Gruppe verständlicher macht. Keine beliebigen Verläufe oder dekorativen Goldrahmen an jedem Element.

### Typografie

Nutze die vorhandenen Schriftfamilien. Verfeinere Größe, Gewicht, Zeilenhöhe, Buchstabenabstand und Umbrüche. Eine Überschrift darf präsent sein; wichtige Produkt-, Preis- und Lieferinformationen müssen mindestens ebenso bewusst gesetzt sein. Goldene Kleinstschrift darf keine wesentliche Information tragen. Bestehende Serifenelemente sollen gezielt wirken und nicht auf immer mehr Überschriften ausgedehnt werden.

Als Ausgangswerte außerhalb des geschützten Hero: mobile Fließtexte etwa 14–16 px, wesentliche Preis-/Lieferangaben 13–16 px, kleine Metadaten etwa 11–12 px. Diese Werte sind keine starre Schablone; entscheide anhand realer Darstellung und Hierarchie. Verkleinere Texte nicht, um einen Layoutfehler zu verstecken.

### Komposition und Abstände

Definiere einen kleinen, konsistenten Satz von Abständen für zusammengehörige Texte, Komponenten und Abschnittswechsel. Jede Seite braucht erkennbare Hierarchie. Große Leerflächen benötigen einen gestalterischen Grund. Gleiche Produktkarten erhalten gleiche Bezugslinien für Name, Preis und Aktion. Kurze und lange Inhalte dürfen dabei natürlich umbrechen.

Prüfe optische Ausrichtung zusätzlich zur mathematischen Zentrierung. Zentrierte kurze Markentexte können bleiben; längere Antworten, Tabellen und Gebrauchsinformationen sollen sich bequem lesen lassen. Ändere keine bereits stimmige Ausrichtung bloß aus persönlicher Vorliebe.

## 3. Jede Seite einzeln ansehen

Öffne jede der folgenden Seiten, scrolle durch sie und prüfe die relevanten Zustände. Betrachte zumindest eine mobile und eine Desktopansicht in lesbarer Auflösung. Eine winzige lange Gesamtaufnahme reicht nicht für die Beurteilung von Text oder Symbolen.

| Seite | Konkreter Gestaltungsauftrag |
|---|---|
| `/` | Hero schützen. Produktkarten, Routinekarten, Quiz-Einstieg, Wissenskarten, Texturbereich, Anwendungsszenen, Gründerinnenbereich, FAQ und Presale-Abschluss als bestehende Gesamtkomposition prüfen. Schriftgrößen, Bild-/Textabstände, Linkhierarchie und Abschnittsübergänge abstimmen. |
| `/shop` | Filter, Sortierung, Ergebnisinformation, drei Produkte und Vergleich aufeinander abstimmen. Karten in jeder Zeile symmetrisch, Bildgrößen konsistent, Aktionen gleich ausgerichtet. Den dritten Artikel auf Mobile bewusst positionieren. |
| `/products/renewal-serum` | Galerie, Vorschaubilder, Titel, Volumen, Beschreibung, Preis und Auswahl als zusammengehörige Produktpräsentation verfeinern. Akkordeons und Empfehlungen prüfen. |
| `/products/balance-toner` | Dasselbe Produktdesign mit längerem Namen und anderer Packungsform prüfen. Keine abweichenden Abstände nur wegen anderer Textlänge. |
| `/products/contour-eye-cream` | Dasselbe Produktdesign mit Tube, anderem Titel und Inhaltsstoffliste prüfen. Kleine Mengen-/Formatangaben müssen klar erkennbar bleiben. |
| `/routine` | Die bestehende Reihenfolge 01/02/03 verständlich gestalten. Bild, Schrittbezeichnung, Anwendung und Produktlink bilden jeweils eine zusammengehörige Einheit. |
| `/science` | Bildwirkung und Erklärung ausbalancieren. Wissensblöcke lesbar gliedern; Texturen dürfen dominieren, wesentliche Informationen nicht verdrängen. |
| `/about` | Die vorhandene redaktionelle Wirkung stärken: ruhige Textbreiten, souveräne Überschriften, saubere Beziehungen zwischen Bild und Text. |
| `/faq` | Jede Frage nutzt eine breite Textspalte. Symbole sitzen konsistent rechts. Offene Antworten, lange Fragen, Tastaturfokus und mobile Darstellung prüfen. |
| `/contact` | Die drei bestehenden Kontaktwege klar unterscheiden, aber einheitlich gestalten. Alle Aktionen müssen gut lesbar sein; externe Zielhinweise bleiben erhalten. |
| `/presale` | Datum, Auswahlablauf, Set-/Einzelangebot und Lieferinformationen klar gewichten. Tabelle und Schritte mobil ebenso lesbar wie auf Desktop. |
| `/account` | Kontozugang, Bestellungen und lokale Auswahl sauber gliedern. Einheitliche Text-/Aktionsabstände und verständliche Hinweise. |
| `/quiz` | Jede Frage, Auswahl, deaktivierte/aktive Weiter-Aktion, Zurück-Navigation und Ergebniszustand prüfen. Ausgewählte Optionen müssen sofort erkennbar sein. |
| `/checkout` | Leere und gefüllte Auswahl, Mengen, Preise, Hinweise und gesperrte Bestellaktion gestalten. Klarheit hat hier Vorrang vor dekorativer Bewegung. |
| `/video-auswahl` | Bestehende Medienübersicht auf Lesbarkeit und bedienbare Steuerelemente prüfen. Keine Medien austauschen oder Reihenfolge verändern. |

Prüfe außerdem gemeinsame Navigation, Dropdowns, mobilen Menü-Drawer, Suche, Suchergebnisse, Warenkorb-Drawer und Footer auf mehreren Routen. Eine Änderung an einer gemeinsamen Komponente muss in verschiedenen Seitenkontexten funktionieren.

## 4. Besondere Sorgfalt für FAQ und Footer

### FAQ

Der frühere Fehler entstand durch ein zweispaltiges Grid mit Kindern, die noch Spalte zwei und drei belegten. Prüfe Container und Kinder immer zusammen. Die Frage gehört in die flexible erste Spalte; das Symbol in eine feste zweite Spalte.

- Frage und Symbol dürfen sich in keinem Zustand überlappen.
- Zwischen ihren Rechtecken liegen mindestens 10 px; gestalterisch möglichst 16 px.
- Die Fragespalte soll mindestens 65 Prozent der Zeilenbreite nutzen.
- Keine einzelnen Wörter in einer schmalen Restspalte.
- Geschlossene und geöffnete Zeilen auf Start- und FAQ-Seite prüfen.
- Ein Plus/Minus bleibt optisch zentriert; seine Animation verschiebt die Textspalte nicht.
- Antworten haben passende Innenabstände und lesbare Zeilenlängen.

### Footer

Der Footer ist ein Markenabschluss und eine Orientierungshilfe. Bestehende Inhalte bleiben vollständig erhalten.

- Logo und Markentext wirken zusammengehörig.
- Der Kollektionseinstieg hat eine klare Größe und genügend Abstand zu den Linkgruppen.
- Linkspalten erhalten bewusst gewählte Breiten, übereinstimmende Zeilenhöhen und ausgerichtete Überschriften.
- Lange Überschriften dürfen auf schmalen Geräten umbrechen, ohne die Linkzeilen gegeneinander zu verschieben.
- Mobile Links sind mindestens 44 px hoch und lesbar.
- Copyright und Zusatzzeile bilden einen kompakten Abschluss.
- Die Tabletansicht ist eine eigene zu prüfende Darstellung; keine zufällige Mischung aus Mobile und Desktop akzeptieren.

## 5. Interaktionen und Animationen

Verfeinere bereits vorhandene Interaktionen. Bewegung zeigt, was sich durch eine Aktion verändert. Ein Effekt muss zum jeweiligen Element passen und darf keine Information verdecken.

| Element | Gewünschtes Detail | Zu prüfen |
|---|---|---|
| Primärer Button | Ruhiger Farb-/Lichtwechsel und eindeutiger Druckzustand | Label bleibt zentriert, Größe stabil, Touch und Tastatur funktionieren |
| Sekundärer Link | Präzise Linie und vorhandener SVG-Pfeil reagieren gemeinsam | Keine springende Textposition |
| Produkt-/Wissenskarte | Dezente Betonung von Kontur oder Tiefe | Kein Inhaltssprung, kein Bildbeschnitt durch den Effekt |
| Dropdown | Sichtbarer Pfeil, klare aktive Kategorie, ruhiges Öffnen | Klick, Escape, Außenklick und Fokus |
| Galerie | Verständliche aktive Miniatur und konsistenter Bildwechsel | Vollständige Produkte, keine leeren Ladezwischenbilder |
| Routine-/Texturtabs | Gut sichtbarer ausgewählter Zustand | Darstellung und Inhalt bleiben synchron |
| FAQ | Plus wird Minus, Antwort öffnet ruhig | Keine Kollisionen bei langen Fragen |
| Quiz | Sichtbare Auswahl und klare Weiter-Aktion | Kontrast und Fokus bleiben auch ohne Bewegung verständlich |
| Warenkorb | Klare Bestätigung des tatsächlich hinzugefügten Produkts | Menge und Übersicht stimmen überein |

Für neue Mikrointeraktionen sind etwa 160–260 ms ein Ausgangspunkt. Größere, durch Nutzer ausgelöste Zustandswechsel können etwas länger dauern. Vorhandene Autoplay-Geschwindigkeiten und Hero-Animationen sind geschützt. Keine dauernden Partikel, blinkenden Goldflächen, springenden Buttons, erzwungenen Scrollabläufe oder Hover-only-Funktionen auf Mobilgeräten.

Bei `prefers-reduced-motion` müssen dieselben Inhalte und Aktionen mit reduzierter Bewegung verfügbar sein. Keine Animation darf Voraussetzung dafür sein, dass ein Inhalt sichtbar wird.

## 6. Umsetzung in überprüfbaren Durchgängen

### A — Bestandsaufnahme

Lies Git-Status, Komponenten und relevante CSS-Regeln. Halte die geschützte Hero-Komponente und ihre berechneten Stile als Ausgangspunkt fest. Erstelle eine Liste konkreter visueller Befunde je Seite. Priorisiere Lesbarkeit und Layoutfehler vor dekorativen Details.

### B — Gemeinsames Design verfeinern

Lege die kleinen gemeinsamen Regeln für Text, Abstände, Buttons, Linien, Fokus und aktive Zustände fest. Arbeite an den bestehenden Komponenten. Vermeide eine weitere breite CSS-Schicht, die alte Regeln nur zufällig überstimmt. Konsolidiere widersprüchliche Regeln gezielt, ohne unabhängige Bereiche umzubauen.

### C — Jede Seite fertigstellen

Wende die Regeln auf jede Route an und prüfe Ausnahmen: lange deutsche Titel, kurze Beschreibungen, verschiedene Verpackungsformen, Tabellen und leere Zustände. Halte pro Seite fest, was verbessert wurde. Wo die Darstellung bereits stimmig ist, begründe bewusst den Erhalt.

### D — Visuell kritisch vergleichen

Vergleiche Vorher/Nachher bei identischer Breite und gleichem Zustand. Beurteile konkret: Ist die Hierarchie klarer? Sind wichtige Informationen besser lesbar? Stimmen die Bezugslinien? Passen die Details zur Verpackung und Marke? Funktioniert es auf kleinen Bildschirmen? Wenn die Verbesserung nicht sichtbar oder nachvollziehbar ist, überarbeite sie.

## 7. Abnahme

Prüfe 320, 390, 460, 768 und 1440 px, dazu auf großen Desktopansichten bei Bedarf die maximale Inhaltsbreite. Nutze Chromium und WebKit für die geänderten Layouts.

Vorhandene Prüfwerkzeuge:
- `scripts/mobile-release-audit.cjs`: Routen, Bilder, Textüberläufe und Laufzeitfehler.
- `scripts/design-layout-audit.cjs`: zusätzlich FAQ-Textbreite, Text/Icon-Abstände, offene Zustände und Footer-Geometrie.
- `scripts/mobile-release-interactions.cjs`: zentrale Bedienabläufe mit lokaler Auswahl.

Setze `AUDIT_URL` ausdrücklich auf den tatsächlich geprüften Server. Testberichte dürfen nicht versehentlich von einem anderen Port oder älteren Build stammen.

Ein erfolgreicher Build oder fehlender horizontaler Überlauf beweist keine gute Gestaltung. Kontrolliere zusätzlich lesbare Screenshots der veränderten Komponenten. Prüfe normale und lange Texte, leere und gefüllte Auswahl, aktive und deaktivierte Aktionen, offene Menüs und Dialoge. Versende keine Kontaktanfrage und löse keine Bestellung für die Designprüfung aus.

Nach Abschluss einen isolierten Produktionsbuild erstellen. Laufende lokale Vorschauen nicht durch gemeinsam verwendete Build-Verzeichnisse beschädigen. Vorhandene fremde Änderungen und generierte QA-Dateien nicht pauschal committen. Beachte die im Gespräch bereits erteilte Freigabe für einen Push auf main; behaupte einen Push oder eine Veröffentlichung nur nach bestätigtem Erfolg.

## 8. Erwartetes Ergebnis

Liefere eine durchgängig verfeinerte bestehende Website und einen nachvollziehbaren Abschluss:

1. Die wichtigsten sichtbaren Verbesserungen in wenigen konkreten Sätzen.
2. Eine Tabelle je Route mit Befund, Umsetzung und Prüfung.
3. Vorher/Nachher-Aufnahmen der wichtigsten geänderten Stellen in lesbarer Größe.
4. Die tatsächlich ausgeführten Prüfungen samt Ergebnis und etwaigen Grenzen.
5. Bestätigung, dass Hero, Bilder, Inhalte und Seitenstruktur erhalten geblieben sind.
6. Erreichbare Vorschau-URL sowie bestätigter Commit-/Push-Status, falls ausgeführt.

Verwende keine pauschale Behauptung „alles perfekt“ oder eine unbelegte 10/10-Bewertung. Die sichtbare Verbesserung und die überprüfte Bedienbarkeit sind der Maßstab.
