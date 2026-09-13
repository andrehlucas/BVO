# Content update runbook

Use this manual process for every published catalog or editorial update. It keeps facts, editorial judgment, commercial configuration, and publication approval separate.

## Before editing

1. Start from an up-to-date `main` and create a focused branch, for example `content/miami-price-check`.
2. Record the provider source URL, collection time, observed value, supporting excerpt, and confidence in the evidence record first. Do not replace a confirmed value with an empty or inferred value when a source is unavailable.
3. Update only the catalog facts and evidence that the source supports. Keep `not_confirmed` distinct from `not_available`; do not turn an add-on into an included feature.
4. If the update changes analysis or prose, edit the relevant assessment or article separately. Changes concerning business registration, registered agents, licensing, banking, Google Business Profile eligibility, or other sensitive address use require legal review before publication.

## Validate and inspect the change

1. Run `npm run validate:content`.
2. Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run test:e2e`.
3. Inspect `git diff -- content/catalog content/editorial content/methodology` for the factual prior/new values, evidence references, and editorial status.
4. Inspect the ranking impact in each affected city and track. Use the production build or local preview to compare the previous and new candidates, prices, limitations, evidence dates, and ranked positions. State the result in the pull request even when no position changed.
5. Preview every affected city, provider, guide, and trust page at desktop and mobile widths. Confirm the disclosure appears before outbound actions and no page exposes personal data.

## Review and publication

1. Open a pull request using the repository template. Include all source URLs, prior/new values, affected cities, ranking impact, confidence, disclosure impact, and command output.
2. Request human editorial review. Request legal review whenever the change affects disclosures, privacy language, or sensitive address-use claims.
3. Do not merge until the required `quality` check passes, all conversations are resolved, and the required human approval covers the latest push.
4. After approval, merge the pull request. Automation credentials must not bypass this process.
5. Verify the deployed commit is the approved `main` commit. Open the affected routes, confirm redirects use the intended public or affiliate destination, and check the Vercel deployment status.

## Rollback

If a published change is wrong, identify the approved commit that preceded it, create a revert branch with `git revert <bad-commit>`, rerun the full quality gate, and send the revert through the same human-review process. Do not force-push or edit production directly. After the revert deploys, verify the corrected routes and record the source of the correction.

## Repository and deployment owner actions

After the repository is pushed, its owner must configure `main` branch protection or a ruleset to require pull requests, one human approval, the `quality` check, resolved conversations, dismissal of stale approvals, and approval of the latest push by someone other than the pusher. Do not grant automation credentials a bypass. Do not add `CODEOWNERS` until the owner or editorial-team GitHub handle is known; these branch rules are still required without it.

In Vercel, set the environment values from `.env.example` for the appropriate environments. Enable Vercel Web Analytics page views in the project. Custom funnel events require a Vercel plan that supports custom events; if that plan is unavailable, keep the typed custom-event adapter disabled instead of sending data to an unreviewed provider.
