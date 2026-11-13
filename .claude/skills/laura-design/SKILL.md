---
name: laura-design
description: Use this skill to design or build anything for Laura (the daily phone companion for elderly people and its dashboard for the family carer) — pages, components, prototypes or production UI. Contains the colours, type, spacing, copy rules, React components and two reference pages.
user-invocable: true
---

Read README.md in this folder first. It has the rules; the other files are the material.

- For a mock or prototype: copy `styles.css`, `tokens/`, `assets/` and the components you need into your output and build static HTML against them.
- For production code: use the tokens in `tokens/` and treat `components/core/*.jsx` as the reference implementation (each has a `.d.ts` with its props and a `.prompt.md` with usage).
- `ui_kits/dashboard` and `ui_kits/home` are the two finished pages. Match them.

If invoked with no other instruction, ask what the user wants to build, then design it following README.md.
