# Security Policy

## Supported Versions

These versions are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 5.x     | :white_check_mark: |
| < 5.0   | :x:                |

## Reporting a Vulnerability

Please do **not** open a public issue or pull request for a vulnerability.

Report it privately via GitHub:
https://github.com/BiancoRoyal/node-red-contrib-modbus/security/advisories/new

We answer within 7 days and coordinate the fix, the release and the advisory with you.

## Releases

Every npm release is published by the GitHub Actions workflow `.github/workflows/build.yml`
with npm Trusted Publishing (OIDC) and carries a provenance attestation. You can verify an
installed version with `npm audit signatures`.
