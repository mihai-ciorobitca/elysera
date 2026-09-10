# Originalauflösung für Personenmotive

Der gemeldete Screenshot zeigt `story-serum-v2`. Bei einer 460 px breiten Browseransicht mit DPR 1 wurde tatsächlich `story-serum-v2-560.webp` geladen. Ein CSS-Blur war nicht aktiv. Die vorhandene Originaldatei hat 1122 × 1402 Pixel und mehr sichtbare Details.

Große Anwendungsporträts laden jetzt die vorhandenen Originaldateien ohne Auswahl der kleinen `srcSet`-Derivate. Das gilt über die Medien-Aliase auch für Routine-, Marken-, Kontakt- und Produktseiten. Galerie-Thumbnails (`sizes="90px"`) behalten ihre optimierte Auslieferung. Jessica lädt ihre vorhandenen 1122-px-Porträts ebenfalls ohne die 560-px-Variante. Bettinas Porträts verwendeten bereits die Originalauflösung.

Die Bilder wurden weder neu generiert noch künstlich hochskaliert. Der vorhandene native Detailumfang bleibt die Grenze; die Änderung verhindert zusätzliche Verluste durch kleine Vorschauversionen. Die größeren Dateien benötigen mehr Datenvolumen, werden aber weiterhin verzögert geladen.

Geprüft: das gemeldete Motiv bei 460 px und DPR 1/2/3 (jeweils die native 1122-px-Datei), Personenmotive auf Routine/Über-uns/Kontakt sowie die Anwendungsansicht aller drei Produktgalerien; keine horizontalen Überläufe. Produktionsbuild erfolgreich. Lokale Vorher-/Nachher-Aufnahmen und Messwerte: `outputs/portrait-quality/`.
