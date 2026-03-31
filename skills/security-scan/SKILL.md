---
name: security-scan
description: Run a multi-agent security analysis of the codebase. Usage: /security-scan [area or concern]
user-invocable: true
---

# Security Scan: $ARGUMENTS

Run a comprehensive security analysis using parallel agents.

## Launch 4 Explore Agents IN PARALLEL

### Agent 1: Authentication & Authorization
Scan for auth vulnerabilities:
- How are JWT tokens stored? (localStorage vs httpOnly cookies)
- Is token expiry checked before requests?
- Are there routes missing auth protection?
- Is role-based access control properly enforced?
- Are there privilege escalation paths?
- Is 2FA implementation secure?
- Check for hardcoded credentials or API keys

### Agent 2: Injection & XSS
Scan for injection vulnerabilities:
- Search for `dangerouslySetInnerHTML` usage — is input sanitized?
- Check for SQL/NoSQL injection in API calls
- Look for command injection in any server-side code
- Check URL parameter handling (open redirect, path traversal)
- Search for `eval()`, `new Function()`, or template literal injection
- Check for prototype pollution vectors
- Review all `innerHTML` assignments

### Agent 3: Data Exposure
Scan for data leaks:
- Are API responses over-fetching sensitive data?
- Is PII (emails, names, IDs) logged to console?
- Are error messages exposing internal details?
- Check `.env` files — are secrets properly managed?
- Are source maps disabled in production builds?
- Is sensitive data in localStorage/sessionStorage?
- Check for exposed API keys in frontend code

### Agent 4: Dependencies & Configuration
Scan infrastructure security:
- Run `npm audit` to check for known vulnerabilities
- Check for outdated packages with known CVEs
- Review CORS configuration
- Check Content-Security-Policy headers
- Review cookie security flags (Secure, HttpOnly, SameSite)
- Check for debug mode / verbose logging in production configs
- Review build configuration for security (source maps, minification)

## Synthesize Security Report

### Security Report Format

```
## Security Scan Report
**Date**: [today]
**Scope**: [what was scanned]
**Risk Level**: Critical / High / Medium / Low

## Critical Findings (fix immediately)
### Finding 1
- **Vulnerability**: [type, e.g., XSS, auth bypass]
- **Location**: [file:line]
- **Impact**: [what an attacker could do]
- **Fix**: [specific code change needed]
- **CVSS**: [score if applicable]

## High Findings (fix soon)
...

## Medium Findings (plan to fix)
...

## Low Findings (nice to fix)
...

## Dependency Vulnerabilities
| Package | Version | CVE | Severity | Fix Version |
|---------|---------|-----|----------|-------------|
| ...     | ...     | ... | ...      | ...         |

## Positive Security Practices Found
- [What the codebase does well]

## Recommendations
1. [Priority action]
2. [Priority action]
```

## Present to User

Show the full report and ask:
- Which findings to fix immediately?
- Should we create tickets for the rest?
- Any false positives to dismiss?
