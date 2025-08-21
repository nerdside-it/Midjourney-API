# Postman Collection - Midjourney API

Questa cartella contiene i file per testare l'API Midjourney con Postman.

## File inclusi

1. **Midjourney_API.postman_collection.json** - Collection completa con tutti gli endpoint
2. **Midjourney_API.postman_environment.json** - Environment con le variabili

## Come importare in Postman

### Opzione 1: Importa entrambi i file
1. Apri Postman
2. Clicca su "Import"
3. Trascina entrambi i file JSON nella finestra di import
4. Clicca "Import"

### Opzione 2: Importa manualmente
1. **Collection**: Import → File → Seleziona `Midjourney_API.postman_collection.json`
2. **Environment**: Manage Environments → Import → Seleziona `Midjourney_API.postman_environment.json`

## Configurazione

1. Seleziona l'environment "Midjourney API Environment" nel dropdown in alto a destra
2. Verifica che `base_url` sia impostato su `http://localhost:3147`
3. Assicurati che il server Node.js sia in esecuzione

## Richieste disponibili

### 1. **Generate Image - Basic**
Generazione base con solo il prompt

### 2. **Generate Image - Full Parameters**
Test completo con tutti i parametri disponibili:
- Speed: fast/relax/turbo
- Resolution: SD/HD
- Version: 7
- Mode: Standard/Raw
- Aspect Ratio: 16:9, 3:4, 1:1, etc.
- Stylization: 0-1000
- Weirdness: 0-3000
- Variety: 0-100
- Reference Images

### 3. **Generate Image - Portrait Mode**
Generazione di ritratti in formato verticale (3:4)

### 4. **Generate Image - Raw Mode + Turbo**
Test modalità Raw con velocità Turbo

### 5. **Generate Image - Landscape**
Paesaggi in formato widescreen (16:9)

### 6. **Generate Image - With Reference**
Generazione con immagini di riferimento per lo stile

### 7. **Generate Image - Relax Mode**
Generazione in modalità Relax (economica)

## Variabili Environment

- `base_url`: URL del server locale (http://localhost:3147)
- `server_url_prod`: URL di produzione (da configurare)

## Esempio di risposta

```json
{
  "success": true,
  "messageId": "1234567890",
  "prompt": "a futuristic city --aspect 16:9 --quality 2 --stylize 200",
  "originalPrompt": "a futuristic city",
  "parameters": {
    "speed": "fast",
    "resolution": "HD",
    "version": "7",
    "mode": "Standard",
    "aspectRatio": "16:9",
    "stylization": 200,
    "weirdness": 0,
    "variety": 0,
    "referenceImages": []
  },
  "status": "generating"
}
```
