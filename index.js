import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import multer from 'multer';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { Midjourney } from 'midjourney';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Aggiunto per supportare array nei form

// Directory immagini
const imagesDir = path.join(__dirname, '.data', 'images');
const uploadsDir = path.join(__dirname, '.data', 'uploads');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurazione multer per upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `upload_${timestamp}_${Math.random().toString(36).substring(7)}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo immagini sono permesse'));
    }
  }
});

let mjClient = null;

// Inizializza Midjourney
async function initializeMidjourney() {
  if (mjClient) return mjClient;

  try {
    mjClient = new Midjourney({
      ServerId: process.env.SERVER_ID,
      ChannelId: process.env.CHANNEL_ID,
      SalaiToken: process.env.SALAI_TOKEN,
      Ws: true,
      SessionId: process.env.SALAI_TOKEN,
    });

    await mjClient.init();
    console.log('✅ Midjourney inizializzato!');
    return mjClient;
  } catch (error) {
    console.error('❌ Errore Midjourney:', error.message);
    throw error;
  }
}

// Health endpoint
app.get('/health', (req, res) => {
  console.log('📡 Health check richiesto');
  res.json({
    status: 'ok',
    message: 'Midjourney API funzionante',
    timestamp: new Date().toISOString(),
    midjourney: mjClient ? 'inizializzato' : 'non inizializzato'
  });
});

// Lista immagini
app.get('/images-list', (req, res) => {
  console.log('📡 Lista immagini richiesta');
  try {
    const images = fs.readdirSync(imagesDir).filter(file =>
      file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')
    );
    res.json({
      total: images.length,
      images: images.map(img => ({
        filename: img,
        url: `http://192.168.1.117:3147/images/${img}`
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pulisce il prompt rimuovendo solo caratteri di formattazione problematici
function cleanPrompt(prompt) {
  let cleaned = prompt
    // Rimuove caratteri di escape e formattazione
    .replace(/\\n/g, ' ')
    .replace(/\\t/g, ' ')
    .replace(/\\r/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/\r/g, ' ')
    // Rimuove caratteri JSON problematici
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\/g, '')
    // Rimuove virgolette triple o multiple
    .replace(/"""/g, '"')
    .replace(/'''/g, "'")
    // Pulisce spazi multipli
    .replace(/\s+/g, ' ')
    .trim();

  console.log('🧹 Prompt originale:', prompt.substring(0, 100) + '...');
  console.log('✨ Prompt pulito:', cleaned.substring(0, 100) + '...');

  return cleaned;
}

// Upload immagine a servizio pubblico (usando imgbb come esempio)
async function uploadImageToPublic(imagePath) {
  try {
    // Conversione in base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Upload a imgbb (servizio gratuito)
    const response = await axios.post('https://api.imgbb.com/1/upload', {
      key: process.env.IMGBB_API_KEY || '8c3b5a8c8b2e2f5e2c3b5a8c8b2e2f5e', // Key di esempio
      image: base64Image
    });

    if (response.data && response.data.data && response.data.data.url) {
      return response.data.data.url;
    }

    throw new Error('Upload fallito');
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    // Fallback: usa un servizio alternativo o URL locale
    return `http://192.168.1.117:3147/uploads/${path.basename(imagePath)}`;
  }
}

// Serve immagini statiche
app.use('/images', express.static(imagesDir));
app.use('/uploads', express.static(uploadsDir));

// Generate endpoint
app.post('/generate', async (req, res) => {
  console.log('� Generate richiesto:', req.body.prompt?.substring(0, 50) + '...');  let { prompt, images, image, speed, aspectRatio, stylize, chaos, weird, tile, version, styleWeight, upscaleIndex, upscaleMethod, image1, image2, image3, image4 } = req.body;

  // Handle multiple image formats
  let imageUrls = [];

  // Set defaults for upscale
  upscaleIndex = parseInt(upscaleIndex) || 1; // Default prima immagine
  if (upscaleIndex < 1 || upscaleIndex > 4) {
    upscaleIndex = 1;
  }

  upscaleMethod = upscaleMethod || 'creative'; // Default creative
  if (!['subtle', 'creative'].includes(upscaleMethod.toLowerCase())) {
    upscaleMethod = 'creative';
  }
  upscaleMethod = upscaleMethod.toLowerCase();

  console.log('🔍 Debug - Input ricevuto:');
  console.log(`  - prompt: ${prompt ? 'presente' : 'mancante'}`);
  console.log(`  - immagini totali: ${imageUrls.length}`);

  // Format 1: JSON array {"images": ["url1", "url2"]}
  if (images) {
    if (Array.isArray(images)) {
      imageUrls = [...imageUrls, ...images];
    } else if (typeof images === 'string') {
      imageUrls.push(images);
    }
  }

  // Format 2: Single image object {"image": {"": "url"}} or {"image": "url"}
  // GESTIONE SPECIALE N8N: se mandi più parametri image[] questi si accorpano in un oggetto
  if (image) {
    if (typeof image === 'string') {
      imageUrls.push(image);
    } else if (typeof image === 'object') {
      Object.entries(image).forEach(([key, url], index) => {
        if (url && typeof url === 'string' && url.trim()) {
          imageUrls.push(url.trim());
        }
      });
    }
  }

  // CERCA ANCHE EVENTUALI PARAMETRI images (array o oggetto)
  if (images) {
    if (Array.isArray(images)) {
      images.forEach((url, index) => {
        if (url && typeof url === 'string' && url.trim()) {
          imageUrls.push(url.trim());
        }
      });
    } else if (typeof images === 'object') {
      Object.entries(images).forEach(([key, url], index) => {
        if (url && typeof url === 'string' && url.trim()) {
          imageUrls.push(url.trim());
        }
      });
    }
  }

  // Format 3: URL-encoded format: image[]=url1&image[]=url2
  // GESTIONE AGGRESSIVA PER TUTTI I FORMATI POSSIBILI
  console.log('🔍 FORMAT 3 DEBUG - TUTTI I PARAMETRI:');
  console.log('  - Tutte le chiavi:', Object.keys(req.body));
  console.log('  - req.body completo:', req.body);

  // Cerca TUTTI i parametri che iniziano con "image"
  Object.keys(req.body).forEach(key => {
    console.log(`  - Chiave: "${key}", Valore:`, req.body[key], `(tipo: ${typeof req.body[key]})`);
  });

  if (req.body['image[]']) {
    console.log('🎯 TROVATO image[] -', typeof req.body['image[]']);

    if (Array.isArray(req.body['image[]'])) {
      // Array di immagini
      console.log(`  ✅ ARRAY: ${req.body['image[]'].length} immagini`);
      req.body['image[]'].forEach((url, index) => {
        if (url && typeof url === 'string' && url.trim()) {
          imageUrls.push(url.trim());
          console.log(`    📎 [${index}]: ${url}`);
        }
      });
    } else if (typeof req.body['image[]'] === 'string') {
      console.log(`  ⚠️ STRINGA SINGOLA: ${req.body['image[]']}`);
      if (req.body['image[]'].trim()) {
        imageUrls.push(req.body['image[]'].trim());
        console.log(`    � Aggiunta: ${req.body['image[]']}`);
      }
    }
  }

  // CERCA ANCHE VARIANTI COME image[0], image[1], etc.
  const imageArrayKeys = Object.keys(req.body).filter(key => /^image\[\d*\]$/.test(key));
  if (imageArrayKeys.length > 0) {
    console.log(`🎯 TROVATI parametri array: ${imageArrayKeys.join(', ')}`);
    imageArrayKeys.forEach(key => {
      if (req.body[key] && typeof req.body[key] === 'string' && req.body[key].trim()) {
        imageUrls.push(req.body[key].trim());
        console.log(`    📎 ${key}: ${req.body[key]}`);
      }
    });
  }

  console.log(`  📊 TOTALE URLs da Format 3: ${imageUrls.length}`);  // Format 4: n8n compatible format: image1, image2, image3, image4
  [image1, image2, image3, image4].forEach((img, index) => {
    if (img && typeof img === 'string' && img.trim()) {
      imageUrls.push(img.trim());
      console.log(`📎 n8n image${index + 1}:`, img.substring(0, 50) + '...');
    }
  });

  // Remove duplicates and limit to 4
  imageUrls = [...new Set(imageUrls)].slice(0, 4);

  console.log(`📸 Immagini rilevate: ${imageUrls.length}`);
  imageUrls.forEach((url, index) => {
    console.log(`  ${index + 1}. ${url.substring(0, 50)}...`);
  });

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt richiesto' });
  }

  try {
    const client = await initializeMidjourney();
    let cleanedPrompt = cleanPrompt(prompt);

    // Add image URLs to prompt if provided
    if (imageUrls.length > 0) {
      console.log('🔍 Debug imageUrls prima di join:');
      imageUrls.forEach((url, index) => {
        console.log(`  ${index + 1}. Tipo: ${typeof url}, Valore:`, url);
      });

      // Assicurati che siano tutte stringhe
      const cleanImageUrls = imageUrls.filter(url => typeof url === 'string' && url.trim());
      cleanedPrompt = cleanImageUrls.join(' ') + ' ' + cleanedPrompt;
      console.log(`🎨 Generando con ${cleanImageUrls.length} immagini`);
    }

    // Add Midjourney parameters
    const mjParams = [];
    if (aspectRatio) mjParams.push(`--ar ${aspectRatio}`);
    if (speed === 'fast') mjParams.push(`--fast`);
    if (speed === 'turbo') mjParams.push(`--turbo`);
    if (speed === 'relax') mjParams.push(`--relax`);
    if (stylize) mjParams.push(`--s ${stylize}`);
    if (chaos) mjParams.push(`--c ${chaos}`);
    if (weird) mjParams.push(`--weird ${weird}`);

    // Style Weight parameter (--sw tra 0 e 100)
    if (styleWeight !== undefined && styleWeight !== null) {
      const styleWeightValue = Math.max(0, Math.min(100, parseInt(styleWeight) || 0));
      mjParams.push(`--sw ${styleWeightValue}`);
      console.log(`⚖️ Style Weight applicato: ${styleWeightValue}`);
    }
    if (tile) mjParams.push(`--tile`);
    if (version) mjParams.push(`--v ${version}`);

    if (mjParams.length > 0) {
      cleanedPrompt += ' ' + mjParams.join(' ');
    }

    console.log(`🎨 Prompt finale: "${cleanedPrompt}"`);
    console.log('🎨 Generando con prompt pulito...');

    // Imagine con timeout
    const Image = await Promise.race([
      client.Imagine(cleanedPrompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout generazione immagine')), 120000)
      )
    ]);
    console.log('✅ Immagine base creata');

    // Upscale dell'immagine selezionata
    console.log(`� Preparando upscale immagine ${upscaleIndex} con metodo ${upscaleMethod}...`);

    // Trova le opzioni upscale disponibili (U1, U2, U3, U4)
    const upscaleOptions = Image.options
      .filter(o => /^U[1234]$/.test(o.label))
      .filter(o => !!o.custom);

    console.log('🔍 Debug - Opzioni upscale disponibili:');
    upscaleOptions.forEach(option => {
      console.log(`  - ${option.label}: ${option.custom}`);
    });
    console.log(`🎯 Cercando opzione: U${upscaleIndex}`);

    if (upscaleOptions.length === 0) {
      throw new Error('Nessuna opzione upscale disponibile');
    }

    // Seleziona l'opzione basata su upscaleIndex
    const selectedOption = upscaleOptions.find(o => o.label === `U${upscaleIndex}`);
    if (!selectedOption) {
      console.log('❌ Opzioni disponibili:', upscaleOptions.map(o => o.label).join(', '));
      throw new Error(`Opzione upscale U${upscaleIndex} non disponibile`);
    }

    console.log(`⬆️ Eseguendo upscale ${selectedOption.label} (${upscaleMethod})...`);
    console.log(`🔧 Custom ID: ${selectedOption.custom}`);

    // Esegui upscale
    let upscaledImage;
    if (upscaleMethod === 'creative') {
      // Upscale Creative (default)
      upscaledImage = await Promise.race([
        client.Custom({
          msgId: Image.id,
          flags: Image.flags,
          customId: selectedOption.custom,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout upscale creative')), 120000)
        )
      ]);
    } else {
      // Upscale Subtle - usa Vary(Subtle) se disponibile
      const varyOptions = Image.options
        .filter(o => o.label && o.label.includes('Vary'))
        .filter(o => !!o.custom);

      if (varyOptions.length > 0) {
        upscaledImage = await Promise.race([
          client.Custom({
            msgId: Image.id,
            flags: Image.flags,
            customId: varyOptions[0].custom,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout upscale subtle')), 120000)
          )
        ]);
      } else {
        // Fallback al metodo creative se subtle non disponibile
        console.log('⚠️ Upscale subtle non disponibile, usando creative...');
        upscaledImage = await Promise.race([
          client.Custom({
            msgId: Image.id,
            flags: Image.flags,
            customId: selectedOption.custom,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout upscale fallback')), 120000)
          )
        ]);
      }
    }

    console.log('✅ Upscale completato');

    // Download dell'immagine upscalata
    console.log('📥 Scaricando immagine upscalata...');
    const response = await axios.get(upscaledImage.uri, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    // Converte in base64
    const base64 = imageBuffer.toString('base64');
    console.log('✅ Immagine convertita in base64');

    res.json({
      success: true,
      messageId: Image.id,
      upscaleMessageId: upscaledImage.id,
      originalPrompt: prompt,
      cleanedPrompt: cleanedPrompt,
      status: 'completed',
      upscaleIndex: upscaleIndex,
      upscaleMethod: upscaleMethod,
      image: base64,
      midjourneyOriginalUri: Image.uri,
      midjourneyUpscaledUri: upscaledImage.uri
    });

  } catch (error) {
    console.error('❌ Errore generate:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      prompt: prompt
    });
  }
});

// Generate endpoint con immagini di riferimento
app.post('/generate-with-images', upload.array('images', 4), async (req, res) => {
  console.log('📡 Generate con immagini richiesto');
  console.log('📎 File ricevuti:', req.files?.length || 0);
  console.log('📝 Prompt ricevuto:', req.body.prompt?.substring(0, 100) + '...');

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt richiesto' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Almeno una immagine richiesta' });
  }

  try {
    // Pulisce il prompt
    const cleanedPrompt = cleanPrompt(prompt);
    console.log('✨ Prompt pulito:', cleanedPrompt);

    // Upload delle immagini a servizio pubblico
    console.log('📤 Uploading immagini...');
    const imageUrls = [];
    for (const file of req.files) {
      try {
        const publicUrl = await uploadImageToPublic(file.path);
        imageUrls.push(publicUrl);
        console.log('✅ Immagine uploadata:', publicUrl);
      } catch (error) {
        console.error('❌ Upload fallito per:', file.filename);
      }
    }

    if (imageUrls.length === 0) {
      throw new Error('Nessuna immagine uploadata con successo');
    }

    // Costruisce il prompt con immagini di riferimento
    const imageReferences = imageUrls.join(' ');
    const fullPrompt = `${imageReferences} ${cleanedPrompt}`;
    console.log('🎨 Prompt completo con immagini:', fullPrompt);

    const client = await initializeMidjourney();

    // Imagine con immagini di riferimento
    const Image = await Promise.race([
      client.Imagine(fullPrompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout generazione con immagini')), 180000)
      )
    ]);
    console.log('✅ Immagine con riferimenti creata');

    // Upscale
    const customIds = Image.options
      .filter(o => /^U[1234]$/.test(o.label))
      .filter(o => !!o.custom)
      .map(o => o.custom);

    if (customIds.length === 0) {
      throw new Error('Nessuna opzione upscale disponibile');
    }

    const CustomResponse = await Promise.race([
      client.Custom({
        msgId: Image.id,
        flags: Image.flags,
        customId: customIds[0],
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout upscale con immagini')), 180000)
      )
    ]);

    // Download immagine finale
    const filename = `with_images_${Date.now()}.jpg`;
    const filepath = path.join(imagesDir, filename);

    const response = await axios.get(CustomResponse.uri, { responseType: 'stream' });
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log('✅ Immagine con riferimenti salvata:', filename);

    // Cleanup: rimuove file temporanei
    req.files.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (error) {
        console.log('⚠️ Pulizia file temporaneo fallita:', file.filename);
      }
    });

    res.json({
      success: true,
      messageId: Image.id,
      originalPrompt: prompt,
      cleanedPrompt: cleanedPrompt,
      referenceImages: imageUrls,
      imagesUploaded: req.files.length,
      status: 'completed',
      localImagePath: `/images/${filename}`,
      localImageUrl: `http://192.168.1.117:3147/images/${filename}`,
      midjourneyUri: CustomResponse.uri
    });

  } catch (error) {
    console.error('❌ Errore generate con immagini:', error.message);

    // Cleanup in caso di errore
    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (e) { /* ignore */ }
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
      prompt: prompt,
      imagesReceived: req.files?.length || 0
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'midjourney-api',
    version: '1.0.0'
  });
});

// API Info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Midjourney API',
    version: '1.0.0',
    description: 'A powerful REST API wrapper for Midjourney Discord bot',
    endpoints: {
      generate: 'POST /generate',
      health: 'GET /health',
      images: 'GET /images/'
    },
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3147;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, async () => {
  console.log('🚀 SERVER AVVIATO');
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`🌐 Network: http://192.168.1.117:${PORT}`);
  console.log(`📸 Immagini: http://192.168.1.117:${PORT}/images/`);

  try {
    await initializeMidjourney();
  } catch (error) {
    console.error('❌ Inizializzazione fallita:', error.message);
  }
});
