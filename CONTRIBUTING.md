# Contributing to Midjourney API

Thank you for your interest in contributing to the Midjourney API project! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Style Guidelines](#style-guidelines)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up the development environment
4. Create a new branch for your feature/fix
5. Make your changes
6. Test your changes
7. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm 8+
- Discord account with Midjourney access
- Git

### Installation

```bash
# Clone your fork
git clone https://github.com/your-username/midjourney-api.git
cd midjourney-api

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Discord credentials
# SERVER_ID, CHANNEL_ID, SALAI_TOKEN

# Start development server
npm run dev
```

### Development Environment

```bash
# Development with auto-reload
npm run dev

# Production mode
npm start

# Docker development
docker-compose up --build
```

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-batch-processing`
- `fix/upscale-error-handling`  
- `docs/update-api-examples`
- `refactor/cleanup-image-processing`

### Commit Messages

Follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(api): add batch processing endpoint`
- `fix(upscale): handle timeout errors gracefully`
- `docs(readme): update installation instructions`
- `refactor(server): simplify error handling`

### Code Changes

1. **API Endpoints**: Add new endpoints in `index.js`
2. **Image Processing**: Modify image handling logic
3. **Error Handling**: Improve error responses
4. **Documentation**: Update README.md and API docs
5. **Configuration**: Modify environment variables

## Testing

### Manual Testing

Use the included Postman collection:
```bash
# Import postman/Midjourney_API.postman_collection.json
# Test all endpoints with various parameters
```

### API Testing Examples

```bash
# Basic generation test
curl -X POST http://localhost:3147/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test image generation"}'

# Multi-image test
curl -X POST http://localhost:3147/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "futuristic city",
    "images": ["https://example.com/ref1.jpg", "https://example.com/ref2.jpg"]
  }'

# Health check
curl http://localhost:3147/health
```

### Docker Testing

```bash
# Test Docker build
docker build -t midjourney-api-test .

# Test Docker compose
docker-compose -f docker-compose.yml up --build
```

## Submitting Changes

### Pull Request Process

1. **Update Documentation**: Ensure README.md reflects any API changes
2. **Add Tests**: Include test cases for new features
3. **Update Changelog**: Add entry to CHANGELOG.md
4. **Check CI**: Ensure GitHub Actions pass
5. **Request Review**: Tag maintainers for review

### Pull Request Template

Use the provided PR template that includes:
- Description of changes
- Type of change (bug fix, feature, breaking change)
- Testing performed
- Checklist items

### Review Process

1. **Automated Checks**: CI/CD pipeline must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: Manual testing of API endpoints
4. **Documentation**: Verify docs are updated
5. **Merge**: Squash and merge after approval

## Style Guidelines

### JavaScript/Node.js

- Use ES6+ features and modules
- Follow existing code formatting
- Use meaningful variable names
- Add comments for complex logic
- Handle errors gracefully

```javascript
// Good
const processImages = async (imageUrls) => {
  try {
    const processedImages = await Promise.all(
      imageUrls.map(url => downloadAndProcess(url))
    );
    return processedImages;
  } catch (error) {
    console.error('Image processing failed:', error);
    throw new Error(`Failed to process images: ${error.message}`);
  }
};

// Bad
const proc = (imgs) => {
  // Process images somehow
  return imgs.map(i => process(i));
};
```

### API Design

- Use RESTful conventions
- Provide clear error messages
- Include request/response examples
- Validate input parameters
- Return consistent response formats

```javascript
// Good response format
{
  "success": true,
  "data": {
    "id": "job_123",
    "imageUrl": "https://...",
    "processingTime": 45.2
  },
  "meta": {
    "timestamp": "2025-08-21T10:30:00Z",
    "version": "1.0.0"
  }
}

// Error response format
{
  "success": false,
  "error": {
    "code": "INVALID_PROMPT",
    "message": "Prompt cannot be empty",
    "details": {
      "parameter": "prompt",
      "value": ""
    }
  }
}
```

### Documentation

- Update README.md for API changes
- Include code examples
- Document all parameters
- Provide curl examples
- Update Postman collection

## Community

### Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and community chat
- **Email**: For security issues or private matters

### Reporting Issues

When reporting issues, include:
- Node.js version
- Operating system
- API request details
- Error messages/logs
- Steps to reproduce

### Feature Requests

For new features, provide:
- Use case description
- Proposed API design
- Expected behavior
- Alternative solutions considered

## Release Process

1. **Version Bump**: Update version in package.json
2. **Changelog**: Update CHANGELOG.md
3. **Tag Release**: Create git tag
4. **Docker Image**: Build and push new image
5. **Documentation**: Update any version-specific docs

## Questions?

Feel free to reach out:
- Open an issue for questions
- Start a discussion for ideas
- Email maintainers for private matters

Thank you for contributing! 🎉
