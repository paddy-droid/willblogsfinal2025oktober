# Netlify Bereitstellungs-Checkliste

## Vorbereitung ✅

### Code-Basis
- [ ] Alle Änderungen im Git-Repository committet
- [ ] `npm run build` lokal erfolgreich ausgeführt
- [ ] `dist` Ordner enthält alle notwendigen Dateien
- [ ] `netlify.toml` Konfiguration vorhanden und korrekt

### Environment Variables
- [ ] Google Gemini API-Schlüssel besorgt
- [ ] API-Schlüssel in Netlify Environment Variables konfiguriert
- [ ] Variable Name: `GEMINI_API_KEY` (exakt dieser Name!)

## Bereitstellung

### Methode 1: Git-Integration (empfohlen)
- [ ] Repository mit Netlify verbunden
- [ ] Build-Settings automatisch aus `netlify.toml` übernommen
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`

### Methode 2: Manuelle Bereitstellung
- [ ] `dist` Ordner zu ZIP komprimiert
- [ ] ZIP-Datei in Netlify Dashboard hochgeladen
- [ ] Build-Settings manuell konfiguriert

## Nach der Bereitstellung

### Funktionsprüfung
- [ ] Website lädt korrekt im Browser
- [ ] CSS-Styling wird korrekt angezeigt
- [ ] JavaScript-Funktionen arbeiten fehlerfrei
- [ ] Blog Generator funktioniert
  - [ ] Thema-Eingabe akzeptiert
  - [ ] Recherche startet erfolgreich
  - [ ] Gliederung wird erstellt
  - [ ] Inhalt wird generiert
  - [ ] Finaler HTML-Code wird ausgegeben
- [ ] Image Generator funktioniert
  - [ ] Text-Prompts akzeptiert
  - [ ] Bilder werden generiert
  - [ ] Referenzbild-Upload funktioniert

### Technische Überprüfung
- [ ] Browser-Konsole zeigt keine Fehler
- [ ] Network-Tab zeigt erfolgreiche API-Aufrufe
- [ ] API-Schlüssel wird korrekt injiziert (Platzhalter ersetzt)
- [ ] Alle Assets (CSS, JS, Bilder) laden korrekt

### Performance
- [ ] Ladezeit der Startseite unter 3 Sekunden
- [ ] Core Web Vitals im grünen Bereich
- [ ] Bilder und Assets optimiert

## Sicherheit

### API-Schlüssel-Management
- [ ] API-Schlüssel nicht im Code sichtbar
- [ ] API-Schlüssel nur über Environment Variables verfügbar
- [ ] Zugriff auf API-Schlüssel in Netlify beschränkt
- [ ] API-Nutzung in Google Cloud Console überwacht

### HTTPS und Headers
- [ ] HTTPS automatisch aktiviert
- [ ] Security Headers aus `netlify.toml` aktiv
- [ ] X-Frame-Options: DENY
- [ ] X-XSS-Protection: 1; mode=block

## Wartung

### Monitoring
- [ ] Netlify Build-Logs regelmäßig überprüft
- [ ] API-Nutzung in Google AI Studio überwacht
- [ ] Website-Performance mit Netlify Analytics getrackt

### Updates
- [ ] Abhängigkeiten regelmäßig aktualisieren
- [ ] API-Schlüssel bei Bedarf rotieren
- [ ] Sicherheitsupdates zeitnah einspielen

## Troubleshooting

### Häufige Probleme und Lösungen

1. **Build schlägt fehl**
   - Build-Logs in Netlify überprüfen
   - `package.json` auf Korrektheit prüfen
   - Node.js Version kompatibel?

2. **API-Schlüssel nicht gefunden**
   - Environment Variable Name überprüfen
   - Neuen Build in Netlify triggeren
   - Variable speichern und erneut deployen

3. **Styling funktioniert nicht**
   - CSS-Dateien im `dist` Ordner prüfen
   - Pfade in `index.html` überprüfen
   - Tailwind Konfiguration validieren

4. **Funktionen nicht verfügbar**
   - JavaScript-Konsole auf Fehler prüfen
   - API-Aufrufe im Network-Tab überprüfen
   - CORS-Einstellungen kontrollieren

## Notfallkontakt

Bei kritischen Fehlern:
1. Netlify Support kontaktieren
2. Google Cloud Support bei API-Problemen
3. Rollback auf vorherige Version durchführen

---

**Letzte Überprüfung:** ___________
**Verantwortlich:** ___________
**Status:** ___________