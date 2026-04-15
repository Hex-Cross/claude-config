---
name: chaos-test
description: Chaos engineering tests — simulate network failures, service outages, slow responses, and resource exhaustion to verify application resilience
user-invocable: true
version: 1.0.0
---

# Chaos Engineering Tests

Test application resilience by simulating failure conditions.

---

## Phase 1: Architecture Analysis

1. Map the application's external dependencies: databases, APIs, caches, queues, CDNs.
2. Identify critical paths: user auth, payment processing, data saving.
3. Rank dependencies by blast radius (what breaks if this fails).

## Phase 2: Chaos Scenarios

Generate test scenarios per dependency:

### Network Chaos
- **Latency injection**: Add 2-5 second delays to external API calls
- **Timeout simulation**: External service returns after client timeout
- **Connection reset**: TCP connection drops mid-request
- **DNS failure**: Domain resolution fails

### Service Chaos
- **Database down**: Connection refused to DB
- **Cache miss storm**: Redis/cache unavailable, all requests hit DB
- **Third-party API 500**: External service returns server errors
- **Rate limiting**: API returns 429 Too Many Requests

### Resource Chaos
- **Memory pressure**: High memory allocation during request processing
- **CPU saturation**: Compute-heavy operations under load
- **Disk full**: Write operations fail due to full disk
- **Connection pool exhaustion**: All DB connections in use

## Phase 3: Test Generation

For each scenario, generate:
1. A test file that simulates the failure (using MSW for HTTP, mock for DB)
2. Expected behavior: graceful degradation, retry with backoff, circuit breaker, user-friendly error
3. Pass criteria: no crash, no data loss, error logged, user informed

## Phase 4: Execution

1. Run chaos tests in isolation (not against production).
2. Report: which scenarios passed, which crashed, which had data loss.
3. For failures: recommend specific resilience patterns (circuit breaker, retry, fallback).

## Phase 5: Resilience Report

```markdown
# Chaos Engineering Report

## Resilience Score: {X}/{total} scenarios handled

## Results
| Scenario | Result | Impact | Recovery Time | Recommendation |
|----------|--------|--------|--------------|----------------|

## Missing Patterns
- [ ] Circuit breaker for {service}
- [ ] Retry with backoff for {api}
- [ ] Graceful degradation for {feature}
```
