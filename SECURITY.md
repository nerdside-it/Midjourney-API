# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

The Midjourney API team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

### How to Report a Security Vulnerability?

If you believe you have found a security vulnerability in our project, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: [security@yourdomain.com]

Please include the following information in your report:
- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### What to Expect

After you submit a report, we will:

1. **Acknowledge receipt** of your vulnerability report within 48 hours
2. **Confirm the problem** and determine the affected versions within 7 days
3. **Audit code** to find any potential similar problems
4. **Prepare fixes** for all releases still under support
5. **Release security patches** as soon as possible

## Security Considerations

### Environment Variables

- Never commit `.env` files containing real credentials
- Use strong, unique tokens for Discord integration
- Rotate tokens regularly
- Use environment-specific configurations

### API Security

- The API does not implement authentication by default
- Consider adding API key authentication for production use
- Implement rate limiting to prevent abuse
- Validate all input parameters
- Sanitize prompts to prevent injection attacks

### Discord Integration

- Use minimal Discord permissions required
- Secure your Discord bot token
- Monitor Discord API usage and rate limits
- Implement proper error handling for Discord failures

### Docker Security

- Images are built with non-root user
- Use official Node.js base images
- Keep dependencies updated
- Scan images for vulnerabilities

### Production Deployment

When deploying to production:

1. **Use HTTPS** for all API communications
2. **Implement authentication** (API keys, JWT, etc.)
3. **Add rate limiting** to prevent abuse
4. **Monitor logs** for suspicious activity
5. **Keep dependencies updated** regularly
6. **Use secrets management** for sensitive data
7. **Implement input validation** on all endpoints
8. **Add CORS policies** appropriately
9. **Use reverse proxy** (nginx, Apache) for additional security
10. **Regular security audits** and vulnerability scanning

### Recommended Security Headers

```javascript
// Add these headers in production
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

### Input Validation

```javascript
// Example input validation
const validatePrompt = (prompt) => {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Invalid prompt');
  }
  if (prompt.length > 1000) {
    throw new Error('Prompt too long');
  }
  // Sanitize for potential injections
  return prompt.trim();
};
```

## Vulnerability Disclosure Timeline

We request that you give us 90 days to address critical vulnerabilities before any public disclosure. For non-critical vulnerabilities, we ask for 30 days.

## Security Updates

Security updates will be announced through:
- GitHub Security Advisories
- Release notes in CHANGELOG.md
- Repository README updates

## Comments on This Policy

If you have suggestions on how this process could be improved, please submit a pull request.
