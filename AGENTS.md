# Project instructions for Codex

This repository is the source of truth for the Florida Virtual Office Guide. Read this file before changing the project on any computer.

## Product scope

- The public product and copy are English-only for now. Portuguese may be added later, but is not part of the current release.
- The launch geography is Florida: Orlando, Tampa, Fort Lauderdale, Miami, and Boca Raton.
- The compared providers are Regus, Opus Virtual Offices, Alliance Virtual Offices, and Davinci Virtual.
- Comparisons must separate address and mail, live receptionist and phone, and full virtual office needs. Do not rank unlike services together.
- Treat `included`, `paid_add_on`, `usage_based`, and `not_confirmed` as distinct facts. Never infer missing prices or allowances.
- Affiliate configuration lives outside the ranking domain. Commercial relationships must never affect eligibility, scores, ordering, or editorial conclusions.
- Human approval is required before publishing factual, ranking, editorial, legal, or affiliate changes. The future n8n workflow may prepare a pull request, but may not approve, merge, or publish it.

## Product and visual direction

- Voice: consultative, direct, buyer-protective, and evidence-led. Avoid urgency, unsupported superlatives, invented testimonials, and savings promises.
- Visual system: corporate blue, white, and navy. Use Liquid Glass selectively for interactive surfaces, provider profiles, and methodology panels.
- The current homepage hero, comparison search, Miami map, and proof strip are approved. Preserve them unless the user explicitly requests a change.
- Reuse the versioned skills in `.agents/skills/` when their descriptions match the task. Do not assume machine-global skills exist on another computer.
- Maintain keyboard access, 44px minimum interactive targets, responsive reflow, visible focus, and no hover-only content.

## Sources of truth

- Product design: `docs/superpowers/specs/2026-08-19-virtual-office-comparison-platform-design.md`
- Implementation plan: `docs/superpowers/plans/2026-08-19-virtual-office-mvp-implementation.md`
- Catalog facts: `content/catalog/`
- Editorial content and publication status: `content/editorial/`
- Ranking methodology: `content/methodology/ranking-v1.json`
- Affiliate destinations: `config/affiliate-links.json`
- Content operations: `docs/operations/content-update-runbook.md`
- Release requirements: `docs/operations/release-checklist.md`
- Future automation boundary: `docs/n8n-comparison-automation-concept.md`

## Development workflow

1. Start from an up-to-date `main` and create a focused branch.
2. Make the smallest scoped change and preserve unrelated user work.
3. Run the full quality gate before requesting review.
4. Push the branch and use its Vercel Preview Deployment for human review.
5. Merge only approved changes. `main` is the Vercel production branch.
6. Never commit `.env*`, `.vercel/`, tokens, credentials, or private user data.

```bash
npm ci
npm run validate:content
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Use Node.js 20 or newer. GitHub is the durable development state; Vercel deployments are build artifacts and previews, not the source of truth.
