# Contributing to EmailTrust

Thank you for your interest in contributing! This document outlines the process for reporting issues, suggesting features, and submitting code changes.

## How to Contribute

1. **Fork** the repository and create a new branch from `main`.
2. **Make your changes** with clear, descriptive commit messages.
3. **Test your changes** locally (backend + frontend).
4. **Submit a Pull Request** with a detailed description of what changed and why.

## Development Setup

See the main [README.md](README.md#running-locally) for setup instructions.

## Code Style

- **Backend**: Follow PEP 8. Keep route functions thin and place business logic in `services/`.
- **Frontend**: Use functional components and Tailwind utility classes consistently.
- Keep components small and focused; extract reusable UI into `components/ui/`.

## Reporting Bugs

Please open an issue and include:

- Steps to reproduce the bug
- Expected vs. actual behavior
- Your environment (OS, Python version, Node version, browser)
- Screenshots or logs if applicable

## Security Issues

Do **not** open a public issue for security vulnerabilities. Instead, see [SECURITY.md](SECURITY.md) for how to report them responsibly.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
