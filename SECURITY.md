# Security policy

## Supported versions

The public production site and the latest `1.2.x` release receive security
maintenance. Earlier releases remain available as historical snapshots but are
not actively patched.

| Version | Supported |
| --- | --- |
| 1.2.x | Yes |
| 1.1.x and earlier | No |

## Report a vulnerability privately

Do not open a public issue for a suspected vulnerability or include a secret,
access token, private user record, or exploit proof in a public discussion.

Use GitHub's
[private vulnerability reporting form](https://github.com/shanto12/sherlock-cold-ember/security/advisories/new).
Include the affected URL or commit, impact, reproducible steps, browser/runtime
details, and the smallest safe proof that demonstrates the issue.

The maintainer targets acknowledgement within three business days and an
initial severity/impact assessment within seven business days. Remediation and
coordinated disclosure timing depend on risk and deployment complexity.

## In scope

- Cross-site scripting, content injection, CSP or header bypass
- Accidental credential, private form record, or provider-data exposure
- Supply-chain or build-path compromise with production impact
- Unsafe media parsing or offline provider-response handling
- Form abuse that creates a confidentiality, integrity, or availability risk

Purely visual defects, historical/content disagreements, self-XSS requiring a
victim to paste code, and traffic-volume denial-of-service reports without a
specific application flaw should use the normal issue tracker instead.

## Disclosure

Please allow a reasonable remediation window before public disclosure. The
maintainer will credit a reporter in an advisory when requested and appropriate.
