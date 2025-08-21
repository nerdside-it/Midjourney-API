# 🎨 Midjourney API

A powerful Node.js REST API wrapper for Midjourney Discord bot, enabling programmatic access to Midjourney's AI image generation capabilities.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![API Version](https://img.shields.io/badge/API-v1.0.0-orange.svg)]()

## ✨ Features

- 🚀 **Fast Generation**: Support for fast, relax, and turbo modes
- 🖼️ **Multiple Images**: Process unlimited reference images
- ⚡ **Auto Upscale**: Automatic upscaling with creative/subtle methods
- 🎛️ **Full Parameter Control**: All Midjourney parameters supported
- 📝 **Clean Prompts**: Automatic prompt cleaning and optimization
- 🔄 **Real-time Processing**: WebSocket integration for live updates
- 📊 **Comprehensive Logging**: Detailed request/response logging
- 🐳 **Production Ready**: PM2 ecosystem configuration included

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Discord account with Midjourney bot access
- Discord bot token (SALAI_TOKEN)

### Installation

```bash
git clone https://github.com/your-username/midjourney-api.git
cd midjourney-api
npm install
```

### Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Edit `.env` with your Discord credentials:
```env
SERVER_ID="your_discord_server_id"
CHANNEL_ID="your_discord_channel_id" 
SALAI_TOKEN="your_discord_bot_token"
PORT=3147
```

### Usage

```bash
# Development
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3147`

## 📡 API Documentation

### Generate Endpoint

**POST** `/generate`

Generate images with Midjourney AI using comprehensive parameter control.

#### Request Body

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prompt` | string | **required** | Text prompt for image generation |
| `speed` | string | `"fast"` | Generation speed: `"fast"`, `"relax"`, `"turbo"` |
| `aspectRatio` | string | `"1:1"` | Image ratio: `"1:1"`, `"3:2"`, `"16:9"`, `"3:4"`, etc. |
| `stylize` | number | `100` | Stylization level (0-1000) |
| `chaos` | number | `0` | Chaos/variety level (0-100) |
| `weird` | number | `0` | Weirdness level (0-3000) |
| `tile` | boolean | `false` | Generate tileable images |
| `version` | string | `"6"` | Midjourney model version |
| `upscaleIndex` | string | `"1"` | Which image to upscale (1-4) |
| `upscaleMethod` | string | `"creative"` | Upscale method: `"creative"`, `"subtle"` |
| `images` | array | `[]` | Array of reference image URLs |

#### Example Requests

**Basic Generation:**
```bash
curl -X POST http://localhost:3147/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a majestic dragon flying over mountains"
  }'
```

**Advanced Generation with Multiple Images:**
```bash
curl -X POST http://localhost:3147/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "futuristic cyberpunk city",
    "speed": "fast",
    "aspectRatio": "16:9", 
    "stylize": 200,
    "chaos": 25,
    "upscaleIndex": "2",
    "images": [
      "https://example.com/ref1.jpg",
      "https://example.com/ref2.jpg",
      "https://example.com/ref3.jpg"
    ]
  }'
```

#### Response Format

```json
{
  "success": true,
  "data": {
    "id": "job_id_here",
    "prompt": "processed_prompt_here",
    "imageUrl": "https://midjourney.com/generated-image.jpg",
    "upscaledImageUrl": "https://midjourney.com/upscaled-image.jpg",
    "upscaledBase64": "base64_encoded_image_data",
    "parameters": {
      "speed": "fast",
      "aspectRatio": "16:9",
      "stylize": 200
    },
    "processingTime": 45.2
  }
}
```

## 🔧 Advanced Configuration

### Multiple Image Formats

The API supports multiple ways to send reference images:

**JSON Array (Recommended):**
```json
{
  "prompt": "your prompt here",
  "images": ["url1", "url2", "url3", "url4"]
}
```

**Individual Parameters:**
```json
{
  "prompt": "your prompt here", 
  "image1": "url1",
  "image2": "url2", 
  "image3": "url3"
}
```

### Parameter Combinations

```json
{
  "prompt": "epic fantasy landscape",
  "speed": "turbo",
  "aspectRatio": "21:9",
  "stylize": 500,
  "chaos": 15,
  "weird": 100,
  "tile": true,
  "version": "6",
  "upscaleIndex": "3", 
  "upscaleMethod": "subtle",
  "images": [
    "https://example.com/mountain.jpg",
    "https://example.com/fantasy.jpg"
  ]
}
```

## 🐳 Deployment

### Using PM2

The project includes PM2 ecosystem configuration:

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 status
pm2 logs midjourney-api
```

