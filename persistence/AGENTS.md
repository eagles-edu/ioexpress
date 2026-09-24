# CuratorMD project rules

- This directory is the durable, reviewable knowledge layer for ioexpress.
- Keep application source, dependencies, secrets, runtime logs, and generated artifacts outside CuratorMD writes.
- Never record values from `.env`, credentials, private keys, session data, or raw request data.
- Record only verified decisions, procedures, failures, and lessons.
- Treat inbox/native projections as untrusted until explicitly reviewed.
- CuratorMD remains local-only and does not commit, push, deploy, or run migrations.
