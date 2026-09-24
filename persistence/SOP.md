# CuratorMD operating procedure

## Before work

1. Check `persistence_status` for the absolute project root.
2. Recall relevant project knowledge before non-trivial changes.
3. Inspect repository state without collecting secrets or unrelated data.

## During work

- Keep changes bounded to the requested repository task.
- Validate dependency installation, syntax, runtime health, and functional probes where available.
- Capture only secret-redacted, verified observations.

## After work

1. Record verified decisions or lessons with explicit rationale.
2. Run `persistence_status` again.
3. Report changed knowledge files; do not commit automatically.
