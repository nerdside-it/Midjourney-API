# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-21

### Added
- Initial release of Midjourney API
- REST API wrapper for Midjourney Discord bot
- Support for multiple image reference formats
- Automatic image upscaling with creative/subtle methods
- Full parameter control (speed, aspect ratio, stylize, chaos, weird, etc.)
- Comprehensive logging and debugging
- PM2 ecosystem configuration for production deployment
- Docker support with multi-stage builds
- Health check endpoints
- Postman collection for API testing
- Auto prompt cleaning and optimization
- Real-time WebSocket integration
- Base64 image encoding for upscaled results
- Multiple deployment options (PM2, Docker, manual)

### Features
- **Multi-Image Support**: Process unlimited reference images
- **Auto Upscaling**: Automatic upscaling with method selection
- **Parameter Control**: All Midjourney parameters supported
- **Production Ready**: PM2 and Docker configurations included
- **API Documentation**: Comprehensive OpenAPI documentation
- **Error Handling**: Robust error handling and logging
- **Performance**: Optimized for high-throughput image generation

### Supported Parameters
- `prompt` - Text prompt for image generation
- `speed` - Generation speed (fast, relax, turbo)
- `aspectRatio` - Image aspect ratio (1:1, 16:9, 3:4, etc.)
- `stylize` - Stylization level (0-1000)
- `chaos` - Chaos/variety level (0-100)
- `weird` - Weirdness level (0-3000)
- `tile` - Generate tileable images
- `version` - Midjourney model version
- `upscaleIndex` - Which image to upscale (1-4)
- `upscaleMethod` - Upscale method (creative, subtle)
- `images` - Array of reference image URLs

### Dependencies
- Node.js 18+
- Express.js 5.1.0
- Midjourney library 4.3.18
- Sharp for image processing
- Canvas for image manipulation
- Axios for HTTP requests
- Multer for file uploads
- Dotenv for environment configuration

### Deployment
- PM2 ecosystem configuration
- Docker containerization
- Docker Compose orchestration
- Health check endpoints
- Production-ready logging
- Auto-restart capabilities

## [Unreleased]

### Planned
- Rate limiting implementation
- Authentication middleware
- Image caching system
- Batch processing support
- WebHook notifications
- Advanced error recovery
- Metrics and monitoring
- Admin dashboard
- API key management
- Queue system for high load
