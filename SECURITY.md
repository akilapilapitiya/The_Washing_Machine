# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.5.x   | Yes       |
| < 1.5   | No        |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report vulnerabilities by email: **akilapilapitiya4@gmail.com**

Please include:
- A description of the vulnerability
- Steps to reproduce the issue
- The potential impact or affected components
- Any suggested remediation if known

You will receive an acknowledgement within 48 hours. If the vulnerability is confirmed, a fix will be prioritised and you will be kept informed of progress.

## Scope

The following are in scope:

- Backend API (`/api/*`) — authentication, authorisation, input validation
- Frontend application — XSS, sensitive data exposure
- Infrastructure configuration — exposed ports, secrets management

## Out of Scope

- Attacks requiring physical access to the server
- Social engineering
- Issues in third-party dependencies (report these directly to the dependency maintainer)
