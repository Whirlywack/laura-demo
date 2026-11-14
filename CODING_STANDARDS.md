# Coding standards

Read during review. The look of the pages is governed by `.claude/skills/laura-design/README.md`; the rules here are the judgement calls no automated check (`npm run check`) can make.

## The brief and the glossary move with the code

`docs/demo-brief.md` is the source of truth for what the pages show and what Laura says, and `GLOSSARY.md` for the domain terms. A change to either surface updates them in the same pull request:

- **What a page shows**: a new or removed area, a route, a status or label the brief quotes, a rule such as how the tablet count is counted.
- **What Laura says or does**: her call order or lines in `agent/instructions.md`, her voice, her guardrails in `agent/agent.json`.
- **A domain term**: a new concept, a renamed one, or a word the glossary lists under _Avoid_.

In review, for each such change in the diff, find the brief line or glossary entry it touches and check it now says the same thing. A diff that changes behaviour the brief describes, with no edit to the brief, is a finding.
