# Impeccable-Korrekturen · 19.09.2026

Lokal umgesetzt, nicht veröffentlicht. Kaufen und Bezahlen bleiben deaktiviert.

- Kontoübersicht mit eigenen Bestellungen als Einstieg, klarer Erstbesucherhilfe und ohne leere Diagramme. Partnerkennzahlen erscheinen bei vorhandener Partneraktivität.
- Partnernavigation und Empfehlungsprofil gebündelt; bestehende Rechte und Funktionen beibehalten. Mobile Hauptnavigation: Übersicht, Hilfe, Bestellungen, Profil.
- Produktwert/Zahlbetrag auch bei 601–700 px korrekt. Unterstützende Dashboard-Texte vergrößert, Diagrammlegende korrigiert, Refresh-Icon statt Glocke.
- Öffentlichen CRM-Footerlink entfernt. CRM weiterhin im Partnerbereich erreichbar.
- Vormerken ausdrücklich als lokale Merkliste ohne Kauf/Bestellung gekennzeichnet. Kaufabschluss bleibt ein deaktivierter Button. Keine öffentliche Bestell- oder Zahlungsroute hinzugefügt.
- Bereits gestraffte lokale Startseite erhalten; Set-Bild unterhalb des sichtbaren Bereichs lädt verzögert.

Validierung: Produktionsbuild erfolgreich; TypeScript-Prüfung erfolgreich; 3 relevante Tests bestanden (Kontozuordnung, Zugriffsschutz, Vormerkpreise). Browserprüfung der Kontoübersicht bei 320/390/650/768/1440 px ohne horizontalen Überlauf. Synthetische lokale Kontodaten, keine Live-Dashboard-Interaktion. Bestellansicht bei 650 px mit korrekt berechneten CSS-Beschriftungen. Echte Browserinteraktion auf lokalem Produktionsbuild: Set vormerken → Vormerkübersicht; Kaufbutton disabled, keine Bestellung ausgelöst. Impeccable: unverändert 3 bereits bewertete Warnungen (semantische Seitenmarkierungen, Arial); keine neuen Treffer. Keine E-Mail- oder Passwortfunktionen geprüft.
