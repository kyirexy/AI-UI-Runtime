# Security Policy

## Supported version

The project currently supports the latest `main` branch state for security fixes.

## Reporting a vulnerability

Please do not open a public issue for security-sensitive problems.

Instead, report:

- affected area
- reproduction steps
- potential impact
- suggested mitigation if available

Until a dedicated private reporting address is added, open a GitHub issue with minimal public detail and clearly mark it as a security report request so maintainers can move it to a safer channel.

## Scope notes

Security-sensitive areas include:

- browser extension permissions
- content script injection behavior
- clipboard flows
- prompt/context leakage across pages
- any future agent or patching integrations
