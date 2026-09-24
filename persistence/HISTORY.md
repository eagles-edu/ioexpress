# Project history

## 2026-09-25 - Repository re-established

- The repository was connected to `https://github.com/eagles-edu/ioexpress.git` on `main`.
- Dependency installation was reconciled with `npm ci` and `npm audit fix`.
- CuratorMD persistence was initialized under `persistence/`.
- Secrets, dependencies, runtime logs, and the archived deployment bundle are excluded from future Git tracking.

## 2026-09-25 — Verified repository recovery and dependency baseline

**Decision:** On 2026-09-25, the ioexpress repository was connected to the eagles-edu/ioexpress GitHub remote on main. npm ci completed successfully, npm audit --omit=dev reports zero vulnerabilities after npm audit fix, and all JavaScript files pass node --check. The Express process starts and answers HTTP requests on port 8910. Full Redis-backed session verification remains pending because the local environment points at Redis port 6380 while the available local Redis listener is on 6379.

**Rationale:** This records only secret-free, locally verified setup evidence and keeps the Redis environment mismatch explicit.

**Impact:** Future setup work should validate the local Redis endpoint before claiming session functionality is healthy.
