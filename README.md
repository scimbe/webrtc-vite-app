# WebRTC Video Chat Application

## Einrichtung und Start

1. **Installation der Abhängigkeiten**
   ```bash
   npm install
   ```

2. **Entwicklungsserver starten**

   Es gibt drei Möglichkeiten:

   a) Nur den Frontend-Server starten:
   ```bash
   npm run dev
   ```

   b) Nur den Signaling-Server starten:
   ```bash
   npm run dev:server
   ```

   c) Beide Server gleichzeitig starten:
   ```bash
   npm run dev:all
   ```

3. **Konfiguration**

   - Frontend läuft auf: `http://localhost:3000`
   - Signaling-Server läuft auf: `ws://localhost:3001`

4. **Entwicklung**

   - Frontend-Code befindet sich im `src`-Verzeichnis
   - Signaling-Server-Code befindet sich im `server`-Verzeichnis

## Verwendung

1. Öffnen Sie die Anwendung in zwei verschiedenen Browserfenstern
2. Geben Sie in beiden den gleichen Raum-Code ein
3. Erlauben Sie den Zugriff auf Kamera und Mikrofon
4. Die WebRTC-Verbindung wird automatisch aufgebaut