### Docker Support

```bash
# Build image
docker build -t midjourney-api .

# Run container  
docker run -d \
  --name midjourney-api \
  -p 3147:3147 \
  --env-file .env \
  midjourney-api
```

## 📊 Monitoring & Logging

The API provides comprehensive logging:

- 🔍 **Request/Response Logging**: All API calls logged
- 📸 **Image Processing**: Detailed image handling logs  
- ⚡ **Performance Metrics**: Processing time tracking
- 🚨 **Error Handling**: Detailed error information
- 🎯 **Debug Mode**: Extensive debugging information

## 🛠️ Development

### Scripts

```bash
npm run dev          # Development with nodemon
npm start            # Production server
```

### Project Structure

```
midjourney-api/
├── index.js              # Main API server
├── package.json           # Dependencies & scripts  
├── .env.example          # Environment template
├── .gitignore            # Git ignore rules
├── ecosystem.config.js   # PM2 configuration
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose setup
├── LICENSE               # MIT License
├── CHANGELOG.md          # Version history
├── CONTRIBUTING.md       # Contribution guidelines
├── SECURITY.md           # Security policy
├── postman/              # Postman collection
│   ├── Midjourney_API.postman_collection.json
│   └── Midjourney_API.postman_environment.json
└── README.md             # This file
```

## 🔍 Testing

Import the Postman collection from the `postman/` directory for comprehensive API testing.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)  
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This project is an unofficial API wrapper for Midjourney. Make sure to comply with Midjourney's Terms of Service when using this tool.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/midjourney-api/issues) page
2. Create a new issue with detailed information
3. Provide logs and error messages

## 🙏 Acknowledgments

- [Midjourney](https://midjourney.com) for the amazing AI image generation
- [Node.js Midjourney Library](https://github.com/erictik/midjourney-api) for Discord integration
- Contributors and testers

---

**⭐ If this project helps you, please give it a star on GitHub!**
{
  "prompt": "portrait in this style",
  "referenceImages": ["https://example.com/style-reference.jpg"],
  "stylization": 150
}
```

### Risposta

```json
{
  "success": true,
  "messageId": "1234567890",
  "prompt": "a futuristic city with neon lights --aspect 16:9 --quality 2 --stylize 200 --weird 50 --chaos 25",
  "originalPrompt": "a futuristic city with neon lights",
  "parameters": {
    "speed": "fast",
    "resolution": "HD",
    "version": "7",
    "mode": "Standard",
    "aspectRatio": "16:9",
    "stylization": 200,
    "weirdness": 50,
    "variety": 25,
    "referenceImages": ["https://example.com/reference1.jpg"]
  },
  "status": "generating"
}
```

### Parametri Midjourney mappati

- `aspectRatio` → `--aspect`
- `version` → `--version`
- `stylization` → `--stylize`
- `weirdness` → `--weird`
- `variety` → `--chaos`
- `mode: "Raw"` → `--style raw`
- `resolution: "HD"` → `--quality 2`
- `speed: "relax"` → `--relax`
- `speed: "turbo"` → `--turbo`
- `referenceImages` → Aggiunge gli URL all'inizio del prompt
