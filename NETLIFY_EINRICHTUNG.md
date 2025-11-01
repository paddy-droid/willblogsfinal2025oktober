# Netlify Einrichtungsanleitung

## Environment Variables konfigurieren

### Schritt 1: Netlify Dashboard aufrufen
1. Loggen Sie sich in Ihr Netlify-Konto ein
2. Wählen Sie das entsprechende Site-Projekt aus
3. Navigieren Sie zu **Site settings** → **Build & deploy** → **Environment**

### Schritt 2: Environment Variable hinzufügen
1. Klicken Sie auf **Edit variables**
2. Fügen Sie folgende Variable hinzu:

```
Variable name: GEMINI_API_KEY
Value: [Ihr Google Gemini API-Schlüssel]
```

3. Klicken Sie auf **Save**

### Schritt 3: API-Schlüssel besorgen (falls noch nicht vorhanden)
1. Besuchen Sie [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Klicken Sie auf **Create API Key**
3. Wählen Sie ein bestehendes Google Cloud Projekt oder erstellen Sie ein neues
4. Kopieren Sie den generierten API-Schlüssel
5. Fügen Sie diesen als Wert für die `GEMINI_API_KEY` Variable ein

### Wichtige Hinweise
- Der API-Schlüssel wird **nicht** im Code gespeichert, sondern sicher von Netlify verwaltet
- Der Platzhalter `{{GEMINI_API_KEY}}` in der `index.html` wird automatisch ersetzt
- Der Schlüssel ist nur im Build-Prozess und zur Laufzeit verfügbar

## Bereitstellungsprozess

### Methode 1: Git-Integration (empfohlen)
1. Pushen Sie den Code zu Ihrem Git-Repository (GitHub, GitLab, Bitbucket)
2. Verbinden Sie das Repository mit Netlify
3. Netlify wird automatisch bei jedem Push neu bauen

### Methode 2: Manuelle Bereitstellung
1. Komprimieren Sie den `dist` Ordner
2. Laden Sie die ZIP-Datei im Netlify Dashboard hoch
3. Stellen Sie sicher, dass die Environment Variables konfiguriert sind

## Build-Einstellungen überprüfen

Stellen Sie sicher, dass folgende Build-Einstellungen in Netlify konfiguriert sind:

```
Build command: npm run build
Publish directory: dist
```

Diese Einstellungen sollten automatisch aus der `netlify.toml` Datei übernommen werden.

## Nach der Bereitstellung testen

1. Rufen Sie die bereitgestellte URL auf
2. Testen Sie die Blog-Generierungsfunktion
3. Überprüfen Sie, ob der Image Generator funktioniert
4. Kontrollieren Sie die Browser-Konsole auf Fehler

## Fehlerbehebung

### Problem: API-Schlüssel nicht gefunden
**Symptom:** Fehlermeldung "GEMINI_API_KEY environment variable is not set"

**Lösung:**
1. Überprüfen Sie, ob die Environment Variable korrekt in Netlify gesetzt ist
2. Stellen Sie sicher, dass der Name exakt `GEMINI_API_KEY` lautet
3. Triggeren Sie einen neuen Build in Netlify

### Problem: Build schlägt fehl
**Symptom:** Build-Prozess schlägt fehl

**Lösung:**
1. Überprüfen Sie die Build-Logs in Netlify
2. Stellen Sie sicher, dass alle Abhängigkeiten installiert sind
3. Kontrollieren Sie, ob die `package.json` korrekt ist

### Problem: Styling funktioniert nicht
**Symptom:** Die Seite wird ohne CSS-Styling angezeigt

**Lösung:**
1. Überprüfen Sie, ob die CSS-Dateien im `dist` Ordner vorhanden sind
2. Kontrollieren Sie die Pfade in der `index.html`
3. Stellen Sie sicher, dass die Tailwind CSS Konfiguration korrekt ist

## Sicherheitshinweise

- Teilen Sie den API-Schlüssel niemals öffentlich
- Beschränken Sie den API-Zugriff in der Google Cloud Console auf notwendige Domains
- Überwachen Sie die API-Nutzung in der Google AI Studio Konsole
- Rotieren Sie den API-Schlüssel regelmäßig aus Sicherheitsgründen