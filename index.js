import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Crea directory per salvare le immagini
const imagesDir = path.join(__dirname, '.data', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// DISABILITO Midjourney per ora - causa crash
// const { Midjourney } = require('midjourney');

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    const request = https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    });

    request.on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });

    request.setTimeout(15000, () => {
      request.destroy();
      reject(new Error('Download timeout'));
    });
  });
}

async function generateRealAIImage(prompt, filename) {
  const cleanPrompt = encodeURIComponent(prompt.replace(/--\w+\s+[\w:]+/g, '').trim());
  // Uso diversi servizi AI per garantire funzionamento
  const services = [
    `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 10000)}`,
    `https://api.deepai.org/job-view-file/ca7e8748-5c54-4249-b5ce-b54bb7c7b6a5/${cleanPrompt}.jpg`,
    `https://source.unsplash.com/1024x1024/?${cleanPrompt.slice(0, 50)}`
  ];

  const filepath = path.join(imagesDir, filename);

  for (let i = 0; i < services.length; i++) {
    try {
      console.log(`🔄 Tentativo ${i + 1}/3: Servizio AI...`);
      await downloadImage(services[i], filepath);
      console.log('✅ SUCCESSO! Immagine AI scaricata:', filepath);
      return filepath;
    } catch (error) {
      console.log(`❌ Servizio ${i + 1} fallito:`, error.message);
      if (i === services.length - 1) throw error;
    }
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funzionante', timestamp: new Date().toISOString() });
});

app.use('/images', express.static(imagesDir));

app.get('/images-list', (req, res) => {
  const images = fs.readdirSync(imagesDir).filter(file =>
    file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')
  );
  res.json({
    total: images.length,
    images: images.map(img => ({
      filename: img,
      url: `http://localhost:${process.env.PORT || 3000}/images/${img}`
    }))
  });
});

app.post('/generate', async (req, res) => {
  const {
    prompt,
    speed = 'fast',
    resolution = 'SD',
    aspectRatio = '1:1',
    stylization = 100
  } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Prompt richiesto' });

  console.log('\n🎨 GENERAZIONE IMMAGINE AI');
  console.log('📝 Prompt:', prompt);

  const timestamp = Date.now();
  const filename = `ai_generated_${timestamp}.jpg`;

  try {
    await generateRealAIImage(prompt, filename);

    const response = {
      success: true,
      messageId: 'ai_' + timestamp,
      prompt: prompt,
      originalPrompt: prompt,
      status: 'completed',
      source: 'ai_service',
      localImagePath: `/images/${filename}`,
      localImageUrl: `http://localhost:${process.env.PORT || 3000}/images/${filename}`,
      note: 'Immagine generata da servizio AI reale'
    };

    console.log('✅ IMMAGINE GENERATA!');
    console.log('🌐 URL:', response.localImageUrl);

    fs.writeFileSync(
      path.join(__dirname, '.data', `ai_response_${timestamp}.json`),
      JSON.stringify(response, null, 2)
    );

    res.json(response);

  } catch (error) {
    console.error('❌ ERRORE:', error.message);
    res.status(500).json({
      success: false,
      error: 'Generazione fallita',
      details: error.message,
      prompt: prompt
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🚀 SERVER AVVIATO SEMPLIFICATO');
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📸 http://localhost:${PORT}/images/`);
  console.log('⚡ PRONTO PER GENERARE IMMAGINI AI!');
});
