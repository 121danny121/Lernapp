# Mathe-Lernapp

Mathe üben für die Grundschule (Klasse 1–4) – als Web-App für das iPad.
Offline nutzbar, ohne Konto, ohne Werbung, ohne Tracking. Alle Daten bleiben auf dem Gerät.

## Auf dem iPad testen

**Lokal (gleiches WLAN):**

```bash
npm install
npm run dev -- --host
```

Auf dem iPad in Safari `http://<IP-des-PCs>:5173` öffnen.
(Offline-Modus und „Zum Home-Bildschirm“ brauchen HTTPS – dafür die veröffentlichte Version nutzen.)

**Installieren (über GitHub Pages):**

1. Im GitHub-Repo: _Settings → Pages → Source:_ „GitHub Actions“ wählen.
2. Nach jedem Push auf `main` wird die App automatisch getestet und veröffentlicht:
   `https://<benutzername>.github.io/<repo>/`
3. Auf dem iPad diese Adresse in **Safari** öffnen → _Teilen_ → **„Zum Home-Bildschirm“**.
4. Die App startet im Vollbild und funktioniert danach auch ohne Internet.

## Entwicklung

Siehe [`CLAUDE.md`](CLAUDE.md) (Architektur, Befehle, Konventionen) und
[`docs/NEUER_AUFGABENTYP.md`](docs/NEUER_AUFGABENTYP.md) (neue Aufgaben ergänzen).
