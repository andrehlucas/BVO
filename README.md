# Virtual Office Comparison MVP

An English-language editorial comparison site for virtual-office offers in Orlando, Tampa, Fort Lauderdale, Miami, and Boca Raton, Florida. Rankings cover business address and mail, live receptionist and phone, and full virtual office needs. Catalog facts, evidence, and editorial assessments are versioned separately from affiliate-link configuration so commercial terms cannot affect rankings.

## Run locally

Requires Node.js 20 or newer.

```bash
npm ci
npx playwright install chromium
npm run dev
```

Copy `.env.example` to a local `.env` file and replace the placeholder public URLs before a non-local deployment. Never commit an environment file containing credentials.

## Quality gate

```bash
npm run validate:content
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

GitHub Actions runs these commands in the required `quality` check on pull requests and pushes to `main`, including a Chromium installation for Playwright. Repository protection is an owner action: configure `main` to require pull requests, one human approval, the `quality` check, resolved conversations, stale-approval dismissal, approval of the latest push by someone other than the pusher, and no automation bypass. Do not add `CODEOWNERS` until a real owner or editorial-team GitHub handle is available.

## Editorial and release operations

Follow the [content update runbook](docs/operations/content-update-runbook.md) for evidence-first updates, ranking-diff inspection, review, deployment verification, and Git-based rollback. The [release checklist](docs/operations/release-checklist.md) records the current launch state and approval requirements.

The current public launch contains five city routes, four reviewed provider reviews, and six reviewed guides. Two legal-sensitive guides are deliberately non-public drafts and cannot be published until legal review approves them; this is not an eight-guide public launch.

Set the three public environment values in Vercel from `.env.example`. Enable Vercel Web Analytics page views in the project. Custom funnel events require a Vercel plan supporting custom events; if that plan is not available, leave the typed custom-event adapter disabled rather than sending data to another provider.

## Future n8n phase

[The n8n comparison automation concept](docs/n8n-comparison-automation-concept.md) is documentation for a separate future implementation phase; no n8n workflow is implemented here. That future phase may automate collection, normalization, validation, and pull-request creation only. Human approval, merge, and publication remain outside n8n.
