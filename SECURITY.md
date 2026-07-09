# Security Policy

We take the security of EmailTrust seriously. This document explains how to report security issues and lists important security practices for users and contributors.

## Supported Versions

Only the latest version of the main branch is actively supported with security updates.

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** open a public issue. Instead, email the maintainers at the address listed below and include:

- A clear description of the vulnerability
- Steps to reproduce it (if applicable)
- The potential impact
- Any suggested fix

**Security contact:** `rizubanerjee456@gmail.com`  

We will respond as soon as possible and work with you to resolve the issue responsibly.

## Security Best Practices

### Credentials

- **Never commit `.env` files or `serviceAccountKey.json`.** They are listed in `.gitignore`, but always double-check before pushing.
- Rotate Firebase service-account keys, Razorpay keys, and database credentials if you suspect they were exposed.
- Use Razorpay test keys during development and only switch to live keys in production.

### Firebase

- Restrict the Firebase web API key to your production domain in the Google Cloud Console.
- Verify Firebase ID tokens on the backend before trusting any user identity.

### Razorpay

- Keep the Razorpay key secret on the server only. Never expose it to the frontend or version control.
- Verify the payment signature using HMAC-SHA256 before upgrading a subscription.

### Database

- Use strong, unique passwords for your PostgreSQL database.
- Avoid exposing the database to the public internet; use private networks or IP allowlists where possible.

### Deployment

- Run the backend over HTTPS in production.
- Configure CORS in `backend/app/main.py` to allow only your production frontend domain.
- Add rate limiting, input validation, and security headers for production workloads.

## Acknowledgments

We appreciate responsible disclosure and will acknowledge researchers who report valid vulnerabilities.
