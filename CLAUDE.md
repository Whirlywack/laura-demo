## Agent skills

### Issue tracker

Issues live in GitHub Issues for Whirlywack/laura-demo (via the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Design

The look of every page comes from the `laura-design` skill in `.claude/skills/laura-design/`. Load it before building or changing UI. It decides colours, type, spacing, motion and components; `docs/demo-brief.md` decides what the page shows.
